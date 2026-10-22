import type { AvatarId } from '@/config/avatars';

const palettes: Record<AvatarId, [string, string, string]> = {
  owl: ['#ede7ff', '#8070d6', '#514098'],
  fox: ['#fff0da', '#ee9856', '#bf6538'],
  panda: ['#e1f3ec', '#fffbef', '#384b60'],
  unicorn: ['#f9e5f3', '#fff9ee', '#d77fbd'],
  lion: ['#fff2ce', '#f8c569', '#b9693c'],
  rabbit: ['#f3eaff', '#fdf5ef', '#dc91b3'],
  cat: ['#dff3f1', '#79c5b7', '#428f88'],
  dog: ['#fcebdc', '#e9bd91', '#966345'],
  dragon: ['#e6f1df', '#91c870', '#4d8a58'],
  astronaut: ['#e2ecff', '#edf4ff', '#5d70b8'],
  robot: ['#dfeff9', '#8bc6df', '#467994'],
  star: ['#f3e9ff', '#ffd873', '#df9b3b'],
};

/** Original vector badges; the same artwork stays crisp from chat bubbles to profiles. */
export function AvatarArtwork({ id }: { id: AvatarId }) {
  const [background, fur, detail] = palettes[id];
  const eyes = (
    <g fill="#26334d">
      <ellipse cx="38" cy="49" rx="3.5" ry="5" />
      <ellipse cx="62" cy="49" rx="3.5" ry="5" />
      <g fill="white">
        <circle cx="39" cy="47" r="1.2" />
        <circle cx="63" cy="47" r="1.2" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="49" fill={background} />
      <circle cx="50" cy="46" r="39" fill="white" opacity=".32" />
      <ellipse cx="50" cy="84" rx="27" ry="4" fill={detail} opacity=".14" />
      <path d="m80 14 1.5 4.5L86 20l-4.5 1.5L80 26l-1.5-4.5L74 20l4.5-1.5Z" fill="white" />
      {id === 'owl' ? (
        <>
          <path d="M22 42 23 17 42 28Q50 24 58 28L77 17 78 42Q88 79 50 83 12 79 22 42" fill={fur} />
          <path d="M26 49Q20 81 50 80 80 81 74 49L58 56 50 48 42 56Z" fill={detail} opacity=".55" />
          <path d="M26 36Q36 28 50 40 64 28 74 36L73 56Q61 68 50 57 39 68 27 56Z" fill="#fff5df" />
          {eyes}
          <path d="m44 57 6-5 6 5-6 8Z" fill="#eaa94d" />
          <path
            d="m39 72 3 3 3-3m10 0 3 3 3-3"
            fill="none"
            stroke="#f1dcff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      ) : id === 'robot' ? (
        <>
          <path d="M50 17v10" stroke={detail} strokeWidth="4" />
          <circle cx="50" cy="15" r="5" fill="#f7b956" />
          <rect x="17" y="43" width="9" height="22" rx="4" fill={detail} />
          <rect x="74" y="43" width="9" height="22" rx="4" fill={detail} />
          <rect x="24" y="28" width="52" height="51" rx="16" fill={fur} />
          <rect x="30" y="37" width="40" height="25" rx="9" fill="#26334d" />
          <path d="M36 49h6m16 0h6" stroke="#b6f1dd" strokeWidth="5" strokeLinecap="round" />
          <path d="M43 69h14" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : id === 'astronaut' ? (
        <>
          <path d="M28 81v-7q22-12 44 0v7" fill={detail} />
          <circle cx="50" cy="48" r="31" fill={fur} stroke={detail} strokeWidth="3" />
          <rect x="25" y="30" width="50" height="40" rx="19" fill="#34456d" />
          <path
            d="M33 43q2-8 11-8"
            fill="none"
            stroke="#8bbfe1"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M36 51h7m14 0h7" stroke="#fff5df" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M45 60q5 4 10 0"
            fill="none"
            stroke="#fff5df"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="42" y="75" width="16" height="8" rx="3" fill="#eab961" />
        </>
      ) : id === 'star' ? (
        <>
          <path
            d="m50 16 12 21 24 5-16 19 2 24-22-10-22 10 2-24-16-19 24-5Z"
            fill={detail}
            transform="translate(0 3)"
          />
          <path d="m50 13 12 21 24 5-16 19 2 24-22-10-22 10 2-24-16-19 24-5Z" fill={fur} />
          {eyes}
          <path
            d="M43 61q7 7 14 0"
            fill="none"
            stroke="#8b563b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {id === 'lion' && <circle cx="50" cy="49" r="35" fill={detail} />}
          {id === 'rabbit' ? (
            <g fill={fur} stroke={detail} strokeWidth="5">
              <ellipse cx="35" cy="25" rx="8" ry="21" transform="rotate(-12 35 25)" />
              <ellipse cx="65" cy="25" rx="8" ry="21" transform="rotate(12 65 25)" />
            </g>
          ) : id === 'panda' ? (
            <g fill={detail}>
              <circle cx="28" cy="28" r="12" />
              <circle cx="72" cy="28" r="12" />
            </g>
          ) : id === 'dog' ? (
            <g fill={detail}>
              <ellipse cx="24" cy="48" rx="12" ry="24" transform="rotate(12 24 48)" />
              <ellipse cx="76" cy="48" rx="12" ry="24" transform="rotate(-12 76 48)" />
            </g>
          ) : id !== 'lion' ? (
            <g fill={fur} stroke={detail} strokeWidth="3" strokeLinejoin="round">
              <path d="m24 41-2-24 22 14" />
              <path d="m56 31 22-14-2 24" />
            </g>
          ) : null}
          <path d="M22 48Q22 24 50 26 78 24 78 48V57Q77 80 50 81 23 80 22 57Z" fill={fur} />
          {id === 'fox' && (
            <path d="M23 47q9 1 27 14 18-13 27-14v10q-2 21-27 23-25-2-27-23Z" fill="#fff5df" />
          )}
          {id === 'panda' && (
            <g fill={detail}>
              <ellipse cx="37" cy="48" rx="10" ry="13" transform="rotate(20 37 48)" />
              <ellipse cx="63" cy="48" rx="10" ry="13" transform="rotate(-20 63 48)" />
            </g>
          )}
          {id === 'unicorn' && (
            <>
              <path d="m43 29 7-23 7 23" fill="#f4c366" />
              <path d="M29 33q11-17 23-8l-9 15q-10-5-14-7" fill={detail} />
            </>
          )}
          {id === 'dragon' && (
            <>
              <path d="m28 29-3-14 15 12m20 0 15-12-3 14" fill="#f2c45f" />
              <path d="m43 28 7-11 7 11" fill={detail} />
            </>
          )}
          {id === 'panda' ? (
            <g fill="white">
              <ellipse cx="38" cy="49" rx="3" ry="5" />
              <ellipse cx="62" cy="49" rx="3" ry="5" />
            </g>
          ) : (
            eyes
          )}
          <ellipse cx="50" cy="65" rx="15" ry="10" fill="#fff6e6" opacity=".8" />
          <path d="M46 61q4-3 8 0l-4 5Z" fill={detail} />
          <path
            d="M44 69q6 5 12 0"
            fill="none"
            stroke={detail}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g fill="#eb989b" opacity=".55">
            <ellipse cx="30" cy="59" rx="4" ry="2.5" />
            <ellipse cx="70" cy="59" rx="4" ry="2.5" />
          </g>
          {id === 'cat' && (
            <path
              d="m20 60 10 2m-10 5 10-1m40-4 10-2m-10 6 10 1"
              stroke={detail}
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </>
      )}
    </svg>
  );
}
