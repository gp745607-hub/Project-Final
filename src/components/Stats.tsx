import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/index";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              {trendUp ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={trendUp ? "text-green-600" : "text-red-600"}>
                {trend}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, color, icon }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group"
    >
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color }}>
                {value}
              </p>
            </div>
            {icon && (
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: color ? `${color}15` : 'var(--muted)' }}
              >
                <div style={{ color }}>{icon}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface AlertCardProps {
  beneficiaire: {
    nom: string;
    prenom: string;
    categorie: string;
    codeBarre: string;
  };
  entree: string;
  duree: number;
}

export function AlertCard({ beneficiaire, entree, duree }: AlertCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <Card className="border-l-4 border-l-destructive transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {beneficiaire.prenom} {beneficiaire.nom}
                </p>
                <Badge variant="destructive" className="text-xs">
                  {formatDuration(duree)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Présence prolongée depuis {new Date(entree).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {beneficiaire.categorie}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {beneficiaire.codeBarre}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}