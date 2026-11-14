import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { DailyLog } from '@/lib/types';

export function LogForm({ initial, onSave }: { initial: DailyLog; onSave: (l: DailyLog) => void }) {
  const [f, setF] = useState(initial);
  useEffect(() => setF(initial), [initial]);
  const set = <K extends keyof DailyLog>(k: K, v: DailyLog[K]) => setF((p) => ({ ...p, [k]: v }));
  const L = ({ children }: { children: React.ReactNode }) => <Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{children}</Label>;
  const scale = (k: 'sleepQuality' | 'mood' | 'stress', label: string) => (
    <div className="space-y-1.5"><L>{label}</L><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button type="button" aria-label={`${label} ${n} of 5`} aria-pressed={f[k] === n} key={n} onClick={() => set(k, n)} data-testid={`button-${k}-${n}`} className={`h-9 flex-1 rounded-md border font-mono text-sm transition ${f[k] === n ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'}`}>{n}</button>)}</div></div>
  );
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><L>Date</L><Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} required data-testid="input-date" className="bg-background/60" /></div>
        <div className="space-y-1.5"><L>Sleep: {f.sleepHours} h</L><Slider className="pt-3" min={0} max={12} step={0.5} value={[f.sleepHours]} onValueChange={([v]) => set('sleepHours', v)} data-testid="slider-sleep" /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">{scale('sleepQuality', 'Sleep quality')}{scale('mood', 'Mood')}{scale('stress', 'Stress')}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><L>Hydration: {f.hydration} L</L><Slider className="pt-3" min={0} max={4} step={0.1} value={[f.hydration]} onValueChange={([v]) => set('hydration', Math.round(v * 10) / 10)} data-testid="slider-hydration" /></div>
        <div className="space-y-1.5"><L>Exercise: {f.exercise} min</L><Slider className="pt-3" min={0} max={180} step={5} value={[f.exercise]} onValueChange={([v]) => set('exercise', v)} data-testid="slider-exercise" /></div>
      </div>
      <div className="space-y-1.5"><L>Meals</L><Input value={f.meals} onChange={(e) => set('meals', e.target.value)} placeholder="Breakfast, lunch, dinner" data-testid="input-meals" className="bg-background/60" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.social} onChange={(e) => set('social', e.target.checked)} data-testid="checkbox-social" className="h-4 w-4 accent-[hsl(172_58%_48%)]" />I had meaningful social contact (family, crew, friends)</label>
      <Button type="submit" className="w-full" data-testid="button-save-log"><Save />Save daily journal</Button>
      <p className="text-center font-mono text-[11px] text-muted-foreground">Symptoms and notes are logged in Human, Biometric data.</p>
    </form>
  );
}
