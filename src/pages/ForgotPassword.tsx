import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await pb.collection('users').requestPasswordReset(email.trim())
      setSubmitted(true)
      toast.success('E-mail enviado com instruções de redefinição!')
    } catch (err: unknown) {
      toast.error('Não foi possível processar a solicitação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F3F4F6] items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border-slate-200/80 shadow-xl shadow-slate-200/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">Recuperação de Senha</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Digite seu e-mail para receber o link seguro de redefinição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
              <p className="text-sm font-medium text-slate-800">Instruções enviadas com sucesso!</p>
              <p className="text-xs text-slate-500">
                Se o e-mail informado estiver cadastrado em nossa base, você receberá um link nos
                próximos minutos.
              </p>
              <Button asChild variant="outline" className="w-full text-xs mt-2">
                <Link to="/login">Voltar para o Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  E-mail cadastrado
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Enviando link...
                  </>
                ) : (
                  'Enviar link de redefinição'
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 transition font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Voltar ao Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
