import type { ReactNode, SVGProps } from "react";

type MotifProps = { className?: string };

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden="true" className={className ?? "h-full w-full"}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

function Hex({ cx, cy, r, ...props }: { cx: number; cy: number; r: number } & SVGProps<SVGPolygonElement>) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");

  return <polygon points={points} {...props} />;
}

function Node({ cx, cy, r = 3.2, opacity = 0.55 }: { cx: number; cy: number; r?: number; opacity?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="currentColor" fillOpacity={opacity} stroke="none" />;
}

const ORBIT_ANGLES = [0, 60, 120];
const LATTICE = [78, 120, 162];
const USER_NODES = [
  [120, 54],
  [178, 86],
  [178, 154],
  [120, 186],
  [62, 154],
  [62, 86],
];
const CHART_COLUMNS = [
  { x: 84, ys: [180, 158] },
  { x: 116, ys: [180, 154, 128] },
  { x: 148, ys: [180, 152, 124, 96] },
  { x: 180, ys: [180, 150, 120, 90, 60] },
];
const HELIX_RUNGS = [
  [80, 64, 160],
  [72, 92, 168],
  [82, 120, 158],
  [82, 152, 158],
  [72, 180, 168],
  [80, 206, 160],
];

export function OverviewMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <g className="origin-center [transform-box:fill-box] motion-safe:animate-[spin_120s_linear_infinite]">
        {ORBIT_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cx="120"
            cy="120"
            rx="94"
            ry="34"
            strokeOpacity="0.4"
            transform={`rotate(${angle} 120 120)`}
          />
        ))}
      </g>
      <Hex cx={120} cy={120} r={52} strokeOpacity="0.55" />
      <Hex cx={120} cy={120} r={38} strokeOpacity="0.22" />
      <circle cx="120" cy="120" r="10" fill="currentColor" fillOpacity="0.55" stroke="none" />
      <Node cx={214} cy={120} r={3} opacity={0.8} />
      <Node cx={62} cy={188} r={2.5} opacity={0.6} />
    </Frame>
  );
}

export function ProjectsMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <line x1="84" y1="122" x2="97" y2="113" strokeOpacity="0.4" />
      <line x1="143" y1="113" x2="156" y2="122" strokeOpacity="0.4" />
      <Hex cx={60} cy={136} r={28} strokeOpacity="0.55" />
      <Hex cx={60} cy={136} r={20} strokeOpacity="0.18" />
      <Hex cx={120} cy={104} r={28} strokeOpacity="0.55" />
      <Hex cx={120} cy={104} r={20} strokeOpacity="0.18" />
      <Hex cx={180} cy={136} r={28} strokeOpacity="0.55" />
      <Hex cx={180} cy={136} r={20} strokeOpacity="0.18" />
      <line x1="60" y1="108" x2="60" y2="88" strokeOpacity="0.45" />
      <Node cx={60} cy={84} r={4} />
      <line x1="180" y1="164" x2="180" y2="184" strokeOpacity="0.45" />
      <Node cx={180} cy={188} r={4} />
      <line x1="120" y1="76" x2="120" y2="58" strokeOpacity="0.45" />
      <Node cx={120} cy={54} r={3} />
      <Node cx={60} cy={136} r={2.6} opacity={0.3} />
      <Node cx={120} cy={104} r={2.6} opacity={0.3} />
      <Node cx={180} cy={136} r={2.6} opacity={0.3} />
    </Frame>
  );
}

export function PriorityMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <rect x="110" y="54" width="20" height="118" rx="10" strokeOpacity="0.55" />
      <circle cx="120" cy="190" r="19" strokeOpacity="0.55" />
      <rect x="115" y="126" width="10" height="46" rx="5" fill="currentColor" fillOpacity="0.22" stroke="none" />
      <circle cx="120" cy="190" r="12" fill="currentColor" fillOpacity="0.22" stroke="none" />
      <g strokeOpacity="0.4">
        <line x1="134" y1="78" x2="146" y2="78" />
        <line x1="134" y1="104" x2="146" y2="104" />
        <line x1="134" y1="130" x2="146" y2="130" />
        <line x1="134" y1="156" x2="146" y2="156" />
      </g>
      <circle cx="120" cy="68" r="2.4" fill="currentColor" fillOpacity="0.4" stroke="none" />
    </Frame>
  );
}

