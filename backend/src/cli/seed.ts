/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '~/db/db';

import type { Story } from '../db/schema';
import { storiesTable } from '../db/schema';

const stories: Array<Story> = [
  {
    id: '172956671548601234501',
    title: 'Cocoa and the Berry Bandits',
    description:
      'In the Choco Jungle, a clever cocoa bean named Cocoa eagerly awaits the annual chocolate festival, but when mischievous squirrels, known as the Berry Bandits, steal the berries needed for the treats, the celebration is in jeopardy. Determined to save the festival, Cocoa teams up with her brave friend Marsh, a soft-hearted marshmallow, and together they track down the bandits. Through kindness and clever negotiation, they convince the squirrels to share the berries, saving the festival and forming new friendships, as Cocoa discovers her own courage and creativity.',
    imagePrompt:
      'A vibrant, whimsical forest scene in a magical jungle filled with cocoa and berry plants. At the center, a cute, animated cocoa bean character with big, expressive eyes stands proudly. Surrounding her are colorful, friendly characters: a small, round marshmallow with a soft appearance, and a couple of plump, cheerful birds. The scene is set in a candy-filled landscape with large, shiny lollipops and candy pieces scattered on the ground. Above, colorful, juicy berries hang from the trees. The background is lush, with soft sunlight filtering through the trees, creating a warm and inviting atmosphere. The characters all have a playful and cheerful demeanor, representing the excitement and charm of a magical chocolate festival.',
    content: [
      'In the heart of the Choco Jungle, under the shade of the grandest cocoa tree, lived a clever cocoa bean named Cocoa. Her dear friends often told her that she shone like a polished nugget of joy, bringing warmth and laughter wherever she went. Every year, Cocoa and her friends eagerly awaited the grandest event of all: the annual chocolate festival, where tantalizing scents of chocolates wafted through the air, and every treat was topped generously with sweet, juicy berries.',
      'However, one sunny morning, as a light breeze rustled the jungle leaves, Cocoa overheard worried whispers among the jungle animals. "The Berry Bandits have struck again," said a frazzled toucan, shaking his colorful beak exasperatedly. These troublesome bandits had been snatching the juiciest berries from the bushes, disrupting preparations for the festival and leaving the festival\'s prospects looking forlorn. Cocoa knew she couldn\'t let anything ruin their cherished festival.',
      'Determined, Cocoa sought the guidance of the wise old coconut who lived atop the oldest tree in the heart of the jungle. "Dear Cocoa," the coconut resonated, "You have the wisdom and courage within you. Seek allies to aid you in solving this mystery, and do not hesitate to trust your own instincts." Encouraged by the wise advice, Cocoa\'s thoughts turned to Marsh, the marshmallow who was not only swaggering with a tough exterior but also had a heart as soft as his fluffy form.',
      'Cocoa, equipped with newfound confidence, promptly asked Marsh to accompany her on the quest. "Stick with me, Cocoa," Marsh said with a wink, puffing himself up with bravado. Together, they darted through the jungle, seeking out clues, their determination never wavering. Now, they just needed to find the elusive Berry Bandits and hatch a plan so cunning that it would make the bananas blush!',
      'Following the trail of discarded berry stems, Cocoa and Marsh soon arrived at a clearing beneath the canopy, where they found the bandits—a group of cheeky squirrels who had been hoarding the berries for themselves. Seizing the moment, Cocoa stepped forward, her small shadow growing taller in the afternoon sun. "We need these berries for the festival!" she exclaimed, her voice ringing with conviction. "Perhaps we can find a way to share." The squirrels paused from their feast and contemplated her plan intently.',
      "Impressed by Cocoa's boldness, the squirrels decided to negotiate. In exchange for helping gather more berries and an invitation to their jungle paradise festival, the Berry Bandits agreed to share their stash. With the incident resolved and new friendships blooming, the jungle was soon buzzing with excitement yet again. Cocoa had discovered her hidden potential, unlocking a rare spice of courage, kindness, and creativity that enriched not only the chocolate treats but also every heart at the grand chocolate festival.",
    ],
    imageUrl: 'https://cdn.storyteller.fm/172956671548601234501-cover.jpg',
    audioUrl: 'https://cdn.storyteller.fm/172956671548601234501-audio.mp3',
  },
];

async function main() {
  console.log('Inserting stories...');
  for (const story of stories) {
    await db.insert(storiesTable).values(story);
  }
  console.log(`Stories inserted: ${stories.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
