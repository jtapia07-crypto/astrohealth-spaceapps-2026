import { ArrowRight, TriangleAlert } from 'lucide-react';
import { LEVEL_COLOR, LEVEL_LABEL, type HotspotId, type HotspotReport } from '@/lib/health';

export function BiometricWarnings({ reports, onOpen }: { reports: HotspotReport[]; onOpen: (id: HotspotId) => void }) {
  const flagged = reports.filter((report) => report.level !== 'estable')
    .sort((a, b) => (a.level === 'alerta' ? 0 : 1) - (b.level === 'alerta' ? 0 : 1));
  if (!flagged.length) return null;
  return (
    <section aria-label="Biometric warnings" aria-live="polite" className="mb-4 space-y-2" data-testid="biometric-warnings">
      <h2 className="font-display flex items-center gap-2 text-lg font-semibold"><TriangleAlert className="h-5 w-5 text-chart-3" />Health warnings</h2>
      <p className="text-xs text-muted-foreground">Based on stored baselines, your latest log and simulated cabin data — not live measurements or diagnoses. Select a warning for values and next steps.</p>
      {flagged.map((report) => (
        <button key={report.id} type="button" data-testid={`warning-${report.id}`} onClick={() => onOpen(report.id)}
          aria-label={`${LEVEL_LABEL[report.level]}: ${report.label}. ${report.condition} Open report`}
          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 ${report.level === 'alerta' ? 'border-destructive/60 bg-destructive/10 focus-visible:outline-destructive' : 'border-chart-3/50 bg-chart-3/10 focus-visible:outline-chart-3'}`}>
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" style={{ color: LEVEL_COLOR[report.level] }} />
          <span className="min-w-0 flex-1">
            <span className="font-display block font-semibold" style={{ color: LEVEL_COLOR[report.level] }}>{LEVEL_LABEL[report.level]} · {report.label}</span>
            <span className="mt-1 block break-words text-sm">{report.condition}</span>
            <span className="mt-2 block text-xs text-muted-foreground">View values, strategies and recommendations</span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
        </button>
      ))}
    </section>
  );
}
