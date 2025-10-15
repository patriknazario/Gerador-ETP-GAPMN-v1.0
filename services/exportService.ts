// src/services/exportService.ts

import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
} from 'docx';
import saveAs from 'file-saver';

/**
 * Interface para definir a estrutura dos dados de cada seção do ETP.
 * Cada objeto representa um título e o texto correspondente.
 */
interface ETPData {
  titulo: string;
  texto: string;
}

/**
 * Converte uma string com markdown de negrito (**texto**) em uma matriz de objetos TextRun.
 * @param text A string a ser convertida.
 * @returns Uma matriz de objetos TextRun para a biblioteca docx.
 */
const createRunsFromMarkdown = (text: string): TextRun[] => {
  if (!text) return [];

  // Divide o texto pela sintaxe de negrito, mantendo os delimitadores
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts
    .filter((part) => part.length > 0) // Remove strings vazias da matriz
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Esta é uma parte em negrito
        return new TextRun({
          text: part.slice(2, -2),
          bold: true,
        });
      }
      // Esta é uma parte normal
      return new TextRun(part);
    });
};


/**
 * Gera um documento .docx a partir de um array de dados do ETP e inicia o download.
 * @param respostas Array de objetos, onde cada objeto contém o título e o texto de uma seção.
 * @param nomeArquivo O nome do arquivo que será baixado (ex: "ETP-Final.docx").
 */
export const gerarDocumentoWord = async (
  respostas: ETPData[],
  nomeArquivo: string = 'ETP-Gerado.docx'
): Promise<void> => {
  if (!respostas || respostas.length === 0) {
    console.error('Dados para exportação estão vazios.');
    alert('Não há dados para exportar.');
    return;
  }

  try {
    console.log('Iniciando a geração do documento Word...');

    // Mapeia os dados recebidos para o formato de parágrafos da biblioteca docx
    const sections = respostas.flatMap((item) => {
      // Divide o texto em parágrafos separados por quebras de linha (\n)
      const textParagraphs = item.texto.split('\n').map(
        (paragrafo) => {
          const match = paragrafo.match(/^(\s*)(\*)\s(.*)/);

          if (match) {
            const [, spaces, , content] = match;
            const indentationLevel = Math.floor(spaces.length / 2); // 2 espaços por nível de indentação

            return new Paragraph({
              children: createRunsFromMarkdown(content),
              bullet: {
                level: indentationLevel, // Usa o nível de indentação para listas aninhadas
              },
              style: 'Normal',
              spacing: { after: 120 },
            });
          } else {
            return new Paragraph({
              children: createRunsFromMarkdown(paragrafo),
              style: 'Normal',
              spacing: { after: 120 },
            });
          }
        }
      );

      return [
        // Cria o título da seção
        new Paragraph({
          text: item.titulo,
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 300,
            after: 150,
          },
        }),
        // Adiciona os parágrafos de texto da seção
        ...textParagraphs,
      ];
    });

    // Cria o documento principal
    const doc = new Document({
      creator: 'ETPGenerator',
      title: 'Estudo Técnico Preliminar',
      description: 'Documento gerado automaticamente pela ferramenta ETPGenerator',
      sections: [
        {
          properties: {},
          children: [
            // Título principal do documento
            new Paragraph({
              text: 'Estudo Técnico Preliminar (ETP)',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),
            // Insere todas as seções geradas
            ...sections,
          ],
        },
      ],
    });

    // Converte o documento em um 'blob' para que o navegador possa baixá-lo
    const blob = await Packer.toBlob(doc);

    // Usa a biblioteca file-saver para iniciar o download
    saveAs(blob, nomeArquivo);

    console.log('Documento gerado e download iniciado com sucesso!');
  } catch (error) {
    console.error('Ocorreu um erro ao gerar o documento .docx:', error);
    alert(
      'Ocorreu um erro ao gerar o documento. Verifique o console para mais detalhes.'
    );
  }
};