import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const storiesTable = sqliteTable('stories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imagePrompt: text('image_prompt').notNull(),
  imageUrl: text('image_url'),
  audioUrl: text('audio_url'),
  content: text('content', { mode: 'json' }).$type<Array<string>>(),
});

export type Story = typeof storiesTable.$inferSelect;
