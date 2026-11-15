import { useState } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoTag, PageHead } from '@/components/shell';
import { DESTINATIONS, NASA_SOURCES } from '@/data/nasa';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function MisionPage() {
  usePageMeta('Mission', 'Simulated mission settings, destination data, and NASA and partner scientific sources.');
  const { destination, setDestination, mission, setMission } = useStore();
  const [form, setForm] = useState(mission);
  const { toast } = useToast();

  const dest = DESTINATIONS.find((d) => d.id === destination) ?? DESTINATIONS[0];

  const ret = (() => {
    const t = Date.parse(form.start);
    return Number.isNaN(t) ? '' : new Date(t + form.days * 864e5).toISOString().slice(0, 10);
  })();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setMission(form);
    toast({ title: 'Mission updated' });
  };

  return (
    <>
      <PageHead kicker="Flight plan · reference" title="Mission">
        <DemoTag text="Reference data · simulated mission" />
      </PageHead>

      <div className="mb-5 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Mission destination">
        {DESTINATIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={destination === d.id}
            onClick={() => setDestination(d.id)}
            data-testid={`button-dest-${d.id}`}
            className={`panel p-4 text-left transition ${
              destination === d.id ? 'border-primary bg-primary/10' : 'hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-display text-lg">{d.name}</div>
              {destination === d.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{d.gravity}</p>
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <section className="panel rise space-y-4 p-5" aria-label="Destination data">
          <h2 className="font-display text-xl">Destination data</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">Distance</div>
              <div className="mt-1 text-sm">{dest.distance}</div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">Gravity</div>
              <div className="mt-1 text-sm">{dest.gravity}</div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 sm:col-span-2">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">Typical duration</div>
              <div className="mt-1 text-sm">{dest.duration}</div>
            </div>
            {'radiationNote' in dest && dest.radiationNote && (
              <div className="rounded-lg bg-secondary/50 p-3 sm:col-span-2">
                <div className="font-mono text-[10px] uppercase text-muted-foreground">Radiation environment</div>
                <div className="mt-1 text-sm">{dest.radiationNote}</div>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{dest.note}</p>
        </section>

        <form onSubmit={save} className="panel rise space-y-4 p-5" aria-label="Mission settings">
          <h2 className="font-display text-xl">Mission settings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-muted-foreground">
              CALLSIGN
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              START DATE
              <input
                type="date"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              DURATION (DAYS)
              <input
                type="number"
                min={1}
                max={2000}
                value={form.days}
                onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              CREW MEMBERS
              <input
                type="number"
                min={1}
                max={12}
                value={form.crew}
                onChange={(e) => setForm({ ...form, crew: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>
          {ret && <p className="font-mono text-xs text-muted-foreground">Estimated return: {ret}</p>}
          <Button type="submit" className="w-full" data-testid="button-save-mission">
            Save mission
          </Button>
        </form>
      </div>

      <section className="panel rise space-y-4 p-5" aria-label="NASA and partners sources">
        <div>
          <h2 className="font-display text-xl">NASA and partners sources</h2>
          <p className="text-sm text-muted-foreground">
            Official technical standards, flight datasets, and peer-reviewed spaceflight studies integrated into AstroHealth Guardian.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {NASA_SOURCES.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-border bg-secondary/40 p-4 transition hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {'agency' in s && s.agency && (
                    <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
                      {s.agency}
                    </div>
                  )}
                  <h3 className="font-display text-base group-hover:text-primary">{s.title}</h3>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.summary}</p>
              <div className="mt-2 truncate font-mono text-[11px] text-primary/90">{s.url}</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