export function InventoryMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <path
        d="M104 54v42L80 168c-4 12 4 20 14 20h52c10 0 18-8 14-20L136 96V54"
        strokeOpacity="0.55"
      />
      <line x1="96" y1="54" x2="144" y2="54" strokeOpacity="0.55" />
      <path
        d="M88 156h64l10 30c2 7-3 12-10 12H88c-7 0-12-5-10-12Z"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="none"
      />
      <g strokeOpacity="0.4">
        <line x1="148" y1="142" x2="158" y2="142" />
        <line x1="146" y1="164" x2="158" y2="164" />
      </g>
      <g fill="currentColor" stroke="none" fillOpacity="0.5">
        <circle cx="108" cy="146" r="4" className="motion-safe:animate-[rise_5s_ease-in-out_infinite]" />
        <circle cx="128" cy="134" r="3" className="motion-safe:animate-[rise_5s_ease-in-out_infinite] [animation-delay:1.6s]" />
        <circle cx="118" cy="120" r="2.4" className="motion-safe:animate-[rise_5s_ease-in-out_infinite] [animation-delay:3s]" />
        <circle cx="138" cy="148" r="2.2" className="motion-safe:animate-[rise_5s_ease-in-out_infinite] [animation-delay:2.2s]" />
      </g>
    </Frame>
  );
}

export function DispatchMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <line x1="54" y1="216" x2="160" y2="216" strokeOpacity="0.55" />
      <line x1="66" y1="216" x2="66" y2="58" strokeOpacity="0.55" />
      <line x1="66" y1="96" x2="104" y2="96" strokeOpacity="0.45" />
      <rect x="104" y="58" width="16" height="112" rx="4" strokeOpacity="0.55" />
      <line x1="104" y1="148" x2="124" y2="148" strokeOpacity="0.5" />
      <circle cx="126" cy="148" r="4" strokeOpacity="0.5" />
      <line x1="112" y1="170" x2="112" y2="180" strokeOpacity="0.55" />
      <circle cx="112" cy="188" r="3" fill="currentColor" fillOpacity="0.55" stroke="none" />
      <path d="M102 178h20l10 26c2 6-2 10-8 10h-24c-6 0-10-4-8-10Z" strokeOpacity="0.5" />
      <path
        d="M98 202h28l6 12c1 4-2 6-6 6h-28c-4 0-7-2-6-6Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="none"
      />
      <line x1="112" y1="58" x2="112" y2="46" strokeOpacity="0.3" />
    </Frame>
  );
}

export function LotsMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <g strokeOpacity="0.2">
        {LATTICE.map((y) => (
          <line key={`h-${y}`} x1={LATTICE[0]} y1={y} x2={LATTICE[2]} y2={y} />
        ))}
        {LATTICE.map((x) => (
          <line key={`v-${x}`} x1={x} y1={LATTICE[0]} x2={x} y2={LATTICE[2]} />
        ))}
      </g>
      <g strokeOpacity="0.22">
        <line x1="78" y1="82" x2="96" y2="66" />
        <line x1="162" y1="82" x2="180" y2="66" />
        <line x1="78" y1="166" x2="96" y2="150" />
        <line x1="162" y1="166" x2="180" y2="150" />
        <line x1="96" y1="66" x2="180" y2="66" />
        <line x1="96" y1="150" x2="180" y2="150" />
      </g>
      {LATTICE.map((x) =>
        LATTICE.map((y) => (
          <Node key={`${x}-${y}`} cx={x} cy={y} r={4.4} opacity={0.42} />
        )),
      )}
      <Node cx={96} cy={66} r={2.6} opacity={0.28} />
      <Node cx={180} cy={66} r={2.6} opacity={0.28} />
      <Node cx={96} cy={150} r={2.6} opacity={0.28} />
      <Node cx={180} cy={150} r={2.6} opacity={0.28} />
    </Frame>
  );
}

