import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Flame, Plus, Trash2, RefreshCw, Calendar, Brain, Copy, Check as CheckIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AREAS_SUGERIDAS = [
  'Advocacia', 'Medicina', 'Odontologia', 'Nutricao', 'Psicologia',
  'Educacao Fisica', 'Fisioterapia', 'Arquitetura', 'Contabilidade',
  'Moda', 'Beleza e Estetica', 'Gastronomia', 'Imóveis', 'Financas Pessoais',
  'Empreendedorismo', 'Marketing Digital', 'Coaching', 'Veterinaria',
  'Fotografia', 'Design', 'Engenharia', 'RH e Gestao de Pessoas',
];

// Datas: { mes (1-12), dia, nome, areas[] }
const DATAS_IMPORTANTES = [
  { mes: 1, dia: 1, nome: 'Ano Novo', areas: ['todos'] },
  { mes: 1, dia: 27, nome: 'Dia Nacional da Saude', areas: ['Medicina', 'Nutricao', 'Psicologia', 'Odontologia', 'Fisioterapia', 'Educacao Fisica'] },
  { mes: 2, dia: 4, nome: 'Dia Mundial do Cancer', areas: ['Medicina'] },
  { mes: 2, dia: 11, nome: 'Dia da Mulher na Ciencia', areas: ['Medicina', 'Advocacia', 'Educacao'] },
  { mes: 3, dia: 8, nome: 'Dia Internacional da Mulher', areas: ['todos'] },
  { mes: 3, dia: 15, nome: 'Dia do Consumidor', areas: ['Advocacia', 'Marketing Digital', 'Empreendedorismo'] },
  { mes: 3, dia: 20, nome: 'Dia Mundial da Saude Bucal', areas: ['Odontologia'] },
  { mes: 3, dia: 21, nome: 'Dia Mundial da Sindrome de Down', areas: ['Medicina', 'Psicologia', 'Fisioterapia'] },
  { mes: 3, dia: 26, nome: 'Dia do Ballet / Dia da Danca', areas: ['Educacao Fisica'] },
  { mes: 4, dia: 2, nome: 'Dia Mundial do Autismo', areas: ['Psicologia', 'Medicina', 'Fisioterapia'] },
  { mes: 4, dia: 7, nome: 'Dia Mundial da Saude', areas: ['Medicina', 'Nutricao', 'Psicologia', 'Odontologia', 'Fisioterapia'] },
  { mes: 4, dia: 14, nome: 'Dia do Contador', areas: ['Contabilidade'] },
  { mes: 4, dia: 17, nome: 'Dia do Nutricionista', areas: ['Nutricao'] },
  { mes: 4, dia: 22, nome: 'Dia da Terra', areas: ['todos'] },
  { mes: 5, dia: 5, nome: 'Dia Mundial da Higiene das Maos', areas: ['Medicina', 'Odontologia'] },
  { mes: 5, dia: 10, nome: 'Dia das Maes', areas: ['todos'] },
  { mes: 5, dia: 18, nome: 'Dia Nacional do Combate ao Abuso Infantil', areas: ['Psicologia', 'Advocacia'] },
  { mes: 5, dia: 20, nome: 'Dia do Advogado', areas: ['Advocacia'] },
  { mes: 5, dia: 31, nome: 'Dia Mundial Sem Tabaco', areas: ['Medicina', 'Nutricao'] },
  { mes: 6, dia: 5, nome: 'Dia Mundial do Meio Ambiente', areas: ['todos'] },
  { mes: 6, dia: 12, nome: 'Dia dos Namorados', areas: ['todos'] },
  { mes: 6, dia: 21, nome: 'Dia do Fotografo', areas: ['Fotografia'] },
  { mes: 6, dia: 26, nome: 'Dia do Fisioterapeuta', areas: ['Fisioterapia'] },
  { mes: 7, dia: 20, nome: 'Dia do Amigo', areas: ['todos'] },
  { mes: 7, dia: 28, nome: 'Dia Mundial da Hepatite', areas: ['Medicina'] },
  { mes: 8, dia: 1, nome: 'Agosto Dourado - Amamentacao', areas: ['Medicina', 'Nutricao'] },
  { mes: 8, dia: 11, nome: 'Dia do Estudante', areas: ['Educacao', 'Coaching'] },
  { mes: 8, dia: 11, nome: 'Dia do Empreendedor', areas: ['Empreendedorismo', 'Marketing Digital', 'Coaching'] },
  { mes: 8, dia: 26, nome: 'Dia do Nutricionista (SP)', areas: ['Nutricao'] },
  { mes: 9, dia: 10, nome: 'Dia Mundial de Prevencao ao Suicidio', areas: ['Psicologia', 'Medicina'] },
  { mes: 9, dia: 13, nome: 'Dia do Programador', areas: ['Design', 'Marketing Digital'] },
  { mes: 9, dia: 21, nome: 'Dia Mundial do Alzheimer', areas: ['Medicina', 'Psicologia'] },
  { mes: 9, dia: 29, nome: 'Dia Mundial do Coracao', areas: ['Medicina', 'Nutricao', 'Educacao Fisica'] },
  { mes: 10, dia: 1, nome: 'Dia do Idoso / Outubro Rosa', areas: ['Medicina', 'Fisioterapia', 'Nutricao'] },
  { mes: 10, dia: 1, nome: 'Outubro Rosa - Cancer de Mama', areas: ['Medicina'] },
  { mes: 10, dia: 5, nome: 'Dia dos Professores', areas: ['Educacao'] },
  { mes: 10, dia: 10, nome: 'Dia Mundial da Saude Mental', areas: ['Psicologia', 'Medicina'] },
  { mes: 10, dia: 12, nome: 'Dia das Criancas', areas: ['todos'] },
  { mes: 10, dia: 15, nome: 'Dia do Contador', areas: ['Contabilidade'] },
  { mes: 10, dia: 20, nome: 'Dia do Medico', areas: ['Medicina'] },
  { mes: 10, dia: 25, nome: 'Dia do Fotografo', areas: ['Fotografia'] },
  { mes: 11, dia: 1, nome: 'Novembro Azul - Cancer de Prostata', areas: ['Medicina'] },
  { mes: 11, dia: 15, nome: 'Dia da Consciencia Negra', areas: ['todos'] },
  { mes: 11, dia: 20, nome: 'Dia Nacional da Consciencia Negra', areas: ['todos'] },
  { mes: 11, dia: 25, nome: 'Dia da Cuidadora', areas: ['Medicina', 'Fisioterapia', 'Psicologia'] },
  { mes: 12, dia: 1, nome: 'Dia Mundial da AIDS', areas: ['Medicina'] },
  { mes: 12, dia: 25, nome: 'Natal', areas: ['todos'] },
];

