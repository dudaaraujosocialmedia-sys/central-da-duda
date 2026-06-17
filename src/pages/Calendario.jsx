import { useState, useMemo } from 'react';
import { getOrDefault, set } from '../store';
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, X, Settings } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPOS_FIXOS = [
  { valor: 'postagem', label: 'Postagem', cor: '#486c96' },
  { valor: 'reuniao', label: 'Reuniao', cor: '#5f86ad' },
  { valor: 'aniversario', label: 'Aniversario', cor: '#e879a0' },
  { valor: 'captacao', label: 'Captacao de Conteudo', cor: '#d2b99b' },
  { valor: 'pagamento', label: 'Pagamento', cor: '#22c55e' },
  { valor: 'tarefa', label: 'Tarefa', cor: '#f59e0b' },
];

const STATUS_POST = ['rascunho', 'aprovado', 'agendado', 'publicado'];
const COR_STATUS = {
  rascunho: 'bg-gray-100 text-gray-500',
  aprovado: 'bg-blue-100 text-blue-700',
  agendado: 'bg-yellow-100 text-yellow-700',
  publicado: 'bg-green-100 text-green-700',
};

const COR_OPCOES = ['#486c96','#5f86ad','#d2b99b','#e879a0','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899'];

export default function Calendario() {
  const [eventos, setEventos] = useState(() => getOrDefault('eventos', []));
  const [categorias, setCategorias] = useState(() => getOrDefault('categorias_calendario', []));
  const [periodos, setPeriodos] = useState(() => getOrDefault('periodos_calendario', []));
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);
  const [showPeriodos, setShowPeriodos] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ titulo: '', tipo: 'postagem', data: '', hora: '', cliente: '', descricao: '', status_post: 'rascunho' });
  const [novaCategoria, setNovaCategoria] = useState({ label: '', cor: '#486c96' });
  const [novoPeriodo, setNovoPeriodo] = useState({ nome: '', dia_inicio: '', dia_fim: '', cor: '#486c96' });

  const clientes = getOrDefault('clientes', []);
  const despesas = getOrDefault('despesas', []);
  const TIPOS = [...TIPOS_FIXOS, ...categorias];

  const salvarEventos = (lista) => { setEventos(lista); set('eventos', lista); };
  const salvarCategorias = (lista) => { setCategorias(lista); set('categorias_calendario', lista); };

  // Pagamentos de clientes automaticos
  const pagamentosClientes = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = String(mesAtual.getMonth() + 1).padStart(2, '0');
    return clientes
      .filter(c => c.dia_pagamento && c.status !== 'inativo')
      .map(c => ({
        id: `pgto_${c.id}_${ano}_${mes}`,
        titulo: `Pagamento: ${c.nome.split(' ')[0]}${c.valor ? ` — R$ ${Number(c.valor).toLocaleString('pt-BR')}` : ''}`,
        tipo: 'pagamento', cor: '#22c55e',
        data: `${ano}-${mes}-${String(c.dia_pagamento).padStart(2, '0')}`,
        isAutomatico: true,
      }));
  }, [clientes, mesAtual]);

  // Vencimentos de despesas automaticos
  const vencimentosDespesas = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = String(mesAtual.getMonth() + 1).padStart(2, '0');
    return despesas
      .filter(d => d.vencimento && d.frequencia !== 'Unica vez')
      .map(d => ({
        id: `desp_${d.id}_${ano}_${mes}`,
        titulo: `Vence: ${d.nome}${d.valor_unit ? ` — R$ ${Number(d.valor_unit).toLocaleString('pt-BR')}` : ''}`,
        tipo: 'pagamento', cor: '#ef4444',
        data: `${ano}-${mes}-${String(d.vencimento).padStart(2, '0')}`,
        isAutomatico: true,
      }));
  }, [despesas, mesAtual]);

  // Aniversarios dos clientes
  const aniversarios = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const evts = [];
    clientes.forEach(c => {
      const lista = c.socios && c.socios.length > 0
        ? c.socios.map(s => ({ nome: s.nome, data: s.aniversario }))
        : c.aniversarios && c.aniversarios.length > 0
          ? c.aniversarios
          : c.aniversario ? [{ nome: '', data: c.aniversario }] : [];
      lista.forEach((a, i) => {
        if (!a.data) return;
        const [, mes, dia] = a.data.split('-');
        evts.push({
          id: `aniv_${c.id}_${i}`,
          titulo: `Aniversario: ${a.nome || c.nome.split(' ')[0]}`,
          tipo: 'aniversario', cor: '#e879a0',
          data: `${ano}-${mes}-${dia}`,
          isAniversario: true,
        });
      });
    });
    return evts;
  }, [clientes, mesAtual]);

  const todosEventos = useMemo(() => [...eventos, ...aniversarios, ...pagamentosClientes, ...vencimentosDespesas], [eventos, aniversarios, pagamentosClientes, vencimentosDespesas]);

  const submit = () => {
    if (!form.titulo) return;
    const tipo = TIPOS.find(t => t.valor === form.tipo);
    const cor = tipo?.cor || '#486c96';

    // Criar um evento para cada dia selecionado
    const datas = diasSelecionados.length > 0
      ? diasSelecionados.map(d => format(d, 'yyyy-MM-dd'))
      : [form.data];

    if (editId) {
      salvarEventos(eventos.map(e => e.id === editId ? { ...form, id: editId, cor } : e));
      setEditId(null);
    } else {
      const novos = datas.filter(Boolean).map(data => ({
        ...form, data, cor, id: Date.now() + Math.random(),
      }));
      salvarEventos([...eventos, ...novos]);
    }

    setForm({ titulo: '', tipo: 'postagem', data: '', hora: '', cliente: '', descricao: '', status_post: 'rascunho' });
    setDiasSelecionados([]);
    setShowForm(false);
  };

  const remover = (id) => salvarEventos(eventos.filter(e => e.id !== id));
  const atualizarStatus = (id, status) => salvarEventos(eventos.map(e => e.id === id ? { ...e, status_post: status } : e));

  const toggleDia = (dia) => {
    setDiasSelecionados(prev => {
      const jaTem = prev.some(d => isSameDay(d, dia));
      return jaTem ? prev.filter(d => !isSameDay(d, dia)) : [...prev, dia];
    });
    setShowForm(false);
  };

  const adicionarCategoria = () => {
    if (!novaCategoria.label.trim()) return;
    const nova = { valor: novaCategoria.label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(), label: novaCategoria.label, cor: novaCategoria.cor };
    salvarCategorias([...categorias, nova]);
    setNovaCategoria({ label: '', cor: '#486c96' });
  };

  const salvarPeriodos = (lista) => { setPeriodos(lista); set('periodos_calendario', lista); };
  const adicionarPeriodo = () => {
    if (!novoPeriodo.nome.trim() || !novoPeriodo.dia_inicio || !novoPeriodo.dia_fim) return;
    salvarPeriodos([...periodos, { ...novoPeriodo, id: Date.now() }]);
    setNovoPeriodo({ nome: '', dia_inicio: '', dia_fim: '', cor: '#486c96' });
  };
  const removerPeriodo = (id) => salvarPeriodos(periodos.filter(p => p.id !== id));
  const removerCategoria = (valor) => salvarCategorias(categorias.filter(c => c.valor !== valor));

  const corFundoDia = (dia) => {
    const d = dia.getDate();
    for (const p of periodos) {
      const di = parseInt(p.dia_inicio);
      const df = parseInt(p.dia_fim);
      if (!di || !df) continue;
      const dentroDoMes = di <= df ? d >= di && d <= df : d >= di || d <= df;
      if (dentroDoMes) return p.cor;
    }
    return null;
  };

  const diasDoMes = eachDayOfInterval({ start: startOfMonth(mesAtual), end: endOfMonth(mesAtual) });
  const diasVazios = Array(getDay(startOfMonth(mesAtual))).fill(null);

  const eventosNoDia = (dia) => todosEventos.filter(e => isSameDay(new Date(e.data + 'T12:00:00'), dia));

  // Eventos dos dias selecionados (para mostrar no painel)
  const eventosDiasMostrados = diasSelecionados.length === 1
    ? eventosNoDia(diasSelecionados[0])
    : diasSelecionados.length === 0 && form.data
      ? []
      : [];

  return (
    <div>
      <h1 className="page-title">Calendario</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))} className="p-2 rounded-xl hover:bg-[#f9f1e7] text-[#486c96]">
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-bold text-[#486c96] capitalize">
              {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))} className="p-2 rounded-xl hover:bg-[#f9f1e7] text-[#486c96]">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Instrucao */}
          <p className="text-[11px] text-gray-400 mb-3 text-center">
            Clique num dia para selecionar. Clique em varios dias para adicionar o mesmo evento em multiplos dias.
          </p>

          <div className="grid grid-cols-7 mb-2">
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sab'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {diasVazios.map((_, i) => <div key={`v${i}`} />)}
            {diasDoMes.map(dia => {
              const evts = eventosNoDia(dia);
              const isHoje = isSameDay(dia, new Date());
              const isSelecionado = diasSelecionados.some(d => isSameDay(d, dia));
              const fundoCor = corFundoDia(dia);
              return (
                <button
                  key={dia.toString()}
                  onClick={() => toggleDia(dia)}
                  className={`relative aspect-square flex flex-col items-center justify-start pt-1 rounded-xl text-sm transition-colors ${
                    isSelecionado ? 'text-white ring-2 ring-[#486c96] ring-offset-1' :
                    isHoje ? 'border-2 border-[#486c96] font-bold' :
                    'hover:opacity-80'
                  }`}
                  style={{
                    background: isSelecionado ? '#486c96' : fundoCor ? fundoCor + '30' : undefined,
                    color: !isSelecionado && !isHoje ? (fundoCor ? '#374151' : '#374151') : undefined,
                  }}
                >
                  <span className="font-semibold text-xs">{format(dia, 'd')}</span>
                  {evts.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                      {evts.slice(0, 3).map((e, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: isSelecionado ? 'white' : e.cor }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#d2b99b]/30">
            {TIPOS.map(t => (
              <div key={t.valor} className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.cor }} />
                {t.label}
              </div>
            ))}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
              Vencimento despesa
            </div>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-4">

          {/* Categorias */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
            <button
              onClick={() => setShowCategorias(!showCategorias)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f9f1e7]"
            >
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-[#486c96]" />
                <span className="font-semibold text-[#486c96] text-sm">Categorias</span>
              </div>
              <ChevronRight size={14} className={`text-gray-400 transition-transform ${showCategorias ? 'rotate-90' : ''}`} />
            </button>

            {showCategorias && (
              <div className="px-5 pb-5">
                <div className="space-y-2 mb-3">
                  {TIPOS_FIXOS.map(t => (
                    <div key={t.valor} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.cor }} />
                      <span>{t.label}</span>
                      <span className="text-[10px] text-gray-300 ml-auto">padrao</span>
                    </div>
                  ))}
                  {categorias.map(c => (
                    <div key={c.valor} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.cor }} />
                      <span className="flex-1 text-gray-700">{c.label}</span>
                      <button onClick={() => removerCategoria(c.valor)} className="text-gray-300 hover:text-red-400"><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#d2b99b]/30 pt-3">
                  <p className="text-[11px] text-gray-400 mb-2">Nova categoria</p>
                  <div className="flex gap-2 items-center">
                    <input
                      className="input flex-1 text-xs py-1.5"
                      placeholder="Ex: Medico, Faculdade..."
                      value={novaCategoria.label}
                      onChange={e => setNovaCategoria({ ...novaCategoria, label: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && adicionarCategoria()}
                    />
                    <input type="color" value={novaCategoria.cor} onChange={e => setNovaCategoria({ ...novaCategoria, cor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-[#d2b99b]/40" />
                    <button onClick={adicionarCategoria} className="btn-primary px-2 py-1.5"><Plus size={14} /></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {COR_OPCOES.map(cor => (
                      <button key={cor} onClick={() => setNovaCategoria({ ...novaCategoria, cor })}
                        className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${novaCategoria.cor === cor ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ background: cor }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Periodos coloridos */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
            <button onClick={() => setShowPeriodos(!showPeriodos)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f9f1e7]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#486c96] text-sm">Periodos coloridos</span>
              </div>
              <ChevronRight size={14} className={`text-gray-400 transition-transform ${showPeriodos ? 'rotate-90' : ''}`} />
            </button>
            {showPeriodos && (
              <div className="px-5 pb-5">
                <p className="text-[11px] text-gray-400 mb-3">Marque periodos do mes com cor de fundo (ex: dia 29 ao 3 = planejamento)</p>
                <div className="space-y-2 mb-3">
                  {periodos.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.cor }} />
                      <span className="flex-1 text-gray-700">{p.nome}</span>
                      <span className="text-gray-400">dia {p.dia_inicio}–{p.dia_fim}</span>
                      <button onClick={() => removerPeriodo(p.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#d2b99b]/30 pt-3 space-y-2">
                  <input className="input text-xs" placeholder="Nome (ex: Planejamento)" value={novoPeriodo.nome} onChange={e => setNovoPeriodo({...novoPeriodo, nome: e.target.value})} />
                  <div className="flex gap-2">
                    <input className="input text-xs flex-1" type="number" min="1" max="31" placeholder="Dia inicio" value={novoPeriodo.dia_inicio} onChange={e => setNovoPeriodo({...novoPeriodo, dia_inicio: e.target.value})} />
                    <input className="input text-xs flex-1" type="number" min="1" max="31" placeholder="Dia fim" value={novoPeriodo.dia_fim} onChange={e => setNovoPeriodo({...novoPeriodo, dia_fim: e.target.value})} />
                    <input type="color" value={novoPeriodo.cor} onChange={e => setNovoPeriodo({...novoPeriodo, cor: e.target.value})} className="w-8 h-8 rounded cursor-pointer border border-[#d2b99b]/40" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COR_OPCOES.map(cor => (
                      <button key={cor} type="button" onClick={() => setNovoPeriodo({...novoPeriodo, cor})}
                        className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${novoPeriodo.cor === cor ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ background: cor }} />
                    ))}
                  </div>
                  <button onClick={adicionarPeriodo} className="btn-primary w-full text-xs"><Plus size={12} className="inline mr-1" /> Adicionar periodo</button>
                </div>
              </div>
            )}
          </div>

          {/* Painel de dias selecionados */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            {diasSelecionados.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Clique em um ou mais dias para adicionar eventos</p>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {diasSelecionados.length === 1 ? (
                      <h3 className="font-bold text-[#486c96] text-sm">
                        {format(diasSelecionados[0], "dd 'de' MMMM", { locale: ptBR })}
                      </h3>
                    ) : (
                      <div>
                        <h3 className="font-bold text-[#486c96] text-sm">{diasSelecionados.length} dias selecionados</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {diasSelecionados.sort((a,b) => a-b).map((d, i) => (
                            <span key={i} className="text-[10px] bg-[#486c96]/10 text-[#486c96] px-1.5 py-0.5 rounded font-semibold">
                              {format(d, 'dd/MM')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5"
                      onClick={() => { setShowForm(true); setEditId(null); }}
                    >
                      <Plus size={12} /> Evento
                    </button>
                    <button onClick={() => setDiasSelecionados([])} className="p-1.5 text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>
                </div>

                {showForm && (
                  <div className="space-y-2 mb-4 pb-4 border-b border-[#d2b99b]/30">
                    <input className="input text-xs" placeholder="Titulo do evento" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
                    <select className="input text-xs" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                      {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
                    </select>
                    {form.tipo === 'postagem' && (
                      <select className="input text-xs" value={form.status_post} onChange={e => setForm({...form, status_post: e.target.value})}>
                        {STATUS_POST.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    )}
                    {diasSelecionados.length === 1 && (
                      <input className="input text-xs" type="time" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} />
                    )}
                    <select className="input text-xs" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})}>
                      <option value="">Cliente (opcional)</option>
                      {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                    <textarea className="input text-xs" rows={2} placeholder="Descricao..." value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
                    {diasSelecionados.length > 1 && (
                      <p className="text-[10px] text-[#486c96] font-semibold">Este evento sera criado em todos os {diasSelecionados.length} dias selecionados.</p>
                    )}
                    <div className="flex gap-2">
                      <button className="btn-primary text-xs flex-1" onClick={submit}><Check size={12} className="inline mr-1" />Salvar</button>
                      <button className="btn-secondary text-xs" onClick={() => { setShowForm(false); setEditId(null); }}><X size={12} /></button>
                    </div>
                  </div>
                )}

                {diasSelecionados.length === 1 && (
                  <div className="space-y-2">
                    {eventosDiasMostrados.length === 0 && !showForm && (
                      <p className="text-xs text-gray-400 text-center py-2">Nenhum evento neste dia</p>
                    )}
                    {eventosDiasMostrados.map(ev => (
                      <div key={ev.id} className="p-2 rounded-xl bg-[#f9f1e7]">
                        <div className="flex items-start gap-2">
                          <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: ev.cor }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#486c96] truncate">{ev.titulo}</div>
                            {ev.hora && <div className="text-[10px] text-gray-400">{ev.hora}</div>}
                            {ev.cliente && <div className="text-[10px] text-gray-400">{ev.cliente}</div>}
                            {ev.tipo === 'postagem' && !ev.isAniversario && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {STATUS_POST.map(s => (
                                  <button key={s} onClick={() => atualizarStatus(ev.id, s)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold transition-colors ${ev.status_post === s ? COR_STATUS[s] : 'bg-white text-gray-400 border border-gray-200'}`}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {!ev.isAniversario && !ev.isAutomatico && (
                            <button onClick={() => remover(ev.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={12} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Proximos eventos */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            <h3 className="font-bold text-[#486c96] text-sm mb-3">Proximos eventos</h3>
            {todosEventos.filter(e => new Date(e.data + 'T12:00:00') >= new Date()).sort((a,b) => new Date(a.data) - new Date(b.data)).slice(0, 6).map(ev => (
              <div key={ev.id} className="flex items-center gap-2 py-2 border-b border-[#d2b99b]/20 last:border-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.cor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 truncate">{ev.titulo}</div>
                  <div className="text-[10px] text-gray-400">{format(new Date(ev.data + 'T12:00:00'), "dd/MM", { locale: ptBR })}</div>
                </div>
                {ev.tipo === 'postagem' && ev.status_post && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${COR_STATUS[ev.status_post] || 'bg-gray-100 text-gray-500'}`}>{ev.status_post}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
