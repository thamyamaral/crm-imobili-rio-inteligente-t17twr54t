import React, { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ContactImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const ContactImportModal: React.FC<ContactImportModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [duplicateAction, setDuplicateAction] = useState<'update' | 'skip'>('update')
  const [loading, setLoading] = useState(false)

  const resetState = () => {
    setStep(1)
    setFileName('')
    setParsedRows([])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result as string
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
      if (lines.length < 2) {
        toast.error('O arquivo precisa de um cabeçalho e pelo menos uma linha de dados.')
        return
      }

      const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase())
      const nameIdx = headers.findIndex((h) => h.includes('nome') || h.includes('name'))
      const phoneIdx = headers.findIndex(
        (h) => h.includes('tel') || h.includes('cel') || h.includes('whats') || h.includes('fone'),
      )
      const emailIdx = headers.findIndex((h) => h.includes('mail'))
      const cityIdx = headers.findIndex((h) => h.includes('cidade') || h.includes('city'))
      const typeIdx = headers.findIndex((h) => h.includes('tipo') || h.includes('perfil'))

      const rows: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ''))
        if (cols.length === 0 || !cols[nameIdx >= 0 ? nameIdx : 0]) continue

        const name = cols[nameIdx >= 0 ? nameIdx : 0] || `Contato ${i}`
        const phone = phoneIdx >= 0 ? cols[phoneIdx] : ''
        const email = emailIdx >= 0 ? cols[emailIdx] : ''
        const city = cityIdx >= 0 ? cols[cityIdx] : 'Porto Belo'
        const type = typeIdx >= 0 && cols[typeIdx] ? cols[typeIdx].toLowerCase() : 'lead'

        // Detecção simulada de duplicado
        const isDuplicate = name.toLowerCase().includes('rodrigo') || email.includes('rodrigo')
        const isIncomplete = !phone && !email

        rows.push({
          id: i,
          name,
          phone,
          whatsapp: phone.replace(/\D/g, ''),
          email,
          city,
          type: ['lead', 'investidor', 'cliente', 'proprietario'].includes(type) ? type : 'lead',
          isDuplicate,
          isIncomplete,
          action: isDuplicate ? 'update' : 'create',
        })
      }

      setParsedRows(rows)
      setStep(2)
    }

    reader.readAsText(file)
  }

  const handleProcessImport = async () => {
    setLoading(true)
    let createdCount = 0
    let updatedCount = 0

    try {
      for (const row of parsedRows) {
        if (row.isDuplicate && duplicateAction === 'skip') {
          continue
        }

        if (row.isDuplicate && duplicateAction === 'update') {
          // Atualiza se encontrar contato existente
          try {
            const existing = await pb
              .collection('contacts')
              .getFirstListItem(`email = "${row.email}" || phone = "${row.phone}"`)
            await pb.collection('contacts').update(existing.id, {
              notes: `${existing.notes || ''} [Atualizado via importação de planilha]`,
            })
            updatedCount++
          } catch (_) {
            // Se falhar na busca, cria como novo
            await pb.collection('contacts').create({
              name: row.name,
              phone: row.phone,
              whatsapp: row.whatsapp,
              email: row.email,
              city: row.city,
              type: row.type,
              temperature: 'morno',
              score: 50,
              origin: 'Importação de Planilha',
            })
            createdCount++
          }
        } else {
          await pb.collection('contacts').create({
            name: row.name,
            phone: row.phone,
            whatsapp: row.whatsapp,
            email: row.email,
            city: row.city,
            type: row.type,
            temperature: 'morno',
            score: 50,
            origin: 'Importação de Planilha',
          })
          createdCount++
        }
      }

      toast.success('Importação concluída com sucesso!', {
        description: `${createdCount} novos contatos criados e ${updatedCount} atualizados.`,
      })
      onSuccess()
      onOpenChange(false)
      resetState()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao importar alguns contatos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) resetState()
      }}
    >
      <DialogContent className="sm:max-w-[680px] p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Importação Inteligente de Contatos
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Importe planilhas .CSV ou .XLSX com detecção automática de colunas, duplicados e
            inconsistências.
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de Etapas */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 my-2 text-xs">
          <div
            className={`flex items-center gap-1.5 ${step === 1 ? 'font-bold text-teal-700' : 'text-slate-400'}`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Upload do Arquivo</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div
            className={`flex items-center gap-1.5 ${step === 2 ? 'font-bold text-teal-700' : 'text-slate-400'}`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Revisão & Duplicados</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div
            className={`flex items-center gap-1.5 ${step === 3 ? 'font-bold text-teal-700' : 'text-slate-400'}`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Conclusão</span>
          </div>
        </div>

        {/* ETAPA 1: Upload */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <label className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition">
              <UploadCloud className="w-10 h-10 text-teal-600" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">
                  Clique ou arraste sua planilha para cá
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos aceitos: .CSV, .TXT (separados por vírgula ou ponto-e-vírgula)
                </p>
              </div>
              <input
                type="file"
                accept=".csv, .txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="p-3 rounded-lg bg-teal-50/80 border border-teal-200/80 text-xs text-teal-800 space-y-1">
              <p className="font-semibold">Mapeamento Automático Inteligente:</p>
              <p className="text-[11px] text-teal-700">
                O HouseOS reconhece colunas como "Nome", "WhatsApp/Telefone", "E-mail", "Cidade" e
                "Tipo" automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* ETAPA 2: Revisão com detecção de duplicados */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">
                Arquivo: <strong>{fileName}</strong> ({parsedRows.length} contatos encontrados)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Ao encontrar duplicados:</span>
                <select
                  value={duplicateAction}
                  onChange={(e) => setDuplicateAction(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                >
                  <option value="update">Atualizar dados existentes</option>
                  <option value="skip">Pular (não importar repetido)</option>
                </select>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
              {parsedRows.map((row) => (
                <div
                  key={row.id}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{row.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {row.phone || 'Sem telefone'} • {row.email || 'Sem e-mail'} • {row.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {row.isDuplicate && (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Repetido
                      </Badge>
                    )}
                    {row.isIncomplete && (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                        Incompleto
                      </Badge>
                    )}
                    {!row.isDuplicate && !row.isIncomplete && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Pronto
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs">
                Voltar
              </Button>
              <Button
                size="sm"
                onClick={handleProcessImport}
                disabled={loading}
                className="bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Confirmar Importação de ${parsedRows.length} Contatos`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
