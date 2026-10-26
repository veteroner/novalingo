/** Local, original environment artwork. Load only the currently visited world. */
export const WORLD_SCENES: Readonly<Record<string, string>> = {
  w1: '/scenes/worlds-v1/w1.webp',
  w2: '/scenes/worlds-v1/w2.webp',
  w3: '/scenes/worlds-v1/w3.webp',
  w4: '/scenes/worlds-v1/w4.webp',
  w5: '/scenes/worlds-v1/w5.webp',
  w6: '/scenes/worlds-v1/w6.webp',
  w7: '/scenes/worlds-v1/w7.webp',
  w8: '/scenes/worlds-v1/w8.webp',
  w9: '/scenes/worlds-v1/w9.webp',
  w10: '/scenes/worlds-v1/w10.webp',
  w11: '/scenes/worlds-v1/w11.webp',
  w12: '/scenes/worlds-v1/w12.webp',
};

export function getWorldScene(worldId: string): string | undefined {
  return Object.hasOwn(WORLD_SCENES, worldId) ? WORLD_SCENES[worldId] : undefined;
}
