import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  ScanLine, 
  CreditCard, 
  FileText, 
  Shield, 
  Archive,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { path: ROUTE_PATHS.DASHBOARD, label: 'Tableau de bord', icon: LayoutDashboard },
  { path: ROUTE_PATHS.BENEFICIAIRES, label: 'Bénéficiaires', icon: Users },
  { path: ROUTE_PATHS.POINTAGE, label: 'Pointage', icon: ScanLine },
  { path: ROUTE_PATHS.BADGES, label: 'Badges', icon: CreditCard },
  { path: ROUTE_PATHS.SERVICES, label: 'Services', icon: FileText },
  { path: ROUTE_PATHS.RAPPORTS, label: 'Rapports', icon: FileText },
  { path: ROUTE_PATHS.AUDIT, label: 'Journal d\'audit', icon: Shield },
  { path: ROUTE_PATHS.ARCHIVES, label: 'Archives', icon: Archive },
];

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-sidebar border-r border-sidebar-border flex flex-col relative"
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <motion.div
            initial={false}
            animate={{ opacity: sidebarOpen ? 1 : 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <img 
                src={IMAGES.HUMANITARIAN_HERO_1} 
                alt="ONG MADE" 
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">ONG MADE</h1>
                <p className="text-xs text-muted-foreground">Madagascar Assistance</p>
              </div>
            )}
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 rounded-full bg-sidebar-primary-foreground"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {user?.name.charAt(0) || 'A'}
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'Administrateur'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'admin@made.org'}
                </p>
              </motion.div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full mt-2 justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {sidebarOpen && <span>Déconnexion</span>}
          </Button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Système de Gestion Humanitaire</h2>
            <p className="text-sm text-muted-foreground">Antananarivo, Madagascar</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}