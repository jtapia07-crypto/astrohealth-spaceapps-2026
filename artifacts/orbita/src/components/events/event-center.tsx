import { useState } from 'react';
import { Link } from 'wouter';
import { Archive, CheckCheck, Eye, PhoneCall, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { SEV_LABEL, type Alert, type Severity } from '@/lib/alerts';
import type { EventRecord } from '@/lib/event-history';
import { useToast } from '@/hooks/use-toast';

export const SEV_STYLE: Record<Severity, string> = { urgente: 'border-destructive bg-destructive/15', critico: 'border-destructive/70 bg-destructive/10', precaucion: 'border-chart-3/60 bg-chart-3/5', info: 'border-accent/40 bg-card/70' };
export const SEV_TXT: Record<Severity, string> = { urgente: 'text-destructive', critico: 'text-destructive', precaucion: 'text-chart-3', info: 'text-accent' };

/** Active (unresolved) events list with Acknowledge + Mark resolved. Alerts must be pre-filtered by source. */
export function ActiveEvents({ alerts, emptyText, testid }: { alerts: Alert[]; emptyText: string; testid: string }) {
  const { acknowledgeEvent, resolveEvent, getEventState } = useStore();
  const { toast } = useToast();
  const [resolving, setResolving] = useState<Alert | null>(null);
  const [note, setNote] = useState('');
  const open = alerts.filter((a) => getEventState(a)?.resolved?.sig !== a.sig);
  const fail = (e: unknown) => toast({ title: 'Could not save on this device', description: e instanceof Error ? e.message : 'Local storage failed. Try again.', variant: 'destructive' });
  return (
    <div data-testid={testid}>
      {open.length === 0 ? (
        <div className="panel flex items-center gap-3 p-4 text-sm" data-testid={`${testid}-empty`}><ShieldCheck className="h-6 w-6 shrink-0 text-accent" /><span className="text-muted-foreground">{emptyText}</span></div>
      ) : (
        <div className="space-y-3">{open.map((a, i) => { const ack = getEventState(a)?.ack; return (
          <article key={a.id} data-testid={`alert-${a.id}`} style={{ animationDelay: i * 40 + 'ms' }} className={`rise rounded-xl border p-4 backdrop-blur-sm ${SEV_STYLE[a.severity]}`}>
            <div className="flex flex-wrap items-center gap-2"><span className={`font-mono text-[11px] uppercase tracking-widest ${SEV_TXT[a.severity]}`}>{SEV_LABEL[a.severity]}</span>{ack && <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Eye className="h-3 w-3" />acknowledged {new Date(ack).toLocaleString('en-US')}</span>}</div>
            <h3 className="font-display mt-1 text-lg">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground"><b className="text-foreground">Cause:</b> {a.cause}</p>
            <ul className="mt-2 space-y-1 text-sm">{a.actions.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 h-1 w-3 shrink-0 bg-primary" />{x}</li>)}</ul>
            <p className="mt-2 flex items-center gap-2 text-xs text-accent"><PhoneCall className="h-3.5 w-3.5" />{a.contact}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled={!!ack} onClick={() => { try { acknowledgeEvent(a); toast({ title: 'Event acknowledged', description: 'It stays active until resolved.' }); } catch (e) { fail(e); } }} data-testid={`button-ack-${a.id}`}><Eye />{ack ? 'Acknowledged' : 'Acknowledge'}</Button>
              <Button size="sm" onClick={() => { setResolving(a); setNote(''); }} data-testid={`button-resolve-${a.id}`}><CheckCheck />Mark resolved</Button>
              {a.link === '/jardin' && <Link href="/jardin" className="px-2 py-1.5 text-sm text-muted-foreground underline" data-testid={`link-alert-${a.id}`}>Open garden journal</Link>}
            </div>
          </article>); })}</div>
      )}
      <Dialog open={!!resolving} onOpenChange={(o) => !o && setResolving(null)}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle className="font-display">Resolve: {resolving?.title}</DialogTitle><DialogDescription>Acknowledging only means you saw it. Resolving confirms the authorized procedure was followed and saves it to Historical records. If the cause changes or returns, the event will come back.</DialogDescription></DialogHeader>
          <Textarea placeholder="Note: what was done and who it was coordinated with" aria-label="Resolution note" value={note} onChange={(e) => setNote(e.target.value)} data-testid="input-resolve-note" />
          <DialogFooter><Button variant="ghost" onClick={() => setResolving(null)}>Cancel</Button><Button disabled={!note.trim()} onClick={() => { if (!resolving) return; try { resolveEvent(resolving, note.trim()); toast({ title: 'Event resolved', description: 'Saved to Historical records.' }); setResolving(null); } catch (e) { fail(e); } }} data-testid="button-confirm-resolve">Confirm resolution</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Persisted resolved-event snapshots. Never re-derived from current alerts. */
export function EventHistoryList({ records, emptyText, testid }: { records: EventRecord[]; emptyText: string; testid: string }) {
  const sorted = [...records].sort((a, b) => b.at.localeCompare(a.at));
  if (!sorted.length) return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground" data-testid={`${testid}-empty`}><Archive className="mx-auto mb-2 h-6 w-6" />{emptyText}</div>;
  return (
    <ol className="space-y-3" data-testid={testid}>{sorted.map((r) => (
      <li key={r.id} className={`rounded-xl border p-4 ${SEV_STYLE[r.severity]}`} data-testid={`record-${r.id}`}>
        <div className="flex flex-wrap items-center gap-2"><span className={`font-mono text-[11px] uppercase tracking-widest ${SEV_TXT[r.severity]}`}>{SEV_LABEL[r.severity]}</span>{r.source === 'salud' && !r.profileId && <span className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground" data-testid={`tag-legacy-${r.id}`}>Legacy · crew unspecified</span>}<span className="font-mono text-[10px] text-muted-foreground">resolved {new Date(r.at).toLocaleString('en-US')}</span></div>
        <h4 className="font-display mt-1 text-base">{r.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground"><b className="text-foreground">Cause:</b> {r.cause}</p>
        {r.actions.length > 0 && <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{r.actions.map((x) => <li key={x} className="flex gap-2"><span className="mt-1.5 h-1 w-2 shrink-0 bg-primary/70" />{x}</li>)}</ul>}
        <p className="mt-2 flex items-center gap-2 text-xs text-accent"><PhoneCall className="h-3.5 w-3.5" />{r.contact}</p>
        <p className="mt-2 rounded-lg bg-secondary/60 p-2 text-sm"><b className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Resolution note </b>{r.note}</p>
      </li>))}</ol>
  );
}
