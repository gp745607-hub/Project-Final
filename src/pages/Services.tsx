import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ServiceModule } from '@/components/ServiceModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Coffee, Heart, TrendingUp, Users, Calendar } from 'lucide-react';
import { SERVICE_TYPES } from '@/lib/index';
import { motion } from 'framer-motion';

const mockStats = {
  CANTINE: {
    today: 142,
    week: 856,
    trend: '+12%',
    avgPerDay: 122
  },
  GARGOTE: {
    today: 89,
    week: 534,
    trend: '+8%',
    avgPerDay: 76
  },
  MEDICAL: {
    today: 23,
    week: 147,
    trend: '+5%',
    avgPerDay: 21
  }
};

const serviceIcons = {
  CANTINE: UtensilsCrossed,
  GARGOTE: Coffee,
  MEDICAL: Heart
};

export default function Services() {
  const [activeTab, setActiveTab] = useState<'CANTINE' | 'GARGOTE' | 'MEDICAL'>('CANTINE');

  const currentStats = mockStats[activeTab];
  const ServiceIcon = serviceIcons[activeTab];

  return (
    <Layout>
      <div className="w-full p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Services</h1>
              <p className="text-muted-foreground mt-1">
                Suivi des services de cantine, gargote et médical
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
                <ServiceIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats.today}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-medium">{currentStats.trend}</span> vs hier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats.week}</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne: {currentStats.avgPerDay}/jour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tendance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{currentStats.trend}</div>
                <p className="text-xs text-muted-foreground">
                  Croissance hebdomadaire
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Services Disponibles</CardTitle>
              <CardDescription>
                Sélectionnez un service pour gérer les distributions et consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <TabsList className="grid w-full grid-cols-3">
                  {SERVICE_TYPES.map((service) => {
                    const Icon = serviceIcons[service.value];
                    return (
                      <TabsTrigger
                        key={service.value}
                        value={service.value}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {service.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {SERVICE_TYPES.map((service) => (
                  <TabsContent key={service.value} value={service.value} className="mt-6">
                    <ServiceModule serviceType={service.value} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
