import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Target, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';

const PERIODOS = ['Mensal', '6 meses', '1 ano'];

export default function Metas() {
  const [metas, setMetas] = useState(() => getOrDefault('metas', []));
  const [aba, setAba] = useState('Mensal');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ titulo: '', descricao: '', progresso: 0, periodo: 'Mensal', concluida: false });

  const salvar = (lista) => { setMetas(lista); set('metas', lista); };

  const submit = () => {
    if (!form.titulo) return;
    if (editId) {
      salvar(metas.map(m => m.id === editId ? { ...form, id: editId } : m));
      setEditId(null);
    } else {
      salvar([...metas, { ...form, id: Date.now() }]);
    }
    setForm({ titulo: '', descricao: '', progresso: 0, periodo: aba, concluida: false });
    setShowForm(false);
  };

  const editar = (m) => {
    setForm({ titulo: m.titulo, descricao: m.descricao || '', progresso: m.progresso || 0, periodo: m.periodo, concluida: m.concluida });
    setEditId(m.id);
    setAba(m.periodo);
    setShowForm(true);
  };

  const remover = (id) => salvar(metas.filter(m => m.id !== id));

  const toggleConcluida = (id) => {
    salvar(metas.map(m => m.id === id ? { ...m, concluida: !m.concluida } : m));
  };

  const updateProgresso = (id, val) => {
    salvar(metas.map(m => m.id === id ? { ...m, progresso: Number(val) } : m));
  };

  const metasFiltradas = metas.filter(m => m.periodo === aba);

  return (
    <div>
      <h1 className="page-title">Metas</h1>

      <div className="flex gap-2 mb-6">
        {PERIODOS.map(p => (
          <button
            key={p}
            onClick={() => setAba(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${aba === p ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}
          >
            {p}
          </button>
        ))}
        <button
          className="btn-primary ml-auto flex items-center gap-2"
          onClick={() => { setShowForm(true); setEditId(null); setForm({ titulo: '', descricao: '', progresso: 0, periodo: aba, concluida: false }); }}
        >
          <Plus size={16} /> Nova meta
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar meta' : 'Nova meta'}</h4>
          <div className="space-y-3">
            <div>
              <label className="label">Titulo da meta</label>
              <input className="input" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Fechar 2 novos clientes" />
            </div>
            <div>
              <label className="label">Descricao / como vou alcancar</label>
              <textarea className="input" rows={3} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Detalhes..." />
            </div>
            <div>
              <label className="label">Periodo</label>
              <select className="input" value={form.periodo} onChange={e => setForm({...form, periodo: e.target.value})}>
                {PERIODOS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Progresso: {form.progresso}%</label>
              <input type="range" min="0" max="100" value={form.progresso} onChange={e => setForm({...form, progresso: Number(e.target.value)})} className="w-full accent-[#486c96]" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={submit}><Check size={16} className="inline mr-1" /> Salvar</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
          </div>
        </div>
      )}

      {metasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
          <Target size={36} className="text-[#d2b99b] mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nenhuma meta para este periodo ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {metasFiltradas.map(meta => (
            <div key={meta.id} className={`bg-white rounded-2xl p-5 border shadow-sm ${meta.concluida ? 'border-green-200 opacity-75' : 'border-[#d2b99b]/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => toggleConcluida(meta.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${meta.concluida ? 'bg-green-500 border-green-500' : 'border-[#486c96]'}`}>
                      {meta.concluida && <Check size={10} className="text-white" />}
                    </button>
                    <h3 className={`font-bold text-[#486c96] ${meta.concluida ? 'line-through opacity-60' : ''}`}>{meta.titulo}</h3>
                  </div>
                  {meta.descricao && <p className="text-sm text-gray-500 ml-7 mb-3">{meta.descricao}</p>}
                  <div className="ml-7">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progresso</span>
                      <span className="font-bold text-[#486c96]">{meta.progresso || 0}%</span>
                    </div>
                    <div className="w-full bg-[#f9f1e7] rounded-full h-2 mb-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${meta.progresso || 0}%`, background: meta.concluida ? '#22c55e' : '#486c96' }} />
                    </div>
                    <input
                      type="range" min="0" max="100" value={meta.progresso || 0}
                      onChange={e => updateProgresso(meta.id, e.target.value)}
                      className="w-full accent-[#486c96]"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editar(meta)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={14} /></button>
                  <button onClick={() => remover(meta.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
