routerAdd('POST', '/backend/v1/meta-leads/webhook', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const contactsCol = $app.findCollectionByNameOrId('contacts')

    // Normalização simples do lead recebido
    const leadName = body.full_name || body.name || 'Novo Lead Anúncio'
    const phone = body.phone_number || body.phone || body.whatsapp || ''
    const email = body.email || ''
    const origin = body.origin || 'Campanha Meta Ads'
    const campaignId = body.campaign_id || ''

    const rec = new Record(contactsCol)
    rec.set('type', 'lead')
    rec.set('name', leadName)
    rec.set('phone', phone)
    rec.set('whatsapp', phone.replace(/\D/g, ''))
    rec.set('email', email)
    rec.set('origin', origin)
    if (campaignId) rec.set('campaign', campaignId)
    rec.set('temperature', 'quente')
    rec.set('score', 75)
    rec.set('consent', true)
    rec.set('classification', 'Lead Meta Capturado')
    rec.set('notes', 'Lead recebido automaticamente via webhook da Meta Ads.')
    rec.set('last_contact_at', new Date().toISOString())
    $app.save(rec)

    return e.json(200, { success: true, contact_id: rec.id })
  } catch (err) {
    return e.json(400, { success: false, error: err.message })
  }
})
