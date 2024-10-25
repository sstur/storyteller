import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { AudioFile } from '~/types/AudioFile';

export const storiesTable = sqliteTable('stories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imagePrompt: text('image_prompt').notNull(),
  imageUrl: text('image_url'),
  content: text('content', { mode: 'json' }).$type<Array<string>>(),
  audio: text('audio', { mode: 'json' }).$type<AudioFile>(),
});

export type Story = typeof storiesTable.$inferSelect;
