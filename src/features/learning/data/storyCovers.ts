import type { MicroStory } from './storyBank';

export interface StoryCover {
  src: string;
  /** Cell in a 3-column × 2-row atlas, in reading order; omitted for standalone art. */
  tile?: number;
}

function atlas(name: string, tile: number): StoryCover {
  return { src: `/story/covers-v1/${name}.webp`, tile };
}

/** Themed cover illustrations, separate from the story's instructional page media. */
export const STORY_THEME_COVERS: Record<string, StoryCover> = {
  animals: atlas('early-learning', 0),
  colors: atlas('early-learning', 2),
  numbers: atlas('early-learning', 3),
  body: atlas('early-learning', 4),
  food: atlas('early-learning', 5),
  home: atlas('everyday-life', 0),
  school: atlas('everyday-life', 1),
  clothes: atlas('everyday-life', 2),
  'nature-exploration': atlas('everyday-life', 3),
  toys: atlas('everyday-life', 4),
  'daily-routine': atlas('everyday-life', 5),
  family: atlas('friends', 0),
  greetings: atlas('friends', 1),
  'grammar-tobe': atlas('friends', 2),
  actions: atlas('friends', 3),
  adjectives: atlas('friends', 4),
  emotions: atlas('friends', 5),
  city: atlas('our-world', 0),
  transportation: atlas('our-world', 1),
  jobs: atlas('our-world', 2),
  helpers: atlas('our-world', 3),
  travel: atlas('our-world', 4),
  review: atlas('our-world', 5),
  science: atlas('discoveries', 0),
  technology: atlas('discoveries', 1),
  robots: atlas('discoveries', 2),
  space: atlas('discoveries', 3),
  adventure: atlas('discoveries', 4),
  time: atlas('discoveries', 5),
  nature: atlas('creative-world', 0),
  art: atlas('creative-world', 1),
  health: atlas('creative-world', 2),
  sports: atlas('creative-world', 3),
  weather: atlas('creative-world', 4),
};

const STORY_COVER_OVERRIDES: Record<string, StoryCover> = {
  'story-w1-ocean': atlas('early-learning', 1),
  'story-w3-rainy-day': atlas('creative-world', 4),
  'story-w3-forest-adventure': atlas('creative-world', 5),
};

export function getStoryWorldId(storyId: string): string {
  return /^story-(w\d+)-/.exec(storyId)?.[1] ?? 'w1';
}

export function getStoryCover(story: MicroStory): StoryCover {
  const firstPageImage = story.data.pages[0]?.imageUrl;
  // Keep the specially illustrated Nova story rather than replacing it with a theme cover.
  if (firstPageImage?.startsWith('/story/nova-v2/')) return { src: firstPageImage };
  return (
    STORY_COVER_OVERRIDES[story.id] ?? STORY_THEME_COVERS[story.theme] ?? atlas('our-world', 5)
  );
}
