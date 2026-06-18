import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Plus, X, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfWeek, addWeeks, subWeeks, format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];

const chaveIso = (date) => format(date, 'yyyy-MM-dd');

const semanaKey = (inicioSemana) => chaveIso(inicioSemana);

export default function Semana() {
  const [semana, setSemana] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dados, setDados] = useState(() => getOrDefault('semana_planner', {}));
  const [inputs, setInputs] = useState({}); // { diaKey: texto }

  const key = semanaKey(semana);
  const hoje = chaveIso(new Date());

  const diasDaSemana = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(semana, i);
    return { label: DIAS[i], date: d, key: chaveIso(d) };
  });

  const salvar = (d) => { setDados(d); set('semana_planner', d); };

  const tarefasDia = (diaKey) => (dados[key]?.[diaKey] || []);

  const adicionarTarefa = (diaKey) => {
    const texto = inputs[diaKey]?.trim();
    if (!texto) return;
    const atual = dados[key]?.[diaKey] || [];
    salvar({
      ...dados,
      [key]: { ...(dados[key] || {}), [diaKey]: [...atual, { id: Date.now(), texto, feito: false }] },
    });
    setInputs(i => ({ ...i, [diaKey]: '' }));
  };

  const toggleTarefa = (diaKey, id) => {
    const lista = tarefasDia(diaKey).map(t => t.id === id ? { ...t, feito: !t.feito } : t);
    salvar({ ...dados, [key]: { ...(dados[key] || {}), [diaKey]: lista } });
  };

  const removerTarefa = (diaKey, id) => {
    const lista = tarefasDia(diaKey).filter(t => t.id !== id);
    salvar({ ...dados, [key]: { ...(dados[key] || {}), [diaKey]: lista } });
  };

  const mover = (diaKey, idx, direcao) => {
    const lista = [...tarefasDia(diaKey)];
    const novoIdx = idx + direcao;
    if (novoIdx < 0 || novoIdx >= lista.length) return;
    [lista[idx], lista[novoIdx]] = [lista[novoIdx], lista[idx]];
    salvar({ ...dados, [key]: { ...(dados[key] || {}), [diaKey]: lista } });
  };

  const totalSemana = diasDaSemana.reduce((acc, d) => acc + tarefasDia(d.key).length, 0);
  const feitosSemana = diasDaSemana.reduce((acc, d) => acc + tarefasDia(d.key).filter(t => t.feito).length, 0);

  return (
    <div>
      <h1 className="page-title">Planejamento Semanal</h1>

      {/* Navegação de semana */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSemana(subWeeks(semana, 1))}
          className="p-2 rounded-xl bg-white border border-[#d2b99b]/40 text-[#486c96] hover:bg-[#f9f1e7]">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 text-center">
          <span className="font-bold text-[#486c96]">
            {format(semana, "dd 'de' MMM", { locale: ptBR })} — {format(addDays(semana, 6), "dd 'de' MMM", { locale: ptBR })}
          </span>
          {totalSemana > 0 && (
            <span className="text-xs text-gray-400 ml-3">{feitosSemana}/{totalSemana} concluidas</span>
          )}
        </div>
        <button onClick={() => setSemana(addWeeks(semana, 1))}
          className="p-2 rounded-xl bg-white border border-[#d2b99b]/40 text-[#486c96] hover:bg-[#f9f1e7]">
          <ChevronRight size={16} />
        </button>
        <button onClick={() => setSemana(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          className="px-3 py-2 rounded-xl bg-white border border-[#d2b99b]/40 text-[#486c96] text-xs font-semibold hover:bg-[#f9f1e7]">
          Hoje
        </button>
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {diasDaSemana.map(({ label, date, key: diaKey }) => {
          const tarefas = tarefasDia(diaKey);
          const feitas = tarefas.filter(t => t.feito).length;
          const isHoje = diaKey === hoje;

          return (
            <div key={diaKey}
              className={`bg-white rounded-2xl border shadow-sm flex flex-col ${isHoje ? 'border-[#486c96]/40 ring-2 ring-[#486c96]/10' : 'border-[#d2b99b]/30'}`}>
              {/* Cabeçalho do dia */}
              <div className={`px-4 py-3 rounded-t-2xl border-b ${isHoje ? 'bg-[#486c96] border-[#486c96]' : 'bg-[#f9f1e7]/60 border-[#d2b99b]/20'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm ${isHoje ? 'text-white' : 'text-[#486c96]'}`}>{label}</div>
                    <div className={`text-[10px] ${isHoje ? 'text-white/70' : 'text-gray-400'}`}>
                      {format(date, "dd 'de' MMM", { locale: ptBR })}
                    </div>
                  </div>
                  {tarefas.length > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isHoje ? 'bg-white/20 text-white' : 'bg-[#486c96]/10 text-[#486c96]'}`}>
                      {feitas}/{tarefas.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Tarefas */}
              <div className="flex-1 p-3 space-y-1.5 min-h-[80px]">
                {tarefas.map((t, idx) => (
                  <div key={t.id} className="group flex items-start gap-1.5">
                    {/* Reordenar */}
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                      <button onClick={() => mover(diaKey, idx, -1)} disabled={idx === 0}
                        className="text-gray-300 hover:text-[#486c96] disabled:opacity-20">
                        <ChevronUp size={11} />
                      </button>
                      <button onClick={() => mover(diaKey, idx, 1)} disabled={idx === tarefas.length - 1}
                        className="text-gray-300 hover:text-[#486c96] disabled:opacity-20">
                        <ChevronDown size={11} />
                      </button>
                    </div>

                    {/* Checkbox */}
                    <button onClick={() => toggleTarefa(diaKey, t.id)}
                      className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${t.feito ? 'bg-[#486c96] border-[#486c96]' : 'border-[#d2b99b] hover:border-[#486c96]'}`}>
                      {t.feito && <Check size={9} className="text-white" />}
                    </button>

                    <span className={`flex-1 text-xs leading-relaxed ${t.feito ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {t.texto}
                    </span>

                    <button onClick={() => removerTarefa(diaKey, t.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input novo */}
              <div className="px-3 pb-3">
                <div className="flex gap-1.5">
                  <input
                    className="flex-1 text-xs border border-[#d2b99b]/40 rounded-xl px-3 py-2 focus:outline-none focus:border-[#486c96] bg-[#f9f1e7]/40 placeholder:text-gray-300"
                    placeholder="Adicionar tarefa..."
                    value={inputs[diaKey] || ''}
                    onChange={e => setInputs(i => ({ ...i, [diaKey]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && adicionarTarefa(diaKey)}
                  />
                  <button onClick={() => adicionarTarefa(diaKey)}
                    className="p-2 rounded-xl bg-[#486c96] text-white hover:bg-[#5f86ad] transition-colors flex-shrink-0">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
