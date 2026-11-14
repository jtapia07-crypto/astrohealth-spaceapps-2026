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

const PLANTS: { v: PlantType; l: string }[] = [{ v: 'helecho', l: 'Fern' }, { v: 'girasol', l: 'Sunflower' }, { v: 'suculenta', l: 'Succulent' }, { v: 'bonsai', l: 'Bonsai' }];
const CLIMATES: { v: Climate; l: string }[] = [{ v: 'bosque', l: 'Temperate forest' }, { v: 'desierto', l: 'Desert' }, { v: 'tropical', l: 'Tropical' }, { v: 'tundra', l: 'Tundra' }];

function Confirm({ trigger, title, desc, onOk, label }: { trigger: React.ReactNode; title: string; desc: string; onOk: () => void; label: string }) {
  return <AlertDialog><AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger><AlertDialogContent className="bg-card"><AlertDialogHeader><AlertDialogTitle className="font-display">{title}</AlertDialogTitle><AlertDialogDescription>{desc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={onOk} data-testid="button-confirm">{label}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export default function PerfilPage() {
  usePageMeta('Profile', 'Editable astronaut health history and garden preferences, saved only on this device.');
  const { selected, updateProfile, addProfile, removeProfile, resetAll, crew, selectId } = useStore();
  const { toast } = useToast();
  const [f, setF] = useState<Profile>(selected);
  useEffect(() => setF(selected), [selected]);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setF((p) => ({ ...p, [k]: v }));
  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never);
  const txt = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never);
  const saveIt = () => { if (!f.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; } updateProfile(f); toast({ title: 'Profile saved', description: `Changes for ${f.name} are now reflected in the body map, alerts and garden.` }); };
  const doExport = () => { const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'astrohealth-guardian-local-data.json'; a.click(); URL.revokeObjectURL(a.href); toast({ title: 'Data exported' }); };
  const field = (id: keyof Profile, label: string, type: 'text' | 'number' = 'text', step?: string) => (
    <div className="space-y-1.5"><Label htmlFor={id} className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input id={id} type={type} step={step} value={String(f[id])} onChange={type === 'number' ? num(id) : txt(id)} data-testid={`input-${id}`} className="bg-background/60" /></div>
  );
  return (
    <>
      <PageHead kicker="Crew member record" title="Profile">
        <div className="flex flex-wrap gap-2">
          <select value={selected.id} onChange={(e) => selectId(e.target.value)} data-testid="select-profile" aria-label="Select profile" className="rounded-md border border-input bg-card px-3 py-2 text-sm">{crew.map((c) => <option key={c.id} value={c.id}>{c.name}{c.demo ? ' (demo)' : ''}</option>)}</select>
          <Button variant="secondary" onClick={() => { addProfile(); toast({ title: 'New profile created', description: 'Use fictional data.' }); }} data-testid="button-add-profile"><Plus />New profile</Button>
        </div>
      </PageHead>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-chart-3/40 bg-chart-3/10 p-4 text-sm text-chart-3"><TriangleAlert className="h-5 w-5 shrink-0" />Sensitive information: stored only in this browser's local storage. We recommend using fictional data. {selected.demo && 'This is a demo profile; you can edit it.'}</div>
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="panel rise space-y-4 p-5 lg:col-span-2">
          <h2 className="font-display text-xl">Identity and history {selected.demo && <DemoTag text="Demo" />}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{field('name', 'Name')}{field('age', 'Age', 'number')}{field('role', 'Role')}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['conditions', 'allergies', 'medications'] as const).map((k) => <div key={k} className="space-y-1.5"><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{{ conditions: 'Medical conditions', allergies: 'Allergies', medications: 'Medications' }[k]}</Label><Textarea aria-label={{ conditions: 'Medical conditions', allergies: 'Allergies', medications: 'Medications' }[k]} value={f[k]} onChange={txt(k)} data-testid={`input-${k}`} className="min-h-20 bg-background/60" /></div>)}
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Blood group</Label><select value={f.bloodGroup} onChange={txt('bloodGroup') as never} data-testid="select-blood" aria-label="Blood group" className="w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm">{['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((g) => <option key={g}>{g}</option>)}</select></div>
          </div>
          <h3 className="font-display pt-2 text-lg">Baseline vital signs</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{field('hr', 'HR (bpm)', 'number')}{field('sbp', 'Systolic', 'number')}{field('dbp', 'Diastolic', 'number')}{field('spo2', 'SpO2 %', 'number')}{field('temp', 'Temp °C', 'number', '0.1')}{field('weight', 'Weight kg', 'number', '0.1')}{field('sleepGoal', 'Sleep goal h', 'number', '0.5')}</div>
          <p className="text-xs text-muted-foreground">Pre-flight check ideas: bone density, visual acuity and eye exams, hearing, dental health, vaccines and psychological evaluation. Listed here only as an educational reference.</p>
        </section>
        <section className="panel rise space-y-4 p-5">
          <h2 className="font-display text-xl">Personal garden</h2>
          {field('plantName', 'Plant name')}
          <div><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Plant</Label><div className="mt-2 grid grid-cols-2 gap-2">{PLANTS.map((p) => <button key={p.v} onClick={() => set('plant', p.v)} data-testid={`button-plant-${p.v}`} className={`rounded-lg border p-2 text-sm transition ${f.plant === p.v ? 'border-accent bg-accent/15 text-accent' : 'border-border hover:border-accent/50'}`}>{p.l}</button>)}</div></div>
          <div><Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Environment / climate</Label><div className="mt-2 grid grid-cols-2 gap-2">{CLIMATES.map((p) => <button key={p.v} onClick={() => set('climate', p.v)} data-testid={`button-climate-${p.v}`} className={`rounded-lg border p-2 text-sm transition ${f.climate === p.v ? 'border-accent bg-accent/15 text-accent' : 'border-border hover:border-accent/50'}`}>{p.l}</button>)}</div></div>
          <Button className="w-full" onClick={saveIt} data-testid="button-save-profile"><Save />Save profile</Button>
          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Local data</h3>
            <Button variant="outline" className="w-full" onClick={doExport} data-testid="button-export"><Download />Export JSON</Button>
            {!selected.demo && <Confirm trigger={<Button variant="outline" className="w-full text-destructive" data-testid="button-delete-profile"><Trash2 />Delete this profile</Button>} title="Delete profile" desc="This profile and its daily logs will be removed from this device." label="Delete" onOk={() => { removeProfile(selected.id); toast({ title: 'Profile deleted' }); }} />}
            <Confirm trigger={<Button variant="outline" className="w-full text-destructive" data-testid="button-wipe"><Trash2 />Delete all local data</Button>} title="Delete all data" desc="Profiles, journals, ship, mission and alerts will be removed from this browser and the demo will be restored." label="Delete all" onOk={() => { resetAll(); toast({ title: 'Local data deleted' }); }} />
          </div>
        </section>
      </div>
    </>
  );
}
