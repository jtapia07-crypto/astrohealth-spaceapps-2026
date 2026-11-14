import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';
import HealthPage from '@/pages/health';
import PerfilPage from '@/pages/perfil';
import NavePage from '@/pages/nave';
import JardinPage from '@/pages/jardin';
import MisionPage from '@/pages/mision';
import { Shell } from '@/components/shell';
import { StoreProvider } from '@/lib/store';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={HealthPage} />
          <Route path="/perfil" component={PerfilPage} />
          <Route path="/nave" component={NavePage} />
          <Route path="/critico"><Redirect to="/" replace /></Route>
          <Route path="/jardin" component={JardinPage} />
          <Route path="/mision" component={MisionPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
