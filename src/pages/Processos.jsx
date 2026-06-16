import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { BookOpen, Plus, Trash2, Check, X, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

const PROCESSOS_PADRAO = [
  {
    id: 1,
    titulo: 'Onboarding de novo cliente',
    categoria: 'Cliente',
    passos: [
      'Enviar contrato para assinatura',
      'Solicitar acesso as redes sociais',
      'Fazer reuniao de alinhamento (briefing)',
      'Criar pasta do cliente no Google Drive',
      'Fazer analise de perfil e concorrentes',
      'Apresentar planejamento do primeiro mes',
      'Enviar boas-vindas oficial',
    ]
  },
  {
    id: 2,
    titulo: 'Fluxo mensal de conteudo',
    categoria: 'Producao',
    passos: [
      'Dias 1-4: Relatorio de metricas do mes anterior',
      'Dias 5-7: Planejamento de conteudo do mes',
      'Dias 8-10: Apresentar planejamento ao cliente',
      'Dias 11-20: Captacao e producao de conteudo',
      'Dias 21-25: Agendamento de posts',
      'Dias 26-30: Monitoramento e interacao',
    ]
  },
];

export default function Processos() {
  const [processos, setProcessos] = useState(() => getOrDefault('processos', PROCESSOS_PADRAO));
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ titulo: '', categoria: '', passos: [''] });
  const [expandidos, setExpandidos] = useState({});
  const [busca, setBusca] = useState('');

  const salvar = (lista) => { setProcessos(lista); set('processos', lista); };

  const toggleExpandido = (id) => setExpandidos(e => ({ ...e, [id]: !e[id] }));

  const adicionarPasso = () => setForm(f => ({ ...f, passos: [...f.passos, ''] }));
  const atualizarPasso = (i, val) => setForm(f => ({ ...f, passos: f.passos.map((p, idx) => idx === i ? val : p) }));
  const removerPasso = (i) => setForm(f => ({ ...f, passos: f.passos.filter((_, idx) => idx !== i) }));

  const submit = () => {
    if (!form.titulo) return;
    const passosFiltrados = form.passos.filter(p => p.trim());
    if (editId) {
      salvar(processos.map(p => p.id === editId ? { ...form, passos: passosFiltrados, id: editId } : p));
      setEditId(null);
    } else {
      salvar([...processos, { ...form, passos: passosFiltrados, id: Date.now() }]);
    }
    setForm({ titulo: '', categoria: '', passos: [''] });
    setShowForm(false);
  };

  const editar = (p) => {
    setForm({ titulo: p.titulo, categoria: p.categoria || '', passos: [...p.passos] });
    setEditId(p.id);
    setShowForm(true);
  };

  const remover = (id) => salvar(processos.filter(p => p.id !== id));

  const filtrados = processos.filter(p =>
    p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Processos</h1>

      <div className="flex gap-3 mb-5">
        <input className="input flex-1" placeholder="Buscar processo..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm({ titulo: '', categoria: '', passos: [''] }); }}>
          <Plus size={16} /> Novo processo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar processo' : 'Novo processo'}</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Titulo do processo</label>
                <input className="input" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Onboarding de cliente" />
              </div>
              <div>
                <label className="label">Categoria</label>
                <input className="input" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} placeholder="Ex: Cliente, Producao..." />
              </div>
            </div>
            <div>
              <label className="label">Passos do processo</label>
              <div className="space-y-2">
                {form.passos.map((passo, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="w-5 h-5 rounded-full bg-[#486c96] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <input
                      className="input flex-1"
                      value={passo}
                      onChange={e => atualizarPasso(i, e.target.value)}
                      placeholder={`Passo ${i + 1}...`}
                    />
                    <button onClick={() => removerPasso(i)} className="text-gray-300 hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <button className="mt-2 text-xs text-[#486c96] hover:underline flex items-center gap-1" onClick={adicionarPasso}>
                <Plus size={12} /> Adicionar passo
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={submit}><Check size={16} className="inline mr-1" /> Salvar</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
            <BookOpen size={36} className="text-[#d2b99b] mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhum processo cadastrado</p>
          </div>
        ) : filtrados.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleExpandido(p.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[#f9f1e7]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#486c96] flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#486c96]">{p.titulo}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.categoria && <span className="text-[10px] bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">{p.categoria}</span>}
                    <span className="text-[10px] text-gray-400">{p.passos.length} passos</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); editar(p); }} className="text-[#486c96] hover:text-[#5f86ad] p-1"><Edit2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); remover(p.id); }} className="text-gray-300 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                {expandidos[p.id] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {expandidos[p.id] && (
              <div className="px-5 pb-5 border-t border-[#d2b99b]/20">
                <ol className="space-y-2 mt-4">
                  {p.passos.map((passo, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#f9f1e7] text-[#486c96] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm text-gray-700 leading-relaxed">{passo}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
