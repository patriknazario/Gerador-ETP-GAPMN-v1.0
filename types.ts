export interface EtpData {
  processo: string;
  problemaDescrito: string;
  descricaoNecessidade: string;
  areaRequisitante: string;
  requisitos: string;
  levantamentoMercado: string;
  descricaoSolucao: string;
  estimativaQuantidades: string;
  estimativaValor: string;
  justificativaParcelamento: string;
  contratacoesCorrelatas: string;
  alinhamentoPlanejamento: string;
  beneficios: string;
  providencias: string;
  impactosAmbientais: string;
  declaracaoViabilidade: string;
  responsaveis: string;
}

export type EtpDataKey = keyof EtpData;

export interface EtpItem {
  id: EtpDataKey;
  title: string;
  required: boolean;
  skip?: boolean;
}

export interface ChatMessage {
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  itemId?: EtpDataKey;
  itemTitle?: string;
  timestamp: number;
  approved?: boolean;
}