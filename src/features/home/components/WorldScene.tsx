import { clsx } from 'clsx';
import { useState } from 'react';
import { getWorldScene } from './worldScenes';

/** A decorative layer: failed/missing artwork never blocks the learning path. */
export function WorldScene({ worldId, className }: { worldId: string; className?: string }) {
  const source = getWorldScene(worldId);
  return (
    <span aria-hidden="true" className={clsx('world-scene', className)}>
      {source && <SceneImage key={source} source={source} />}
    </span>
  );
}

function SceneImage({ source }: { source: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={source}
      alt=""
      width={1200}
      height={800}
      decoding="async"
      fetchPriority="high"
      className="h-full w-full object-cover object-center"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
