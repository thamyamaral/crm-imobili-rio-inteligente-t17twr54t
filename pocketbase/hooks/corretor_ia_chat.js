routerAdd(
  'POST',
  '/backend/v1/corretor-ia/chat',
  (e) => {
    try {
      const userId = e.auth ? e.auth.id : null
      if (!userId) {
        return e.json(401, { error: 'Autenticação necessária.' })
      }

      const body = e.requestInfo().body || {}
      const message = body.message ? String(body.message).trim() : ''
      if (!message) {
        return e.json(400, { error: 'Mensagem não pode ser vazia.' })
      }

      const conv = $ai.agent('corretor-ia').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
        title: body.title || 'Conversa Imobiliária',
      })

      const result = $ai.agent('corretor-ia').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: message,
      })

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: result.citations || [],
        message_id: result.message_id,
      })
    } catch (err) {
      return e.json(500, { error: err.message || 'Erro ao consultar Corretor IA' })
    }
  },
  $apis.requireAuth(),
)
