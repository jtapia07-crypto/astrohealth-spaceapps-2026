import { type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Rocket, Sprout, UserRound, Globe2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { deriveAlerts } from '@/lib/alerts';

const NAV = [
  { href: '/', label: 'Human', tid: 'humano', icon: Activity },
  { href: '/nave', label: 'Ship', tid: 'nave', icon: Rocket },
  { href: '/jardin', label: 'Garden', tid: 'jardin', icon: Sprout },
];

export function Shell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { ship, myLogs, selected, mission, getEventState } = useStore();
  const active = deriveAlerts(ship, myLogs[0], selected).filter((a) => a.severity !== 'info' && getEventState(a)?.resolved?.sig !== a.sig);
  const getBadge = (href: string) => { const src = href === '/' ? 'salud' : href === '/nave' ? 'nave' : null; if (!src) return null; const list = active.filter((a) => a.source === src); return list.length ? { n: list.length, urgent: list.some((a) => a.severity === 'urgente' || a.severity === 'critico') } : null; };
  return (
    <div className="grain relative min-h-[100dvh]">
      <div className="stars" /><div className="stars2" />
      <header className="relative z-10 border-b border-border/70 bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="16" r="6" fill="hsl(22 95% 58%)" /><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="hsl(172 58% 52%)" strokeWidth="1.5" transform="rotate(-24 16 16)" /></svg>
            <span className="font-display text-base font-bold tracking-[0.12em] sm:text-lg">AstroHealth Guardian</span>
          </Link>
          <span className="ml-auto hidden font-mono text-xs text-muted-foreground md:inline">{mission.callsign} · {selected.name}</span>
          <nav aria-label="Secondary" className="ml-auto flex gap-1 md:ml-4">
            <Link href="/perfil" data-testid="link-perfil" className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${loc === '/perfil' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><UserRound className="h-4 w-4" />Profile</Link>
            <Link href="/mision" data-testid="link-mision" className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${loc === '/mision' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Globe2 className="h-4 w-4" />Mission</Link>
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-36 pt-6">{children}</main>
      <footer className="relative z-10 mx-auto max-w-7xl px-4 pb-32 text-center font-mono text-[11px] leading-relaxed text-muted-foreground">
        Simulated demo telemetry. No real medical diagnosis and no control of any spacecraft. Data is stored only on this device (localStorage); use fictional data.
      </footer>
      <nav aria-label="Main sections" className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[min(30rem,calc(100%-1.5rem))] justify-between rounded-2xl border border-border bg-card/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md">
        {NAV.map(({ href, label, tid, icon: Icon }) => {
          const on = loc === href; const b = getBadge(href);
          return (
            <Link key={href} href={href} data-testid={`nav-${tid}`} aria-current={on ? 'page' : undefined} className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ${on ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
              <Icon className="h-5 w-5" />{label}
              {b && <span data-testid={`badge-alerts-${tid}`} aria-label={`${b.n} active events`} className={`absolute right-3 top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 font-mono text-[10px] ${b.urgent ? 'bg-destructive text-destructive-foreground' : 'bg-chart-3 text-background'}`}>{b.n}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="rise mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{kicker}</p>
        <h1 className="font-display mt-1 text-3xl font-bold md:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function DemoTag({ text = 'Simulated data' }: { text?: string }) {
  return <span className="rounded border border-chart-3/50 bg-chart-3/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-chart-3">{text}</span>;
}
