import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Lightbulb, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CATEGORIAS = ['Estrategia', 'Conteudo', 'Cliente', 'Negocio', 'Pessoal', 'Outro'];

export default function Insights() {
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

  return (
    <div>
      <h1 className="page-title">Insights</h1>

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
    </div>
  );
}