const MESES = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const IDEIAS_BASE = {
  'Advocacia': [
    'Mito ou verdade: [afirmacao juridica popular]. Responda de forma simples e educativa.',
    'Voce sabia que tem direito a [direito pouco conhecido]? Explique em carrossel.',
    'Passo a passo: o que fazer quando [situacao juridica comum do nicho].',
    'Os 3 erros mais comuns que as pessoas cometem ao [acao juridica] — e como evitar.',
    'Quanto custa (realmente) um processo de [tipo de processo]? Desmistifique o valor dos honorarios.',
    'Reels: "Advogada responde em 60 segundos" — responda uma duvida frequente dos seguidores.',
    'O que muda com a nova lei [area relevante]? Simplifique para leigos.',
    'Checklist: o que voce precisa saber antes de assinar um [contrato comum].',
    'Bastidores do escritorio: como e o dia a dia de uma advogada especialista em [nicho].',
    'Depoimento (com nome ficticio): como eu ajudei meu cliente a resolver [situacao].',
  ],
  'Nutricao': [
    'Mito ou verdade: "[afirmacao alimentar popular]". Desmistifique com base na ciencia.',
    'Cardapio pratico para a semana: 5 jantares saudaveis em menos de 30 minutos.',
    'Comparativo: [alimento A] vs [alimento B] — qual e mais nutritivo? Carrossel.',
    '3 sinais de que voce pode ter deficiencia de [nutriente essencial].',
    'O que acontece com seu corpo quando voce [habito alimentar comum]? Explique visualmente.',
    'Receita rapida e saudavel com 5 ingredientes — mostra no Reels.',
    'Por que a balanca nao e a melhor medida de progresso? Eduque sobre composicao corporal.',
    'Antes das compras do mercado: o que voce deve ter sempre em casa para comer bem.',
    'Rotina de alimentacao saudavel para [publico especifico: gestante, atleta, idoso...].',
    '10 substituicoes inteligentes para comer melhor sem abrir mao do sabor.',
  ],
  'Medicina': [
    'Sintoma X: quando e apenas estresse e quando e sinal de alerta? Oriente seu publico.',
    'Os exames preventivos que toda pessoa de [faixa etaria] deveria fazer — checklist.',
    'Reels: "Dr(a). [Nome] explica em 60 segundos" — escolha um tema frequente nas consultas.',
    'Mito ou verdade: "[crenca popular sobre saude]". Responda com evidencia cientifica.',
    'O que realmente acontece no seu corpo quando voce [habito do dia a dia].',
    '5 sinais de que seu corpo esta pedindo mais atencao — e o que fazer.',
    'Bastidores do consultorio: como funciona [procedimento ou consulta] — humanize sua rotina.',
    'Por que voce nao deveria automedicar com [medicamento comum]? Alerta educativo.',
    'Diferenca entre [condicao A] e [condicao B]: como identificar e quando buscar ajuda.',
    'Campanha do mes: [Outubro Rosa / Novembro Azul / etc.] — crie conteudo relevante.',
  ],
  'Odontologia': [
    'Mito ou verdade: "escova com forca demais limpa melhor". Corrija e ensine a tecnica certa.',
    'Antes e depois de [tratamento estetico]: mostre resultados reais (com autorizacao).',
    'Por que bruxismo esta aumentando nos ultimos anos? Relacione com ansiedade e estresse.',
    'O que acontece se voce ignora aquela dor de dente? Eduque sobre urgencias odontologicas.',
    'Guia rapido: como escolher o fio dental / enxaguante / escova certos para voce.',
    'Reels: timelapse ou bastidores de um procedimento — clareamento, restauracao, etc.',
    'Saude bucal e autoestima: mostre como o sorriso impacta a confianca — depoimento.',
    'Criancas e dentista: como tornar a experiencia positiva desde cedo.',
    'O que e harmonizacao orofacial e quem pode fazer? Esclarea duvidas comuns.',
    'Dica do dia: [habito simples para manter a saude bucal em dia].',
  ],
  'Psicologia': [
    'Explique a diferenca entre tristeza e depressao — conteudo que educa e quebra estigma.',
    'Autoconhecimento: exercicio simples para identificar seus gatilhos emocionais.',
    '3 sinais de que seu relacionamento pode ser emocionalmente esgotante.',
    'O que e terapia cognitivo-comportamental (TCC) em termos simples? Carrossel explicativo.',
    'Reels: "Psi em 60 segundos" — responda uma duvida comum do seu publico.',
    'Como ter conversas dificeis sem transformar em conflito — tecnicas de comunicacao nao violenta.',
    'O que acontece no seu cerebro quando voce procrastina? (e como sair do loop).',
    'Saude mental no trabalho: como identificar burnout nos primeiros sinais.',
    'Humanize seu perfil: compartilhe (com cuidado) um aprendizado da sua pratica clinica.',
    'Por que a terapia nao e "coisa de louco"? Quebre o estigma com dados e acolhimento.',
  ],
  'Educacao Fisica': [
    'Antes x depois da semana: mostre progresso real de um aluno (com autorizacao).',
    'Desmistificando: [exercicio famoso] — feito certo x feito errado. Reels com demonstracao.',
    'Treino rapido para fazer em casa: [musculo] em 15 minutos, sem equipamento.',
    'Por que a consistencia supera a intensidade no longo prazo — conteudo motivacional.',
    'Qual e o melhor horario para treinar? A ciencia responde — educa seu publico.',
    'Os erros mais comuns na [modalidade que voce atende] — e como corrigir.',
    'Hidratacao e desempenho: quanto de agua voce realmente precisa por treino.',
    'Reels: bastidores de um treino — mostre sua metodologia e personalidade.',
    'Mobilidade e alongamento: por que sao tao ignorados e tao importantes.',
    'Depoimento de aluno: o que mudou na vida dele alem do corpo — humanize os resultados.',
  ],
  'Fisioterapia': [
    'Explique: o que e [condicao comum: lombalgia, tendinite, etc.] em linguagem simples.',
    'Exercicios posturais para quem trabalha sentado o dia inteiro — video demonstrativo.',
    'Quando voce NAO deveria suportar a dor e buscar um fisioterapeuta. Alerta educativo.',
    'Bastidores do atendimento: como funciona uma sessao de [tipo de fisioterapia].',
    '5 habitos do dia a dia que estao sabotando sua postura sem voce perceber.',
    'Reels: corrija o erro mais comum que seus pacientes cometem durante os exercicios.',
    'Diferenca entre fisioterapia e academia: quando cada uma e indicada.',
    'Por que [lesao comum] esta aumentando na populacao? Relacione com sedentarismo / estresse.',
    'Depoimento de paciente: o processo de reabilitacao de [situacao real anonima].',
    'Dica do dia: exercicio simples para aliviar [dor ou tensao comum].',
  ],
  'Arquitetura': [
    'Antes e depois de [comodo]: mostra a transformacao real de um projeto.',
    'Tendencias de decoracao para [ano atual]: o que esta em alta nos interiores.',
    '3 erros de layout que fazem os espacos parecerem menores — e como corrigir.',
    'Como escolher o revestimento certo para [banheiro / cozinha / sala]? Guia pratico.',
    'Carrossel: paleta de cores para [estilo decorativo] — inspire seu publico.',
    'Bastidores de um projeto: processo criativo do briefing a entrega. Humanize sua rotina.',
    'O que perguntar ao arquiteto antes de assinar contrato — educa o cliente.',
    'Reels: tour virtual por um projeto concluido — mostre resultado real.',
    'Como a iluminacao transforma um ambiente: antes e depois com fotos comparativas.',
    'Imovel pequeno: 5 solucoes inteligentes para aproveitar cada metro quadrado.',
  ],
  'Contabilidade': [
    'Simples Nacional x Lucro Presumido: quando vale a pena mudar de regime.',
    'O que e pro-labore e por que todo socio deveria receber — explique de forma simples.',
    'Checklist: documentos que voce nao pode perder ao abrir sua empresa.',
    'Por que ter um contador ainda no inicio da empresa e investimento, nao custo.',
    'Mito ou verdade: "[crenca sobre impostos]". Corrija e eduque.',
    '5 erros fiscais comuns de MEIs e autonomos — e como evitar multa.',
    'O que muda no Imposto de Renda em [ano atual]? Resuma os pontos mais relevantes.',
    'Planejamento tributario: como pagar menos imposto de forma legal.',
    'Reels: "Contadora responde" — duvida frequente do seu publico em 60 segundos.',
    'Como separar as financas pessoais das empresariais — passo a passo.',
  ],
  'Moda': [
    'Antes e depois de styling: o mesmo corpo, roupas diferentes, resultados incriveis.',
    'Como montar looks para [ocasiao: trabalho, casual, festa] com o que ja tem no armario.',
    'Tendencias da temporada [estacao atual]: o que usar e o que evitar.',
    'Guia de cores por biotipo: o que favorece cada silhueta.',
    'Reels: processo de montagem de um look — bastidores do dia a dia.',
    'Capsule wardrobe: as X pecas essenciais que todo armario deveria ter.',
    'Mito: "nao tenho nada para usar". Como resolver com organizacao e versatilidade.',
    'Compras conscientes: como evitar o consumo impulsivo e ter mais estilo gastando menos.',
    'Dica de styling para [tipo de corpo especifico]: como realcar o que voce ama.',
    'Combinacoes inusitadas que funcionam — quebre regras com confianca.',
  ],
  'Beleza e Estetica': [
    'Antes e depois de [procedimento]: resultado real e honestos, com autorizacao.',
    'Rotina de skincare para iniciantes: o basico que funciona para qualquer tipo de pele.',
    'Diferenca entre [procedimento A] e [procedimento B]: qual e indicado para cada caso.',
    'Os mitos mais comuns sobre [tratamento estetico] — e o que a ciencia diz.',
    'Reels: demonstracao de uma tecnica ou procedimento que voce realiza.',
    'Como identificar o seu tipo de pele e montar uma rotina especifica.',
    'Cuidados pos-procedimento: o que fazer (e o que evitar) depois de [tratamento].',
    'Por que [ingrediente ativo: retinol, vitamina C, etc.] esta em alta e como usar certo.',
    'Depoimento de cliente: a transformacao alem da estetica — autoestima e bem-estar.',
    'Tendencias de beleza em [ano atual]: o que esta movimentando a area.',
  ],
  'Gastronomia': [
    'Receita rapida com [ingrediente da estacao]: mostre passo a passo em Reels.',
    'Os 3 erros que arruinam um [prato classico] — e como acertar.',
    'Bastidores da cozinha: processo de criacao de um novo prato ou cardapio.',
    'Maridagem facil: qual bebida combina com [tipo de prato] — guia visual.',
    'Tendencias gastronomicas de [ano atual]: o que esta em alta na alimentacao.',
    'Historia e origem de [prato tipico ou tecnica culinaria] — conteudo cultural.',
    'Substitutos inteligentes: como adaptar [receita] para quem nao pode consumir [ingrediente].',
    'Reels: "Cozinhei em 15 minutos" — agilidade e praticidade como diferencial.',
    'O que nao pode faltar na despensa de quem quer cozinhar bem — lista essencial.',
    'Depoimento de cliente: o que o seu [servico de buffet / restaurante / confeitaria] proporcionou.',
  ],
  'Imóveis': [
    'Passo a passo: como funciona o financiamento imobiliario em [ano atual].',
    'Alugar x comprar: o que faz mais sentido financeiro para cada momento de vida.',
    'Tour virtual pelo imovel: reels ou video curto mostrando o espaco.',
    'Os 5 erros mais comuns de quem esta comprando o primeiro imovel — e como evitar.',
    'Como funciona o FGTS na compra do imovel? Simplifique o processo.',
    'O que analizar antes de assinar o contrato de aluguel — checklist completo.',
    'Dica do dia: como valorizar um imovel antes de vender ou alugar.',
    'O que e o CRI e por que o corretor que voce contrata deve ter — eduque seu publico.',
    'Tendencias do mercado imobiliario em [cidade/regiao] — posicione-se como especialista.',
    'Depoimento: como ajudei [cliente] a encontrar o imovel ideal — conta a historia.',
  ],
  'Financas Pessoais': [
    'Regra dos 50/30/20: como organizar seu salario em 3 categorias. Carrossel simples.',
    'Por que sua reserva de emergencia deveria ser seu primeiro investimento.',
    'Mito ou verdade: "[crenca financeira popular]". Corrija com dados.',
    'Calculadora: em quanto tempo voce junta [valor] guardando [X] por mes?',
    'Os 5 gastos invisíveis que estao sabotando seu orcamento — lista de reflexao.',
    'Como sair das dividas: metodo bola de neve x avalanche — qual usar.',
    'Reels: "Financas em 60 segundos" — dica pratica do dia.',
    'O que e renda passiva (de verdade) e como comecar com pouco dinheiro.',
    'Guia de investimentos para iniciantes: qual o primeiro passo?',
    'Planejamento financeiro para [objetivo especifico: viagem, imovel, aposentadoria].',
  ],
  'Empreendedorismo': [
    'O que aprendi no meu [X]° mes de empresa — compartilhe vulnerabilidade e aprendizado.',
    'Como eu defini o preco dos meus servicos (sem subestimar o meu trabalho).',
    '5 ferramentas gratuitas que todo empreendedor deveria usar.',
    'Reels: bastidores do dia a dia do negocio — humanize sua marca.',
    'Como consegui meus primeiros clientes — historia real e estrategia que funcionou.',
    'A diferenca entre ser ocupado e ser produtivo — reflexao para empreendedores.',
    'O que ninguem te conta antes de abrir um negocio — seja honesta.',
    'Gestao de tempo: como eu organizo minha semana para fazer tudo.',
    'Por que nichar e a melhor decisao que voce pode tomar no inicio.',
    'Depoimento de cliente: o que mudou no negocio depois de [seu servico].',
  ],
  'Marketing Digital': [
    'Como o algoritmo do Instagram funciona em [ano atual] — explique de forma simples.',
    'Por que sua bio do Instagram esta afastando potenciais clientes — e como corrigir.',
    '5 tipos de conteudo que todo perfil profissional deveria ter.',
    'Reels vs carrossel vs foto: quando usar cada formato?',
    'O que sao (e como criar) CTAs que realmente convertem.',
    'Bastidores do seu processo de gestao de redes sociais — humanize.',
    'Case de sucesso: o que mudou no perfil de [cliente] depois de [X meses].',
    'Metricas que realmente importam (e as que nao deveria perder tempo olhando).',
    'Calendario editorial: como planejar um mes inteiro de conteudo em 2 horas.',
    'A diferenca entre presenca e consistencia — reflexao para criadores.',
  ],
  'Coaching': [
    'O que e (e o que NAO e) coaching — quebre o estigma e eduque.',
    'Autoconhecimento: exercicio simples para descobrir seus valores fundamentais.',
    '3 crencas limitantes que estao te impedindo de evoluir — reflexao para o publico.',
    'Como definir metas que voce realmente vai cumprir — metodo SMART simplificado.',
    'Reels: insight do dia — uma frase ou reflexao poderosa em 30 segundos.',
    'O que faz uma pessoa de alta performance diferente? Habitos e mentalidade.',
    'Depoimento de coachee: o que mudou na vida/carreira depois do processo.',
    'Por que terapia e coaching sao complementares (nao concorrentes).',
    'Como a zona de conforto pode ser sua maior armadilha — conteudo provocativo.',
    'Bastidores de uma sessao de coaching — o que acontece na pratica.',
  ],
  'Veterinaria': [
    'Vacinacao: calendario completo para caes e gatos. Carrossel salvo-nos-destaques.',
    '5 sinais de que seu pet precisa de atendimento veterinario imediato.',
    'Mito ou verdade: "[crenca popular sobre pets]". Esclarea com ciencia.',
    'Alimentacao saudavel para pets: o que pode e o que nao pode comer.',
    'Por que a castracao e a decisao mais responsavel que voce pode tomar pelo seu pet.',
    'Reels: bastidores de um atendimento veterinario — humanize e gere empatia.',
    'Comportamento animal: o que [gesto comum do pet] realmente significa.',
    'Zoonoses: o que sao, como prevenir e por que nao e motivo de abandonar o animal.',
    'Depoimento de tutor: historia de recuperacao de um paciente peludo.',
    'Dica de saude preventiva para [estacao do ano]: o que ficar atento com seu pet.',
  ],
  'Fotografia': [
    'Antes e depois de edicao: mostre seu processo criativo e habilidade tecnica.',
    '5 erros que iniciantes cometem ao fotografar [retratos / casamentos / produtos].',
    'Bastidores de um ensaio: mostra o processo do behind the scenes.',
    'Como iluminar naturalmente um espaco para fotografia — dica pratica com video.',
    'O que perguntar ao fotografo antes de contratar — educa o cliente ideal.',
    'Reels: timelapse do seu processo de edicao — gera curiosidade e engajamento.',
    'A diferenca entre uma foto boa e uma foto incrivel — composicao, luz, emoacao.',
    'Depoimento de cliente: o impacto das fotos no negocio / momento especial deles.',
    'Tendencias de fotografia de [nicho: casamento, produto, retrato] em [ano atual].',
    'Minha mochila / equipamento: o que eu nao saia sem para [tipo de trabalho].',
  ],
  'Design': [
    'Antes e depois de [logo / identidade visual]: mostra o processo e resultado.',
    'Principios de design que todo empreendedor precisa conhecer — carrossel educativo.',
    'Por que o logo barato custa caro no longo prazo — argumento de valor.',
    'Bastidores do processo criativo: como nasce uma identidade visual.',
    'O que e (e o que nao e) branding — esclarea para seu publico.',
    'As cores da sua marca dizem muito: psicologia das cores explicada.',
    'Tipografia: por que a fonte certa faz toda a diferenca na comunicacao visual.',
    'Reels: processo de criacao de [peca especifica] — speedart ou timelapse.',
    'Como avaliar se sua identidade visual esta alinhada com seu posicionamento.',
    'Depoimento de cliente: o impacto do redesign na percepcao da marca deles.',
  ],
  'RH e Gestao de Pessoas': [
    'Como estruturar um processo seletivo eficiente — passo a passo.',
    'Os erros mais comuns no onboarding de novos funcionarios — e como evitar.',
    'Por que cultura organizacional nao e apenas discurso — como construir na pratica.',
    'Sinais de que seu time esta em burnout — e o que fazer como gestor.',
    'Feedback que funciona: como dar retorno sem gerar defensividade.',
    'O que e liderança situacional e por que todo gestor deveria conhecer.',
    'Reels: dica rapida de gestao de pessoas para pequenas empresas.',
    'Como reter talentos sem depender apenas de salario — beneficios e cultura.',
    'A diferenca entre chefe e lider — reflexao para gestores e empreendedores.',
    'Tendencias em gestao de pessoas para [ano atual]: o que as empresas mais humanizadas estao fazendo.',
  ],
};

