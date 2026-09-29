import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, PublicRoute } from '@/components/AuthGuards'
import Layout from '@/components/Layout'

// Páginas de Autenticação
import Login from '@/pages/Login'
import Registro from '@/pages/Registro'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import VerifyEmail from '@/pages/VerifyEmail'
import ConfirmEmailChange from '@/pages/ConfirmEmailChange'

// Páginas Protegidas
import Index from '@/pages/Index'
import Dashboard from '@/pages/Dashboard'
import Contatos from '@/pages/Contatos'
import Funis from '@/pages/Funis'
import Imoveis from '@/pages/Imoveis'
import Empreendimentos from '@/pages/Empreendimentos'
import Captacoes from '@/pages/Captacoes'
import Simulador from '@/pages/Simulador'
import Comparador from '@/pages/Comparador'
import Agenda from '@/pages/Agenda'
import Financeiro from '@/pages/Financeiro'
import Contratos from '@/pages/Contratos'
import PosVenda from '@/pages/PosVenda'
import WhatsApp from '@/pages/WhatsApp'
import Campanhas from '@/pages/Campanhas'
import Automacoes from '@/pages/Automacoes'
import CentralIA from '@/pages/CentralIA'
import Configuracoes from '@/pages/Configuracoes'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicRoute>
                <Registro />
              </PublicRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />

          {/* Rotas Autenticadas protegidas com Layout Global */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contatos" element={<Contatos />} />
            <Route path="/contatos/importar" element={<Contatos />} />
            <Route path="/funis" element={<Funis />} />
            <Route path="/imoveis" element={<Imoveis />} />
            <Route path="/imoveis/empreendimentos" element={<Empreendimentos />} />
            <Route path="/imoveis/captacoes" element={<Captacoes />} />
            <Route path="/imoveis/simulador" element={<Simulador />} />
            <Route path="/imoveis/comparador" element={<Comparador />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/financeiro/comissoes" element={<Financeiro />} />
            <Route path="/financeiro/honorarios" element={<Financeiro />} />
            <Route path="/financeiro/notas" element={<Financeiro />} />
            <Route path="/negocios" element={<Funis />} />
            <Route path="/negocios/contratos" element={<Contratos />} />
            <Route path="/pos-venda" element={<PosVenda />} />
            <Route path="/marketing/whatsapp" element={<WhatsApp />} />
            <Route path="/marketing/campanhas" element={<Campanhas />} />
            <Route path="/marketing/mensagens" element={<CentralIA />} />
            <Route path="/marketing" element={<Campanhas />} />
            <Route path="/automatizacao" element={<Automacoes />} />
            <Route path="/crm/automacoes" element={<Automacoes />} />
            <Route path="/crm/cadencias" element={<Automacoes />} />
            <Route path="/crm/tarefas" element={<Agenda />} />
            <Route path="/central-ia" element={<CentralIA />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/configuracoes/integracoes" element={<Configuracoes />} />
            <Route path="/configuracoes/permissoes" element={<Configuracoes />} />
            <Route path="/configuracoes/modulos" element={<Configuracoes />} />
            <Route path="/configuracoes/campos" element={<Configuracoes />} />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
