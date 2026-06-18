import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { ArrowLeft, Plus, Trash2, Check, AtSign, Calendar, DollarSign, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Campos universais do briefing
const CAMPOS_UNIVERSAIS = [
  { key: 'tom_voz',     label: 'Tom de voz',           placeholder: 'Ex: Formal e tecnico, descontraido e proximo, inspiracional...',  multi: false },
  { key: 'publico',     label: 'Publico-alvo',          placeholder: 'Ex: Mulheres 30-45 anos, empreendedoras da regiao sul...',         multi: false },
  { key: 'objetivo',    label: 'Objetivo nas redes',    placeholder: 'Ex: Gerar leads, fortalecer autoridade, vender produto X...',      multi: false },
  { key: 'cores',       label: 'Cores / estetica',      placeholder: 'Ex: Azul marinho e dourado, minimalista, sem vermelho...',         multi: false },
  { key: 'evitar',      label: 'O que EVITAR',          placeholder: 'Ex: Politica, humor ironico, mencionar concorrentes pelo nome...', multi: true  },
  { key: 'diferenciais',label: 'Diferenciais',          placeholder: 'O que torna esse cliente unico no mercado dele...',                multi: true  },
];

// Campos específicos por área (detectados por palavras-chave na área do cliente)
const CAMPOS_AREA = [
  {
    match: ['jurid', 'adv', 'direito', 'escritorio'],
    titulo: 'Juridico / Advocacia',
    campos: [
      { key: 'area_direito',   label: 'Area do direito',           placeholder: 'Ex: Trabalhista, Familia, Previdenciario, Tributario...' },
      { key: 'atende',         label: 'Atende PF ou PJ?',          placeholder: 'Ex: Pessoa fisica, empresas, ambos' },
      { key: 'restricoes_oab', label: 'Restricoes OAB',            placeholder: 'Ex: Nao pode prometer resultado, nao citar casos de clientes...' },
      { key: 'registro_oab',   label: 'OAB',                       placeholder: 'Ex: OAB/SP 123.456' },
      { key: 'conteudo_forte', label: 'Conteudos que funcionam',   placeholder: 'Ex: Tirar duvidas, desmistificar leis, cases genericos...' },
    ],
  },
  {
    match: ['saude', 'medic', 'clinic', 'hospital', 'nutri', 'psico', 'fisio', 'odont', 'dent'],
    titulo: 'Saude',
    campos: [
      { key: 'especialidade',  label: 'Especialidade',             placeholder: 'Ex: Cardiologista, Nutricionista esportiva, Psicanalista...' },
      { key: 'registro',       label: 'Registro profissional',     placeholder: 'Ex: CRM 12345, CRN 6789, CRP 00/0000' },
      { key: 'restricoes_cf',  label: 'Restricoes do conselho',    placeholder: 'Ex: Nao pode antes/depois, nao garantir resultado, nao exibir corpo...' },
      { key: 'atende',         label: 'Atende convenio?',          placeholder: 'Ex: Particular, convenios Amil e Unimed, ambos' },
      { key: 'conteudo_forte', label: 'Conteudos que funcionam',   placeholder: 'Ex: Dicas rapidas, mitos e verdades, humanizacao...' },
    ],
  },
  {
    match: ['fitness', 'personal', 'academia', 'treino', 'crossfit', 'pilates', 'yoga'],
    titulo: 'Fitness / Movimento',
    campos: [
      { key: 'modalidades',    label: 'Modalidades / servicos',    placeholder: 'Ex: Musculacao, corrida, treino funcional...' },
      { key: 'registro',       label: 'CREF',                      placeholder: 'Ex: CREF 12345-G/SP' },
      { key: 'formato',        label: 'Presencial ou online?',     placeholder: 'Ex: Presencial em SP, online para todo Brasil, ambos' },
      { key: 'publico_fit',    label: 'Foco do publico',           placeholder: 'Ex: Emagrecimento, hipertrofia, saude para 40+...' },
    ],
  },
  {
    match: ['aliment', 'restaur', 'comida', 'gastr', 'chef', 'confeit', 'padari', 'cafe', 'lanche'],
    titulo: 'Alimentacao',
    campos: [
      { key: 'tipo_culinaria', label: 'Tipo de culinaria',         placeholder: 'Ex: Italiana, saudavel, confeitaria francesa...' },
      { key: 'delivery',       label: 'Delivery / Presencial',     placeholder: 'Ex: So delivery via iFood, presencial + delivery' },
      { key: 'horario',        label: 'Horario de funcionamento',  placeholder: 'Ex: Seg-Sex 11h-22h, Sab-Dom 11h-23h' },
      { key: 'ticket',         label: 'Ticket medio',              placeholder: 'Ex: R$ 45 por pessoa, combo a partir de R$ 30' },
    ],
  },
  {
    match: ['moda', 'loja', 'roupa', 'ecommerce', 'boutique', 'calcado', 'acessorio', 'bolsa'],
    titulo: 'Moda / Loja',
    campos: [
      { key: 'produtos',       label: 'Produtos principais',       placeholder: 'Ex: Vestidos para festas, calcados femininos...' },
      { key: 'ticket',         label: 'Ticket medio',              placeholder: 'Ex: R$ 150-300, produto de entrada R$ 80' },
      { key: 'canal',          label: 'Vende onde?',               placeholder: 'Ex: Instagram, site proprio, loja fisica em SP' },
      { key: 'diferencial_loja',label: 'Diferencial',              placeholder: 'Ex: Entrega em 24h, tamanhos especiais, parcelamento' },
    ],
  },
  {
    match: ['beleza', 'estetica', 'salao', 'cabelo', 'maquiag', 'micropigment', 'cilios', 'unhas', 'skin'],
    titulo: 'Beleza / Estetica',
    campos: [
      { key: 'servicos',       label: 'Servicos principais',       placeholder: 'Ex: Coloracao, botox capilar, extensao de cilios...' },
      { key: 'registro',       label: 'Registro profissional',     placeholder: 'Ex: COREN, CRTH ou sem exigencia' },
      { key: 'restricoes_bel', label: 'Restricoes (conselho)',     placeholder: 'Ex: Nao pode mostrar procedimento de micropigmentacao...' },
      { key: 'diferencial_bel',label: 'Diferencial',               placeholder: 'Ex: Atendimento domiciliar, agenda online, produtos veganos' },
    ],
  },
  {
    match: ['imobil', 'imovel', 'corretor', 'creci', 'incorpor', 'loteament'],
    titulo: 'Imobiliario',
    campos: [
      { key: 'tipo_imovel',    label: 'Tipo de imovel',            placeholder: 'Ex: Residencial, comercial, lancamentos, aluguel' },
      { key: 'registro',       label: 'CRECI',                     placeholder: 'Ex: CRECI-SP 123456' },
      { key: 'regiao',         label: 'Regiao de atuacao',         placeholder: 'Ex: Zona Sul de SP, litoral paulista, RJ capital' },
      { key: 'ticket_imovel',  label: 'Faixa de preco',            placeholder: 'Ex: R$ 300k-800k, alto padrao acima de 1M' },
    ],
  },
  {
    match: ['contab', 'contador', 'contabil', 'financ', 'investiment', 'planejamento financ'],
    titulo: 'Contabilidade / Financas',
    campos: [
      { key: 'especialidade',  label: 'Especialidade',             placeholder: 'Ex: MEI e autonomos, PMEs, planejamento tributario...' },
      { key: 'registro',       label: 'CRC / CFP / CPA',           placeholder: 'Ex: CRC-SP 12345, CFP 1234567' },
      { key: 'atende',         label: 'Atende PF ou PJ?',          placeholder: 'Ex: Pessoa fisica, empresas, ambos' },
      { key: 'servicos',       label: 'Servicos principais',       placeholder: 'Ex: Abertura de empresa, BPO financeiro, IR pessoa fisica...' },
    ],
  },
  {
    match: ['educ', 'escola', 'coach', 'mentor', 'curso', 'treinament', 'professor'],
    titulo: 'Educacao / Mentoria',
    campos: [
      { key: 'area_ensino',    label: 'Area de ensino / mentoria', placeholder: 'Ex: Marketing digital, concursos, ingles, lideranca...' },
      { key: 'formato',        label: 'Formato',                   placeholder: 'Ex: Online, presencial, hibrido, ao vivo + gravado' },
      { key: 'produto',        label: 'Produto principal',         placeholder: 'Ex: Mentoria 1:1, curso gravado, grupo de assinatura...' },
      { key: 'ticket',         label: 'Ticket',                    placeholder: 'Ex: Curso R$ 497, mentoria R$ 3.000/mes' },
    ],
  },
];

function detectarArea(clienteArea) {
  if (!clienteArea) return null;
  const lower = clienteArea.toLowerCase();
  return CAMPOS_AREA.find(g => g.match.some(m => lower.includes(m))) || null;
}

export default function ClienteDetalhe({ clienteId, onVoltar }) {
  const clientes = getOrDefault('clientes', []);
  const cliente = clientes.find(c => c.id === clienteId);

  const [notas, setNotas] = useState(() => getOrDefault(`notas_cliente_${clienteId}`, []));
  const [checklistCliente, setChecklistCliente] = useState(() => getOrDefault(`checklist_cliente_${clienteId}`, []));
  const [anotacoes, setAnotacoes] = useState(() => getOrDefault(`anotacoes_${clienteId}`, ''));
  const [briefing, setBriefing] = useState(() => getOrDefault(`briefing_${clienteId}`, { frases: [] }));
  const [formNota, setFormNota] = useState('');
  const [formTask, setFormTask] = useState('');
  const [novaFrase, setNovaFrase] = useState('');
  const [aba, setAba] = useState('briefing');

  if (!cliente) return (
    <div className="text-center py-10">
      <p className="text-gray-400">Cliente nao encontrado</p>
      <button className="btn-secondary mt-4" onClick={onVoltar}>Voltar</button>
    </div>
  );

  const salvarNotas = (l) => { setNotas(l); set(`notas_cliente_${clienteId}`, l); };
  const salvarChecklist = (l) => { setChecklistCliente(l); set(`checklist_cliente_${clienteId}`, l); };
  const salvarAnotacoes = (v) => { setAnotacoes(v); set(`anotacoes_${clienteId}`, v); };

  const salvarBriefing = (b) => { setBriefing(b); set(`briefing_${clienteId}`, b); };
  const setCampo = (key, val) => salvarBriefing({ ...briefing, [key]: val });
  const salvarCampo = (key, val) => salvarBriefing({ ...briefing, [key]: val });

  const adicionarFrase = () => {
    if (!novaFrase.trim()) return;
    salvarBriefing({ ...briefing, frases: [...(briefing.frases || []), novaFrase.trim()] });
    setNovaFrase('');
  };
  const removerFrase = (i) => {
    const f = [...(briefing.frases || [])];
    f.splice(i, 1);
    salvarBriefing({ ...briefing, frases: f });
  };

  const adicionarNota = () => {
    if (!formNota.trim()) return;
    salvarNotas([{ id: Date.now(), texto: formNota, data: new Date().toISOString() }, ...notas]);
    setFormNota('');
  };

  const adicionarTask = () => {
    if (!formTask.trim()) return;
    salvarChecklist([...checklistCliente, { id: Date.now(), titulo: formTask, concluida: false }]);
    setFormTask('');
  };

  const toggleTask = (id) => salvarChecklist(checklistCliente.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));

  const fluxo = getOrDefault('fluxo_financeiro', { historico: [] });
  const eventos = getOrDefault('eventos', []);
  const eventosCliente = eventos.filter(e => e.cliente === cliente.nome);
  const grupoArea = detectarArea(cliente.area);
  const corStatus = cliente.status === 'ativo' ? 'bg-green-100 text-green-700' : cliente.status === 'pausado' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';

  return (
    <div>
      <button onClick={onVoltar} className="flex items-center gap-2 text-[#486c96] text-sm font-semibold mb-5 hover:opacity-70">
        <ArrowLeft size={16} /> Voltar para Financeiro
      </button>

      {/* Header do cliente */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#486c96]">{cliente.nome}</h1>
            {cliente.perfil && (
              <a href={`https://instagram.com/${cliente.perfil.replace('@','')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-sm text-[#5f86ad] mt-1 hover:underline">
                <AtSign size={13} /> {cliente.perfil}
              </a>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${corStatus}`}>{cliente.status}</span>
              {cliente.area && <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#f9f1e7] text-[#486c96]">{cliente.area}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Valor mensal</div>
            <div className="text-2xl font-bold text-[#486c96]">R$ {(cliente.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            {cliente.dia_pagamento && <div className="text-xs text-gray-400 mt-1">Pagamento: dia {cliente.dia_pagamento}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#d2b99b]/30">
          {cliente.cpfCnpj && <div><div className="text-xs text-gray-400">CPF / CNPJ</div><div className="text-sm font-medium">{cliente.cpfCnpj}</div></div>}
          {cliente.servico && <div><div className="text-xs text-gray-400">Servico</div><div className="text-sm font-medium">{cliente.servico}</div></div>}
          {cliente.valor_onboarding && <div><div className="text-xs text-gray-400">1° mes</div><div className="text-sm font-medium">R$ {cliente.valor_onboarding.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>}
          {cliente.data_entrada && <div><div className="text-xs text-gray-400">Cliente desde</div><div className="text-sm font-medium">{format(new Date(cliente.data_entrada + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div></div>}
          {(() => {
            const socios = cliente.socios && cliente.socios.length > 0 ? cliente.socios : null;
            if (!socios) return null;
            return <div className="col-span-2">
              <div className="text-xs text-gray-400 mb-2">Socios / Responsaveis</div>
              <div className="flex flex-wrap gap-2">
                {socios.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#f9f1e7] px-3 py-2 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-[#486c96]" />
                    <span className="text-sm font-semibold text-[#486c96]">{s.nome}</span>
                    {s.aniversario && <span className="text-xs text-pink-600">{format(new Date(s.aniversario + 'T12:00:00'), "dd/MM", { locale: ptBR })}</span>}
                  </div>
                ))}
              </div>
            </div>;
          })()}
        </div>

        {cliente.observacoes && (
          <div className="mt-4 p-3 bg-[#f9f1e7] rounded-xl text-sm text-gray-600">{cliente.observacoes}</div>
        )}
      </div>

      {/* Anotacoes rapidas */}
      <div className="bg-[#fffdf7] rounded-2xl p-5 border border-[#d2b99b]/40 shadow-sm mb-5">
        <label className="text-xs font-bold text-[#d2b99b] uppercase tracking-widest block mb-2">Anotacoes rapidas</label>
        <textarea
          className="w-full bg-transparent text-sm text-gray-700 leading-relaxed resize-none focus:outline-none placeholder:text-gray-300"
          rows={3}
          placeholder="Ex: prefere postar terca, evitar roxo, marido se chama Joao..."
          value={anotacoes}
          onChange={e => setAnotacoes(e.target.value)}
          onBlur={e => salvarAnotacoes(e.target.value)}
        />
        <p className="text-[10px] text-[#d2b99b] mt-1">Salva automaticamente ao clicar fora</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { id: 'briefing',   label: 'Briefing' },
          { id: 'resumo',     label: 'Resumo' },
          { id: 'notas',      label: 'Notas' },
          { id: 'checklist',  label: 'Checklist' },
          { id: 'calendario', label: 'Eventos' },
          { id: 'pagamentos', label: 'Pagamentos' },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${aba === a.id ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── BRIEFING ── */}
      {aba === 'briefing' && (
        <div className="space-y-5">

          {/* Frases que o cliente usa */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            <h3 className="font-bold text-[#486c96] mb-1">Frases que o cliente usa</h3>
            <p className="text-xs text-gray-400 mb-4">Expressoes, bordoes e jeitos de falar dela — use para replicar o tom de voz no conteudo.</p>
            <div className="space-y-2 mb-4">
              {(briefing.frases || []).length === 0 && (
                <p className="text-sm text-gray-400 italic">Nenhuma frase cadastrada ainda.</p>
              )}
              {(briefing.frases || []).map((f, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#f9f1e7] rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-700 flex-1 italic">"{f}"</span>
                  <button onClick={() => removerFrase(i)} className="text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5"><X size={13} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1 text-sm" placeholder='Ex: "Quero que as pessoas se identifiquem comigo"'
                value={novaFrase} onChange={e => setNovaFrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionarFrase()} />
              <button onClick={adicionarFrase} className="btn-primary px-3"><Plus size={14} /></button>
            </div>
          </div>

          {/* Campos universais */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            <h3 className="font-bold text-[#486c96] mb-4">Identidade e estrategia</h3>
            <div className="space-y-4">
              {CAMPOS_UNIVERSAIS.map(campo => (
                <div key={campo.key}>
                  <label className="label">{campo.label}</label>
                  {campo.multi ? (
                    <textarea className="input" rows={3} placeholder={campo.placeholder}
                      defaultValue={briefing[campo.key] || ''}
                      key={`${clienteId}_${campo.key}`}
                      onBlur={e => salvarCampo(campo.key, e.target.value)} />
                  ) : (
                    <input className="input" placeholder={campo.placeholder}
                      defaultValue={briefing[campo.key] || ''}
                      key={`${clienteId}_${campo.key}`}
                      onBlur={e => salvarCampo(campo.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3">Salva automaticamente ao clicar fora de cada campo</p>
          </div>

          {/* Campos específicos da área */}
          {grupoArea && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#486c96]/20">
              <h3 className="font-bold text-[#486c96] mb-1">{grupoArea.titulo}</h3>
              <p className="text-xs text-gray-400 mb-4">Informacoes especificas para este nicho — essenciais para criar conteudo correto e seguro.</p>
              <div className="space-y-4">
                {grupoArea.campos.map(campo => (
                  <div key={campo.key}>
                    <label className="label">{campo.label}</label>
                    <input className="input" placeholder={campo.placeholder}
                      defaultValue={briefing[campo.key] || ''}
                      key={`${clienteId}_${campo.key}`}
                      onBlur={e => salvarCampo(campo.key, e.target.value)} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3">Salva automaticamente ao clicar fora de cada campo</p>
            </div>
          )}

          {!grupoArea && cliente.area && (
            <div className="bg-[#f9f1e7] rounded-2xl p-4 text-sm text-gray-500 border border-[#d2b99b]/30">
              Nenhum campo especifico mapeado para "{cliente.area}" ainda. Os campos acima ja cobrem o essencial.
            </div>
          )}
        </div>
      )}

      {/* ── RESUMO ── */}
      {aba === 'resumo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            <h3 className="font-bold text-[#486c96] mb-3">Ultimas notas</h3>
            {notas.length === 0 ? <p className="text-sm text-gray-400">Nenhuma nota</p> :
              notas.slice(0, 3).map(n => (
                <div key={n.id} className="mb-3 pb-3 border-b border-[#d2b99b]/20 last:border-0">
                  <p className="text-sm text-gray-700">{n.texto}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{format(new Date(n.data), "dd/MM/yy")}</p>
                </div>
              ))
            }
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            <h3 className="font-bold text-[#486c96] mb-3">Proximos eventos</h3>
            {eventosCliente.filter(e => new Date(e.data) >= new Date()).length === 0
              ? <p className="text-sm text-gray-400">Nenhum evento</p>
              : eventosCliente.filter(e => new Date(e.data) >= new Date()).sort((a,b) => new Date(a.data) - new Date(b.data)).slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: e.cor }} />
                  <span className="text-sm text-gray-700">{e.titulo}</span>
                  <span className="text-xs text-gray-400 ml-auto">{format(new Date(e.data + 'T12:00:00'), 'dd/MM')}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ── NOTAS ── */}
      {aba === 'notas' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-4">
            <textarea className="input w-full resize-none" rows={3} placeholder="Adicionar nota sobre este cliente..." value={formNota} onChange={e => setFormNota(e.target.value)} />
            <button className="btn-primary mt-2 flex items-center gap-2" onClick={adicionarNota}><Plus size={14} /> Salvar nota</button>
          </div>
          <div className="space-y-3">
            {notas.map(n => (
              <div key={n.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#d2b99b]/30">
                <p className="text-sm text-gray-700 leading-relaxed">{n.texto}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-400">{format(new Date(n.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  <button onClick={() => salvarNotas(notas.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CHECKLIST ── */}
      {aba === 'checklist' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-4">
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Tarefa especifica para este cliente..." value={formTask} onChange={e => setFormTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarTask()} />
              <button className="btn-primary px-3" onClick={adicionarTask}><Plus size={16} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {checklistCliente.map(t => (
              <div key={t.id} className={`bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center gap-3 ${t.concluida ? 'border-green-200' : 'border-[#d2b99b]/30'}`}>
                <button onClick={() => toggleTask(t.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.concluida ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b]'}`}>
                  {t.concluida && <Check size={11} className="text-white" />}
                </button>
                <span className={`flex-1 text-sm ${t.concluida ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.titulo}</span>
                <button onClick={() => salvarChecklist(checklistCliente.filter(x => x.id !== t.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EVENTOS ── */}
      {aba === 'calendario' && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
          {eventosCliente.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">Nenhum evento para este cliente no calendario</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d2b99b]/30 bg-[#f9f1e7]">
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Evento</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Status</th>
                </tr>
              </thead>
              <tbody>
                {eventosCliente.sort((a,b) => new Date(b.data) - new Date(a.data)).map(e => (
                  <tr key={e.id} className="border-b border-[#d2b99b]/20 hover:bg-[#f9f1e7]/50">
                    <td className="px-4 py-3 font-medium">{e.titulo}</td>
                    <td className="px-4 py-3"><span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: e.cor }} />{e.tipo}</td>
                    <td className="px-4 py-3 text-gray-500">{format(new Date(e.data + 'T12:00:00'), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3">{e.status_post && <span className="text-xs bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">{e.status_post}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── PAGAMENTOS ── */}
      {aba === 'pagamentos' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Valor mensal</div>
                <div className="text-xl font-bold text-[#486c96]">R$ {(cliente.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Dia de vencimento</div>
                <div className="text-xl font-bold text-[#486c96]">Dia {cliente.dia_pagamento}</div>
              </div>
            </div>
          </div>
          {fluxo.historico && fluxo.historico.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d2b99b]/30 bg-[#f9f1e7]">
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Mes</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#486c96]">Valor esperado</th>
                  </tr>
                </thead>
                <tbody>
                  {fluxo.historico.map((h, i) => (
                    <tr key={i} className="border-b border-[#d2b99b]/20 hover:bg-[#f9f1e7]/50">
                      <td className="px-4 py-3 font-semibold text-[#486c96]">{h.mes}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">R$ {(cliente.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
