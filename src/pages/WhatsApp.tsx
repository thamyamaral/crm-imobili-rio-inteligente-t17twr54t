import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  Search,
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function WhatsApp() {
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [textInput, setTextInput] = useState('')
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [cRes, tRes] = await Promise.all([
        pb.collection('contacts').getFullList({ sort: '-last_contact_at' }),
        pb.collection('message_templates').getFullList(),
      ])
      setContacts(cRes)
      setTemplates(tRes)
      if (cRes.length > 0) {
        setSelectedContact(cRes[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSendMessage = () => {
    if (!textInput.trim() || !selectedContact) return

    const phoneClean = selectedContact.phone?.replace(/\D/g, '') || ''
    if (!phoneClean) {
      toast.error('Este contato não possui número de WhatsApp cadastrado.')
      return
    }

    // Abre link wa.me direto com a mensagem pronta
    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(textInput.trim())}`
    window.open(url, '_blank')

    toast.success('Mensagem direcionada ao WhatsApp!', {
      description: `Conversa aberta com ${selectedContact.name}`,
    })
    setTextInput('')
  }

  const handleApplyTemplate = (body: string) => {
    if (!selectedContact) return
    const replaced = body
      .replace('{nome}', selectedContact.name || 'Cliente')
      .replace('{imovel}', 'Viva Park Porto Belo')
      .replace('{valor}', 'R$ 1.850.000')
      .replace('{dia}', 'amanhã')
    setTextInput(replaced)
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Banner de Status da Integração */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>Modo Híbrido Ativo:</strong> Envio rápido via <strong>wa.me</strong> +
            arquitetura preparada para API Oficial do WhatsApp Business.
          </span>
        </div>
        <Badge className="bg-emerald-600 text-white text-[10px]">Conectado</Badge>
      </div>

      {/* Painel de Conversas Split Screen */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex shadow-xs min-h-0">
        {/* Coluna Esquerda: Lista de Contatos */}
        <div className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <Input placeholder="Buscar conversas..." className="pl-8 text-xs bg-white h-8" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {contacts.map((c) => {
              const isSelected = selectedContact?.id === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`p-3 flex items-start gap-2.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-teal-50/80 border-l-4 border-[#0F766E]'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {c.name ? c.name[0].toUpperCase() : 'C'}
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                      <span className="text-[10px] text-slate-400">Hoje</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.notes || 'Clique para abrir atendimento...'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Coluna Direita: Thread de Conversa e Composer */}
        <div className="flex-1 flex flex-col bg-[#F3F4F6] min-w-0">
          {/* Header da Conversa */}
          {selectedContact && (
            <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                  {selectedContact.name ? selectedContact.name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedContact.name}</h3>
                  <p className="text-[10px] text-slate-500">
                    {selectedContact.phone || 'Sem telefone'} • {selectedContact.city || 'SC'}
                  </p>
                </div>
              </div>

              {selectedContact.phone && (
                <a
                  href={`https://wa.me/${selectedContact.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline"
                >
                  Abrir no WhatsApp Web
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Área de Mensagens (Thread Estilo WhatsApp) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-center">
              <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded text-slate-600 font-medium">
                Início do Atendimento com HouseOS
              </span>
            </div>

            {/* Mensagem enviada */}
            <div className="flex justify-end">
              <div className="max-w-md p-3 rounded-xl bg-teal-700 text-white text-xs shadow-xs space-y-1 rounded-br-none">
                <p>
                  Olá, Dr. Rodrigo! Tudo bem? Sou a Thata Amaral. Conforme combinamos, preparei o
                  comparativo de rentabilidade do Viva Park Porto Belo.
                </p>
                <div className="flex items-center justify-end gap-1 text-[9px] text-teal-200">
                  <span>10:30</span>
                  <CheckCheck className="w-3 h-3 text-teal-300" />
                </div>
              </div>
            </div>

            {/* Mensagem recebida */}
            <div className="flex justify-start">
              <div className="max-w-md p-3 rounded-xl bg-white text-slate-800 text-xs shadow-xs space-y-1 rounded-bl-none border border-slate-200">
                <p>
                  Bom dia, Thata! Recebi sim. Gostei muito da projeção de valorização pré-chaves.
                  Podemos alinhar a forma de parcelamento da entrada?
                </p>
                <div className="text-right text-[9px] text-slate-400">10:34</div>
              </div>
            </div>
          </div>

          {/* Atalhos de Templates Rápidos */}
          <div className="bg-white border-t border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold pl-2 shrink-0">
              Modelos:
            </span>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl.body)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-[11px] text-slate-600 shrink-0 transition"
              >
                {tpl.title}
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage()
              }}
              placeholder="Digite sua mensagem profissional ou selecione um modelo..."
              className="text-xs bg-slate-50/50"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-[#0F766E] hover:bg-[#0D5C56] text-white shrink-0 text-xs px-4"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
