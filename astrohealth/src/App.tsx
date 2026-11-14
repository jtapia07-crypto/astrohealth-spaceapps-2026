import { useState } from 'react';
import Dashboard from './components/Dashboard';
import TriageGuide from './components/TriageGuide';
import AstroFlora from './components/AstroFlora';
import Home, { type TabId } from './components/Home';
import { Badge } from './components/ui';
import { useMission } from './context/MissionContext';
import { useCrewLog } from './hooks/useCrewLog';
import { SCENARIOS } from './utils/scenarios';

export default function App() {
  const [tab, setTab] = useState<TabId>('home');
  const [menu, setMenu] = useState<'tele' | 'sim' | null>(null);
  const { evaluation: ev, data, scenario, setScenario } = useMission();
  const sol = data.env.daysInConfinement;
  const crew = useCrewLog(ev, sol);
  const pick = (t: TabId) => { setTab(t); setMenu(null); };
  const Tab = ({ id, children }: { id: TabId; children: string }) => <button className={tab === id ? 'active' : ''} onClick={() => pick(id)}>{children}</button>;
  return (
    <div className="app">
      <header className="top">
        <div className="brand"><span className="logo">◈</span><h1>AstroHealth</h1><Badge status={ev.overall} /></div>
        <nav className="nav">
          <Tab id="home">Inicio</Tab>
          <div className="dd" onMouseEnter={() => setMenu('tele')} onMouseLeave={() => setMenu(null)}>
            <button className={tab === 'bio' || tab === 'env' ? 'active' : ''} onClick={() => setMenu(menu === 'tele' ? null : 'tele')}>Telemetría Detallada ▾</button>
            {menu === 'tele' && <div className="dd-menu"><button onClick={() => pick('bio')}>Biometría Interna</button><button onClick={() => pick('env')}>Peligros Externos HRP</button></div>}
          </div>
          <Tab id="triage">Triaje & Protocolos</Tab>
          <Tab id="flora">AstroFlora & Bitácora</Tab>
        </nav>
        <div className="dd right" onMouseLeave={() => setMenu(null)}>
          <button className="neon small" onClick={() => setMenu(menu === 'sim' ? null : 'sim')}>Simular Evento ▾</button>
          {menu === 'sim' && <div className="dd-menu">{SCENARIOS.map(s => <button key={s.id} className={scenario === s.id ? 'sel' : ''} onClick={() => { setScenario(s.id); setMenu(null); }}>{s.label}</button>)}</div>}
        </div>
      </header>
      <main key={tab} className="view">
        {tab === 'home' && <Home go={pick} />}
        {tab === 'bio' && <Dashboard view="bio" />}
        {tab === 'env' && <Dashboard view="env" />}
        {tab === 'triage' && <TriageGuide />}
        {tab === 'flora' && <AstroFlora {...crew} sol={sol} />}
      </main>
    </div>
  );
}
