import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Compass,
  Building,
  FileText,
  Download,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Empreendimentos() {
  const [developments, setDevelopments] = useState<any[]>([])
  const [developers, setDevelopers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [devs, devsComp] = await Promise.all([
        pb.collection('developments').getFullList({ expand: 'developer', sort: '-created' }),
        pb.collection('developers').getFullList(),
      ])
      setDevelopments(devs)
      setDevelopers(devsComp)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Empreendimentos & Construtoras
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Hierarquia de Construtora → Empreendimento com arquivos técnicos, memorial descritivo e
          tabelas de vendas.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
          <p className="text-xs">Carregando empreendimentos...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {developments.map((dev) => (
            <Card key={dev.id} className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-700">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{dev.name}</h2>
                      <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-xs">
                        {dev.disponibilidade || 'Ativo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {dev.address || `${dev.city} - ${dev.bairro}`} • Construtora:{' '}
                      <strong>{dev.expand?.developer?.name || 'Vokkan'}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[11px]">Previsão de Entrega:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {dev.delivery_date
                      ? new Date(dev.delivery_date).toLocaleDateString('pt-BR')
                      : 'Dezembro / 2026'}
                  </span>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {dev.description ||
                    'Empreendimento de alto padrão com infraestrutura completa e conceito inovador de bem-estar.'}
                </p>

                {/* Arquivos e Materiais Oficiais */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    Acervo de Documentos Técnicos & Comerciais
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Tabela Comercial 2025
                          </p>
                          <p className="text-[10px] text-slate-400">PDF • 2.4 MB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-teal-700">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Memorial Descritivo
                          </p>
                          <p className="text-[10px] text-slate-400">PDF • 4.8 MB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-teal-700">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Plantas Humanizadas
                          </p>
                          <p className="text-[10px] text-slate-400">PDF • 1.2 MB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-teal-700">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
