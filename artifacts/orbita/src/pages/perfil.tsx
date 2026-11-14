import { useEffect, useState } from 'react';
import { Download, Plus, Save, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DemoTag, PageHead } from '@/components/shell';
import { useStore } from '@/lib/store';
import { exportAll } from '@/lib/storage';
import type { Climate, PlantType, Profile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/use-page-meta';

const PLANTS: { v: PlantType; l: string }[] = [{ v: 'helecho', l: 'Helecho' }, { v: 'girasol', l: 'Girasol' }, { v: 'suculenta', l: 'Suculenta' }, { v: 'bonsai', l: 'Bonsái' }];
const CLIMATES: { v: Climate; l: string }[] = [{ v: 'bosque', l: 'Bosque templado' }, { v: 'desierto', l: 'Desierto' }, { v: 'tropical', l: 'Tropical' }, { v: 'tundra', l: 'Tundra' }];

function Confirm({ trigger, title, desc, onOk, label }: { trigger: React.ReactNode; title: string; desc: string; onOk: () => void; label: string }) {
  return <AlertDialog><AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger><AlertDialogContent className="bg-card"><AlertDialogHeader><AlertDialogTitle className="font-display">{title}</AlertDialogTitle><AlertDialogDescription>{desc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={onOk} data-testid="button-confirm">{label}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export default function PerfilPage() {
  usePageMeta('Perfil', 'Historial de salud editable del astronauta y preferencias del jardín, guardado solo en este dispositivo.');
  const { selected, updateProfile, addProfile, removeProfile, resetAll, crew, selectId } = useStore();
  const { toast } = useToast();
  const [f, setF] = useState<Profile>(selected);
  useEffect(() => setF(selected), [selected]);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setF((p) => ({ ...p, [k]: v }));
  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never);
  const txt = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never);
  const saveIt = () => { if (!f.name.trim()) { toast({ title: 'El nombre es obligatorio', variant: 'destructive' }); return; } updateProfile(f); toast({ title: 'Perfil guardado', description: `Los cambios de ${f.name} ya se reflejan en el cuerpo, alertas y jardín.` }); };
  const doExport = () => { const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orbita-datos-locales.json'; a.click(); URL.revokeObjectURL(a.href); toast({ title: 'Datos exportados' }); };
  const field = (id: keyof Profile, label: string, type: 'text' | 'number' = 'text', step?: string) => (
    <div className="space-y-1.5"><Label htmlFor={id} className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input id={id} type={type} step={step} value={String(f[id])} onChange={type === 'number' ? num(id) : txt(id)} data-testid={`input-${id}`} className="bg-background/60" /></div>
  );
  return (
    <>
      <PageHead kicker="Expediente de tripulante" title="Perfil">
        <div className="flex flex-wrap gap-2">
          <select value={selected.id} onChange={(e) => selectId(e.target.value)} data-testid="select-profile" className="rounded-md border border-input bg-card px-3 py-2 text-sm">{crew.map((c) => <option key={c.id} value={c.id}>{c.name}{c.demo ? ' (demo)' : ''}</option>)}</select>
          <Button variant="secondary" onClick={() => { addProfile(); toast({ title: 'Perfil nuevo creado', description: 'Usa datos ficticios.' }); }} data-testid="button-add-profile"><Plus />Nuevo perfil</Button>
        </div>
      </PageHead>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-chart-3/40 bg-chart-3/10 p-4 text-sm text-chart-3"><TriangleAlert className="h-5 w-5 shrink-0" />Información sensible: se guarda solo en el almacenamiento local de este navegador. Recomendamos usar datos ficticios. {selected.demo && 'Este es un perfil de demostración; puedes editarlo.'}</div>
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="panel rise space-y-4 p-5 lg:col-span-2">
          <h2 className="font-display text-xl">Identidad y antecedentes {selected.demo && <DemoTag text="Demostración" />}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{field('name', 'Nombre')}{field('age', 'Edad', 'number')}{field('role', 'Rol')}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['conditions', 'allergies', 'medications'] as const).map((k) => <div key={k} className="space-y-1.5"><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{{ conditions: 'Condiciones médicas', allergies: 'Alergias', medications: 'Medicaciones' }[k]}</Label><Textarea value={f[k]} onChange={txt(k)} data-testid={`input-${k}`} className="min-h-20 bg-background/60" /></div>)}
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Grupo sanguíneo</Label><select value={f.bloodGroup} onChange={txt('bloodGroup') as never} data-testid="select-blood" className="w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm">{['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((g) => <option key={g}>{g}</option>)}</select></div>
          </div>
          <h3 className="font-display pt-2 text-lg">Signos vitales basales</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{field('hr', 'FC (lpm)', 'number')}{field('sbp', 'Sistólica', 'number')}{field('dbp', 'Diastólica', 'number')}{field('spo2', 'SpO2 %', 'number')}{field('temp', 'Temp °C', 'number', '0.1')}{field('weight', 'Peso kg', 'number', '0.1')}{field('sleepGoal', 'Meta sueño h', 'number', '0.5')}</div>
          <p className="text-xs text-muted-foreground">Ideas de control antes del vuelo: densidad ósea, agudeza visual, audición, salud dental, vacunas y evaluación psicológica. Aquí solo se registran como referencia educativa.</p>
        </section>
        <section className="panel rise space-y-4 p-5">
          <h2 className="font-display text-xl">Jardín personal</h2>
          {field('plantName', 'Nombre de la planta')}
          <div><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Planta</Label><div className="mt-2 grid grid-cols-2 gap-2">{PLANTS.map((p) => <button key={p.v} onClick={() => set('plant', p.v)} data-testid={`button-plant-${p.v}`} className={`rounded-lg border p-2 text-sm transition ${f.plant === p.v ? 'border-accent bg-accent/15 text-accent' : 'border-border hover:border-accent/50'}`}>{p.l}</button>)}</div></div>
          <div><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Ambiente / clima</Label><div className="mt-2 grid grid-cols-2 gap-2">{CLIMATES.map((p) => <button key={p.v} onClick={() => set('climate', p.v)} data-testid={`button-climate-${p.v}`} className={`rounded-lg border p-2 text-sm transition ${f.climate === p.v ? 'border-accent bg-accent/15 text-accent' : 'border-border hover:border-accent/50'}`}>{p.l}</button>)}</div></div>
          <Button className="w-full" onClick={saveIt} data-testid="button-save-profile"><Save />Guardar perfil</Button>
          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Datos locales</h3>
            <Button variant="outline" className="w-full" onClick={doExport} data-testid="button-export"><Download />Exportar JSON</Button>
            {!selected.demo && <Confirm trigger={<Button variant="outline" className="w-full text-destructive" data-testid="button-delete-profile"><Trash2 />Eliminar este perfil</Button>} title="Eliminar perfil" desc="Se borrarán este perfil y sus registros diarios de este dispositivo." label="Eliminar" onOk={() => { removeProfile(selected.id); toast({ title: 'Perfil eliminado' }); }} />}
            <Confirm trigger={<Button variant="outline" className="w-full text-destructive" data-testid="button-wipe"><Trash2 />Borrar todos los datos locales</Button>} title="Borrar todos los datos" desc="Se eliminarán perfiles, diarios, nave, misión y alertas de este navegador, y se restaurará la demostración." label="Borrar todo" onOk={() => { resetAll(); toast({ title: 'Datos locales borrados' }); }} />
          </div>
        </section>
      </div>
    </>
  );
}
