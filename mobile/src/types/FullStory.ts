type ContentBlock =
  | { type: 'image'; src: string }
  | { type: 'paragraph'; text: string };

export type FullStory = {
  id: string;
  title: string;
  content: Array<ContentBlock>;
};
