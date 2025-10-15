import React, { useState, useRef, useEffect } from 'react';
import { EtpData, EtpDataKey, ChatMessage, EtpItem } from '../types';
import { HELP_TEXTS } from '../constants';
import { Check, Edit2, HelpCircle, Send, Loader, CheckCircle, RefreshCw, FileText } from './icons';
// NOVO! Passo 1: Importar a função do nosso serviço de exportação.
import { gerarDocumentoWord } from '../services/exportService';

// --- Helper component to render markdown text with enhanced formatting ---

/**
 * Helper function to parse a string with markdown bold syntax (**text**)
 * into an array of strings and JSX elements for React.
 * @param text The string to parse.
 * @param keyPrefix A unique prefix for React keys.
 * @returns An array of strings and <strong> elements.
 */
// FIX: Replace JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const renderWithBold = (text: string, keyPrefix: string): (string | React.ReactElement)[] => {
    if (!text) return [];
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.filter(part => part.length > 0).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={`${keyPrefix}-${partIndex}`}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

/**
 * A React component that renders a string with basic Markdown formatting.
 * Supports paragraphs with spacing, headings, tables, and nested lists.
 */
const MarkdownRenderer: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
    if (!text) return null;

    // FIX: Replace JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const elements: React.ReactElement[] = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // CORREÇÃO GENERALIZADA 1: Remove títulos duplicados de QUALQUER item (ex: "### Item 7...").
        // A expressão regular busca por hashtags, a palavra "item" (opcional), um ou mais dígitos,
        // um separador opcional (ponto, traço) e então para.
        if (/^#+\s*(item\s)?\d+\s?[.–]?\s*/i.test(line.trim())) {
            i++;
            continue;
        }

        // CORREÇÃO GENERALIZADA 2: Trata subtítulos de "ETAPA" que podem vir com '###' ou '**'.
        // Remove a formatação markdown original e aplica a classe de subtítulo correta.
        const etapaMatch = line.trim().match(/^(?:#+\s*|\*\*)(ETAPA\s\d+.*)/i);
        if (etapaMatch) {
            const cleanContent = etapaMatch[1]; // Pega apenas o conteúdo (ex: "ETAPA 1: ...")
            // Envolvemos em ** para que o renderWithBold aplique o negrito corretamente ao título inteiro.
            elements.push(<h4 key={i} className="text-lg font-bold mt-5 mb-2 text-slate-700">{renderWithBold(`**${cleanContent}**`, `h4-${i}`)}</h4>);
            i++;
            continue;
        }
        
        // Headings (e.g., ## Title)
        if (line.startsWith('## ')) {
            elements.push(<h3 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800">{renderWithBold(line.substring(3), `h3-${i}`)}</h3>);
            i++;
            continue;
        }
        
        // Tables (detects header and separator lines)
        if (line.trim().startsWith('|') && lines[i+1]?.includes('---')) {
            const tableStartIndex = i;
            const tableLines = [];
            while(i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }

            const headerLine = tableLines[0];
            const headerCells = headerLine.split('|').map(s => s.trim()).slice(1, -1);
            const bodyRows = tableLines.slice(2);

            elements.push(
                <div key={`table-wrapper-${tableStartIndex}`} className="overflow-x-auto my-4 rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {headerCells.map((cell, index) => (
                                    <th key={index} className="p-3 border-b border-gray-200 text-left font-semibold text-gray-600">{cell}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bodyRows.map((rowLine, rowIndex) => {
                                if (!rowLine.trim()) return null;
                                const rowCells = rowLine.split('|').map(s => s.trim()).slice(1, -1);
                                return (
                                    <tr key={rowIndex} className="even:bg-white odd:bg-gray-50/50 border-t border-gray-200">
                                        {rowCells.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="p-3 text-gray-800">{cell}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
            continue;
        }

        // Unordered Lists (e.g., * Item)
        if (line.trim().startsWith('* ')) {
            const listStartIndex = i;
            const listItems = [];
            while (i < lines.length && lines[i].trim().startsWith('* ')) {
                const currentLine = lines[i];
                const match = currentLine.match(/^(\s*)(\*)\s(.*)/);
                if (match) {
                    const [, spaces, , content] = match;
                    const indentationLevel = Math.floor(spaces.length / 2);
                    listItems.push(
                        <li key={`li-${i}`} style={{ marginLeft: `${indentationLevel * 1.5}rem` }}>{renderWithBold(content, `li-content-${i}`)}</li>
                    );
                }
                i++;
            }
            elements.push(<ul key={`ul-${listStartIndex}`} className="list-disc list-inside my-4 pl-4 space-y-2">{listItems}</ul>);
            continue;
        }
        
        // Paragraphs
        if (line.trim() !== '') {
            elements.push(<p key={i} className="mb-4 leading-relaxed">{renderWithBold(line, `p-${i}`)}</p>);
            i++;
            continue;
        }

        // Empty line, just advance
        i++;
    }
    return <div className={className}>{elements}</div>;
};


// --- HelpTooltip Component ---
interface HelpTooltipProps {
  itemId: EtpDataKey;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ itemId }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <HelpCircle
        size={18}
        className="text-slate-400 hover:text-[#D13A6E] cursor-help transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      />
      {isOpen && (
        <div className="absolute left-0 top-6 z-50 w-80 bg-gray-900 text-white text-sm p-4 rounded-lg shadow-2xl border border-gray-700">
          <p className="leading-relaxed">{HELP_TEXTS[itemId]}</p>
          <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};


// --- InitialStage Component ---
interface InitialStageProps {
  etpData: EtpData;
  setEtpData: React.Dispatch<React.SetStateAction<EtpData>>;
  onStart: () => void;
}

export const InitialStage: React.FC<InitialStageProps> = ({ etpData, setEtpData, onStart }) => {
  const isButtonDisabled = !etpData.processo || !etpData.problemaDescrito;
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-[#D13A6E] mb-6">Informações Iniciais</h2>

      <div>
        <label className="block text-sm font-bold text-[#1E254A] mb-2 flex items-center gap-2">
          Número do Processo *
          <HelpTooltip itemId="processo" />
        </label>
        <input
          type="text"
          value={etpData.processo}
          onChange={(e) => setEtpData(prev => ({ ...prev, processo: e.target.value }))}
          className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#D13A6E]/20 focus:border-[#803366] font-mono text-lg transition-all bg-slate-50 text-slate-900"
          placeholder="Ex: 67298.001443/2024-86"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#1E254A] mb-2 flex items-center gap-2">
          Descreva o Problema *
          <HelpTooltip itemId="problemaDescrito" />
        </label>
        <p className="text-xs text-slate-600 mb-3 italic bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
          💡 <strong>Dica:</strong> Descreva de forma resumida e objetiva o problema ou necessidade.
          O sistema irá gerar automaticamente o texto técnico-jurídico conforme a Lei 14.133/2021.
        </p>
        <textarea
          value={etpData.problemaDescrito}
          onChange={(e) => setEtpData(prev => ({ ...prev, problemaDescrito: e.target.value }))}
          rows={6}
          className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#D13A6E]/20 focus:border-[#803366] text-base transition-all bg-slate-50 text-slate-900"
          placeholder="Ex: Os ar-condicionados do GAP estão com defeito, causando desconforto térmico e prejudicando as atividades. Precisamos de manutenção preventiva e corretiva urgente..."
        />
      </div>

      <button
        onClick={onStart}
        disabled={isButtonDisabled}
        style={{
          background: !isButtonDisabled
            ? 'linear-gradient(to right, #1E254A, #803366, #D13A6E)'
            : 'linear-gradient(to right, #6b7280, #9ca3af, #d1d5db)'
        }}
        className="w-full text-white py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale shadow-xl hover:brightness-110 hover:scale-105 hover:shadow-2xl disabled:hover:scale-100 disabled:hover:brightness-100"
      >
        <Send size={24} />
        Iniciar Geração Automática do ETP
      </button>
    </div>
  );
};


// --- GeneratingStage Component ---
interface GeneratingStageProps {
  chatMessages: ChatMessage[];
  isGenerating: boolean;
  editingItemId: EtpDataKey | null;
  failedItemId: EtpDataKey | null;
  onApprove: () => void;
  onRegenerate: (itemId: EtpDataKey) => void;
  onRegenerateWithInstructions: (itemId: EtpDataKey, instructions: string) => void;
  onStartEdit: (itemId: EtpDataKey) => void;
  onSaveEdit: (itemId: EtpDataKey) => void;
  onCancelEdit: () => void;
  onRetry: () => void;
  tempEditValue: string;
  setTempEditValue: (value: string) => void;
}

const LOADING_PHRASES = [
    "CGP - Transformando o Brasil",
    "Faça o seu melhor!",
    "Inovação a serviço da gestão pública.",
    "Eficiência e transparência em cada passo.",
    "Construindo um futuro melhor, juntos.",
    "O detalhe faz a diferença na gestão.",
    "Seu ETP está sendo elaborado com precisão...",
];

export const GeneratingStage: React.FC<GeneratingStageProps> = (props) => {
    const { chatMessages, isGenerating, editingItemId, failedItemId, onApprove, onRegenerate, onRegenerateWithInstructions, onStartEdit, onSaveEdit, onCancelEdit, onRetry, tempEditValue, setTempEditValue } = props;
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showRefinementInput, setShowRefinementInput] = useState<EtpDataKey | null>(null);
    const [refinementText, setRefinementText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    
    // Find the index of the last message from the assistant to correctly place the action buttons
    const lastAssistantMsgIndex = chatMessages.map(m => m.type).lastIndexOf('assistant');

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (isGenerating) {
            intervalId = setInterval(() => {
                setPhraseIndex(prevIndex => (prevIndex + 1) % LOADING_PHRASES.length);
            }, 2500);
        }
        return () => clearInterval(intervalId);
    }, [isGenerating]);


    return (
        <div className="flex flex-col h-[600px]">
            <div className="p-6 text-white border-b-4 border-[#D13A6E] shadow-xl" style={{ background: 'linear-gradient(to right, #1E254A, #803366, #D13A6E)' }}>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <Check size={28} className="text-green-600" style={{ strokeWidth: '3px' }} />
                    </div>
                    Geração Automática em Andamento
                </h2>
                <p className="text-base mt-2 text-white font-medium">Cada item será apresentado para sua validação</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'system' && (<div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg text-sm font-medium border border-blue-300">{msg.content}</div>)}
                        {msg.type === 'error' && (
                            <div className="w-full bg-red-50 border-2 border-red-300 rounded-xl p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-white font-bold text-lg">✕</span></div>
                                    <div className="flex-1">
                                        <p className="text-red-800 font-semibold mb-1">Erro na Geração</p>
                                        <p className="text-red-700 text-sm">{msg.content}</p>
                                    </div>
                                </div>
                                {failedItemId && !isGenerating && (
                                    <button onClick={onRetry} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 hover:brightness-110">
                                        <RefreshCw size={20} /> Tentar Novamente
                                    </button>
                                )}
                            </div>
                        )}
                        {msg.type === 'user' && (<div className="bg-[#D13A6E] text-white px-4 py-2 rounded-lg text-sm font-medium">{msg.content}</div>)}
                        {msg.type === 'assistant' && msg.itemId && (
                            <div className="w-full bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-lg text-[#D13A6E] flex items-center gap-2">{msg.itemTitle}<HelpTooltip itemId={msg.itemId} /></h4>
                                </div>
                                {editingItemId === msg.itemId ? (
                                    <div className="space-y-3">
                                        <textarea value={tempEditValue} onChange={(e) => setTempEditValue(e.target.value)} rows={10} className="w-full p-4 border-2 border-[#803366] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#D13A6E]/20 text-base" />
                                        <div className="flex gap-3">
                                            <button onClick={() => onSaveEdit(msg.itemId!)} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold">✓ Salvar</button>
                                            <button onClick={onCancelEdit} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all font-semibold">✕ Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <MarkdownRenderer text={msg.content} className="text-slate-800 leading-relaxed mb-4" />
                                        
                                        {/* Refinement input can now appear under ANY message */}
                                        {showRefinementInput === msg.itemId ? (
                                            <div className="mb-4 bg-blue-50 border-2 border-blue-300 p-4 rounded-xl">
                                                <label className="block text-sm font-bold text-[#1E254A] mb-2">💬 Instruções adicionais:</label>
                                                <p className="text-xs text-slate-600 mb-3 italic">Descreva o que você quer adicionar, mudar ou melhorar nesta resposta.</p>
                                                <textarea value={refinementText} onChange={(e) => setRefinementText(e.target.value)} placeholder="Ex: Incluir que o responsável é o Major Silva e mencionar que temos 3 técnicos capacitados..." rows={4} className="w-full p-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 text-sm" />
                                                <div className="flex gap-3 mt-3">
                                                    <button onClick={() => {
                                                        onRegenerateWithInstructions(msg.itemId!, refinementText);
                                                        setShowRefinementInput(null);
                                                        setRefinementText('');
                                                    }} disabled={!refinementText.trim() || isGenerating} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">🔄 Regenerar com Essas Instruções</button>
                                                    <button onClick={() => { setShowRefinementInput(null); setRefinementText(''); }} className="px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all font-semibold text-sm">Cancelar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Show the 'add info' link ONLY on the current, unapproved item */
                                            !msg.approved && !isGenerating && idx === lastAssistantMsgIndex && (
                                                <button onClick={() => { setShowRefinementInput(msg.itemId!); setRefinementText(''); }} className="mb-4 text-sm text-[#803366] hover:text-[#D13A6E] font-semibold flex items-center gap-2 transition-colors">➕ Adicionar informações para refinar esta resposta</button>
                                            )
                                        )}

                                        {/* Actions for the CURRENT, unapproved item */}
                                        {!msg.approved && !isGenerating && idx === lastAssistantMsgIndex && (
                                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                                <button onClick={onApprove} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"><CheckCircle size={20} />Aprovar e Continuar</button>
                                                <button onClick={() => onStartEdit(msg.itemId!)} style={{ background: '#D13A6E' }} className="flex-1 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 hover:brightness-110 hover:scale-105"><Edit2 size={20} />Editar</button>
                                                <button onClick={() => onRegenerate(msg.itemId!)} className="flex-1 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-all font-semibold flex items-center justify-center gap-2"><RefreshCw size={20} />Regenerar</button>
                                            </div>
                                        )}

                                        {/* Actions for PREVIOUSLY approved items */}
                                        {msg.approved && (
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                                                <span className="flex items-center gap-2 text-green-700 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">
                                                    <CheckCircle size={18} /> Aprovado
                                                </span>
                                                <button onClick={() => { setShowRefinementInput(msg.itemId!); setRefinementText(''); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 p-2 rounded-lg hover:bg-blue-100 transition-colors">
                                                    <Edit2 size={16} /> Editar
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {isGenerating && (
                    <div className="flex flex-col justify-center items-center py-8">
                        <div className="flex items-center">
                            <Loader className="animate-spin text-[#D13A6E]" size={32} />
                            <span className="ml-3 text-slate-600 font-medium text-lg">Gerando conteúdo...</span>
                        </div>
                        <p className="mt-4 text-slate-500 text-sm font-semibold">{LOADING_PHRASES[phraseIndex]}</p>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};

// --- CompletedStage Component ---
interface CompletedStageProps {
  etpData: EtpData;
  items: EtpItem[];
}

export const CompletedStage: React.FC<CompletedStageProps> = ({ etpData, items }) => {
  const endOfPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfPageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // NOVO! Passo 2: Criar a função que prepara os dados e chama o serviço de exportação.
  const handleExportWordClick = () => {
    // Transforma os dados do ETP para o formato que o serviço espera: { titulo, texto }
    const dataParaExportar = items
      .map(item => {
        const texto = etpData[item.id] || '';
        return {
          titulo: item.title,
          texto: texto,
        };
      })
      .filter(item => item.texto); // Garante que seções vazias não sejam incluídas

    if (dataParaExportar.length === 0) {
      alert("Não há conteúdo para exportar.");
      return;
    }

    // Chama a função do serviço para gerar e baixar o arquivo .docx
    // O nome do arquivo incluirá o número do processo para melhor organização.
    gerarDocumentoWord(dataParaExportar, `ETP-${etpData.processo || 'documento'}.docx`);
  };

  return (
    <div className="p-8">
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-green-800 mb-2 flex items-center gap-3">
          <CheckCircle size={32} className="text-green-600" />
          ETP Concluído com Sucesso!
        </h2>
        <p className="text-green-700">
          Todos os itens foram gerados e validados. Você pode revisar o documento completo abaixo e exportar para impressão.
        </p>
      </div>

      <div className="space-y-6 mb-8 print-content">
        {items.map((item) => {
            const itemData = etpData[item.id];
            if (!itemData) return null;
            return (
                <div key={item.id} className="border-l-4 border-[#D13A6E] pl-6 py-4 bg-gray-50 rounded-r-xl break-after-page">
                    <h3 className="text-xl font-bold text-[#D13A6E] mb-3 flex items-center gap-2">
                        {item.title}
                        {item.required && <span className="text-red-500">*</span>}
                    </h3>
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <MarkdownRenderer text={itemData} className="text-slate-800 leading-relaxed" />
                    </div>
                </div>
            )
        })}
      </div>

      {/* Ações Finais */}
      <div className="mt-8">
        <button
          onClick={handleExportWordClick}
          className="w-full bg-gradient-to-r from-[#803366] via-[#D13A6E] to-[#ff4f8b] text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-4"
        >
          <FileText size={28} />
          Exportar para Word (.docx)
        </button>
      </div>
      <div ref={endOfPageRef} />
    </div>
  );
};