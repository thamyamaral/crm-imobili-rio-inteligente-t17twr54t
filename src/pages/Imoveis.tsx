import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import {
  Building2,
  Search,
  Filter,
  Plus,
  BedDouble,
  Bath,
  Car,
  Maximize,
  Compass,
  FileCheck2,
  Loader2,
  Phone,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Imoveis() {
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState<any[]>([])
  const [developments, setDevelopments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCity, setSelectedCity] = useState<string>('todos')
  const [selectedType, setSelectedType] = useState<string>('todos')
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')

  // Modal Detalhe Imóvel
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)

  // Modal Novo Imóvel
  const [newPropOpen, setNewPropOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCity, setNewCity] = useState('Porto Belo')
  const [newBairro, setNewBairro] = useState('Perequê')
  const [newPrice, setNewPrice] = useState('')
  const [newArea, setNewArea] = useState('')
  const [newDorms, setNewDorms] = useState('3')
  const [newSuites, setNewSuites] = useState('3')
  const [newVagas, setNewVagas] = useState('2')
  const [newType, setNewType] = useState('novo')
  const [creating, setCreating] = useState(false)

  const loadData = async () => {
    try {
      const [propRes, devRes] = await Promise.all([
        pb.collection('properties').getFullList({ expand: 'development,owner', sort: '-created' }),
        pb.collection('developments').getFullList(),
      ])
      setProperties(propRes)
      setDevelopments(devRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.bairro?.toLowerCase().includes(search.toLowerCase()) ||
      p.unit_code?.toLowerCase().includes(search.toLowerCase())

    const matchesCity = selectedCity === 'todos' || p.city === selectedCity
    const matchesType = selectedType === 'todos' || p.type === selectedType
    const matchesStatus = selectedStatus === 'todos' || p.status === selectedStatus

    return matchesSearch && matchesCity && matchesType && matchesStatus
  })

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await pb.collection('properties').create({
        title: newTitle.trim(),
        city: newCity.trim(),
        bairro: newBairro.trim(),
        price: Number(newPrice) || 0,
        area: Number(newArea) || 0,
        dormitorios: Number(newDorms) || 0,
        suites: Number(newSuites) || 0,
        vagas: Number(newVagas) || 0,
        type: newType,
        status: 'disponivel',
        correction: 'cub',
        images: ['https://img.usecurling.com/p/800/600?q=modern%20luxury%20apartment'],
      })

      toast.success('Imóvel cadastrado no catálogo!')
      setNewPropOpen(false)
      setNewTitle('')
      setNewPrice('')
      setNewArea('')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao cadastrar imóvel.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Modal Detalhe Completo do Imóvel */}
      <Dialog open={Boolean(selectedProperty)} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="sm:max-w-2xl p-6 bg-white max-h-[85vh] overflow-y-auto">
          {selectedProperty && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {selectedProperty.title}
                </DialogTitle>
                <p className="text-slate-500 text-xs">
                  {selectedProperty.city} - {selectedProperty.bairro} • Unidade:{' '}
                  {selectedProperty.unit_code || 'Avulsa'}
                </p>
              </DialogHeader>

              {/* Imagem */}
              <div className="h-52 w-full rounded-xl overflow-hidden relative bg-slate-100">
                <img
                  src={
                    selectedProperty.images?.[0] ||
                    'https://img.usecurling.com/p/800/600?q=luxury%20condo%20living%20room'
                  }
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-teal-700 text-white capitalize">
                  {selectedProperty.status}
                </Badge>
              </div>

              {/* Características */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg text-center font-semibold text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Área</span>
                  {selectedProperty.area || 0} m²
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Dormitórios</span>
                  {selectedProperty.dormitorios || 0}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Suítes</span>
                  {selectedProperty.suites || 0}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Vagas</span>
                  {selectedProperty.vagas || 0}
                </div>
              </div>

              {/* Preço e Fluxo */}
              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Valor de Tabela:</span>
                  <span className="text-base font-bold text-emerald-700">
                    R$ {Number(selectedProperty.price || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Valor do m²:</span>
                  <span>R$ {Number(selectedProperty.valor_m2 || 0).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Índice de Correção:</span>
                  <span className="uppercase font-semibold text-slate-700">
                    {selectedProperty.correction || 'CUB/SC'}
                  </span>
                </div>
              </div>

              {/* Checklist de Documentação */}
              <div className="p-3 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Checklist de Documentação & Conformidade:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matrícula Registrada ({selectedProperty.matricula || 'OK'})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>IPTU Quitado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Certidões Negativas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Autorização de Venda</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Novo Imóvel */}
      <Dialog open={newPropOpen} onOpenChange={setNewPropOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Novo Imóvel no Catálogo
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProperty} className="space-y-3 text-xs">
            <div>
              <Label className="text-slate-600">Título do Imóvel</Label>
              <Input
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Apartamento 3 Suítes Vista Mar"
                className="text-xs mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Cidade</Label>
                <Input
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Bairro</Label>
                <Input
                  required
                  value={newBairro}
                  onChange={(e) => setNewBairro(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-600">Valor de Venda (R$)</Label>
                <Input
                  required
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="1850000"
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Área Privativa (m²)</Label>
                <Input
                  required
                  type="number"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="135"
                  className="text-xs mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-slate-600">Dorms</Label>
                <Input
                  type="number"
                  value={newDorms}
                  onChange={(e) => setNewDorms(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Suítes</Label>
                <Input
                  type="number"
                  value={newSuites}
                  onChange={(e) => setNewSuites(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Vagas</Label>
                <Input
                  type="number"
                  value={newVagas}
                  onChange={(e) => setNewVagas(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewPropOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-[#0F766E] text-white text-xs hover:bg-[#0D5C56]"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Imóvel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Catálogo & Curadoria de Imóveis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lançamentos na planta, prontos e captações exclusivas com condições de pagamento
            detalhadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setNewPropOpen(true)}
            className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Novo Imóvel
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por empreendimento, cidade, bairro ou código..."
              className="pl-9 text-xs bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-md px-2.5 text-xs text-slate-700 bg-white"
            >
              <option value="todos">Todas as Cidades</option>
              <option value="Porto Belo">Porto Belo</option>
              <option value="Itapema">Itapema</option>
              <option value="Balneário Camboriú">Balneário Camboriú</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-md px-2.5 text-xs text-slate-700 bg-white"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="novo">Na Planta (Novo)</option>
              <option value="usado">Pronto (Usado)</option>
              <option value="captacao">Captação Exclusiva</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Imóveis */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
          <p className="text-xs">Carregando catálogo de imóveis...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
          <p className="text-sm font-semibold">Nenhum imóvel encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((p) => (
            <Card
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className="bg-white border-slate-200/80 shadow-2xs hover:shadow-lg transition cursor-pointer overflow-hidden group flex flex-col justify-between"
            >
              <div>
                {/* Foto com Badges */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      p.images?.[0] ||
                      'https://img.usecurling.com/p/800/600?q=modern%20luxury%20apartment'
                    }
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <Badge className="absolute top-3 left-3 bg-[#0F766E] text-white text-[10px] font-semibold uppercase">
                    {p.type === 'novo' ? 'Na Planta' : p.is_captacao ? 'Captação' : 'Pronto'}
                  </Badge>
                  <span className="absolute bottom-3 right-3 px-2 py-1 rounded bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold">
                    R$ {Number(p.price || 0).toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Conteúdo */}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {p.city} - {p.bairro}
                    </p>
                  </div>

                  {/* Atributos */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3.5 h-3.5 text-slate-400" />
                      {p.area || 0} m²
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      {p.dormitorios || 0} dorms
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      {p.vagas || 0} vagas
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Rodapé com Ações Rápidas */}
              <div
                className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] font-medium text-slate-500">
                  {p.correction ? `Correção: ${p.correction.toUpperCase()}` : 'CUB/SC'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedProperty(p)}
                  className="text-xs text-teal-700 hover:text-teal-900 h-7"
                >
                  Ver Ficha Completa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