const IDEIAS_GENERICAS = [
  'Faca um Reels mostrando os bastidores do seu dia de trabalho — humanize sua marca.',
  'Responda as 3 duvidas mais frequentes que voce recebe dos seus clientes.',
  'Compartilhe um aprendizado recente da sua area — posicione-se como especialista.',
  'Carrossel: "Antes de contratar um(a) [sua profissao], saiba disso" — educa o cliente ideal.',
  'Mito ou verdade sobre [tema central do seu negocio] — alta relevancia e compartilhamento.',
  'Mostre um resultado real (com autorizacao) do seu trabalho com um cliente.',
  'Dica do dia: algo simples que seu publico pode aplicar hoje mesmo.',
  'Tendencias da sua area em [mes atual]: o que voce esta acompanhando?',
  'Humanize: "por que escolhi essa profissao" — historia pessoal gera conexao.',
  'Campanha do mes: qual data comemorativa se encaixa com o seu nicho? Crie conteudo relevante.',
];

function getIdeias(area) {
  if (!area) return IDEIAS_GENERICAS;
  const chave = Object.keys(IDEIAS_BASE).find(k => area.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(area.toLowerCase()));
  return chave ? IDEIAS_BASE[chave] : IDEIAS_GENERICAS;
}

function getSemanaAtual() {
  const d = new Date();
  const startYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startYear) / 86400000 + startYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
}

