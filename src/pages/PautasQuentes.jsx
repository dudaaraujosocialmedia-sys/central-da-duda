import { useState, useEffect } from 'react';
import { getOrDefault, set } from '../store';
import { Flame, Plus, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AREAS_SUGERIDAS = [
  'Advocacia', 'Medicina', 'Odontologia', 'Nutricao', 'Psicologia',
  'Educacao Fisica', 'Fisioterapia', 'Arquitetura', 'Contabilidade',
  'Moda', 'Beleza e Estetica', 'Gastronomia', 'Imóveis', 'Financas Pessoais',
  'Empreendedorismo', 'Marketing Digital', 'Coaching', 'Veterinaria',
  'Fotografia', 'Design', 'Engenharia', 'RH e Gestao de Pessoas',
];

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
  const [areas, setAreas] = useState(() => getOrDefault('areas_cliente', []));
  const [pautas, setPautas] = useState(() => getOrDefault('pautas', []));
  const [novaArea, setNovaArea] = useState('');
  const [gerando, setGerando] = useState(false);

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
      <div className="flex items-center gap-3 mb-6">
        <Flame size={24} className="text-[#486c96]" />
        <h1 className="page-title mb-0">Pautas Quentes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
