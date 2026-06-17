import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, Trash2, Check, X, Edit2, Star, BookOpen, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MARCOS_CATEGORIAS = [
  'Primeiro cliente', 'Primeiro anuncio', 'Primeira indicacao',
  'Meta financeira', 'Equipe', 'Produto/Servico', 'Reconhecimento', 'Outro',
];

const CATEGORIAS_DESP = ['Assinatura / Aplicativo', 'Servico Fixo', 'Freelancer / Por demanda', 'Equipamento', 'Outro'];
const FREQUENCIAS_DESP = ['Mensal', 'Anual', 'Unica vez'];

const mesAtualKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const FORM_VAZIO_DESP = { nome: '', categoria: 'Assinatura / Aplicativo', frequencia: 'Mensal', valor_unit: '', unidade: 'arte', vencimento: '' };

export default function Empresa() {
  const [aba, setAba] = useState('marca');

  // --- MARCA ---
  const [marca, setMarca] = useState(() => getOrDefault('marca', {
    nome: '', slogan: '', missao: '', visao: '', valores: '',
    tom_de_voz: '', cores: '', fontes: '', publico: '',
  }));
  const salvarMarca = (m) => { setMarca(m); set('marca', m); };

  // --- DESPESAS ---
  const [despesas, setDespesas] = useState(() => getOrDefault('despesas', []));
  const [formDesp, setFormDesp] = useState(FORM_VAZIO_DESP);
  const [showFormDesp, setShowFormDesp] = useState(false);
  const [editDespId, setEditDespId] = useState(null);
  // Quantidade do mes atual para freelancers: { [despId]: { [mesKey]: qtd } }
  const [qtdMes, setQtdMes] = useState(() => getOrDefault('despesas_qtd_mes', {}));

  const salvarDespesas = (l) => { setDespesas(l); set('despesas', l); };
  const salvarQtdMes = (q) => { setQtdMes(q); set('despesas_qtd_mes', q); };

  const submitDesp = () => {
    const ehDemanda = formDesp.categoria === 'Freelancer / Por demanda';
    if (!formDesp.nome || !formDesp.valor_unit) return;
    const item = {
      ...formDesp,
      valor_unit: parseFloat(formDesp.valor_unit),
      id: editDespId || Date.now(),
    };
    if (editDespId) {
      salvarDespesas(despesas.map(d => d.id === editDespId ? item : d));
      setEditDespId(null);
    } else {
      salvarDespesas([...despesas, item]);
    }
    setFormDesp(FORM_VAZIO_DESP);
    setShowFormDesp(false);
  };

  const atualizarQtd = (despId, mes, valor) => {
    const novo = { ...qtdMes, [despId]: { ...(qtdMes[despId] || {}), [mes]: Number(valor) || 0 } };
    salvarQtdMes(novo);
  };

  const custoMensal = (d) => {
    if (d.categoria === 'Freelancer / Por demanda') {
      const mes = mesAtualKey();
      const qtd = (qtdMes[d.id] || {})[mes] || 0;
      return (d.valor_unit || 0) * qtd;
    }
    if (d.frequencia === 'Mensal') return d.valor_unit || 0;
    if (d.frequencia === 'Anual') return (d.valor_unit || 0) / 12;
    return 0;
  };

  const totalMensal = despesas.reduce((s, d) => s + custoMensal(d), 0);

  // --- DIARIO ---
  const [marcos, setMarcos] = useState(() => getOrDefault('diario_empresa', []));
  const [formMarco, setFormMarco] = useState({ titulo: '', descricao: '', categoria: 'Outro', data: new Date().toISOString().split('T')[0] });
  const [showFormMarco, setShowFormMarco] = useState(false);
  const [editMarcoId, setEditMarcoId] = useState(null);

  const salvarMarcos = (l) => { setMarcos(l); set('diario_empresa', l); };

  const submitMarco = () => {
    if (!formMarco.titulo) return;
    const item = { ...formMarco, id: editMarcoId || Date.now() };
    if (editMarcoId) {
      salvarMarcos(marcos.map(m => m.id === editMarcoId ? item : m));
      setEditMarcoId(null);
    } else {
      salvarMarcos([...marcos, item]);
    }
    setFormMarco({ titulo: '', descricao: '', categoria: 'Outro', data: new Date().toISOString().split('T')[0] });
    setShowFormMarco(false);
  };

  const abas = [
    { id: 'marca', label: 'Identidade da Marca', icon: Star },
    { id: 'despesas', label: 'Despesas', icon: DollarSign },
    { id: 'diario', label: 'Diario da Empresa', icon: BookOpen },
  ];

  return (
    <div>
      <h1 className="page-title">Minha Empresa</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {abas.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${aba === a.id ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
            <a.icon size={14} /> {a.label}
          </button>
        ))}
      </div>

      {/* ===== MARCA ===== */}
      {aba === 'marca' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#d2b99b]/30 shadow-sm">
            <h3 className="font-bold text-[#486c96] mb-4">Identidade Visual e Estrategica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome da empresa / marca</label>
                <input className="input" value={marca.nome} onChange={e => salvarMarca({...marca, nome: e.target.value})} placeholder="Ex: Duda Araujo Social Media" />
              </div>
              <div>
                <label className="label">Slogan / tagline</label>
                <input className="input" value={marca.slogan} onChange={e => salvarMarca({...marca, slogan: e.target.value})} placeholder="Ex: Estrategia que converte" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Missao (por que existimos?)</label>
                <textarea className="input" rows={2} value={marca.missao} onChange={e => salvarMarca({...marca, missao: e.target.value})} placeholder="Ex: Ajudar profissionais liberais a crescer no digital com estrategia e autenticidade." />
              </div>
              <div className="md:col-span-2">
                <label className="label">Visao (onde queremos chegar?)</label>
                <textarea className="input" rows={2} value={marca.visao} onChange={e => salvarMarca({...marca, visao: e.target.value})} placeholder="Ex: Ser referencia em gestao de redes sociais no RS ate 2027." />
              </div>
              <div className="md:col-span-2">
                <label className="label">Valores (o que nos guia?)</label>
                <textarea className="input" rows={2} value={marca.valores} onChange={e => salvarMarca({...marca, valores: e.target.value})} placeholder="Ex: Autenticidade, resultado, parceria, evolucao constante." />
              </div>
              <div>
                <label className="label">Tom de voz / personalidade</label>
                <input className="input" value={marca.tom_de_voz} onChange={e => salvarMarca({...marca, tom_de_voz: e.target.value})} placeholder="Ex: Proximo, estrategico, confiante, descomplicado" />
              </div>
              <div>
                <label className="label">Publico-alvo</label>
                <input className="input" value={marca.publico} onChange={e => salvarMarca({...marca, publico: e.target.value})} placeholder="Ex: Profissionais liberais 25-50 anos, RS" />
              </div>
              <div>
                <label className="label">Cores da marca (hex)</label>
                <input className="input" value={marca.cores} onChange={e => salvarMarca({...marca, cores: e.target.value})} placeholder="Ex: #486c96, #d2b99b, #f9f1e7" />
              </div>
              <div>
                <label className="label">Fontes usadas</label>
                <input className="input" value={marca.fontes} onChange={e => salvarMarca({...marca, fontes: e.target.value})} placeholder="Ex: Montserrat, Playfair Display" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600 font-semibold">Salva automaticamente conforme voce digita ✓</div>
          </div>

          {/* Preview */}
          {(marca.missao || marca.visao || marca.valores) && (
            <div className="bg-[#486c96] rounded-2xl p-6 text-white">
              <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Resumo da Marca</div>
              {marca.nome && <div className="text-2xl font-bold mb-1">{marca.nome}</div>}
              {marca.slogan && <div className="text-sm opacity-80 mb-4 italic">"{marca.slogan}"</div>}
              {marca.missao && <div className="mb-2"><span className="text-xs font-bold uppercase opacity-60">Missao</span><p className="text-sm mt-0.5">{marca.missao}</p></div>}
              {marca.visao && <div className="mb-2"><span className="text-xs font-bold uppercase opacity-60">Visao</span><p className="text-sm mt-0.5">{marca.visao}</p></div>}
              {marca.valores && <div><span className="text-xs font-bold uppercase opacity-60">Valores</span><p className="text-sm mt-0.5">{marca.valores}</p></div>}
            </div>
          )}
        </div>
      )}

      {/* ===== DESPESAS ===== */}
      {aba === 'despesas' && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Total mensal estimado</div>
              <div className="text-2xl font-bold text-[#486c96]">R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Despesas cadastradas</div>
              <div className="text-2xl font-bold text-[#486c96]">{despesas.length}</div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button className="btn-primary flex items-center gap-2" onClick={() => { setShowFormDesp(true); setEditDespId(null); setFormDesp(FORM_VAZIO_DESP); }}>
              <Plus size={16} /> Nova despesa
            </button>
          </div>

          {showFormDesp && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Nome da despesa</label>
                  <input className="input" value={formDesp.nome} onChange={e => setFormDesp({...formDesp, nome: e.target.value})} placeholder="Ex: Canva Pro, Designer Freelancer, CapCut..." />
                </div>
                <div className="col-span-2">
                  <label className="label">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS_DESP.map(c => (
                      <button key={c} type="button"
                        onClick={() => setFormDesp({...formDesp, categoria: c})}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${formDesp.categoria === c ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-gray-500 border-[#d2b99b]/40'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {formDesp.categoria === 'Freelancer / Por demanda' ? (
                  <>
                    <div>
                      <label className="label">Valor por unidade (R$)</label>
                      <input className="input" type="number" value={formDesp.valor_unit} onChange={e => setFormDesp({...formDesp, valor_unit: e.target.value})} placeholder="Ex: 25,00" />
                    </div>
                    <div>
                      <label className="label">Unidade</label>
                      <input className="input" value={formDesp.unidade} onChange={e => setFormDesp({...formDesp, unidade: e.target.value})} placeholder="Ex: arte, post, video, hora" />
                    </div>
                    <div>
                      <label className="label">Dia de vencimento (opcional)</label>
                      <input className="input" type="number" min="1" max="31" value={formDesp.vencimento} onChange={e => setFormDesp({...formDesp, vencimento: e.target.value})} placeholder="Ex: 10" />
                    </div>
                    <div className="col-span-2 bg-[#f9f1e7] rounded-xl p-3 text-xs text-[#486c96]">
                      O custo vai variar por mes conforme a quantidade que voce pedir. Voce informa a quantidade direto no cartao da despesa todo mes.
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="label">Valor (R$)</label>
                      <input className="input" type="number" value={formDesp.valor_unit} onChange={e => setFormDesp({...formDesp, valor_unit: e.target.value})} placeholder="0,00" />
                    </div>
                    <div>
                      <label className="label">Frequencia</label>
                      <select className="input" value={formDesp.frequencia} onChange={e => setFormDesp({...formDesp, frequencia: e.target.value})}>
                        {FREQUENCIAS_DESP.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Dia de vencimento (opcional)</label>
                      <input className="input" type="number" min="1" max="31" value={formDesp.vencimento} onChange={e => setFormDesp({...formDesp, vencimento: e.target.value})} placeholder="Ex: 10" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={submitDesp}><Check size={14} className="inline mr-1" /> Salvar</button>
                <button className="btn-secondary" onClick={() => setShowFormDesp(false)}><X size={14} className="inline mr-1" /> Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {despesas.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">
                Cadastre suas despesas recorrentes: Canva, CapCut, designer, celular, internet...
              </div>
            ) : despesas.map(d => {
              const ehDemanda = d.categoria === 'Freelancer / Por demanda';
              const mes = mesAtualKey();
              const qtdAtual = ehDemanda ? ((qtdMes[d.id] || {})[mes] || '') : null;
              const custoHoje = custoMensal(d);
              return (
                <div key={d.id} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{d.nome}</div>
                      <div className="text-xs text-gray-400">{d.categoria}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#486c96]">R$ {custoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-gray-400">
                        {ehDemanda
                          ? `R$ ${(d.valor_unit||0).toLocaleString('pt-BR',{minimumFractionDigits:2})} / ${d.unidade || 'unidade'}${d.vencimento ? ` · vence dia ${d.vencimento}` : ''}`
                          : `${d.frequencia}${d.vencimento ? ` · dia ${d.vencimento}` : ''}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setFormDesp({ nome: d.nome, categoria: d.categoria, frequencia: d.frequencia || 'Mensal', valor_unit: String(d.valor_unit || ''), unidade: d.unidade || 'arte', vencimento: d.vencimento || '' }); setEditDespId(d.id); setShowFormDesp(true); }} className="text-[#486c96]"><Edit2 size={14} /></button>
                      <button onClick={() => salvarDespesas(despesas.filter(x => x.id !== d.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {ehDemanda && (
                    <div className="mt-3 pt-3 border-t border-[#d2b99b]/20 flex items-center gap-3">
                      <span className="text-xs text-gray-500 flex-1">Quantidade este mes:</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => atualizarQtd(d.id, mes, Math.max(0, (Number(qtdAtual)||0) - 1))} className="w-7 h-7 rounded-lg bg-[#f9f1e7] text-[#486c96] font-bold text-base flex items-center justify-center">−</button>
                        <input
                          type="number" min="0"
                          value={qtdAtual}
                          onChange={e => atualizarQtd(d.id, mes, e.target.value)}
                          className="w-14 text-center border border-[#d2b99b]/40 rounded-lg py-1 text-sm font-semibold text-[#486c96] focus:outline-none"
                          placeholder="0"
                        />
                        <button onClick={() => atualizarQtd(d.id, mes, (Number(qtdAtual)||0) + 1)} className="w-7 h-7 rounded-lg bg-[#f9f1e7] text-[#486c96] font-bold text-base flex items-center justify-center">+</button>
                        <span className="text-xs text-gray-400">{d.unidade || 'unidade'}{(Number(qtdAtual)||0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== DIARIO ===== */}
      {aba === 'diario' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Registre os momentos que marcam a historia da sua empresa. Daqui a anos voce vai olhar para isso com muito orgulho.</p>
            <button className="btn-primary flex items-center gap-2 flex-shrink-0 ml-4" onClick={() => { setShowFormMarco(true); setEditMarcoId(null); setFormMarco({ titulo: '', descricao: '', categoria: 'Outro', data: new Date().toISOString().split('T')[0] }); }}>
              <Plus size={16} /> Registrar momento
            </button>
          </div>

          {showFormMarco && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Titulo do momento</label>
                  <input className="input" value={formMarco.titulo} onChange={e => setFormMarco({...formMarco, titulo: e.target.value})} placeholder="Ex: Primeiro cliente de R$1.000, Primeira indicacao, 5 clientes ativos..." />
                </div>
                <div>
                  <label className="label">Categoria</label>
                  <select className="input" value={formMarco.categoria} onChange={e => setFormMarco({...formMarco, categoria: e.target.value})}>
                    {MARCOS_CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Data</label>
                  <input className="input" type="date" value={formMarco.data} onChange={e => setFormMarco({...formMarco, data: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Como foi? O que sentiu?</label>
                  <textarea className="input" rows={3} value={formMarco.descricao} onChange={e => setFormMarco({...formMarco, descricao: e.target.value})} placeholder="Conta como aconteceu, o que sentiu, quem estava junto..." />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={submitMarco}><Check size={14} className="inline mr-1" /> Salvar</button>
                <button className="btn-secondary" onClick={() => setShowFormMarco(false)}><X size={14} className="inline mr-1" /> Cancelar</button>
              </div>
            </div>
          )}

          {marcos.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
              <BookOpen size={36} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-600 font-semibold mb-1">O diario esta esperando por voce</p>
              <p className="text-gray-400 text-sm">Registre os primeiros momentos: primeiro cliente, primeiro anuncio, primeira indicacao...</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#d2b99b]/30" />
              <div className="space-y-4">
                {[...marcos].sort((a, b) => new Date(b.data) - new Date(a.data)).map(m => (
                  <div key={m.id} className="relative pl-12">
                    <div className="absolute left-3.5 top-4 w-4 h-4 rounded-full bg-[#486c96] border-2 border-white shadow" />
                    <div className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-[#f9f1e7] text-[#486c96] font-semibold mb-1">{m.categoria}</span>
                          <h3 className="font-bold text-[#486c96]">{m.titulo}</h3>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setFormMarco({ titulo: m.titulo, descricao: m.descricao, categoria: m.categoria, data: m.data }); setEditMarcoId(m.id); setShowFormMarco(true); }} className="text-[#486c96]"><Edit2 size={13} /></button>
                          <button onClick={() => salvarMarcos(marcos.filter(x => x.id !== m.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      {m.descricao && <p className="text-sm text-gray-600 leading-relaxed mb-2">{m.descricao}</p>}
                      <p className="text-xs text-gray-400">{m.data ? new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
