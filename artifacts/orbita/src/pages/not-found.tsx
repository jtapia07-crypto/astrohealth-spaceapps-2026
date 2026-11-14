import { Link } from 'wouter';
import { usePageMeta } from '@/hooks/use-page-meta';
export default function NotFound() {
  usePageMeta('Out of orbit', 'Page not found.');
  return <div className="grid min-h-[50dvh] place-items-center text-center"><div><p className="font-mono text-primary">404 · SIGNAL LOST</p><h1 className="font-display mt-2 text-4xl">Out of orbit</h1><Link href="/" className="mt-4 inline-block text-primary underline" data-testid="link-back-home">Back to the body</Link></div></div>;
}
