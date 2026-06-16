import { createClient } from '@supabase/supabase-js';
import {
  CLIENTES_INICIAIS, INVESTIMENTOS_INICIAIS, FLUXO_INICIAL,
  AREAS_INICIAIS, PROCESSOS_INICIAIS, CHECKLIST_MENSAL_INICIAL,
  TAREFAS_RECORRENTES_INICIAIS
} from './seedData';

const SUPABASE_URL = 'https://baedyrlvlbsjlattdbjz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZWR5cmx2bGJzamxhdHRkYmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjUxNTgsImV4cCI6MjA5NzIwMTE1OH0.UpV__R2jgAvBNcj5bp9tjXW_mhrzF2VuKMV-bOyzf7A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const KEYS = {
  clientes: 'da_clientes',
  financeiro: 'da_financeiro',
  metas: 'da_metas',
  investimentos: 'da_investimentos',
  eventos: 'da_eventos',
  mensagens: 'da_mensagens',
  checklist_mensal: 'da_checklist_mensal',
  checklist_diario: 'da_checklist_diario',
  tarefas_recorrentes: 'da_tarefas_recorrentes',
  cursos: 'da_cursos',
  insights: 'da_insights',
  senhas: 'da_senhas',
  processos: 'da_processos',
  pautas: 'da_pautas',
  areas_cliente: 'da_areas_cliente',
  fluxo_financeiro: 'da_fluxo_financeiro',
  ajustes_historico: 'da_ajustes_historico',
  checklist_semanal: 'da_checklist_semanal',
  periodos_calendario: 'da_periodos_calendario',
  processos_periodos: 'da_processos_periodos',
  topicos_estudo: 'da_topicos_estudo',
  seeded: 'da_seeded',
};

export function get(key) {
  try {
    const val = localStorage.getItem(KEYS[key]);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export function set(key, value) {
  localStorage.setItem(KEYS[key], JSON.stringify(value));
  // Sincroniza com Supabase em background
  const chave = KEYS[key];
  supabase.from('da_dados').upsert({ chave, valor: value, atualizado_em: new Date().toISOString() }).then(() => {});
}

export function getOrDefault(key, defaultValue) {
  const val = get(key);
  return val !== null ? val : defaultValue;
}

// Carrega todos os dados do Supabase e atualiza o localStorage
export async function sincronizarDoSupabase() {
  try {
    const { data, error } = await supabase.from('da_dados').select('*');
    if (error || !data || data.length === 0) return false;
    data.forEach(row => {
      localStorage.setItem(row.chave, JSON.stringify(row.valor));
    });
    return true;
  } catch { return false; }
}

export function initSeedData() {
  if (get('seeded')) return;

  set('clientes', CLIENTES_INICIAIS);
  set('investimentos', INVESTIMENTOS_INICIAIS);
  set('fluxo_financeiro', FLUXO_INICIAL);
  set('areas_cliente', AREAS_INICIAIS);
  set('processos', PROCESSOS_INICIAIS);
  set('checklist_mensal', CHECKLIST_MENSAL_INICIAL);
  set('checklist_diario', CHECKLIST_MENSAL_INICIAL.map(t => ({ ...t, id: t.id + 100, origem: 'mensal' })));
  set('tarefas_recorrentes', TAREFAS_RECORRENTES_INICIAIS);
  set('seeded', true);
}