const PAUTAS_EXEMPLO = {
  'Advocacia': [
    { titulo: 'Novas regras trabalhistas 2026', ideia: 'Explique em 3 slides o que muda para empregados e empregadores. Use linguagem simples.' },
    { titulo: 'Divorcio consensual online', ideia: 'Como funciona o processo 100% digital? Quais os documentos necessarios? Reels explicativo.' },
    { titulo: 'LGPD para pequenas empresas', ideia: 'Checklist do que toda empresa precisa ter para estar em conformidade.' },
  ],
  'Nutricao': [
    { titulo: 'Jejum intermitente: verdades e mitos', ideia: 'Carrossel comparando o que a ciencia diz vs o que circula nas redes.' },
    { titulo: 'Alimentos ultraprocessados na mira da ANVISA', ideia: 'O que muda na rotulagem? Como educar seus pacientes sobre isso.' },
    { titulo: 'Saude intestinal e saude mental', ideia: 'Explique o eixo intestino-cerebro de forma visual e acessivel.' },
  ],
  'Medicina': [
    { titulo: 'Dengue: sintomas vs gripe', ideia: 'Infografico comparativo para compartilhar. Alta relevancia em epoca de surto.' },
    { titulo: 'Saude mental pos-pandemia', ideia: 'Dados atualizados + como seu consultorio pode acolher esses pacientes.' },
    { titulo: 'Exames preventivos por faixa etaria', ideia: 'Checklist por decada de vida. Salvar nos destaques.' },
  ],
  'Odontologia': [
    { titulo: 'Clareamento dental em casa: riscos', ideia: 'O que os kits vendidos online nao contam. Postagem de alerta + CTA para consulta.' },
    { titulo: 'Bruxismo e ansiedade', ideia: 'Connexao entre stress e saude bucal. Tendencia crescente.' },
    { titulo: 'Tratamento ortodontico adulto', ideia: 'Desmistificar que aparelho e so para criancas. Cases e antes/depois.' },
  ],
};

