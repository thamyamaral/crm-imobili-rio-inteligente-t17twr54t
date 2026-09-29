migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const usersId = users.id

    // 1. tags
    const tags = new Collection({
      name: 'tags',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'color', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_tags_name ON tags (name)'],
    })
    app.save(tags)

    // 2. developers (construtoras / incorporadoras)
    const developers = new Collection({
      name: 'developers',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'cnpj', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_devs_name ON developers (name)'],
    })
    app.save(developers)

    // 3. developments (empreendimentos)
    const developments = new Collection({
      name: 'developments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'developer', type: 'relation', collectionId: developers.id, maxSelect: 1 },
        { name: 'name', type: 'text', required: true },
        { name: 'city', type: 'text' },
        { name: 'bairro', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'delivery_date', type: 'text' },
        { name: 'disponibilidade', type: 'text' },
        { name: 'files', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_devs_city_bairro ON developments (city, bairro)',
        'CREATE INDEX idx_devs_dev_rel ON developments (developer)',
      ],
    })
    app.save(developments)

    // 4. campaigns (campanhas de marketing)
    const campaigns = new Collection({
      name: 'campaigns',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'platform',
          type: 'select',
          values: ['meta', 'instagram', 'whatsapp', 'email', 'formulario'],
          maxSelect: 1,
        },
        { name: 'campaign_id', type: 'text' },
        { name: 'ad_set', type: 'text' },
        { name: 'ad', type: 'text' },
        { name: 'creative', type: 'text' },
        { name: 'form', type: 'text' },
        { name: 'property_id', type: 'text' },
        { name: 'investment', type: 'number' },
        { name: 'impressions', type: 'number' },
        { name: 'reach', type: 'number' },
        { name: 'clicks', type: 'number' },
        { name: 'leads_count', type: 'number' },
        { name: 'cpl', type: 'number' },
        { name: 'qualified_leads', type: 'number' },
        { name: 'visits', type: 'number' },
        { name: 'proposals', type: 'number' },
        { name: 'sales', type: 'number' },
        { name: 'vgv', type: 'number' },
        { name: 'commission', type: 'number' },
        { name: 'roi', type: 'number' },
        { name: 'start_date', type: 'text' },
        { name: 'end_date', type: 'text' },
        { name: 'status', type: 'select', values: ['ativa', 'pausada', 'concluida'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_campaigns_name ON campaigns (name)'],
    })
    app.save(campaigns)

    // 5. contacts (pessoas e empresas)
    const contacts = new Collection({
      name: 'contacts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'type',
          type: 'select',
          values: [
            'lead',
            'cliente',
            'investidor',
            'comprador',
            'vendedor',
            'proprietario',
            'corretor_parceiro',
            'construtora',
            'incorporadora',
            'imobiliaria',
            'prestador',
            'fornecedor',
          ],
          maxSelect: 1,
          required: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text' },
        { name: 'whatsapp', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'cpf_cnpj', type: 'text' },
        { name: 'profession', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'birth_date', type: 'text' },
        { name: 'social', type: 'json' },
        { name: 'origin', type: 'text' },
        { name: 'campaign', type: 'relation', collectionId: campaigns.id, maxSelect: 1 },
        { name: 'ad', type: 'text' },
        { name: 'agent', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'tags', type: 'relation', collectionId: tags.id, maxSelect: 10 },
        { name: 'classification', type: 'text' },
        {
          name: 'temperature',
          type: 'select',
          values: ['frio', 'morno', 'quente', 'prioridade'],
          maxSelect: 1,
        },
        { name: 'notes', type: 'text' },
        { name: 'consent', type: 'bool' },
        { name: 'custom_fields', type: 'json' },
        { name: 'score', type: 'number' },
        { name: 'last_contact_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_contacts_name ON contacts (name)',
        'CREATE INDEX idx_contacts_phone ON contacts (phone)',
        'CREATE INDEX idx_contacts_type ON contacts (type)',
        'CREATE INDEX idx_contacts_temp ON contacts (temperature)',
        'CREATE INDEX idx_contacts_score ON contacts (score DESC)',
      ],
    })
    app.save(contacts)

    // 6. clients (perfil imobiliário detalhado)
    const clients = new Collection({
      name: 'clients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'contact',
          type: 'relation',
          collectionId: contacts.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'objective',
          type: 'select',
          values: [
            'investimento',
            'moradia',
            'segunda_residencia',
            'renda',
            'valorizacao',
            'revenda',
            'patrimonio',
            'diversificacao',
          ],
          maxSelect: 1,
        },
        { name: 'capital_disponivel', type: 'number' },
        { name: 'max_entrada', type: 'number' },
        { name: 'aporte_mensal', type: 'number' },
        { name: 'reforcos', type: 'number' },
        { name: 'prazo_desejado', type: 'text' },
        { name: 'financiamento', type: 'bool' },
        {
          name: 'perfil_risco',
          type: 'select',
          values: ['conservador', 'moderado', 'arrojado'],
          maxSelect: 1,
        },
        { name: 'pref_pronto', type: 'bool' },
        { name: 'pref_planta', type: 'bool' },
        { name: 'cidade', type: 'text' },
        { name: 'bairro', type: 'text' },
        { name: 'dormitorios', type: 'number' },
        { name: 'suites', type: 'number' },
        { name: 'vagas', type: 'number' },
        { name: 'metragem', type: 'number' },
        { name: 'vista', type: 'text' },
        { name: 'perto_mar', type: 'bool' },
        { name: 'finalidade_futura', type: 'text' },
        { name: 'horizonte_investimento', type: 'text' },
        { name: 'liquidez_desejada', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_clients_contact ON clients (contact)'],
    })
    app.save(clients)

    // 7. properties (imóveis)
    const properties = new Collection({
      name: 'properties',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'development', type: 'relation', collectionId: developments.id, maxSelect: 1 },
        { name: 'unit_code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'type', type: 'select', values: ['novo', 'usado', 'captacao'], maxSelect: 1 },
        { name: 'owner', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'address', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'bairro', type: 'text' },
        { name: 'typology', type: 'text' },
        { name: 'area', type: 'number' },
        { name: 'dormitorios', type: 'number' },
        { name: 'suites', type: 'number' },
        { name: 'vagas', type: 'number' },
        { name: 'andar', type: 'number' },
        { name: 'posicao', type: 'text' },
        { name: 'vista', type: 'text' },
        { name: 'price', type: 'number' },
        { name: 'valor_m2', type: 'number' },
        { name: 'payment_conditions', type: 'json' },
        {
          name: 'correction',
          type: 'select',
          values: ['cub', 'incc', 'ipca', 'igp_m', 'juros', 'fixo'],
          maxSelect: 1,
        },
        { name: 'delivery_date', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['disponivel', 'reservado', 'vendido', 'inativo'],
          maxSelect: 1,
        },
        { name: 'matricula', type: 'text' },
        { name: 'docs_checklist', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'videos', type: 'json' },
        { name: 'presentation', type: 'text' },
        { name: 'is_captacao', type: 'bool' },
        { name: 'requested_value', type: 'number' },
        { name: 'min_value', type: 'number' },
        { name: 'commission_pct', type: 'number' },
        { name: 'exclusivity_start', type: 'text' },
        { name: 'exclusivity_end', type: 'text' },
        { name: 'exclusivity_renewed', type: 'bool' },
        { name: 'keys', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_props_city_bairro ON properties (city, bairro)',
        'CREATE INDEX idx_props_status ON properties (status)',
        'CREATE INDEX idx_props_price ON properties (price)',
        'CREATE INDEX idx_props_captacao ON properties (is_captacao)',
      ],
    })
    app.save(properties)

    // 8. pipelines (funis de venda)
    const pipelines = new Collection({
      name: 'pipelines',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'code', type: 'text' },
        { name: 'is_default', type: 'bool' },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_pipelines_name ON pipelines (name)'],
    })
    app.save(pipelines)

    // 9. stages (etapas do funil)
    const stages = new Collection({
      name: 'stages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'pipeline',
          type: 'relation',
          collectionId: pipelines.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'order', type: 'number', required: true },
        { name: 'color', type: 'text' },
        { name: 'rules', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_stages_pipeline_order ON stages (pipeline, "order")'],
    })
    app.save(stages)

    // 10. deals (negócios / oportunidades)
    const deals = new Collection({
      name: 'deals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'contact',
          type: 'relation',
          collectionId: contacts.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'property', type: 'relation', collectionId: properties.id, maxSelect: 1 },
        {
          name: 'pipeline',
          type: 'relation',
          collectionId: pipelines.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'stage', type: 'relation', collectionId: stages.id, required: true, maxSelect: 1 },
        { name: 'value', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'ganho', 'perdido'],
          maxSelect: 1,
          required: true,
        },
        { name: 'campaign', type: 'relation', collectionId: campaigns.id, maxSelect: 1 },
        { name: 'partner', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'next_action_at', type: 'text' },
        { name: 'next_action_type', type: 'text' },
        { name: 'next_action_desc', type: 'text' },
        { name: 'won_at', type: 'text' },
        { name: 'lost_at', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_deals_stage ON deals (stage)',
        'CREATE INDEX idx_deals_status ON deals (status)',
        'CREATE INDEX idx_deals_contact ON deals (contact)',
        'CREATE INDEX idx_deals_pipeline ON deals (pipeline)',
      ],
    })
    app.save(deals)

    // 11. tasks (tarefas e follow-ups)
    const tasks = new Collection({
      name: 'tasks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'deal', type: 'relation', collectionId: deals.id, maxSelect: 1 },
        { name: 'contact', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        {
          name: 'type',
          type: 'select',
          values: [
            'tarefa',
            'lembrete',
            'ligacao',
            'whatsapp',
            'email',
            'reuniao',
            'visita',
            'envio_proposta',
            'retorno',
            'documento_pendente',
          ],
          maxSelect: 1,
          required: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'text', required: true },
        { name: 'due_time', type: 'text' },
        { name: 'assigned_to', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'priority', type: 'select', values: ['baixa', 'media', 'alta'], maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'concluida', 'cancelada'],
          maxSelect: 1,
          required: true,
        },
        { name: 'completed_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tasks_due_status ON tasks (due_date, status)',
        'CREATE INDEX idx_tasks_contact ON tasks (contact)',
        'CREATE INDEX idx_tasks_deal ON tasks (deal)',
      ],
    })
    app.save(tasks)

    // 12. activities (histórico de linha do tempo)
    const activities = new Collection({
      name: 'activities',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'contact', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'deal', type: 'relation', collectionId: deals.id, maxSelect: 1 },
        { name: 'type', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'occurred_at', type: 'text' },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_activities_contact ON activities (contact)',
        'CREATE INDEX idx_activities_deal ON activities (deal)',
      ],
    })
    app.save(activities)

    // 13. messages (mensagens WhatsApp, Instagram, Email)
    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'contact', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'deal', type: 'relation', collectionId: deals.id, maxSelect: 1 },
        {
          name: 'channel',
          type: 'select',
          values: ['whatsapp', 'instagram', 'email'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'direction',
          type: 'select',
          values: ['inbound', 'outbound'],
          maxSelect: 1,
          required: true,
        },
        { name: 'body', type: 'text', required: true },
        { name: 'attachments', type: 'json' },
        { name: 'status', type: 'text' },
        { name: 'provider_metadata', type: 'json' },
        { name: 'timestamp', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_messages_contact ON messages (contact)'],
    })
    app.save(messages)

    // 14. contracts (contratos imobiliários)
    const contracts = new Collection({
      name: 'contracts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'template',
          type: 'select',
          values: [
            'autorizacao_venda',
            'autorizacao_visita',
            'autorizacao_divulgacao',
            'agenciamento',
            'exclusividade',
            'proposta_compra',
            'proposta_venda',
            'reserva',
            'parceria_corretores',
            'divisao_comissao',
            'recibo',
            'termo_honorarios',
            'cessao',
            'distrato',
            'confidencialidade',
            'ficha_visita',
          ],
          maxSelect: 1,
          required: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'deal', type: 'relation', collectionId: deals.id, maxSelect: 1 },
        { name: 'contact', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'property', type: 'relation', collectionId: properties.id, maxSelect: 1 },
        { name: 'filled_data', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['gerado', 'enviado', 'visualizado', 'assinado', 'concluido'],
          maxSelect: 1,
        },
        { name: 'signed_at', type: 'text' },
        { name: 'document_url', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_contracts_contact ON contracts (contact)'],
    })
    app.save(contracts)

    // 15. commissions (comissões e cronograma)
    const commissions = new Collection({
      name: 'commissions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'deal', type: 'relation', collectionId: deals.id, required: true, maxSelect: 1 },
        { name: 'total_value', type: 'number', required: true },
        { name: 'percent', type: 'number' },
        { name: 'honorarios', type: 'number' },
        { name: 'scheduled', type: 'json' }, // [{parcela, value, status previsto/faturado/recebido/atrasado, due_date, received_at}]
        { name: 'received_total', type: 'number' },
        { name: 'pending_total', type: 'number' },
        { name: 'partners_split', type: 'json' },
        { name: 'builder_payer', type: 'text' },
        { name: 'taxes', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_commissions_deal ON commissions (deal)'],
    })
    app.save(commissions)

    // 16. invoices (notas fiscais)
    const invoices = new Collection({
      name: 'invoices',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'issue_date', type: 'text' },
        { name: 'value', type: 'number', required: true },
        { name: 'service', type: 'text' },
        { name: 'client', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'file_url', type: 'text' },
        { name: 'status', type: 'select', values: ['emitida', 'paga', 'cancelada'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_invoices_number ON invoices (number)'],
    })
    app.save(invoices)

    // 17. honoraries (honorários avulsos de mentoria e consultoria)
    const honoraries = new Collection({
      name: 'honoraries',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'client',
          type: 'relation',
          collectionId: contacts.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'service', type: 'text', required: true },
        { name: 'value', type: 'number', required: true },
        { name: 'invoice', type: 'relation', collectionId: invoices.id, maxSelect: 1 },
        { name: 'due_date', type: 'text' },
        { name: 'paid_at', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['previsto', 'faturado', 'recebido', 'atrasado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_honoraries_client ON honoraries (client)'],
    })
    app.save(honoraries)

    // 18. automations
    const automations = new Collection({
      name: 'automations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'trigger', type: 'text', required: true },
        { name: 'conditions', type: 'json' },
        { name: 'actions', type: 'json' },
        { name: 'cadence', type: 'json' },
        { name: 'status', type: 'select', values: ['ativo', 'inativo'], maxSelect: 1 },
        { name: 'last_run_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_automations_status ON automations (status)'],
    })
    app.save(automations)

    // 19. automation_runs
    const automationRuns = new Collection({
      name: 'automation_runs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'automation',
          type: 'relation',
          collectionId: automations.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'status', type: 'text', required: true },
        { name: 'entity_id', type: 'text' },
        { name: 'payload', type: 'json' },
        { name: 'output', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(automationRuns)

    // 20. prompts (biblioteca de prompts)
    const prompts = new Collection({
      name: 'prompts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_prompts_cat ON prompts (category)'],
    })
    app.save(prompts)

    // 21. message_templates (modelos de mensagem com placeholders)
    const messageTemplates = new Collection({
      name: 'message_templates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'body', type: 'text', required: true },
        { name: 'placeholders', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_msg_templates_cat ON message_templates (category)'],
    })
    app.save(messageTemplates)

    // 22. custom_fields
    const customFields = new Collection({
      name: 'custom_fields',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'entity',
          type: 'select',
          values: ['contacts', 'deals', 'properties'],
          maxSelect: 1,
          required: true,
        },
        { name: 'label', type: 'text', required: true },
        { name: 'field_key', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['text', 'number', 'date', 'select', 'multi_select', 'boolean'],
          maxSelect: 1,
          required: true,
        },
        { name: 'options', type: 'json' },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(customFields)

    // 23. audit_logs
    const auditLogs = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'user', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'action', type: 'text', required: true },
        { name: 'entity_type', type: 'text', required: true },
        { name: 'entity_id', type: 'text' },
        { name: 'previous', type: 'json' },
        { name: 'new_state', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id)'],
    })
    app.save(auditLogs)

    // 24. integrations
    const integrations = new Collection({
      name: 'integrations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'provider', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'inativo', 'pendente', 'erro'],
          maxSelect: 1,
        },
        { name: 'config', type: 'json' },
        { name: 'last_sync_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_integrations_provider ON integrations (provider)'],
    })
    app.save(integrations)

    // 25. integration_logs
    const integrationLogs = new Collection({
      name: 'integration_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'provider', type: 'text', required: true },
        { name: 'event', type: 'text' },
        { name: 'status', type: 'text', required: true },
        { name: 'payload', type: 'json' },
        { name: 'error', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(integrationLogs)

    // 26. webhooks
    const webhooks = new Collection({
      name: 'webhooks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'events', type: 'json' },
        { name: 'active', type: 'bool' },
        { name: 'secret', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(webhooks)
  },
  (app) => {
    const toDelete = [
      'webhooks',
      'integration_logs',
      'integrations',
      'audit_logs',
      'custom_fields',
      'message_templates',
      'prompts',
      'automation_runs',
      'automations',
      'honoraries',
      'invoices',
      'commissions',
      'contracts',
      'messages',
      'activities',
      'tasks',
      'deals',
      'stages',
      'pipelines',
      'properties',
      'clients',
      'contacts',
      'campaigns',
      'developments',
      'developers',
      'tags',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
