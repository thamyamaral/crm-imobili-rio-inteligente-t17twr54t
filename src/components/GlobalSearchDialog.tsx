import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Search,
  Users,
  Building2,
  DollarSign,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SearchResultItem {
  id: string
  type: 'contact' | 'property' | 'deal' | 'contract' | 'task' | 'development'
  title: string
  subtitle: string
  url: string
  badge?: string
}

interface GlobalSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const GlobalSearchDialog: React.FC<GlobalSearchDialogProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      return
    }
  }, [open])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = query.trim().replace(/['"]/g, '')
      if (q.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const items: SearchResultItem[] = []

        // 1. Busca em contatos
        try {
          const contacts = await pb.collection('contacts').getList(1, 4, {
            filter: `name ~ "${q}" || phone ~ "${q}" || email ~ "${q}" || city ~ "${q}"`,
          })
          contacts.items.forEach((c) => {
            items.push({
              id: c.id,
              type: 'contact',
              title: c.name,
              subtitle: `${c.type?.toUpperCase()} • ${c.phone || c.city || 'Sem telefone'}`,
              url: `/contatos?select=${c.id}`,
              badge: c.temperature || 'Contato',
            })
          })
        } catch {
          /* intentionally ignored */
        }

        // 2. Busca em imóveis
        try {
          const props = await pb.collection('properties').getList(1, 4, {
            filter: `title ~ "${q}" || city ~ "${q}" || bairro ~ "${q}" || matricula ~ "${q}"`,
          })
          props.items.forEach((p) => {
            items.push({
              id: p.id,
              type: 'property',
              title: p.title,
              subtitle: `${p.city} - ${p.bairro} • R$ ${Number(p.price || 0).toLocaleString('pt-BR')}`,
              url: `/imoveis?search=${encodeURIComponent(p.title)}`,
              badge: p.is_captacao ? 'Captação' : 'Imóvel',
            })
          })
        } catch {
          /* intentionally ignored */
        }

        // 3. Busca em empreendimentos
        try {
          const devs = await pb.collection('developments').getList(1, 3, {
            filter: `name ~ "${q}" || city ~ "${q}" || bairro ~ "${q}"`,
          })
          devs.items.forEach((d) => {
            items.push({
              id: d.id,
              type: 'development',
              title: d.name,
              subtitle: `Empreendimento • ${d.city}/${d.bairro}`,
              url: `/imoveis/empreendimentos`,
              badge: 'Empreendimento',
            })
          })
        } catch {
          /* intentionally ignored */
        }

        // 4. Busca em negócios
        try {
          const deals = await pb.collection('deals').getList(1, 3, {
            filter: `title ~ "${q}"`,
          })
          deals.items.forEach((d) => {
            items.push({
              id: d.id,
              type: 'deal',
              title: d.title,
              subtitle: `Negócio no Funil • R$ ${Number(d.value || 0).toLocaleString('pt-BR')}`,
              url: `/funis`,
              badge: 'Negócio',
            })
          })
        } catch {
          /* intentionally ignored */
        }

        setResults(items)
      } catch (err) {
        console.error('Erro na busca global:', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (url: string) => {
    onOpenChange(false)
    navigate(url)
  }

  const getItemIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'contact':
        return <Users className="w-4 h-4 text-teal-600" />
      case 'property':
        return <Building2 className="w-4 h-4 text-blue-600" />
      case 'development':
        return <Layers className="w-4 h-4 text-indigo-600" />
      case 'deal':
        return <DollarSign className="w-4 h-4 text-emerald-600" />
      case 'contract':
        return <FileText className="w-4 h-4 text-amber-600" />
      case 'task':
        return <Calendar className="w-4 h-4 text-purple-600" />
      default:
        return <Search className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-white border-slate-200">
        <DialogHeader className="sr-only">
          <DialogTitle>Busca Global</DialogTitle>
        </DialogHeader>

        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por contato, telefone, imóvel, negócio, construtora, matrícula..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base shadow-none placeholder:text-slate-400"
            autoFocus
          />
          {loading && <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />}
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-50">
          {query.trim().length < 2 ? (
            <div className="p-6 text-center text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto text-teal-600/40 mb-2" />
              <p className="text-sm font-medium">Busca Inteligente Unificada</p>
              <p className="text-xs text-slate-400 mt-1">
                Digite pelo menos 2 letras para pesquisar contatos, empreendimentos, imóveis ou
                negócios.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-slate-100"
                  onClick={() => setQuery('Rodrigo')}
                >
                  Dr. Rodrigo
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-slate-100"
                  onClick={() => setQuery('Viva Park')}
                >
                  Viva Park
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-slate-100"
                  onClick={() => setQuery('Itapema')}
                >
                  Itapema
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-slate-100"
                  onClick={() => setQuery('Investidor')}
                >
                  Investidor
                </Badge>
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhum registro encontrado para <strong className="text-slate-800">"{query}"</strong>.
            </div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item.url)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-md bg-slate-100 shrink-0 group-hover:bg-white group-hover:shadow-xs transition">
                    {getItemIcon(item.type)}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-teal-700">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {item.badge && (
                    <Badge variant="secondary" className="text-[10px] font-medium capitalize">
                      {item.badge}
                    </Badge>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Dica: Use <strong>Ctrl + K</strong> para abrir a qualquer momento
          </span>
          <span>HouseOS • Corretora Autônoma</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
