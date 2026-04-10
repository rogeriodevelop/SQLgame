export type Case = {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  description: string;
  objective: string;
  schema: string;
  solution: string;
  hint?: string;
};

export type QueryResult = {
  columns: string[];
  values: any[][];
};
