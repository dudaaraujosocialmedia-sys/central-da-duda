import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, Trash2, Edit2, Check, X, BookOpen } from 'lucide-react';

const TIPOS = ['Livro', 'Podcast', 'Mentoria', 'Curso', 'Video', 'Artigo', 'Outro'];
const STATUS = [
  { id: 'quero',       label: 'Quero',        cor: 'bg-gray-100 text-gray-500 border-gray-200' },
  { id: 'andamento',   label: 'Em andamento',  cor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'concluido',   label: 'Concluido',     cor: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'pausado',     label: 'Pausado',       cor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
];

const FORM_VAZIO = { titulo: '', tipo: 'Livro', status: 'quero', autor: '', link: '', notas: '' };

export default function Aprendizado() {
  const [itens, setItens] = useState(() => getOrDefault('aprendizado', []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editId, setEditId] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const salvar = (lista) => { setItens(lista); set('aprendizado', lista); };

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

  const avancarStatus = (item) => {
    const ordem = STATUS.map(s => s.id);
    const idx = ordem.indexOf(item.status);
    const proximo = ordem[(idx + 1) % ordem.length];
    salvar(itens.map(i => i.id === item.id ? { ...i, status: proximo } : i));
  };

  const editar = (item) => {
    setForm({ titulo: item.titulo, tipo: item.tipo, status: item.status, autor: item.autor || '', link: item.link || '', notas: item.notas || '' });
    setEditId(item.id);
    setShowForm(true);
  };

  const filtrados = itens.filter(i => {
    if (filtroStatus !== 'todos' && i.status !== filtroStatus) return false;
    if (filtroTipo !== 'todos' && i.tipo !== filtroTipo) return false;
    return true;
  });

  const contagem = (sid) => itens.filter(i => i.status === sid).length;

  return (
    <div>
      <h1 className="page-title">Metas de Aprendizado</h1>
      <p className="text-sm text-gray-500 mb-5">Livros, podcasts, mentorias e tudo que voce quer consumir ou ja consumiu.</p>

      {/* Resumo por status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {STATUS.map(s => (
          <button key={s.id} onClick={() => setFiltroStatus(filtroStatus === s.id ? 'todos' : s.id)}
            className={`rounded-2xl p-4 border text-left transition-colors ${filtroStatus === s.id ? 'border-[#486c96] bg-[#486c96]/5' : 'bg-white border-[#d2b99b]/30'}`}>
            <div className="text-2xl font-bold text-[#486c96]">{contagem(s.id)}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filtros + botao */}
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <select className="input w-auto text-sm" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroStatus('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filtroStatus === 'todos' ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
            Todos
          </button>
          {STATUS.map(s => (
            <button key={s.id} onClick={() => setFiltroStatus(filtroStatus === s.id ? 'todos' : s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filtroStatus === s.id ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2 ml-auto flex-shrink-0"
          onClick={() => { setShowForm(true); setEditId(null); setForm(FORM_VAZIO); }}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar' : 'Novo item'}</h4>
          <div className="space-y-3">
            <div>
              <label className="label">Titulo</label>
              <input className="input" placeholder="Nome do livro, podcast, mentoria..." autoFocus
                value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Autor / fonte (opcional)</label>
              <input className="input" placeholder="Ex: Seth Godin, Podcast Naruhodo..."
                value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })} />
            </div>
            <div>
              <label className="label">Link (opcional)</label>
              <input className="input" placeholder="URL do Spotify, Amazon, YouTube..."
                value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
            </div>
            <div>
              <label className="label">Notas / aprendizados</label>
              <textarea className="input" rows={3}
                placeholder="O que voce aprendeu ou quer aprender com isso..."
                value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
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
          <BookOpen size={36} className="text-[#d2b99b] mx-auto mb-3" />
          <p className="text-gray-600 font-semibold mb-1">Nenhum item aqui</p>
          <p className="text-gray-400 text-sm">Adicione livros, podcasts e mentorias que quer consumir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(item => {
            const s = STATUS.find(x => x.id === item.status);
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-[#d2b99b]/30 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{item.titulo}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s?.cor}`}>{s?.label}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{item.tipo}</span>
                    </div>
                    {item.autor && <p className="text-xs text-gray-500 mb-1">{item.autor}</p>}
                    {item.notas && <p className="text-xs text-gray-600 leading-relaxed mt-1 border-l-2 border-[#d2b99b]/40 pl-2">{item.notas}</p>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer"
                        className="text-[10px] text-[#486c96] underline mt-1 inline-block">
                        {item.link.length > 50 ? item.link.slice(0, 50) + '...' : item.link}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => avancarStatus(item)} title="Avancar status"
                      className="text-[10px] px-2 py-1 rounded-lg border border-[#d2b99b]/40 text-[#486c96] hover:bg-[#f9f1e7] font-semibold">
                      {item.status === 'quero' ? 'Iniciar' : item.status === 'andamento' ? 'Concluir' : item.status === 'concluido' ? 'Pausar' : 'Reativar'}
                    </button>
                    <button onClick={() => editar(item)} className="text-[#486c96] hover:text-[#5f86ad] p-1"><Edit2 size={13} /></button>
                    <button onClick={() => salvar(itens.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-400 p-1"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
