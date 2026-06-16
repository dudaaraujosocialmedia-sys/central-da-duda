import { useState } from 'react';
import { getOrDefault, set } from '../store';
import { MessageSquare, Plus, Trash2, Copy, Edit2, Check, X } from 'lucide-react';

const MSGS_PADRAO = [
  { id: 1, situacao: 'Boas-vindas ao novo cliente', mensagem: 'Ola! Seja muito bem-vindo(a)! Estou muito feliz em ter voce como cliente. Vamos fazer um trabalho incrivel juntos. Em breve entro em contato para alinharmos os proximos passos.' },
  { id: 2, situacao: 'Envio de relatorio mensal', mensagem: 'Ola! Segue em anexo o relatorio de metricas do mes de [MES]. Fiquei muito satisfeita com os resultados, especialmente [DESTAQUE]. Qualquer duvida, estou a disposicao!' },
  { id: 3, situacao: 'Lembrete de captacao de conteudo', mensagem: 'Ola! Passando para confirmar nossa sessao de captacao de conteudo no dia [DATA] as [HORA]. Por favor, confirme sua disponibilidade. Nos vemos la!' },
  { id: 4, situacao: 'Cobranca de pagamento', mensagem: 'Ola! Tudo bem? Passando para lembrar que a fatura do mes de [MES] vence dia [DATA]. Qualquer duvida sobre o pagamento, estou a disposicao.' },
  { id: 5, situacao: 'Atraso na entrega', mensagem: 'Ola! Quero ser transparente e avisar que o conteudo programado para [DATA] tera um pequeno atraso. Pretendo entregar ate [NOVA_DATA]. Desculpe o inconveniente!' },
  { id: 6, situacao: 'Proposta de novo servico', mensagem: 'Ola! Tenho acompanhado a evolucao do seu perfil e acredito que poderiamos potencializar ainda mais seus resultados com [SERVICO]. Que tal conversarmos sobre isso?' },
];

export default function MensagensProntas() {
  const [mensagens, setMensagens] = useState(() => getOrDefault('mensagens', MSGS_PADRAO));
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ situacao: '', mensagem: '' });
  const [copiado, setCopiado] = useState(null);
  const [busca, setBusca] = useState('');

  const salvar = (lista) => { setMensagens(lista); set('mensagens', lista); };

  const submit = () => {
    if (!form.situacao || !form.mensagem) return;
    if (editId) {
      salvar(mensagens.map(m => m.id === editId ? { ...form, id: editId } : m));
      setEditId(null);
    } else {
      salvar([...mensagens, { ...form, id: Date.now() }]);
    }
    setForm({ situacao: '', mensagem: '' });
    setShowForm(false);
  };

  const editar = (m) => {
    setForm({ situacao: m.situacao, mensagem: m.mensagem });
    setEditId(m.id);
    setShowForm(true);
  };

  const remover = (id) => salvar(mensagens.filter(m => m.id !== id));

  const copiar = async (id, texto) => {
    await navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const filtradas = mensagens.filter(m =>
    m.situacao.toLowerCase().includes(busca.toLowerCase()) ||
    m.mensagem.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Mensagens Prontas</h1>

      <div className="flex gap-3 mb-5">
        <input
          className="input flex-1"
          placeholder="Buscar mensagem..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm({ situacao: '', mensagem: '' }); }}>
          <Plus size={16} /> Nova mensagem
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm mb-5">
          <h4 className="font-semibold text-[#486c96] mb-4">{editId ? 'Editar mensagem' : 'Nova mensagem pronta'}</h4>
          <div className="space-y-3">
            <div>
              <label className="label">Situacao / contexto</label>
              <input className="input" value={form.situacao} onChange={e => setForm({...form, situacao: e.target.value})} placeholder="Ex: Boas-vindas ao cliente" />
            </div>
            <div>
              <label className="label">Mensagem</label>
              <p className="text-xs text-gray-400 mb-1">Use [CAMPO] para informacoes variaveis (ex: [NOME], [DATA])</p>
              <textarea className="input" rows={5} value={form.mensagem} onChange={e => setForm({...form, mensagem: e.target.value})} placeholder="Digite a mensagem..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary" onClick={submit}><Check size={16} className="inline mr-1" /> Salvar</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}><X size={16} className="inline mr-1" /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#d2b99b]/30 shadow-sm">
            <MessageSquare size={36} className="text-[#d2b99b] mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhuma mensagem encontrada</p>
          </div>
        ) : filtradas.map(m => (
          <div key={m.id} className="bg-white rounded-2xl p-5 border border-[#d2b99b]/30 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-bold text-[#486c96]">{m.situacao}</h3>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => copiar(m.id, m.mensagem)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${copiado === m.id ? 'bg-green-100 text-green-700' : 'bg-[#f9f1e7] text-[#486c96] hover:bg-[#d2b99b]/30'}`}
                >
                  {copiado === m.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                </button>
                <button onClick={() => editar(m)} className="text-[#486c96] hover:text-[#5f86ad]"><Edit2 size={14} /></button>
                <button onClick={() => remover(m.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-[#f9f1e7] rounded-xl p-3">{m.mensagem}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
