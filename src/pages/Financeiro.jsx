import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, Trash2, Edit2, Check, X, TrendingUp, Eye, ExternalLink } from 'lucide-react';

const FORM_VAZIO = {
  tipo: 'pessoa', nome: '', cpfCnpj: '', valor: '', valor_onboarding: '', dia_pagamento: '',
  status: 'ativo', area: '', perfil: '', servico: '', observacoes: '',
  data_entrada: '', data_saida: '', contrato: '', drive: '', senha: '', socios: [],
};

export default function Financeiro({ onVerCliente }) {
  const [aba, setAba] = useState('clientes');
  const [clientes, setClientes] = useState(() => getOrDefault('clientes', []));
  const [fluxo, setFluxo] = useState(() => getOrDefault('fluxo_financeiro', {
    distribuicao: [
      { nome: 'Caixa', percentual: 20, cor: '#486c96' },
      { nome: 'Lucro / Despesas pessoais', percentual: 50, cor: '#5f86ad' },
      { nome: 'Metas / Investimentos', percentual: 20, cor: '#d2b99b' },
      { nome: 'iPhone 17 ProMax', percentual: 10, cor: '#a0c0d8' },
    ],
    historico: [],
  }));
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const salvarClientes = (lista) => { setClientes(lista); set('clientes', lista); };
  const salvarFluxo = (f) => { setFluxo(f); set('fluxo_financeiro', f); };

  // --- socios helpers ---
  const addSocio = () => setForm(f => ({ ...f, socios: [...(f.socios || []), { nome: '', aniversario: '' }] }));
  const updateSocio = (i, campo, val) => setForm(f => {
    const lista = [...(f.socios || [])];
    lista[i] = { ...lista[i], [campo]: val };
    return { ...f, socios: lista };
  });
  const removeSocio = (i) => setForm(f => ({ ...f, socios: f.socios.filter((_, idx) => idx !== i) }));

  const adicionarCliente = () => {
    if (!form.nome || !form.valor) return;
    const novo = {
      ...form,
      id: Date.now(),
      valor: parseFloat(form.valor),
      valor_onboarding: form.valor_onboarding ? parseFloat(form.valor_onboarding) : null,
      socios: (form.socios || []).filter(s => s.nome || s.aniversario),
    };
    if (editandoId) {
      salvarClientes(clientes.map(c => c.id === editandoId ? { ...novo, id: editandoId } : c));
      setEditandoId(null);
    } else {
      salvarClientes([...clientes, novo]);
    }
    setForm(FORM_VAZIO);
    setShowForm(false);
  };

  const editarCliente = (c) => {
    setForm({
      tipo: c.tipo || 'pessoa', nome: c.nome, cpfCnpj: c.cpfCnpj || '', valor: c.valor,
      valor_onboarding: c.valor_onboarding || '', dia_pagamento: c.dia_pagamento,
      status: c.status, area: c.area || '', perfil: c.perfil || '',
      servico: c.servico || '', observacoes: c.observacoes || '',
      data_entrada: c.data_entrada || '', data_saida: c.data_saida || '',
      contrato: c.contrato || '', drive: c.drive || '', senha: c.senha || '',
      socios: c.socios || (c.aniversarios ? c.aniversarios.map(a => ({ nome: a.nome || '', aniversario: a.data || '' })) : c.aniversario ? [{ nome: '', aniversario: c.aniversario }] : []),
    });
    setEditandoId(c.id);
    setShowForm(true);
  };

  const removerCliente = (id) => salvarClientes(clientes.filter(c => c.id !== id));

  const mesHoje = new Date().getMonth();
  const anoHoje = new Date().getFullYear();
  const valorEfetivo = (c) => {
    if (!c.data_entrada || !c.valor_onboarding) return c.valor || 0;
    const entrada = new Date(c.data_entrada + 'T12:00:00');
    if (entrada.getMonth() === mesHoje && entrada.getFullYear() === anoHoje) return c.valor_onboarding;
    return c.valor || 0;
  };
  const totalMensal = clientes.filter(c => c.status === 'ativo').reduce((s, c) => s + valorEfetivo(c), 0);

  const atualizarDist = (i, campo, valor) => {
    const nova = [...fluxo.distribuicao];
    nova[i] = { ...nova[i], [campo]: campo === 'percentual' ? Number(valor) : valor };
    salvarFluxo({ ...fluxo, distribuicao: nova });
  };

  const adicionarCategoria = () => salvarFluxo({ ...fluxo, distribuicao: [...fluxo.distribuicao, { nome: 'Nova categoria', percentual: 0, cor: '#d2b99b' }] });
  const removerCategoria = (i) => salvarFluxo({ ...fluxo, distribuicao: fluxo.distribuicao.filter((_, idx) => idx !== i) });
  const totalDist = fluxo.distribuicao.reduce((s, d) => s + d.percentual, 0);

  const adicionarHistorico = () => {
    const mes = prompt('Nome do mes (ex: Julho):');
    const entradas = parseFloat(prompt('Total recebido (R$):') || '0');
    if (!mes || !entradas) return;
    const novoHist = { mes, entradas, ...Object.fromEntries(fluxo.distribuicao.map(d => [d.nome.split('/')[0].trim().toLowerCase().replace(/ /g, '_'), Math.round(entradas * d.percentual / 100 * 100) / 100])) };
    salvarFluxo({ ...fluxo, historico: [...(fluxo.historico || []), novoHist] });
  };

  const formatarData = (iso) => {
    if (!iso) return '';
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR'); } catch { return iso; }
  };

  return (
    <div>
      <h1 className="page-title">Financeiro</h1>

      <div className="flex gap-2 mb-6">
        {['clientes', 'organizacao', 'historico'].map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${aba === a ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
            {a === 'clientes' ? 'Clientes' : a === 'organizacao' ? 'Organizacao do Dinheiro' : 'Historico Mensal'}
          </button>
        ))}
      </div>

      {aba === 'clientes' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">Total mensal</div>
              <div className="text-2xl font-bold text-[#486c96]">R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">Clientes ativos</div>
              <div className="text-2xl font-bold text-[#486c96]">{clientes.filter(c => c.status === 'ativo').length}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">Ticket medio</div>
              <div className="text-2xl font-bold text-[#486c96]">
                {clientes.filter(c => c.status === 'ativo').length > 0
                  ? `R$ ${(totalMensal / clientes.filter(c => c.status === 'ativo').length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : 'R$ 0,00'}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title mb-0">Lista de clientes</h3>
            <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditandoId(null); setForm(FORM_VAZIO); }}>
              <Plus size={16} /> Adicionar cliente
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-4">
              <h4 className="font-semibold text-[#486c96] mb-4">{editandoId ? 'Editar cliente' : 'Novo cliente'}</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Tipo pessoa/empresa */}
                <div className="col-span-2">
                  <label className="label">Tipo de cliente</label>
                  <div className="flex gap-3">
                    {['pessoa', 'empresa'].map(t => (
                      <button type="button" key={t} onClick={() => setForm({...form, tipo: t})}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.tipo === t ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40'}`}>
                        {t === 'pessoa' ? 'Pessoa fisica' : 'Empresa'}
                      </button>
                    ))}
                  </div>
                </div>

                <div><label className="label">{form.tipo === 'empresa' ? 'Nome da empresa' : 'Nome do cliente'}</label><input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder={form.tipo === 'empresa' ? 'Razao social ou nome fantasia' : 'Nome completo'} /></div>
                <div><label className="label">CPF / CNPJ</label><input className="input" value={form.cpfCnpj} onChange={e => setForm({...form, cpfCnpj: e.target.value})} placeholder="000.000.000-00" /></div>

                {/* Socios / Responsaveis — logo apos nome */}
                <div className="col-span-2 bg-[#f9f1e7] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0 text-[#486c96] font-bold">{form.tipo === 'empresa' ? 'Dono / Socios' : 'Socios ou responsaveis (opcional)'}</label>
                    <button type="button"
                      className="bg-[#486c96] text-white text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl hover:opacity-80"
                      onClick={addSocio}>
                      <Plus size={12} /> Adicionar pessoa
                    </button>
                  </div>
                  {(form.socios || []).length === 0 && (
                    <p className="text-xs text-gray-400 italic">Clique em "Adicionar pessoa" para incluir nome e aniversario de cada socio ou responsavel.</p>
                  )}
                  <div className="space-y-2">
                    {(form.socios || []).map((s, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white rounded-xl px-3 py-2 shadow-sm">
                        <span className="text-xs text-[#d2b99b] font-bold w-5 flex-shrink-0">{i + 1}.</span>
                        <div className="flex-1">
                          <input
                            className="input mb-1"
                            placeholder="Nome (ex: Carlos Silva)"
                            value={s.nome}
                            onChange={e => updateSocio(i, 'nome', e.target.value)}
                          />
                          <input
                            className="input text-xs"
                            type="date"
                            value={s.aniversario}
                            onChange={e => updateSocio(i, 'aniversario', e.target.value)}
                            title="Data de aniversario"
                          />
                        </div>
                        <button type="button" onClick={() => removeSocio(i)} className="text-red-400 hover:text-red-600 flex-shrink-0 p-1"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div><label className="label">Perfil Instagram</label><input className="input" value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})} placeholder="@perfil" /></div>
                <div><label className="label">Area / Nicho</label><input className="input" value={form.area} onChange={e => setForm({...form, area: e.target.value})} placeholder="Ex: Terapeuta" /></div>
                <div><label className="label">Valor mensal (R$)</label><input className="input" type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} placeholder="0,00" /></div>
                <div><label className="label">Valor 1° mes / Onboarding (R$)</label><input className="input" type="number" value={form.valor_onboarding} onChange={e => setForm({...form, valor_onboarding: e.target.value})} placeholder="Deixe vazio se igual ao mensal" /></div>
                <div><label className="label">Dia de pagamento</label><input className="input" type="number" min="1" max="31" value={form.dia_pagamento} onChange={e => setForm({...form, dia_pagamento: e.target.value})} placeholder="Ex: 10" /></div>
                <div><label className="label">Servico contratado</label><input className="input" value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} placeholder="Ex: Gestao Completa" /></div>
                <div><label className="label">Data de entrada</label><input className="input" type="date" value={form.data_entrada} onChange={e => setForm({...form, data_entrada: e.target.value})} /></div>
                <div><label className="label">Data de saida (se encerrou)</label><input className="input" type="date" value={form.data_saida} onChange={e => setForm({...form, data_saida: e.target.value})} /></div>
                <div><label className="label">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </div>
                <div><label className="label">Senha (acesso ao perfil)</label><input className="input" type="text" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} placeholder="Senha do Instagram, etc." /></div>
                <div className="col-span-2"><label className="label">Link do Drive (materiais do cliente)</label>
                  <input className="input" value={form.drive} onChange={e => setForm({...form, drive: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
                <div className="col-span-2"><label className="label">Link do contrato</label>
                  <input className="input" value={form.contrato} onChange={e => setForm({...form, contrato: e.target.value})} placeholder="https://... (Google Drive, Notion, etc)" />
                </div>
                <div className="col-span-2"><label className="label">Observacoes</label><input className="input" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} placeholder="Observacoes especiais..." /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary" onClick={adicionarCliente}><Check size={16} className="inline mr-1" /> Salvar</button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
              </div>
            </div>
          )}

          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {clientes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">Nenhum cliente cadastrado ainda</div>
            ) : clientes.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-[#486c96]">{c.nome}</div>
                    {c.area && <div className="text-xs text-gray-400">{c.area}</div>}
                    {c.perfil && <div className="text-xs text-gray-400">{c.perfil}</div>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${c.status === 'ativo' ? 'bg-green-100 text-green-700' : c.status === 'pausado' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <div className="text-[10px] text-gray-400">Mensal</div>
                    <div className="font-bold text-[#486c96] text-sm">R$ {(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Pagamento</div>
                    <div className="text-sm font-semibold text-gray-700">Dia {c.dia_pagamento}</div>
                  </div>
                  {c.valor_onboarding && (
                    <div>
                      <div className="text-[10px] text-gray-400">1° mes</div>
                      <div className="text-sm font-semibold text-[#d2b99b]">R$ {c.valor_onboarding.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                  )}
                </div>
                {c.observacoes && <div className="text-xs text-gray-400 mb-2">{c.observacoes}</div>}
                <div className="flex gap-3 items-center border-t border-[#d2b99b]/20 pt-3">
                  {onVerCliente && <button onClick={() => onVerCliente(c.id)} className="text-xs text-[#486c96] font-semibold flex items-center gap-1"><Eye size={13} /> Detalhes</button>}
                  <button onClick={() => editarCliente(c)} className="text-xs text-[#486c96] font-semibold flex items-center gap-1"><Edit2 size={13} /> Editar</button>
                  {c.contrato && <a href={c.contrato} target="_blank" rel="noreferrer" className="text-xs text-[#5f86ad] font-semibold flex items-center gap-1"><ExternalLink size={13} /> Contrato</a>}
                  <button onClick={() => removerCliente(c.id)} className="text-red-400 ml-auto"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela desktop */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
            {clientes.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Nenhum cliente cadastrado ainda</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d2b99b]/30 bg-[#f9f1e7]">
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Nome</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Perfil</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Area</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Valor mensal</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">1° mes</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Entrada</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Pgto</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} className="border-b border-[#d2b99b]/20 hover:bg-[#f9f1e7]/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.nome}</div>
                        {c.observacoes && <div className="text-[10px] text-gray-400">{c.observacoes}</div>}
                        {c.contrato && (
                          <a href={c.contrato} target="_blank" rel="noreferrer" className="text-[10px] text-[#5f86ad] flex items-center gap-0.5 hover:underline mt-0.5">
                            <ExternalLink size={9} /> Contrato
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.perfil}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.area}</td>
                      <td className="px-4 py-3 font-semibold text-[#486c96]">R$ {(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-xs">
                        {c.valor_onboarding ? (
                          <span className="font-semibold text-[#d2b99b]">R$ {c.valor_onboarding.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatarData(c.data_entrada) || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">Dia {c.dia_pagamento}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'ativo' ? 'bg-green-100 text-green-700' : c.status === 'pausado' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {onVerCliente && <button onClick={() => onVerCliente(c.id)} className="text-[#d2b99b] hover:text-[#486c96]" title="Ver detalhes"><Eye size={14} /></button>}
                          <button onClick={() => editarCliente(c)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={14} /></button>
                          <button onClick={() => removerCliente(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {aba === 'organizacao' && (
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="section-title mb-1">Como vou distribuir meu dinheiro</h3>
                <p className="text-xs text-gray-400">Total: <span className={totalDist === 100 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{totalDist}%</span></p>
              </div>
              <button className="btn-secondary flex items-center gap-1 text-xs" onClick={adicionarCategoria}><Plus size={14} /> Categoria</button>
            </div>
            <div className="space-y-3">
              {fluxo.distribuicao.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input type="color" value={d.cor} onChange={e => atualizarDist(i, 'cor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <input className="input flex-1" value={d.nome} onChange={e => atualizarDist(i, 'nome', e.target.value)} />
                  <div className="flex items-center gap-1">
                    <input type="number" min="0" max="100" className="input w-20 text-center" value={d.percentual} onChange={e => atualizarDist(i, 'percentual', e.target.value)} />
                    <span className="text-sm text-gray-500 font-medium">%</span>
                  </div>
                  <button onClick={() => removerCategoria(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex h-6 rounded-full overflow-hidden">
                {fluxo.distribuicao.map((d, i) => (
                  <div key={i} style={{ width: `${d.percentual}%`, background: d.cor }} title={`${d.nome}: ${d.percentual}%`} />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {fluxo.distribuicao.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ background: d.cor }} />
                    <span className="text-gray-600">{d.nome}: <strong>{d.percentual}%</strong></span>
                    {totalMensal > 0 && <span className="text-gray-400">(R$ {((totalMensal * d.percentual) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {totalMensal > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30">
              <h3 className="section-title">Com base no faturamento atual — R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mes</h3>
              <div className="grid grid-cols-2 gap-3">
                {fluxo.distribuicao.map((d, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: d.cor + '20', borderLeft: `4px solid ${d.cor}` }}>
                    <div className="text-xs text-gray-500 font-medium">{d.nome}</div>
                    <div className="text-lg font-bold" style={{ color: d.cor }}>R$ {((totalMensal * d.percentual) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-gray-400">{d.percentual}% do total</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {aba === 'historico' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="section-title mb-0">Historico mensal</h3>
            <button className="btn-primary flex items-center gap-2" onClick={adicionarHistorico}><Plus size={16} /> Adicionar mes</button>
          </div>
          {(!fluxo.historico || fluxo.historico.length === 0) ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
              <TrendingUp size={36} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum registro mensal ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30">
                <h4 className="font-semibold text-[#486c96] mb-4">Evolucao do faturamento</h4>
                <div className="flex items-end gap-3 h-32">
                  {fluxo.historico.map((h, i) => {
                    const max = Math.max(...fluxo.historico.map(x => x.entradas));
                    const altura = max > 0 ? (h.entradas / max) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-[#486c96]">R$ {(h.entradas/1000).toFixed(1)}k</span>
                        <div className="w-full rounded-t-lg transition-all" style={{ height: `${altura}%`, background: '#486c96', minHeight: 4 }} />
                        <span className="text-[10px] text-gray-500">{h.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#d2b99b]/30 bg-[#f9f1e7]">
                      <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Mes</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#486c96]">Entradas</th>
                      {fluxo.distribuicao.map((d, i) => (
                        <th key={i} className="text-right px-4 py-3 font-semibold text-[#486c96] hidden md:table-cell">{d.nome.split('/')[0].trim()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fluxo.historico.map((h, i) => (
                      <tr key={i} className="border-b border-[#d2b99b]/20 hover:bg-[#f9f1e7]/50">
                        <td className="px-4 py-3 font-semibold text-[#486c96]">{h.mes}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">R$ {h.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        {fluxo.distribuicao.map((d, j) => (
                          <td key={j} className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">
                            R$ {(h.entradas * d.percentual / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
