# Plano de Expansão: SQL Noir (30 Casos Avançados)

## 📌 Fase 1: Refatoração da Arquitetura e UI Base
- [ ] Separar os dados (extracão de `cases` para arquivos em `src/data/` agrupados por dificuldade).
- [ ] Criar Menu de Seleção de Dificuldade (Fácil, Médio, Difícil).
- [ ] Construir o botão "Copiar Aba/Tabela" ao lado de cada card de tabela no "Esquema DB".
- [ ] Garantir que o terminal processe SQL irrestrito.

## 📌 Fase 2: Módulo "Detetive Iniciante" (Fácil)
- [x] Desenvolver 10 Casos de Nível Fácil.
- [x] Requisito: Mínimo de **3 Tabelas** por banco de dados.
- [x] Foco em: `JOIN` simples, `WHERE`, ordenação simples.

## 📌 Fase 3: Módulo "Investigador Pleno" (Médio)
- [x] Desenvolver 10 Casos de Nível Médio.
- [x] Requisito: Mínimo de **5 Tabelas** por banco de dados.
- [x] Foco em: Múltiplos `JOINs`, funções de agregação (`COUNT`, `SUM`), `GROUP BY`, lógicas conjuntas.

## 📌 Fase 4: Módulo "Detetive Chefe" (Difícil)
- [x] Desenvolver 10 Casos de Nível Difícil.
- [x] Requisito: Mínimo de **10 Tabelas** ou mais por banco (Sistemas de ERPs inteiros simulados).
- [x] Foco em: Subconsultas, múltiplas exclusões e distratores.

## 📌 Fase 5: Teste Real e QA
- [ ] Validação do botão de Cópia e layout responsivo perante esquemas gigantes.