export function VendorsMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <g strokeOpacity="0.32">
        <line x1="104" y1="98" x2="56" y2="78" />
        <line x1="136" y1="98" x2="184" y2="78" />
        <line x1="104" y1="142" x2="56" y2="162" />
        <line x1="136" y1="142" x2="184" y2="162" />
      </g>
      <Hex cx={120} cy={120} r={34} strokeOpacity="0.55" />
      <Hex cx={120} cy={120} r={23} strokeOpacity="0.18" />
      <Hex cx={44} cy={70} r={14} strokeOpacity="0.4" />
      <Hex cx={196} cy={70} r={14} strokeOpacity="0.4" />
      <Hex cx={44} cy={170} r={14} strokeOpacity="0.4" />
      <Hex cx={196} cy={170} r={14} strokeOpacity="0.4" />
      <Node cx={44} cy={70} r={3} opacity={0.4} />
      <Node cx={196} cy={70} r={3} opacity={0.4} />
      <Node cx={44} cy={170} r={3} opacity={0.4} />
      <Node cx={196} cy={170} r={3} opacity={0.4} />
      <Node cx={120} cy={120} r={3.4} opacity={0.35} />
    </Frame>
  );
}

export function EquipmentMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <path d="M86 210h68l-9-16H95Z" strokeOpacity="0.55" />
      <line x1="116" y1="194" x2="116" y2="148" strokeOpacity="0.55" />
      <line x1="124" y1="194" x2="124" y2="148" strokeOpacity="0.55" />
      <line x1="110" y1="148" x2="130" y2="148" strokeOpacity="0.55" />
      <circle cx="98" cy="204" r="4" strokeOpacity="0.5" />
      <g className="motion-safe:animate-[pulse_4s_ease-in-out_infinite]">
        <path
          d="M120 148c-17-19-9-43 0-62 9 19 17 43 0 62Z"
          strokeOpacity="0.55"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path d="M120 140c-8-12-4-25 0-35 4 10 8 23 0 35Z" fill="currentColor" fillOpacity="0.22" stroke="none" />
      </g>
    </Frame>
  );
}

export function ReservationsMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <line x1="84" y1="52" x2="156" y2="52" strokeOpacity="0.6" />
      <line x1="84" y1="208" x2="156" y2="208" strokeOpacity="0.6" />
      <line x1="84" y1="46" x2="84" y2="58" strokeOpacity="0.45" />
      <line x1="156" y1="46" x2="156" y2="58" strokeOpacity="0.45" />
      <line x1="84" y1="202" x2="84" y2="214" strokeOpacity="0.45" />
      <line x1="156" y1="202" x2="156" y2="214" strokeOpacity="0.45" />
      <path d="M92 56h56l-24 64 24 88H92l24-88Z" strokeOpacity="0.55" />
      <path d="M100 64h40l-18 46Z" fill="currentColor" fillOpacity="0.16" stroke="none" />
      <path d="M102 198c6-14 12-22 18-26 6 4 12 12 18 26Z" fill="currentColor" fillOpacity="0.16" stroke="none" />
      <g fill="currentColor" stroke="none" fillOpacity="0.5">
        <circle cx="120" cy="124" r="2.4" />
        <circle cx="120" cy="136" r="2" />
        <circle cx="120" cy="148" r="1.8" />
      </g>
    </Frame>
  );
}

export function ExpensesMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <line x1="88" y1="210" x2="152" y2="210" strokeOpacity="0.55" />
      <line x1="120" y1="210" x2="120" y2="118" strokeOpacity="0.55" />
      <line x1="72" y1="112" x2="168" y2="112" strokeOpacity="0.55" />
      <circle cx="120" cy="112" r="5" strokeOpacity="0.6" />
      <g strokeOpacity="0.45">
        <line x1="78" y1="112" x2="66" y2="136" />
        <line x1="78" y1="112" x2="90" y2="136" />
        <line x1="162" y1="112" x2="150" y2="136" />
        <line x1="162" y1="112" x2="174" y2="136" />
      </g>
      <path d="M58 136q20 16 40 0" strokeOpacity="0.55" />
      <path d="M142 136q20 16 40 0" strokeOpacity="0.55" />
      <Node cx={78} cy={132} r={4} />
      <Node cx={162} cy={132} r={4} />
      <Node cx={120} cy={104} r={2.6} opacity={0.35} />
    </Frame>
  );
}

