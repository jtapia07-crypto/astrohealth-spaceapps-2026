import { useState } from 'react';
import { Link } from 'wouter';
import { CheckCheck, Eye, PhoneCall, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DemoTag, PageHead } from '@/components/shell';
import { useStore } from '@/lib/store';
import { deriveAlerts, SEV_LABEL, type Alert, type Severity } from '@/lib/alerts';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/use-page-meta';

const SEV_STYLE: Record<Severity, string> = { urgente: 'border-destructive bg-destructive/15', critico: 'border-destructive/70 bg-destructive/10', precaucion: 'border-chart-3/60 bg-chart-3/5', info: 'border-border bg-card/60' };
const SEV_TXT: Record<Severity, string> = { urgente: 'text-destructive', critico: 'text-destructive', precaucion: 'text-chart-3', info: 'text-accent' };

export default function CriticoPage() {
  usePageMeta('Crítico', 'Alertas combinadas de salud y nave con causa y acciones conservadoras.');
  const { ship, myLogs, selected, alerts, setAlert } = useStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'todas' | 'salud' | 'nave'>('todas');
  const [resolving, setResolving] = useState<Alert | null>(null);
  const [note, setNote] = useState('');
  const all = deriveAlerts(ship, myLogs[0], selected);
  const open = all.filter((a) => alerts[a.id]?.resolved?.sig !== a.sig && (filter === 'todas' || a.source === filter));
  const resolved = all.length - all.filter((a) => alerts[a.id]?.resolved?.sig !== a.sig).length;
  return (
    <>
      <PageHead kicker="Centro de alertas · salud + nave" title="Crítico"><DemoTag text="Alertas simuladas" /></PageHead>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm"><b className="font-display tracking-wide">Escalamiento urgente:</b> dolor en el pecho, dificultad respiratoria intensa o signos neurológicos (debilidad de un lado, habla o visión alterada) requieren contacto inmediato con el cirujano de vuelo y control de misión.</div>
        <div className="flex gap-1 self-start rounded-xl border border-border p-1">{(['todas', 'salud', 'nave'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} data-testid={`filter-${f}`} className={`rounded-lg px-4 py-2 text-sm capitalize transition ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{f}</button>)}</div>
      </div>
      <p className="mb-3 font-mono text-xs text-muted-foreground">{open.length} activas · {resolved} resueltas · basado en el último registro de {selected.name} ({myLogs[0]?.date ?? 'sin registro'})</p>
      {open.length === 0 ? (
        <div className="panel rise grid place-items-center gap-3 p-12 text-center"><ShieldCheck className="h-12 w-12 text-accent" /><h2 className="font-display text-2xl">Sin alertas activas</h2><p className="max-w-md text-sm text-muted-foreground">La tripulación y la nave están dentro de rangos simulados. Puedes provocar escenarios en la página de la nave.</p><Link href="/nave" className="text-sm text-primary underline" data-testid="link-to-nave">Ir a la nave</Link></div>
      ) : (
        <div className="space-y-3">{open.map((a, i) => { const ack = alerts[a.id]?.ack; return (
          <article key={a.id} data-testid={`alert-${a.id}`} style={{ animationDelay: i * 40 + 'ms' }} className={`rise rounded-xl border p-5 ${SEV_STYLE[a.severity]}`}>
            <div className="flex flex-wrap items-center gap-2"><span className={`font-mono text-[11px] uppercase tracking-widest ${SEV_TXT[a.severity]}`}>{SEV_LABEL[a.severity]}</span><span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase">{a.source}</span>{ack && <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Eye className="h-3 w-3" />reconocida {new Date(ack).toLocaleString('es')}</span>}</div>
            <h3 className="font-display mt-1 text-xl">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground"><b className="text-foreground">Causa:</b> {a.cause}</p>
            <ul className="mt-3 space-y-1 text-sm">{a.actions.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 h-1 w-3 shrink-0 bg-primary" />{x}</li>)}</ul>
            <p className="mt-3 flex items-center gap-2 text-xs text-accent"><PhoneCall className="h-3.5 w-3.5" />{a.contact}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled={!!ack} onClick={() => { setAlert(a.id, { ...alerts[a.id], ack: new Date().toISOString() }); toast({ title: 'Alerta reconocida', description: 'Sigue activa hasta resolverse.' }); }} data-testid={`button-ack-${a.id}`}><Eye />{ack ? 'Reconocida' : 'Reconocer'}</Button>
              <Button size="sm" onClick={() => { setResolving(a); setNote(''); }} data-testid={`button-resolve-${a.id}`}><CheckCheck />Marcar resuelta</Button>
              <Link href={a.link} className="px-2 py-1.5 text-sm text-muted-foreground underline" data-testid={`link-alert-${a.id}`}>Ver origen</Link>
            </div>
          </article>); })}</div>
      )}
      <Dialog open={!!resolving} onOpenChange={(o) => !o && setResolving(null)}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle className="font-display">Resolver: {resolving?.title}</DialogTitle><DialogDescription>Reconocer solo indica que la viste. Resolver confirma que se siguió el procedimiento autorizado. Si la causa cambia o reaparece, la alerta volverá.</DialogDescription></DialogHeader>
          <Textarea placeholder="Nota: qué se hizo y con quién se coordinó" value={note} onChange={(e) => setNote(e.target.value)} data-testid="input-resolve-note" />
          <DialogFooter><Button variant="ghost" onClick={() => setResolving(null)}>Cancelar</Button><Button disabled={!note.trim()} onClick={() => { if (!resolving) return; setAlert(resolving.id, { ...alerts[resolving.id], resolved: { at: new Date().toISOString(), note, sig: resolving.sig } }); toast({ title: 'Alerta resuelta', description: note }); setResolving(null); }} data-testid="button-confirm-resolve">Confirmar resolución</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
