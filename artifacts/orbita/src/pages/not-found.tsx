import { Link } from 'wouter';
import { usePageMeta } from '@/hooks/use-page-meta';
export default function NotFound() {
  usePageMeta('Fuera de órbita', 'Página no encontrada.');
  return <div className="grid min-h-[50dvh] place-items-center text-center"><div><p className="font-mono text-primary">404 · SEÑAL PERDIDA</p><h1 className="font-display mt-2 text-4xl">Fuera de órbita</h1><Link href="/" className="mt-4 inline-block text-primary underline" data-testid="link-back-home">Volver al cuerpo</Link></div></div>;
}
