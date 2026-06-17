import {
  LayoutDashboard, Flame, DollarSign, Target, TrendingUp,
  Calendar, MessageSquare, CheckSquare, GraduationCap,
  Lightbulb, Lock, BookOpen, ChevronLeft, Menu, Settings, X, Building2, BarChart2
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'pautas', label: 'Pautas Quentes', icon: Flame },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'mensagens', label: 'Mensagens Prontas', icon: MessageSquare },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'cursos', label: 'Cursos & Estudos', icon: GraduationCap },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'resultados', label: 'Resultados', icon: BarChart2 },
  { id: 'senhas', label: 'Cofre de Senhas', icon: Lock },
  { id: 'processos', label: 'Processos', icon: BookOpen },
  { id: 'empresa', label: 'Minha Empresa', icon: Building2 },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, open, onToggle }) {
  const handleNav = (id) => {
    onNavigate(id);
    // Fecha no mobile ao navegar
    if (window.innerWidth < 768 && open) onToggle();
  };

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`flex flex-col border-r border-[#d2b99b]/40 transition-all duration-300 z-50
          fixed md:relative h-full md:h-screen
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          width: 240,
          minWidth: 240,
          background: 'white',
          top: 0,
          left: 0,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#d2b99b]/40">
          <div>
            <div className="text-[#486c96] font-bold text-lg leading-tight">duda araujo</div>
            <div className="text-[#5f86ad] text-xs font-medium tracking-widest uppercase">social media</div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-xl hover:bg-[#f9f1e7] text-[#486c96] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === id
                  ? 'bg-[#486c96] text-white'
                  : 'text-[#486c96] hover:bg-[#f9f1e7]'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#d2b99b]/40">
          <div className="text-xs text-[#d2b99b] font-medium">Central da Duda</div>
        </div>
      </aside>
    </>
  );
}
