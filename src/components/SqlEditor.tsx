import { useEffect, useMemo, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, placeholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, completionKeymap, closeBrackets } from '@codemirror/autocomplete';
import { sql, SQLite } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Executa a consulta (Ctrl/Cmd+Enter). */
  onRun: () => void;
  /** Tabela -> colunas, para o autocomplete conhecer o banco do caso. */
  completionSchema: Record<string, string[]>;
};

/**
 * Editor SQL baseado em CodeMirror 6.
 *
 * Substitui o par textarea + overlay com realce por regex, que não tinha
 * autocomplete, exigia sincronizar scroll na mão e não funcionava bem em
 * toque. O autocomplete conhece as tabelas e colunas do caso atual — o maior
 * ganho de usabilidade num jogo cujo objetivo é justamente aprender o schema.
 */
export function SqlEditor({ value, onChange, onRun, completionSchema }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const view = useRef<EditorView | null>(null);
  // Guarda os callbacks em ref para não recriar o editor a cada render do pai.
  const handlers = useRef({ onChange, onRun });
  handlers.current = { onChange, onRun };

  const schemaCompartment = useMemo(() => new Compartment(), []);

  useEffect(() => {
    if (!host.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        closeBrackets(),
        highlightActiveLine(),
        autocompletion({ activateOnTyping: true }),
        schemaCompartment.of(sql({ dialect: SQLite, schema: completionSchema, upperCaseKeywords: true })),
        keymap.of([
          {
            key: 'Mod-Enter',
            preventDefault: true,
            run: () => {
              handlers.current.onRun();
              return true;
            },
          },
          ...completionKeymap,
          ...historyKeymap,
          ...defaultKeymap,
          indentWithTab,
        ]),
        oneDark,
        // Sobrepõe o oneDark (roxo/cinza) para casar com a paleta neon do jogo.
        EditorView.theme(
          {
            '&': { backgroundColor: 'transparent', color: '#dbf4fb' },
            '.cm-gutters': {
              backgroundColor: 'rgba(0,0,0,0.25)',
              color: '#456073',
              border: 'none',
              borderRight: '1px solid rgba(34,211,238,0.14)',
            },
            '.cm-activeLine': { backgroundColor: 'rgba(34,211,238,0.05)' },
            '.cm-activeLineGutter': { backgroundColor: 'rgba(34,211,238,0.08)', color: '#22d3ee' },
            '.cm-cursor': { borderLeftColor: '#22d3ee', borderLeftWidth: '2px' },
            '.cm-selectionBackground, ::selection': { backgroundColor: 'rgba(34,211,238,0.22) !important' },
            '.cm-tooltip-autocomplete': {
              backgroundColor: '#0a101b',
              border: '1px solid rgba(34,211,238,0.35)',
            },
            '.cm-tooltip-autocomplete ul li[aria-selected]': {
              backgroundColor: 'rgba(34,211,238,0.18)',
              color: '#22d3ee',
            },
          },
          { dark: true }
        ),
        // Palavras-chave em magenta, strings em lima, números em âmbar —
        // as mesmas três cores usadas fora do editor.
        syntaxHighlighting(
          HighlightStyle.define([
            { tag: tags.keyword, color: '#ff3d9a', fontWeight: 'bold' },
            { tag: [tags.string, tags.special(tags.string)], color: '#a3e635' },
            { tag: tags.number, color: '#fbbf24' },
            { tag: tags.comment, color: '#6b8299', fontStyle: 'italic' },
            { tag: [tags.operator, tags.punctuation], color: '#9fb3c8' },
            { tag: [tags.variableName, tags.propertyName], color: '#dbf4fb' },
            { tag: tags.typeName, color: '#22d3ee' },
          ]),
          { fallback: true }
        ),
        EditorView.lineWrapping,
        placeholder('-- Escreva SQL aqui. Ctrl+Espaço completa tabelas e colunas.\n-- Ctrl+Enter executa.'),
        EditorView.updateListener.of(update => {
          if (update.docChanged) handlers.current.onChange(update.state.doc.toString());
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': { fontFamily: "'JetBrains Mono', ui-monospace, monospace", lineHeight: '1.6' },
          '&.cm-focused': { outline: 'none' },
        }),
      ],
    });

    const editor = new EditorView({ state, parent: host.current });
    view.current = editor;

    return () => {
      editor.destroy();
      view.current = null;
    };
    // Montagem única: trocas de schema e de texto são tratadas nos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Troca de caso: recarrega a gramática com o schema novo, sem recriar o editor.
  useEffect(() => {
    view.current?.dispatch({
      effects: schemaCompartment.reconfigure(
        sql({ dialect: SQLite, schema: completionSchema, upperCaseKeywords: true })
      ),
    });
  }, [completionSchema, schemaCompartment]);

  // Sincroniza quando o texto muda por fora (ex.: botão "usar esta consulta").
  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current === value) return;
    editor.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  return <div ref={host} style={{ height: '100%', overflow: 'auto' }} />;
}
