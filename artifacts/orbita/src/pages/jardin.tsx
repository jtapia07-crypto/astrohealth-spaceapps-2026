import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Sprout, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DemoTag, PageHead } from '@/components/shell';
import { PlantScene } from '@/components/plant-scene';
import { LogForm } from '@/components/log-form';
import { useStore } from '@/lib/store';
import { growthStage, shipScore, weatherFor, wellness } from '@/lib/scores';
import { shiftISO, todayISO } from '@/lib/defaults';
import { SYMPTOMS } from '@/lib/health';
import type { DailyLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/use-page-meta';

type Range = 'dia' | 'semana' | 'mes';
const blank = (profileId: string, date: string): DailyLog => ({ id: 'l-' + Date.now().toString(36), profileId, date, sleepHours: 7, sleepQuality: 3, meals: '', hydration: 2, mood: 3, stress: 3, exercise: 60, social: false, notes: '', symptoms: [] });
const W_LABEL = { soleado: 'Soleado: nave en buen estado', nublado: 'Nublado: nave con desviaciones', tormenta: 'Tormenta: nave en malas condiciones' };

export default function JardinPage() {
  usePageMeta('Jardín', 'Planta digital que crece con tu diario de bienestar; el clima refleja el estado de la nave.');
  const { selected, myLogs, upsertLog, deleteLog, ship } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<DailyLog>(() => myLogs.find((l) => l.date === todayISO()) ?? blank(selected.id, todayISO()));
  const [range, setRange] = useState<Range>('semana');
  const [anchor, setAnchor] = useState(todayISO());
  const [toDelete, setToDelete] = useState<DailyLog | null>(null);
  const w = wellness(myLogs, selected.sleepGoal);
  const sScore = shipScore(ship); const weather = weatherFor(sScore);
  const stage = growthStage(myLogs.length, w?.score ?? 0);
  const [from, to] = useMemo(() => {
    if (range === 'dia') return [anchor, anchor];
    if (range === 'semana') return [shiftISO(anchor, -6), anchor];
    const d = anchor.slice(0, 8); const end = new Date(+anchor.slice(0, 4), +anchor.slice(5, 7), 0).getDate();
    return [d + '01', d + String(end).padStart(2, '0')];
  }, [range, anchor]);
  const inRange = myLogs.filter((l) => l.date >= from && l.date <= to);
  const avg = (f: (l: DailyLog) => number) => (inRange.length ? (inRange.reduce((s, l) => s + f(l), 0) / inRange.length).toFixed(1) : '-');
  const step = range === 'dia' ? 1 : range === 'semana' ? 7 : 30;
  const save = (l: DailyLog) => {
    const existed = myLogs.find((x) => x.date === l.date && x.id !== l.id);
    upsertLog({ ...l, profileId: selected.id });
    toast({ title: existed ? 'Registro reemplazado' : 'Registro guardado', description: `Día ${l.date} de ${selected.name}. La planta se actualizó.` });
    if (l.symptoms.some((s) => SYMPTOMS.find((x) => x.id === s)?.urgent)) toast({ title: 'Síntoma de alarma registrado', description: 'Revisa la página Crítico y contacta al cirujano de vuelo.', variant: 'destructive' });
  };
  return (
    <>
      <PageHead kicker={`Jardín de ${selected.name}`} title={selected.plantName || 'Mi planta'}><DemoTag text="Puntuaciones ilustrativas" /></PageHead>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="panel rise relative overflow-hidden">
            <div className="aspect-[400/320]"><PlantScene plant={selected.plant} climate={selected.climate} weather={weather} stage={stage} health={w?.score ?? 0} empty={!w} /></div>
            <div className="absolute left-3 top-3 rounded-lg bg-background/70 px-3 py-1.5 font-mono text-[11px] backdrop-blur" data-testid="text-weather">{W_LABEL[weather]} ({sScore})</div>
            {!w && <div className="absolute inset-x-0 bottom-0 bg-background/80 p-4 text-center backdrop-blur" data-testid="empty-garden"><Sprout className="mx-auto mb-1 h-6 w-6 text-accent" /><p className="font-display text-lg">Una semilla espera</p><p className="text-sm text-muted-foreground">Aún no hay registros. Guarda tu primer día para que germine.</p></div>}
          </div>
          {w && <div className="panel rise p-5">
            <div className="flex items-baseline justify-between"><h3 className="font-display text-lg">Por qué crece así</h3><span className="font-display text-3xl text-accent" data-testid="text-wellness">{w.score}</span></div>
            <p className="mb-3 text-xs text-muted-foreground">Salud de la planta = promedio ponderado de tus últimos {w.days} registros. Etapa {stage}/5 según cantidad de días registrados. El clima depende solo de la nave.</p>
            <div className="space-y-2">{w.parts.map((p) => <div key={p.label}><div className="flex justify-between text-xs"><span>{p.label} <span className="text-muted-foreground">x{p.weight}</span></span><span className="font-mono text-muted-foreground">{p.detail} · {p.value}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: p.value + '%' }} /></div></div>)}</div>
          </div>}
        </div>
        <div className="panel rise p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl">Diario del día</h2><Button size="sm" variant="ghost" onClick={() => setEditing(blank(selected.id, todayISO()))} data-testid="button-new-log">Nuevo</Button></div>
          <LogForm initial={editing} onSave={save} />
        </div>
      </div>
      <section className="panel rise mt-5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl">Historial</h2>
          <div className="flex gap-1 rounded-lg border border-border p-1">{(['dia', 'semana', 'mes'] as Range[]).map((r) => <button key={r} onClick={() => setRange(r)} data-testid={`range-${r}`} className={`rounded-md px-3 py-1 text-sm capitalize transition ${range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{r === 'dia' ? 'día' : r}</button>)}</div>
          <div className="ml-auto flex items-center gap-1"><Button size="icon" variant="ghost" onClick={() => setAnchor(shiftISO(anchor, -step))} data-testid="button-prev"><ChevronLeft /></Button><input type="date" value={anchor} onChange={(e) => e.target.value && setAnchor(e.target.value)} className="rounded-md border border-input bg-background/60 px-2 py-1 text-sm" data-testid="input-anchor" /><Button size="icon" variant="ghost" onClick={() => setAnchor(shiftISO(anchor, step))} data-testid="button-next"><ChevronRight /></Button></div>
        </div>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{from} a {to} · {inRange.length} registros</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">{[['Sueño h', avg((l) => l.sleepHours)], ['Agua L', avg((l) => l.hydration)], ['Ánimo', avg((l) => l.mood)], ['Estrés', avg((l) => l.stress)], ['Ejercicio min', avg((l) => l.exercise)]].map(([k, v]) => <div key={k} className="rounded-lg bg-secondary/70 p-3"><div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div><div className="font-display text-2xl" data-testid={`summary-${k}`}>{v}</div></div>)}</div>
        {inRange.length === 0 ? <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground" data-testid="empty-history">Sin registros en este periodo.</p> :
          <ul className="mt-4 divide-y divide-border">{inRange.map((l) => <li key={l.id} className="flex flex-wrap items-center gap-3 py-3" data-testid={`row-log-${l.date}`}>
            <span className="font-mono text-sm text-primary">{l.date}</span>
            <span className="text-sm text-muted-foreground">{l.sleepHours} h · ánimo {l.mood} · estrés {l.stress} · {l.hydration} L · {l.exercise} min{l.symptoms.length ? ' · ' + l.symptoms.length + ' síntomas' : ''}</span>
            <span className="w-full truncate text-xs text-muted-foreground sm:w-auto sm:flex-1">{l.notes}</span>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(l); window.scrollTo({ top: 0, behavior: 'smooth' }); }} data-testid={`button-edit-${l.date}`}><Pencil />Editar</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(l)} data-testid={`button-delete-${l.date}`}><Trash2 />Borrar</Button>
          </li>)}</ul>}
      </section>
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="bg-card"><AlertDialogHeader><AlertDialogTitle className="font-display">Borrar registro del {toDelete?.date}</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. La planta se recalculará.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete" onClick={() => { if (toDelete) { deleteLog(toDelete.id); toast({ title: 'Registro borrado' }); if (editing.id === toDelete.id) setEditing(blank(selected.id, todayISO())); } }}>Borrar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}
