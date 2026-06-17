import { useState } from 'react';
import {
  LayoutDashboard, Flame, DollarSign, Target, TrendingUp,
  Calendar, MessageSquare, CheckSquare, GraduationCap,
  Lightbulb, Lock, BookOpen, Settings, X, Building2, BarChart2,
  CalendarDays, Heart, FileText, UserCheck, BookMarked, Bookmark,
  ChevronDown
} from 'lucide-react';

const GRUPOS = [
  {
    id: 'inicio',
    label: null,
    items: [
      { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    items: [
      { id: 'financeiro',  label: 'Financeiro',  icon: DollarSign },
      { id: 'onboarding',  label: 'Onboarding',  icon: UserCheck },
      { id: 'resultados',  label: 'Resultados',  icon: BarChart2 },
      { id: 'relatorio',   label: 'Relatorio',   icon: FileText },
      { id: 'feedbacks',   label: 'Feedbacks',   icon: Heart },
    ],
  },
  {
    id: 'conteudo',
    label: 'Conteudo',
    items: [
      { id: 'cronograma',  label: 'Cronograma',       icon: CalendarDays },
      { id: 'pautas',      label: 'Pautas Quentes',   icon: Flame },
      { id: 'insights',    label: 'Projetos',         icon: Lightbulb },
      { id: 'mensagens',   label: 'Mensagens Prontas',icon: MessageSquare },
      { id: 'referencias', label: 'Referencias',      icon: Bookmark },
    ],
  },
  {
    id: 'operacional',
    label: 'Operacional',
    items: [
      { id: 'calendario',  label: 'Calendario',  icon: Calendar },
      { id: 'checklist',   label: 'Checklist',   icon: CheckSquare },
      { id: 'processos',   label: 'Processos',   icon: BookOpen },
    ],
  },
  {
    id: 'financas',
    label: 'Financas',
    items: [
      { id: 'metas',        label: 'Metas',        icon: Target },
      { id: 'investimentos',label: 'Investimentos', icon: TrendingUp },
      { id: 'empresa',      label: 'Minha Empresa', icon: Building2 },
      { id: 'senhas',       label: 'Cofre de Senhas',icon: Lock },
    ],
  },
  {
    id: 'crescimento',
    label: 'Crescimento',
    items: [
      { id: 'cursos',      label: 'Cursos & Estudos', icon: GraduationCap },
      { id: 'aprendizado', label: 'Aprendizado',      icon: BookMarked },
    ],
  },
  {
    id: 'config',
    label: null,
    items: [
      { id: 'ajustes', label: 'Ajustes', icon: Settings },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate, open, onToggle }) {
  const grupoAtivo = GRUPOS.find(g => g.items.some(i => i.id === currentPage))?.id || 'inicio';
  const [abertos, setAbertos] = useState(() => {
    const inicial = {};
    GRUPOS.forEach(g => { inicial[g.id] = true; });
    return inicial;
  });

  const toggleGrupo = (id) => setAbertos(a => ({ ...a, [id]: !a[id] }));

  const handleNav = (id) => {
    onNavigate(id);
    if (window.innerWidth < 768 && open) onToggle();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onToggle} />
      )}

      <aside
        className={`flex flex-col border-r border-[#d2b99b]/40 transition-all duration-300 z-50
          fixed md:relative h-full md:h-screen
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ width: 240, minWidth: 240, background: 'white', top: 0, left: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#d2b99b]/40">
          <div>
            <div className="text-[#486c96] font-bold text-lg leading-tight">duda araujo</div>
            <div className="text-[#5f86ad] text-xs font-medium tracking-widest uppercase">social media</div>
          </div>
          <button onClick={onToggle} className="p-2 rounded-xl hover:bg-[#f9f1e7] text-[#486c96] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {GRUPOS.map(grupo => (
            <div key={grupo.id} className="mb-1">
              {/* Cabeçalho do grupo */}
              {grupo.label && (
                <button
                  onClick={() => toggleGrupo(grupo.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#d2b99b] hover:text-[#486c96] transition-colors"
                >
                  {grupo.label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${abertos[grupo.id] ? 'rotate-0' : '-rotate-90'}`}
                  />
                </button>
              )}

              {/* Itens */}
              {(abertos[grupo.id] || !grupo.label) && (
                <div className="space-y-0.5">
                  {grupo.items.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleNav(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        currentPage === id
                          ? 'bg-[#486c96] text-white'
                          : 'text-[#486c96] hover:bg-[#f9f1e7]'
                      }`}
                    >
                      <Icon size={17} className="flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#d2b99b]/40">
          <div className="text-xs text-[#d2b99b] font-medium">Central da Duda</div>
        </div>
      </aside>
    </>
  );
}
