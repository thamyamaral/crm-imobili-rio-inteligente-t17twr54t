import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error')

  useEffect(() => {
    if (!token) return
    pb.collection('users')
      .confirmEmailChange(token, '')
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen w-full flex bg-[#F3F4F6] items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border-slate-200 shadow-lg text-center p-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Confirmação de Troca de E-mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-sm text-slate-600">Confirmando alteração...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-12 h-12 text-teal-600" />
              <p className="text-sm font-semibold text-slate-800">
                Novo e-mail confirmado com sucesso!
              </p>
              <Button asChild className="mt-4 bg-[#0F766E] text-white">
                <Link to="/login">Fazer Login</Link>
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="w-12 h-12 text-rose-600" />
              <p className="text-sm font-semibold text-slate-800">Token inválido ou expirado.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/login">Voltar para o Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