export default function PautasQuentes() {
  const [aba, setAba] = useState('pautas');
  const [areas, setAreas] = useState(() => getOrDefault('areas_cliente', []));
  const [pautas, setPautas] = useState(() => getOrDefault('pautas', []));
  const [novaArea, setNovaArea] = useState('');
  const [gerando, setGerando] = useState(false);

  // Banco de ideias
  const [bancoIdeias, setBancoIdeias] = useState(() => getOrDefault('banco_ideias', {}));
  const [copiadoIdx, setCopiadoIdx] = useState(null);
  const semanaAtual = getSemanaAtual();
  const clientes = getOrDefault('clientes', []).filter(c => !c.data_saida && c.status === 'ativo');

  const gerarIdeiasCliente = (clienteId, area) => {
    const base = getIdeias(area);
    const shuffled = [...base].sort(() => Math.random() - 0.5).slice(0, 10);
    const novo = { ...bancoIdeias, [clienteId]: { semana: semanaAtual, ideias: shuffled } };
    setBancoIdeias(novo);
    set('banco_ideias', novo);
  };

  const copiarIdeia = (texto, idx) => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoIdx(idx);
      setTimeout(() => setCopiadoIdx(null), 2000);
    });
  };

  const mesAtual = new Date().getMonth() + 1;

  const datasFiltradas = DATAS_IMPORTANTES.filter(d =>
    d.areas.includes('todos') || areas.some(a => d.areas.some(da => da.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(da.toLowerCase())))
  ).sort((a, b) => {
    // Ordena: meses futuros/atual primeiro, depois meses passados
    const ajustar = (m) => m < mesAtual ? m + 12 : m;
    return ajustar(a.mes) - ajustar(b.mes) || a.dia - b.dia;
  });

  const salvarAreas = (novas) => {
    setAreas(novas);
    set('areas_cliente', novas);
  };

  const adicionarArea = (area) => {
    if (!area.trim() || areas.includes(area.trim())) return;
    salvarAreas([...areas, area.trim()]);
    setNovaArea('');
  };

  const removerArea = (area) => {
    salvarAreas(areas.filter(a => a !== area));
  };

  const gerarPautas = () => {
    setGerando(true);
    setTimeout(() => {
      const novasPautas = [];
      areas.forEach(area => {
        const lista = PAUTAS_EXEMPLO[area];
        if (lista) {
          lista.forEach(p => {
            novasPautas.push({
              ...p,
              area,
              data: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
              id: Date.now() + Math.random(),
            });
          });
        } else {
          novasPautas.push({
            titulo: `Tendencias em ${area} esta semana`,
            ideia: `Pesquise as principais novidades e regulamentacoes da area de ${area} e transforme em conteudo educativo para seu publico.`,
            area,
            data: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
            id: Date.now() + Math.random(),
          });
        }
      });
      setPautas(novasPautas);
      set('pautas', novasPautas);
      setGerando(false);
    }, 1500);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Flame size={24} className="text-[#486c96]" />
        <h1 className="page-title mb-0">Pautas Quentes</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setAba('pautas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${aba === 'pautas' ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
          Pautas da Semana
        </button>
        <button onClick={() => setAba('datas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${aba === 'datas' ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
          <Calendar size={14} /> Datas Importantes
        </button>
        <button onClick={() => setAba('ideias')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${aba === 'ideias' ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
          <Brain size={14} /> Banco de Ideias
        </button>
      </div>

      {aba === 'datas' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">Datas importantes filtradas pelos nichos dos seus clientes. Configure as areas ao lado em "Pautas da Semana".</p>
          {areas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">
              Configure as areas dos seus clientes na aba "Pautas da Semana" para ver as datas importantes do nicho.
            </div>
          ) : datasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">
              Nenhuma data encontrada para as areas configuradas.
            </div>
          ) : (
            <div className="space-y-2">
              {datasFiltradas.map((d, i) => {
                const isHoje = d.mes === mesAtual && d.dia === new Date().getDate();
                const passado = d.mes < mesAtual || (d.mes === mesAtual && d.dia < new Date().getDate());
                return (
                  <div key={i} className={`bg-white rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-4 ${isHoje ? 'border-[#486c96] border-2' : 'border-[#d2b99b]/30'} ${passado && !isHoje ? 'opacity-50' : ''}`}>
                    <div className="text-center flex-shrink-0 w-12">
                      <div className="text-lg font-bold text-[#486c96]">{String(d.dia).padStart(2,'0')}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase">{MESES[d.mes-1].slice(0,3)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{d.nome}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {d.areas.includes('todos') ? (
                          <span className="text-[10px] bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">Todos os nichos</span>
                        ) : d.areas.map(a => (
                          <span key={a} className="text-[10px] bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">{a}</span>
                        ))}
                      </div>
                    </div>
                    {isHoje && <span className="text-xs font-bold bg-[#486c96] text-white px-2 py-0.5 rounded-full flex-shrink-0">Hoje!</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {aba === 'ideias' && (
        <div>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <p className="text-sm text-gray-500">10 ideias de conteudo por cliente, baseadas no nicho de cada um. Geradas para a semana {semanaAtual}.</p>
          </div>

          {clientes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">
              Cadastre clientes no Financeiro para gerar ideias personalizadas por nicho.
            </div>
          ) : (
            <div className="space-y-5">
              {clientes.map(c => {
                const dados = bancoIdeias[c.id];
                const isAtualizado = dados && dados.semana === semanaAtual;
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#d2b99b]/20">
                      <div>
                        <h3 className="font-bold text-[#486c96]">{c.nome}</h3>
                        <p className="text-xs text-gray-400">{c.area || 'Area nao definida'} {isAtualizado && <span className="text-green-500 ml-1">✓ atualizado</span>}</p>
                      </div>
                      <button onClick={() => gerarIdeiasCliente(c.id, c.area)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-[#f9f1e7] text-[#486c96] hover:bg-[#d2b99b]/20 transition-colors">
                        <RefreshCw size={14} /> {dados ? 'Regenerar' : 'Gerar ideias'}
                      </button>
                    </div>
                    {dados ? (
                      <div className="divide-y divide-[#d2b99b]/10">
                        {dados.ideias.map((ideia, i) => (
                          <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-[#f9f1e7]/50">
                            <span className="text-[#d2b99b] font-bold text-xs w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-sm text-gray-700 flex-1 leading-relaxed">{ideia}</p>
                            <button onClick={() => copiarIdeia(ideia, `${c.id}-${i}`)}
                              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${copiadoIdx === `${c.id}-${i}` ? 'text-green-500' : 'text-gray-300 hover:text-[#486c96]'}`}>
                              {copiadoIdx === `${c.id}-${i}` ? <CheckIcon size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-6 text-center text-gray-400 text-sm">
                        Clique em "Gerar ideias" para criar 10 ideias personalizadas para {c.nome}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {aba === 'pautas' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurar areas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30">
          <h3 className="section-title">Areas dos meus clientes</h3>

          <div className="flex gap-2 mb-3">
            <input
              className="input flex-1"
              placeholder="Ex: Advocacia"
              value={novaArea}
              onChange={e => setNovaArea(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && adicionarArea(novaArea)}
            />
            <button className="btn-primary px-3" onClick={() => adicionarArea(novaArea)}>
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {areas.map(area => (
              <span
                key={area}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#486c96] text-white"
              >
                {area}
                <button onClick={() => removerArea(area)} className="hover:opacity-70">
                  <Trash2 size={10} />
                </button>
              </span>
            ))}
          </div>

          <div className="border-t border-[#d2b99b]/30 pt-3">
            <p className="text-xs text-gray-400 mb-2 font-medium">Sugestoes rapidas:</p>
            <div className="flex flex-wrap gap-1">
              {AREAS_SUGERIDAS.filter(a => !areas.includes(a)).slice(0, 8).map(area => (
                <button
                  key={area}
                  onClick={() => adicionarArea(area)}
                  className="px-2 py-1 rounded-lg text-xs bg-[#f9f1e7] text-[#486c96] hover:bg-[#d2b99b]/30 transition-colors"
                >
                  + {area}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            onClick={gerarPautas}
            disabled={areas.length === 0 || gerando}
          >
            <RefreshCw size={16} className={gerando ? 'animate-spin' : ''} />
            {gerando ? 'Gerando...' : 'Gerar pautas da semana'}
          </button>
        </div>

        {/* Pautas */}
        <div className="lg:col-span-2 space-y-4">
          {pautas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#d2b99b]/30">
              <Flame size={32} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Selecione as areas dos seus clientes e clique em Gerar pautas</p>
            </div>
          ) : (
            pautas.map(pauta => (
              <div key={pauta.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f9f1e7] text-[#486c96] mb-2">
                      {pauta.area}
                    </span>
                    <h3 className="font-bold text-[#486c96] mb-2">{pauta.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{pauta.ideia}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-3">Gerado em {pauta.data}</div>
              </div>
            ))
          )}
        </div>
      </div>}
    </div>
  );
}
