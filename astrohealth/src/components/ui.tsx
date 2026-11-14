import type { ReactNode } from 'react';
import type { Status } from '../types';

export const Badge = ({ status }: { status: Status }) => <span className={`badge ${status.toLowerCase()}`}>{status}</span>;

export const Metric = ({ label, value, unit, status }: { label: string; value: string; unit: string; status: Status }) => (
  <div className={`metric ${status.toLowerCase()}`}>
    <div className="metric-top"><span className="metric-label">{label}</span><span className="dot" /></div>
    <div className="metric-value">{value}<small>{unit}</small></div>
    <Badge status={status} />
  </div>
);

export const Panel = ({ title, subtitle, status, children }: { title: string; subtitle: string; status: Status; children: ReactNode }) => (
  <section className={`panel ${status.toLowerCase()}`}>
    <header className="panel-head">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      <div className="panel-sem"><span className="sem-light" /><Badge status={status} /></div>
    </header>
    {children}
  </section>
);
