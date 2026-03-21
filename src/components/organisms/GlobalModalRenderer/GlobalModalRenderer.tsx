/**
 * GlobalModalRenderer Organism
 *
 * uiStore'daki activeModal durumuna göre doğru modal bileşenini render eder.
 * AppProviders içinde tek bir yerde kullanılır.
 */

import type { AchievementDefinition } from '@/types';
import type { NovaStage } from '@/types/user';
import { AchievementPopup } from '@components/organisms/AchievementPopup';
import { LevelUpModal } from '@components/organisms/LevelUpModal';
import { NovaEvolutionModal } from '@components/organisms/NovaEvolutionModal';
import { useUIStore } from '@stores/uiStore';

export function GlobalModalRenderer() {
  const activeModal = useUIStore((s) => s.activeModal);
  const modalData = useUIStore((s) => s.modalData);
  const closeModal = useUIStore((s) => s.closeModal);

  return (
    <>
      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={activeModal === 'levelUp'}
        level={(modalData?.level as number) ?? 1}
        rewards={{
          stars: (modalData?.rewards as { stars: number; gems: number })?.stars ?? 0,
          gems: (modalData?.rewards as { stars: number; gems: number })?.gems ?? 0,
        }}
        onClose={closeModal}
      />

      {/* Nova Evolution Modal */}
      <NovaEvolutionModal
        isOpen={activeModal === 'novaEvolution'}
        oldStage={(modalData?.oldStage as NovaStage) ?? 'egg'}
        newStage={(modalData?.newStage as NovaStage) ?? 'baby'}
        onClose={closeModal}
      />

      {/* Achievement Popup */}
      <AchievementPopup
        isOpen={activeModal === 'achievement'}
        achievement={(modalData?.achievement as AchievementDefinition) ?? null}
        onClose={closeModal}
      />
    </>
  );
}
