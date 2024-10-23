export type ContentBlock =
  | { type: 'image'; src: string }
  | { type: 'paragraph'; text: string };
