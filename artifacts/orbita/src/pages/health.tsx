import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { AlertOctagon, ArrowRight, HeartPulse, Info, ShieldAlert, Stethoscope } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BodyFigure } from '@/components/body-figure';
import { OrganVisual } from '@/components/medical/organ-visual';
import { DemoTag, PageHead } from '@/components/shell';
import { useStore } from '@/lib/store';
import { healthReports, LEVEL_COLOR, LEVEL_LABEL, type HotspotId } from '@/lib/health';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function HealthPage() {
  usePageMeta('Human', 'Illustrative health status of the selected astronaut on an interactive anatomical body map.');
  const { crew, selected, selectId, ship, myLogs } = useStore();
  const log = myLogs[0];
  const reports = useMemo(() => healthReports(selected, ship, log), [selected, ship, log]);
  const [open, setOpen] = useState<HotspotId | null>(null);
  const r = reports.find((x) => x.id === open);
  const urgent = log?.symptoms.some((s) => ['dolor_pecho', 'falta_aire', 'neurologico'].includes(s));
  const overall = Math.round(reports.reduce((s, x) => s + x.score, 0) / reports.length);
  return (
    <>
      <PageHead kicker="Body log · crew member" title="The body in orbit"><DemoTag text="Illustrative scores" /></PageHead>
      {urgent && <Link href="/critico" data-testid="banner-urgent" className="rise mb-5 flex items-center gap-3 rounded-xl border border-destructive bg-destructive/15 p-4 text-sm"><AlertOctagon className="h-6 w-6 shrink-0 text-destructive" /><span><b className="font-display tracking-wide">Urgent medical escalation.</b> A red-flag symptom was logged (chest pain, severe breathing difficulty or neurological deficit). Contact the flight surgeon immediately.</span><ArrowRight className="ml-auto h-4 w-4" /></Link>}
      <section className="mb-6">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Crew selection</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {crew.map((c) => (
            <button key={c.id} onClick={() => selectId(c.id)} data-testid={`button-crew-${c.id}`} className={`flex min-w-[13rem] items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${c.id === selected.id ? 'border-primary bg-primary/10' : 'border-border bg-card/60 hover:border-primary/40'}`}>
              <span className="font-display grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-bold">{c.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}</span>
              <span className="min-w-0"><span className="block truncate font-semibold">{c.name}</span><span className="block truncate text-xs text-muted-foreground">{c.role}{c.demo ? ' · demo' : ''}</span></span>
            </button>
          ))}
        </div>
      </section>
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="panel rise relative h-[560px] min-w-0 overflow-hidden p-2 md:h-[640px]">
          <div className="absolute left-4 top-4 z-10 font-mono text-[11px] text-muted-foreground">
            <div>{selected.name.toUpperCase()}</div><div>{selected.bloodGroup} · {selected.age} yrs · {ship.gravity} g</div>
          </div>
          <div className="absolute right-4 top-4 z-10 text-right"><div className="font-display text-4xl font-bold text-primary" data-testid="text-overall">{overall}</div><div className="font-mono text-[10px] uppercase text-muted-foreground">illustrative index</div></div>
          <div className="absolute inset-x-2 bottom-8 top-14">
            <BodyFigure reports={reports} active={open} onSelect={setOpen} />
          </div>
          <p className="absolute inset-x-0 bottom-3 text-center font-mono text-[11px] text-muted-foreground">Tap or focus a body point to open its report</p>
        </div>
        <div className="min-w-0 space-y-3">
          {reports.map((x, i) => (
            <button key={x.id} onClick={() => setOpen(x.id)} data-testid={`card-hotspot-${x.id}`} style={{ animationDelay: i * 50 + 'ms' }} className="panel rise group flex w-full items-center gap-4 p-4 text-left transition hover:border-primary/50">
              <span className="h-10 w-1 rounded-full" style={{ background: LEVEL_COLOR[x.level] }} />
              <span className="min-w-0 flex-1"><span className="font-display block text-lg font-semibold">{x.label}</span><span className="block truncate text-sm text-muted-foreground">{x.condition}</span></span>
              <span className="text-right"><span className="font-mono block text-lg" style={{ color: LEVEL_COLOR[x.level] }}>{x.score}</span><span className="font-mono text-[10px] uppercase text-muted-foreground">{LEVEL_LABEL[x.level]}</span></span>
            </button>
          ))}
          <div className="rounded-xl border border-border p-4 text-xs leading-relaxed text-muted-foreground"><Info className="mb-1 h-4 w-4" />Scores derived from the profile, the latest garden log ({log ? log.date : 'no logs'}) and simulated ship telemetry. They are not diagnoses and do not replace evaluation by a professional.</div>
        </div>
      </div>
      <Dialog open={!!r} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="organ-dialog max-h-[90dvh] overflow-y-auto border-border bg-card sm:max-w-4xl">
          {r && <div key={r.id} className="grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"><div className="min-w-0 space-y-4 md:order-1">
            <DialogHeader>
              <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: LEVEL_COLOR[r.level] }}>{LEVEL_LABEL[r.level]} · {r.score}/100 illustrative</p>
              <DialogTitle className="font-display text-3xl">{r.label}</DialogTitle>
              <DialogDescription>{r.condition}</DialogDescription>
            </DialogHeader>
            {r.warning && <div className="flex gap-2 rounded-lg border border-destructive bg-destructive/15 p-3 text-sm" data-testid="text-warning"><ShieldAlert className="h-5 w-5 shrink-0 text-destructive" />{r.warning}</div>}
            <div className="grid grid-cols-3 gap-2">{r.metrics.map((m) => <div key={m.k} className="rounded-lg bg-secondary p-2"><div className="font-mono text-[10px] uppercase text-muted-foreground">{m.k}</div><div className="font-mono text-sm">{m.v}</div></div>)}</div>
            <div><h4 className="font-display mb-1 flex items-center gap-2 text-sm uppercase tracking-wider text-accent"><HeartPulse className="h-4 w-4" />Spaceflight context</h4><p className="text-sm text-muted-foreground">{r.spaceflight}</p></div>
            <div><h4 className="font-display mb-1 flex items-center gap-2 text-sm uppercase tracking-wider text-primary"><Stethoscope className="h-4 w-4" />General actions on board</h4><ul className="space-y-1.5 text-sm">{r.actions.map((a) => <li key={a} className="flex gap-2"><span className="mt-2 h-1 w-3 shrink-0 bg-primary" />{a}</li>)}</ul></div>
            {r.disclaimer && <p className="rounded-lg border border-chart-3/40 bg-chart-3/10 p-3 text-xs text-chart-3">{r.disclaimer}</p>}
            <p className="text-[11px] text-muted-foreground">General educational steps, not prescriptions. For serious symptoms: flight surgeon / mission control.</p>
          </div><div className="min-w-0 md:order-2 md:sticky md:top-0 md:self-start"><OrganVisual id={r.id} /></div></div>}
        </DialogContent>
      </Dialog>
    </>
  );
}
