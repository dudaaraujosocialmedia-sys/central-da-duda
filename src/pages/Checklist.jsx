import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, Trash2, Check, RefreshCw, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FREQUENCIAS = ['Diario', 'Semanal', 'Quinzenal', 'Mensal'];
const COR_PERIODOS = ['#486c96','#5f86ad','#d2b99b','#e879a0','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

export default function Checklist() {
  const [aba, setAba] = useState('diario');
  const [mensal, setMensal] = useState(() => getOrDefault('checklist_mensal', []));
  const [semanal, setSemanal] = useState(() => getOrDefault('checklist_semanal', []));
  const [diario, setDiario] = useState(() => getOrDefault('checklist_diario', []));
  const [recorrentes, setRecorrentes] = useState(() => getOrDefault('tarefas_recorrentes', []));
  const [showForm, setShowForm] = useState(false);
  const [formMensal, setFormMensal] = useState('');
  const [formSemanal, setFormSemanal] = useState('');
  const [formDiario, setFormDiario] = useState('');
  const [formRec, setFormRec] = useState({ titulo: '', frequencia: 'Diario' });

  const salvarMensal = (l) => { setMensal(l); set('checklist_mensal', l); };
  const salvarSemanal = (l) => { setSemanal(l); set('checklist_semanal', l); };
  const salvarDiario = (l) => { setDiario(l); set('checklist_diario', l); };
  const salvarRec = (l) => { setRecorrentes(l); set('tarefas_recorrentes', l); };

  const adicionarMensal = () => {
    if (!formMensal.trim()) return;
    const nova = { id: Date.now(), titulo: formMensal, concluida: false };
    salvarMensal([...mensal, nova]);
    salvarDiario([...diario, { ...nova, id: Date.now() + 1, origem: 'mensal' }]);
    setFormMensal('');
  };

  const adicionarSemanal = () => {
    if (!formSemanal.trim()) return;
    const nova = { id: Date.now(), titulo: formSemanal, concluida: false };
    salvarSemanal([...semanal, nova]);
    setFormSemanal('');
  };

  const adicionarDiario = () => {
    if (!formDiario.trim()) return;
    salvarDiario([...diario, { id: Date.now(), titulo: formDiario, concluida: false }]);
    setFormDiario('');
  };

  const adicionarRecorrente = () => {
    if (!formRec.titulo.trim()) return;
    salvarRec([...recorrentes, { ...formRec, id: Date.now() }]);
    setFormRec({ titulo: '', frequencia: 'Diario' });
    setShowForm(false);
  };

  const toggleMensal = (id) => salvarMensal(mensal.map(t => t.id === id ? {...t, concluida: !t.concluida} : t));
  const toggleSemanal = (id) => salvarSemanal(semanal.map(t => t.id === id ? {...t, concluida: !t.concluida} : t));
  const toggleDiario = (id) => salvarDiario(diario.map(t => t.id === id ? {...t, concluida: !t.concluida} : t));
  const removerMensal = (id) => salvarMensal(mensal.filter(t => t.id !== id));
  const removerSemanal = (id) => salvarSemanal(semanal.filter(t => t.id !== id));
  const removerDiario = (id) => salvarDiario(diario.filter(t => t.id !== id));
  const removerRec = (id) => salvarRec(recorrentes.filter(t => t.id !== id));

  const resetarDiario = () => salvarDiario(diario.map(t => ({...t, concluida: false})));
  const resetarSemanal = () => salvarSemanal(semanal.map(t => ({...t, concluida: false})));

  const concluidasDiario = diario.filter(t => t.concluida).length;
  const concluidasSemanal = semanal.filter(t => t.concluida).length;

  const [processosPeriodos, setProcessosPeriodos] = useState(() => getOrDefault('processos_periodos', []));
  const [showFormPeriodo, setShowFormPeriodo] = useState(false);
  const [formPeriodo, setFormPeriodo] = useState({ nome: '', dia_inicio: '', dia_fim: '', cor: '#486c96', tarefas: [] });
  const [editPeriodoId, setEditPeriodoId] = useState(null);
  const [expandidoPeriodo, setExpandidoPeriodo] = useState(null);
  const [novaTarefaPeriodo, setNovaTarefaPeriodo] = useState('');
  const clientes = getOrDefault('clientes', []);
  const diaHoje = new Date().getDate();

  const salvarPeriodos = (l) => { setProcessosPeriodos(l); set('processos_periodos', l); };

  const submitPeriodo = () => {
    if (!formPeriodo.nome) return;
    if (editPeriodoId) {
      salvarPeriodos(processosPeriodos.map(p => p.id === editPeriodoId ? { ...formPeriodo, id: editPeriodoId } : p));
      setEditPeriodoId(null);
    } else {
      salvarPeriodos([...processosPeriodos, { ...formPeriodo, id: Date.now(), tarefas: [] }]);
    }
    setFormPeriodo({ nome: '', dia_inicio: '', dia_fim: '', cor: '#486c96', tarefas: [] });
    setShowFormPeriodo(false);
  };

  const toggleTarefaPeriodo = (periodoId, tarefaId) => {
    salvarPeriodos(processosPeriodos.map(p => p.id === periodoId
      ? { ...p, tarefas: p.tarefas.map(t => t.id === tarefaId ? { ...t, concluida: !t.concluida } : t) }
      : p
    ));
  };

  const adicionarTarefaPeriodo = (periodoId) => {
    if (!novaTarefaPeriodo.trim()) return;
    salvarPeriodos(processosPeriodos.map(p => p.id === periodoId
      ? { ...p, tarefas: [...p.tarefas, { id: Date.now(), titulo: novaTarefaPeriodo, concluida: false }] }
      : p
    ));
    setNovaTarefaPeriodo('');
  };

  const removerTarefaPeriodo = (periodoId, tarefaId) => {
    salvarPeriodos(processosPeriodos.map(p => p.id === periodoId
      ? { ...p, tarefas: p.tarefas.filter(t => t.id !== tarefaId) }
      : p
    ));
  };

  const removerPeriodo = (id) => salvarPeriodos(processosPeriodos.filter(p => p.id !== id));

  const periodoAtivo = (p) => {
    const di = parseInt(p.dia_inicio);
    const df = parseInt(p.dia_fim);
    if (!di || !df) return false;
    if (di <= df) return diaHoje >= di && diaHoje <= df;
    return diaHoje >= di || diaHoje <= df;
  };

  const abas = [
    { id: 'diario', label: 'Diario' },
    { id: 'semanal', label: 'Semanal' },
    { id: 'mensal', label: 'Mensal' },
    { id: 'processos', label: 'Processos' },
    { id: 'recorrentes', label: 'Recorrentes' },
  ];

  const ItemChecklist = ({ t, onToggle, onRemover, badge }) => (
    <div className={`bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center gap-3 ${t.concluida ? 'border-green-200' : 'border-[#d2b99b]/30'}`}>
      <button onClick={() => onToggle(t.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.concluida ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b]'}`}>
        {t.concluida && <Check size={11} className="text-white" />}
      </button>
      <span className={`flex-1 text-sm ${t.concluida ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.titulo}</span>
      {badge && <span className="text-[10px] bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
      <button onClick={() => onRemover(t.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Checklist</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {abas.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${aba === a.id ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'diario' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-[#486c96]">
                  {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{concluidasDiario} de {diario.length} concluidas</p>
              </div>
              <button className="btn-secondary flex items-center gap-1 text-xs" onClick={resetarDiario}>
                <RefreshCw size={12} /> Resetar
              </button>
            </div>
            {diario.length > 0 && (
              <div className="w-full bg-[#f9f1e7] rounded-full h-2 mb-4">
                <div className="h-2 rounded-full bg-[#486c96] transition-all" style={{ width: `${diario.length > 0 ? (concluidasDiario / diario.length) * 100 : 0}%` }} />
              </div>
            )}
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Adicionar tarefa de hoje..." value={formDiario} onChange={e => setFormDiario(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarDiario()} />
              <button className="btn-primary px-3" onClick={adicionarDiario}><Plus size={16} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {diario.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">Nenhuma tarefa para hoje</div>
            ) : diario.map(t => <ItemChecklist key={t.id} t={t} onToggle={toggleDiario} onRemover={removerDiario} badge={t.origem === 'mensal' ? 'Mensal' : null} />)}
          </div>
        </div>
      )}

      {aba === 'semanal' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-[#486c96]">
                  Semana de {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{concluidasSemanal} de {semanal.length} concluidas</p>
              </div>
              <button className="btn-secondary flex items-center gap-1 text-xs" onClick={resetarSemanal}>
                <RefreshCw size={12} /> Resetar semana
              </button>
            </div>
            {semanal.length > 0 && (
              <div className="w-full bg-[#f9f1e7] rounded-full h-2 mb-4">
                <div className="h-2 rounded-full bg-[#5f86ad] transition-all" style={{ width: `${semanal.length > 0 ? (concluidasSemanal / semanal.length) * 100 : 0}%` }} />
              </div>
            )}
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Adicionar tarefa da semana..." value={formSemanal} onChange={e => setFormSemanal(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarSemanal()} />
              <button className="btn-primary px-3" onClick={adicionarSemanal}><Plus size={16} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {semanal.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">Nenhuma tarefa para esta semana</div>
            ) : semanal.map(t => <ItemChecklist key={t.id} t={t} onToggle={toggleSemanal} onRemover={removerSemanal} />)}
          </div>
        </div>
      )}

      {aba === 'mensal' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-5">
            <p className="text-xs text-gray-400 mb-3">Tarefas do checklist mensal sao adicionadas automaticamente ao diario</p>
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Nova tarefa mensal..." value={formMensal} onChange={e => setFormMensal(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarMensal()} />
              <button className="btn-primary px-3" onClick={adicionarMensal}><Plus size={16} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {mensal.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">Nenhuma tarefa mensal</div>
            ) : mensal.map(t => <ItemChecklist key={t.id} t={t} onToggle={toggleMensal} onRemover={removerMensal} />)}
          </div>
        </div>
      )}

      {aba === 'processos' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Processos recorrentes por periodo do mes — ex: dia 29 ao dia 3 = planejamento de todos os clientes.</p>
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={() => { setShowFormPeriodo(true); setEditPeriodoId(null); setFormPeriodo({ nome: '', dia_inicio: '', dia_fim: '', cor: '#486c96', tarefas: [] }); }}>
              <Plus size={16} /> Novo periodo
            </button>
          </div>

          {showFormPeriodo && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
              <h4 className="font-semibold text-[#486c96] mb-4">{editPeriodoId ? 'Editar periodo' : 'Novo periodo de processos'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Nome do periodo</label>
                  <input className="input" value={formPeriodo.nome} onChange={e => setFormPeriodo({...formPeriodo, nome: e.target.value})} placeholder="Ex: Planejamento mensal dos clientes" />
                </div>
                <div>
                  <label className="label">Dia de inicio</label>
                  <input className="input" type="number" min="1" max="31" value={formPeriodo.dia_inicio} onChange={e => setFormPeriodo({...formPeriodo, dia_inicio: e.target.value})} placeholder="Ex: 29" />
                </div>
                <div>
                  <label className="label">Dia de fim</label>
                  <input className="input" type="number" min="1" max="31" value={formPeriodo.dia_fim} onChange={e => setFormPeriodo({...formPeriodo, dia_fim: e.target.value})} placeholder="Ex: 3" />
                </div>
                <div className="col-span-2">
                  <label className="label">Cor de identificacao</label>
                  <div className="flex gap-2 flex-wrap">
                    {COR_PERIODOS.map(cor => (
                      <button type="button" key={cor} onClick={() => setFormPeriodo({...formPeriodo, cor})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${formPeriodo.cor === cor ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ background: cor }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={submitPeriodo}><Check size={16} className="inline mr-1" /> Salvar</button>
                <button className="btn-secondary" onClick={() => setShowFormPeriodo(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {processosPeriodos.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">
              Nenhum periodo cadastrado. Crie periodos como "Planejamento (dia 29 ao 3)" ou "Metricas (dia 1 ao 5)".
            </div>
          ) : (
            <div className="space-y-4">
              {processosPeriodos.map(p => {
                const ativo = periodoAtivo(p);
                const concluidas = (p.tarefas || []).filter(t => t.concluida).length;
                const total = (p.tarefas || []).length;
                return (
                  <div key={p.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${ativo ? 'border-2' : 'border-[#d2b99b]/30'}`} style={ativo ? { borderColor: p.cor } : {}}>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: p.cor }} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#486c96]">{p.nome}</span>
                            {p.dia_inicio && p.dia_fim && (
                              <span className="text-xs text-gray-400">dia {p.dia_inicio} ao dia {p.dia_fim}</span>
                            )}
                            {ativo && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: p.cor }}>Ativo agora</span>}
                          </div>
                          {total > 0 && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 bg-[#f9f1e7] rounded-full h-1.5">
                                <div className="h-1.5 rounded-full transition-all" style={{ width: `${total > 0 ? (concluidas/total)*100 : 0}%`, background: p.cor }} />
                              </div>
                              <span className="text-[10px] text-gray-400">{concluidas}/{total}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setExpandidoPeriodo(expandidoPeriodo === p.id ? null : p.id)} className="text-[#486c96]">
                            {expandidoPeriodo === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button onClick={() => { setFormPeriodo({ nome: p.nome, dia_inicio: p.dia_inicio, dia_fim: p.dia_fim, cor: p.cor, tarefas: p.tarefas || [] }); setEditPeriodoId(p.id); setShowFormPeriodo(true); }} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={14} /></button>
                          <button onClick={() => removerPeriodo(p.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>

                    {expandidoPeriodo === p.id && (
                      <div className="border-t border-[#d2b99b]/20 bg-[#f9f1e7]/40 p-4">
                        <div className="space-y-2 mb-3">
                          {(p.tarefas || []).map(t => (
                            <div key={t.id} className={`bg-white rounded-xl px-3 py-2.5 border shadow-sm flex items-center gap-3 ${t.concluida ? 'border-green-200' : 'border-[#d2b99b]/20'}`}>
                              <button onClick={() => toggleTarefaPeriodo(p.id, t.id)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${t.concluida ? 'border-[#486c96]' : 'border-[#d2b99b]'}`}
                                style={t.concluida ? { background: p.cor, borderColor: p.cor } : {}}>
                                {t.concluida && <Check size={11} className="text-white" />}
                              </button>
                              <span className={`flex-1 text-sm ${t.concluida ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.titulo}</span>
                              <button onClick={() => removerTarefaPeriodo(p.id, t.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input className="input flex-1 text-sm" placeholder="Nova tarefa deste periodo..." value={novaTarefaPeriodo} onChange={e => setNovaTarefaPeriodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarTarefaPeriodo(p.id)} />
                          <button className="btn-primary px-3" onClick={() => adicionarTarefaPeriodo(p.id)}><Plus size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {aba === 'recorrentes' && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Nova tarefa recorrente
            </button>
          </div>
          {showForm && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tarefa</label>
                  <input className="input" value={formRec.titulo} onChange={e => setFormRec({...formRec, titulo: e.target.value})} placeholder="Ex: Postar stories" />
                </div>
                <div>
                  <label className="label">Frequencia</label>
                  <select className="input" value={formRec.frequencia} onChange={e => setFormRec({...formRec, frequencia: e.target.value})}>
                    {FREQUENCIAS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn-primary" onClick={adicionarRecorrente}><Check size={14} className="inline mr-1" />Salvar</button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {recorrentes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">Nenhuma tarefa recorrente</div>
            ) : recorrentes.map(t => (
              <div key={t.id} className="bg-white rounded-xl px-4 py-3 border border-[#d2b99b]/30 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#486c96]" />
                <span className="flex-1 text-sm text-gray-700">{t.titulo}</span>
                <span className="text-xs bg-[#f9f1e7] text-[#486c96] px-2 py-1 rounded-full font-semibold">{t.frequencia}</span>
                <button onClick={() => removerRec(t.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
