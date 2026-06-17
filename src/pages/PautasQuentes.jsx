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
    'Carrossel: "Fui demitido sem justa causa — quais sao meus direitos?" Explique multa, aviso previo, FGTS e seguro desemprego de forma simples.',
    'Reels rapido: "Voce pode filmar um policial te abordando?" Responda com base na lei e quebre essa duvida que todo mundo tem.',
    'Carrossel: 5 clausulas perigosas que aparecem em contratos de aluguel e que a maioria das pessoas assina sem perceber.',
    'Post educativo: o que e e o que nao e assedio moral no trabalho — exemplos reais e o que fazer se voce estiver passando por isso.',
    'Reels: "Divorcio consensual: da para fazer em cartorio sem advogado?" Explique quando sim e quando e obrigatorio ter um profissional.',
    'Carrossel: "Meu chefe quer me demitir por mensagem no WhatsApp — isso e valido?" Eduque sobre demissao informal e seus riscos.',
    'Post: pensao alimenticia — quem tem direito, como calcular e o que acontece quando o pai (ou mae) para de pagar.',
    'Reels: "Voce sabia que pode processar uma empresa por propaganda enganosa?" Mostre como funciona o CDC na pratica.',
    'Carrossel: o que fazer nas primeiras 24h depois de um acidente de transito para proteger seus direitos legalmente.',
    'Post humanizado: "Por que tantas pessoas perdem processos que poderiam ganhar?" Fale sobre a importancia de buscar orientacao logo no inicio.',
    'Reels: diferenca entre acao judicial e acordo extrajudicial — quando cada caminho compensa mais.',
    'Carrossel: direitos do consumidor que poucas pessoas conhecem — produto com defeito, cobranca indevida, cancelamento de servico.',
    'Post: o que e inventario e por que voce deveria pensar nisso enquanto esta vivo para evitar dor de cabeca para sua familia.',
    'Reels: "Fui roubado e a empresa nao quer me reembolsar — o que eu faco?" Passo a passo pratico.',
    'Carrossel: 3 situacoes em que o MEI e o autonomo precisam urgentemente de um advogado e geralmente nao sabem.',
  ],
  'Nutricao': [
    'Reels: "O que acontece no seu corpo nas primeiras 24 horas sem acucar?" Mostra de forma visual e educativa.',
    'Carrossel: cafe da manha de verdade x cafe da manha que parece saudavel mas nao e — compare opcoes reais do dia a dia.',
    'Post: por que cortar o carboidrato completamente geralmente nao funciona a longo prazo — a ciencia explica.',
    'Reels: "Como eu monto um pre-treino sem suplemento?" Mostra 3 opcoes de alimentacao natural antes do exercicio.',
    'Carrossel: diferenca entre fome de verdade e fome emocional — como identificar e o que fazer com cada uma.',
    'Post educativo: o que e o indice glicemico e por que ele importa mais do que a quantidade de calorias para muitas pessoas.',
    'Reels: rotina de alimentacao de uma semana saudavel e realista — sem dieta restritiva, sem sofrimento.',
    'Carrossel: 5 alimentos que parecem saudaveis mas sao cheios de acucar escondido — com exemplos de marcas comuns.',
    'Post: por que a balanca oscila ate 3kg em um dia mesmo sem voce comer demais — explica retencao de liquidos, ciclo hormonal, sal.',
    'Reels: "Qual o melhor horario para comer fruta?" Desmistifica de vez essa duvida classica.',
    'Carrossel: marmita saudavel para a semana em menos de 2 horas — passo a passo de preparo antecipado.',
    'Post: jejum intermitente — para quem funciona, para quem nao funciona, e o que a evidencia cientifica diz hoje.',
    'Reels: 3 substituicoes simples no cafe da manha que fazem diferenca real na energia do dia.',
    'Carrossel: sinais de que seu corpo pode estar com falta de ferro, vitamina D ou B12 — e quando ir ao medico.',
    'Post humanizado: "Quantas calorias eu preciso por dia?" Explica que depende e mostra como pensar nisso de forma individualizada.',
  ],
  'Medicina': [
    'Carrossel: diferenca entre virose e bacteriose — quando precisa de antibiotico e quando nao precisa.',
    'Reels: "Pressao alta: quais os sintomas e quando ir ao pronto-socorro?" — muitas pessoas nao sabem que e silenciosa.',
    'Post: por que voce nao deveria tomar dipirona e ibuprofeno ao mesmo tempo sem orientacao medica.',
    'Carrossel: exames de sangue — o que sao e o que medem colesterol total, HDL, LDL, triglicerideos. Explique cada um.',
    'Reels: "Tenho dor de cabeca todo dia — pode ser enxaqueca ou algo mais serio?" Orienta quando buscar ajuda.',
    'Post educativo: o que e pre-diabetes e como reverter antes de se tornar diabetes tipo 2 — habitos que funcionam.',
    'Carrossel: checklist de exames preventivos por faixa etaria — o que fazer aos 20, 30, 40 e 50 anos.',
    'Reels: o que acontece no seu corpo quando voce fica muito tempo sem dormir — efeitos reais da privacao de sono.',
    'Post: tireoide — hipotireoidismo e hipertireoidismo, como diferenciar os sintomas e o que o diagnostico envolve.',
    'Carrossel: 5 sinais de que sua ansiedade ja virou um problema de saude e precisa de atendimento.',
    'Reels: "Febre alta — quando abaixa em casa e quando e hora de ir ao hospital?" Orienta de forma pratica.',
    'Post: saude masculina — por que homens resistem ao medico e quais exames sao essenciais para eles.',
    'Carrossel: suplementos que realmente funcionam (e os que sao so marketing) — com base em evidencias.',
    'Reels: diferenca entre colesterol ruim (LDL) e bom (HDL) — explicado com analogia simples para leigos.',
    'Post humanizado: "Por que voce deve fazer o check-up mesmo se sentir que esta bem?" Fala sobre prevencao antes do sintoma.',
  ],
  'Odontologia': [
    'Reels: tecnica correta de escovacao — mostra o angulo certo, o tempo ideal e os erros mais comuns.',
    'Carrossel: clareamento dental caseiro x clareamento no consultorio — diferencas reais, riscos e resultados.',
    'Post: bruxismo — por que cada vez mais pessoas rangem os dentes a noite e o que o estresse tem a ver com isso.',
    'Reels: "Dor de dente no final de semana — o que fazer ate conseguir consulta?" Dicas seguras de alivio temporario.',
    'Carrossel: aparelho fixo x alinhadores transparentes (Invisalign) — compare preco, tempo, conforto e indicacoes.',
    'Post: o que e gengivite, como identificar e por que ignorar pode virar algo muito mais serio.',
    'Reels: fio dental vs fita dental vs irrigador bucal — qual usar e como usar de forma correta.',
    'Carrossel: 5 habitos do dia a dia que destroem o esmalte dos dentes sem voce perceber.',
    'Post: implante dentario — como funciona o procedimento, quanto tempo leva e para quem e indicado.',
    'Reels: o que muda na saude bucal durante a gravidez e por que gestantes precisam redobrar os cuidados.',
    'Carrossel: crianca com dente de leite caindo — o que e normal, quando preocupar e a importancia do dentista pediatrico.',
    'Post: sensibilidade dental — por que ela aparece e o que fazer (e o que parar de fazer) para melhorar.',
    'Reels: "Meu filho tem medo de dentista — o que eu faco?" Dicas praticas para tornar a experiencia positiva desde pequeno.',
    'Carrossel: o que e harmonizacao orofacial e o que os procedimentos fazem no rosto — desmistifique com fotos explicativas.',
    'Post humanizado: o quanto um sorriso saudavel impacta na autoestima e na confianca no dia a dia — depoimentos reais.',
  ],
  'Psicologia': [
    'Carrossel: diferenca entre tristeza e depressao — sintomas, duracao e quando buscar ajuda profissional.',
    'Reels: "O que e ansiedade generalizada?" — explique de forma acolhedora e quebre o estigma em menos de 60 segundos.',
    'Post: por que voce procrastina mesmo sabendo que precisa fazer — o que o cerebro faz e como sair do loop.',
    'Carrossel: 5 sinais de que voce pode estar em um relacionamento emocionalmente esgotante.',
    'Reels: tecnica de respiracao 4-7-8 para acalmar a ansiedade — mostra ao vivo como fazer.',
    'Post: o que e TCC (terapia cognitivo-comportamental) e como ela funciona na pratica — sem jargao.',
    'Carrossel: burnout x cansaco comum — como diferenciar e o que fazer quando e burnout de verdade.',
    'Reels: "Estou com ansiedade ou com medo?" — explique a diferenca e quando cada um aparece.',
    'Post: limites saudaveis — o que sao, como colocar sem culpa e por que dizem mais sobre autoestima do que sobre egoismo.',
    'Carrossel: o que acontece no seu cerebro quando voce dorme mal — efeitos da privacao de sono na saude mental.',
    'Reels: uma tecnica simples de autoconhecimento — a tecnica do diario emocional e como comecar hoje.',
    'Post: sindrome do impostor — o que e, quem costuma ter e como lidar com essa sensacao de "nao ser suficiente".',
    'Carrossel: como ter uma conversa dificil sem brigar — passos praticos de comunicacao nao-violenta.',
    'Reels: por que a terapia nao e so para quem esta em crise — o que voce ganha ao comecara antes do limite.',
    'Post humanizado: o que eu aprendo com meus pacientes todos os dias — compartilhe (com etica) um insight da clinica.',
  ],
  'Educacao Fisica': [
    'Reels: os 3 erros mais comuns na agachamento — mostra feito certo e errado de forma rapida e didatica.',
    'Carrossel: treino de 20 minutos para fazer em casa sem equipamento — com foto ou video de cada exercicio.',
    'Post: por que voce nao perde peso mesmo treinando todo dia — fala sobre alimentacao, sono, estresse e consistencia.',
    'Reels: "Quanto tempo leva para ver resultado no treino?" — responde com honestidade e educa sobre o processo.',
    'Carrossel: diferenca entre hipertrofia, emagrecimento e definicao — o que muda no treino e na dieta de cada objetivo.',
    'Post: a importancia do descanso — por que o dia de folga do treino e tao necessario quanto o treino em si.',
    'Reels: aquecimento rapido antes do treino — 5 minutos que evitam lesao. Mostra ao vivo.',
    'Carrossel: mitos do mundo da musculacao — "musculo vira gordura", "mulher que treina fica masculina", etc. Desmistifica.',
    'Post: dor muscular no dia seguinte (DOMS) — o que e, por que acontece e quando e sinal de que voce exagerou.',
    'Reels: alongamento pos-treino — mostre uma rotina de 5 minutos que todo mundo deveria fazer mas ninguem faz.',
    'Carrossel: como montar um treino funcional para um iniciante absoluto — passo a passo com progressao.',
    'Post: diferenca entre personal trainer presencial e online — vantagens, desvantagens e para quem cada um funciona.',
    'Reels: depoimento de aluno — o que mudou na vida dele alem do corpo. Humanize os resultados do seu trabalho.',
    'Carrossel: o que comer antes e depois do treino para ter mais energia e recuperacao mais rapida.',
    'Post: por que consistencia bate intensidade — a ciencia da adaptacao e por que treinar todos os dias nao e mais eficiente.',
  ],
  'Fisioterapia': [
    'Reels: exercicio para aliviar dor lombar em quem fica sentado o dia todo — mostra ao vivo, simples e seguro.',
    'Carrossel: postura no home office — os erros mais comuns na cadeira, monitor e teclado e como corrigir.',
    'Post: o que e lombalgia, por que ela aparece e quando e hora de ir ao fisioterapeuta.',
    'Reels: "Estalo no joelho — e perigoso?" — desmistifica e explica quando preocupar e quando e normal.',
    'Carrossel: diferenca entre tendinite e bursite — sintomas, causas e tratamento de cada uma.',
    'Post: por que voce nao deveria aguentar a dor e esperar melhorar — riscos de ignorar sinais do corpo.',
    'Reels: exercicios para aliviar dor no pescoco — rotina rapida para quem trabalha no computador.',
    'Carrossel: lesao no tornozelo — o que fazer nas primeiras horas (protocolo RICE) antes de consultar.',
    'Post: fisioterapia respiratoria — o que e e como ajuda em pos-operatorio, Covid longa e doencas pulmonares.',
    'Reels: mobilidade do quadril — por que e fundamental e 3 exercicios simples para melhorar.',
    'Carrossel: diferenca entre fisioterapia e academia — quando cada uma e indicada e por que sao complementares.',
    'Post: fascite plantar — por que a dor no calcanhar aparece, quem tem mais risco e como tratar.',
    'Reels: ergonomia ao dormir — posicao ideal para cada tipo de dor e como o travesseiro faz diferenca.',
    'Carrossel: sinais de que sua postura pode estar causando dor de cabeca cronica.',
    'Post humanizado: caso clinico anonimo — o processo de reabilitacao de alguem que veio sem conseguir andar e saiu correndo.',
  ],
  'Arquitetura': [
    'Carrossel: antes e depois de uma sala de estar pequena — o que mudou, por que funcionou e quanto custou aproximadamente.',
    'Reels: como a iluminacao transforma completamente um ambiente — mostra o mesmo espaco com luz diferente.',
    'Post: as 5 tendencias de interiores que estao em alta agora — com fotos de referencia para inspirar.',
    'Carrossel: cores que ampliam visualmente um espaco — com exemplos praticos de paredes, pisos e moveis.',
    'Post: o que perguntar ao arquiteto antes de assinar o contrato — lista de checagem para o cliente.',
    'Reels: tour rapido por um projeto que voce acabou de entregar — humanize seu trabalho e mostre o resultado real.',
    'Carrossel: banheiro pequeno — 6 solucoes de projeto que fazem parecer maior sem obras pesadas.',
    'Post: a diferenca entre decorador e arquiteto — quando contratar cada um e o que cada um pode fazer por voce.',
    'Reels: processo criativo de um projeto — do briefing ao croqui. Mostra os bastidores com croqui ou tablet.',
    'Carrossel: erros de decoracao que envelhecem um ambiente — e as solucoes para cada um.',
    'Post: revestimentos para cozinha — porcelana, ceramica, pedra, madeira: vantagens e quando usar cada um.',
    'Reels: o que e luz quente vs luz fria e por que isso muda tudo em um ambiente — explique com exemplos visuais.',
    'Carrossel: apartamento alugado — o que e possivel mudar sem perder a caucao e sem obra.',
    'Post: como criar um home office funcional mesmo num espaco pequeno — ergonomia, iluminacao e organizacao.',
    'Reels: a paleta de cores do projeto — mostre como voce escolheu as cores de um projeto real e por que cada escolha.',
  ],
  'Contabilidade': [
    'Carrossel: Simples Nacional x Lucro Presumido — explique em linguagem simples quando vale a pena mudar de regime.',
    'Reels: "MEI pode ter funcionario?" — responda essa duvida classica em menos de 60 segundos.',
    'Post: o que e pro-labore e por que todo socio de empresa deveria receber — diferenca para distribuicao de lucros.',
    'Carrossel: documentos que o MEI precisa guardar por pelo menos 5 anos — lista pratica.',
    'Post: 5 erros fiscais que colocam o autonomo em risco de malha fina — e como evitar cada um.',
    'Reels: "Posso deduzir o home office no Imposto de Renda?" — resposta direta com contexto legal.',
    'Carrossel: passo a passo para abrir uma empresa no Brasil — do CNPJ ao alvara em linguagem acessivel.',
    'Post: como separar as financas pessoais das empresariais — por que misturar as duas e o maior erro do pequeno empresario.',
    'Reels: o que muda no Imposto de Renda 2026 — principais novidades de forma resumida.',
    'Carrossel: o que e e como funciona o Simples Nacional — para quem se qualifica e quais as vantagens.',
    'Post: por que contratar um contador desde o inicio da empresa e investimento e nao custo — calcule o quanto voce pode perder sem um.',
    'Reels: diferenca entre DAE, DARF e DAS — o que cada um e e quem precisa pagar.',
    'Carrossel: planejamento tributario legal — formas de pagar menos imposto que qualquer empresa pode usar.',
    'Post: o que e nota fiscal e quando o MEI e obrigado a emitir — desmistifique o processo.',
    'Reels: "Ja devo ao Simples — o que faco?" — oriente sobre parcelamento e regularizacao.',
  ],
  'Moda': [
    'Carrossel: como montar 5 looks diferentes com apenas 3 pecas basicas do armario.',
    'Reels: "Essa combinacao funciona?" — pega um look inusitado e explica por que ele funciona ou nao.',
    'Post: capsule wardrobe — o que e e as 10 pecas essenciais que todo armario deveria ter.',
    'Carrossel: styling para o tipo de corpo retangular, ampulheta, triangulo e triangulo invertido — o que favorece cada silhueta.',
    'Reels: o mesmo look, 3 estilos diferentes — mostra como mudar acessorios e sapatos muda tudo.',
    'Post: como usar estampas sem parecer exagerado — regras basicas que todo mundo deveria saber.',
    'Carrossel: tendencias do inverno 2026 — o que usar, o que evitar e como adaptar para o dia a dia.',
    'Reels: armario sustentavel — como comprar menos e usar mais. Dicas praticas de consumo consciente.',
    'Post: a diferenca entre estilo e moda — por que voce nao precisa seguir tendencia para se vestir bem.',
    'Carrossel: como usar looks casuais no trabalho sem parecer desleixada — para ambientes que nao exigem social.',
    'Reels: erros de styling que envelhecem qualquer look — e como evitar cada um.',
    'Post: como criar um look elegante gastando pouco — pecas de qualidade x pecas de quantidade.',
    'Carrossel: acessorios que transformam um look basico em algo especial — como usar cada tipo.',
    'Reels: bastidores do making of de um look para cliente — mostra seu processo de styling.',
    'Post: looks para diferentes tipos de evento — formatura, almoco de negocios, happy hour, casamento de dia.',
  ],
  'Beleza e Estetica': [
    'Carrossel: rotina de skincare basica para iniciantes — limpeza, hidratacao, protecao solar. O que realmente funciona.',
    'Reels: o erro que a maioria das mulheres comete ao aplicar protetor solar — quantidade e replicacao.',
    'Post: diferenca entre botox e bioestimulador de colageno — o que cada um faz, resultado esperado e duracao.',
    'Carrossel: como identificar seu tipo de pele — seca, oleosa, mista, sensivel — e montar a rotina certa para cada uma.',
    'Reels: antes e depois de uma limpeza de pele profunda — mostra o processo com autorizacao.',
    'Post: retinol — o que e, como usar, quando comecar e os erros que irritam a pele.',
    'Carrossel: vitamina C na skincare — beneficios reais, como escolher o produto e como aplicar corretamente.',
    'Reels: drenagem linfatica — o que ela faz de verdade, o que ela nao faz, e para quem e indicada.',
    'Post: o que e preenchimento labial e por que tantas pacientes ficam com resultado artificial — explique o processo.',
    'Carrossel: cuidados com a pele durante e depois do verao — o que o sol realmente faz e como recuperar.',
    'Reels: como escolher o filtro solar certo para o seu tipo de pele — FPS, textura, para oleosa vs seca.',
    'Post: acne em adultos — por que ela aparece depois dos 25 anos e o que faz diferenca no tratamento.',
    'Carrossel: o que e brow lamination, lash lifting e cada procedimento do segmento — explique de forma visual.',
    'Reels: um dia na clinica — bastidores de como e o seu atendimento. Humanize sua rotina.',
    'Post: hidratacao x hidratacao profunda x nutricao capilar — diferenca real e como saber o que seu cabelo precisa.',
  ],
  'Gastronomia': [
    'Reels: receita de 3 ingredientes que fica boa de verdade — simples, rapida e visual.',
    'Carrossel: os erros que arruinam um bolo simples — e como evitar cada um deles.',
    'Post: mise en place — o que e e por que organizar os ingredientes antes de comecar muda tudo na cozinha.',
    'Reels: bastidores da criacao de um prato novo — do rascunho ao emplatamento. Humanize seu processo.',
    'Carrossel: como temperar carne do jeito certo — sal, tempo, tecnica. O que os chefs fazem diferente.',
    'Post: maridagem basica — regras simples de harmonizacao de vinho com comida para quem esta comecando.',
    'Reels: "Como deixar o arroz soltinho sempre?" — responda essa duvida classica de forma simples e visual.',
    'Carrossel: substituicoes para cozinha sem gluten — o que funciona e o que nao funciona na pratica.',
    'Post: historia e curiosidades do prato mais pedido do seu cardapio — crie conexao cultural com o publico.',
    'Reels: dica de emplatamento — como transformar um prato simples em algo visualmente bonito com gestos basicos.',
    'Carrossel: o que nao pode faltar em uma despensa bem organizada — lista pratica para cozinhar bem sem depender do mercado.',
    'Post: tour pelo seu espaco de trabalho — cozinha, equipamentos, organizacao. Humanize sua marca.',
    'Reels: receita de fim de semana que impressiona — algo um pouco mais elaborado com resultado visual incrivel.',
    'Carrossel: como fazer um cardapio de festa em casa sem estresse — o que preparar antes e o que deixar para a hora.',
    'Post: o que e cozinha autoral e o que diferencia um chef de um cozinheiro — educativo e posicionador.',
  ],
  'Imoveis': [
    'Carrossel: passo a passo do financiamento imobiliario — do simulador a entrega das chaves. Simplifique o processo.',
    'Reels: "Posso usar o FGTS para comprar um imovel?" — resposta direta sobre regras e limites.',
    'Post: alugar x comprar — analise financeira honesta para cada momento de vida.',
    'Carrossel: o que verificar antes de assinar o contrato de compra e venda — checklist do comprador inteligente.',
    'Reels: tour rapido por um imovel a venda — mostre o espaco de forma atraente e profissional.',
    'Post: os 5 erros mais comuns de quem compra o primeiro imovel — e como cada um pode custar caro.',
    'Carrossel: diferenca entre escritura, registro e contrato de compra e venda — o que e cada um e quando usar.',
    'Reels: como a taxa Selic afeta o financiamento imobiliario — explique de forma simples para leigos.',
    'Post: o que um bom corretor de imoveis faz que voce nao consegue fazer sozinho — argumento de valor.',
    'Carrossel: como valorizar um imovel para vender mais rapido — melhorias simples que fazem diferenca no preco.',
    'Reels: o que e VGV, permuta e outros termos do mercado imobiliario — glossario rapido.',
    'Post: imovel na planta — vantagens, riscos e o que verificar na construtora antes de assinar.',
    'Carrossel: direitos do inquilino — o que o proprietario pode e o que nao pode fazer durante o contrato de aluguel.',
    'Reels: como funciona a vistoria de imovel — por que fazer sempre antes de entrar e ao sair.',
    'Post: tendencias do mercado imobiliario na sua cidade — posicione-se como especialista local.',
  ],
  'Financas Pessoais': [
    'Carrossel: regra 50/30/20 — como dividir o salario em necessidades, desejos e investimentos. Exemplos praticos.',
    'Reels: "Quanto eu precisaria guardar por mes para ter R$100 mil em 5 anos?" — faca o calculo ao vivo.',
    'Post: reserva de emergencia — quanto voce precisa, onde guardar e por que e o primeiro passo antes de investir.',
    'Carrossel: metodo bola de neve x avalanche — qual usar para sair das dividas mais rapido.',
    'Reels: os 3 gastos que as pessoas subestimam e que quebram o orcamento todo mes — app de streaming, delivery, parcelamentos.',
    'Post: o que e o Tesouro Direto e por que e a opcao mais segura para quem esta comecando a investir.',
    'Carrossel: como funciona o cartao de credito de verdade — juros rotativos, limite e o que nunca fazer.',
    'Reels: "Comprar a vista ou parcelado sem juros?" — resposta que surpreende a maioria das pessoas.',
    'Post: o que e inflacao e como ela corroi o poder de compra mesmo de quem guarda dinheiro na poupanca.',
    'Carrossel: planejamento financeiro para uma viagem — como juntar o dinheiro sem sacrificar o mes a mes.',
    'Reels: diferenca entre renda fixa e renda variavel — explique para quem nunca investiu.',
    'Post: o que e PGBL e VGBL e por que plano de previdencia privada pode (ou nao) fazer sentido para voce.',
    'Carrossel: como organizar as financas usando so uma planilha simples — sem app, sem complicacao.',
    'Reels: o custo real do habito de tomar cafe fora todo dia — calcule por mes e por ano e mostre o impacto.',
    'Post: financas na terapia — por que a relacao com dinheiro e emocional e como trabalhar isso.',
  ],
  'Empreendedorismo': [
    'Post: o que aprendi no meu primeiro ano de empresa — vulnerabilidade real, sem filtro.',
    'Carrossel: como precificar um servico — conta os custos, o tempo, o valor percebido. Sem subestimar.',
    'Reels: 5 ferramentas gratuitas que uso no meu negocio todo dia — Notion, Canva, Trello, Google Drive, etc.',
    'Post: como consegui meu primeiro cliente pagante — a historia real e a estrategia por tras.',
    'Carrossel: a diferenca entre ser autonomo e ter um negocio — mentalidade, estrutura e o que muda.',
    'Reels: "Como eu me organizo para fazer tudo sozinha?" — mostra sua rotina real de gestao.',
    'Post: por que nichar foi a melhor decisao do meu negocio — e o medo que eu tinha antes de fazer isso.',
    'Carrossel: como criar um processo de venda simples para servicos — o caminho do lead ao fechamento.',
    'Reels: o maior erro que eu cometi no inicio e o que aprendi com ele — autenticidade gera conexao.',
    'Post: como lidar com cliente que some depois do orcamento — o que isso diz e como responder.',
    'Carrossel: o que e CAC e LTV — metricas basicas que todo empreendedor deveria acompanhar.',
    'Reels: bastidores de uma semana real de trabalho — o que acontece fora das redes sociais.',
    'Post: como delegar sem perder o controle — o momento certo de contratar a primeira pessoa.',
    'Carrossel: quando dizer nao para um cliente — criterios claros para aceitar ou recusar um projeto.',
    'Reels: minha rotina matinal que aumenta minha producao — seja honesta sobre o que funciona e o que e mito.',
  ],
  'Marketing Digital': [
    'Carrossel: como o algoritmo do Instagram realmente funciona em 2026 — o que ele prioriza e o que te penaliza.',
    'Reels: analise ao vivo de uma bio do Instagram que nao converte — e como reescrever em 2 minutos.',
    'Post: a diferenca entre alcance, impressoes e engajamento — o que cada metrica mede de verdade.',
    'Carrossel: os 5 tipos de post que todo perfil profissional deveria ter — educativo, bastidores, prova social, oferta, conexao.',
    'Reels: como criar um carrossel que faz as pessoas deslizarem ate o final — tecnica de narrativa.',
    'Post: hashtags em 2026 — ainda funcionam? O que usar e o que evitar.',
    'Carrossel: como criar um CTA que converte — os erros mais comuns e as frases que realmente funcionam.',
    'Reels: bastidores de como eu planejo o mes de conteudo de um cliente — processo real.',
    'Post: stories vs feed vs reels — quando usar cada formato para cada objetivo.',
    'Carrossel: como analisar as metricas do Instagram e tomar decisoes com base nelas.',
    'Reels: o que fazer quando um post vai muito bem — como aproveitar o momento certo.',
    'Post: a diferenca entre presenca digital e consistencia — por que postar todos os dias nao e obrigatorio.',
    'Carrossel: como fazer um briefing de conteudo completo com o cliente — as perguntas essenciais.',
    'Reels: case de resultado — o que mudou em um perfil apos 3 meses de gestao profissional.',
    'Post: o que os 10% de perfis com melhor desempenho fazem diferente — padroes que aparecem nos dados.',
  ],
  'Coaching': [
    'Post: o que e (e o que NAO e) coaching — desmistifique de vez e eduque quem ainda confunde com terapia.',
    'Carrossel: exercicio de autoconhecimento — o que sao valores e como descobrir os seus em 10 minutos.',
    'Reels: tecnica de visualizacao do futuro que voce pode fazer hoje — simples, pratica e poderosa.',
    'Post: sindrome do impostor — o que e e por que pessoas competentes sao as que mais sofrem com isso.',
    'Carrossel: a diferenca entre meta e sonho — como transformar uma vontade vaga em um objetivo com plano.',
    'Reels: "Estou preso na zona de conforto — o que faco?" — resposta pratica em menos de 60 segundos.',
    'Post: habitos de pessoas de alta performance — o que a ciencia diz que realmente faz diferenca.',
    'Carrossel: metodo SMART — como criar metas que voce vai realmente cumprir, com exemplos praticos.',
    'Reels: uma reflexao poderosa sobre procrastinacao — o que realmente esta por baixo dela.',
    'Post: por que terapia e coaching sao complementares — o que cada um faz e quando indicar um ou outro.',
    'Carrossel: como dar feedback a si mesmo — a tecnica do diario de revisao semanal.',
    'Reels: depoimento de cliente — o que mudou na carreira ou vida pessoal apos o processo de coaching.',
    'Post: a diferenca entre reatividade e responsabilidade — conceito central do desenvolvimento pessoal.',
    'Carrossel: o que e ikigai e como usar essa ferramenta para encontrar proposito de forma pratica.',
    'Reels: pergunta que eu faria para voce agora — algo que faz a pessoa parar e pensar. Interativo.',
  ],
  'Veterinaria': [
    'Carrossel: calendario de vacinas para caes — V8, V10, antirabica, gripe. O que cada uma previne.',
    'Reels: "Meu gato comeu [alimento] — e perigoso?" — responda para os mais comuns: uva, cebola, chocolate.',
    'Post: por que a castracao e a decisao mais responsavel que voce pode tomar pelo seu pet — alem do comportamento.',
    'Carrossel: sinais de que seu pet precisa de atendimento veterinario urgente — nao espere para ver.',
    'Reels: diferenca entre raca e SRD — por que adotar um vira-lata e uma escolha inteligente de saude.',
    'Post: pulga, carrapato e vermifugo — a frequencia certa de preventivos e o que acontece quando nao usa.',
    'Carrossel: alimentacao para caes — racao premium vs racao popular vs dieta natural. O que considerar.',
    'Reels: como identificar se seu gato esta com dor — gatos escondem muito bem e os sinais sao sutis.',
    'Post: por que gatos precisam de consulta anual mesmo parecendo saudaveis.',
    'Carrossel: zoonoses que voce pode pegar do seu pet — e como prevenir sem precisar se afastar deles.',
    'Reels: o que e microchip, como funciona e por que voce deveria colocar no seu pet ainda hoje.',
    'Post: pet idoso — o que muda na saude depois dos 7 anos e como adaptar os cuidados.',
    'Carrossel: tour pelo seu consultorio ou clinica — humanize e mostre o ambiente onde os pets sao atendidos.',
    'Reels: curiosidade do dia sobre comportamento animal — algo surpreendente sobre caes ou gatos.',
    'Post: caso clinico anonimo — como voce diagnosticou algo que os tutores nao tinham percebido. Gera admiracao e confianca.',
  ],
  'Fotografia': [
    'Reels: antes e depois de edicao — mostra a RAW e a foto editada com o processo pelo meio.',
    'Carrossel: 5 erros de iniciante em fotografia de retrato — e como corrigir cada um.',
    'Post: como funciona a luz natural — janela, horario, posicao e por que fotografia ao ar livre na "hora dourada" e diferente.',
    'Reels: bastidores de um ensaio fotografico — mostra o setup, a comunicacao com o cliente e o clima.',
    'Carrossel: preset x edicao manual — diferencas, quando usar cada um e por que identidade visual importa.',
    'Post: como precificar um ensaio fotografico — o que considerar alem do tempo de clique.',
    'Reels: o que muda na foto quando voce troca a lente — compare 35mm, 50mm e 85mm no retrato.',
    'Carrossel: dicas para o cliente se preparar para o ensaio — roupas, maquiagem, horario, expectativas.',
    'Post: fotografia de produto — o que faz diferenca em uma foto que vende vs uma que nao vende.',
    'Reels: composicao fotografica — regra dos tercos, simetria e linhas guias explicadas de forma visual.',
    'Carrossel: equipamento essencial para comecar — o que voce realmente precisa vs o que e so marketing.',
    'Post: como eu crio consistencia visual no meu feed — tom de cor, luz, enquadramento e o que estou comunicando.',
    'Reels: depoimento de cliente — o impacto das fotos no negocio ou no momento especial deles.',
    'Carrossel: fotografia no celular — tecnicas que qualquer pessoa pode usar para melhorar muito as fotos.',
    'Post: o que e RAW vs JPEG — quando vale a pena fotografar em RAW e por que os arquivos sao maiores.',
  ],
  'Design': [
    'Carrossel: antes e depois de uma identidade visual — o processo, as decisoes e o resultado.',
    'Reels: o que e (e o que nao e) branding — desmistifique para quem confunde com logo.',
    'Post: psicologia das cores — o que cada cor comunica e como usar isso estrategicamente na identidade visual.',
    'Carrossel: os erros de design mais comuns em logos de pequenos negocios — e como evitar.',
    'Reels: processo de criacao de um logo — speedart ou timelapse mostrando cada etapa.',
    'Post: por que um logo feito no Canva gratis pode custar caro a longo prazo — argumento de valor educativo.',
    'Carrossel: tipografia — como escolher fontes que combinam e o que evitar em uma identidade visual.',
    'Reels: diferenca entre identidade visual e manual de marca — o que cada entrega inclui.',
    'Post: como avaliar se a sua identidade visual esta alinhada com o seu posicionamento e publico-alvo.',
    'Carrossel: paleta de cores na pratica — como escolher 3 a 5 cores que funcionam juntas.',
    'Reels: bastidores de uma reuniao de briefing com cliente — o que voce pergunta e como isso guia o projeto.',
    'Post: o que e grid e hierarquia visual — conceitos basicos que qualquer empreendedor deveria entender.',
    'Carrossel: case de redesign — marca antiga vs nova, por que mudou e o impacto na percepcao do negocio.',
    'Reels: como escolher o arquivo certo para usar o logo — PNG, SVG, PDF. O que cada um e.',
    'Post: depoimento de cliente — o que mudou na percepcao da marca depois de ter uma identidade visual profissional.',
  ],
  'RH e Gestao de Pessoas': [
    'Carrossel: como fazer um processo seletivo eficiente para uma empresa pequena — passo a passo.',
    'Reels: os 3 erros mais comuns no onboarding de funcionarios novos — e por que eles custam caro.',
    'Post: o que e cultura organizacional de verdade — alem do "somos uma familia" e o "missao e visao na parede".',
    'Carrossel: como dar feedback que nao gera defensividade — a tecnica SBI explicada com exemplos.',
    'Post: sinais de burnout na sua equipe que um gestor precisa aprender a identificar antes que seja tarde.',
    'Reels: diferenca entre chefe e lider — o que muda no comportamento no dia a dia.',
    'Carrossel: como reter talentos sem depender so de salario — beneficios, autonomia, reconhecimento e crescimento.',
    'Post: o que e lideranca situacional e como adaptar seu estilo de gestao para cada colaborador.',
    'Reels: "Como demitir alguem da forma mais humanizada possivel?" — um tema dificil que todo gestor enfrenta.',
    'Carrossel: tendencias em gestao de pessoas para 2026 — trabalho hibrido, saude mental, DEI e lideranca servidora.',
    'Post: por que funcionario feliz nao e besteira — o impacto real da satisfacao no trabalho em produtividade.',
    'Carrossel: como estruturar um plano de carreira simples para reter talentos em empresas de pequeno porte.',
    'Reels: o que e (e o que nao e) assedio moral — exemplos reais que gestores devem conhecer.',
    'Post: entrevista por competencias — como fazer perguntas que revelam mais do que o curriculo.',
    'Carrossel: PDI (plano de desenvolvimento individual) — o que e e como criar um simples com cada colaborador.',
  ],
};

