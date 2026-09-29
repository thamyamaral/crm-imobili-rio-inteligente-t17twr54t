import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  FileCheck2,
  FileText,
  Download,
  Plus,
  CheckCircle2,
  Send,
  Eye,
  Loader2,
  Printer,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Contratos() {
  const [contracts, setContracts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Gerador de Contrato
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('proposta_compra')
  const [contractTitle, setContractTitle] = useState('')
  const [selectedContactId, setSelectedContactId] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [contractValue, setContractValue] = useState('1850000')
  const [contractEntrada, setContractEntrada] = useState('370000')
  const [generating, setGenerating] = useState(false)

  // Visualização de PDF/Documento
  const [viewContract, setViewContract] = useState<any | null>(null)

  const templatesList = [
    { code: 'proposta_compra', name: 'Proposta de Compra com Sinal' },
    { code: 'autorizacao_venda', name: 'Autorização de Venda com Exclusividade' },
    { code: 'reserva', name: 'Termo de Reserva de Unidade na Planta' },
    { code: 'parceria_corretores', name: 'Acordo de Parceria e Divisão de Comissão' },
    { code: 'termo_honorarios', name: 'Contrato de Honorários de Mentoria e Curadoria' },
    { code: 'ficha_visita', name: 'Ficha de Visita e Confidencialidade' },
  ]

  const loadData = async () => {
    try {
      const [conRes, contRes, propRes] = await Promise.all([
        pb.collection('contracts').getFullList({ expand: 'contact,property', sort: '-created' }),
        pb.collection('contacts').getFullList({ sort: 'name' }),
        pb.collection('properties').getFullList({ sort: 'title' }),
      ])
      setContracts(conRes)
      setContacts(contRes)
      setProperties(propRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerateContract = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const selContact = contacts.find((c) => c.id === selectedContactId)
      const selProp = properties.find((p) => p.id === selectedPropertyId)

      const title =
        contractTitle.trim() ||
        `${templatesList.find((t) => t.code === selectedTemplate)?.name} - ${selContact?.name || 'Cliente'}`

      await pb.collection('contracts').create({
        template: selectedTemplate,
        title,
        contact: selectedContactId || null,
        property: selectedPropertyId || null,
        status: 'gerado',
        filled_data: {
          comprador_nome: selContact?.name || 'Cliente',
          comprador_cpf: selContact?.cpf_cnpj || '123.456.789-00',
          imovel_unidade: selProp?.title || 'Imóvel em SC',
          valor_proposta: Number(contractValue) || 0,
          entrada: Number(contractEntrada) || 0,
          data_geracao: new Date().toLocaleDateString('pt-BR'),
        },
      })

      toast.success('Contrato gerado com sucesso!')
      setGeneratorOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar contrato.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Visualização de Impressão do Contrato */}
      <Dialog open={Boolean(viewContract)} onOpenChange={() => setViewContract(null)}>
        <DialogContent className="sm:max-w-2xl p-6 bg-white max-h-[85vh] overflow-y-auto">
          {viewContract && (
            <div className="space-y-4 text-xs font-serif leading-relaxed text-slate-800">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                  {viewContract.title}
                </h2>
                <p className="text-[11px] text-slate-500 font-sans mt-1">
                  Instrumento Particular de Intermediação e Compromisso Imobiliário
                </p>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <p>
                  <strong>INTERMEDIADORA:</strong> THATA AMARAL - Corretora de Imóveis e Mentora de
                  Investimentos Imobiliários, inscrita sob o CRECI de Santa Catarina.
                </p>
                <p>
                  <strong>PROPONENTE / COMPRADOR:</strong>{' '}
                  {viewContract.filled_data?.comprador_nome ||
                    viewContract.expand?.contact?.name ||
                    'Cliente Qualificado'}
                  , portador(a) do CPF/CNPJ nº{' '}
                  {viewContract.filled_data?.comprador_cpf || '000.000.000-00'}.
                </p>
                <p>
                  <strong>OBJETO DA NEGOCIAÇÃO:</strong> Intermediação da unidade imobiliária
                  referente a{' '}
                  <strong>
                    {viewContract.filled_data?.imovel_unidade ||
                      viewContract.expand?.property?.title ||
                      'Apartamento Litoral SC'}
                  </strong>
                  .
                </p>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <p>
                    <strong>Valor Global da Proposta:</strong> R${' '}
                    {Number(viewContract.filled_data?.valor_proposta || 1850000).toLocaleString(
                      'pt-BR',
                    )}
                  </p>
                  <p>
                    <strong>Sinal / Entrada:</strong> R${' '}
                    {Number(viewContract.filled_data?.entrada || 370000).toLocaleString('pt-BR')}
                  </p>
                  <p>
                    <strong>Saldo:</strong> Saldo remanescente parcelado conforme fluxo comercial
                    aprovado pela Construtora.
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Documento preparado para assinatura digital (DocuSign / ZapSign / Clicksign) ou
                  formalização física.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 font-sans">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Imprimir / Salvar PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewContract(null)}
                  className="bg-[#0F766E] text-white text-xs"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Gerador de Contrato */}
      <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Gerador de Contratos & Propostas
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerateContract} className="space-y-3 text-xs">
            <div>
              <Label className="text-slate-600">Modelo de Minuta</Label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white font-medium"
              >
                {templatesList.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-slate-600">Cliente Vinculado</Label>
              <select
                required
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
              >
                <option value="">Selecione o contato...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-slate-600">Imóvel Referente</Label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded px-2 text-xs mt-1 bg-white"
              >
                <option value="">Selecione o imóvel...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Valor da Proposta (R$)</Label>
                <Input
                  type="number"
                  value={contractValue}
                  onChange={(e) => setContractValue(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Entrada (R$)</Label>
                <Input
                  type="number"
                  value={contractEntrada}
                  onChange={(e) => setContractEntrada(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGeneratorOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={generating}
                className="bg-[#0F766E] text-white text-xs hover:bg-[#0D5C56]"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gerar Minuta Oficial'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Contratos, Propostas & Modelos Jurídicos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Biblioteca de 16 minutas imobiliárias inteligentes com preenchimento dinâmico de dados e
            status de assinatura.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setGeneratorOpen(true)}
          className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Gerar Novo Contrato
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
          <p className="text-xs">Carregando acervo de contratos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts.map((con) => (
            <Card
              key={con.id}
              className="bg-white border-slate-200/80 shadow-2xs hover:shadow-md transition"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                <div>
                  <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[10px] uppercase font-semibold mb-1">
                    {con.template}
                  </Badge>
                  <CardTitle className="text-xs font-bold text-slate-900 line-clamp-1">
                    {con.title}
                  </CardTitle>
                </div>
                <Badge className="bg-slate-100 text-slate-700 text-[10px] capitalize">
                  {con.status || 'Gerado'}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Parte vinculada:{' '}
                  <strong className="text-slate-800">
                    {con.expand?.contact?.name || 'Dr. Rodrigo Mendonça'}
                  </strong>
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    {con.created ? new Date(con.created).toLocaleDateString('pt-BR') : 'Hoje'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewContract(con)}
                      className="h-7 text-xs text-teal-800 border-slate-200"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
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
