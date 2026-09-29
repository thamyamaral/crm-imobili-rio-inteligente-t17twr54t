import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('thata_amaral@hotmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await pb.collection('users').authWithPassword(email.trim(), password)
      toast.success('Bem-vinda ao HouseOS!', {
        description: 'Painel operacional imobiliário carregado com sucesso.',
      })
      const destination =
        (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Credenciais inválidas. Verifique seu e-mail e senha.'
      setErrorMsg(msg)
      toast.error('Falha no acesso', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F3F4F6]">
      {/* Coluna Esquerda - Hero de Marca Imobiliária */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-tr from-teal-800/30 via-slate-900/60 to-slate-950 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#2563EB] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-900/50">
            H
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">HouseOS</span>
            <span className="block text-xs text-teal-400 font-semibold tracking-wider uppercase">
              Sistema Operacional da Corretora Autônoma
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nenhum lead ativo sem próxima ação</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Consultoria de alto padrão, gestão ágil e inteligência em cada etapa.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Centralize contatos, curadoria de imóveis, negociações no funil, agenciamentos com
            controle de exclusividade e cálculos financeiros em uma plataforma sob medida.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-800">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">100%</p>
              <p className="text-xs text-slate-400">Autonomia & Praticidade</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-400 tabular-nums">24/7</p>
              <p className="text-xs text-slate-400">Assistente Corretor IA</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} HouseOS • Gestão Imobiliária Inteligente</span>
          <span className="flex items-center gap-1.5 text-teal-400">
            <ShieldCheck className="w-4 h-4" /> Dados Seguros & Criptografados
          </span>
        </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md bg-white border-slate-200/80 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold">
                H
              </div>
              <span className="font-bold text-slate-900 text-lg">HouseOS</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Acessar plataforma</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Digite suas credenciais para entrar no seu sistema operacional imobiliário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  E-mail profissional
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="thata_amaral@hotmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Senha de acesso
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#0F766E] hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm bg-slate-50/50"
                />
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200/70 rounded-lg text-xs text-teal-800 space-y-1">
                <p className="font-semibold">Credenciais de Demonstração (Seed):</p>
                <p className="font-mono text-[11px]">E-mail: thata_amaral@hotmail.com</p>
                <p className="font-mono text-[11px]">Senha: Skip@Pass</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F766E] hover:bg-[#0D5C56] text-white font-medium py-2 text-sm shadow-md transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no HouseOS
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Ainda não tem conta?{' '}
              <Link to="/registro" className="text-[#0F766E] font-semibold hover:underline">
                Criar conta autônoma
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
