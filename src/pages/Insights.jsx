import { useState } from 'react';
import { getOrDefault, set } from '../store';
import {
  Lightbulb, Plus, Trash2, Check, X, Edit2, FolderKanban,
  ChevronDown, ChevronUp, Link, DollarSign, ListChecks,
  StickyNote, ExternalLink, Package, Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CATEGORIAS = ['Estrategia', 'Conteudo', 'Cliente', 'Negocio', 'Pessoal', 'Outro'];
const PROJETO_STATUS = ['Ideia', 'Planejando', 'Em andamento', 'Concluido', 'Pausado'];

const TIPOS_PROJETO = [
  { id: 'kit_data',       label: 'Kit de Data',        emoji: '🎉', desc: 'Natal, Ano Novo, Dia das Maes, Pascoa...' },
  { id: 'kit_aniversario',label: 'Kit Aniversario',    emoji: '🎂', desc: 'Arte especial para o aniversario do cliente' },
  { id: 'ebook',          label: 'Ebook',              emoji: '📖', desc: 'Material rico em PDF para gerar leads' },
  { id: 'infoproduto',    label: 'Infoproduto',        emoji: '💡', desc: 'Produto digital: curso, template, planilha' },
  { id: 'campanha',       label: 'Campanha',           emoji: '📣', desc: 'Campanha especial de promocao ou tema' },
  { id: 'lancamento',     label: 'Lancamento',         emoji: '🚀', desc: 'Lancamento de servico, produto ou marca' },
  { id: 'trafego',        label: 'Gestao de Trafego',  emoji: '🎯', desc: 'Anuncios pagos e impulsionamento' },
  { id: 'identidade',     label: 'Identidade Visual',  emoji: '🎨', desc: 'Logo, cores, manual de marca' },
  { id: 'outro',          label: 'Outro',              emoji: '📁', desc: 'Projeto personalizado' },
];

const TEMPLATES_CHECKLIST = {
  kit_data: [
    'Fazer briefing com o cliente (tema, data, cores, quantidade de pecas)',
    'Definir quais pecas entram no kit (post feed, stories, reels)',
    'Escrever copys e legendas de cada peca',
    'Enviar briefing para o designer',
    'Revisar as artes recebidas do designer',
    'Enviar para aprovacao do cliente',
    'Fazer ajustes solicitados',
    'Agendar as publicacoes',
  ],
  kit_aniversario: [
    'Confirmar data do aniversario do cliente',
    'Definir conceito e tema visual',
    'Listar as pecas do kit (post, story, reels, destaque)',
    'Escrever copy personalizada com o nome e mensagem',
    'Passar briefing para o designer',
    'Revisar as artes',
    'Aprovacao do cliente',
    'Publicar ou agendar',
  ],
  ebook: [
    'Definir tema e titulo do ebook com o cliente',
    'Validar a ideia (faz sentido para o publico?)',
    'Criar estrutura dos capitulos e topicos',
    'Escrever o conteudo',
    'Revisar o texto',
    'Definir o design da capa',
    'Briefar designer (capa + layout das paginas)',
    'Revisar o layout final',
    'Aprovacao do cliente',
    'Definir onde sera distribuido (bio, stories, landing page)',
    'Criar posts de divulgacao',
  ],
  infoproduto: [
    'Validar a ideia com a audiencia (enquete nos stories)',
    'Definir formato (ebook, mini-curso, template, planilha)',
    'Definir tema, conteudo e estrutura',
    'Criar o produto',
    'Design visual (capa, paginas, apresentacao)',
    'Definir preco e forma de venda (Hotmart, Gumroad, Kiwify)',
    'Criar pagina de vendas ou link de compra',
    'Criar conteudo de aquecimento (feed + stories)',
    'Definir data de lancamento',
    'Lancamento: posts, stories, live ou reels',
    'Pos-lancamento: coletar depoimentos e resultados',
  ],
  campanha: [
    'Definir objetivo da campanha (vendas, leads, awareness)',
    'Definir publico-alvo',
    'Criar copies e CTAs',
    'Criar artes visuais (feed, stories, reels)',
    'Montar cronograma de publicacao',
    'Publicar e acompanhar metricas',
    'Relatorio de resultados',
  ],
  lancamento: [
    'Definir data oficial de lancamento',
    'Criar estrategia de pre-lancamento (7 a 14 dias antes)',
    'Criar conteudo de aquecimento e teasers',
    'Preparar stories de contagem regressiva',
    'Criar posts do dia do lancamento',
    'Reels ou live de apresentacao',
    'Pos-lancamento: resultado, depoimentos, stories de prova social',
  ],
  trafego: [
    'Definir objetivo (leads, vendas, seguidores, alcance)',
    'Definir publico-alvo e segmentacao',
    'Criar criativos (imagens e videos para anuncio)',
    'Escrever copy dos anuncios',
    'Configurar campanha no Gerenciador de Anuncios',
    'Monitorar metricas (CPC, CTR, CPL)',
    'Otimizar criativos e publico com base nos dados',
    'Relatorio de resultados',
  ],
  identidade: [
    'Fazer briefing completo com o cliente',
    'Pesquisar referencias visuais',
    'Definir paleta de cores e fontes',
    'Desenvolver opcoes de logo',
    'Apresentar proposta ao cliente',
    'Fazer ajustes e aprovacao do logo',
    'Criar variacoes do logo (horizontal, icone, versao branca)',
    'Criar aplicacoes (stories, feed, destaques, capa de ebook)',
    'Montar manual de marca',
    'Entrega final',
  ],
  outro: [],
};

const CAMPOS_TIPO = {
  kit_data: [
    { key: 'tema', label: 'Tema / data comemorativa', placeholder: 'Ex: Natal, Fim de Ano, Pascoa, Dia das Maes...' },
    { key: 'quantidade', label: 'Para quantas pessoas / kits', placeholder: 'Ex: 15 kits, 3 clientes distintos...' },
    { key: 'conteudo_caixa', label: 'O que vai dentro da caixa', placeholder: 'Ex: Bloco de notas personalizado, caneca, card de agradecimento...', multi: true },
    { key: 'mensagem_carta', label: 'Texto da carta / mensagem', placeholder: 'Escreva aqui o texto que vai na carta ou tag...', multi: true },
    { key: 'valor_caixa', label: 'Valor da caixa / embalagem (R$)', placeholder: 'Ex: R$ 12,00 cada' },
    { key: 'valor_adesivo', label: 'Valor do adesivo / tag (R$)', placeholder: 'Ex: R$ 3,50 cada' },
    { key: 'artes', label: 'Artes necessarias', placeholder: 'Ex: Design do adesivo, post feed anuncio, story unboxing, reels surpresa...', multi: true },
  ],
  kit_aniversario: [
    { key: 'data_aniversario', label: 'Data do aniversario', placeholder: 'Ex: 12/03' },
    { key: 'nome', label: 'Nome / empresa aniversariante', placeholder: 'Ex: Dra. Ana Lima' },
    { key: 'mensagem', label: 'Mensagem personalizada', placeholder: 'Ex: "Parabens, Dra. Ana! Que sua jornada continue transformando vidas."', multi: true },
    { key: 'pecas', label: 'Pecas do kit', placeholder: 'Ex: Post feed, story interativo, reels comemorativo, destaque especial...' },
    { key: 'tema_visual', label: 'Tema visual / referencias', placeholder: 'Ex: Dourado e branco, minimalista, flores...' },
  ],
  ebook: [
    { key: 'titulo_ebook', label: 'Titulo do ebook', placeholder: 'Ex: "Guia Completo de Nutricao Esportiva"' },
    { key: 'estrutura', label: 'Capitulos / estrutura', placeholder: 'Ex: Intro, Cap 1: Macros, Cap 2: Pre-treino, Cap 3: Recuperacao...', multi: true },
    { key: 'paginas', label: 'Numero de paginas previsto', placeholder: 'Ex: 20 paginas' },
    { key: 'distribuicao', label: 'Onde sera distribuido', placeholder: 'Ex: Link na bio, stories, landing page Hotmart...' },
    { key: 'preco', label: 'Preco (se pago)', placeholder: 'Ex: R$ 47,00 / gratuito para captacao de leads' },
  ],
  infoproduto: [
    { key: 'formato', label: 'Formato do produto', placeholder: 'Ex: Mini-curso gravado, template Notion, planilha, mentoria...' },
    { key: 'resultado', label: 'Resultado prometido / proposta', placeholder: 'Ex: "Em 30 dias voce vai organizar sua rotina financeira"', multi: true },
    { key: 'plataforma', label: 'Plataforma de venda', placeholder: 'Ex: Hotmart, Kiwify, Gumroad, Monetizze...' },
    { key: 'preco', label: 'Preco de venda', placeholder: 'Ex: R$ 97,00' },
    { key: 'data_lancamento', label: 'Data de lancamento', placeholder: 'Ex: 15/03/2025' },
    { key: 'aquecimento', label: 'Estrategia de aquecimento', placeholder: 'Ex: 7 dias de stories, enquete, lista VIP no WhatsApp...', multi: true },
  ],
  campanha: [
    { key: 'tema', label: 'Tema da campanha', placeholder: 'Ex: Black Friday, Dia Internacional da Mulher, Volta as Aulas...' },
    { key: 'objetivo', label: 'Objetivo', placeholder: 'Ex: Vendas de pacote mensal, captacao de leads, awareness...' },
    { key: 'periodo', label: 'Periodo da campanha', placeholder: 'Ex: 20/11 a 30/11' },
    { key: 'cta', label: 'CTA principal', placeholder: 'Ex: "Garanta sua vaga", "Fale comigo no WhatsApp", "Link na bio"' },
    { key: 'pecas', label: 'Pecas planejadas', placeholder: 'Ex: 3 posts feed, 5 stories, 1 reels, 1 sequencia de stories de venda...', multi: true },
  ],
  lancamento: [
    { key: 'produto', label: 'Produto / servico lancado', placeholder: 'Ex: Pacote de Gestao de Trafego, Mentoria Mensal, Ebook...' },
    { key: 'data_lancamento', label: 'Data oficial de lancamento', placeholder: 'Ex: 01/04/2025' },
    { key: 'preco', label: 'Preco de lancamento', placeholder: 'Ex: R$ 297,00 / R$ 97,00 para lista VIP' },
    { key: 'meta', label: 'Meta de vendas / leads', placeholder: 'Ex: 10 clientes, 100 leads...' },
    { key: 'pre_lancamento', label: 'Estrategia de pre-lancamento', placeholder: 'Ex: 14 dias de conteudo de aquecimento, lista VIP, teasers no stories...', multi: true },
  ],
  trafego: [
    { key: 'objetivo', label: 'Objetivo da campanha', placeholder: 'Ex: Gerar leads, vendas diretas, crescer seguidores...' },
    { key: 'plataforma', label: 'Plataforma', placeholder: 'Ex: Meta Ads (Instagram + Facebook), Google Ads...' },
    { key: 'orcamento_ads', label: 'Orcamento de anuncios (R$)', placeholder: 'Ex: R$ 500/mes ou R$ 50/dia' },
    { key: 'publico', label: 'Publico-alvo', placeholder: 'Ex: Mulheres 25-45, RS, interesse em saude e bem-estar...' },
    { key: 'meta_resultado', label: 'Meta de resultado', placeholder: 'Ex: CPA maximo R$ 30, 50 leads/mes, ROAS minimo 3x...' },
    { key: 'criativos', label: 'Criativos planejados', placeholder: 'Ex: 2 videos 15s, 3 imagens estaticas, copy teste A/B...', multi: true },
  ],
  identidade: [
    { key: 'elementos', label: 'Elementos a criar', placeholder: 'Ex: Logo + variacoes, paleta de cores, tipografia, templates stories, capa destaque...', multi: true },
    { key: 'referencias', label: 'Referencias visuais do cliente', placeholder: 'Ex: Link Pinterest, perfis que admira, palavras: moderno, feminino, minimalista...' },
    { key: 'cores', label: 'Cores / estilo solicitado', placeholder: 'Ex: Dourado, branco e preto. Elegante e profissional.' },
    { key: 'fontes', label: 'Fontes solicitadas', placeholder: 'Ex: Serif para titulo, sans-serif para corpo.' },
    { key: 'aplicacoes', label: 'Onde sera aplicada', placeholder: 'Ex: Instagram, site, cartao de visita, materiais impressos...' },
  ],
};

const ENTREGAVEIS_SUGERIDOS = {
  kit_data:        ['Posts para feed', 'Stories', 'Reels', 'Legenda pronta'],
  kit_aniversario: ['Post de aniversario', 'Story personalizado', 'Destaque especial'],
  ebook:           ['Capa do ebook', 'Layout das paginas', 'Posts de divulgacao', 'Story de divulgacao'],
  infoproduto:     ['O produto em si', 'Pagina de vendas', 'Posts de lancamento', 'Stories de aquecimento'],
  campanha:        ['Posts do feed', 'Stories', 'Reels da campanha', 'Legenda + CTA'],
  lancamento:      ['Teasers de pre-lancamento', 'Posts do lancamento', 'Stories de contagem', 'Reels de apresentacao'],
  trafego:         ['Criativos estaticos', 'Criativos em video', 'Copy dos anuncios', 'Relatorio de resultados'],
  identidade:      ['Logo + variacoes', 'Paleta de cores e fontes', 'Templates de stories', 'Manual de marca'],
  outro:           [],
};

const statusCor = {
  'Ideia': 'bg-gray-100 text-gray-600',
  'Planejando': 'bg-blue-50 text-blue-700',
  'Em andamento': 'bg-yellow-50 text-yellow-700',
  'Concluido': 'bg-green-50 text-green-700',
  'Pausado': 'bg-red-50 text-red-500',
};

export default function Insights() {
  const [aba, setAba] = useState('insights');

  // --- INSIGHTS ---
  const [insights, setInsights] = useState(() => getOrDefault('insights', []));
  const clientes = getOrDefault('clientes', []);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ titulo: '', texto: '', categoria: 'Estrategia', cliente_id: '' });
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('todos');
  const [clienteFiltro, setClienteFiltro] = useState('');

  const salvar = (lista) => { setInsights(lista); set('insights', lista); };

  const submit = () => {
    if (!form.titulo || !form.texto) return;
    if (editId) {
      salvar(insights.map(i => i.id === editId ? { ...form, id: editId, data: i.data } : i));
      setEditId(null);
    } else {
      salvar([...insights, { ...form, id: Date.now(), data: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }) }]);
    }
    setForm({ titulo: '', texto: '', categoria: 'Estrategia', cliente_id: '' });
    setShowForm(false);
  };

  const editar = (item) => {
    setForm({ titulo: item.titulo, texto: item.texto, categoria: item.categoria, cliente_id: item.cliente_id || '' });
    setEditId(item.id);
    setShowForm(true);
  };

  const remover = (id) => salvar(insights.filter(i => i.id !== id));

  const nomeCliente = (id) => {
    if (!id) return null;
    const c = clientes.find(c => String(c.id) === String(id));
    return c ? c.nome : null;
  };

  const filtrados = insights.filter(i => {
    const matchBusca = i.titulo.toLowerCase().includes(busca.toLowerCase()) || i.texto.toLowerCase().includes(busca.toLowerCase());
    const matchCat = catFiltro === 'todos' || i.categoria === catFiltro;
    const matchCliente = !clienteFiltro || String(i.cliente_id) === String(clienteFiltro);
    return matchBusca && matchCat && matchCliente;
  });

  // --- PROJETOS ---
  const [projetos, setProjetos] = useState(() => getOrDefault('projetos', []));
  const [showFormProj, setShowFormProj] = useState(false);
  const [editProjId, setEditProjId] = useState(null);
  const FORM_VAZIO = { titulo: '', tipo: '', descricao: '', status: 'Ideia', prazo: '', cliente_id: '' };
  const [formProj, setFormProj] = useState(FORM_VAZIO);
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [detalhesAbertos, setDetalhesAbertos] = useState({});
  const [editandoCampo, setEditandoCampo] = useState({});
  const [novaEntrada, setNovaEntrada] = useState({});

  const salvarProjetos = (lista) => { setProjetos(lista); set('projetos', lista); };

  const submitProj = () => {
    if (!formProj.titulo) return;
    const isNovo = !editProjId;
    const base = isNovo ? {
      tasks: TEMPLATES_CHECKLIST[formProj.tipo] ? TEMPLATES_CHECKLIST[formProj.tipo].map(t => ({ id: Date.now() + Math.random(), texto: t, feito: false })) : [],
      entregaveis: ENTREGAVEIS_SUGERIDOS[formProj.tipo] ? ENTREGAVEIS_SUGERIDOS[formProj.tipo].map(e => ({ id: Date.now() + Math.random(), texto: e, feito: false })) : [],
    } : {};
    const item = {
      ...base,
      ...(editProjId ? projetos.find(p => p.id === editProjId) : {}),
      ...formProj,
      id: editProjId || Date.now(),
      criado: editProjId ? (projetos.find(p => p.id === editProjId)?.criado || new Date().toISOString()) : new Date().toISOString(),
    };
    if (editProjId) {
      salvarProjetos(projetos.map(p => p.id === editProjId ? item : p));
      setEditProjId(null);
    } else {
      salvarProjetos([...projetos, item]);
    }
    setFormProj(FORM_VAZIO);
    setShowFormProj(false);
  };

  const toggleDetalhes = (id) => setDetalhesAbertos(d => ({ ...d, [id]: !d[id] }));

  const salvarCampo = (projId, campo, valor) => {
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, [campo]: valor } : p));
    setEditandoCampo(e => { const x = { ...e }; delete x[`${projId}_${campo}`]; return x; });
  };

  const setCampo = (projId, campo, valor) =>
    setEditandoCampo(e => ({ ...e, [`${projId}_${campo}`]: valor }));

  const addEntregavel = (projId) => {
    const texto = (novaEntrada[`e_${projId}`] || '').trim();
    if (!texto) return;
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, entregaveis: [...(p.entregaveis || []), { id: Date.now(), texto, feito: false }] } : p));
    setNovaEntrada(n => ({ ...n, [`e_${projId}`]: '' }));
  };

  const toggleEntregavel = (projId, eId) =>
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, entregaveis: (p.entregaveis || []).map(e => e.id === eId ? { ...e, feito: !e.feito } : e) } : p));

  const removerEntregavel = (projId, eId) =>
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, entregaveis: (p.entregaveis || []).filter(e => e.id !== eId) } : p));

  const addTask = (projId) => {
    const texto = (novaEntrada[`t_${projId}`] || '').trim();
    if (!texto) return;
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, tasks: [...(p.tasks || []), { id: Date.now(), texto, feito: false }] } : p));
    setNovaEntrada(n => ({ ...n, [`t_${projId}`]: '' }));
  };

  const toggleTask = (projId, tId) =>
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, tasks: (p.tasks || []).map(t => t.id === tId ? { ...t, feito: !t.feito } : t) } : p));

  const removerTask = (projId, tId) =>
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, tasks: (p.tasks || []).filter(t => t.id !== tId) } : p));

  const getDetalhe = (p, key) =>
    editandoCampo[`${p.id}_dt_${key}`] !== undefined
      ? editandoCampo[`${p.id}_dt_${key}`]
      : ((p.detalhes_tipo || {})[key] || '');

  const setDetalhe = (projId, key, val) =>
    setEditandoCampo(e => ({ ...e, [`${projId}_dt_${key}`]: val }));

  const salvarDetalhe = (projId, key, val) => {
    salvarProjetos(projetos.map(p => p.id === projId
      ? { ...p, detalhes_tipo: { ...(p.detalhes_tipo || {}), [key]: val } }
      : p));
    setEditandoCampo(e => { const x = { ...e }; delete x[`${projId}_dt_${key}`]; return x; });
  };

  const addLink = (projId) => {
    const url = (novaEntrada[`l_${projId}`] || '').trim();
    if (!url) return;
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, links: [...(p.links || []), { id: Date.now(), url }] } : p));
    setNovaEntrada(n => ({ ...n, [`l_${projId}`]: '' }));
  };

  const removerLink = (projId, lId) =>
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, links: (p.links || []).filter(l => l.id !== lId) } : p));

  const projetosFiltrados = projetos.filter(p => statusFiltro === 'todos' || p.status === statusFiltro);
  const tipoInfo = (id) => TIPOS_PROJETO.find(t => t.id === id);

  return (
    <div>
      <h1 className="page-title">Insights & Projetos</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setAba('insights')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${aba === 'insights' ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
          <Lightbulb size={14} /> Insights
        </button>
        <button onClick={() => setAba('projetos')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${aba === 'projetos' ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
          <FolderKanban size={14} /> Projetos
        </button>
      </div>

      {/* ===== INSIGHTS ===== */}
      {aba === 'insights' && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap">
            <input className="input flex-1 min-w-48" placeholder="Buscar insight..." value={busca} onChange={e => setBusca(e.target.value)} />
            {clientes.length > 0 && (
              <select className="input w-auto text-xs" value={clienteFiltro} onChange={e => setClienteFiltro(e.target.value)}>
                <option value="">Todos os clientes</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            )}
            <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm({ titulo: '', texto: '', categoria: 'Estrategia', cliente_id: '' }); }}>
              <Plus size={16} /> Novo insight
            </button>
          </div>

          <div className="flex gap-2 mb-5 flex-wrap">
            {['todos', ...CATEGORIAS].map(c => (
              <button key={c} onClick={() => setCatFiltro(c)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${catFiltro === c ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
                {c}
              </button>
            ))}
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
              <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar insight' : 'Novo insight'}</h4>
              <div className="space-y-3">
                <div>
                  <label className="label">Titulo</label>
                  <input className="input" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Melhor horario para postar no Instagram" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Categoria</label>
                    <select className="input" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                      {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Cliente (opcional)</label>
                    <select className="input" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                      <option value="">— Nenhum —</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Insight</label>
                  <textarea className="input" rows={4} value={form.texto} onChange={e => setForm({...form, texto: e.target.value})} placeholder="Escreva seu insight, aprendizado ou ideia..." />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={submit}><Check size={16} className="inline mr-1" /> Salvar</button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
              </div>
            </div>
          )}

          {filtrados.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
              <Lightbulb size={36} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum insight registrado ainda</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 gap-4 space-y-4">
              {filtrados.map(item => (
                <div key={item.id} className={`bg-white rounded-2xl p-5 border shadow-sm break-inside-avoid mb-4 ${item.origem === 'banco_ideias' ? 'border-green-200' : 'border-[#d2b99b]/30'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#486c96] text-sm leading-snug">{item.titulo}</h3>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => editar(item)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={13} /></button>
                      <button onClick={() => remover(item.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-[#f9f1e7] text-[#486c96] font-semibold">{item.categoria}</span>
                    {nomeCliente(item.cliente_id) && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-semibold">{nomeCliente(item.cliente_id)}</span>
                    )}
                    {item.origem === 'banco_ideias' && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-green-50 text-green-700 font-semibold">Banco de Ideias</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.texto}</p>
                  {item.data && <p className="text-[10px] text-gray-400 mt-3">{item.data}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== PROJETOS ===== */}
      {aba === 'projetos' && (
        <>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {['todos', ...PROJETO_STATUS].map(s => (
                <button key={s} onClick={() => setStatusFiltro(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${statusFiltro === s ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
                  {s}
                </button>
              ))}
            </div>
            <button className="btn-primary flex items-center gap-2 flex-shrink-0" onClick={() => { setShowFormProj(true); setEditProjId(null); setFormProj(FORM_VAZIO); }}>
              <Plus size={16} /> Novo projeto
            </button>
          </div>

          {/* Formulario de criacao */}
          {showFormProj && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
              <h4 className="font-semibold text-[#486c96] mb-4">{editProjId ? 'Editar projeto' : 'Novo projeto'}</h4>
              <div className="space-y-4">

                {/* Tipo de projeto */}
                <div>
                  <label className="label">Tipo de projeto</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TIPOS_PROJETO.map(t => (
                      <button key={t.id} type="button" onClick={() => setFormProj(f => ({ ...f, tipo: t.id }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${formProj.tipo === t.id ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-gray-700 border-[#d2b99b]/40 hover:border-[#486c96]'}`}>
                        <span className="text-base">{t.emoji}</span>
                        <div>
                          <div className="text-xs font-semibold leading-tight">{t.label}</div>
                          <div className={`text-[10px] leading-tight ${formProj.tipo === t.id ? 'text-white/70' : 'text-gray-400'}`}>{t.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {formProj.tipo && TEMPLATES_CHECKLIST[formProj.tipo]?.length > 0 && (
                    <div className="mt-2 px-3 py-2 bg-[#f9f1e7] rounded-xl text-xs text-[#486c96]">
                      <span className="font-semibold">Checklist automatico:</span> {TEMPLATES_CHECKLIST[formProj.tipo].length} etapas serao carregadas para este tipo de projeto.
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Nome do projeto</label>
                  <input className="input" value={formProj.titulo} onChange={e => setFormProj({...formProj, titulo: e.target.value})}
                    placeholder="Ex: Kit Final do Ano — Dra. Ana, Ebook Nutricao Esportiva, Lancamento de Curso..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={formProj.status} onChange={e => setFormProj({...formProj, status: e.target.value})}>
                      {PROJETO_STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Prazo</label>
                    <input className="input" type="date" value={formProj.prazo} onChange={e => setFormProj({...formProj, prazo: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="label">Cliente relacionado (opcional)</label>
                  <select className="input" value={formProj.cliente_id} onChange={e => setFormProj({...formProj, cliente_id: e.target.value})}>
                    <option value="">— Todos / Geral —</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Descricao rapida (opcional)</label>
                  <textarea className="input" rows={2} value={formProj.descricao} onChange={e => setFormProj({...formProj, descricao: e.target.value})}
                    placeholder="Uma frase descrevendo o projeto..." />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={submitProj}><Check size={16} className="inline mr-1" /> {editProjId ? 'Salvar' : 'Criar projeto'}</button>
                <button className="btn-secondary" onClick={() => setShowFormProj(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
              </div>
            </div>
          )}

          {projetosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
              <FolderKanban size={36} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-600 font-semibold mb-1">Nenhum projeto ainda</p>
              <p className="text-gray-400 text-sm">Crie projetos: kit de final de ano, ebook, infoproduto, lancamento...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projetosFiltrados.map(p => {
                const tipo = tipoInfo(p.tipo);
                const tasksTotal = (p.tasks || []).length;
                const taskFeitas = (p.tasks || []).filter(t => t.feito).length;
                const progresso = tasksTotal > 0 ? Math.round((taskFeitas / tasksTotal) * 100) : 0;
                const aberto = detalhesAbertos[p.id];

                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm overflow-hidden">
                    {/* Cabecalho */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {tipo && <span className="text-base">{tipo.emoji}</span>}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCor[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                            {tipo && <span className="text-[10px] text-gray-400 font-medium">{tipo.label}</span>}
                            {p.cliente_id && nomeCliente(p.cliente_id) && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-semibold">{nomeCliente(p.cliente_id)}</span>
                            )}
                            {p.prazo && <span className="text-[10px] text-gray-400">ate {new Date(p.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                          </div>
                          <h3 className="font-bold text-[#486c96] leading-snug">{p.titulo}</h3>
                          {p.descricao && <p className="text-xs text-gray-500 mt-0.5">{p.descricao}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setFormProj({ titulo: p.titulo, tipo: p.tipo || '', descricao: p.descricao || '', status: p.status, prazo: p.prazo || '', cliente_id: p.cliente_id || '' }); setEditProjId(p.id); setShowFormProj(true); }} className="text-[#486c96]"><Edit2 size={13} /></button>
                          <button onClick={() => salvarProjetos(projetos.filter(x => x.id !== p.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                        </div>
                      </div>

                      {/* Barra de progresso */}
                      {tasksTotal > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Progresso das etapas</span>
                            <span>{taskFeitas}/{tasksTotal} — {progresso}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#486c96] rounded-full transition-all" style={{ width: `${progresso}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Status rapido + botao detalhes */}
                      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                        <div className="flex gap-1.5 flex-wrap">
                          {PROJETO_STATUS.filter(s => s !== p.status).map(s => (
                            <button key={s} onClick={() => salvarProjetos(projetos.map(x => x.id === p.id ? {...x, status: s} : x))}
                              className="text-[10px] text-gray-400 hover:text-[#486c96] px-2 py-0.5 rounded-lg border border-gray-200 hover:border-[#486c96] transition-colors">
                              {s}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => toggleDetalhes(p.id)}
                          className="flex items-center gap-1 text-xs text-[#486c96] font-semibold px-2 py-1 rounded-lg hover:bg-[#f9f1e7] transition-colors flex-shrink-0">
                          {aberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {aberto ? 'Fechar' : 'Planejar projeto'}
                        </button>
                      </div>
                    </div>

                    {/* Painel de planejamento */}
                    {aberto && (
                      <div className="border-t border-[#d2b99b]/20 divide-y divide-[#d2b99b]/10">

                        {/* CAMPOS ESPECIFICOS DO TIPO */}
                        {CAMPOS_TIPO[p.tipo] && (
                          <div className="px-5 py-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-base">{tipo?.emoji}</span>
                              <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide">Detalhes do projeto</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {CAMPOS_TIPO[p.tipo].map(campo => (
                                <div key={campo.key} className={campo.multi ? 'sm:col-span-2' : ''}>
                                  <label className="label">{campo.label}</label>
                                  {campo.multi ? (
                                    <textarea
                                      className="w-full text-sm text-gray-700 border border-[#d2b99b]/30 rounded-xl p-3 resize-none focus:outline-none focus:border-[#486c96] bg-[#f9f1e7]/30"
                                      rows={3}
                                      placeholder={campo.placeholder}
                                      value={getDetalhe(p, campo.key)}
                                      onChange={e => setDetalhe(p.id, campo.key, e.target.value)}
                                      onBlur={e => salvarDetalhe(p.id, campo.key, e.target.value)}
                                    />
                                  ) : (
                                    <input
                                      className="input"
                                      placeholder={campo.placeholder}
                                      value={getDetalhe(p, campo.key)}
                                      onChange={e => setDetalhe(p.id, campo.key, e.target.value)}
                                      onBlur={e => salvarDetalhe(p.id, campo.key, e.target.value)}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Salva automaticamente ao clicar fora ✓</p>
                          </div>
                        )}

                        {/* ENTREGAVEIS */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Package size={14} className="text-[#486c96]" />
                            <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide">Entregaveis</span>
                            <span className="text-[10px] text-gray-400">— o que vai ser entregue neste projeto</span>
                          </div>
                          <div className="space-y-1.5 mb-2">
                            {(p.entregaveis || []).map(e => (
                              <div key={e.id} className="flex items-center gap-2">
                                <button onClick={() => toggleEntregavel(p.id, e.id)}
                                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${e.feito ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b]'}`}>
                                  {e.feito && <Check size={11} className="text-white" />}
                                </button>
                                <span className={`text-sm flex-1 ${e.feito ? 'line-through text-gray-400' : 'text-gray-700'}`}>{e.texto}</span>
                                <button onClick={() => removerEntregavel(p.id, e.id)} className="text-gray-200 hover:text-red-400"><X size={12} /></button>
                              </div>
                            ))}
                            {(p.entregaveis || []).length === 0 && (
                              <p className="text-xs text-gray-400 italic">Nenhum entregavel ainda</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input className="input flex-1 text-sm py-1.5"
                              placeholder="Ex: 10 posts para feed, 5 stories, capa do ebook..."
                              value={novaEntrada[`e_${p.id}`] || ''}
                              onChange={e => setNovaEntrada(n => ({ ...n, [`e_${p.id}`]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && addEntregavel(p.id)} />
                            <button onClick={() => addEntregavel(p.id)} className="btn-primary py-1.5 px-3"><Plus size={14} /></button>
                          </div>
                        </div>

                        {/* CHECKLIST DE EXECUCAO */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <ListChecks size={14} className="text-[#486c96]" />
                            <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide">Checklist de execucao</span>
                            <span className="text-[10px] text-gray-400">— etapas do projeto</span>
                          </div>
                          <div className="space-y-1.5 mb-2">
                            {(p.tasks || []).map(t => (
                              <div key={t.id} className="flex items-start gap-2">
                                <button onClick={() => toggleTask(p.id, t.id)}
                                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center mt-0.5 transition-colors ${t.feito ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b]'}`}>
                                  {t.feito && <Check size={11} className="text-white" />}
                                </button>
                                <span className={`text-sm flex-1 leading-snug ${t.feito ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.texto}</span>
                                <button onClick={() => removerTask(p.id, t.id)} className="text-gray-200 hover:text-red-400 mt-0.5"><X size={12} /></button>
                              </div>
                            ))}
                            {(p.tasks || []).length === 0 && (
                              <p className="text-xs text-gray-400 italic">Nenhuma etapa ainda</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input className="input flex-1 text-sm py-1.5"
                              placeholder="Adicionar etapa..."
                              value={novaEntrada[`t_${p.id}`] || ''}
                              onChange={e => setNovaEntrada(n => ({ ...n, [`t_${p.id}`]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && addTask(p.id)} />
                            <button onClick={() => addTask(p.id)} className="btn-primary py-1.5 px-3"><Plus size={14} /></button>
                          </div>
                        </div>

                        {/* ORCAMENTO */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={14} className="text-[#486c96]" />
                            <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide">Orcamento</span>
                          </div>
                          <textarea
                            className="w-full text-sm text-gray-700 border border-[#d2b99b]/30 rounded-xl p-3 resize-none focus:outline-none focus:border-[#486c96] bg-[#f9f1e7]/30"
                            rows={3}
                            placeholder="Ex: Total cobrado do cliente: R$800&#10;Designer: R$300&#10;Canva Pro (proporcional): R$18&#10;Horas de trabalho: 6h"
                            value={editandoCampo[`${p.id}_orcamento`] !== undefined ? editandoCampo[`${p.id}_orcamento`] : (p.orcamento || '')}
                            onChange={e => setCampo(p.id, 'orcamento', e.target.value)}
                            onBlur={e => salvarCampo(p.id, 'orcamento', e.target.value)}
                          />
                        </div>

                        {/* LINKS */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Link size={14} className="text-[#486c96]" />
                            <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide">Links e arquivos</span>
                          </div>
                          <div className="space-y-1.5 mb-2">
                            {(p.links || []).map(l => (
                              <div key={l.id} className="flex items-center gap-2 bg-[#f9f1e7]/50 rounded-lg px-3 py-1.5">
                                <ExternalLink size={12} className="text-[#486c96] flex-shrink-0" />
                                <a href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noreferrer"
                                  className="text-sm text-[#486c96] underline underline-offset-2 flex-1 truncate">{l.url}</a>
                                <button onClick={() => removerLink(p.id, l.id)} className="text-gray-200 hover:text-red-400 flex-shrink-0"><X size={12} /></button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input className="input flex-1 text-sm py-1.5"
                              placeholder="Cole link do Drive, Canva, referencia visual..."
                              value={novaEntrada[`l_${p.id}`] || ''}
                              onChange={e => setNovaEntrada(n => ({ ...n, [`l_${p.id}`]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && addLink(p.id)} />
                            <button onClick={() => addLink(p.id)} className="btn-primary py-1.5 px-3"><Plus size={14} /></button>
                          </div>
                        </div>

                        {/* OBSERVACOES */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <StickyNote size={14} className="text-[#486c96]" />
                            <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide">Observacoes e pedidos do cliente</span>
                          </div>
                          <textarea
                            className="w-full text-sm text-gray-700 border border-[#d2b99b]/30 rounded-xl p-3 resize-none focus:outline-none focus:border-[#486c96] bg-[#f9f1e7]/30"
                            rows={3}
                            placeholder="Pedidos especificos, restricoes, referencias de estilo, combinados, contatos..."
                            value={editandoCampo[`${p.id}_observacoes`] !== undefined ? editandoCampo[`${p.id}_observacoes`] : (p.observacoes || '')}
                            onChange={e => setCampo(p.id, 'observacoes', e.target.value)}
                            onBlur={e => salvarCampo(p.id, 'observacoes', e.target.value)}
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Orcamento e observacoes salvam automaticamente ao clicar fora ✓</p>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
