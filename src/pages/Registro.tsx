import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function Registro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== passwordConfirm) {
      setErrorMsg('As senhas digitadas não coincidem.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('A senha deve conter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      await pb.collection('users').create({
        email: email.trim(),
        password,
        passwordConfirm,
        name: name.trim(),
      })

      // Login automático
      await pb.collection('users').authWithPassword(email.trim(), password)

      toast.success('Conta criada com sucesso!', {
        description: 'Seja bem-vinda ao HouseOS. Seu painel está pronto.',
      })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.'
      setErrorMsg(msg)
      toast.error('Erro no cadastro', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F3F4F6] items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border-slate-200/80 shadow-xl shadow-slate-200/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-bold text-slate-900 text-lg">HouseOS</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Criar sua Conta</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Cadastre-se para gerenciar seus clientes, imóveis e negócios com inteligência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Ex: Thata Amaral"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                E-mail profissional
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="seu.email@corretora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Senha (mínimo 8 caracteres)
              </Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="passwordConfirm" className="text-xs font-semibold text-slate-700">
                Confirmação de senha
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                required
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="text-sm bg-slate-50/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F766E] hover:bg-[#0D5C56] text-white font-medium py-2 text-sm shadow-md transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta autônoma
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Já possui uma conta cadastrada?{' '}
            <Link to="/login" className="text-[#0F766E] font-semibold hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
