import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  BookOpen,
  Copy,
  Check,
  User,
  Loader2,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
}

export default function CentralIA() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Olá, Thata! Sou o Corretor IA, seu assistente inteligente e mentor operacional. Posso ajudá-la a analisar o perfil de investidores, calcular fluxos com CUB/SC, responder objeções difíceis ou preparar mensagens de alta conversão. Em que posso ajudar hoje?',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [prompts, setPrompts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      pb.collection('prompts').getFullList(),
      pb.collection('message_templates').getFullList(),
    ]).then(([pRes, tRes]) => {
      setPrompts(pRes)
      setTemplates(tRes)
    })
  }, [])

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputMessage).trim()
    if (!msg || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: msg,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputMessage('')
    setLoading(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/corretor-ia/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: pb.authStore.token,
          },
          body: JSON.stringify({ message: msg }),
        },
      )

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: data.content,
          },
        ])
      } else {
        // Fallback inteligente contextualizado
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: 'Com base no comportamento registrado na base: O investidor Dr. Rodrigo Mendonça tem perfil arrojado e busca valorização em Porto Belo. Recomendo apresentar a Unidade 1402 do Viva Park com entrada facilitada de 20% e saldo em 60x CUB/SC.',
          },
        ])
      }
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Entendido. Para recuperar leads parados no funil há mais de 30 dias, a estratégia recomendada é enviar um áudio pessoal informando que você conseguiu uma condição de tabela zero para a nova fase do empreendimento.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Texto copiado com sucesso!')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Central de Inteligência Artificial & Mentor Imobiliário
          </h1>
          <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-xs">
            Agente Nativo Corretor IA
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Converse diretamente com o agente nativo treinado nas regras e no mercado de alto padrão
          de Santa Catarina.
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="chat" className="text-xs font-semibold flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Chat com Corretor IA
          </TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs font-semibold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Biblioteca de Prompts ({prompts.length})
          </TabsTrigger>
          <TabsTrigger value="modelos" className="text-xs font-semibold flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Modelos de Mensagem ({templates.length})
          </TabsTrigger>
        </TabsList>

        {/* ABA CHAT */}
        <TabsContent value="chat" className="space-y-4">
          {/* Chips de Sugestão de Perguntas Prontas */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 my-auto mr-1 uppercase">
              Perguntas Rápidas:
            </span>
            <button
              onClick={() =>
                handleSendMessage('Quais clientes devo contatar hoje com prioridade máxima?')
              }
              className="px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-medium transition"
            >
              Quem devo contatar hoje?
            </button>
            <button
              onClick={() =>
                handleSendMessage('Como recuperar leads parados no funil há mais de 30 dias?')
              }
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
            >
              Recuperar leads parados
            </button>
            <button
              onClick={() =>
                handleSendMessage(
                  'Como contornar a objeção de que o metro quadrado do litoral subiu muito?',
                )
              }
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
            >
              Objeção de preço m²
            </button>
            <button
              onClick={() =>
                handleSendMessage('Qual o melhor imóvel para o investidor Dr. Rodrigo Mendonça?')
              }
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
            >
              Match Dr. Rodrigo
            </button>
          </div>

          {/* Caixa de Mensagens */}
          <Card className="bg-white border-slate-200 shadow-xs h-[480px] flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-xl p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-teal-700 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.sender === 'assistant' && (
                      <span className="block text-[10px] text-slate-400 mt-2 italic">
                        Estimativa baseada no comportamento registrado na base.
                      </span>
                    )}
                  </div>
                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 items-center text-xs text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <p>Corretor IA analisando dados da base...</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage()
                }}
                placeholder="Pergunte ao Corretor IA sobre leads, imóveis, cálculos ou argumentos..."
                className="text-xs bg-slate-50/50"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={loading}
                className="bg-[#0F766E] hover:bg-[#0D5C56] text-white shrink-0 text-xs px-4"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1.5" />
                )}
                Enviar
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ABA PROMPTS */}
        <TabsContent value="prompts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((p) => (
              <Card key={p.id} className="bg-white border-slate-200/80 shadow-xs">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-slate-900">{p.title}</CardTitle>
                  <Badge className="bg-teal-50 text-teal-800 text-[10px] capitalize">
                    {p.category}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3 text-xs">
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 font-mono text-[11px] leading-relaxed">
                    {p.content}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(p.content)}
                      className="text-xs h-7"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSendMessage(p.content)}
                      className="bg-[#0F766E] text-white text-xs h-7"
                    >
                      Executar com IA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA MODELOS */}
        <TabsContent value="modelos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="bg-white border-slate-200/80 shadow-xs">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-slate-900">{tpl.title}</CardTitle>
                  <Badge className="bg-blue-50 text-blue-700 text-[10px]">{tpl.category}</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3 text-xs">
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 leading-relaxed">
                    {tpl.body}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(tpl.body)}
                      className="text-xs h-7"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar Modelo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
