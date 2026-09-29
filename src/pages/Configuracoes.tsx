import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Settings as SettingsIcon,
  Layers,
  Database,
  ShieldCheck,
  Webhook,
  Bot,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Plus,
  Save,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function Configuracoes() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [customFields, setCustomFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Módulos Ativos Toggle
  const [modules, setModules] = useState({
    crm: true,
    imoveis: true,
    negocios: true,
    financeiro: true,
    marketing: true,
    automacoes: true,
    central_ia: true,
  })

  useEffect(() => {
    Promise.all([
      pb.collection('integrations').getFullList(),
      pb.collection('custom_fields').getFullList(),
    ]).then(([intRes, cfRes]) => {
      setIntegrations(intRes)
      setCustomFields(cfRes)
      setLoading(false)
    })
  }, [])

  const handleToggleModule = (key: keyof typeof modules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }))
    toast.success('Módulo atualizado!')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configurações & Painel Administrativo
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ativação de módulos, campos personalizados, integrações de webhook, conformidade LGPD e
          endpoints REST.
        </p>
      </div>

      <Tabs defaultValue="modulos" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 flex flex-wrap">
          <TabsTrigger value="modulos" className="text-xs font-semibold">
            Módulos do Sistema
          </TabsTrigger>
          <TabsTrigger value="campos" className="text-xs font-semibold">
            Campos Personalizados
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="text-xs font-semibold">
            Integrações & Webhooks
          </TabsTrigger>
          <TabsTrigger value="lgpd" className="text-xs font-semibold">
            Conformidade LGPD
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs font-semibold">
            Documentação da API
          </TabsTrigger>
        </TabsList>

        {/* ABA MÓDULOS */}
        <TabsContent value="modulos">
          <Card className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">
                Ativar / Desativar Módulos Operacionais
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Personalize sua navegação para manter o sistema tão enxuto ou completo quanto sua
                rotina exigir.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">CRM de Contatos, Leads & Funis</p>
                  <p className="text-slate-500 text-[11px]">
                    Gestão de pipeline, cartões kanban e score do lead
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={modules.crm ? 'default' : 'outline'}
                  onClick={() => handleToggleModule('crm')}
                  className={modules.crm ? 'bg-[#0F766E] text-white text-xs h-7' : 'text-xs h-7'}
                >
                  {modules.crm ? 'Ativo' : 'Desativado'}
                </Button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    Catálogo de Imóveis & Simulador Financeiro
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Empreendimentos, captações, CUB/SC e comparador de unidades
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={modules.imoveis ? 'default' : 'outline'}
                  onClick={() => handleToggleModule('imoveis')}
                  className={
                    modules.imoveis ? 'bg-[#0F766E] text-white text-xs h-7' : 'text-xs h-7'
                  }
                >
                  {modules.imoveis ? 'Ativo' : 'Desativado'}
                </Button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    Central de Inteligência Artificial (Corretor IA)
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Chat com mentor nativo e biblioteca de prompts
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={modules.central_ia ? 'default' : 'outline'}
                  onClick={() => handleToggleModule('central_ia')}
                  className={
                    modules.central_ia ? 'bg-[#0F766E] text-white text-xs h-7' : 'text-xs h-7'
                  }
                >
                  {modules.central_ia ? 'Ativo' : 'Desativado'}
                </Button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    Módulo Financeiro & Divisão de Comissões
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Cronograma de recebimento, split de parceiros e honorários
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={modules.financeiro ? 'default' : 'outline'}
                  onClick={() => handleToggleModule('financeiro')}
                  className={
                    modules.financeiro ? 'bg-[#0F766E] text-white text-xs h-7' : 'text-xs h-7'
                  }
                >
                  {modules.financeiro ? 'Ativo' : 'Desativado'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA CAMPOS PERSONALIZADOS */}
        <TabsContent value="campos">
          <Card className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Campos Personalizados do Domínio
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Campos adicionais que aparecem nos formulários e perfis inteligentes dos clientes.
                </CardDescription>
              </div>
              <Button size="sm" className="bg-[#0F766E] text-white text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Novo Campo
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Rótulo / Pergunta</th>
                      <th className="py-2.5 px-3">Entidade</th>
                      <th className="py-2.5 px-3">Chave</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {customFields.map((cf) => (
                      <tr key={cf.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-900">{cf.label}</td>
                        <td className="py-3 px-3 uppercase text-[10px]">{cf.entity}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {cf.field_key}
                        </td>
                        <td className="py-3 px-3">{cf.type}</td>
                        <td className="py-3 px-3">
                          <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">
                            Ativo
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA INTEGRAÇÕES */}
        <TabsContent value="integracoes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((it) => (
              <Card key={it.id} className="bg-white border-slate-200/80 shadow-xs">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-slate-900">{it.name}</CardTitle>
                  <Badge
                    className={
                      it.status === 'ativo'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }
                  >
                    {it.status === 'ativo' ? 'Conectado' : 'Configurar'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-2 text-xs text-slate-600">
                  <p className="text-[11px] text-slate-500">
                    Provedor: <strong className="font-mono text-slate-800">{it.provider}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Última sincronização:{' '}
                    {it.last_sync_at
                      ? new Date(it.last_sync_at).toLocaleString('pt-BR')
                      : 'Aguardando primeiro evento'}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Gerenciar Integração
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA LGPD */}
        <TabsContent value="lgpd">
          <Card className="bg-white border-slate-200/80 shadow-xs p-6 space-y-4 text-xs text-slate-700">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Gestão de Privacidade & Conformidade LGPD
            </h3>
            <p className="text-slate-500 leading-relaxed">
              O HouseOS implementa o registro formal de consentimento para cada contato capturado,
              bem como ferramentas para portabilidade (exportação completa em formato aberto) e
              anonimização/exclusão solicitada pelo titular.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <p>
                <strong>Finalidade Primária:</strong> Intermediação e consultoria imobiliária.
              </p>
              <p>
                <strong>Base Legal:</strong> Execução de contrato ou procedimentos preliminares a
                pedido do titular (Art. 7º, V da Lei 13.709/18).
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* ABA API */}
        <TabsContent value="api">
          <Card className="bg-white border-slate-200/80 shadow-xs p-6 space-y-4 text-xs text-slate-700">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Webhook className="w-4 h-4 text-teal-600" />
              Endpoints REST da Aplicação (PocketBase)
            </h3>
            <p className="text-slate-500">
              Todas as entidades estão disponíveis via API REST autenticada no padrão OpenAPI /
              PocketBase SDK:
            </p>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-emerald-700 font-bold">GET / POST</span>{' '}
                /api/collections/contacts/records
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-emerald-700 font-bold">GET / POST</span>{' '}
                /api/collections/deals/records
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-emerald-700 font-bold">GET / POST</span>{' '}
                /api/collections/properties/records
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-teal-700 font-bold">POST</span> /backend/v1/corretor-ia/chat
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-teal-700 font-bold">POST</span> /backend/v1/meta-leads/webhook
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
