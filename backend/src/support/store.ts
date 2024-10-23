export const store = {
  imageGenPromises: new Map<string, Promise<string>>(),
  contentGenPromises: new Map<string, Promise<Array<string>>>(),
  audioGenPromises: new Map<string, Promise<string>>(),
};
