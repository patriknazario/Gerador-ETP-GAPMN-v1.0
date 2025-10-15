
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EtpData, ChatMessage, EtpDataKey } from './types';
import { ETP_ITEMS } from './constants';
import { getPromptFor } from './constants';
import { generateEtpContent } from './services/geminiService';
import { InitialStage, GeneratingStage, CompletedStage } from './components/stages';
import { FileText, ExternalLink } from './components/icons';

// --- PrintStyles Component ---
const PrintStyles: React.FC = () => (
  <style>{`
    @media print {
      body * {
        visibility: hidden;
      }
      .print-content, .print-content * {
        visibility: visible;
      }
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none;
      }
    }
  `}</style>
);


// --- App Component ---
const App: React.FC = () => {
  const [stage, setStage] = useState<'initial' | 'generating' | 'complete'>('initial');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [editingItemId, setEditingItemId] = useState<EtpDataKey | null>(null);
  const [tempEditValue, setTempEditValue] = useState('');
  const [failedItemId, setFailedItemId] = useState<EtpDataKey | null>(null);

  const [etpData, setEtpData] = useState<EtpData>({
    processo: '', problemaDescrito: '', descricaoNecessidade: '', areaRequisitante: '',
    requisitos: '', levantamentoMercado: '', descricaoSolucao: '', estimativaQuantidades: '',
    estimativaValor: '', justificativaParcelamento: '', contratacoesCorrelatas: '',
    alinhamentoPlanejamento: '', beneficios: '', providencias: '', impactosAmbientais: '',
    declaracaoViabilidade: '', responsaveis: ''
  });

  const addMessage = useCallback((type: ChatMessage['type'], content: string, itemId: EtpDataKey | null = null, itemTitle: string | null = null) => {
    setChatMessages(prev => [...prev, { type, content, itemId: itemId || undefined, itemTitle: itemTitle || undefined, timestamp: Date.now(), approved: false }]);
  }, []);

  const generateNextItem = useCallback(async () => {
    const nextItemIndex = ETP_ITEMS.findIndex((item, idx) => idx > 0 && !item.skip && !etpData[item.id]);
    if (nextItemIndex === -1) {
      setStage('complete');
      addMessage('system', '✅ Todos os itens do ETP foram gerados com sucesso! Você pode visualizar o documento completo abaixo e exportar para impressão.');
      return;
    }

    const item = ETP_ITEMS[nextItemIndex];
    setIsGenerating(true);
    addMessage('system', `🤖 Gerando ${item.title}...`);

    try {
      const prompt = getPromptFor(item.id, etpData);
      if (!prompt) throw new Error(`Prompt não encontrado para o item ${item.id}`);

      const generatedText = await generateEtpContent(prompt);
      
      setEtpData(prev => ({ ...prev, [item.id]: generatedText }));
      addMessage('assistant', generatedText, item.id, item.title);
      setIsGenerating(false);
      setFailedItemId(null);
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      setFailedItemId(item.id);
      addMessage('error', `❌ Erro ao gerar ${item.title}: ${errorMessage}`);
      setIsGenerating(false);
    }
  }, [etpData, addMessage]);
  
  const handleStartGeneration = useCallback(() => {
    setStage('generating');
    addMessage('system', '🚀 Iniciando geração automática do ETP. O primeiro item (Descrição da Necessidade) será gerado com base no problema descrito.');
    setTimeout(() => generateNextItem(), 1000);
  }, [addMessage, generateNextItem]);

  const handleApprove = useCallback(() => {
     setChatMessages(prev => {
        const lastAssistantMsgIndex = prev.map(m => m.type).lastIndexOf('assistant');
        if (lastAssistantMsgIndex === -1) return prev;
        
        return prev.map((msg, index) => 
            index === lastAssistantMsgIndex ? { ...msg, approved: true } : msg
        );
    });
    setTimeout(() => generateNextItem(), 500);
  }, [generateNextItem]);
  
  const retryGeneration = useCallback(() => {
    if (!failedItemId) return;
    setFailedItemId(null);
    setChatMessages(prev => prev.filter(msg => !(msg.type === 'error')));
    setTimeout(() => generateNextItem(), 500);
  }, [failedItemId, generateNextItem]);

  const handleRegenerate = useCallback(async (itemId: EtpDataKey) => {
    setIsGenerating(true);
    const item = ETP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    addMessage('system', `🔄 Regenerando ${item.title}...`);
    try {
      const prompt = getPromptFor(itemId, etpData);
      if (!prompt) throw new Error(`Prompt não encontrado para o item ${itemId}`);
      const generatedText = await generateEtpContent(prompt);
      setEtpData(prev => ({ ...prev, [itemId]: generatedText }));
      
      // Encontra e substitui a mensagem correta, não apenas a última.
      setChatMessages(prev => {
          const targetIndex = prev.findIndex(m => m.itemId === itemId);
          if(targetIndex !== -1) {
              const newMessages = [...prev];
              newMessages[targetIndex] = { type: 'assistant', content: generatedText, itemId: itemId, itemTitle: item.title, timestamp: Date.now(), approved: false };
              return newMessages;
          }
          return prev;
      });

    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
       addMessage('system', `❌ Erro ao regenerar: ${errorMessage}. Tente novamente.`);
    } finally {
      setIsGenerating(false);
    }
  }, [etpData, addMessage]);
  
  const handleRegenerateWithInstructions = useCallback(async (itemId: EtpDataKey, additionalInstructions: string) => {
    if (!additionalInstructions.trim()) return;

    setIsGenerating(true);
    const item = ETP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    addMessage('system', `🔄 Regenerando ${item.title} com suas instruções adicionais...`);

    try {
      const basePrompt = getPromptFor(itemId, etpData);
      const previousResponse = etpData[itemId];
      
      const enhancedPrompt = `${basePrompt}

CONTEXTO IMPORTANTE - RESPOSTA ANTERIOR GERADA:
${previousResponse}

INSTRUÇÕES ADICIONAIS DO USUÁRIO PARA MELHORAR A RESPOSTA:
${additionalInstructions}

TAREFA: Gere uma NOVA versão MELHORADA do texto considerando as instruções adicionais acima. Mantenha toda a estrutura técnico-jurídica, fundamentação legal e formalidade, mas incorpore as informações/ajustes solicitados pelo usuário. Responda APENAS com o texto técnico-jurídico atualizado, sem introduções.`;
      
      const generatedText = await generateEtpContent(enhancedPrompt);

      setEtpData(prev => ({ ...prev, [itemId]: generatedText }));
      
      // Encontra e substitui a mensagem correta, não apenas a última.
       setChatMessages(prev => {
          const targetIndex = prev.findIndex(m => m.itemId === itemId);
          if(targetIndex !== -1) {
              const newMessages = [...prev];
              newMessages[targetIndex] = { type: 'assistant', content: generatedText, itemId: itemId, itemTitle: item.title, timestamp: Date.now(), approved: false };
              return newMessages;
          }
          return prev;
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      addMessage('system', `❌ Erro ao regenerar com instruções: ${errorMessage}. Tente novamente.`);
    } finally {
        setIsGenerating(false);
    }
  }, [etpData, addMessage]);

  const handleStartEdit = useCallback((itemId: EtpDataKey) => {
    setEditingItemId(itemId);
    setTempEditValue(etpData[itemId]);
  }, [etpData]);

 const handleSaveEdit = useCallback((itemId: EtpDataKey) => {
    setEtpData(prev => ({ ...prev, [itemId]: tempEditValue }));
    
    setChatMessages(prev => prev.map(msg => 
        msg.itemId === itemId ? { ...msg, content: tempEditValue, approved: false } : msg
    ));

    setEditingItemId(null);
    addMessage('user', '✏️ Item editado e salvo.');
    // REMOVIDO: Não avança mais automaticamente para dar controle ao usuário.
    // O usuário agora precisa clicar em "Aprovar e Continuar" novamente.
  }, [tempEditValue, addMessage]);


  const handleCancelEdit = useCallback(() => {
    setEditingItemId(null);
  }, []);

  const filledItemsCount = Object.values(etpData).filter(v => v !== '').length;
  const totalItems = ETP_ITEMS.filter(item => !item.skip).length;
  const progress = totalItems > 0 ? (filledItemsCount / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-2xl p-10 shadow-xl border-2 border-gray-200 mb-6 no-print">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText size={42} className="text-[#D13A6E]" />
              <h1 className="text-5xl font-bold text-[#D13A6E]">Estudo Técnico Preliminar</h1>
            </div>
            <p className="text-xl text-[#1E254A] font-semibold mb-2">GAP MN - Grupamento de Apoio de Manaus | Força Aérea Brasileira 🇧🇷</p>
            <p className="text-sm text-slate-600 mb-2">Lei 14.133/2021 - Art. 18</p>
            <a href="http://ccgp.com.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#D13A6E] hover:text-[#803366] transition-colors font-semibold hover:underline">
              <ExternalLink size={14} />ccgp.com.br
            </a>
          </div>
          
          <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-[#1E254A] flex items-center gap-2">
                <div className="w-2 h-2 bg-[#D13A6E] rounded-full animate-pulse"></div>Progresso do Documento
              </span>
              <span className="text-2xl font-bold text-[#D13A6E]">{Math.round(progress)}%</span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
              <div className="absolute inset-0 bg-gradient-to-r from-[#803366] via-[#D13A6E] to-[#ff4f8b] h-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-600 font-medium">{filledItemsCount} de {totalItems} itens concluídos</div>
          </div>
        </header>

        <div className="mb-6 rounded-xl p-6 shadow-2xl no-print" style={{ background: 'linear-gradient(to right, #1E254A, #803366, #D13A6E)' }}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="font-bold text-xl mb-2 text-white">⚠️ Atenção:</p>
              <p className="text-base text-white leading-relaxed">As informações NÃO são salvas automaticamente. Ao final, você poderá baixar o arquivo no formato word. Sempre confira as respostas, a responsabilidade é sua.</p>
            </div>
          </div>
        </div>

        <main className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
          {stage === 'initial' && <InitialStage etpData={etpData} setEtpData={setEtpData} onStart={handleStartGeneration} />}
          {stage === 'generating' && (
            <GeneratingStage 
              chatMessages={chatMessages}
              isGenerating={isGenerating}
              editingItemId={editingItemId}
              failedItemId={failedItemId}
              onApprove={handleApprove}
              onRegenerate={handleRegenerate}
              onRegenerateWithInstructions={handleRegenerateWithInstructions}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onRetry={retryGeneration}
              tempEditValue={tempEditValue}
              setTempEditValue={setTempEditValue}
            />
          )}
          {stage === 'complete' && <CompletedStage etpData={etpData} items={ETP_ITEMS} />}
        </main>

        <footer className="mt-8 text-center text-sm text-slate-600 bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md no-print">
          <p className="mb-1">Desenvolvido por <strong className="text-[#D13A6E]">CGP - Centro de Capacitação em Gestão Pública LTDA</strong></p>
          <p className="text-slate-500">Estudo Técnico Preliminar - Lei 14.133/2021 | Art. 18</p>
        </footer>
      </div>
      <PrintStyles />
    </div>
  );
};

export default App;
