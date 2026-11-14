import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Link } from 'wouter';
import { Activity, ArrowRight, History, LayoutGrid, Users, UserRound } from 'lucide-react';
import { useStore } from '@/lib/store';
import { healthReports, LEVEL_COLOR, LEVEL_LABEL, type HotspotId, type HotspotReport, type Level } from '@/lib/health';
import { EmergencyHistory } from './emergency-history';

export type PanelId = 'biometric' | 'profile' | 'crew' | 'detail' | 'history';
const TABS: { id: PanelId; label: string; icon: typeof UserRound }[] = [
  { id: 'biometric', label: 'Biometric data', icon: Activity },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'crew', label: 'Crew overview', icon: Users },
  { id: 'detail', label: 'Detailed view', icon: LayoutGrid },
  { id: 'history', label: 'Historical records', icon: History },
];

export function BodyNav({ open, onToggle }: { open: PanelId | null; onToggle: (id: PanelId) => void }) {
  return (
    <nav aria-label="Body map panels" className="-mx-1 mb-3 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max gap-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = open === id;
          return (
            <button key={id} type="button" onClick={() => onToggle(id)} aria-expanded={on} aria-controls={`panel-${id}`} data-testid={`button-panel-${id}`}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-display text-sm tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-[#33C1AE] ${on ? 'border-[#33C1AE] bg-[#33C1AE]/15 text-[#33C1AE]' : 'border-border bg-card/60 text-foreground hover:border-[#33C1AE]/50'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function Collapse({ id, open, title, children }: { id: PanelId; open: boolean; title: string; children: ReactNode }) {
  return (
    <section id={`panel-${id}`} aria-label={title} hidden={!open} className="panel-reveal panel mb-4 p-4">
      <h3 className="font-display mb-3 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  );
}

const F = ({ k, v }: { k: string; v: string | number }) => (
  <div className="min-w-0 rounded-lg bg-secondary/70 p-2"><div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div><div className="break-words text-sm">{v === '' ? 'Not recorded' : v}</div></div>
);

export function ProfilePanel() {
  const { selected: p } = useStore();
  return (
    <div className="space-y-4">
      <div><p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[#33C1AE]">Personal</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><F k="Name" v={p.name} /><F k="Age" v={`${p.age} yrs`} /><F k="Role" v={p.role} /><F k="Record" v={p.demo ? 'Demo crew' : 'User created'} /></div></div>
      <div><p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[#33C1AE]">Medical</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><F k="Blood group" v={p.bloodGroup} /><F k="Conditions" v={p.conditions} /><F k="Allergies" v={p.allergies} /><F k="Medications" v={p.medications} /></div></div>
      <div><p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[#33C1AE]">Baseline</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6"><F k="Heart rate" v={`${p.hr} bpm`} /><F k="Blood pressure" v={`${p.sbp}/${p.dbp}`} /><F k="SpO2" v={`${p.spo2}%`} /><F k="Temp" v={`${p.temp} C`} /><F k="Weight" v={`${p.weight} kg`} /><F k="Sleep goal" v={`${p.sleepGoal} h`} /></div></div>
      <Link href="/perfil" data-testid="link-edit-profile" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">Edit full profile <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}

const RANK: Record<Level, number> = { estable: 0, vigilar: 1, alerta: 2 };

export function CrewPanel() {
  const { crew, selected, ship, logs } = useStore();
  const others = useMemo(() => crew.filter((c) => c.id !== selected.id).map((c) => {
    const last = logs.filter((l) => l.profileId === c.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    const reps = healthReports(c, ship, last);
    const worst = reps.reduce<Level>((w, r) => (RANK[r.level] > RANK[w] ? r.level : w), 'estable');
    const idx = Math.round(reps.reduce((s, r) => s + r.score, 0) / reps.length);
    const flagged = reps.filter((r) => r.level !== 'estable').map((r) => r.label);
    return { c, last, worst, idx, flagged };
  }), [crew, selected.id, ship, logs]);
  if (!others.length) return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No other crew members aboard. Add one from the profile page to see them here.</div>;
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {others.map(({ c, last, worst, idx, flagged }) => (
          <div key={c.id} className="rounded-xl border border-border bg-card/60 p-3" data-testid={`card-crew-${c.id}`}>
            <div className="flex items-center gap-3">
              <span className="h-9 w-1 rounded-full" style={{ background: LEVEL_COLOR[worst] }} />
              <div className="min-w-0 flex-1"><div className="truncate font-semibold">{c.name}</div><div className="truncate text-xs text-muted-foreground">{c.role} · last log {last ? last.date : 'none'}</div></div>
              <div className="text-right"><div className="font-mono text-lg" style={{ color: LEVEL_COLOR[worst] }}>{idx}</div><div className="font-mono text-[9px] uppercase text-muted-foreground">Simulated · {LEVEL_LABEL[worst]}</div></div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{flagged.length ? `Watch points: ${flagged.join(', ')}` : 'All points stable in simulation.'}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Simulated status from each member's own latest log and shared ship telemetry. Not a diagnosis.</p>
    </>
  );
}

export function DetailPanel({ reports, onOpen }: { reports: HotspotReport[]; onOpen: (id: HotspotId) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {reports.map((x) => (
        <button key={x.id} type="button" onClick={() => onOpen(x.id)} data-testid={`card-hotspot-${x.id}`} className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card/60 p-4 text-left transition hover:border-[#33C1AE]/60">
          <span className="h-10 w-1 rounded-full" style={{ background: LEVEL_COLOR[x.level] }} />
          <span className="min-w-0 flex-1"><span className="font-display block text-lg font-semibold">{x.label}</span><span className="block truncate text-sm text-muted-foreground">{x.condition}</span></span>
          <span className="text-right"><span className="font-mono block text-lg" style={{ color: LEVEL_COLOR[x.level] }}>{x.score}</span><span className="font-mono text-[10px] uppercase text-muted-foreground">{LEVEL_LABEL[x.level]}</span></span>
        </button>
      ))}
    </div>
  );
}

export function HistoryPanel() {
  const { selected } = useStore();
  return <EmergencyHistory key={selected.id} profileId={selected.id} name={selected.name} />;
}
