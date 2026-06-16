import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Lock, Plus, Trash2, Check, X, Eye, EyeOff, Copy, Edit2, ShieldAlert } from 'lucide-react';

export default function CofreSenhas() {
  const [senhas, setSenhas] = useState(() => getOrDefault('senhas', []));
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ servico: '', usuario: '', senha: '', url: '', observacoes: '' });
  const [visiveis, setVisiveis] = useState({});
  const [copiado, setCopiado] = useState(null);
  const [busca, setBusca] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const salvar = (lista) => { setSenhas(lista); set('senhas', lista); };

  const submit = () => {
    if (!form.servico || !form.senha) return;
    if (editId) {
      salvar(senhas.map(s => s.id === editId ? { ...form, id: editId } : s));
      setEditId(null);
    } else {
      salvar([...senhas, { ...form, id: Date.now() }]);
    }
    setForm({ servico: '', usuario: '', senha: '', url: '', observacoes: '' });
    setShowForm(false);
  };

  const editar = (s) => {
    setForm({ servico: s.servico, usuario: s.usuario || '', senha: s.senha, url: s.url || '', observacoes: s.observacoes || '' });
    setEditId(s.id);
    setShowForm(true);
  };

  const remover = (id) => {
    salvar(senhas.filter(s => s.id !== id));
    setConfirmDelete(null);
  };

  const toggleVisivel = (id) => setVisiveis(v => ({ ...v, [id]: !v[id] }));

  const copiar = async (id, texto) => {
    await navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const filtradas = senhas.filter(s =>
    s.servico.toLowerCase().includes(busca.toLowerCase()) ||
    (s.usuario || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Cofre de Senhas</h1>

      <div className="bg-[#f9f1e7] border border-[#d2b99b] rounded-xl p-3 mb-5 flex items-start gap-2">
        <ShieldAlert size={16} className="text-[#486c96] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#486c96]">Suas senhas sao salvas localmente neste dispositivo. Nao compartilhe o acesso a este aplicativo com outras pessoas.</p>
      </div>

      <div className="flex gap-3 mb-5">
        <input className="input flex-1" placeholder="Buscar servico ou usuario..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm({ servico: '', usuario: '', senha: '', url: '', observacoes: '' }); }}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar senha' : 'Nova senha'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Servico / Plataforma</label>
              <input className="input" value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} placeholder="Ex: Instagram, Canva, Google..." />
            </div>
            <div>
              <label className="label">Usuario / E-mail</label>
              <input className="input" value={form.usuario} onChange={e => setForm({...form, usuario: e.target.value})} placeholder="usuario@email.com" />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} placeholder="••••••••" />
            </div>
            <div>
              <label className="label">URL (opcional)</label>
              <input className="input" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label className="label">Observacoes</label>
              <input className="input" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} placeholder="Ex: conta pessoal" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={submit}><Check size={16} className="inline mr-1" /> Salvar</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
            <Lock size={36} className="text-[#d2b99b] mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhuma senha salva ainda</p>
          </div>
        ) : filtradas.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-4 border border-[#d2b99b]/30 shadow-sm">
            {confirmDelete === s.id ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 flex-1">Confirmar exclusao de <strong>{s.servico}</strong>?</p>
                <button className="btn-danger text-xs" onClick={() => remover(s.id)}>Excluir</button>
                <button className="btn-secondary text-xs" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#486c96] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{s.servico[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#486c96] text-sm">{s.servico}</div>
                  {s.usuario && <div className="text-xs text-gray-500 truncate">{s.usuario}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-gray-600">
                      {visiveis[s.id] ? s.senha : '••••••••'}
                    </span>
                    <button onClick={() => toggleVisivel(s.id)} className="text-gray-400 hover:text-[#486c96]">
                      {visiveis[s.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={() => copiar(s.id, s.senha)} className={`text-xs flex items-center gap-0.5 ${copiado === s.id ? 'text-green-600' : 'text-gray-400 hover:text-[#486c96]'}`}>
                      {copiado === s.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                    </button>
                  </div>
                  {s.observacoes && <div className="text-[10px] text-gray-400 mt-0.5">{s.observacoes}</div>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editar(s)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmDelete(s.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
