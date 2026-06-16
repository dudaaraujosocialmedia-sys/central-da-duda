import { useState, useEffect } from 'react';
import './index.css';
import { initSeedData } from './store';
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
  ajustes: Ajustes,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clienteDetalheId, setClienteDetalheId] = useState(null);

  useEffect(() => { initSeedData(); }, []);

  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f9f1e7' }}>
      <Sidebar
        currentPage={page}
        onNavigate={(p) => { setPage(p); setClienteDetalheId(null); }}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">
          {page === 'financeiro' && clienteDetalheId ? (
            <ClienteDetalhe clienteId={clienteDetalheId} onVoltar={() => setClienteDetalheId(null)} />
          ) : (
            <PageComponent onNavigate={setPage} onVerCliente={page === 'financeiro' ? setClienteDetalheId : undefined} />
          )}
        </div>
      </main>
    </div>
  );
}
