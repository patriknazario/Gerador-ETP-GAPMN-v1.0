
export const generateEtpContent = async (prompt: string): Promise<string> => {
  try {
    // A chamada agora é para o nosso próprio endpoint de API seguro.
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Envia o prompt no corpo da requisição.
      body: JSON.stringify({ prompt }),
    });

    // Se a resposta do nosso backend não for bem-sucedida, lança um erro.
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro no servidor: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Retorna o texto gerado que recebemos do nosso backend.
    return data.text;

  } catch (error) {
    console.error("Erro ao chamar a API via serverless function:", error);
    if (error instanceof Error) {
        // Propaga uma mensagem de erro mais clara para a UI.
        throw new Error(`Falha na comunicação com o servidor: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao gerar o conteúdo.");
  }
};
