import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, Trash2, Edit2, Check, X, ExternalLink, Bookmark } from 'lucide-react';

const CATEGORIAS = ['Feed', 'Reels', 'Stories', 'Carrossel', 'Copy', 'Identidade visual', 'Campanha', 'Perfil', 'Outro'];

const FORM_VAZIO = {
  titulo: '',
  link: '',
  categoria: 'Feed',
  nota: '',
  data: new Date().toISOString().split('T')[0],
};

export default function Referencias() {
  const [itens, setItens] = useState(() => getOrDefault('referencias', []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editId, setEditId] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busca, setBusca] = useState('');

  const salvar = (lista) => { setItens(lista); set('referencias', lista); };

  const submit = () => {
    if (!form.titulo) return;
    if (editId) {
      salvar(itens.map(i => i.id === editId ? { ...form, id: editId } : i));
      setEditId(null);
    } else {
      salvar([{ ...form, id: Date.now() }, ...itens]);
    }
    setForm(FORM_VAZIO);
    setShowForm(false);
  };

  const editar = (item) => {
    setForm({ titulo: item.titulo, link: item.link || '', categoria: item.categoria, nota: item.nota || '', data: item.data });
    setEditId(item.id);
    setShowForm(true);
  };

  const filtrados = itens.filter(i => {
    if (filtroCategoria !== 'todas' && i.categoria !== filtroCategoria) return false;
    if (busca && !i.titulo.toLowerCase().includes(busca.toLowerCase()) && !(i.nota || '').toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const contPorCategoria = (cat) => itens.filter(i => i.categoria === cat).length;

  return (
    <div>
      <h1 className="page-title">Banco de Referencias</h1>
      <p className="text-sm text-gray-500 mb-5">Salve perfis, posts e campanhas que te inspiram. Organize por categoria.</p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input className="input w-48 text-sm" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
        <div className="flex gap-1.5 flex-wrap flex-1">
          <button onClick={() => setFiltroCategoria('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filtroCategoria === 'todas' ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
            Todas
          </button>
          {CATEGORIAS.filter(c => contPorCategoria(c) > 0 || filtroCategoria === c).map(cat => (
            <button key={cat} onClick={() => setFiltroCategoria(filtroCategoria === cat ? 'todas' : cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filtroCategoria === cat ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
              {cat} {contPorCategoria(cat) > 0 && <span className="opacity-60">({contPorCategoria(cat)})</span>}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2 flex-shrink-0"
          onClick={() => { setShowForm(true); setEditId(null); setForm(FORM_VAZIO); }}>
          <Plus size={16} /> Salvar referencia
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar referencia' : 'Nova referencia'}</h4>
          <div className="space-y-3">
            <div>
              <label className="label">Titulo / descricao</label>
              <input className="input" autoFocus placeholder="Ex: Feed da @dudaaraujo, Campanha do Nubank no dia das maes..."
                value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Data</label>
                <input className="input" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Link (opcional)</label>
              <input className="input" placeholder="URL do post, perfil ou campanha"
                value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
            </div>
            <div>
              <label className="label">Por que voce salvou / o que te inspirou</label>
              <textarea className="input" rows={3}
                placeholder="Ex: O ritmo do corte nos reels, a paleta de cores usada, o hook de abertura..."
                value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} />
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
          <Bookmark size={36} className="text-[#d2b99b] mx-auto mb-3" />
          <p className="text-gray-600 font-semibold mb-1">Nenhuma referencia salva</p>
          <p className="text-gray-400 text-sm">Salve perfis, posts e campanhas que te inspiram para consultar quando precisar.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-4">
          {filtrados.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm break-inside-avoid mb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#486c96]/10 text-[#486c96] border border-[#486c96]/20">
                    {item.categoria}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => editar(item)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={13} /></button>
                  <button onClick={() => salvar(itens.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>

              <p className="font-semibold text-gray-800 text-sm mb-2">{item.titulo}</p>

              {item.nota && (
                <p className="text-xs text-gray-600 leading-relaxed border-l-2 border-[#d2b99b]/40 pl-2 mb-2">{item.nota}</p>
              )}

              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#486c96] hover:underline mt-1">
                  <ExternalLink size={10} />
                  {item.link.length > 55 ? item.link.slice(0, 55) + '...' : item.link}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
