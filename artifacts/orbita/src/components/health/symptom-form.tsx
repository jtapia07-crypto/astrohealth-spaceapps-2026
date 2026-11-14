import { useEffect, useRef, useState } from 'react';
import { AlertOctagon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SYMPTOMS } from '@/lib/health';
import { todayISO } from '@/lib/defaults';
import { useStore } from '@/lib/store';
import type { Symptom } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

/** Symptoms + notes for the selected crew member. Saves via saveHealthLog, which preserves other daily fields. */
export function SymptomForm() {
  const { selected, myLogs, saveHealthLog } = useStore();
  const { toast } = useToast();
  const [date, setDate] = useState(todayISO());
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const loadedFor = useRef('');
  const existing = myLogs.find((l) => l.date === date);
  useEffect(() => {
    const key = selected.id + '|' + date;
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    setSymptoms(existing?.symptoms ?? []);
    setNotes(existing?.notes ?? '');
    setErr(null);
  }, [selected.id, date, existing]);
  const urgent = symptoms.some((s) => SYMPTOMS.find((x) => x.id === s)?.urgent);
  const L = 'font-mono text-[11px] uppercase tracking-wider text-muted-foreground';
  return (
    <form className="panel rise mt-4 space-y-4 p-5" data-testid="form-health-log" onSubmit={(e) => {
      e.preventDefault();
      try {
        saveHealthLog(selected.id, date, symptoms, notes);
        setErr(null);
        toast({ title: existing ? 'Health log updated' : 'Health log saved', description: `${date} for ${selected.name}. Other journal fields were kept.` });
        if (urgent) toast({ title: 'Red-flag symptom logged', description: 'See the health events above and contact the flight surgeon now.', variant: 'destructive' });
      } catch (x) {
        const m = x instanceof Error ? x.message : 'Local storage failed.';
        setErr(m); toast({ title: 'Could not save on this device', description: m, variant: 'destructive' });
      }
    }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">How I feel · {selected.name}</p><h2 className="font-display text-xl">Symptoms and notes</h2></div>
        <div className="space-y-1"><Label htmlFor="health-date" className={L}>Date</Label><Input id="health-date" type="date" value={date} max={todayISO()} required onChange={(e) => e.target.value && setDate(e.target.value)} data-testid="input-health-date" className="w-44 bg-background/60" /></div>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground" data-testid="text-health-existing">{existing ? 'Editing the existing log for this date.' : 'No log for this date yet; a new one will be created.'}</p>
      <div className="space-y-1.5"><span className={L}>Symptoms</span><div className="flex flex-wrap gap-1.5">{SYMPTOMS.map((s) => { const on = symptoms.includes(s.id); return <button type="button" aria-pressed={on} key={s.id} onClick={() => setSymptoms(on ? symptoms.filter((x) => x !== s.id) : [...symptoms, s.id])} data-testid={`button-symptom-${s.id}`} className={`rounded-full border px-3 py-1 text-xs transition ${on ? (s.urgent ? 'border-destructive bg-destructive/25' : 'border-chart-3 bg-chart-3/20') : 'border-border text-muted-foreground hover:border-primary/50'}`}>{s.label}</button>; })}</div></div>
      {urgent && <div className="flex gap-2 rounded-lg border border-destructive bg-destructive/15 p-3 text-sm" data-testid="text-urgent-escalation"><AlertOctagon className="h-5 w-5 shrink-0 text-destructive" /><span><b>Urgent escalation.</b> Chest pain, severe breathing difficulty or neurological signs require immediate contact with the flight surgeon and mission control.</span></div>}
      <div className="space-y-1.5"><Label htmlFor="health-notes" className={L}>Notes / how I feel</Label><Textarea id="health-notes" maxLength={10000} value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-notes" className="bg-background/60" /></div>
      {err && <p role="alert" className="text-sm text-destructive" data-testid="text-health-error">Not saved: {err}</p>}
      <Button type="submit" className="w-full" data-testid="button-save-health"><Save />Save</Button>
    </form>
  );
}
