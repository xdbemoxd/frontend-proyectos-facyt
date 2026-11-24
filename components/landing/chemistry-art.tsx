type ArtProps = { className?: string };

const ORBITS = [0, 60, 120];

const NUCLEONS = [
  { cx: 180, cy: 180, r: 11, o: 0.9 },
  { cx: 165, cy: 166, r: 9, o: 0.55 },
  { cx: 195, cy: 166, r: 9, o: 0.55 },
  { cx: 165, cy: 195, r: 9, o: 0.55 },
  { cx: 195, cy: 195, r: 9, o: 0.55 },
  { cx: 180, cy: 157, r: 8, o: 0.4 },
  { cx: 180, cy: 203, r: 8, o: 0.4 },
  { cx: 157, cy: 180, r: 8, o: 0.4 },
  { cx: 203, cy: 180, r: 8, o: 0.4 },
];

export function AtomArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 360 360" fill="none" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="atom-core" cx="46%" cy="42%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      <circle cx="180" cy="180" r="168" stroke="currentColor" strokeOpacity="0.18" strokeDasharray="2 9" />

      <g className="origin-center [transform-box:fill-box] motion-safe:animate-[spin_110s_linear_infinite]">
        {ORBITS.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 180 180)`}>
            <ellipse cx="180" cy="180" rx="152" ry="58" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" />
            <ellipse cx="180" cy="180" rx="152" ry="58" stroke="currentColor" strokeOpacity="0.12" strokeWidth="5" />
            <circle cx="332" cy="180" r="7.5" fill="currentColor" fillOpacity="0.1" />
            <circle cx="332" cy="180" r="3.4" fill="currentColor" fillOpacity="0.85" />
            <circle cx="49" cy="208" r="2.4" fill="currentColor" fillOpacity="0.5" />
          </g>
        ))}
      </g>

      <g className="motion-safe:animate-[pulse_9s_ease-in-out_infinite]">
        {NUCLEONS.map(({ cx, cy, r, o }) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" fillOpacity={o} />
        ))}
        <circle cx="180" cy="180" r="11" fill="url(#atom-core)" />
      </g>
    </svg>
  );
}

const RING = [
  [190, 94],
  [273, 142],
  [273, 238],
  [190, 286],
  [107, 238],
  [107, 142],
];

const RING_INNER = [
  [190, 108],
  [260, 149],
  [260, 231],
  [190, 272],
  [120, 231],
  [120, 149],
];

const DOTS = [
  { cx: 56, cy: 120, r: 2.4, o: 0.5 },
  { cx: 322, cy: 214, r: 3, o: 0.4 },
  { cx: 298, cy: 310, r: 2, o: 0.5 },
  { cx: 130, cy: 46, r: 2.6, o: 0.35 },
  { cx: 350, cy: 62, r: 1.8, o: 0.45 },
  { cx: 26, cy: 236, r: 2, o: 0.4 },
];

export function MoleculeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 380 380" fill="none" aria-hidden="true" className={className}>
      <g
        stroke="currentColor"
        strokeLinecap="round"
      >
        <polygon
          points={RING.map(([x, y]) => `${x},${y}`).join(" ")}
          strokeOpacity="0.55"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        <line x1={RING_INNER[0][0]} y1={RING_INNER[0][1]} x2={RING_INNER[1][0]} y2={RING_INNER[1][1]} strokeOpacity="0.4" strokeWidth="1.1" />
        <line x1={RING_INNER[2][0]} y1={RING_INNER[2][1]} x2={RING_INNER[3][0]} y2={RING_INNER[3][1]} strokeOpacity="0.4" strokeWidth="1.1" />
        <line x1={RING_INNER[4][0]} y1={RING_INNER[4][1]} x2={RING_INNER[5][0]} y2={RING_INNER[5][1]} strokeOpacity="0.4" strokeWidth="1.1" />

        <line x1="273" y1="142" x2="308" y2="120" strokeOpacity="0.5" strokeWidth="1.3" />
        <line x1="277" y1="148" x2="311" y2="127" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="107" y1="238" x2="76" y2="260" strokeOpacity="0.5" strokeWidth="1.3" />
        <line x1="190" y1="286" x2="190" y2="316" strokeOpacity="0.5" strokeWidth="1.3" />
        <line x1="200" y1="337" x2="209" y2="344" strokeOpacity="0.4" strokeWidth="1.1" />

        <line x1="43" y1="309" x2="33" y2="322" strokeOpacity="0.4" strokeWidth="1.1" />
        <line x1="61" y1="309" x2="71" y2="322" strokeOpacity="0.4" strokeWidth="1.1" />

        {RING.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="currentColor" fillOpacity="0.55" stroke="none" />
        ))}
      </g>

      <g stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.3">
        <circle cx="320" cy="112" r="14" fill="none" />
        <circle cx="64" cy="268" r="14" fill="none" />
        <circle cx="190" cy="330" r="14" fill="none" />
        <circle cx="220" cy="352" r="9" fill="none" />
        <circle cx="52" cy="300" r="11" fill="none" />
        <circle cx="28" cy="330" r="8" fill="none" />
        <circle cx="76" cy="330" r="8" fill="none" />
      </g>

      <g fill="currentColor" fillOpacity="0.75" fontSize="11" fontWeight="600" textAnchor="middle" dominantBaseline="central">
        <text x="320" y="112">O</text>
        <text x="64" y="268">N</text>
        <text x="190" y="330">O</text>
        <text x="220" y="352" fontSize="9">H</text>
        <text x="52" y="300">O</text>
        <text x="28" y="330" fontSize="9">H</text>
        <text x="76" y="330" fontSize="9">H</text>
      </g>

      <g fill="currentColor">
        {DOTS.map(({ cx, cy, r, o }) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fillOpacity={o} />
        ))}
      </g>
    </svg>
  );
}
