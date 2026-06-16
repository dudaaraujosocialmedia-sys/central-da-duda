// Dados reais da Duda - carregados na primeira vez que o app abre

export const CLIENTES_INICIAIS = [
  { id: 1, nome: 'Veronica Machado', cpfCnpj: '034.101.717-54', valor: 550, dia_pagamento: '22', status: 'ativo', area: 'Terapeuta', perfil: '@veromachado.terapeuta', servico: 'Gestao Completa + Info', observacoes: 'Quadro quinzenal' },
  { id: 2, nome: 'Veronica e Danielle', cpfCnpj: '51.125.684/0001-99', valor: 680, dia_pagamento: '23', status: 'ativo', area: 'Contabilidade', perfil: '@otimizegestaocontabil', servico: 'Gestao Completa', observacoes: 'Gravacao 1x cada 2 meses' },
  { id: 3, nome: 'Carlos e Patricia', cpfCnpj: '', valor: 650, dia_pagamento: '19', status: 'ativo', area: 'Cuidador de Idosos', perfil: '@help_in_time', servico: 'Gestao Completa', observacoes: '' },
  { id: 4, nome: 'Lais de Souza', cpfCnpj: '33.717.740/0001-00', valor: 680, dia_pagamento: '18', status: 'ativo', area: 'Consultora de Imagem', perfil: '@laissouzars', servico: 'Gestao Completa', observacoes: '' },
  { id: 5, nome: 'Amanda de Aguiar', cpfCnpj: '087.170.257-61', valor: 700, dia_pagamento: '20', status: 'ativo', area: 'Esteticista', perfil: '', servico: 'Gestao Completa', observacoes: '' },
];

