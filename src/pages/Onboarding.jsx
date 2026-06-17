import { useState, useMemo } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const ETAPAS_PADRAO = [
  'Enviar contrato e receber assinado',
  'Coletar briefing completo (marca, publico, tom de voz)',
  'Receber acessos: Instagram, Meta Ads, Canva',
  'Fazer auditoria do perfil atual',
  'Definir temas e pilares de conteudo',
  'Criar calendario do primeiro mes',
  'Apresentar planejamento ao cliente',
  'Criar ou atualizar o perfil (bio, destaque, foto)',
  'Publicar primeiro post',
  'Agendar reuniao de alinhamento mensal',
];

const FORM_VAZIO = { cliente_id: '', data_inicio: new Date().toISOString().split('T')[0], obs: '' };

export default function Onboarding() {
  const clientes = getOrDefault('clientes', []);
  const [dados, setDados] = useState(() => getOrDefault('onboarding', {}));
  const [clienteId, setClienteId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [novaEtapa, setNovaEtapa] = useState('');
  const [expandido, setExpandido] = useState({});

  const salvar = (d) => { setDados(d); set('onboarding', d); };

  const iniciarOnboarding = () => {
    if (!form.cliente_id) return;
    const id = String(form.cliente_id);
    const novo = {
      ...dados,
      [id]: {
        data_inicio: form.data_inicio,
        obs: form.obs,
        etapas: ETAPAS_PADRAO.map((texto, i) => ({ id: i + 1, texto, feito: false })),
      },
    };
    salvar(novo);
    setShowForm(false);
    setForm(FORM_VAZIO);
    setClienteId(id);
    setExpandido(e => ({ ...e, [id]: true }));
  };

  const toggleEtapa = (cid, etapaId) => {
    const atual = dados[cid];
    if (!atual) return;
    const novo = {
      ...dados,
      [cid]: {
        ...atual,
        etapas: atual.etapas.map(e => e.id === etapaId ? { ...e, feito: !e.feito } : e),
      },
    };
    salvar(novo);
  };

  const adicionarEtapa = (cid) => {
    if (!novaEtapa.trim()) return;
    const atual = dados[cid];
    const maxId = Math.max(0, ...(atual?.etapas || []).map(e => e.id));
    const novo = {
      ...dados,
      [cid]: {
        ...atual,
        etapas: [...(atual?.etapas || []), { id: maxId + 1, texto: novaEtapa.trim(), feito: false }],
      },
    };
    salvar(novo);
    setNovaEtapa('');
  };

  const removerEtapa = (cid, etapaId) => {
    const atual = dados[cid];
    const novo = {
      ...dados,
      [cid]: { ...atual, etapas: atual.etapas.filter(e => e.id !== etapaId) },
    };
    salvar(novo);
  };

  const removerOnboarding = (cid) => {
    const novo = { ...dados };
    delete novo[cid];
    salvar(novo);
    if (clienteId === cid) setClienteId('');
  };

  const salvarObs = (cid, val) => {
    salvar({ ...dados, [cid]: { ...dados[cid], obs: val } });
  };

  const clientesComOnboarding = clientes.filter(c => dados[String(c.id)]);
  const clientesSem = clientes.filter(c => !dados[String(c.id)]);

  const progresso = (cid) => {
    const etapas = dados[cid]?.etapas || [];
    if (!etapas.length) return 0;
    return Math.round((etapas.filter(e => e.feito).length / etapas.length) * 100);
  };

  return (
    <div>
      <h1 className="page-title">Onboarding de Cliente</h1>
      <p className="text-sm text-gray-500 mb-5">Checklist de entrada para cada cliente novo. Marque as etapas conforme avanca.</p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">{clientesComOnboarding.length} cliente(s) com onboarding ativo</span>
        {clientesSem.length > 0 && (
          <button className="btn-primary flex items-center gap-2"
            onClick={() => { setShowForm(true); setForm(FORM_VAZIO); }}>
            <Plus size={16} /> Novo onboarding
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">Iniciar onboarding</h4>
          <div className="space-y-3">
            <div>
              <label className="label">Cliente</label>
              <select className="input" value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                <option value="">Selecione...</option>
                {clientesSem.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Data de inicio</label>
              <input className="input" type="date" value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} />
            </div>
            <div>
              <label className="label">Observacoes (opcional)</label>
              <textarea className="input" rows={2} value={form.obs} onChange={e => setForm({ ...form, obs: e.target.value })}
                placeholder="Ex: cliente urgente, prazo ate sexta..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={iniciarOnboarding}><Check size={14} className="inline mr-1" /> Iniciar</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={14} className="inline mr-1" /> Cancelar</button>
          </div>
        </div>
      )}

      {clientesComOnboarding.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400">
          <p className="font-semibold text-gray-500 mb-1">Nenhum onboarding iniciado</p>
          <p className="text-sm">Clique em "Novo onboarding" para comecar com um cliente.</p>
        </div>
      )}

      <div className="space-y-4">
        {clientesComOnboarding.map(c => {
          const cid = String(c.id);
          const d = dados[cid];
          const pct = progresso(cid);
          const aberto = expandido[cid] !== false;
          const feitos = d.etapas.filter(e => e.feito).length;

          return (
            <div key={cid} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm overflow-hidden">
              <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#f9f1e7]/50 transition-colors"
                onClick={() => setExpandido(e => ({ ...e, [cid]: !aberto }))}>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#486c96]">{c.nome}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Inicio: {new Date(d.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')} · {feitos}/{d.etapas.length} etapas
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#486c96] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-400 text-right mt-0.5">{pct}%</div>
                  </div>
                  {aberto ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {aberto && (
                <div className="px-5 pb-5 border-t border-[#d2b99b]/20">
                  <div className="space-y-2 mt-4">
                    {d.etapas.map(etapa => (
                      <div key={etapa.id} className="flex items-start gap-3 group">
                        <button onClick={() => toggleEtapa(cid, etapa.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${etapa.feito ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b] hover:border-[#486c96]'}`}>
                          {etapa.feito && <Check size={11} className="text-white" />}
                        </button>
                        <span className={`text-sm flex-1 ${etapa.feito ? 'line-through text-gray-400' : 'text-gray-700'}`}>{etapa.texto}</span>
                        <button onClick={() => removerEtapa(cid, etapa.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar etapa */}
                  <div className="flex gap-2 mt-4">
                    <input className="input flex-1 text-sm" placeholder="Adicionar etapa personalizada..."
                      value={novaEtapa} onChange={e => setNovaEtapa(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && adicionarEtapa(cid)} />
                    <button onClick={() => adicionarEtapa(cid)} className="btn-secondary px-3"><Plus size={14} /></button>
                  </div>

                  {/* Obs */}
                  {(d.obs !== undefined) && (
                    <div className="mt-4">
                      <label className="label">Observacoes</label>
                      <textarea className="input text-sm" rows={2} defaultValue={d.obs}
                        key={`obs_${cid}`}
                        onBlur={e => salvarObs(cid, e.target.value)}
                        placeholder="Anotacoes sobre este cliente..." />
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button onClick={() => removerOnboarding(cid)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={12} /> Encerrar onboarding
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
