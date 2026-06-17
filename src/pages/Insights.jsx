import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Lightbulb, Plus, Trash2, Check, X, Edit2, FolderKanban, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CATEGORIAS = ['Estrategia', 'Conteudo', 'Cliente', 'Negocio', 'Pessoal', 'Outro'];
const PROJETO_STATUS = ['Ideia', 'Planejando', 'Em andamento', 'Concluido', 'Pausado'];

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
  const [formProj, setFormProj] = useState({ titulo: '', descricao: '', status: 'Ideia', prazo: '', cliente_id: '', notas: '' });
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [notasAbertas, setNotasAbertas] = useState({});
  const [notasEditando, setNotasEditando] = useState({});

  const salvarProjetos = (lista) => { setProjetos(lista); set('projetos', lista); };

  const submitProj = () => {
    if (!formProj.titulo) return;
    const item = { ...formProj, id: editProjId || Date.now(), criado: editProjId ? (projetos.find(p => p.id === editProjId)?.criado || new Date().toISOString()) : new Date().toISOString() };
    if (editProjId) {
      salvarProjetos(projetos.map(p => p.id === editProjId ? item : p));
      setEditProjId(null);
    } else {
      salvarProjetos([...projetos, item]);
    }
    setFormProj({ titulo: '', descricao: '', status: 'Ideia', prazo: '', cliente_id: '', notas: '' });
    setShowFormProj(false);
  };

  const salvarNotas = (projId, texto) => {
    salvarProjetos(projetos.map(p => p.id === projId ? { ...p, notas: texto } : p));
  };

  const toggleNotas = (id) => setNotasAbertas(n => ({ ...n, [id]: !n[id] }));

  const statusCor = { 'Ideia': 'bg-gray-100 text-gray-600', 'Planejando': 'bg-blue-50 text-blue-700', 'Em andamento': 'bg-yellow-50 text-yellow-700', 'Concluido': 'bg-green-50 text-green-700', 'Pausado': 'bg-red-50 text-red-500' };

  const projetosFiltrados = projetos.filter(p => statusFiltro === 'todos' || p.status === statusFiltro);

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
                <div key={item.id} className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm break-inside-avoid mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#486c96] text-sm">{item.titulo}</h3>
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
            <button className="btn-primary flex items-center gap-2 flex-shrink-0" onClick={() => { setShowFormProj(true); setEditProjId(null); setFormProj({ titulo: '', descricao: '', status: 'Ideia', prazo: '', cliente_id: '' }); }}>
              <Plus size={16} /> Novo projeto
            </button>
          </div>

          {showFormProj && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
              <h4 className="font-semibold text-[#486c96] mb-4">{editProjId ? 'Editar projeto' : 'Novo projeto'}</h4>
              <div className="space-y-3">
                <div>
                  <label className="label">Nome do projeto</label>
                  <input className="input" value={formProj.titulo} onChange={e => setFormProj({...formProj, titulo: e.target.value})} placeholder="Ex: Kit de final de ano, Campanha de agosto..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={formProj.status} onChange={e => setFormProj({...formProj, status: e.target.value})}>
                      {PROJETO_STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Prazo (opcional)</label>
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
                  <label className="label">Descricao resumida</label>
                  <textarea className="input" rows={2} value={formProj.descricao} onChange={e => setFormProj({...formProj, descricao: e.target.value})} placeholder="Uma frase descrevendo o projeto..." />
                </div>
                <div>
                  <label className="label">Notas completas do projeto</label>
                  <textarea className="input" rows={6} value={formProj.notas} onChange={e => setFormProj({...formProj, notas: e.target.value})} placeholder={'Anote tudo aqui:\n— Orcamento\n— Produtos / entregaveis\n— Referências visuais\n— Observacoes do cliente\n— Prazos internos\n— Checklist de tarefas...'} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={submitProj}><Check size={16} className="inline mr-1" /> Salvar</button>
                <button className="btn-secondary" onClick={() => setShowFormProj(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
              </div>
            </div>
          )}

          {projetosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
              <FolderKanban size={36} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-600 font-semibold mb-1">Nenhum projeto ainda</p>
              <p className="text-gray-400 text-sm">Crie projetos especiais: kit de final de ano, campanha de lancamento, manual de marca...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projetosFiltrados.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCor[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                        {p.cliente_id && nomeCliente(p.cliente_id) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-semibold">{nomeCliente(p.cliente_id)}</span>
                        )}
                        {p.prazo && <span className="text-[10px] text-gray-400">ate {new Date(p.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                      </div>
                      <h3 className="font-bold text-[#486c96]">{p.titulo}</h3>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setFormProj({ titulo: p.titulo, descricao: p.descricao || '', status: p.status, prazo: p.prazo || '', cliente_id: p.cliente_id || '', notas: p.notas || '' }); setEditProjId(p.id); setShowFormProj(true); }} className="text-[#486c96]"><Edit2 size={13} /></button>
                      <button onClick={() => salvarProjetos(projetos.filter(x => x.id !== p.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {p.descricao && <p className="text-sm text-gray-600 leading-relaxed mb-2">{p.descricao}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2 flex-wrap">
                      {PROJETO_STATUS.filter(s => s !== p.status).map(s => (
                        <button key={s} onClick={() => salvarProjetos(projetos.map(x => x.id === p.id ? {...x, status: s} : x))}
                          className="text-[10px] text-gray-400 hover:text-[#486c96] px-2 py-0.5 rounded-lg border border-gray-200 hover:border-[#486c96] transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => toggleNotas(p.id)}
                      className="flex items-center gap-1 text-xs text-[#486c96] font-semibold px-2 py-1 rounded-lg hover:bg-[#f9f1e7] transition-colors flex-shrink-0">
                      <FileText size={12} />
                      {notasAbertas[p.id] ? 'Fechar notas' : (p.notas ? 'Ver notas' : 'Adicionar notas')}
                      {notasAbertas[p.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                  {notasAbertas[p.id] && (
                    <div className="mt-3 pt-3 border-t border-[#d2b99b]/20">
                      <textarea
                        className="w-full text-sm text-gray-700 leading-relaxed border border-[#d2b99b]/30 rounded-xl p-3 resize-none focus:outline-none focus:border-[#486c96] bg-[#f9f1e7]/40 min-h-[120px]"
                        placeholder={'Anote tudo aqui: orcamento, produtos, entregaveis, referencias visuais, observacoes do cliente, prazos internos, checklist...'}
                        value={notasEditando[p.id] !== undefined ? notasEditando[p.id] : (p.notas || '')}
                        onChange={e => setNotasEditando(n => ({ ...n, [p.id]: e.target.value }))}
                        onBlur={e => { salvarNotas(p.id, e.target.value); setNotasEditando(n => { const x = {...n}; delete x[p.id]; return x; }); }}
                        rows={6}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Salva automaticamente ao clicar fora ✓</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