const IDEIAS_GENERICAS = [
  'Reels: bastidores do seu dia de trabalho — o que acontece por tras do resultado que o cliente ve.',
  'Carrossel: as 3 duvidas mais frequentes que seus clientes chegam com — e a resposta completa para cada uma.',
  'Post: o aprendizado mais importante que voce teve na sua area nos ultimos meses — posicione-se como especialista.',
  'Carrossel: o que considerar antes de contratar alguem da sua area — educa o cliente ideal e filtra os que nao sao.',
  'Reels: mostre um resultado real (com autorizacao) do seu trabalho — antes, processo e depois.',
  'Post: uma verdade inconveniente sobre a sua area que voce precisou aprender na pratica.',
  'Carrossel: o que voce faz diferente dos outros profissionais da sua area — seu diferencial explicado com exemplos.',
  'Reels: responda ao vivo a pergunta mais comum que voce recebe — rapido, direto e educativo.',
  'Post: por que voce escolheu essa profissao — historia pessoal gera conexao e humaniza sua marca.',
  'Carrossel: os sinais de que alguem precisa do seu servico agora — ajuda o cliente a se identificar.',
];

const ALIASES_NICHO = {
  'Terapeuta': 'Psicologia',
  'Psicologa': 'Psicologia',
  'Psi': 'Psicologia',
  'Saude Mental': 'Psicologia',
  'Personal': 'Educacao Fisica',
  'Personal Trainer': 'Educacao Fisica',
  'Academia': 'Educacao Fisica',
  'Dentista': 'Odontologia',
  'Medica': 'Medicina',
  'Medico': 'Medicina',
  'Clinica': 'Medicina',
  'Advogada': 'Advocacia',
  'Advogado': 'Advocacia',
  'Direito': 'Advocacia',
  'Nutricionista': 'Nutricao',
  'Dieta': 'Nutricao',
  'Fisio': 'Fisioterapia',
  'Arquiteta': 'Arquitetura',
  'Arquiteto': 'Arquitetura',
  'Decoracao': 'Arquitetura',
  'Interior': 'Arquitetura',
  'Contador': 'Contabilidade',
  'Contadora': 'Contabilidade',
  'Fiscal': 'Contabilidade',
  'Tributario': 'Contabilidade',
  'Corretor': 'Imoveis',
  'Imobiliaria': 'Imoveis',
  'Imovel': 'Imoveis',
  'Venda': 'Imoveis',
  'Cabelelereira': 'Beleza e Estetica',
  'Esteticista': 'Beleza e Estetica',
  'Estetica': 'Beleza e Estetica',
  'Cabelo': 'Beleza e Estetica',
  'Maquiagem': 'Beleza e Estetica',
  'Skin': 'Beleza e Estetica',
  'Skincare': 'Beleza e Estetica',
  'Vet': 'Veterinaria',
  'Pet': 'Veterinaria',
  'Animal': 'Veterinaria',
  'Coach': 'Coaching',
  'Mentora': 'Coaching',
  'Mentor': 'Coaching',
  'Gastronomia': 'Gastronomia',
  'Chef': 'Gastronomia',
  'Restaurante': 'Gastronomia',
  'Confeitaria': 'Gastronomia',
  'Buffet': 'Gastronomia',
  'Fotografa': 'Fotografia',
  'Fotografo': 'Fotografia',
  'Photo': 'Fotografia',
  'Social Media': 'Marketing Digital',
  'Gestao de Redes': 'Marketing Digital',
  'Trafego': 'Marketing Digital',
  'Digital': 'Marketing Digital',
  'Marca': 'Design',
  'Identidade Visual': 'Design',
  'Grafico': 'Design',
  'Branding': 'Design',
  'Financeiro': 'Financas Pessoais',
  'Investimento': 'Financas Pessoais',
  'RH': 'RH e Gestao de Pessoas',
  'Gestao': 'RH e Gestao de Pessoas',
  'Recursos Humanos': 'RH e Gestao de Pessoas',
};

function getIdeias(area) {
  if (!area) return IDEIAS_GENERICAS;
  const areaLower = area.toLowerCase();
  // Tenta match direto nas chaves
  const chave = Object.keys(IDEIAS_BASE).find(k =>
    areaLower.includes(k.toLowerCase()) || k.toLowerCase().includes(areaLower)
  );
  if (chave) return IDEIAS_BASE[chave];
  // Tenta aliases
  const aliasChave = Object.keys(ALIASES_NICHO).find(a =>
    areaLower.includes(a.toLowerCase()) || a.toLowerCase().includes(areaLower)
  );
  if (aliasChave) return IDEIAS_BASE[ALIASES_NICHO[aliasChave]];
  return IDEIAS_GENERICAS;
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
