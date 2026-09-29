import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { ContactImportModal } from '@/components/ContactImportModal'
import { ContactSlideOver } from '@/components/ContactSlideOver'
import {
  Search,
  Filter,
  Plus,
  UploadCloud,
  Download,
  MessageSquare,
  Phone,
  Flame,
  ArrowUpDown,
  Calendar,
  Sparkles,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Contatos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [contacts, setContacts] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('todos')
  const [selectedTemp, setSelectedTemp] = useState<string>(
    searchParams.get('temperatura') || 'todos',
  )
  const [selectedCity, setSelectedCity] = useState<string>('todos')

  // Modais
  const [importOpen, setImportOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    searchParams.get('select') || null,
  )
  const [newContactModal, setNewContactModal] = useState(searchParams.get('novo') === 'true')

  // Novo Contato Form
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newCity, setNewCity] = useState('Porto Belo')
  const [newType, setNewType] = useState('lead')
  const [newTemp, setNewTemp] = useState('quente')
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)

  const loadData = async () => {
    try {
      const [contRes, tagRes] = await Promise.all([
        pb.collection('contacts').getFullList({ expand: 'tags,campaign', sort: '-created' }),
        pb.collection('tags').getFullList(),
      ])
      setContacts(contRes)
      setTags(tagRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('contacts', loadData)

  // Listas inteligentes salvas (filtros rápidos pré-definidos)
  const applyQuickFilter = (type: string) => {
    if (type === '30dias') {
      // Clientes sem contato recente
      setSelectedType('todos')
      setSelectedTemp('morno')
    } else if (type === 'investidores') {
      setSelectedType('investidor')
      setSelectedCity('Porto Belo')
    } else if (type === 'sem_resposta') {
      setSelectedType('lead')
      setSelectedTemp('quente')
    } else {
      setSelectedType('todos')
      setSelectedTemp('todos')
      setSelectedCity('todos')
      setSearch('')
    }
  }

  // Filtragem local
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase())

    const matchesType = selectedType === 'todos' || c.type === selectedType
    const matchesTemp = selectedTemp === 'todos' || c.temperature === selectedTemp
    const matchesCity = selectedCity === 'todos' || c.city === selectedCity

    return matchesSearch && matchesType && matchesTemp && matchesCity
  })

  // Criar novo contato
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const rec = await pb.collection('contacts').create({
        name: newName.trim(),
        phone: newPhone.trim(),
        whatsapp: newPhone.replace(/\D/g, ''),
        email: newEmail.trim(),
        city: newCity.trim(),
        type: newType,
        temperature: newTemp,
        notes: newNotes.trim(),
        score: newTemp === 'quente' ? 80 : 60,
        origin: 'Cadastro Manual',
        consent: true,
        last_contact_at: new Date().toISOString(),
      })

      toast.success('Contato cadastrado com sucesso!')
      setNewContactModal(false)
      setNewName('')
      setNewPhone('')
      setNewEmail('')
      setNewNotes('')
      loadData()
      setSelectedContactId(rec.id)
    } catch (err: unknown) {
      toast.error('Erro ao cadastrar contato.')
    } finally {
      setCreating(false)
    }
  }

  // Exportar para CSV
  const handleExportCSV = () => {
    const headers = [
      'Nome',
      'Tipo',
      'Telefone',
      'WhatsApp',
      'Email',
      'Cidade',
      'Temperatura',
      'Score',
    ]
    const rows = filteredContacts.map((c) => [
      `"${c.name}"`,
      `"${c.type}"`,
      `"${c.phone || ''}"`,
      `"${c.whatsapp || ''}"`,
      `"${c.email || ''}"`,
      `"${c.city || ''}"`,
      `"${c.temperature || ''}"`,
      `"${c.score || 0}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `contatos_houseos_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Planilha exportada com sucesso!')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Slide-over de Detalhes do Contato */}
      <ContactSlideOver
        contactId={selectedContactId}
        open={Boolean(selectedContactId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContactId(null)
            searchParams.delete('select')
            setSearchParams(searchParams)
          }
        }}
        onContactUpdated={loadData}
      />

      {/* Modal de Importação */}
      <ContactImportModal open={importOpen} onOpenChange={setImportOpen} onSuccess={loadData} />

      {/* Modal Novo Contato */}
      <Dialog open={newContactModal} onOpenChange={setNewContactModal}>
        <DialogContent className="sm:max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Novo Contato / Lead
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
            <div>
              <Label className="text-slate-600">Nome Completo</Label>
              <Input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="text-xs mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Telefone / WhatsApp</Label>
                <Input
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(47) 99999-9999"
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">E-mail</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="text-xs mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-slate-600">Cidade</Label>
                <Input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Tipo</Label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
                >
                  <option value="lead">Lead</option>
                  <option value="investidor">Investidor</option>
                  <option value="cliente">Cliente</option>
                  <option value="proprietario">Proprietário</option>
                  <option value="corretor_parceiro">Parceiro</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-600">Temperatura</Label>
                <select
                  value={newTemp}
                  onChange={(e) => setNewTemp(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
                >
                  <option value="quente">Quente</option>
                  <option value="prioridade">Prioridade</option>
                  <option value="morno">Morno</option>
                  <option value="frio">Frio</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-slate-600">Observações Iniciais</Label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Preferências, interesse em lançamentos, budget..."
                rows={2}
                className="w-full text-xs p-2 border border-slate-200 rounded mt-1 bg-slate-50/50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewContactModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-[#0F766E] text-white text-xs hover:bg-[#0D5C56]"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Contato'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header com Ações Globais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contatos & Clientes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento centralizado de leads, investidores, proprietários e parceiros de
            negócios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs border-slate-200"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="text-xs border-slate-200"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1 text-teal-600" />
            Importar
          </Button>
          <Button
            size="sm"
            onClick={() => setNewContactModal(true)}
            className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Listas Inteligentes Salvas (Chips Rápidos) */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Listas Inteligentes:
        </span>
        <button
          onClick={() => applyQuickFilter('todos')}
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
        >
          Todos ({contacts.length})
        </button>
        <button
          onClick={() => applyQuickFilter('investidores')}
          className="px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 font-medium border border-teal-200/60 transition"
        >
          Investidores em Porto Belo
        </button>
        <button
          onClick={() => applyQuickFilter('sem_resposta')}
          className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium border border-rose-200/60 transition"
        >
          Leads sem resposta
        </button>
        <button
          onClick={() => applyQuickFilter('30dias')}
          className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium border border-amber-200/60 transition"
        >
          Clientes sem contato há 30 dias
        </button>
      </div>

      {/* Barra de Filtros Combináveis */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone, e-mail ou cidade..."
              className="pl-9 text-xs bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-md px-2.5 text-xs text-slate-700 bg-white"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="lead">Leads</option>
              <option value="investidor">Investidores</option>
              <option value="cliente">Clientes Compradores</option>
              <option value="proprietario">Proprietários</option>
              <option value="corretor_parceiro">Corretores Parceiros</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTemp}
              onChange={(e) => setSelectedTemp(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-md px-2.5 text-xs text-slate-700 bg-white"
            >
              <option value="todos">Todas as Temperaturas</option>
              <option value="quente">Quente</option>
              <option value="prioridade">Prioridade</option>
              <option value="morno">Morno</option>
              <option value="frio">Frio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Contatos */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
            <p className="text-xs">Carregando carteira de contatos...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <p className="text-sm font-semibold">
              Nenhum contato encontrado com os filtros atuais.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyQuickFilter('todos')}
              className="text-xs"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nome & Perfil</th>
                  <th className="py-3 px-4">WhatsApp / Fone</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4">Temperatura</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedContactId(c.id)}
                    className="hover:bg-teal-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-teal-800 font-bold flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition">
                          {c.name ? c.name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-teal-800 transition">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-500 capitalize">
                            {c.classification || c.type}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {c.phone || '—'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {c.city ? `${c.city}${c.state ? ` - ${c.state}` : ''}` : 'Litoral SC'}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        className={`text-[10px] capitalize ${
                          c.temperature === 'quente' || c.temperature === 'prioridade'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : c.temperature === 'morno'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {c.temperature === 'quente' && <Flame className="w-3 h-3 mr-1" />}
                        {c.temperature || 'Morno'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {c.expand?.tags?.slice(0, 2).map((t: any) => (
                          <span
                            key={t.id}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>{c.score || 70}</span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full"
                            style={{ width: `${Math.min(c.score || 70, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 border border-slate-200 transition"
                            title="Conversar no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {c.phone && (
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-700 border border-slate-200 transition"
                            title="Ligar"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
