import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { Flame, Plus, Trash2, RefreshCw, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AREAS_SUGERIDAS = [
  'Advocacia', 'Medicina', 'Odontologia', 'Nutricao', 'Psicologia',
  'Educacao Fisica', 'Fisioterapia', 'Arquitetura', 'Contabilidade',
  'Moda', 'Beleza e Estetica', 'Gastronomia', 'Imóveis', 'Financas Pessoais',
  'Empreendedorismo', 'Marketing Digital', 'Coaching', 'Veterinaria',
  'Fotografia', 'Design', 'Engenharia', 'RH e Gestao de Pessoas',
];

// Datas: { mes (1-12), dia, nome, areas[] }
const DATAS_IMPORTANTES = [
  { mes: 1, dia: 1, nome: 'Ano Novo', areas: ['todos'] },
  { mes: 1, dia: 27, nome: 'Dia Nacional da Saude', areas: ['Medicina', 'Nutricao', 'Psicologia', 'Odontologia', 'Fisioterapia', 'Educacao Fisica'] },
  { mes: 2, dia: 4, nome: 'Dia Mundial do Cancer', areas: ['Medicina'] },
  { mes: 2, dia: 11, nome: 'Dia da Mulher na Ciencia', areas: ['Medicina', 'Advocacia', 'Educacao'] },
  { mes: 3, dia: 8, nome: 'Dia Internacional da Mulher', areas: ['todos'] },
  { mes: 3, dia: 15, nome: 'Dia do Consumidor', areas: ['Advocacia', 'Marketing Digital', 'Empreendedorismo'] },
  { mes: 3, dia: 20, nome: 'Dia Mundial da Saude Bucal', areas: ['Odontologia'] },
  { mes: 3, dia: 21, nome: 'Dia Mundial da Sindrome de Down', areas: ['Medicina', 'Psicologia', 'Fisioterapia'] },
  { mes: 3, dia: 26, nome: 'Dia do Ballet / Dia da Danca', areas: ['Educacao Fisica'] },
  { mes: 4, dia: 2, nome: 'Dia Mundial do Autismo', areas: ['Psicologia', 'Medicina', 'Fisioterapia'] },
  { mes: 4, dia: 7, nome: 'Dia Mundial da Saude', areas: ['Medicina', 'Nutricao', 'Psicologia', 'Odontologia', 'Fisioterapia'] },
  { mes: 4, dia: 14, nome: 'Dia do Contador', areas: ['Contabilidade'] },
  { mes: 4, dia: 17, nome: 'Dia do Nutricionista', areas: ['Nutricao'] },
  { mes: 4, dia: 22, nome: 'Dia da Terra', areas: ['todos'] },
  { mes: 5, dia: 5, nome: 'Dia Mundial da Higiene das Maos', areas: ['Medicina', 'Odontologia'] },
  { mes: 5, dia: 10, nome: 'Dia das Maes', areas: ['todos'] },
  { mes: 5, dia: 18, nome: 'Dia Nacional do Combate ao Abuso Infantil', areas: ['Psicologia', 'Advocacia'] },
  { mes: 5, dia: 20, nome: 'Dia do Advogado', areas: ['Advocacia'] },
  { mes: 5, dia: 31, nome: 'Dia Mundial Sem Tabaco', areas: ['Medicina', 'Nutricao'] },
  { mes: 6, dia: 5, nome: 'Dia Mundial do Meio Ambiente', areas: ['todos'] },
  { mes: 6, dia: 12, nome: 'Dia dos Namorados', areas: ['todos'] },
  { mes: 6, dia: 21, nome: 'Dia do Fotografo', areas: ['Fotografia'] },
  { mes: 6, dia: 26, nome: 'Dia do Fisioterapeuta', areas: ['Fisioterapia'] },
  { mes: 7, dia: 20, nome: 'Dia do Amigo', areas: ['todos'] },
  { mes: 7, dia: 28, nome: 'Dia Mundial da Hepatite', areas: ['Medicina'] },
  { mes: 8, dia: 1, nome: 'Agosto Dourado - Amamentacao', areas: ['Medicina', 'Nutricao'] },
  { mes: 8, dia: 11, nome: 'Dia do Estudante', areas: ['Educacao', 'Coaching'] },
  { mes: 8, dia: 11, nome: 'Dia do Empreendedor', areas: ['Empreendedorismo', 'Marketing Digital', 'Coaching'] },
  { mes: 8, dia: 26, nome: 'Dia do Nutricionista (SP)', areas: ['Nutricao'] },
  { mes: 9, dia: 10, nome: 'Dia Mundial de Prevencao ao Suicidio', areas: ['Psicologia', 'Medicina'] },
  { mes: 9, dia: 13, nome: 'Dia do Programador', areas: ['Design', 'Marketing Digital'] },
  { mes: 9, dia: 21, nome: 'Dia Mundial do Alzheimer', areas: ['Medicina', 'Psicologia'] },
  { mes: 9, dia: 29, nome: 'Dia Mundial do Coracao', areas: ['Medicina', 'Nutricao', 'Educacao Fisica'] },
  { mes: 10, dia: 1, nome: 'Dia do Idoso / Outubro Rosa', areas: ['Medicina', 'Fisioterapia', 'Nutricao'] },
  { mes: 10, dia: 1, nome: 'Outubro Rosa - Cancer de Mama', areas: ['Medicina'] },
  { mes: 10, dia: 5, nome: 'Dia dos Professores', areas: ['Educacao'] },
  { mes: 10, dia: 10, nome: 'Dia Mundial da Saude Mental', areas: ['Psicologia', 'Medicina'] },
  { mes: 10, dia: 12, nome: 'Dia das Criancas', areas: ['todos'] },
  { mes: 10, dia: 15, nome: 'Dia do Contador', areas: ['Contabilidade'] },
  { mes: 10, dia: 20, nome: 'Dia do Medico', areas: ['Medicina'] },
  { mes: 10, dia: 25, nome: 'Dia do Fotografo', areas: ['Fotografia'] },
  { mes: 11, dia: 1, nome: 'Novembro Azul - Cancer de Prostata', areas: ['Medicina'] },
  { mes: 11, dia: 15, nome: 'Dia da Consciencia Negra', areas: ['todos'] },
  { mes: 11, dia: 20, nome: 'Dia Nacional da Consciencia Negra', areas: ['todos'] },
  { mes: 11, dia: 25, nome: 'Dia da Cuidadora', areas: ['Medicina', 'Fisioterapia', 'Psicologia'] },
  { mes: 12, dia: 1, nome: 'Dia Mundial da AIDS', areas: ['Medicina'] },
  { mes: 12, dia: 25, nome: 'Natal', areas: ['todos'] },
];

const MESES = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const PAUTAS_EXEMPLO = {
  'Advocacia': [
    { titulo: 'Novas regras trabalhistas 2026', ideia: 'Explique em 3 slides o que muda para empregados e empregadores. Use linguagem simples.' },
    { titulo: 'Divorcio consensual online', ideia: 'Como funciona o processo 100% digital? Quais os documentos necessarios? Reels explicativo.' },
    { titulo: 'LGPD para pequenas empresas', ideia: 'Checklist do que toda empresa precisa ter para estar em conformidade.' },
  ],
  'Nutricao': [
    { titulo: 'Jejum intermitente: verdades e mitos', ideia: 'Carrossel comparando o que a ciencia diz vs o que circula nas redes.' },
    { titulo: 'Alimentos ultraprocessados na mira da ANVISA', ideia: 'O que muda na rotulagem? Como educar seus pacientes sobre isso.' },
    { titulo: 'Saude intestinal e saude mental', ideia: 'Explique o eixo intestino-cerebro de forma visual e acessivel.' },
  ],
  'Medicina': [
    { titulo: 'Dengue: sintomas vs gripe', ideia: 'Infografico comparativo para compartilhar. Alta relevancia em epoca de surto.' },
    { titulo: 'Saude mental pos-pandemia', ideia: 'Dados atualizados + como seu consultorio pode acolher esses pacientes.' },
    { titulo: 'Exames preventivos por faixa etaria', ideia: 'Checklist por decada de vida. Salvar nos destaques.' },
  ],
  'Odontologia': [
    { titulo: 'Clareamento dental em casa: riscos', ideia: 'O que os kits vendidos online nao contam. Postagem de alerta + CTA para consulta.' },
    { titulo: 'Bruxismo e ansiedade', ideia: 'Connexao entre stress e saude bucal. Tendencia crescente.' },
    { titulo: 'Tratamento ortodontico adulto', ideia: 'Desmistificar que aparelho e so para criancas. Cases e antes/depois.' },
  ],
};

export default function PautasQuentes() {
  const [aba, setAba] = useState('pautas');
  const [areas, setAreas] = useState(() => getOrDefault('areas_cliente', []));
  const [pautas, setPautas] = useState(() => getOrDefault('pautas', []));
  const [novaArea, setNovaArea] = useState('');
  const [gerando, setGerando] = useState(false);

  const mesAtual = new Date().getMonth() + 1;

  const datasFiltradas = DATAS_IMPORTANTES.filter(d =>
    d.areas.includes('todos') || areas.some(a => d.areas.some(da => da.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(da.toLowerCase())))
  ).sort((a, b) => {
    // Ordena: meses futuros/atual primeiro, depois meses passados
    const ajustar = (m) => m < mesAtual ? m + 12 : m;
    return ajustar(a.mes) - ajustar(b.mes) || a.dia - b.dia;
  });

  const salvarAreas = (novas) => {
    setAreas(novas);
    set('areas_cliente', novas);
  };

  const adicionarArea = (area) => {
    if (!area.trim() || areas.includes(area.trim())) return;
    salvarAreas([...areas, area.trim()]);
    setNovaArea('');
  };

  const removerArea = (area) => {
    salvarAreas(areas.filter(a => a !== area));
  };

  const gerarPautas = () => {
    setGerando(true);
    setTimeout(() => {
      const novasPautas = [];
      areas.forEach(area => {
        const lista = PAUTAS_EXEMPLO[area];
        if (lista) {
          lista.forEach(p => {
            novasPautas.push({
              ...p,
              area,
              data: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
              id: Date.now() + Math.random(),
            });
          });
        } else {
          novasPautas.push({
            titulo: `Tendencias em ${area} esta semana`,
            ideia: `Pesquise as principais novidades e regulamentacoes da area de ${area} e transforme em conteudo educativo para seu publico.`,
            area,
            data: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
            id: Date.now() + Math.random(),
          });
        }
      });
      setPautas(novasPautas);
      set('pautas', novasPautas);
      setGerando(false);
    }, 1500);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Flame size={24} className="text-[#486c96]" />
        <h1 className="page-title mb-0">Pautas Quentes</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setAba('pautas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${aba === 'pautas' ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
          Pautas da Semana
        </button>
        <button onClick={() => setAba('datas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${aba === 'datas' ? 'bg-[#486c96] text-white' : 'bg-white text-[#486c96] border border-[#d2b99b]/40'}`}>
          <Calendar size={14} /> Datas Importantes
        </button>
      </div>

      {aba === 'datas' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">Datas importantes filtradas pelos nichos dos seus clientes. Configure as areas ao lado em "Pautas da Semana".</p>
          {areas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">
              Configure as areas dos seus clientes na aba "Pautas da Semana" para ver as datas importantes do nicho.
            </div>
          ) : datasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm text-gray-400 text-sm">
              Nenhuma data encontrada para as areas configuradas.
            </div>
          ) : (
            <div className="space-y-2">
              {datasFiltradas.map((d, i) => {
                const isHoje = d.mes === mesAtual && d.dia === new Date().getDate();
                const passado = d.mes < mesAtual || (d.mes === mesAtual && d.dia < new Date().getDate());
                return (
                  <div key={i} className={`bg-white rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-4 ${isHoje ? 'border-[#486c96] border-2' : 'border-[#d2b99b]/30'} ${passado && !isHoje ? 'opacity-50' : ''}`}>
                    <div className="text-center flex-shrink-0 w-12">
                      <div className="text-lg font-bold text-[#486c96]">{String(d.dia).padStart(2,'0')}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase">{MESES[d.mes-1].slice(0,3)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{d.nome}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {d.areas.includes('todos') ? (
                          <span className="text-[10px] bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">Todos os nichos</span>
                        ) : d.areas.map(a => (
                          <span key={a} className="text-[10px] bg-[#f9f1e7] text-[#486c96] px-2 py-0.5 rounded-full font-semibold">{a}</span>
                        ))}
                      </div>
                    </div>
                    {isHoje && <span className="text-xs font-bold bg-[#486c96] text-white px-2 py-0.5 rounded-full flex-shrink-0">Hoje!</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {aba === 'pautas' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurar areas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30">
          <h3 className="section-title">Areas dos meus clientes</h3>

          <div className="flex gap-2 mb-3">
            <input
              className="input flex-1"
              placeholder="Ex: Advocacia"
              value={novaArea}
              onChange={e => setNovaArea(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && adicionarArea(novaArea)}
            />
            <button className="btn-primary px-3" onClick={() => adicionarArea(novaArea)}>
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {areas.map(area => (
              <span
                key={area}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#486c96] text-white"
              >
                {area}
                <button onClick={() => removerArea(area)} className="hover:opacity-70">
                  <Trash2 size={10} />
                </button>
              </span>
            ))}
          </div>

          <div className="border-t border-[#d2b99b]/30 pt-3">
            <p className="text-xs text-gray-400 mb-2 font-medium">Sugestoes rapidas:</p>
            <div className="flex flex-wrap gap-1">
              {AREAS_SUGERIDAS.filter(a => !areas.includes(a)).slice(0, 8).map(area => (
                <button
                  key={area}
                  onClick={() => adicionarArea(area)}
                  className="px-2 py-1 rounded-lg text-xs bg-[#f9f1e7] text-[#486c96] hover:bg-[#d2b99b]/30 transition-colors"
                >
                  + {area}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            onClick={gerarPautas}
            disabled={areas.length === 0 || gerando}
          >
            <RefreshCw size={16} className={gerando ? 'animate-spin' : ''} />
            {gerando ? 'Gerando...' : 'Gerar pautas da semana'}
          </button>
        </div>

        {/* Pautas */}
        <div className="lg:col-span-2 space-y-4">
          {pautas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#d2b99b]/30">
              <Flame size={32} className="text-[#d2b99b] mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Selecione as areas dos seus clientes e clique em Gerar pautas</p>
            </div>
          ) : (
            pautas.map(pauta => (
              <div key={pauta.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2b99b]/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f9f1e7] text-[#486c96] mb-2">
                      {pauta.area}
                    </span>
                    <h3 className="font-bold text-[#486c96] mb-2">{pauta.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{pauta.ideia}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-3">Gerado em {pauta.data}</div>
              </div>
            ))
          )}
        </div>
      </div>}
    </div>
  );
}
