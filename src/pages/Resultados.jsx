import { useState, useMemo } from 'react';
import { getOrDefault, set } from '../store';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const METRICAS = [
  { key: 'seguidores',  label: 'Seguidores totais',    placeholder: '0',     sufixo: '',  tipo: 'inteiro' },
  { key: 'novos_seg',   label: 'Novos seguidores',      placeholder: '0',     sufixo: '',  tipo: 'inteiro' },
  { key: 'alcance',     label: 'Alcance',               placeholder: '0',     sufixo: '',  tipo: 'inteiro' },
  { key: 'impressoes',  label: 'Impressoes',            placeholder: '0',     sufixo: '',  tipo: 'inteiro' },
  { key: 'engajamento', label: 'Taxa de engajamento',   placeholder: '0,00',  sufixo: '%', tipo: 'decimal'  },
  { key: 'posts',       label: 'Posts publicados',      placeholder: '0',     sufixo: '',  tipo: 'inteiro' },
];

const mesLabel = (key) => {
  if (!key) return '';
  const [ano, mes] = key.split('-');
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${nomes[parseInt(mes) - 1]} ${ano}`;
};

const mesAtual = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const mesAnterior = (key) => {
  const [ano, mes] = key.split('-').map(Number);
  const d = new Date(ano, mes - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const mesSeguinte = (key) => {
  const [ano, mes] = key.split('-').map(Number);
  const d = new Date(ano, mes, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const parseNum = (v, tipo) => {
  if (!v && v !== 0) return null;
  const n = tipo === 'decimal'
    ? parseFloat(String(v).replace(',', '.'))
    : parseInt(String(v).replace(/\D/g, ''), 10);
  return isNaN(n) ? null : n;
};

const formatNum = (v, tipo, sufixo) => {
  if (v === null || v === undefined) return '—';
  const n = tipo === 'decimal'
    ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString('pt-BR');
  return `${n}${sufixo}`;
};

export default function Resultados() {
  const clientes = getOrDefault('clientes', []);
  const [resultados, setResultados] = useState(() => getOrDefault('resultados', {}));
  const [clienteId, setClienteId] = useState(clientes[0]?.id ? String(clientes[0].id) : '');
  const [mes, setMes] = useState(mesAtual());
  const [form, setForm] = useState({});

  const salvar = (r) => { setResultados(r); set('resultados', r); };

  const dadosMes = useMemo(() => (resultados[clienteId] || {})[mes] || {}, [resultados, clienteId, mes]);
  const dadosAnt = useMemo(() => (resultados[clienteId] || {})[mesAnterior(mes)] || {}, [resultados, clienteId, mes]);

  const getVal = (key) => form[`${clienteId}_${mes}_${key}`] !== undefined
    ? form[`${clienteId}_${mes}_${key}`]
    : (dadosMes[key] !== undefined ? String(dadosMes[key]) : '');

  const setVal = (key, val) => setForm(f => ({ ...f, [`${clienteId}_${mes}_${key}`]: val }));

  const salvarCampo = (key, val, tipo) => {
    const num = parseNum(val, tipo);
    const novo = {
      ...resultados,
      [clienteId]: {
        ...(resultados[clienteId] || {}),
        [mes]: { ...(dadosMes), [key]: num !== null ? num : val },
      },
    };
    salvar(novo);
    setForm(f => { const x = { ...f }; delete x[`${clienteId}_${mes}_${key}`]; return x; });
  };

  const salvarObs = (val) => {
    const novo = {
      ...resultados,
      [clienteId]: {
        ...(resultados[clienteId] || {}),
        [mes]: { ...dadosMes, obs: val },
      },
    };
    salvar(novo);
  };

  const delta = (key, tipo) => {
    const cur = parseNum(dadosMes[key], tipo);
    const ant = parseNum(dadosAnt[key], tipo);
    if (cur === null || ant === null) return null;
    const diff = cur - ant;
    const pct = ant !== 0 ? ((diff / ant) * 100).toFixed(1) : null;
    return { diff, pct, up: diff > 0, down: diff < 0 };
  };

  // Histórico: últimos 6 meses com dados
  const historico = useMemo(() => {
    if (!clienteId) return [];
    const dados = resultados[clienteId] || {};
    return Object.keys(dados)
      .filter(k => k !== mes && Object.keys(dados[k]).some(f => f !== 'obs' && dados[k][f] !== undefined && dados[k][f] !== ''))
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 6);
  }, [resultados, clienteId, mes]);

  const cliente = clientes.find(c => String(c.id) === clienteId);
  const hoje = mesAtual();

  return (
    <div>
      <h1 className="page-title">Resultados por Cliente</h1>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <>
          {/* Seletor de cliente */}
          <div className="flex flex-wrap gap-2 mb-6">
            {clientes.map(c => (
              <button key={c.id} onClick={() => { setClienteId(String(c.id)); setForm({}); }}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${String(c.id) === clienteId ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40 hover:border-[#486c96]'}`}>
                {c.nome}
              </button>
            ))}
          </div>

          {clienteId && (
            <>
              {/* Seletor de mês */}
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMes(mesAnterior(mes))} className="p-2 rounded-xl bg-white border border-[#d2b99b]/40 text-[#486c96] hover:bg-[#f9f1e7]">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold text-[#486c96] text-lg min-w-32 text-center">{mesLabel(mes)}</span>
                <button onClick={() => setMes(mesSeguinte(mes))} disabled={mes >= hoje}
                  className={`p-2 rounded-xl border text-[#486c96] transition-colors ${mes >= hoje ? 'border-gray-100 text-gray-300' : 'bg-white border-[#d2b99b]/40 hover:bg-[#f9f1e7]'}`}>
                  <ChevronRight size={16} />
                </button>
                <span className="text-xs text-gray-400 ml-1">{cliente?.nicho || cliente?.area || ''}</span>
              </div>

              {/* Grid de métricas */}
              <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-3">
                {METRICAS.map(m => {
                  const d = delta(m.key, m.tipo);
                  return (
                    <div key={m.key} className="bg-white rounded-2xl p-4 border border-[#d2b99b]/30 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">{m.label}</div>
                      <div className="flex items-end gap-2 mb-2">
                        <input
                          className="text-xl font-bold text-[#486c96] w-full bg-transparent focus:outline-none border-b border-transparent focus:border-[#486c96] transition-colors"
                          value={getVal(m.key)}
                          onChange={e => setVal(m.key, e.target.value)}
                          onBlur={e => salvarCampo(m.key, e.target.value, m.tipo)}
                          placeholder={m.placeholder}
                        />
                        {m.sufixo && <span className="text-sm text-gray-400 mb-0.5 flex-shrink-0">{m.sufixo}</span>}
                      </div>
                      {d ? (
                        <div className={`flex items-center gap-1 text-xs font-semibold ${d.up ? 'text-green-600' : d.down ? 'text-red-500' : 'text-gray-400'}`}>
                          {d.up ? <TrendingUp size={12} /> : d.down ? <TrendingDown size={12} /> : <Minus size={12} />}
                          {d.diff > 0 ? '+' : ''}{d.diff.toLocaleString('pt-BR')}{m.sufixo}
                          {d.pct !== null && <span className="opacity-70">({d.pct > 0 ? '+' : ''}{d.pct}%)</span>}
                          <span className="text-gray-300 font-normal ml-1">vs {mesLabel(mesAnterior(mes))}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-300">sem dado anterior</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Observações */}
              <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
                <label className="label">Observacoes do mes</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Ex: Reels viralizou na semana 2, queda no alcance por menos posts, cliente pediu mudanca no tema visual..."
                  defaultValue={dadosMes.obs || ''}
                  key={`${clienteId}_${mes}_obs`}
                  onBlur={e => salvarObs(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-1">Salva ao clicar fora ✓</p>
              </div>

              {/* Histórico */}
              {historico.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#d2b99b]/20">
                    <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide">Historico</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#f9f1e7]/50">
                          <th className="text-left px-4 py-2 text-gray-500 font-semibold">Mes</th>
                          {METRICAS.map(m => (
                            <th key={m.key} className="text-right px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">{m.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d2b99b]/10">
                        {historico.map(k => {
                          const d = (resultados[clienteId] || {})[k] || {};
                          return (
                            <tr key={k} className="hover:bg-[#f9f1e7]/30 cursor-pointer" onClick={() => setMes(k)}>
                              <td className="px-4 py-2.5 font-semibold text-[#486c96] whitespace-nowrap">{mesLabel(k)}</td>
                              {METRICAS.map(m => (
                                <td key={m.key} className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">
                                  {d[m.key] !== undefined && d[m.key] !== null ? formatNum(d[m.key], m.tipo, m.sufixo) : '—'}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
