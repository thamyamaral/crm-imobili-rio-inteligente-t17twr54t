migrate(
  (app) => {
    // 1. Seed Usuário Admin Thata Amaral
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'thata_amaral@hotmail.com')
    } catch (_) {
      adminUser = new Record(users)
      adminUser.setEmail('thata_amaral@hotmail.com')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Thata Amaral')
      app.save(adminUser)
    }

    // 2. Seed Tags
    const tagsCol = app.findCollectionByNameOrId('tags')
    const defaultTags = [
      { name: 'Investidor', color: '#0F766E', category: 'Perfil' },
      { name: 'Viva Park', color: '#2563EB', category: 'Empreendimento' },
      { name: 'Itapema', color: '#0284C7', category: 'Localização' },
      { name: 'Porto Belo', color: '#10B981', category: 'Localização' },
      { name: 'Lead Meta', color: '#8B5CF6', category: 'Origem' },
      { name: 'Cliente antigo', color: '#6B7280', category: 'Relacionamento' },
      { name: 'Alto patrimônio', color: '#F59E0B', category: 'Financeiro' },
      { name: 'Pós-venda', color: '#EC4899', category: 'Estágio' },
    ]

    const tagMap = {}
    for (const t of defaultTags) {
      let rec
      try {
        rec = app.findFirstRecordByData('tags', 'name', t.name)
      } catch (_) {
        rec = new Record(tagsCol)
        rec.set('name', t.name)
        rec.set('color', t.color)
        rec.set('category', t.category)
        app.save(rec)
      }
      tagMap[t.name] = rec.id
    }

    // 3. Seed Pipelines & Stages
    const pipesCol = app.findCollectionByNameOrId('pipelines')
    const stagesCol = app.findCollectionByNameOrId('stages')

    const pipelinesDef = [
      {
        name: 'Comprador / Investidor',
        code: 'comprador',
        is_default: true,
        description: 'Jornada completa de compra e investimento imobiliário',
        stages: [
          { name: 'Novo lead', color: '#94A3B8' },
          { name: 'Tentativa de contato', color: '#64748B' },
          { name: 'Contato realizado', color: '#38BDF8' },
          { name: 'Qualificação', color: '#0EA5E9' },
          { name: 'Curadoria', color: '#0284C7' },
          { name: 'Apresentação', color: '#6366F1' },
          { name: 'Visita', color: '#8B5CF6' },
          { name: 'Proposta', color: '#F59E0B' },
          { name: 'Negociação', color: '#D97706' },
          { name: 'Contrato', color: '#10B981' },
          { name: 'Ganhou', color: '#16A34A' },
          { name: 'Perdeu', color: '#EF4444' },
        ],
      },
      {
        name: 'Captação de Imóveis',
        code: 'captacao',
        is_default: false,
        description: 'Agenciamento e captação com proprietários e parceiros',
        stages: [
          { name: 'Proprietário identificado', color: '#94A3B8' },
          { name: 'Primeiro contato', color: '#38BDF8' },
          { name: 'Avaliação', color: '#0EA5E9' },
          { name: 'Proposta de agenciamento', color: '#6366F1' },
          { name: 'Documentação', color: '#F59E0B' },
          { name: 'Assinatura', color: '#10B981' },
          { name: 'Imóvel ativo', color: '#0F766E' },
          { name: 'Divulgação', color: '#2563EB' },
          { name: 'Visita', color: '#8B5CF6' },
          { name: 'Proposta', color: '#D97706' },
          { name: 'Negociação', color: '#F97316' },
          { name: 'Vendido', color: '#16A34A' },
        ],
      },
      {
        name: 'Pós-Venda & Fidelização',
        code: 'pos_venda',
        is_default: false,
        description: 'Acompanhamento do contrato, obra e fidelização',
        stages: [
          { name: 'Contrato assinado', color: '#10B981' },
          { name: 'Documentação', color: '#0EA5E9' },
          { name: 'Financeiro', color: '#F59E0B' },
          { name: 'Acompanhamento', color: '#6366F1' },
          { name: 'Obra', color: '#8B5CF6' },
          { name: 'Entrega', color: '#0F766E' },
          { name: 'Pós-venda', color: '#EC4899' },
          { name: 'Indicação', color: '#16A34A' },
        ],
      },
    ]

    const stageMap = {} // name -> stage record id
    const pipeMap = {}

    for (const p of pipelinesDef) {
      let pRec
      try {
        pRec = app.findFirstRecordByData('pipelines', 'name', p.name)
      } catch (_) {
        pRec = new Record(pipesCol)
        pRec.set('name', p.name)
        pRec.set('code', p.code)
        pRec.set('is_default', p.is_default)
        pRec.set('description', p.description)
        app.save(pRec)
      }
      pipeMap[p.code] = pRec.id

      for (let i = 0; i < p.stages.length; i++) {
        const s = p.stages[i]
        let sRec
        try {
          const found = app.findRecordsByFilter(
            'stages',
            `pipeline = '${pRec.id}' && name = '${s.name}'`,
            '',
            1,
            0,
          )
          if (found.length > 0) {
            sRec = found[0]
          } else {
            throw new Error('not found')
          }
        } catch (_) {
          sRec = new Record(stagesCol)
          sRec.set('pipeline', pRec.id)
          sRec.set('name', s.name)
          sRec.set('order', i + 1)
          sRec.set('color', s.color)
          app.save(sRec)
        }
        stageMap[`${p.code}_${s.name}`] = sRec.id
      }
    }

    // 4. Seed Developers & Developments
    const devCol = app.findCollectionByNameOrId('developers')
    let devRec
    try {
      devRec = app.findFirstRecordByData('developers', 'name', 'Vokkan Urbanismo')
    } catch (_) {
      devRec = new Record(devCol)
      devRec.set('name', 'Vokkan Urbanismo')
      devRec.set('cnpj', '12.345.678/0001-90')
      devRec.set('phone', '(47) 3368-9900')
      devRec.set('email', 'contato@vokkan.com.br')
      devRec.set('city', 'Porto Belo')
      devRec.set('state', 'SC')
      app.save(devRec)
    }

    const developCol = app.findCollectionByNameOrId('developments')
    let dvRec
    try {
      dvRec = app.findFirstRecordByData('developments', 'name', 'Viva Park Porto Belo')
    } catch (_) {
      dvRec = new Record(developCol)
      dvRec.set('developer', devRec.id)
      dvRec.set('name', 'Viva Park Porto Belo')
      dvRec.set('city', 'Porto Belo')
      dvRec.set('bairro', 'Perequê')
      dvRec.set('address', 'Av. José Neoli Cruz, 100')
      dvRec.set(
        'description',
        'O primeiro bairro parque do Brasil, planejado por Jaime Lerner com alta valorização e qualidade de vida.',
      )
      dvRec.set('delivery_date', '2026-12-01')
      dvRec.set('disponibilidade', 'Fase 2 liberada')
      dvRec.set('files', [
        { name: 'Tabela_Comercial_VivaPark_2025.pdf', type: 'tabela', size: '2.4MB' },
        { name: 'Memorial_Descritivo.pdf', type: 'memorial', size: '4.8MB' },
        { name: 'Planta_Tipo_3Suites.pdf', type: 'planta', size: '1.2MB' },
      ])
      app.save(dvRec)
    }

    // 5. Seed Properties
    const propCol = app.findCollectionByNameOrId('properties')
    const propertiesData = [
      {
        development: dvRec.id,
        unit_code: 'TORRE-A-1402',
        title: 'Apartamento Vista Parque - 3 Suítes Viva Park',
        type: 'novo',
        city: 'Porto Belo',
        bairro: 'Perequê',
        typology: 'Apartamento',
        area: 135.5,
        dormitorios: 3,
        suites: 3,
        vagas: 2,
        andar: 14,
        posicao: 'Frente',
        vista: 'Parque Central e Lago',
        price: 1850000,
        valor_m2: 13653,
        payment_conditions: {
          entrada: 370000,
          parcelas_qtd: 60,
          parcelas_valor: 12333,
          reforcos_qtd: 5,
          reforcos_valor: 74000,
          chaves: 370000,
        },
        correction: 'cub',
        delivery_date: '2026-12-01',
        status: 'disponivel',
        matricula: '128.450',
        is_captacao: false,
        docs_checklist: { matricula: true, iptu: true, certidoes: true, projeto_aprovado: true },
        images: [
          'https://img.usecurling.com/p/800/600?q=modern%20luxury%20apartment%20living%20room',
          'https://img.usecurling.com/p/800/600?q=luxury%20condo%20balcony%20view',
        ],
      },
      {
        development: null,
        unit_code: 'ITP-COB-01',
        title: 'Cobertura Duplex Frente Mar - Meia Praia Itapema',
        type: 'usado',
        city: 'Itapema',
        bairro: 'Meia Praia',
        typology: 'Cobertura',
        area: 280,
        dormitorios: 4,
        suites: 4,
        vagas: 4,
        andar: 18,
        posicao: 'Frente Mar',
        vista: 'Mar Panorâmica',
        price: 4950000,
        valor_m2: 17678,
        payment_conditions: {
          entrada: 1500000,
          parcelas_qtd: 36,
          parcelas_valor: 45000,
          reforcos_qtd: 3,
          reforcos_valor: 250000,
          saldo_remanescente: 1080000,
        },
        correction: 'incc',
        delivery_date: 'Pronto',
        status: 'disponivel',
        matricula: '54.210',
        is_captacao: false,
        docs_checklist: { matricula: true, iptu: true, certidoes: true, habite_se: true },
        images: [
          'https://img.usecurling.com/p/800/600?q=oceanfront%20luxury%20penthouse%20brazil',
          'https://img.usecurling.com/p/800/600?q=rooftop%20pool%20deck%20sea%20view',
        ],
      },
      {
        development: null,
        unit_code: 'CAP-BC-804',
        title: 'Captação Exclusiva - Barra Sul Balneário Camboriú',
        type: 'captacao',
        city: 'Balneário Camboriú',
        bairro: 'Barra Sul',
        typology: 'Apartamento',
        area: 165,
        dormitorios: 3,
        suites: 3,
        vagas: 3,
        andar: 8,
        posicao: 'Lateral Mar',
        vista: 'Rio e Marina',
        price: 2890000,
        valor_m2: 17515,
        payment_conditions: { entrada: 800000, financiamento_ou_parcelamento: 2090000 },
        correction: 'fixo',
        delivery_date: 'Pronto',
        status: 'disponivel',
        matricula: '89.123',
        is_captacao: true,
        requested_value: 2890000,
        min_value: 2750000,
        commission_pct: 6.0,
        exclusivity_start: '2025-01-10',
        exclusivity_end: '2025-04-10',
        exclusivity_renewed: false,
        keys: 'Na portaria com Sr. Marcos',
        docs_checklist: { matricula: true, iptu: true, autorizacao_venda: true, certidoes: false },
        images: [
          'https://img.usecurling.com/p/800/600?q=modern%20apartment%20marina%20view',
          'https://img.usecurling.com/p/800/600?q=balcony%20luxury%20condo',
        ],
      },
    ]

    const propRecords = []
    for (const p of propertiesData) {
      let rec
      try {
        rec = app.findFirstRecordByData('properties', 'title', p.title)
      } catch (_) {
        rec = new Record(propCol)
        for (const [k, v] of Object.entries(p)) {
          rec.set(k, v)
        }
        app.save(rec)
      }
      propRecords.push(rec)
    }

    // 6. Seed Campaigns
    const campCol = app.findCollectionByNameOrId('campaigns')
    let campRec
    try {
      campRec = app.findFirstRecordByData(
        'campaigns',
        'name',
        'Meta Ads - Viva Park Lançamento 2025',
      )
    } catch (_) {
      campRec = new Record(campCol)
      campRec.set('name', 'Meta Ads - Viva Park Lançamento 2025')
      campRec.set('platform', 'meta')
      campRec.set('campaign_id', 'CAMP-META-901')
      campRec.set('ad_set', 'Investidores SC & PR - Renda 30k+')
      campRec.set('ad', 'Carrossel Vídeo Jaime Lerner')
      campRec.set('creative', 'Video_Destaque_BairroParque.mp4')
      campRec.set('form', 'Formulário Nativo Instantâneo Meta')
      campRec.set('property_id', propRecords[0]?.id || '')
      campRec.set('investment', 4850)
      campRec.set('impressions', 64200)
      campRec.set('reach', 48900)
      campRec.set('clicks', 1840)
      campRec.set('leads_count', 38)
      campRec.set('cpl', 127.63)
      campRec.set('qualified_leads', 19)
      campRec.set('visits', 6)
      campRec.set('proposals', 3)
      campRec.set('sales', 1)
      campRec.set('vgv', 1850000)
      campRec.set('commission', 111000)
      campRec.set('roi', 2188) // 21.88x
      campRec.set('start_date', '2025-02-01')
      campRec.set('end_date', '2025-03-31')
      campRec.set('status', 'ativa')
      app.save(campRec)
    }

    // 7. Seed Contacts & Clients
    const contCol = app.findCollectionByNameOrId('contacts')
    const clientCol = app.findCollectionByNameOrId('clients')

    const contactsData = [
      {
        type: 'investidor',
        name: 'Dr. Rodrigo Mendonça',
        phone: '(47) 99123-4567',
        whatsapp: '47991234567',
        email: 'rodrigo.mendonca@medclinica.com.br',
        cpf_cnpj: '458.912.309-88',
        profession: 'Médico Cirurgião e Investidor',
        city: 'Porto Belo',
        state: 'SC',
        address: 'Rua das Palmeiras, 450',
        origin: 'Campanha Meta Ads',
        campaign: campRec.id,
        agent: adminUser.id,
        tags: [
          tagMap['Investidor'],
          tagMap['Porto Belo'],
          tagMap['Viva Park'],
          tagMap['Alto patrimônio'],
        ].filter(Boolean),
        classification: 'Investidor Qualificado',
        temperature: 'prioridade',
        notes:
          'Busca diversificação imobiliária no litoral. Já possui 2 flats em Balneário e busca valorização de ciclo em Porto Belo.',
        consent: true,
        score: 94,
        last_contact_at: '2025-02-27T10:30:00Z',
        client_profile: {
          objective: 'investimento',
          capital_disponivel: 1200000,
          max_entrada: 450000,
          aporte_mensal: 25000,
          reforcos: 100000,
          prazo_desejado: '48 meses',
          financiamento: false,
          perfil_risco: 'arrojado',
          pref_planta: true,
          cidade: 'Porto Belo',
          bairro: 'Perequê',
          dormitorios: 3,
          suites: 3,
          vagas: 2,
          horizonte_investimento: 'Revenda pré-chaves (36 meses)',
          liquidez_desejada: 'Alta revenda',
        },
      },
      {
        type: 'lead',
        name: 'Mariana Duarte Prado',
        phone: '(41) 98845-9012',
        whatsapp: '41988459012',
        email: 'mariana.prado@advocacia.com.br',
        cpf_cnpj: '234.567.890-12',
        profession: 'Advogada Corporativa',
        city: 'Curitiba',
        state: 'PR',
        origin: 'Instagram Direct',
        campaign: campRec.id,
        agent: adminUser.id,
        tags: [tagMap['Lead Meta'], tagMap['Itapema']].filter(Boolean),
        classification: 'Compradora 2ª Residência',
        temperature: 'quente',
        notes:
          'Solicitou vídeo da cobertura em Itapema. Aguarda envio de cálculo de fluxo de pagamento.',
        consent: true,
        score: 82,
        last_contact_at: '2025-02-28T09:00:00Z',
        client_profile: {
          objective: 'segunda_residencia',
          capital_disponivel: 1800000,
          max_entrada: 1200000,
          aporte_mensal: 40000,
          financiamento: true,
          perfil_risco: 'moderado',
          pref_pronto: true,
          cidade: 'Itapema',
          bairro: 'Meia Praia',
          dormitorios: 4,
          suites: 4,
          vagas: 3,
        },
      },
      {
        type: 'cliente',
        name: 'Carlos Eduardo Silveira',
        phone: '(11) 97120-3344',
        whatsapp: '11971203344',
        email: 'carlos.silveira@techholding.com.br',
        cpf_cnpj: '112.334.556-78',
        profession: 'Empresário de Tecnologia',
        city: 'São Paulo',
        state: 'SP',
        origin: 'Indicação',
        agent: adminUser.id,
        tags: [tagMap['Cliente antigo'], tagMap['Alto patrimônio']].filter(Boolean),
        classification: 'Comprador Fiel',
        temperature: 'morno',
        notes:
          'Comprou unidade em 2023. Sem contato ativo há 34 dias. Necessita de follow-up com novas oportunidades.',
        consent: true,
        score: 68,
        last_contact_at: '2025-01-24T14:15:00Z',
        client_profile: {
          objective: 'patrimonio',
          capital_disponivel: 3000000,
          max_entrada: 1500000,
          perfil_risco: 'conservador',
          cidade: 'Balneário Camboriú',
        },
      },
      {
        type: 'proprietario',
        name: 'Fernando Guimarães Borges',
        phone: '(47) 99988-1122',
        whatsapp: '47999881122',
        email: 'fguimaraes@borgescon.com.br',
        cpf_cnpj: '332.998.112-44',
        profession: 'Engenheiro Civil',
        city: 'Balneário Camboriú',
        state: 'SC',
        origin: 'Prospecção Ativa',
        agent: adminUser.id,
        tags: [tagMap['Alto patrimônio']].filter(Boolean),
        classification: 'Proprietário Barra Sul',
        temperature: 'morno',
        notes:
          'Proprietário do apto na Barra Sul. Exclusividade vence em breve, precisa de relatório de visitas.',
        consent: true,
        score: 75,
        last_contact_at: '2025-02-15T16:00:00Z',
      },
      {
        type: 'corretor_parceiro',
        name: 'Camila Fontana',
        phone: '(47) 98455-7766',
        whatsapp: '47984557766',
        email: 'camila@fontanaimoveis.com.br',
        profession: 'Corretora de Imóveis CRECI 42.118-F',
        city: 'Itajaí',
        state: 'SC',
        origin: 'Parceria Imobiliária',
        agent: adminUser.id,
        tags: [tagMap['Itapema']].filter(Boolean),
        classification: 'Parceira Ativa',
        temperature: 'quente',
        notes: 'Parceira em clientes de Curitiba. Proposta conjunta de divisão 50/50 em andamento.',
        consent: true,
        score: 85,
        last_contact_at: '2025-02-27T17:45:00Z',
      },
    ]

    const contactRecords = []
    for (const c of contactsData) {
      let rec
      try {
        rec = app.findFirstRecordByData('contacts', 'name', c.name)
      } catch (_) {
        rec = new Record(contCol)
        rec.set('type', c.type)
        rec.set('name', c.name)
        rec.set('phone', c.phone)
        rec.set('whatsapp', c.whatsapp)
        rec.set('email', c.email)
        rec.set('cpf_cnpj', c.cpf_cnpj)
        rec.set('profession', c.profession)
        rec.set('city', c.city)
        rec.set('state', c.state)
        if (c.address) rec.set('address', c.address)
        rec.set('origin', c.origin)
        if (c.campaign) rec.set('campaign', c.campaign)
        rec.set('agent', c.agent)
        rec.set('tags', c.tags)
        rec.set('classification', c.classification)
        rec.set('temperature', c.temperature)
        rec.set('notes', c.notes)
        rec.set('consent', c.consent)
        rec.set('score', c.score)
        rec.set('last_contact_at', c.last_contact_at)
        app.save(rec)

        if (c.client_profile) {
          const clientRec = new Record(clientCol)
          clientRec.set('contact', rec.id)
          for (const [k, v] of Object.entries(c.client_profile)) {
            clientRec.set(k, v)
          }
          app.save(clientRec)
        }
      }
      contactRecords.push(rec)
    }

    // 8. Seed Deals (Negócios)
    const dealsCol = app.findCollectionByNameOrId('deals')
    const dealsData = [
      {
        title: 'Investimento Viva Park - Dr. Rodrigo',
        contact: contactRecords[0].id,
        property: propRecords[0].id,
        pipeline: pipeMap['comprador'],
        stage: stageMap['comprador_Proposta'],
        value: 1850000,
        status: 'ativo',
        campaign: campRec.id,
        next_action_at: '2025-02-26T14:00:00Z', // propositalmente atrasada para alerta de dashboard
        next_action_type: 'Cobrar retorno proposta',
        next_action_desc:
          'Ligar para Dr. Rodrigo alinhando ajustes da entrada parcelada solicitada pela construtora',
      },
      {
        title: 'Aquisição Cobertura Meia Praia - Mariana Prado',
        contact: contactRecords[1].id,
        property: propRecords[1].id,
        pipeline: pipeMap['comprador'],
        stage: stageMap['comprador_Visita'],
        value: 4950000,
        status: 'ativo',
        next_action_at: '2025-03-02T10:00:00Z',
        next_action_type: 'Visita presencial',
        next_action_desc:
          'Receber cliente no heliponto e apresentar a cobertura frente mar em Itapema',
      },
      {
        title: 'Agenciamento Barra Sul - Fernando Borges',
        contact: contactRecords[3].id,
        property: propRecords[2].id,
        pipeline: pipeMap['captacao'],
        stage: stageMap['captacao_Imóvel ativo'],
        value: 2890000,
        status: 'ativo',
        next_action_at: '2025-02-25T11:00:00Z', // propositalmente atrasada
        next_action_type: 'Renovação exclusividade',
        next_action_desc: 'Apresentar relatório de interessados e propor extensão de 90 dias',
      },
    ]

    const dealRecords = []
    for (const d of dealsData) {
      let rec
      try {
        rec = app.findFirstRecordByData('deals', 'title', d.title)
      } catch (_) {
        rec = new Record(dealsCol)
        for (const [k, v] of Object.entries(d)) {
          rec.set(k, v)
        }
        app.save(rec)
      }
      dealRecords.push(rec)
    }

    // 9. Seed Tasks (com algumas atrasadas de propósito para alimentar os alertas)
    const tasksCol = app.findCollectionByNameOrId('tasks')
    const tasksData = [
      {
        deal: dealRecords[0].id,
        contact: contactRecords[0].id,
        type: 'retorno',
        title: 'Follow-up de proposta: Alinhamento de entrada',
        description:
          'Verificar com Dr. Rodrigo se aprova o cronograma de 60 meses negociado com a Vokkan',
        due_date: '2025-02-25',
        due_time: '14:30',
        priority: 'alta',
        status: 'pendente',
      },
      {
        deal: dealRecords[2].id,
        contact: contactRecords[3].id,
        type: 'ligacao',
        title: 'Relatório mensal com proprietário Fernando',
        description: 'Ligar para informar sobre as duas visitas recebidas no imóvel da Barra Sul',
        due_date: '2025-02-26',
        due_time: '16:00',
        priority: 'alta',
        status: 'pendente',
      },
      {
        deal: dealRecords[1].id,
        contact: contactRecords[1].id,
        type: 'visita',
        title: 'Visita guiada Cobertura Duplex Itapema',
        description: 'Acompanhar Mariana Prado e apresentar área gourmet e vista do mar',
        due_date: '2025-03-02',
        due_time: '10:00',
        priority: 'alta',
        status: 'pendente',
      },
      {
        deal: null,
        contact: contactRecords[2].id,
        type: 'whatsapp',
        title: 'Reativação de cliente antigo: Carlos Eduardo',
        description: 'Enviar curadoria em PDF de novas oportunidades em Balneário Camboriú',
        due_date: '2025-02-28',
        due_time: '11:00',
        priority: 'media',
        status: 'pendente',
      },
    ]

    for (const tk of tasksData) {
      let rec
      try {
        rec = app.findFirstRecordByData('tasks', 'title', tk.title)
      } catch (_) {
        rec = new Record(tasksCol)
        for (const [k, v] of Object.entries(tk)) {
          rec.set(k, v)
        }
        rec.set('assigned_to', adminUser.id)
        app.save(rec)
      }
    }

    // 10. Seed Commissions & Honoraries
    const commCol = app.findCollectionByNameOrId('commissions')
    try {
      app.findFirstRecordByData('commissions', 'deal', dealRecords[0].id)
    } catch (_) {
      const commRec = new Record(commCol)
      commRec.set('deal', dealRecords[0].id)
      commRec.set('total_value', 111000) // 6% de 1.850.000
      commRec.set('percent', 6.0)
      commRec.set('honorarios', 0)
      commRec.set('scheduled', [
        {
          parcela: 1,
          value: 37000,
          status: 'recebido',
          due_date: '2025-02-15',
          received_at: '2025-02-15',
        },
        { parcela: 2, value: 37000, status: 'previsto', due_date: '2025-03-15', received_at: null },
        { parcela: 3, value: 37000, status: 'previsto', due_date: '2025-04-15', received_at: null },
      ])
      commRec.set('received_total', 37000)
      commRec.set('pending_total', 74000)
      commRec.set('partners_split', [
        { partner_name: 'Thata Amaral (Corretora)', percent: 80, value: 88800 },
        { partner_name: 'Captação / Parceria', percent: 20, value: 22200 },
      ])
      commRec.set('builder_payer', 'Vokkan Urbanismo')
      commRec.set('taxes', 6660)
      app.save(commRec)
    }

    const honCol = app.findCollectionByNameOrId('honoraries')
    try {
      app.findFirstRecordByData('honoraries', 'client', contactRecords[0].id)
    } catch (_) {
      const honRec = new Record(honCol)
      honRec.set('client', contactRecords[0].id)
      honRec.set('service', 'Consultoria e Curadoria de Investimento Imobiliário Litoral SC')
      honRec.set('value', 32500)
      honRec.set('due_date', '2025-03-10')
      honRec.set('status', 'previsto')
      app.save(honRec)
    }

    // 11. Seed Contracts
    const contractCol = app.findCollectionByNameOrId('contracts')
    try {
      app.findFirstRecordByData(
        'contracts',
        'title',
        'Proposta de Compra com Sinal - Viva Park Unidade 1402',
      )
    } catch (_) {
      const conRec = new Record(contractCol)
      conRec.set('template', 'proposta_compra')
      conRec.set('title', 'Proposta de Compra com Sinal - Viva Park Unidade 1402')
      conRec.set('deal', dealRecords[0].id)
      conRec.set('contact', contactRecords[0].id)
      conRec.set('property', propRecords[0].id)
      conRec.set('filled_data', {
        comprador_nome: 'Dr. Rodrigo Mendonça',
        comprador_cpf: '458.912.309-88',
        imovel_unidade: 'TORRE-A-1402 Viva Park Porto Belo',
        valor_proposta: 1850000,
        entrada: 370000,
        parcelas: '60x de R$ 12.333,33 corrigidas pelo CUB/SC',
      })
      conRec.set('status', 'enviado')
      app.save(conRec)
    }

    // 12. Seed Prompts
    const promptsCol = app.findCollectionByNameOrId('prompts')
    const defaultPrompts = [
      {
        title: 'Curadoria de Investimento Personalizada',
        category: 'investimento',
        content:
          'Atue como mentora de investimentos imobiliários. Analise o perfil do cliente {nome}, com capital disponível de {capital} e horizonte de {prazo}. Apresente 2 estratégias no litoral de SC destacando potencial de valorização pré-chaves vs yield de locação por temporada.',
      },
      {
        title: 'Quebra de Objeção: "Preço do metro quadrado muito alto"',
        category: 'objeções',
        content:
          'Estruture uma resposta elegante e técnica para a objeção de que o metro quadrado em {cidade} subiu muito rápido, demonstrando dados de escassez geográfica de praia, verticalização planejada e histórico dos últimos 5 anos.',
      },
      {
        title: 'Script de Primeiro Contato Lead Meta Ads',
        category: 'atendimento',
        content:
          'Crie uma mensagem acolhedora, exclusiva e objetiva para abrir conversa no WhatsApp com o lead {nome} vindo do anúncio do {imovel}. Foco em gerar curiosidade e pedir 5 minutos de áudio.',
      },
      {
        title: 'Follow-up de Proposta sem Retorno',
        category: 'vendas',
        content:
          'Mensagem de WhatsApp para cliente que recebeu proposta há 48 horas e ainda não respondeu. Tom amigável, sem parecer desesperada, reforçando a validade das condições negociadas com a construtora.',
      },
    ]

    for (const pr of defaultPrompts) {
      try {
        app.findFirstRecordByData('prompts', 'title', pr.title)
      } catch (_) {
        const r = new Record(promptsCol)
        r.set('title', pr.title)
        r.set('category', pr.category)
        r.set('content', pr.content)
        app.save(r)
      }
    }

    // 13. Seed Message Templates
    const msgTemplatesCol = app.findCollectionByNameOrId('message_templates')
    const defaultTemplates = [
      {
        title: 'Primeiro Contato - Lead Campanha',
        category: 'Primeiro Contato',
        body: 'Olá, {nome}! Tudo bem? Sou a Thata Amaral, especialista em investimentos imobiliários aqui no litoral de SC. Vi seu interesse no {imovel}. Separei a apresentação executiva e a tabela de fluxo de pagamento com as melhores condições da construtora. Posso te enviar por aqui agora?',
        placeholders: ['nome', 'imovel'],
      },
      {
        title: 'Cobrança Sutil de Proposta',
        category: 'Proposta',
        body: 'Olá, {nome}! Tudo ótimo? Consegui segurar com a diretoria da construtora aquela condição especial de entrada para o {imovel} no valor de {valor} até hoje às 18h. Conseguimos assinar a proposta digital para travar a unidade?',
        placeholders: ['nome', 'imovel', 'valor'],
      },
      {
        title: 'Pós-Visita e Próximos Passos',
        category: 'Pós-Visita',
        body: 'Oi, {nome}! Foi um grande prazer apresentar o {imovel} para você hoje! Como conversamos na visita, estou preparando a simulação personalizada com a valorização estimada para os próximos 36 meses. Te envio até {dia}!',
        placeholders: ['nome', 'imovel', 'dia'],
      },
      {
        title: 'Proprietário - Relatório de Captação',
        category: 'Proprietário',
        body: 'Prezado(a) {nome}, aqui é a Thata Amaral. Segue o relatório quinzenal do seu imóvel em {imovel}. Tivemos {visitas} interessados qualificados esta semana e estamos avançando em uma sondagem formal. Um abraço!',
        placeholders: ['nome', 'imovel', 'visitas'],
      },
    ]

    for (const mt of defaultTemplates) {
      try {
        app.findFirstRecordByData('message_templates', 'title', mt.title)
      } catch (_) {
        const r = new Record(msgTemplatesCol)
        r.set('title', mt.title)
        r.set('category', mt.category)
        r.set('body', mt.body)
        r.set('placeholders', mt.placeholders)
        app.save(r)
      }
    }

    // 14. Seed Automations
    const autoCol = app.findCollectionByNameOrId('automations')
    const defaultAutos = [
      {
        name: 'Novo Lead Meta Ads: Boas-vindas & Criação no Funil',
        trigger: 'contato_criado',
        conditions: [{ field: 'origin', op: '=', value: 'Campanha Meta Ads' }],
        actions: [
          { type: 'criar_negocio', pipeline: 'comprador', stage: 'Novo lead' },
          { type: 'adicionar_tag', tag: 'Lead Meta' },
          { type: 'criar_tarefa', title: 'Fazer 1º contato em até 15 minutos', prioridade: 'alta' },
        ],
        cadence: [
          { delay_hours: 0, message: 'Mensagem de boas-vindas imediata no WhatsApp com catálogo' },
          { delay_hours: 24, message: 'Se não respondeu: áudio de apresentação de oportunidades' },
          { delay_hours: 72, message: 'Se sem resposta: convite para tour em vídeo de 2 minutos' },
        ],
        status: 'ativo',
      },
      {
        name: 'Proposta Aberta sem Retorno após 48h',
        trigger: 'estagio_mudou',
        conditions: [{ field: 'stage', op: '=', value: 'Proposta' }],
        actions: [
          {
            type: 'criar_tarefa',
            title: 'Ligar para o cliente cobrando feedback da proposta',
            prioridade: 'alta',
          },
          { type: 'notificar_usuario', mensagem: 'Proposta sem retorno há 48h' },
        ],
        cadence: [{ delay_hours: 48, message: 'Alerta de encerramento da condição comercial' }],
        status: 'ativo',
      },
    ]

    for (const au of defaultAutos) {
      try {
        app.findFirstRecordByData('automations', 'name', au.name)
      } catch (_) {
        const r = new Record(autoCol)
        r.set('name', au.name)
        r.set('trigger', au.trigger)
        r.set('conditions', au.conditions)
        r.set('actions', au.actions)
        r.set('cadence', au.cadence)
        r.set('status', au.status)
        app.save(r)
      }
    }

    // 15. Seed Integrations
    const integCol = app.findCollectionByNameOrId('integrations')
    const defaultIntegrations = [
      {
        provider: 'meta_ads',
        name: 'Meta Ads (Facebook & Instagram Lead Ads)',
        status: 'ativo',
        config: { account_id: 'act_981249120', pixel_id: 'pix_772189' },
        last_sync_at: '2025-02-28T08:00:00Z',
      },
      {
        provider: 'whatsapp_business',
        name: 'WhatsApp Cloud API Oficial',
        status: 'ativo',
        config: { phone_number_id: '109823198', status: 'connected' },
        last_sync_at: '2025-02-28T12:00:00Z',
      },
      {
        provider: 'google_calendar',
        name: 'Google Agenda & Meet',
        status: 'ativo',
        config: { email: 'thata.amaral.imoveis@gmail.com' },
        last_sync_at: '2025-02-28T10:00:00Z',
      },
      {
        provider: 'docusign',
        name: 'DocuSign / ZapSign Assinatura Digital',
        status: 'pendente',
        config: { provider: 'zapsign' },
        last_sync_at: null,
      },
      {
        provider: 'make_webhook',
        name: 'Make / Zapier Webhook Gateway',
        status: 'ativo',
        config: { webhook_url: 'https://hook.eu1.make.com/houseos-pipeline' },
        last_sync_at: '2025-02-27T19:00:00Z',
      },
    ]

    for (const it of defaultIntegrations) {
      try {
        app.findFirstRecordByData('integrations', 'provider', it.provider)
      } catch (_) {
        const r = new Record(integCol)
        r.set('provider', it.provider)
        r.set('name', it.name)
        r.set('status', it.status)
        r.set('config', it.config)
        if (it.last_sync_at) r.set('last_sync_at', it.last_sync_at)
        app.save(r)
      }
    }

    // 16. Seed Custom Fields
    const cfCol = app.findCollectionByNameOrId('custom_fields')
    const defaultCustomFields = [
      {
        entity: 'contacts',
        label: 'Já investe no Litoral Catarinense?',
        field_key: 'investe_sc',
        type: 'boolean',
        active: true,
      },
      {
        entity: 'contacts',
        label: 'Possui financiamento pré-aprovado?',
        field_key: 'financiamento_aprovado',
        type: 'boolean',
        active: true,
      },
      {
        entity: 'deals',
        label: 'Origem de Parceria (Imobiliária ou Corretor)',
        field_key: 'origem_parceiro',
        type: 'text',
        active: true,
      },
      {
        entity: 'properties',
        label: 'Tem autorização de placa no local?',
        field_key: 'placa_autorizada',
        type: 'boolean',
        active: true,
      },
    ]

    for (const cf of defaultCustomFields) {
      try {
        app.findFirstRecordByData('custom_fields', 'field_key', cf.field_key)
      } catch (_) {
        const r = new Record(cfCol)
        r.set('entity', cf.entity)
        r.set('label', cf.label)
        r.set('field_key', cf.field_key)
        r.set('type', cf.type)
        r.set('active', cf.active)
        app.save(r)
      }
    }
  },
  (app) => {
    // down logic (optional cleanup)
  },
)
