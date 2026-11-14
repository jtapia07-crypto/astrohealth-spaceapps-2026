import { useState } from 'react';
import { Award, ChevronDown, Flame, Sparkles, Trophy } from 'lucide-react';
import type { GardenProgress } from '@/lib/garden-progress';

export function GardenProgressCards({ p }: { p: GardenProgress }) {
  const [open, setOpen] = useState(false);
  const cards = [
    { k: 'accumulated', label: 'Accumulated points', value: p.accumulatedPoints, sub: `${p.loggedDays} saved ${p.loggedDays === 1 ? 'day' : 'days'}`, Icon: Sparkles, tone: 'text-primary', bar: 'from-primary/25' },
    { k: 'current-streak', label: 'Current streak', value: p.currentStreak, sub: p.loggedToday ? 'Today included' : p.currentStreak ? 'Today still pending' : 'Save a day to start', Icon: Flame, tone: 'text-primary', bar: 'from-primary/25', unit: 'd' },
    { k: 'today', label: "Today's points", value: p.todayPoints, sub: p.loggedToday ? 'Saved for today' : 'Not saved yet', Icon: Award, tone: 'text-accent', bar: 'from-accent/25', unit: '/100' },
    { k: 'best-streak', label: 'Best streak', value: p.bestStreak, sub: 'Consecutive saved days', Icon: Trophy, tone: 'text-accent', bar: 'from-accent/25', unit: 'd' },
  ];
  return (
    <section className="panel rise p-4" aria-label="Garden progress" data-testid="garden-progress">
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map(({ k, label, value, sub, Icon, tone, bar, unit }, i) => (
          <div key={k} style={{ animationDelay: `${i * 60}ms` }} className={`rise group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${bar} to-transparent p-3 transition-transform duration-300 hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><span>{label}</span><Icon className={`h-3.5 w-3.5 ${tone}`} /></div>
            <div className="mt-1 flex items-baseline gap-1"><span key={value} className={`rise font-display text-3xl ${tone}`} data-testid={`stat-${k}`}>{value}</span>{unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}</div>
            <div className="truncate text-[11px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} data-testid="button-points-help" className="mt-3 flex w-full items-center justify-between rounded-md px-1 text-left text-xs text-muted-foreground transition hover:text-foreground">
        <span>Points are awarded only when you save. How does it work?</span><ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <ul className="rise mt-2 space-y-1 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground" data-testid="text-points-help">
        <li>Each date counts once, up to 100 points. Editing a day replaces its points; deleting removes them.</li>
        <li>Your current streak still counts yesterday while today is pending. Future dates are excluded.</li>
        <li>These are illustrative game points, not clinical health advice. Follow your care team's guidance rather than chasing a number.</li>
      </ul>}
    </section>
  );
}
