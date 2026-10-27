import { AVATAR_IDS } from '@/config/avatars';
import { AvatarArtwork } from '@components/atoms/Avatar/AvatarArtwork';
import {
  BirdIcon,
  CoatHangerIcon,
  ConfettiIcon,
  CrownIcon,
  FeatherIcon,
  FrameCornersIcon,
  GiftIcon,
  HeartIcon,
  LightningIcon,
  LightbulbIcon,
  MagicWandIcon,
  PaletteIcon,
  RainbowIcon,
  RocketIcon,
  ShieldIcon,
  ShootingStarIcon,
  SparkleIcon,
  StarIcon,
  SunglassesIcon,
  TreeIcon,
  WavesIcon,
} from '@phosphor-icons/react';
import { CatalogArtwork } from '@components/molecules/CatalogArtwork/CatalogArtwork';

const itemIcons: Record<string, typeof GiftIcon | undefined> = {
  theme_ocean: WavesIcon,
  theme_space: RocketIcon,
  theme_forest: TreeIcon,
  theme_candy: RainbowIcon,
  boost_2x_xp: LightningIcon,
  boost_streak_freeze: ShieldIcon,
  boost_hint_pack: LightbulbIcon,
  boost_star_doubler: StarIcon,
  frame_gold: FrameCornersIcon,
  frame_rainbow: RainbowIcon,
  frame_star: StarIcon,
  frame_crown: CrownIcon,
  effect_sparkle: SparkleIcon,
  effect_confetti: ConfettiIcon,
  effect_fireworks: ShootingStarIcon,
  effect_hearts: HeartIcon,
  nova_hat_wizard: MagicWandIcon,
  nova_hat_crown: CrownIcon,
  nova_cape_red: CoatHangerIcon,
  nova_glasses: SunglassesIcon,
  nova_wings: FeatherIcon,
  nova_scarf: CoatHangerIcon,
};
const categoryIcons: Record<string, typeof GiftIcon | undefined> = {
  avatars: BirdIcon,
  themes: PaletteIcon,
  boosters: LightningIcon,
  frames: FrameCornersIcon,
  effects: SparkleIcon,
  nova: BirdIcon,
};

export function ShopArtwork({
  id,
  category,
  source,
}: {
  id: string;
  category: string;
  source?: string;
}) {
  const avatar = AVATAR_IDS.find((value) => `avatar_${value}` === id);
  const Icon =
    (Object.hasOwn(itemIcons, id) ? itemIcons[id] : undefined) ??
    (Object.hasOwn(categoryIcons, category) ? categoryIcons[category] : undefined) ??
    GiftIcon;
  return (
    <span
      className="text-primary inline-flex h-full w-full items-center justify-center"
      aria-hidden="true"
    >
      <CatalogArtwork
        source={source}
        fallback={avatar ? <AvatarArtwork id={avatar} /> : <Icon size={48} weight="duotone" />}
      />
    </span>
  );
}