export const INVESTIMENTOS_INICIAIS = [
  { id: 1, nome: 'Microfone Hollyland', categoria: 'Equipamento', preco: 770, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 2, nome: 'iPhone 17 ProMax', categoria: 'Equipamento', preco: 12499, prioridade: 'Media', comprado: false, link: '', necessidade: 'Guardado: R$ 634,69 | Faltando: R$ 11.864,31' },
  { id: 3, nome: 'Carregador Portatil VX Case', categoria: 'Equipamento', preco: 429, prioridade: 'Baixa', comprado: true, link: '', necessidade: '' },
  { id: 4, nome: 'Tripe VX Case', categoria: 'Equipamento', preco: 400, prioridade: 'Media', comprado: false, link: '', necessidade: '' },
  { id: 5, nome: 'Luz Led Mercado Livre (2x)', categoria: 'Equipamento', preco: 396, prioridade: 'Baixa', comprado: true, link: '', necessidade: '' },
  { id: 6, nome: 'Teclado iPad', categoria: 'Equipamento', preco: 399.49, prioridade: 'Baixa', comprado: true, link: '', necessidade: '' },
  { id: 7, nome: 'Lente', categoria: 'Equipamento', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 8, nome: 'Teleprompt', categoria: 'Equipamento', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 9, nome: 'Identidade Visual', categoria: 'Curso', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 10, nome: 'Monitor', categoria: 'Equipamento', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 11, nome: 'Calca linho preto', categoria: 'Pessoal', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 12, nome: 'Calca Jeans Preta', categoria: 'Pessoal', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 13, nome: 'Blusa social praia branca', categoria: 'Pessoal', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 14, nome: 'Jaqueta', categoria: 'Pessoal', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 15, nome: 'Adidas Superstar preto', categoria: 'Pessoal', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
  { id: 16, nome: 'Havaianas Rosa', categoria: 'Pessoal', preco: 0, prioridade: 'Baixa', comprado: false, link: '', necessidade: '' },
];

export const FLUXO_INICIAL = {
  mes: new Date().getMonth(),
  ano: new Date().getFullYear(),
  distribuicao: [
    { nome: 'Caixa', percentual: 20, cor: '#486c96' },
    { nome: 'Lucro / Despesas pessoais', percentual: 50, cor: '#5f86ad' },
    { nome: 'Metas / Investimentos', percentual: 20, cor: '#d2b99b' },
    { nome: 'iPhone 17 ProMax', percentual: 10, cor: '#a0c0d8' },
  ],
  historico: [
    { mes: 'Marco', entradas: 1930, caixa: 386, lucro: 965, metas: 386, iphone: 193 },
    { mes: 'Abril', entradas: 1780, caixa: 356, lucro: 890, metas: 356, iphone: 178 },
    { mes: 'Maio', entradas: 2580, caixa: 516, lucro: 1290, metas: 516, iphone: 258 },
    { mes: 'Junho', entradas: 3310, caixa: 662, lucro: 993, metas: 1324, iphone: 331 },
  ],
};

export const AREAS_INICIAIS = [
  'Terapia', 'Contabilidade', 'Cuidador de Idosos', 'Consultoria de Imagem', 'Estetica'
];

export const PROCESSOS_INICIAIS = [
  {
    id: 1,
    titulo: 'Onboarding de novo cliente',
    categoria: 'Cliente',
    passos: [
      'Enviar contrato para assinatura',
      'Solicitar acesso as redes sociais',
      'Fazer reuniao de alinhamento (briefing)',
      'Criar pasta do cliente no Google Drive (Documentos, Conteudos, Imagens)',
      'Fazer analise de perfil e concorrentes',
      'Apresentar planejamento do primeiro mes',
      'Enviar mensagem de boas-vindas oficial',
    ]
  },
  {
    id: 2,
    titulo: 'Fluxo mensal de conteudo',
    categoria: 'Producao',
    passos: [
      'Dias 1-4: Relatorio de metricas do mes anterior',
      'Dias 5-7: Planejamento de conteudo do mes',
      'Dias 8-10: Apresentar planejamento ao cliente e aprovar',
      'Dias 11-20: Captacao e producao de conteudo',
      'Dias 21-25: Edicao, legenda e agendamento de posts',
      'Dias 26-30: Monitoramento, interacao e analise parcial',
    ]
  },
  {
    id: 3,
    titulo: 'Entrega de relatorio mensal',
    categoria: 'Relatorio',
    passos: [
      'Exportar metricas do Instagram (alcance, impressoes, seguidores)',
      'Verificar engajamento dos melhores posts',
      'Comparar com mes anterior',
      'Destacar 3 conteudos com melhor desempenho',
      'Sugerir melhorias para o proximo mes',
      'Enviar relatorio ao cliente via mensagem com resumo',
    ]
  },
  {
    id: 4,
    titulo: 'Captacao de conteudo',
    categoria: 'Producao',
    passos: [
      'Confirmar data e horario com o cliente 3 dias antes',
      'Preparar roteiro e lista de conteudos a gravar',
      'Verificar equipamentos (tripe, luz, microfone, carregador)',
      'Gravar os videos e fotos conforme planejamento',
      'Fazer backup imediato no Google Drive do cliente',
      'Confirmar proxima data de captacao',
    ]
  },
];

export const CHECKLIST_MENSAL_INICIAL = [
  { id: 1, titulo: 'Fechar relatorio de metricas de todos os clientes', concluida: false },
  { id: 2, titulo: 'Fazer planejamento de conteudo do mes', concluida: false },
  { id: 3, titulo: 'Confirmar datas de captacao com clientes', concluida: false },
  { id: 4, titulo: 'Verificar pagamentos recebidos', concluida: false },
  { id: 5, titulo: 'Atualizar planilha financeira', concluida: false },
  { id: 6, titulo: 'Agendar posts do mes no agendador', concluida: false },
  { id: 7, titulo: 'Avaliar metas do mes anterior', concluida: false },
  { id: 8, titulo: 'Definir metas do proximo mes', concluida: false },
];

export const TAREFAS_RECORRENTES_INICIAIS = [
  { id: 1, titulo: 'Responder comentarios e DMs dos clientes', frequencia: 'Diario' },
  { id: 2, titulo: 'Verificar metricas dos posts publicados', frequencia: 'Diario' },
  { id: 3, titulo: 'Agendar posts da semana', frequencia: 'Semanal' },
  { id: 4, titulo: 'Reuniao de alinhamento com clientes', frequencia: 'Mensal' },
  { id: 5, titulo: 'Emitir cobrancas dos clientes', frequencia: 'Mensal' },
];
