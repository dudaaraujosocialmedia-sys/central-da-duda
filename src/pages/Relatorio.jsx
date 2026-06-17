import { useState, useMemo } from 'react';
import { getOrDefault } from '../store';
import { Copy, Check, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const METRICAS = [
  { key: 'seguidores',  label: 'Seguidores',          sufixo: '',  tipo: 'inteiro', emoji: '👥' },
  { key: 'novos_seg',   label: 'Novos seguidores',     sufixo: '',  tipo: 'inteiro', emoji: '🚀' },
  { key: 'alcance',     label: 'Alcance',              sufixo: '',  tipo: 'inteiro', emoji: '📡' },
  { key: 'impressoes',  label: 'Impressoes',           sufixo: '',  tipo: 'inteiro', emoji: '👁️' },
  { key: 'engajamento', label: 'Taxa de engajamento',  sufixo: '%', tipo: 'decimal',  emoji: '💬' },
  { key: 'posts',       label: 'Posts publicados',     sufixo: '',  tipo: 'inteiro', emoji: '📸' },
];

const mesLabel = (key) => {
  if (!key) return '';
  const [ano, mes] = key.split('-');
  const nomes = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${nomes[parseInt(mes) - 1]} de ${ano}`;
};

const mesLabelCurto = (key) => {
  if (!key) return '';
  const [ano, mes] = key.split('-');
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${nomes[parseInt(mes) - 1]}/${ano}`;
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
  if (v === null || v === undefined || v === '') return null;
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

const seta = (diff) => {
  if (diff > 0) return '▲';
  if (diff < 0) return '▼';
  return '→';
};

export default function Relatorio() {
  const clientes = getOrDefault('clientes', []);
  const resultados = getOrDefault('resultados', {});
  const [clienteId, setClienteId] = useState(clientes[0]?.id ? String(clientes[0].id) : '');
  const [mes, setMes] = useState(mesAtual());
  const [copiado, setCopiado] = useState(false);
  const [estilo, setEstilo] = useState('whatsapp'); // whatsapp | formal | resumido

  const hoje = mesAtual();
  const cliente = clientes.find(c => String(c.id) === clienteId);
  const dadosMes = useMemo(() => (resultados[clienteId] || {})[mes] || {}, [resultados, clienteId, mes]);
  const dadosAnt = useMemo(() => (resultados[clienteId] || {})[mesAnterior(mes)] || {}, [resultados, clienteId, mes]);

  const temDados = METRICAS.some(m => dadosMes[m.key] !== undefined && dadosMes[m.key] !== null);

  const linhas = useMemo(() => {
    return METRICAS.map(m => {
      const cur = parseNum(dadosMes[m.key], m.tipo);
      const ant = parseNum(dadosAnt[m.key], m.tipo);
      const diff = cur !== null && ant !== null ? cur - ant : null;
      const pct = diff !== null && ant !== 0 ? ((diff / ant) * 100).toFixed(1) : null;
      return { ...m, cur, ant, diff, pct };
    });
  }, [dadosMes, dadosAnt]);

  const gerarTexto = () => {
    const nome = cliente?.nome?.split(' ')[0] || 'Cliente';
    const perfil = cliente?.perfil ? `@${cliente.perfil.replace('@', '')}` : '';
    const labelMes = mesLabel(mes);
    const labelAnt = mesLabelCurto(mesAnterior(mes));

    if (estilo === 'resumido') {
      const linhasResumo = linhas
        .filter(l => l.cur !== null)
        .map(l => {
          let delta = '';
          if (l.diff !== null) delta = ` (${seta(l.diff)} ${l.diff > 0 ? '+' : ''}${formatNum(l.diff, l.tipo, l.sufixo)})`;
          return `${l.emoji} *${l.label}:* ${formatNum(l.cur, l.tipo, l.sufixo)}${delta}`;
        });
      return [
        `📊 *Resultados ${labelMes}*`,
        perfil ? `${perfil}` : '',
        '',
        ...linhasResumo,
        dadosMes.obs ? `\n📝 ${dadosMes.obs}` : '',
        '',
        '_Qualquer duvida estou a disposicao_ 🤍',
      ].filter(l => l !== undefined).join('\n');
    }

    if (estilo === 'formal') {
      const linhasFormal = linhas
        .filter(l => l.cur !== null)
        .map(l => {
          let delta = '';
          if (l.diff !== null && l.ant !== null) {
            const sinal = l.diff > 0 ? '+' : '';
            delta = ` | Variacao: ${sinal}${formatNum(l.diff, l.tipo, l.sufixo)}${l.pct !== null ? ` (${sinal}${l.pct}% em relacao a ${labelAnt})` : ''}`;
          }
          return `• ${l.label}: ${formatNum(l.cur, l.tipo, l.sufixo)}${delta}`;
        });
      return [
        `Prezada(o) ${nome},`,
        '',
        `Segue abaixo o relatorio de desempenho do perfil ${perfil} referente ao mes de ${labelMes}:`,
        '',
        ...linhasFormal,
        dadosMes.obs ? `\nObservacoes: ${dadosMes.obs}` : '',
        '',
        'Continuo a disposicao para qualquer esclarecimento.',
        'Atenciosamente,',
        'Duda Araujo | Social Media',
      ].filter(l => l !== undefined).join('\n');
    }

    // whatsapp (padrao)
    const linhasWpp = linhas
      .filter(l => l.cur !== null)
      .map(l => {
        let delta = '';
        if (l.diff !== null && l.ant !== null) {
          const sinal = l.diff > 0 ? '+' : '';
          delta = ` _(${seta(l.diff)} ${sinal}${formatNum(l.diff, l.tipo, l.sufixo)}${l.pct !== null ? ` / ${sinal}${l.pct}%` : ''} vs ${labelAnt})_`;
        }
        return `${l.emoji} *${l.label}:* ${formatNum(l.cur, l.tipo, l.sufixo)}${delta}`;
      });

    return [
      `Oi ${nome}! 🌸`,
      '',
      `Aqui estao os resultados do seu perfil ${perfil} em *${labelMes}*:`,
      '',
      ...linhasWpp,
      dadosMes.obs ? `\n✏️ _${dadosMes.obs}_` : '',
      '',
      'Continuamos evoluindo juntos! Se tiver duvidas ou quiser conversar sobre a estrategia, me chama 🤍',
    ].filter(l => l !== undefined).join('\n');
  };

  const texto = temDados ? gerarTexto() : '';

  const copiar = async () => {
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div>
      <h1 className="page-title">Gerador de Relatorio</h1>
      <p className="text-sm text-gray-500 mb-5">Gera o texto de relatorio mensal formatado para enviar ao cliente.</p>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Configurações */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-[#486c96] text-sm uppercase tracking-wide">Configurar relatorio</h3>

              {/* Cliente */}
              <div>
                <label className="label">Cliente</label>
                <div className="flex flex-wrap gap-2">
                  {clientes.map(c => (
                    <button key={c.id} onClick={() => setClienteId(String(c.id))}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${String(c.id) === clienteId ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40 hover:border-[#486c96]'}`}>
                      {c.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mês */}
              <div>
                <label className="label">Mes de referencia</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setMes(mesAnterior(mes))} className="p-2 rounded-xl bg-white border border-[#d2b99b]/40 text-[#486c96] hover:bg-[#f9f1e7]">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-bold text-[#486c96] min-w-36 text-center">{mesLabelCurto(mes)}</span>
                  <button onClick={() => setMes(mesSeguinte(mes))} disabled={mes >= hoje}
                    className={`p-2 rounded-xl border text-[#486c96] transition-colors ${mes >= hoje ? 'border-gray-100 text-gray-300' : 'bg-white border-[#d2b99b]/40 hover:bg-[#f9f1e7]'}`}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Estilo */}
              <div>
                <label className="label">Estilo</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'whatsapp', label: '📱 WhatsApp', desc: 'Informal e amigavel' },
                    { id: 'resumido', label: '⚡ Resumido', desc: 'So os numeros' },
                    { id: 'formal',   label: '📄 Formal',   desc: 'Tom profissional' },
                  ].map(e => (
                    <button key={e.id} onClick={() => setEstilo(e.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors text-left ${estilo === e.id ? 'bg-[#486c96] text-white border-[#486c96]' : 'bg-white text-[#486c96] border-[#d2b99b]/40 hover:border-[#486c96]'}`}>
                      <div>{e.label}</div>
                      <div className={`font-normal ${estilo === e.id ? 'text-white/70' : 'text-gray-400'}`}>{e.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dados do mês */}
            {clienteId && (
              <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
                <h3 className="font-bold text-[#486c96] text-sm uppercase tracking-wide mb-3">Dados de {mesLabelCurto(mes)}</h3>
                {temDados ? (
                  <div className="space-y-2">
                    {linhas.map(l => l.cur !== null && (
                      <div key={l.key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{l.emoji} {l.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#486c96]">{formatNum(l.cur, l.tipo, l.sufixo)}</span>
                          {l.diff !== null && (
                            <span className={`text-xs font-semibold ${l.diff > 0 ? 'text-green-600' : l.diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                              {l.diff > 0 ? '+' : ''}{formatNum(l.diff, l.tipo, l.sufixo)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sem dados para este mes. Preencha na pagina <span className="font-semibold">Resultados</span> primeiro.</p>
                )}
              </div>
            )}
          </div>

          {/* Preview e cópia */}
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-[#d2b99b]/30 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#d2b99b]/20">
                <span className="text-xs font-bold text-[#486c96] uppercase tracking-wide flex items-center gap-2">
                  <FileText size={13} /> Preview do relatorio
                </span>
                {temDados && (
                  <button onClick={copiar}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${copiado ? 'bg-green-500 text-white' : 'bg-[#486c96] text-white hover:bg-[#5f86ad]'}`}>
                    {copiado ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar texto</>}
                  </button>
                )}
              </div>
              <div className="p-5 flex-1 overflow-auto">
                {temDados ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{texto}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                    <FileText size={36} className="text-[#d2b99b] mb-3" />
                    <p className="font-semibold text-gray-500 mb-1">Sem dados para gerar relatorio</p>
                    <p className="text-sm">Selecione um cliente e um mes com dados preenchidos na pagina Resultados.</p>
                  </div>
                )}
              </div>
            </div>
            {temDados && (
              <button onClick={copiar}
                className={`w-full py-3 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${copiado ? 'bg-green-500 text-white' : 'bg-[#486c96] text-white hover:bg-[#5f86ad]'}`}>
                {copiado ? <><Check size={15} /> Copiado para a area de transferencia!</> : <><Copy size={15} /> Copiar relatorio</>}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
