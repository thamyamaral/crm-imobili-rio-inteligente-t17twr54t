import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { GlobalSearchDialog } from './GlobalSearchDialog'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Building2,
  DollarSign,
  Bot,
  MessageSquare,
  Megaphone,
  Settings,
  Calendar,
  FileCheck2,
  HeartHandshake,
  Search,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface NavGroup {
  label: string
  items: {
    title: string
    href: string
    icon: React.ElementType
    badge?: string
  }[]
}

const navGroups: NavGroup[] = [
  {
    label: 'INÍCIO',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Central IA', href: '/central-ia', icon: Bot, badge: 'IA Nativa' },
    ],
  },
  {
    label: 'CRM & CLIENTES',
    items: [
      { title: 'Contatos & Leads', href: '/contatos', icon: Users },
      { title: 'Funis de Vendas', href: '/funis', icon: GitBranch },
      { title: 'Agenda & Visitas', href: '/agenda', icon: Calendar },
    ],
  },
  {
    label: 'IMÓVEIS & CURADORIA',
    items: [
      { title: 'Catálogo de Imóveis', href: '/imoveis', icon: Building2 },
      { title: 'Empreendimentos', href: '/imoveis/empreendimentos', icon: Compass },
      { title: 'Captações & Exclusividade', href: '/imoveis/captacoes', icon: FileCheck2 },
      { title: 'Simulador Financeiro', href: '/imoveis/simulador', icon: DollarSign },
      { title: 'Comparador de Imóveis', href: '/imoveis/comparador', icon: Sparkles },
    ],
  },
  {
    label: 'NEGÓCIOS & DOCUMENTOS',
    items: [
      { title: 'Contratos & Gerador', href: '/negocios/contratos', icon: FileCheck2 },
      { title: 'Pós-Venda & Obras', href: '/pos-venda', icon: HeartHandshake },
      { title: 'Financeiro & Comissões', href: '/financeiro', icon: DollarSign },
    ],
  },
  {
    label: 'MARKETING & AUTOMAÇÃO',
    items: [
      { title: 'WhatsApp Web & Chat', href: '/marketing/whatsapp', icon: MessageSquare },
      { title: 'Campanhas Meta Ads', href: '/marketing/campanhas', icon: Megaphone },
      { title: 'Automações & Cadências', href: '/automatizacao', icon: Sparkles },
    ],
  },
  {
    label: 'SISTEMA',
    items: [{ title: 'Configurações', href: '/configuracoes', icon: Settings }],
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Atalho de teclado Ctrl+K ou Cmd+K para busca global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fechar menu mobile ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'T'

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F3F4F6] text-slate-800">
      {/* Busca Global Dialog */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Sidebar Desktop Fixa (260px) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#0F172A] text-slate-200 border-r border-slate-800 shrink-0 select-none z-30">
        {/* Logo & Marca */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F766E] to-[#2563EB] flex items-center justify-center text-white font-bold shadow-md shadow-teal-900/30">
              H
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">HouseOS</span>
              <span className="block text-[10px] text-teal-400 font-semibold tracking-wider uppercase -mt-1">
                Corretora Autônoma
              </span>
            </div>
          </div>
          <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-[10px] px-1.5 py-0.5 font-mono">
            v1.0
          </Badge>
        </div>

        {/* Menu com Grupos Roláveis */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-2.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group',
                        isActive
                          ? 'bg-[#0F766E] text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/40 font-medium">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        {/* Card de Mentor / Perfil Rápido no Rodapé */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-8 h-8 ring-1 ring-teal-500/40">
                <AvatarFallback className="bg-[#0F766E] text-white text-xs font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">
                  {user?.name || 'Thata Amaral'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'thata@houseos.com.br'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da Conta"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#0F172A] text-slate-200 flex flex-col h-full shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                  H
                </div>
                <span className="font-bold text-white text-base">HouseOS</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition',
                            isActive
                              ? 'bg-[#0F766E] text-white'
                              : 'text-slate-300 hover:bg-slate-800',
                          )
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Área Central / Conteúdo */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Barra Superior (64px) */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Caixa de Busca Global na Topbar */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition sm:w-80 justify-between group"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition" />
                <span className="truncate">Buscar pessoas, imóveis, negócios...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Atalhos Rápidos no Topo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketing/whatsapp')}
              className="hidden md:flex items-center gap-1.5 text-xs border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Web</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/central-ia')}
              className="flex items-center gap-1.5 text-xs border-teal-200 text-teal-700 bg-teal-50/50 hover:bg-teal-100/60"
            >
              <Bot className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Corretor IA</span>
            </Button>

            {/* Menu do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 transition border border-transparent hover:border-slate-200">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-teal-700 text-white text-xs font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-xs font-medium text-slate-700 max-w-[120px] truncate">
                    {user?.name || 'Thata Amaral'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200">
                <DropdownMenuLabel>
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Thata Amaral'}</p>
                  <p className="text-[11px] text-slate-500 font-normal truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/dashboard')}
                  className="text-xs cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                  Dashboard Geral
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/configuracoes')}
                  className="text-xs cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Configurações do Sistema
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-xs text-rose-600 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sair da Plataforma
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scroll Independente do Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Bottom Bar Mobile (5 itens: Início, Contatos, Funil, Agenda, Mais) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-30">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-medium flex-1 py-1',
                isActive ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-800',
              )
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Início</span>
          </NavLink>
          <NavLink
            to="/contatos"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-medium flex-1 py-1',
                isActive ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-800',
              )
            }
          >
            <Users className="w-4 h-4" />
            <span>Contatos</span>
          </NavLink>
          <NavLink
            to="/funis"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-medium flex-1 py-1',
                isActive ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-800',
              )
            }
          >
            <GitBranch className="w-4 h-4" />
            <span>Funis</span>
          </NavLink>
          <NavLink
            to="/agenda"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-medium flex-1 py-1',
                isActive ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-800',
              )
            }
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda</span>
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium flex-1 py-1 text-slate-500 hover:text-slate-800"
          >
            <Menu className="w-4 h-4" />
            <span>Mais</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
