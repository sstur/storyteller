export type Story = {
  id: string;
  title: string;
  description: string;
  imagePrompt: string;
  imageUrlPromise?: Promise<string>;
  contentPromise?: Promise<Array<string>>;
  audioPromise?: Promise<Buffer>;
};
