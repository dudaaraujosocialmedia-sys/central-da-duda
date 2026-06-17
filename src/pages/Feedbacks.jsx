import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, Trash2, Edit2, Heart, X, Check } from 'lucide-react';

const TIPOS = [
  { id: 'elogio',    label: 'Elogio',    borda: 'border-yellow-100', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { id: 'resultado', label: 'Resultado', borda: 'border-green-100',  badge: 'bg-green-50 text-green-700 border-green-200'  },
  { id: 'indicacao', label: 'Indicacao', borda: 'border-blue-100',   badge: 'bg-blue-50 text-blue-700 border-blue-200'    },
  { id: 'outro',     label: 'Outro',     borda: 'border-[#d2b99b]/30', badge: 'bg-gray-50 text-gray-600 border-gray-200'  },
];

const FORM_VAZIO = { cliente_id: '', tipo: 'elogio', texto: '', data: new Date().toISOString().split('T')[0], autor: '' };

export default function Feedbacks() {
  const clientes = getOrDefault('clientes', []);
  const [feedbacks, setFeedbacks] = useState(() => getOrDefault('feedbacks', []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editId, setEditId] = useState(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const salvar = (lista) => { setFeedbacks(lista); set('feedbacks', lista); };

  const submit = () => {
    if (!form.texto) return;
    if (editId) {
      salvar(feedbacks.map(f => f.id === editId ? { ...form, id: editId } : f));
      setEditId(null);
    } else {
      salvar([{ ...form, id: Date.now() }, ...feedbacks]);
    }
    setForm(FORM_VAZIO);
    setShowForm(false);
  };

  const editar = (item) => {
    setForm({ cliente_id: item.cliente_id || '', tipo: item.tipo, texto: item.texto, data: item.data, autor: item.autor || '' });
    setEditId(item.id);
    setShowForm(true);
  };

  const nomeCliente = (id) => clientes.find(c => String(c.id) === String(id))?.nome || '';

  const filtrados = feedbacks.filter(f => {
    if (filtroCliente && String(f.cliente_id) !== filtroCliente) return false;
    if (filtroTipo !== 'todos' && f.tipo !== filtroTipo) return false;
    return true;
  });

  return (
    <div>
      <h1 className="page-title">Feedbacks & Depoimentos</h1>
      <p className="text-sm text-gray-500 mb-5">Guarde elogios, resultados e indicacoes. Nos momentos de duvida, volte aqui.</p>

      {/* Filtros + botão */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <select className="input w-auto text-sm" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}>
          <option value="">Todos os clientes</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filtroTipo === 'todos' ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
            Todos
          </button>
          {TIPOS.map(t => (
            <button key={t.id} onClick={() => setFiltroTipo(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filtroTipo === t.id ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2 ml-auto flex-shrink-0"
          onClick={() => { setShowForm(true); setEditId(null); setForm(FORM_VAZIO); }}>
          <Plus size={16} /> Novo feedback
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar' : 'Novo feedback'}</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cliente</label>
                <select className="input" value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                  <option value="">— Geral —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Data</label>
                <input className="input" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Tipo</label>
              <div className="flex gap-2 flex-wrap">
                {TIPOS.map(t => (
                  <button key={t.id} type="button" onClick={() => setForm({ ...form, tipo: t.id })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.tipo === t.id ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-gray-600 border-[#d2b99b]/40'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">De quem / plataforma (opcional)</label>
              <input className="input" placeholder="Ex: Cliente pelo WhatsApp, Story marcado, Google..."
                value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })} />
            </div>
            <div>
              <label className="label">Texto do feedback</label>
              <textarea className="input" rows={4}
                placeholder="Cole a mensagem, escreva o elogio ou descreva o resultado obtido..."
                value={form.texto} onChange={e => setForm({ ...form, texto: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={submit}><Check size={14} className="inline mr-1" /> Salvar</button>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}><X size={14} className="inline mr-1" /> Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
          <Heart size={36} className="text-[#d2b99b] mx-auto mb-3" />
          <p className="text-gray-600 font-semibold mb-1">Nenhum feedback ainda</p>
          <p className="text-gray-400 text-sm">Comece guardando o proximo elogio ou resultado de cliente</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-4">
          {filtrados.map(item => {
            const tipo = TIPOS.find(t => t.id === item.tipo);
            const nome = nomeCliente(item.cliente_id);
            return (
              <div key={item.id} className={`bg-white rounded-2xl p-5 border shadow-sm break-inside-avoid mb-4 ${tipo?.borda}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tipo?.badge}`}>
                      {tipo?.label}
                    </span>
                    {nome && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#486c96]/10 text-[#486c96] font-semibold">{nome}</span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => editar(item)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={13} /></button>
                    <button onClick={() => salvar(feedbacks.filter(f => f.id !== item.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{item.texto}"</p>
                <div className="flex items-center justify-between mt-3 gap-2">
                  {item.autor && <p className="text-[10px] text-gray-400">— {item.autor}</p>}
                  <p className="text-[10px] text-gray-400 ml-auto">
                    {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
