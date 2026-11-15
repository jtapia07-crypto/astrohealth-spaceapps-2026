import cockpit from '@/assets/ship/cockpit-interior.webp';

export type InteriorModule = { id: string; short: string; label: string; ok: boolean };

export function ShipInterior({ modules, active, onSelect }: { modules: InteriorModule[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="relative mt-2 w-full overflow-hidden rounded-xl border border-border" data-testid="ship-interior-scene">
      <img src={cockpit} alt="Illustrative spacecraft cockpit interior with a curved control console facing a window over Earth" className="block aspect-[4/3] w-full object-cover sm:aspect-square" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[hsl(226_45%_7%/.55)] to-transparent" />
      <div className="absolute inset-x-[2%] top-[58%] sm:inset-x-[4%] sm:top-[59%]">
        <div role="group" aria-label="Ship compartments" className="flex items-stretch justify-center gap-1 rounded-[999px] border-2 border-[hsl(224_30%_30%)] bg-[hsl(226_35%_14%/.78)] px-3 py-2 shadow-[0_12px_30px_-12px_hsl(226_60%_3%/.9)] backdrop-blur-sm sm:gap-2 sm:px-8 sm:py-4">
          {modules.map((m) => {
            const on = m.id === active;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                aria-label={`${m.label}: ${m.ok ? 'within range' : 'out of range'}`}
                onClick={() => onSelect(m.id)}
                data-testid={`module-${m.id}`}
                className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border-2 px-0.5 py-2 transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(226_35%_14%)] sm:min-h-20 sm:rounded-[10px] ${on ? 'border-[hsl(22_95%_58%)] bg-[hsl(22_95%_58%/.2)]' : m.ok ? 'border-[hsl(172_58%_48%/.6)] bg-[hsl(224_34%_18%)] hover:border-[hsl(172_58%_48%)]' : 'border-[hsl(352_82%_58%)] bg-[hsl(224_34%_18%)]'}`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {!m.ok && <span className="absolute inset-0 animate-ping rounded-full bg-[hsl(352_82%_60%)] opacity-70" />}
                  <span className={`relative h-2.5 w-2.5 rounded-full ${m.ok ? 'bg-[hsl(172_58%_52%)]' : 'bg-[hsl(352_82%_60%)]'}`} />
                </span>
                <span className="font-display max-w-full truncate text-[9px] font-semibold text-[hsl(40_33%_91%)] min-[400px]:text-[10px] sm:text-xs">{m.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
