import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { TrendingUp, Plus, Trash2, Check, X, Edit2, ExternalLink } from 'lucide-react';

const CATEGORIAS = ['Curso', 'Equipamento', 'Software', 'Servico', 'Outro'];
const PRIORIDADES = ['Alta', 'Media', 'Baixa'];

export default function Investimentos() {
  const [itens, setItens] = useState(() => getOrDefault('investimentos', []));
  const [filtro, setFiltro] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('padrao');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nome: '', link: '', preco: '', necessidade: '', categoria: 'Curso', prioridade: 'Media', comprado: false });

  const salvar = (lista) => { setItens(lista); set('investimentos', lista); };

  const submit = () => {
    if (!form.nome) return;
    const preco = parseFloat(String(form.preco).replace(',', '.')) || 0;
    if (editId) {
      salvar(itens.map(i => i.id === editId ? { ...form, id: editId, preco } : i));
      setEditId(null);
    } else {
      salvar([...itens, { ...form, id: Date.now(), preco }]);
    }
    setForm({ nome: '', link: '', preco: '', necessidade: '', categoria: 'Curso', prioridade: 'Media', comprado: false });
    setShowForm(false);
  };

  const toggleComprado = (id) => salvar(itens.map(i => i.id === id ? { ...i, comprado: !i.comprado } : i));
  const remover = (id) => salvar(itens.filter(i => i.id !== id));

  const editar = (item) => {
    setForm({ nome: item.nome, link: item.link || '', preco: item.preco != null ? String(item.preco) : '', necessidade: item.necessidade || item.descricao || '', categoria: item.categoria || 'Curso', prioridade: item.prioridade || 'Media', comprado: item.comprado });
    setEditId(item.id);
    setShowForm(true);
  };

  const ordemPrioridade = { Alta: 0, Media: 1, Baixa: 2 };
  const itensFiltrados = (filtro === 'todos' ? itens : filtro === 'pendentes' ? itens.filter(i => !i.comprado) : itens.filter(i => i.comprado))
    .slice()
    .sort((a, b) => {
      if (ordenacao === 'prioridade') return (ordemPrioridade[a.prioridade] ?? 2) - (ordemPrioridade[b.prioridade] ?? 2);
      if (ordenacao === 'preco_asc') return (a.preco || 0) - (b.preco || 0);
      if (ordenacao === 'preco_desc') return (b.preco || 0) - (a.preco || 0);
      if (ordenacao === 'status') return (a.comprado ? 1 : 0) - (b.comprado ? 1 : 0);
      return 0;
    });
  const totalPendente = itens.filter(i => !i.comprado).reduce((s, i) => s + (i.preco || 0), 0);
  const totalInvestido = itens.filter(i => i.comprado).reduce((s, i) => s + (i.preco || 0), 0);

  const corPrioridade = (p) => p === 'Alta' ? 'bg-red-100 text-red-700' : p === 'Media' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  return (
    <div>
      <h1 className="page-title">Investimentos</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">A investir (pendente)</div>
          <div className="text-2xl font-bold text-[#486c96]">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-400 mt-1">{itens.filter(i => !i.comprado).length} itens</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Ja investido</div>
          <div className="text-2xl font-bold text-green-600">R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-400 mt-1">{itens.filter(i => i.comprado).length} itens</div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['todos', 'pendentes', 'comprados'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors capitalize ${filtro === f ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
            {f}
          </button>
        ))}
        <select className="input text-xs py-1.5 px-2 w-auto" value={ordenacao} onChange={e => setOrdenacao(e.target.value)}>
          <option value="padrao">Ordenar: Padrao</option>
          <option value="prioridade">Prioridade</option>
          <option value="preco_asc">Preco: menor</option>
          <option value="preco_desc">Preco: maior</option>
          <option value="status">Status</option>
        </select>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm({ nome: '', link: '', preco: '', necessidade: '', categoria: 'Curso', prioridade: 'Media', comprado: false }); }}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar item' : 'Novo investimento'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Nome</label>
              <input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Tripé profissional, Curso de Reels..." />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select className="input" value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Preco (R$)</label>
              <input className="input" type="number" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} placeholder="0,00" />
            </div>
            <div>
              <label className="label">Link</label>
              <input className="input" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className="label">Por que preciso / necessidade</label>
              <textarea className="input" rows={2} value={form.necessidade} onChange={e => setForm({...form, necessidade: e.target.value})} placeholder="Descreva a necessidade..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={submit}><Check size={16} className="inline mr-1" /> Salvar</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {itensFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
            <TrendingUp size={36} className="text-[#d2b99b] mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhum investimento cadastrado</p>
          </div>
        ) : itensFiltrados.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-4 ${item.comprado ? 'border-green-200' : 'border-[#d2b99b]/30'}`}>
            <button
              onClick={() => toggleComprado(item.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${item.comprado ? 'bg-green-500 border-green-500' : 'border-[#486c96] hover:border-green-500'}`}
            >
              {item.comprado && <Check size={12} className="text-white" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-sm font-bold text-[#486c96] ${item.comprado ? 'line-through opacity-60' : ''}`}>{item.nome}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f9f1e7] text-[#486c96] font-semibold">{item.categoria}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${corPrioridade(item.prioridade)}`}>{item.prioridade}</span>
              </div>
              {item.necessidade && <p className="text-xs text-gray-500 mb-1">{item.necessidade}</p>}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#486c96]">R$ {(item.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-[#5f86ad] flex items-center gap-1 hover:underline">
                    <ExternalLink size={10} /> Ver link
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editar(item)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={14} /></button>
              <button onClick={() => remover(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
