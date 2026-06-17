import { useState, useRef } from 'react';
import { getOrDefault, set } from '../store';
import { Send, Check, Trash2, Clock, Download, Upload, AlertCircle } from 'lucide-react';

const BACKUP_KEYS = ['da_clientes','da_financeiro','da_metas','da_investimentos','da_eventos','da_mensagens','da_checklist_mensal','da_checklist_semanal','da_checklist_diario','da_tarefas_recorrentes','da_cursos','da_insights','da_senhas','da_processos','da_pautas','da_areas_cliente','da_fluxo_financeiro','da_ajustes_historico'];

export default function Ajustes() {
  const [pedido, setPedido] = useState('');
  const [historico, setHistorico] = useState(() => getOrDefault('ajustes_historico', []));
  const [copiado, setCopiado] = useState(false);
  const [importOk, setImportOk] = useState(null);
  const fileRef = useRef(null);

  const salvarHistorico = (h) => { setHistorico(h); set('ajustes_historico', h); };

  const enviarParaClaude = () => {
    if (!pedido.trim()) return;

    const mensagem = `Oi Claude! Sou a Duda Araujo, social media. Preciso de um ajuste no meu aplicativo "Central da Duda":\n\n${pedido.trim()}\n\nPor favor, faça essa alteração no código do projeto em C:\\Users\\chris\\projects\\duda-app`;

    navigator.clipboard.writeText(mensagem).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    });

    const novoRegistro = {
      id: Date.now(),
      texto: pedido.trim(),
      data: new Date().toISOString(),
      status: 'enviado',
    };
    salvarHistorico([novoRegistro, ...historico]);
    setPedido('');

    window.open('https://claude.ai/new', '_blank');
  };

  const remover = (id) => salvarHistorico(historico.filter(h => h.id !== id));

  const exportarBackup = () => {
    const dados = {};
    BACKUP_KEYS.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) dados[k] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `central-duda-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const dados = JSON.parse(ev.target.result);
        Object.entries(dados).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        setImportOk('sucesso');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setImportOk('erro');
      }
    };
    reader.readAsText(file);
  };

  const formatarData = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h1 className="page-title">Ajustes do Aplicativo</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30 mb-6">
        <h3 className="font-bold text-[#486c96] mb-1">Solicitar alteracao</h3>
        <p className="text-xs text-gray-400 mb-4">Descreva o que voce quer mudar no aplicativo. A mensagem sera copiada automaticamente e o Claude abrira em uma nova aba — so colar e enviar.</p>

        <textarea
          className="input w-full resize-none"
          rows={5}
          placeholder="Ex: Quero adicionar um campo de telefone no cadastro de clientes. / Quero mudar a cor dos botoes. / Quero uma nova pagina de..."
          value={pedido}
          onChange={e => setPedido(e.target.value)}
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={enviarParaClaude}
            disabled={!pedido.trim()}
          >
            {copiado ? <Check size={16} /> : <Send size={16} />}
            {copiado ? 'Copiado! Cole no Claude' : 'Enviar para o Claude'}
          </button>
          {copiado && (
            <span className="text-xs text-green-600 font-semibold">Mensagem copiada — cole no Claude que abriu</span>
          )}
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2b99b]/30 mb-6">
        <h3 className="font-bold text-[#486c96] mb-1">Backup dos dados</h3>
        <p className="text-xs text-gray-400 mb-4">Exporte todos os seus dados para transferir para outro dispositivo ou guardar como seguranca. Para restaurar, importe o arquivo JSON gerado.</p>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-primary flex items-center gap-2" onClick={exportarBackup}>
            <Download size={16} /> Exportar backup
          </button>
          <button className="btn-secondary flex items-center gap-2" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Importar backup
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importarBackup} />
        </div>
        {importOk === 'sucesso' && (
          <div className="flex items-center gap-2 mt-3 text-green-600 text-sm font-semibold">
            <Check size={14} /> Backup importado com sucesso. Recarregando...
          </div>
        )}
        {importOk === 'erro' && (
          <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
            <AlertCircle size={14} /> Arquivo invalido. Certifique-se de usar um backup gerado por este app.
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="section-title">Historico de pedidos</h3>
        {historico.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#d2b99b]/30 shadow-sm">
            <p className="text-gray-400 text-sm">Nenhum pedido enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map(h => (
              <div key={h.id} className="bg-white rounded-xl p-4 border border-[#d2b99b]/30 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-gray-700 flex-1 leading-relaxed">{h.texto}</p>
                  <button onClick={() => remover(h.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5"><Trash2 size={13} /></button>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400">
                  <Clock size={10} />
                  <span>{formatarData(h.data)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