export function OverheadMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <circle cx="84" cy="176" r="26" strokeOpacity="0.55" />
      <line x1="74" y1="156" x2="74" y2="132" strokeOpacity="0.55" />
      <line x1="94" y1="156" x2="94" y2="132" strokeOpacity="0.55" />
      <line x1="70" y1="132" x2="98" y2="132" strokeOpacity="0.5" />
      <line x1="74" y1="132" x2="74" y2="64" strokeOpacity="0.55" />
      <line x1="94" y1="132" x2="94" y2="64" strokeOpacity="0.55" />
      <line x1="74" y1="64" x2="94" y2="64" strokeOpacity="0.55" />
      <g strokeOpacity="0.35">
        <line x1="74" y1="116" x2="94" y2="116" />
        <line x1="74" y1="100" x2="94" y2="100" />
        <line x1="74" y1="84" x2="94" y2="84" />
      </g>
      <path d="M94 78h44v18" strokeOpacity="0.5" />
      <g fill="currentColor" stroke="none" fillOpacity="0.5">
        <circle cx="138" cy="104" r="2.4" />
        <circle cx="138" cy="114" r="2" />
      </g>
      <line x1="132" y1="126" x2="144" y2="126" strokeOpacity="0.5" />
      <path d="M130 126h16l6 20c1 5-2 8-7 8h-14c-5 0-8-3-7-8Z" strokeOpacity="0.5" />
      <path
        d="M128 148h20l4 10c1 3-1 5-4 5h-20c-3 0-5-2-4-5Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="none"
      />
      <path d="M70 208c4-6 8-6 12 0M86 208c4-6 8-6 12 0" strokeOpacity="0.35" />
    </Frame>
  );
}

export function UsersMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <circle cx="120" cy="120" r="78" strokeOpacity="0.18" strokeDasharray="2 7" />
      {USER_NODES.map(([x, y]) => (
        <line key={`b-${x}-${y}`} x1="120" y1="120" x2={x} y2={y} strokeOpacity="0.32" />
      ))}
      <circle cx="120" cy="120" r="20" strokeOpacity="0.3" />
      <circle cx="120" cy="120" r="11" fill="currentColor" fillOpacity="0.45" stroke="none" />
      {USER_NODES.map(([x, y]) => (
        <Node key={`u-${x}-${y}`} cx={x} cy={y} r={6} opacity={0.42} />
      ))}
    </Frame>
  );
}

export function AuditMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <path d="M98 42c-34 30-34 60 0 90s34 60 0 90" strokeOpacity="0.5" />
      <path d="M142 42c34 30 34 60 0 90s-34 60 0 90" strokeOpacity="0.5" />
      <g strokeOpacity="0.28">
        {HELIX_RUNGS.map(([x1, y, x2]) => (
          <line key={y} x1={x1} y1={y} x2={x2} y2={y} />
        ))}
      </g>
      <g fill="currentColor" stroke="none" fillOpacity="0.45">
        {HELIX_RUNGS.map(([x1, y, x2]) => (
          <g key={`n-${y}`}>
            <circle cx={x1} cy={y} r="3" />
            <circle cx={x2} cy={y} r="3" />
          </g>
        ))}
      </g>
    </Frame>
  );
}

export function ReportsMotif({ className }: MotifProps) {
  return (
    <Frame className={className}>
      <line x1="60" y1="200" x2="200" y2="200" strokeOpacity="0.5" />
      <line x1="60" y1="200" x2="60" y2="56" strokeOpacity="0.5" />
      {CHART_COLUMNS.map(({ x, ys }) => (
        <g key={x}>
          <line x1={x} y1={ys[0]} x2={x} y2={ys[ys.length - 1]} strokeOpacity="0.32" />
          {ys.map((y) => (
            <Node key={`${x}-${y}`} cx={x} cy={y} r={4.2} opacity={0.42} />
          ))}
        </g>
      ))}
      <path d="M84 158 116 128 148 96 180 60" strokeOpacity="0.28" strokeDasharray="3 6" />
    </Frame>
  );
}
