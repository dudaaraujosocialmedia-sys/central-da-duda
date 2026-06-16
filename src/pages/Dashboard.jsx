import { getOrDefault } from '../store';
import { Target, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard({ onNavigate }) {
  const clientes = getOrDefault('clientes', []);
  const metas = getOrDefault('metas', []);
  const eventos = getOrDefault('eventos', []);
  const checklistDiario = getOrDefault('checklist_diario', []);

  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const mesHoje = hoje.getMonth();
  const anoHoje = hoje.getFullYear();

  const valorEfetivo = (c) => {
    if (!c.data_entrada || !c.valor_onboarding) return c.valor || 0;
    const entrada = new Date(c.data_entrada + 'T12:00:00');
    if (entrada.getMonth() === mesHoje && entrada.getFullYear() === anoHoje) return c.valor_onboarding;
    return c.valor || 0;
  };

  const saudacao = () => {
    const h = hoje.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const proxEventos = eventos
    .filter(e => new Date(e.data) >= hoje)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 5);

  const metasAtivas = metas.filter(m => !m.concluida).slice(0, 3);
  const tarefasHoje = checklistDiario.filter(t => !t.concluida).length;
  const totalTarefas = checklistDiario.length;

  // Pagamentos chegando (proximos 5 dias ou atrasados)
  const alertasPagamento = clientes
    .filter(c => c.status === 'ativo' && c.dia_pagamento)
    .map(c => {
      const dia = parseInt(c.dia_pagamento);
      let diasAte = dia - diaHoje;
      if (diasAte < -1) {
        const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
        diasAte = diasNoMes - diaHoje + dia;
      }
      return { ...c, diasAte, valorPagamento: valorEfetivo(c) };
    })
    .filter(c => c.diasAte >= -1 && c.diasAte <= 5)
    .sort((a, b) => a.diasAte - b.diasAte);

  const cards = [
    { label: 'Clientes ativos', value: clientes.filter(c => c.status === 'ativo').length, color: '#486c96', icon: '★', page: 'financeiro' },
    { label: 'Tarefas hoje', value: `${totalTarefas - tarefasHoje}/${totalTarefas}`, color: '#5f86ad', icon: '✓', page: 'checklist' },
    { label: 'Metas ativas', value: metasAtivas.length, color: '#d2b99b', icon: '◎', page: 'metas' },
    { label: 'Proximos eventos', value: proxEventos.length, color: '#486c96', icon: '◷', page: 'calendario' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#486c96]">{saudacao()}, Duda</h1>
        <p className="text-[#d2b99b] text-sm mt-1 font-medium">
          {format(hoje, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Alertas de pagamento */}
      {alertasPagamento.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-600" />
            <h3 className="font-semibold text-amber-700 text-sm">Pagamentos chegando</h3>
          </div>
          <div className="space-y-2">
            {alertasPagamento.map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">{c.nome}</span>
                  <span className="text-xs text-gray-400 ml-2">dia {c.dia_pagamento}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#486c96]">
                    R$ {c.valorPagamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {c.valorPagamento !== (c.valor || 0) && <span className="text-[10px] text-amber-500 ml-1 font-semibold">1° mes</span>}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    c.diasAte < 0 ? 'bg-red-100 text-red-700' :
                    c.diasAte === 0 ? 'bg-orange-100 text-orange-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {c.diasAte < 0 ? 'Ontem' : c.diasAte === 0 ? 'Hoje' : `em ${c.diasAte}d`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.page)}
            className="bg-white rounded-2xl p-5 text-left shadow-sm border border-[#d2b99b]/30 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2" style={{ color: card.color }}>{card.icon}</div>
            <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">{card.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-[#486c96]" />
            <h3 className="font-semibold text-[#486c96]">Proximos compromissos</h3>
          </div>
          {proxEventos.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum compromisso agendado</p>
          ) : (
            <div className="space-y-3">
              {proxEventos.map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: ev.cor || '#486c96' }}>
                    <span>{format(new Date(ev.data), 'dd')}</span>
                    <span className="text-[10px] opacity-80">{format(new Date(ev.data), 'MMM', { locale: ptBR })}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{ev.titulo}</div>
                    <div className="text-xs text-gray-400">{ev.tipo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-[#486c96]" />
            <h3 className="font-semibold text-[#486c96]">Metas em andamento</h3>
          </div>
          {metasAtivas.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma meta cadastrada</p>
          ) : (
            <div className="space-y-3">
              {metasAtivas.map((meta, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{meta.titulo}</span>
                    <span className="text-[#486c96] font-bold">{meta.progresso || 0}%</span>
                  </div>
                  <div className="w-full bg-[#f9f1e7] rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${meta.progresso || 0}%`, background: '#486c96' }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{meta.periodo}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
