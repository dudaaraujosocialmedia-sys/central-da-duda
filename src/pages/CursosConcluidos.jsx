import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { GraduationCap, Plus, Trash2, Check, X, Star, BookOpen, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

const FORM_VAZIO = { nome: '', instituicao: '', data: '', categoria: '', nota: 5, certificado: '', observacoes: '', status: 'em_andamento', modulo_atual: '', resumos: [] };

export default function CursosConcluidos() {
  const [cursos, setCursos] = useState(() => getOrDefault('cursos', []));
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [expandido, setExpandido] = useState(null);
  const [novoResumo, setNovoResumo] = useState({ parte: '', texto: '' });
  const [adicionandoResumo, setAdicionandoResumo] = useState(null);
  const [topicos, setTopicos] = useState(() => getOrDefault('topicos_estudo', []));
  const [abaView, setAbaView] = useState('cursos');
  const [formTopico, setFormTopico] = useState({ titulo: '', resumo: '', prioridade: 'Media' });
  const [showFormTopico, setShowFormTopico] = useState(false);
  const [editTopicoId, setEditTopicoId] = useState(null);

  const salvar = (lista) => { setCursos(lista); set('cursos', lista); };
  const salvarTopicos = (lista) => { setTopicos(lista); set('topicos_estudo', lista); };

  const submit = () => {
    if (!form.nome) return;
    if (editId) {
      salvar(cursos.map(c => c.id === editId ? { ...form, id: editId } : c));
      setEditId(null);
    } else {
      salvar([...cursos, { ...form, id: Date.now(), resumos: [] }]);
    }
    setForm(FORM_VAZIO);
    setShowForm(false);
  };

  const editar = (c) => {
    setForm({ nome: c.nome, instituicao: c.instituicao || '', data: c.data || '', categoria: c.categoria || '', nota: c.nota || 5, certificado: c.certificado || '', observacoes: c.observacoes || '', status: c.status || 'concluido', modulo_atual: c.modulo_atual || '', resumos: c.resumos || [] });
    setEditId(c.id);
    setShowForm(true);
  };

  const remover = (id) => salvar(cursos.filter(c => c.id !== id));

  const adicionarResumo = (cursoId) => {
    if (!novoResumo.parte || !novoResumo.texto) return;
    salvar(cursos.map(c => c.id === cursoId ? { ...c, resumos: [...(c.resumos || []), { id: Date.now(), ...novoResumo }] } : c));
    setNovoResumo({ parte: '', texto: '' });
    setAdicionandoResumo(null);
  };

  const removerResumo = (cursoId, resumoId) => {
    salvar(cursos.map(c => c.id === cursoId ? { ...c, resumos: (c.resumos || []).filter(r => r.id !== resumoId) } : c));
  };

  const submitTopico = () => {
    if (!formTopico.titulo) return;
    if (editTopicoId) {
      salvarTopicos(topicos.map(t => t.id === editTopicoId ? { ...formTopico, id: editTopicoId } : t));
      setEditTopicoId(null);
    } else {
      salvarTopicos([...topicos, { ...formTopico, id: Date.now(), estudado: false, resumo: formTopico.resumo }]);
    }
    setFormTopico({ titulo: '', resumo: '', prioridade: 'Media' });
    setShowFormTopico(false);
  };

  const toggleEstudado = (id) => salvarTopicos(topicos.map(t => t.id === id ? { ...t, estudado: !t.estudado } : t));
  const removerTopico = (id) => salvarTopicos(topicos.filter(t => t.id !== id));

  const filtrados = cursos.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || (c.categoria || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus || (!c.status && filtroStatus === 'concluido');
    return matchBusca && matchStatus;
  });

  return (
    <div>
      <h1 className="page-title">Cursos &amp; Estudos</h1>

      <div className="flex gap-2 mb-5">
        {['cursos', 'topicos'].map(a => (
          <button key={a} onClick={() => setAbaView(a)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${abaView === a ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
            {a === 'cursos' ? 'Cursos' : 'Topicos para Estudar'}
          </button>
        ))}
      </div>

      {abaView === 'cursos' && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap">
            <input className="input flex-1" placeholder="Buscar curso..." value={busca} onChange={e => setBusca(e.target.value)} />
            <div className="flex gap-2">
              {[['todos','Todos'],['em_andamento','Em andamento'],['concluido','Concluidos']].map(([v,l]) => (
                <button key={v} onClick={() => setFiltroStatus(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${filtroStatus === v ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>{l}</button>
              ))}
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm(FORM_VAZIO); }}>
              <Plus size={16} /> Adicionar curso
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
              <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar curso' : 'Novo curso'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Nome do curso</label>
                  <input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Estrategia de Instagram" />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluido</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>
                <div>
                  <label className="label">Instituicao / Plataforma</label>
                  <input className="input" value={form.instituicao} onChange={e => setForm({...form, instituicao: e.target.value})} placeholder="Ex: Hotmart, Udemy..." />
                </div>
                <div>
                  <label className="label">Categoria</label>
                  <input className="input" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} placeholder="Ex: Marketing, Design..." />
                </div>
                {form.status === 'em_andamento' ? (
                  <div>
                    <label className="label">Modulo / Aula atual</label>
                    <input className="input" value={form.modulo_atual} onChange={e => setForm({...form, modulo_atual: e.target.value})} placeholder="Ex: Modulo 3 - Aula 7" />
                  </div>
                ) : (
                  <div>
                    <label className="label">Data de conclusao</label>
                    <input className="input" type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="label">Avaliacao ({form.nota}/5)</label>
                  <input type="range" min="1" max="5" step="1" value={form.nota} onChange={e => setForm({...form, nota: Number(e.target.value)})} className="w-full mt-2 accent-[#486c96]" />
                </div>
                <div className="col-span-2">
                  <label className="label">Observacoes gerais / aprendizados</label>
                  <textarea className="input" rows={3} value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} placeholder="O que aprendi, como posso aplicar..." />
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
              <GraduationCap size={36} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum curso registrado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtrados.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-[#486c96]">{c.nome}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'em_andamento' ? 'bg-amber-100 text-amber-700' : c.status === 'pausado' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                            {c.status === 'em_andamento' ? 'Em andamento' : c.status === 'pausado' ? 'Pausado' : 'Concluido'}
                          </span>
                        </div>
                        {c.instituicao && <p className="text-xs text-gray-500 mb-1">{c.instituicao}</p>}
                        {c.modulo_atual && <p className="text-xs text-amber-600 font-semibold mb-1">📍 {c.modulo_atual}</p>}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {c.categoria && <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f9f1e7] text-[#486c96] font-semibold">{c.categoria}</span>}
                          {c.data && <span className="text-[10px] text-gray-400">{c.data}</span>}
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} fill={s <= c.nota ? '#486c96' : 'none'} className={s <= c.nota ? 'text-[#486c96]' : 'text-gray-300'} />
                          ))}
                        </div>
                        {c.observacoes && <p className="text-xs text-gray-500">{c.observacoes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setExpandido(expandido === c.id ? null : c.id)} className="text-[#486c96] hover:text-[#5f86ad]" title="Ver resumos">
                          {expandido === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button onClick={() => editar(c)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={14} /></button>
                        <button onClick={() => remover(c.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>

                  {expandido === c.id && (
                    <div className="border-t border-[#d2b99b]/20 bg-[#f9f1e7]/50 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-[#486c96] flex items-center gap-2"><BookOpen size={14} /> Resumo das partes importantes</h4>
                        <button type="button" onClick={() => setAdicionandoResumo(c.id)}
                          className="text-xs bg-[#486c96] text-white px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1">
                          <Plus size={11} /> Adicionar parte
                        </button>
                      </div>

                      {adicionandoResumo === c.id && (
                        <div className="bg-white rounded-xl p-4 mb-3 border border-[#d2b99b]/30">
                          <input className="input mb-2" placeholder="Nome da parte / modulo (ex: Modulo 2 - Reels)" value={novoResumo.parte} onChange={e => setNovoResumo({...novoResumo, parte: e.target.value})} />
                          <textarea className="input mb-2" rows={3} placeholder="Resumo dos pontos importantes..." value={novoResumo.texto} onChange={e => setNovoResumo({...novoResumo, texto: e.target.value})} />
                          <div className="flex gap-2">
                            <button className="btn-primary text-xs" onClick={() => adicionarResumo(c.id)}><Check size={12} className="inline mr-1" /> Salvar</button>
                            <button className="btn-secondary text-xs" onClick={() => setAdicionandoResumo(null)}><X size={12} className="inline mr-1" /> Cancelar</button>
                          </div>
                        </div>
                      )}

                      {(c.resumos || []).length === 0 && adicionandoResumo !== c.id && (
                        <p className="text-xs text-gray-400 italic">Nenhum resumo ainda. Adicione os pontos importantes de cada parte do curso.</p>
                      )}

                      <div className="space-y-3">
                        {(c.resumos || []).map(r => (
                          <div key={r.id} className="bg-white rounded-xl p-4 border border-[#d2b99b]/20">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="text-xs font-bold text-[#5f86ad]">{r.parte}</h5>
                              <button onClick={() => removerResumo(c.id, r.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0"><Trash2 size={11} /></button>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{r.texto}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {abaView === 'topicos' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Topicos que voce quer estudar — marque quando estudar e adicione um resumo.</p>
            <button className="btn-primary flex items-center gap-2" onClick={() => { setShowFormTopico(true); setEditTopicoId(null); setFormTopico({ titulo: '', resumo: '', prioridade: 'Media' }); }}>
              <Plus size={16} /> Novo topico
            </button>
          </div>

          {showFormTopico && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
              <h4 className="font-semibold text-[#486c96] mb-4">{editTopicoId ? 'Editar topico' : 'Novo topico'}</h4>
              <div className="space-y-3">
                <div>
                  <label className="label">Topico / Assunto</label>
                  <input className="input" value={formTopico.titulo} onChange={e => setFormTopico({...formTopico, titulo: e.target.value})} placeholder="Ex: Algoritmo do Instagram em 2025" />
                </div>
                <div>
                  <label className="label">Prioridade</label>
                  <select className="input" value={formTopico.prioridade} onChange={e => setFormTopico({...formTopico, prioridade: e.target.value})}>
                    <option>Alta</option><option>Media</option><option>Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="label">Resumo (preencha depois de estudar)</label>
                  <textarea className="input" rows={4} value={formTopico.resumo} onChange={e => setFormTopico({...formTopico, resumo: e.target.value})} placeholder="O que aprendi sobre esse topico..." />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={submitTopico}><Check size={16} className="inline mr-1" /> Salvar</button>
                <button className="btn-secondary" onClick={() => setShowFormTopico(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
              </div>
            </div>
          )}

          {topicos.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
              <BookOpen size={36} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum topico para estudar ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {['Alta','Media','Baixa'].map(prio => {
                const lista = topicos.filter(t => (t.prioridade || 'Media') === prio);
                if (lista.length === 0) return null;
                return (
                  <div key={prio}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Prioridade {prio}</h3>
                    {lista.map(t => (
                      <div key={t.id} className={`bg-white rounded-xl p-4 border shadow-sm mb-2 ${t.estudado ? 'border-green-200' : 'border-[#d2b99b]/30'}`}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleEstudado(t.id)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${t.estudado ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b]'}`}>
                            {t.estudado && <Check size={11} className="text-white" />}
                          </button>
                          <div className="flex-1">
                            <div className={`font-semibold text-sm mb-1 ${t.estudado ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.titulo}</div>
                            {t.resumo && <p className="text-xs text-gray-500 leading-relaxed">{t.resumo}</p>}
                            {!t.resumo && t.estudado && <p className="text-xs text-amber-500 italic">Estudado — adicione um resumo!</p>}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setFormTopico({ titulo: t.titulo, resumo: t.resumo || '', prioridade: t.prioridade || 'Media' }); setEditTopicoId(t.id); setShowFormTopico(true); }} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={13} /></button>
                            <button onClick={() => removerTopico(t.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
