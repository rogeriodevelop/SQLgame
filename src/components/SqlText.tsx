import type { ReactNode } from 'react';

const KEYWORDS = new Set(
  (
    'SELECT FROM WHERE JOIN LEFT INNER OUTER CROSS ON AND OR NOT IN IS NULL AS GROUP BY ORDER HAVING LIMIT ' +
    'DISTINCT LIKE BETWEEN COUNT SUM AVG MIN MAX ASC DESC UNION CASE WHEN THEN ELSE END EXISTS OFFSET'
  ).split(' ')
);

const TOKEN = /('(?:[^']|'')*'?)|(--[^\n]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d']+)/g;

/** SQL com realce de sintaxe, para exibir sobre papel (lições, diário). */
export function SqlText({ sql, className }: { sql: string; className?: string }) {
  const parts: ReactNode[] = [];
  let key = 0;

  for (const match of sql.matchAll(TOKEN)) {
    const [text, str, comment, num, word] = match;
    if (str) parts.push(<span key={key++} className="sql-string">{text}</span>);
    else if (comment) parts.push(<span key={key++} className="sql-comment">{text}</span>);
    else if (num) parts.push(<span key={key++} className="sql-number">{text}</span>);
    else if (word && KEYWORDS.has(word.toUpperCase())) parts.push(<span key={key++} className="sql-kw">{text}</span>);
    else parts.push(text);
  }

  return (
    <code
      className={className}
      style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
    >
      {parts}
    </code>
  );
}
