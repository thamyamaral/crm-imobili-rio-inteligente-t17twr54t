import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export default function Simulador() {
  const [totalValue, setTotalValue] = useState<number>(1850000)
  const [entradaPct, setEntradaPct] = useState<number>(20)
  const [mesesObra, setMesesObra] = useState<number>(48)
  const [reforcosQtd, setReforcosQtd] = useState<number>(4)
  const [reforcoValor, setReforcoValor] = useState<number>(80000)
  const [cubAnualPct, setCubAnualPct] = useState<number>(6.5)
  const [valorizacaoAnualPct, setValorizacaoAnualPct] = useState<number>(18.0)

  // Cálculos Financeiros
  const entradaValor = (totalValue * entradaPct) / 100
  const totalReforcos = reforcosQtd * reforcoValor
  const saldoParcelado = Math.max(0, totalValue - entradaValor - totalReforcos)
  const parcelaMensal = mesesObra > 0 ? saldoParcelado / mesesObra : 0

  // Projeção futura com valorização imobiliária composta
  const anosObra = mesesObra / 12
  const valorFinalEstimado = totalValue * Math.pow(1 + valorizacaoAnualPct / 100, anosObra)
  const lucroEstimado = valorFinalEstimado - totalValue
  const roeEstimado =
    entradaValor + totalReforcos > 0 ? (lucroEstimado / (totalValue * 0.5)) * 100 : 0

  // Gráfico de Projeção ano a ano
  const projectionData = [
    { ano: 'Ano 0 (Aquisição)', valor: totalValue, pago: entradaValor },
    {
      ano: 'Ano 1',
      valor: totalValue * Math.pow(1 + valorizacaoAnualPct / 100, 1),
      pago: entradaValor + parcelaMensal * 12 + (reforcosQtd >= 1 ? reforcoValor : 0),
    },
    {
      ano: 'Ano 2',
      valor: totalValue * Math.pow(1 + valorizacaoAnualPct / 100, 2),
      pago: entradaValor + parcelaMensal * 24 + (reforcosQtd >= 2 ? reforcoValor * 2 : 0),
    },
    {
      ano: 'Ano 3',
      valor: totalValue * Math.pow(1 + valorizacaoAnualPct / 100, 3),
      pago: entradaValor + parcelaMensal * 36 + (reforcosQtd >= 3 ? reforcoValor * 3 : 0),
    },
    {
      ano: `Ano ${anosObra.toFixed(0)} (Entrega)`,
      valor: valorFinalEstimado,
      pago: totalValue,
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Simulador de Investimento & Curadoria de Yield
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Projeção inteligente de fluxo de pagamento na planta, correção pelo CUB/SC e valorização
          estimada até a entrega.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Entradas do Fluxo */}
        <Card className="bg-white border-slate-200/80 shadow-xs lg:col-span-1">
          <CardHeader className="p-4 pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-teal-600" />
              Parâmetros do Imóvel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <Label className="text-slate-600">Valor de Tabela (R$)</Label>
              <Input
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(Number(e.target.value) || 0)}
                className="text-xs mt-1 font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Entrada (%)</Label>
                <Input
                  type="number"
                  value={entradaPct}
                  onChange={(e) => setEntradaPct(Number(e.target.value) || 0)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Meses de Obra</Label>
                <Input
                  type="number"
                  value={mesesObra}
                  onChange={(e) => setMesesObra(Number(e.target.value) || 0)}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Qtd Reforços/Balões</Label>
                <Input
                  type="number"
                  value={reforcosQtd}
                  onChange={(e) => setReforcosQtd(Number(e.target.value) || 0)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Valor por Reforço (R$)</Label>
                <Input
                  type="number"
                  value={reforcoValor}
                  onChange={(e) => setReforcoValor(Number(e.target.value) || 0)}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">CUB Anual Est. (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cubAnualPct}
                  onChange={(e) => setCubAnualPct(Number(e.target.value) || 0)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Valorização Anual (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={valorizacaoAnualPct}
                  onChange={(e) => setValorizacaoAnualPct(Number(e.target.value) || 0)}
                  className="text-xs mt-1 font-semibold text-emerald-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Entrada no ato:</span>
                <strong className="text-slate-900">
                  R$ {entradaValor.toLocaleString('pt-BR')}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Parcela Mensal ({mesesObra}x):</span>
                <strong className="text-teal-700 font-bold">
                  R$ {parcelaMensal.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Total em Reforços:</span>
                <strong>R$ {totalReforcos.toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 2 e 3: Gráfico de Evolução e KPIs de Retorno */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="bg-white border-slate-200/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Valor Futuro Estimado
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                R$ {valorFinalEstimado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">
                Na entrega das chaves
              </span>
            </Card>

            <Card className="bg-white border-slate-200/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Ganho de Capital Bruto
              </span>
              <p className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                + R$ {lucroEstimado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">
                Valorização durante a obra
              </span>
            </Card>

            <Card className="bg-white border-slate-200/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                ROE Estimado s/ Investido
              </span>
              <p className="text-xl font-bold text-teal-800 mt-1 tabular-nums">
                +{roeEstimado.toFixed(1)}%
              </p>
              <span className="text-[10px] text-teal-600 font-medium">Alavancagem imobiliária</span>
            </Card>
          </div>

          <Card className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">
                Curva de Valorização vs. Desembolso Acumulado (R$)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Compare o patrimônio acumulado com o fluxo de capital aportado mês a mês.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectionData}
                    margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(value: any) => [
                        `R$ ${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
                        '',
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#0F766E"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Valor do Imóvel"
                    />
                    <Line
                      type="monotone"
                      dataKey="pago"
                      stroke="#2563EB"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Capital Pago"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
