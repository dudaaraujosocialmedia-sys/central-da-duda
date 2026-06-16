import {
  LayoutDashboard, Flame, DollarSign, Target, TrendingUp,
  Calendar, MessageSquare, CheckSquare, GraduationCap,
  Lightbulb, Lock, BookOpen, ChevronLeft, ChevronRight, Menu, Settings
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
  { id: 'cursos', label: 'Cursos Concluidos', icon: GraduationCap },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'senhas', label: 'Cofre de Senhas', icon: Lock },
  { id: 'processos', label: 'Processos', icon: BookOpen },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, open, onToggle }) {
  return (
    <aside
      className="flex flex-col border-r border-[#d2b99b]/40 transition-all duration-300"
      style={{
        width: open ? 240 : 72,
        minWidth: open ? 240 : 72,
        background: 'white',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#d2b99b]/40">
        {open && (
          <div>
            <div className="text-[#486c96] font-bold text-lg leading-tight">duda araujo</div>
            <div className="text-[#5f86ad] text-xs font-medium tracking-widest uppercase">social media</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-xl hover:bg-[#f9f1e7] text-[#486c96] transition-colors"
        >
          {open ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentPage === id
                ? 'bg-[#486c96] text-white'
                : 'text-[#486c96] hover:bg-[#f9f1e7]'
            }`}
            title={!open ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {open && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="px-4 py-4 border-t border-[#d2b99b]/40">
          <div className="text-xs text-[#d2b99b] font-medium">Central da Duda</div>
        </div>
      )}
    </aside>
  );
}
