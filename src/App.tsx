import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ROUTE_PATHS } from "@/lib/index";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Beneficiaires from "@/pages/Beneficiaires";
import Pointage from "@/pages/Pointage";
import Badges from "@/pages/Badges";
import Services from "@/pages/Services";
import Rapports from "@/pages/Rapports";
import Audit from "@/pages/Audit";
import Archives from "@/pages/Archives";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MotionConfig reducedMotion="user">
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route
              path={ROUTE_PATHS.HOME}
              element={
                <ProtectedRoute>
                  <Navigate to={ROUTE_PATHS.DASHBOARD} replace />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.LOGIN}
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.BENEFICIAIRES}
              element={
                <ProtectedRoute>
                  <Beneficiaires />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.POINTAGE}
              element={
                <ProtectedRoute>
                  <Pointage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.BADGES}
              element={
                <ProtectedRoute>
                  <Badges />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.SERVICES}
              element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.RAPPORTS}
              element={
                <ProtectedRoute>
                  <Rapports />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.AUDIT}
              element={
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATHS.ARCHIVES}
              element={
                <ProtectedRoute>
                  <Archives />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-muted-foreground mb-8">Page non trouvée</p>
                  <a
                    href="#/dashboard"
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Retour au tableau de bord
                  </a>
                </div>
              }
            />
          </Routes>
        </HashRouter>
      </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;