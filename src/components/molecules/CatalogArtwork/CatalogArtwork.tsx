import { type ReactNode, useState } from 'react';

function imageSource(source?: string) {
  if (!source) return undefined;
  if (source.startsWith('/') && !source.startsWith('//')) return source;
  try {
    return new URL(source).protocol === 'https:' ? source : undefined;
  } catch {
    return undefined;
  }
}

/** A catalog may contain either an actual image URL or a legacy content emoji. */
export function CatalogArtwork({ source, fallback }: { source?: string; fallback: ReactNode }) {
  const src = imageSource(source);
  const [failedSource, setFailedSource] = useState<string>();
  if (src && src !== failedSource) {
    return (
      <img
        src={src}
        alt=""
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
        onError={() => {
          setFailedSource(src);
        }}
      />
    );
  }
  if (
    !src &&
    source &&
    /^[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Component}\s]+$/u.test(source)
  ) {
    return <span aria-hidden="true">{source}</span>;
  }
  return <>{fallback}</>;
}
