import { useState, useEffect } from 'react';
import './index.css';
import { initSeedData, sincronizarDoSupabase } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PautasQuentes from './pages/PautasQuentes';
import Financeiro from './pages/Financeiro';
import Metas from './pages/Metas';
import Investimentos from './pages/Investimentos';
import Calendario from './pages/Calendario';
import MensagensProntas from './pages/MensagensProntas';
import Checklist from './pages/Checklist';
import CursosConcluidos from './pages/CursosConcluidos';
import Insights from './pages/Insights';
import CofreSenhas from './pages/CofreSenhas';
import Processos from './pages/Processos';
import Ajustes from './pages/Ajustes';
import ClienteDetalhe from './pages/ClienteDetalhe';
import Empresa from './pages/Empresa';
import Resultados from './pages/Resultados';
import Cronograma from './pages/Cronograma';
import Feedbacks from './pages/Feedbacks';
import Relatorio from './pages/Relatorio';
import Onboarding from './pages/Onboarding';
import Aprendizado from './pages/Aprendizado';
import Referencias from './pages/Referencias';

const PAGES = {
  dashboard: Dashboard,
  pautas: PautasQuentes,
  financeiro: Financeiro,
  metas: Metas,
  investimentos: Investimentos,
  calendario: Calendario,
  mensagens: MensagensProntas,
  checklist: Checklist,
  cursos: CursosConcluidos,
  insights: Insights,
  senhas: CofreSenhas,
  processos: Processos,
  empresa: Empresa,
  resultados: Resultados,
  cronograma: Cronograma,
  feedbacks: Feedbacks,
  relatorio: Relatorio,
  onboarding: Onboarding,
  aprendizado: Aprendizado,
  referencias: Referencias,
  ajustes: Ajustes,
};

const PAGE_LABELS = {
  dashboard: 'Inicio', pautas: 'Pautas Quentes', financeiro: 'Financeiro',
  metas: 'Metas', investimentos: 'Investimentos', calendario: 'Calendario',
  mensagens: 'Mensagens Prontas', checklist: 'Checklist', cursos: 'Cursos & Estudos',
  insights: 'Insights', senhas: 'Cofre de Senhas', processos: 'Processos',
  empresa: 'Minha Empresa', resultados: 'Resultados', cronograma: 'Cronograma', feedbacks: 'Feedbacks',
  relatorio: 'Relatorio', onboarding: 'Onboarding', aprendizado: 'Aprendizado', referencias: 'Referencias', ajustes: 'Ajustes',
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [clienteDetalheId, setClienteDetalheId] = useState(null);

  useEffect(() => {
    sincronizarDoSupabase().then(temDados => {
      if (!temDados) initSeedData();
    });
  }, []);

  // Fecha sidebar automaticamente em mobile ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const PageComponent = PAGES[page] || Dashboard;
  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f9f1e7' }}>
      <Sidebar
        currentPage={page}
        onNavigate={(p) => { setPage(p); setClienteDetalheId(null); }}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#d2b99b]/30 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-[#486c96] hover:bg-[#f9f1e7]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="font-bold text-[#486c96] text-base">{PAGE_LABELS[page] || 'Central da Duda'}</span>
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-xl ml-auto object-cover" />
        </div>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {page === 'financeiro' && clienteDetalheId ? (
              <ClienteDetalhe clienteId={clienteDetalheId} onVoltar={() => setClienteDetalheId(null)} />
            ) : (
              <PageComponent onNavigate={setPage} onVerCliente={page === 'financeiro' ? setClienteDetalheId : undefined} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
