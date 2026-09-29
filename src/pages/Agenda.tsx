import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Phone,
  Video,
  Users,
  Building2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Agenda() {
  const [tasks, setTasks] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Novo compromisso
  const [newOpen, setNewOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueTime, setDueTime] = useState('14:00')
  const [type, setType] = useState('visita')
  const [contactId, setContactId] = useState('')
  const [priority, setPriority] = useState('alta')
  const [creating, setCreating] = useState(false)

  const loadData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        pb.collection('tasks').getFullList({ expand: 'contact,deal', sort: 'due_date' }),
        pb.collection('contacts').getFullList({ sort: 'name' }),
      ])
      setTasks(tRes)
      setContacts(cRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await pb.collection('tasks').create({
        title: title.trim(),
        type,
        due_date: dueDate,
        due_time: dueTime,
        contact: contactId || null,
        priority,
        status: 'pendente',
      })
      toast.success('Compromisso agendado com sucesso!')
      setNewOpen(false)
      setTitle('')
      loadData()
    } catch (_) {
      toast.error('Erro ao agendar compromisso.')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleStatus = async (task: any) => {
    const nextStatus = task.status === 'concluida' ? 'pendente' : 'concluida'
    try {
      await pb.collection('tasks').update(task.id, {
        status: nextStatus,
        completed_at: nextStatus === 'concluida' ? new Date().toISOString() : null,
      })
      toast.success(`Compromisso marcado como ${nextStatus}!`)
      loadData()
    } catch (_) {
      toast.error('Erro ao atualizar status.')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Modal Novo Compromisso */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Novo Compromisso / Visita
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
            <div>
              <Label className="text-slate-600">Título do Compromisso</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Visita guiada Cobertura Meia Praia"
                className="text-xs mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Tipo</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
                >
                  <option value="visita">Visita a Imóvel</option>
                  <option value="reuniao">Reunião Presencial</option>
                  <option value="ligacao">Ligação / Vídeo</option>
                  <option value="whatsapp">Follow-up WhatsApp</option>
                  <option value="retorno">Retorno de Proposta</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-600">Prioridade</Label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Data</Label>
                <Input
                  required
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Horário</Label>
                <Input
                  required
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-600">Contato Vinculado</Label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
              >
                <option value="">Nenhum contato específico</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setNewOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-[#0F766E] text-white text-xs hover:bg-[#0D5C56]"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Compromisso'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Agenda & Visitas Imobiliárias
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calendário de atendimentos, visitas técnicas, reuniões de fechamento e compromissos
            vinculados.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setNewOpen(true)}
          className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Novo Evento
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
          <p className="text-xs">Carregando agenda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((t) => (
            <Card
              key={t.id}
              className={`bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition ${
                t.status === 'concluida' ? 'opacity-60 bg-slate-50/50' : ''
              }`}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                <div>
                  <Badge
                    className={`text-[10px] uppercase font-semibold mb-1.5 ${
                      t.type === 'visita'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : t.type === 'retorno'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {t.type}
                  </Badge>
                  <CardTitle className="text-xs font-bold text-slate-900 line-clamp-1">
                    {t.title}
                  </CardTitle>
                </div>
                <button
                  onClick={() => handleToggleStatus(t)}
                  className="w-5 h-5 rounded border border-slate-300 hover:border-teal-600 flex items-center justify-center shrink-0 transition"
                  title="Alterar status"
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      t.status === 'concluida' ? 'text-teal-600 fill-teal-100' : 'text-slate-300'
                    }`}
                  />
                </button>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    {t.due_date} às {t.due_time || '10:00'}
                  </span>
                </div>
                {t.expand?.contact && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {t.expand.contact.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
