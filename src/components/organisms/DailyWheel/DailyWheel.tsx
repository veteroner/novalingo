/**
 * DailyWheel Organism
 *
 * Günlük çark çevirme mini oyunu.
 * Fizik bazlı dönüş animasyonu, ödül popup'ı.
 */

import { useState, useRef, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { clsx } from 'clsx';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import type { WheelSlice } from '@/types';

interface DailyWheelProps {
  slices: WheelSlice[];
  canSpin: boolean;
  onSpin: () => Promise<{ sliceIndex: number; reward: { type: string; amount: number } }>;
  className?: string;
}

const SLICE_COLORS = [
  '#4ECDC4', // teal
  '#FF6B6B', // coral
  '#45B7D1', // sky
  '#FFA07A', // salmon
  '#98D8C8', // mint
  '#F7DC6F', // gold
  '#BB8FCE', // lavender
  '#85C1E9', // light blue
];

export function DailyWheel({ slices, canSpin, onSpin, className }: DailyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ type: string; amount: number } | null>(null);
  const controls = useAnimationControls();
  const currentRotation = useRef(0);

  const handleSpin = useCallback(async () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    setResult(null);

    try {
      const { sliceIndex, reward } = await onSpin();

      // Calculate target angle: 5 full spins + land on slice
      const sliceAngle = 360 / slices.length;
      const targetAngle = sliceAngle * sliceIndex + sliceAngle / 2;
      const totalRotation = currentRotation.current + 360 * 5 + (360 - targetAngle);

      await controls.start({
        rotate: totalRotation,
        transition: {
          duration: 4,
          ease: [0.2, 0.8, 0.3, 1], // custom easing — slow down at end
        },
      });

      currentRotation.current = totalRotation;
      setResult(reward);
    } catch {
      // Reset on error
    } finally {
      setIsSpinning(false);
    }
  }, [isSpinning, canSpin, onSpin, slices.length, controls]);

  const sliceAngle = 360 / slices.length;

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      {/* Pointer */}
      <div className="relative mb-2 z-10">
        <div className="w-0 h-0 border-l-12 border-r-12 border-t-20 border-l-transparent border-r-transparent border-t-nova-orange drop-shadow-md" />
      </div>

      {/* Wheel */}
      <div className="relative">
        <motion.div
          className="h-64 w-64 rounded-full border-4 border-white shadow-2xl overflow-hidden"
          animate={controls}
          style={{ rotate: currentRotation.current }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {slices.map((slice, i) => {
              const startAngle = i * sliceAngle;
              const endAngle = startAngle + sliceAngle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 100 + 100 * Math.cos(startRad);
              const y1 = 100 + 100 * Math.sin(startRad);
              const x2 = 100 + 100 * Math.cos(endRad);
              const y2 = 100 + 100 * Math.sin(endRad);

              const largeArc = sliceAngle > 180 ? 1 : 0;

              // Label position — middle of slice arc, at 65% radius
              const midRad = ((startAngle + sliceAngle / 2) * Math.PI) / 180;
              const labelX = 100 + 60 * Math.cos(midRad);
              const labelY = 100 + 60 * Math.sin(midRad);
              const labelRotation = startAngle + sliceAngle / 2;

              return (
                <g key={i}>
                  <path
                    d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                    stroke="white"
                    strokeWidth="1"
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${labelRotation}, ${labelX}, ${labelY})`}
                    className="text-[8px] font-bold fill-white"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {slice.label}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx="100" cy="100" r="15" fill="white" stroke="#e5e7eb" strokeWidth="2" />
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px]"
            >
              🦉
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Text variant="h4" className="text-success">
            🎉 +{result.amount} {result.type === 'xp' ? 'XP' : result.type === 'stars' ? '⭐' : '💎'}
          </Text>
        </motion.div>
      )}

      {/* Spin Button */}
      <Button
        variant="secondary"
        size="lg"
        className="mt-4"
        onClick={handleSpin}
        isLoading={isSpinning}
        disabled={!canSpin}
      >
        {canSpin ? '🎰 Çevir!' : 'Yarın Tekrar Gel!'}
      </Button>
    </div>
  );
}
