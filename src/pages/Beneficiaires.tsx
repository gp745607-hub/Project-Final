import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  UserPlus, 
  Filter, 
  MoreHorizontal, 
  FileEdit, 
  Archive,
  UserCheck
} from 'lucide-react'
import { 
  DB_KEYS, 
  formatDate, 
  getCategorieColor, 
  generateCodeBarre 
} from '@/lib/index'
import type { Beneficiaire } from '@/lib/index'

export default function BeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(DB_KEYS.BENEFICIAIRES)
    setBeneficiaires(saved ? JSON.parse(saved) : [])
  }, [])

  const filtered = useMemo(() => {
    return beneficiaires
      .filter(b => !b.archive)
      .filter(b => 
        b.nom.toLowerCase().includes(search.toLowerCase()) || 
        b.prenom.toLowerCase().includes(search.toLowerCase()) ||
        b.codeBarre.includes(search)
      )
  }, [beneficiaires, search])

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Bénéficiaires</h1>
            <p className="text-slate-500 font-medium">Gérez la base de données des membres de l'ONG.</p>
          </div>
          <Button className="rounded-2xl gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            <UserPlus size={18}/> Nouveau Bénéficiaire
          </Button>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Rechercher par nom ou matricule..." 
                  className="pl-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="rounded-2xl gap-2 border-slate-200 text-slate-600">
                <Filter size={18}/> Filtres
              </Button>
            </div>

            <div className="space-y-3">
              {filtered.map((b) => (
                <div 
                  key={b.id} 
                  className="flex items-center justify-between p-4 rounded-[1.5rem] border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                      {b.photo ? (
                        <img 
                          src={b.photo} 
                          alt={`Portrait de ${b.prenom} ${b.nom}`} 
                          title={`Photo de profil : ${b.nom}`}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <UserCheck className="text-slate-300" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 uppercase text-sm">{b.nom} {b.prenom}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {b.codeBarre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Inscrit le {formatDate(b.dateInscription)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: getCategorieColor(b.categorie) } as React.CSSProperties}
                        title={`Catégorie : ${b.categorie}`}
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                        {b.categorie}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:text-indigo-600 shadow-none">
                        <FileEdit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-600 shadow-none">
                        <Archive size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-400 font-medium">Aucun résultat trouvé pour votre recherche.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}