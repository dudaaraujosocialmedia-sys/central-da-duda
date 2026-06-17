import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, X, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPOS = [
  { id: 'feed',      label: 'Feed',      emoji: '🖼️',  cor: '#486c96' },
  { id: 'reels',     label: 'Reels',     emoji: '🎬',  cor: '#e879a0' },
  { id: 'stories',   label: 'Stories',   emoji: '📱',  cor: '#f59e0b' },
  { id: 'carrossel', label: 'Carrossel', emoji: '🎠',  cor: '#8b5cf6' },
];

const STATUS = [
  { id: 'rascunho',   label: 'Rascunho',    cor: 'bg-gray-100 text-gray-500' },
  { id: 'aguardando', label: 'Aguardando',   cor: 'bg-yellow-50 text-yellow-700' },
  { id: 'aprovado',   label: 'Aprovado',     cor: 'bg-blue-50 text-blue-700' },
  { id: 'publicado',  label: 'Publicado',    cor: 'bg-green-50 text-green-700' },
];

const FORM_VAZIO = { titulo: '', tipo: 'feed', status: 'rascunho', hora: '', descricao: '' };

export default function Cronograma() {
  const clientes = getOrDefault('clientes', []);
  const [cronograma, setCronograma] = useState(() => getOrDefault('cronograma', {}));
  const [clienteId, setClienteId] = useState(clientes[0]?.id ? String(clientes[0].id) : '');
  const [semana, setSemana] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [formDia, setFormDia] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editId, setEditId] = useState(null);

  const salvar = (c) => { setCronograma(c); set('cronograma', c); };

  const postsDoDia = (data) => (cronograma[clienteId] || []).filter(p => p.data === data);

  const submit = () => {
    if (!form.titulo || !formDia) return;
    const lista = cronograma[clienteId] || [];
    if (editId) {
      salvar({ ...cronograma, [clienteId]: lista.map(p => p.id === editId ? { ...form, data: formDia, id: editId } : p) });
      setEditId(null);
    } else {
      salvar({ ...cronograma, [clienteId]: [...lista, { ...form, data: formDia, id: Date.now() }] });
    }
    setForm(FORM_VAZIO);
    setFormDia(null);
  };

  const avancarStatus = (postId) => {
    const lista = cronograma[clienteId] || [];
    const post = lista.find(p => p.id === postId);
    if (!post) return;
    const idx = STATUS.findIndex(s => s.id === post.status);
    const prox = STATUS[Math.min(idx + 1, STATUS.length - 1)].id;
    salvar({ ...cronograma, [clienteId]: lista.map(p => p.id === postId ? { ...p, status: prox } : p) });
  };

  const remover = (postId) =>
    salvar({ ...cronograma, [clienteId]: (cronograma[clienteId] || []).filter(p => p.id !== postId) });

  const abrirEditar = (post, e) => {
    e.stopPropagation();
    setForm({ titulo: post.titulo, tipo: post.tipo, status: post.status, hora: post.hora || '', descricao: post.descricao || '' });
    setEditId(post.id);
    setFormDia(post.data);
  };

  const dias = eachDayOfInterval({ start: semana, end: endOfWeek(semana, { weekStartsOn: 0 }) });
  const totalSemana = dias.reduce((acc, d) => acc + postsDoDia(format(d, 'yyyy-MM-dd')).length, 0);

  // Resumo de status da semana
  const todosPostsSemana = dias.flatMap(d => postsDoDia(format(d, 'yyyy-MM-dd')));
  const contStatus = STATUS.reduce((acc, s) => ({ ...acc, [s.id]: todosPostsSemana.filter(p => p.status === s.id).length }), {});

  return (
    <div>
      <h1 className="page-title">Cronograma de Conteudo</h1>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 text-gray-400">Nenhum cliente cadastrado.</div>
      ) : (
        <>
          {/* Seletor de cliente */}
          <div className="flex flex-wrap gap-2 mb-5">
            {clientes.map(c => (
              <button key={c.id} onClick={() => setClienteId(String(c.id))}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${String(c.id) === clienteId ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
                {c.nome}
              </button>
            ))}
          </div>

          {/* Navegação de semana + resumo */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-[#d2b99b]/30 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setSemana(subWeeks(semana, 1))} className="p-2 rounded-xl hover:bg-[#f9f1e7] text-[#486c96]"><ChevronLeft size={18} /></button>
              <div className="text-center">
                <div className="font-bold text-[#486c96]">
                  {format(semana, "dd 'de' MMM", { locale: ptBR })} — {format(endOfWeek(semana, { weekStartsOn: 0 }), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                </div>
                <div className="text-xs text-gray-400">{totalSemana} post{totalSemana !== 1 ? 's' : ''} planejado{totalSemana !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setSemana(addWeeks(semana, 1))} className="p-2 rounded-xl hover:bg-[#f9f1e7] text-[#486c96]"><ChevronRight size={18} /></button>
            </div>
            {totalSemana > 0 && (
              <div className="flex gap-3 justify-center flex-wrap">
                {STATUS.map(s => contStatus[s.id] > 0 && (
                  <span key={s.id} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.cor}`}>
                    {contStatus[s.id]} {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Grade da semana */}
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {dias.map(dia => {
              const dataStr = format(dia, 'yyyy-MM-dd');
              const posts = postsDoDia(dataStr);
              const isHoje = isSameDay(dia, new Date());
              return (
                <div key={dataStr} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${isHoje ? 'border-[#486c96]' : 'border-[#d2b99b]/30'}`}>
                  {/* Cabeçalho do dia */}
                  <div className={`px-2 py-2 text-center border-b border-[#d2b99b]/20 flex-shrink-0 ${isHoje ? 'bg-[#486c96]' : 'bg-[#f9f1e7]/60'}`}>
                    <div className={`text-[10px] font-semibold uppercase tracking-wide ${isHoje ? 'text-white/70' : 'text-gray-400'}`}>
                      {format(dia, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`font-bold text-sm ${isHoje ? 'text-white' : 'text-[#486c96]'}`}>{format(dia, 'd')}</div>
                  </div>

                  {/* Posts */}
                  <div className="p-1 space-y-1 flex-1 min-h-24">
                    {posts.map(post => {
                      const tipo = TIPOS.find(t => t.id === post.tipo);
                      const status = STATUS.find(s => s.id === post.status);
                      return (
                        <div key={post.id} className="group relative rounded-lg p-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ background: (tipo?.cor || '#486c96') + '18', borderLeft: `3px solid ${tipo?.cor || '#486c96'}` }}
                          onClick={() => avancarStatus(post.id)}>
                          <div className="flex items-start gap-0.5 mb-0.5">
                            <span className="text-[10px] flex-shrink-0">{tipo?.emoji}</span>
                            <span className="text-[10px] font-semibold text-gray-800 leading-tight line-clamp-2">{post.titulo}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[9px] px-1 py-0.5 rounded-full font-semibold ${status?.cor}`}>{status?.label}</span>
                            {post.hora && <span className="text-[9px] text-gray-400">{post.hora}</span>}
                          </div>
                          {/* Botões hover */}
                          <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5">
                            <button onClick={e => abrirEditar(post, e)} className="bg-white rounded p-0.5 text-[#486c96] shadow-sm"><Check size={9} /></button>
                            <button onClick={e => { e.stopPropagation(); remover(post.id); }} className="bg-white rounded p-0.5 text-red-400 shadow-sm"><X size={9} /></button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Botão adicionar */}
                    <button onClick={() => { setFormDia(dataStr); setForm(FORM_VAZIO); setEditId(null); }}
                      className="w-full py-1.5 rounded-lg border border-dashed border-[#d2b99b]/50 text-[#486c96]/40 hover:border-[#486c96]/60 hover:text-[#486c96] transition-colors flex items-center justify-center">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            {TIPOS.map(t => (
              <span key={t.id} className="flex items-center gap-1">{t.emoji} {t.label}</span>
            ))}
            <span className="text-gray-300">·</span>
            <span>Clique no post para avancar o status</span>
          </div>

          {/* Modal de formulário */}
          {formDia && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setFormDia(null); setEditId(null); }}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#486c96]">
                    {format(parseISO(formDia), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                  <button onClick={() => { setFormDia(null); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <input className="input" placeholder="Titulo do post" value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })} autoFocus />

                  <div>
                    <label className="label">Tipo</label>
                    <div className="flex gap-2 flex-wrap">
                      {TIPOS.map(t => (
                        <button key={t.id} type="button" onClick={() => setForm({ ...form, tipo: t.id })}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.tipo === t.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-[#d2b99b]/40'}`}
                          style={form.tipo === t.id ? { background: t.cor } : {}}>
                          {t.emoji} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Status</label>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS.map(s => (
                        <button key={s.id} type="button" onClick={() => setForm({ ...form, status: s.id })}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.status === s.id ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-gray-600 border-[#d2b99b]/40'}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input className="input" type="time" value={form.hora}
                    onChange={e => setForm({ ...form, hora: e.target.value })} />

                  <textarea className="input" rows={3} placeholder="Descricao, legenda, instrucao para o designer..."
                    value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="flex gap-2 mt-5">
                  <button className="btn-primary flex-1" onClick={submit}>
                    <Check size={14} className="inline mr-1" /> {editId ? 'Salvar' : 'Adicionar'}
                  </button>
                  <button className="btn-secondary" onClick={() => { setFormDia(null); setEditId(null); }}><X size={14} /></button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
