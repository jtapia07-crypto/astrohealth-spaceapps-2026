import { useState, type FormEvent } from 'react';
import { CheckCircle2, HardDrive, Plus, XCircle } from 'lucide-react';
import { useEmergencyHistory } from '@/hooks/use-emergency-history';
import type { EmergencyInput } from '@/lib/emergency-history';
import { todayISO } from '@/lib/defaults';

const EMPTY: EmergencyInput = { date: '', emergency: '', method: '', outcome: '' };
type Errors = Partial<Record<keyof EmergencyInput, string>>;

function validate(v: EmergencyInput): Errors {
  const e: Errors = {};
  const today = todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) e.date = 'Choose a valid date.';
  else if (v.date > today) e.date = 'A resolved event cannot be in the future.';
  if (v.emergency.trim().length < 3) e.emergency = 'Describe the emergency (at least 3 characters).';
  else if (v.emergency.length > 2000) e.emergency = 'Keep it under 2000 characters.';
  if (v.method.trim().length < 3) e.method = 'Describe the most effective method (at least 3 characters).';
  else if (v.method.length > 2000) e.method = 'Keep it under 2000 characters.';
  if (v.outcome.trim().length < 3) e.outcome = 'Describe the outcome (at least 3 characters).';
  else if (v.outcome.length > 2000) e.outcome = 'Keep it under 2000 characters.';
  return e;
}

/** Mount with key={profileId} so drafts never leak between crew members. */
export function EmergencyHistory({ profileId, name }: { profileId: string; name: string }) {
  const { records, addRecord } = useEmergencyHistory(profileId);
  const [draft, setDraft] = useState<EmergencyInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const set = (k: keyof EmergencyInput) => (e: { target: { value: string } }) => { setDraft((d) => ({ ...d, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); setStatus(null); };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) { setStatus({ ok: false, msg: 'Please fix the highlighted fields.' }); return; }
    try {
      addRecord({ date: draft.date, emergency: draft.emergency.trim(), method: draft.method.trim(), outcome: draft.outcome.trim() });
      setDraft(EMPTY);
      setStatus({ ok: true, msg: 'Resolved event saved to this browser.' });
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : 'Could not save the event.' });
    }
  };

  const field = (k: keyof EmergencyInput, label: string, multi = false) => (
    <label className="block min-w-0">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {multi
        ? <textarea maxLength={2000} value={draft[k]} onChange={set(k)} rows={2} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `err-${k}` : undefined} data-testid={`input-emergency-${k}`} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm outline-none transition focus:border-[#33C1AE] aria-[invalid=true]:border-destructive" />
        : <input type={k === 'date' ? 'date' : 'text'} max={k === 'date' ? todayISO() : undefined} maxLength={k === 'date' ? undefined : 2000} value={draft[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `err-${k}` : undefined} data-testid={`input-emergency-${k}`} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm outline-none transition focus:border-[#33C1AE] aria-[invalid=true]:border-destructive" />}
      {errors[k] && <span id={`err-${k}`} className="mt-1 block text-xs text-destructive">{errors[k]}</span>}
    </label>
  );

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="mb-3 text-sm text-muted-foreground">Resolved health emergencies for <b className="text-foreground">{name}</b>, newest first.</p>
        {records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No resolved events yet. The log stays quiet until something is added.</div>
        ) : (
          <ol className="relative space-y-3 border-l border-[#33C1AE]/30 pl-5">
            {records.map((r) => (
              <li key={r.id} className="relative rounded-xl border border-border bg-card/60 p-3" data-testid={`row-emergency-${r.id}`}>
                <span className="absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full border border-[#33C1AE] bg-background" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-[#33C1AE]">{r.date}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${r.example ? 'bg-chart-3/15 text-chart-3' : 'bg-[#33C1AE]/15 text-[#33C1AE]'}`}>{r.example ? 'Fictional example' : 'User entry'}</span>
                </div>
                <div className="font-display mt-1 font-semibold">{r.emergency}</div>
                <dl className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                  <div><dt className="font-mono text-[10px] uppercase text-muted-foreground">Most effective method</dt><dd>{r.method}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase text-muted-foreground">Outcome</dt><dd>{r.outcome}</dd></div>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </div>
      <form onSubmit={submit} noValidate className="min-w-0 space-y-3 rounded-xl border border-border bg-background/40 p-4" data-testid="form-emergency">
        <h4 className="font-display flex items-center gap-2 text-sm uppercase tracking-wider"><Plus className="h-4 w-4 text-[#33C1AE]" />Add resolved event</h4>
        {field('date', 'Date')}
        {field('emergency', 'Emergency')}
        {field('method', 'Most effective method used', true)}
        {field('outcome', 'Outcome', true)}
        <button type="submit" data-testid="button-save-emergency" className="w-full rounded-lg bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition hover:brightness-110">Save event</button>
        {status && <p role="status" data-testid="status-emergency" className={`flex items-center gap-2 text-xs ${status.ok ? 'text-[#33C1AE]' : 'text-destructive'}`}>{status.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{status.msg}</p>}
        <p className="flex gap-2 text-[11px] leading-snug text-muted-foreground"><HardDrive className="h-3.5 w-3.5 shrink-0" />Stored only in this browser's local storage. Educational log, not a medical record.</p>
      </form>
    </div>
  );
}
