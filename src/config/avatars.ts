/** Stable profile IDs: shared by setup, profile, leaderboard and conversation. */
export const AVATAR_IDS = [
  'owl',
  'fox',
  'panda',
  'unicorn',
  'lion',
  'rabbit',
  'cat',
  'dog',
  'dragon',
  'astronaut',
  'robot',
  'star',
] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

/** Includes legacy defaults and unknown IDs without requesting a broken image URL. */
export function resolveAvatarId(value?: string | null): AvatarId {
  return AVATAR_IDS.find((id) => id === value) ?? 'owl';
}
