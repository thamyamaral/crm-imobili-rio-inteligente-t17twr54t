import { useState } from 'react'
import {
  HeartHandshake,
  CheckCircle2,
  Camera,
  Calendar,
  Send,
  Building2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function PosVenda() {
  const [progressoObra, setProgressoObra] = useState<number>(42)

  const handleSendClientUpdate = () => {
    toast.success('Boletim de obra enviado via WhatsApp!', {
      description: 'Cliente Dr. Rodrigo recebeu o relatório de evolução de fevereiro com fotos.',
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pós-Venda & Acompanhamento de Obras
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Garantia de fidelização, acompanhamento da evolução da construção e geração espontânea de
          novas indicações.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Evolução de Obra Viva Park */}
        <Card className="bg-white border-slate-200/80 shadow-xs lg:col-span-2">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Viva Park Porto Belo - Torre A (Unidade 1402)
                </CardTitle>
                <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-xs">Em Obras</Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Cliente: Dr. Rodrigo Mendonça • Previsão de Entrega: Dezembro / 2026
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={handleSendClientUpdate}
              className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Enviar Atualização ao Cliente
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Barra de Progresso Geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>Evolução Geral da Construção:</span>
                <span className="text-teal-700">{progressoObra}% concluído</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressoObra}%` }}
                />
              </div>
            </div>

            {/* Fases da Obra */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Fundação:</span>
                <strong className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Concluída
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Estrutura:</span>
                <strong className="text-teal-700">65% Concluída</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Alvenaria:</span>
                <strong className="text-amber-700">30% em andamento</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Acabamentos:</span>
                <strong className="text-slate-400">Inicia em Jun/25</strong>
              </div>
            </div>

            {/* Fotos Recentes da Obra */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-600" />
                Registros Fotográficos da Vistoria Técnica
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="h-32 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                  <img
                    src="https://img.usecurling.com/p/800/600?q=modern%20construction%20building%20site"
                    alt="Obra"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/70 text-white text-[9px]">
                    Laje 14º andar
                  </span>
                </div>
                <div className="h-32 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                  <img
                    src="https://img.usecurling.com/p/800/600?q=architectural%20concrete%20structure"
                    alt="Estrutura"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/70 text-white text-[9px]">
                    Garagens & Subsolo
                  </span>
                </div>
                <div className="h-32 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                  <img
                    src="https://img.usecurling.com/p/800/600?q=city%20park%20view%20construction"
                    alt="Vista"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/70 text-white text-[9px]">
                    Vista do Parque
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Pós-Venda & Fidelização */}
        <Card className="bg-white border-slate-200/80 shadow-xs lg:col-span-1">
          <CardHeader className="p-4 pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Checklist de Fidelização
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kit de Boas-Vindas Enviado</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Vinho artesanal + pasta de couro com contrato original
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Boletim de Obra Trimestral</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Próximo disparo agendado para 15 de Março
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Pedido de Indicação Qualificada</span>
              </div>
              <p className="text-[11px] text-slate-500">Após 6 meses de contrato assinado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
