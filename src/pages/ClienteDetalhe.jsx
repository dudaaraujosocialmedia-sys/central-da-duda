import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { ArrowLeft, Plus, Trash2, Check, AtSign, Calendar, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClienteDetalhe({ clienteId, onVoltar }) {
  const clientes = getOrDefault('clientes', []);
  const cliente = clientes.find(c => c.id === clienteId);

  const [notas, setNotas] = useState(() => getOrDefault(`notas_cliente_${clienteId}`, []));
  const [checklistCliente, setChecklistCliente] = useState(() => getOrDefault(`checklist_cliente_${clienteId}`, []));
  const [anotacoes, setAnotacoes] = useState(() => getOrDefault(`anotacoes_${clienteId}`, ''));
  const [formNota, setFormNota] = useState('');
  const [formTask, setFormTask] = useState('');
  const [aba, setAba] = useState('resumo');

  if (!cliente) return (
    <div className="text-center py-10">
      <p className="text-gray-400">Cliente nao encontrado</p>
      <button className="btn-secondary mt-4" onClick={onVoltar}>Voltar</button>
    </div>
  );

  const salvarNotas = (l) => { setNotas(l); set(`notas_cliente_${clienteId}`, l); };
  const salvarChecklist = (l) => { setChecklistCliente(l); set(`checklist_cliente_${clienteId}`, l); };
  const salvarAnotacoes = (v) => { setAnotacoes(v); set(`anotacoes_${clienteId}`, v); };

  const adicionarNota = () => {
    if (!formNota.trim()) return;
    salvarNotas([{ id: Date.now(), texto: formNota, data: new Date().toISOString() }, ...notas]);
    setFormNota('');
  };

  const adicionarTask = () => {
    if (!formTask.trim()) return;
    salvarChecklist([...checklistCliente, { id: Date.now(), titulo: formTask, concluida: false }]);
    setFormTask('');
  };

  const toggleTask = (id) => salvarChecklist(checklistCliente.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));

  // Historico de pagamentos: meses que passaram desde o inicio
  const fluxo = getOrDefault('fluxo_financeiro', { historico: [] });
  const eventos = getOrDefault('eventos', []);
  const eventosCliente = eventos.filter(e => e.cliente === cliente.nome);

  const corStatus = cliente.status === 'ativo' ? 'bg-green-100 text-green-700' : cliente.status === 'pausado' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';

  return (
    <div>
      <button onClick={onVoltar} className="flex items-center gap-2 text-[#486c96] text-sm font-semibold mb-5 hover:opacity-70">
        <ArrowLeft size={16} /> Voltar para Financeiro
      </button>

      {/* Header do cliente */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#486c96]">{cliente.nome}</h1>
            {cliente.perfil && (
              <a href={`https://instagram.com/${cliente.perfil.replace('@','')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-sm text-[#5f86ad] mt-1 hover:underline">
                <AtSign size={13} /> {cliente.perfil}
              </a>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${corStatus}`}>{cliente.status}</span>
              {cliente.area && <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#f9f1e7] text-[#486c96]">{cliente.area}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Valor mensal</div>
            <div className="text-2xl font-bold text-[#486c96]">R$ {(cliente.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            {cliente.dia_pagamento && <div className="text-xs text-gray-400 mt-1">Pagamento: dia {cliente.dia_pagamento}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#d2b99b]/30">
          {cliente.cpfCnpj && <div><div className="text-xs text-gray-400">CPF / CNPJ</div><div className="text-sm font-medium">{cliente.cpfCnpj}</div></div>}
          {cliente.servico && <div><div className="text-xs text-gray-400">Servico</div><div className="text-sm font-medium">{cliente.servico}</div></div>}
          {cliente.valor_onboarding && <div><div className="text-xs text-gray-400">1° mes</div><div className="text-sm font-medium">R$ {cliente.valor_onboarding.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>}
          {cliente.data_entrada && <div><div className="text-xs text-gray-400">Cliente desde</div><div className="text-sm font-medium">{format(new Date(cliente.data_entrada + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div></div>}
          {(() => {
            const socios = cliente.socios && cliente.socios.length > 0 ? cliente.socios : null;
            if (!socios) return null;
            return <div className="col-span-2">
              <div className="text-xs text-gray-400 mb-2">Socios / Responsaveis</div>
              <div className="flex flex-wrap gap-2">
                {socios.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#f9f1e7] px-3 py-2 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-[#486c96]" />
                    <span className="text-sm font-semibold text-[#486c96]">{s.nome}</span>
                    {s.aniversario && (
                      <span className="text-xs text-pink-600">
                        {format(new Date(s.aniversario + 'T12:00:00'), "dd/MM", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>;
          })()}
        </div>

        {cliente.contrato && (
          <div className="mt-3">
            <a href={cliente.contrato} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#5f86ad] font-semibold hover:underline">
              <FileText size={14} /> Ver contrato
            </a>
          </div>
        )}
        {cliente.observacoes && (
          <div className="mt-4 p-3 bg-[#f9f1e7] rounded-xl text-sm text-gray-600">{cliente.observacoes}</div>
        )}
      </div>

      {/* Anotacoes rapidas */}
      <div className="bg-[#fffdf7] rounded-2xl p-5 border border-[#d2b99b]/40 shadow-sm mb-5">
        <label className="text-xs font-bold text-[#d2b99b] uppercase tracking-widest block mb-2">Anotacoes rapidas</label>
        <textarea
          className="w-full bg-transparent text-sm text-gray-700 leading-relaxed resize-none focus:outline-none placeholder:text-gray-300"
          rows={4}
          placeholder={`Ex: prefere postar terca, evitar roxo na identidade, marido se chama Joao...`}
          value={anotacoes}
          onChange={e => setAnotacoes(e.target.value)}
          onBlur={e => salvarAnotacoes(e.target.value)}
        />
        <p className="text-[10px] text-[#d2b99b] mt-1">Salva automaticamente ao clicar fora</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { id: 'resumo', label: 'Resumo', icon: FileText },
          { id: 'notas', label: 'Notas', icon: FileText },
          { id: 'checklist', label: 'Checklist', icon: Check },
          { id: 'calendario', label: 'Eventos', icon: Calendar },
          { id: 'pagamentos', label: 'Pagamentos', icon: DollarSign },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${aba === a.id ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'resumo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            <h3 className="font-bold text-[#486c96] mb-3">Ultimas notas</h3>
            {notas.length === 0 ? <p className="text-sm text-gray-400">Nenhuma nota</p> :
              notas.slice(0, 3).map(n => (
                <div key={n.id} className="mb-3 pb-3 border-b border-[#d2b99b]/20 last:border-0">
                  <p className="text-sm text-gray-700">{n.texto}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{format(new Date(n.data), "dd/MM/yy")}</p>
                </div>
              ))
            }
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
            <h3 className="font-bold text-[#486c96] mb-3">Proximos eventos</h3>
            {eventosCliente.filter(e => new Date(e.data) >= new Date()).slice(0, 4).length === 0
              ? <p className="text-sm text-gray-400">Nenhum evento</p>
              : eventosCliente.filter(e => new Date(e.data) >= new Date()).sort((a,b) => new Date(a.data) - new Date(b.data)).slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: e.cor }} />
                  <span className="text-sm text-gray-700">{e.titulo}</span>
                  <span className="text-xs text-gray-400 ml-auto">{format(new Date(e.data + 'T12:00:00'), 'dd/MM')}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {aba === 'notas' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-4">
            <textarea className="input w-full resize-none" rows={3} placeholder="Adicionar nota sobre este cliente..." value={formNota} onChange={e => setFormNota(e.target.value)} />
            <button className="btn-primary mt-2 flex items-center gap-2" onClick={adicionarNota}><Plus size={14} /> Salvar nota</button>
          </div>
          <div className="space-y-3">
            {notas.map(n => (
              <div key={n.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#d2b99b]/30">
                <p className="text-sm text-gray-700 leading-relaxed">{n.texto}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-400">{format(new Date(n.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  <button onClick={() => salvarNotas(notas.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === 'checklist' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-4">
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Tarefa especifica para este cliente..." value={formTask} onChange={e => setFormTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarTask()} />
              <button className="btn-primary px-3" onClick={adicionarTask}><Plus size={16} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {checklistCliente.map(t => (
              <div key={t.id} className={`bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center gap-3 ${t.concluida ? 'border-green-200' : 'border-[#d2b99b]/30'}`}>
                <button onClick={() => toggleTask(t.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.concluida ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b]'}`}>
                  {t.concluida && <Check size={11} className="text-white" />}
                </button>
                <span className={`flex-1 text-sm ${t.concluida ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.titulo}</span>
                <button onClick={() => salvarChecklist(checklistCliente.filter(x => x.id !== t.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === 'calendario' && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
          {eventosCliente.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">Nenhum evento para este cliente no calendario</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d2b99b]/30 bg-[#f9f1e7]">
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Evento</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Status</th>
                </tr>
              </thead>
              <tbody>
                {eventosCliente.sort((a,b) => new Date(b.data) - new Date(a.data)).map(e => (
                  <tr key={e.id} className="border-b border-[#d2b99b]/20 hover:bg-[#f9f1e7]/50">
                    <td className="px-4 py-3 font-medium">{e.titulo}</td>
                    <td className="px-4 py-3"><span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: e.cor }} />{e.tipo}</td>
                    <td className="px-4 py-3 text-gray-500">{format(new Date(e.data + 'T12:00:00'), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3">{e.status_post && <span className="text-xs bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">{e.status_post}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {aba === 'pagamentos' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Valor mensal</div>
                <div className="text-xl font-bold text-[#486c96]">R$ {(cliente.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Dia de vencimento</div>
                <div className="text-xl font-bold text-[#486c96]">Dia {cliente.dia_pagamento}</div>
              </div>
              {fluxo.historico && fluxo.historico.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400">Total recebido (registros)</div>
                  <div className="text-xl font-bold text-green-600">
                    R$ {(fluxo.historico.length * (cliente.valor || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          </div>
          {fluxo.historico && fluxo.historico.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#d2b99b]/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d2b99b]/30 bg-[#f9f1e7]">
                    <th className="text-left px-4 py-3 font-semibold text-[#486c96]">Mes</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#486c96]">Valor esperado</th>
                  </tr>
                </thead>
                <tbody>
                  {fluxo.historico.map((h, i) => (
                    <tr key={i} className="border-b border-[#d2b99b]/20 hover:bg-[#f9f1e7]/50">
                      <td className="px-4 py-3 font-semibold text-[#486c96]">{h.mes}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">R$ {(cliente.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
