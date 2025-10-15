import { EtpItem, EtpData, EtpDataKey } from './types';

export const ETP_ITEMS: EtpItem[] = [
    { id: 'processo', title: '1. Informações Básicas', required: true, skip: true },
    { id: 'descricaoNecessidade', title: '2. Descrição da Necessidade', required: true },
    { id: 'areaRequisitante', title: '3. Área Requisitante', required: false },
    { id: 'requisitos', title: '4. Requisitos da Contratação', required: false },
    { id: 'levantamentoMercado', title: '5. Levantamento de Mercado', required: false },
    { id: 'descricaoSolucao', title: '6. Descrição da Solução', required: false },
    { id: 'estimativaQuantidades', title: '7. Estimativa de Quantidades', required: true },
    { id: 'estimativaValor', title: '8. Estimativa do Valor', required: true },
    { id: 'justificativaParcelamento', title: '9. Justificativa de Parcelamento', required: true },
    { id: 'contratacoesCorrelatas', title: '10. Contratações Correlatas', required: false },
    { id: 'alinhamentoPlanejamento', title: '11. Alinhamento com Planejamento', required: false },
    { id: 'beneficios', title: '12. Benefícios a Alcançar', required: false },
    { id: 'providencias', title: '13. Providências a Adotar', required: false },
    { id: 'impactosAmbientais', title: '14. Impactos Ambientais', required: false },
    { id: 'declaracaoViabilidade', title: '15. Declaração de Viabilidade', required: true },
    { id: 'responsaveis', title: '16. Responsáveis', required: false }
];

export const HELP_TEXTS: Record<EtpDataKey, string> = {
    processo: "Identificação única do processo administrativo de contratação conforme padrão do órgão.",
    problemaDescrito: "Descreva de forma resumida e objetiva o problema ou necessidade que motivou esta contratação. Pode usar as informações do DFD ou linguagem informal - o sistema irá gerar automaticamente o texto técnico-jurídico.",
    descricaoNecessidade: "Descreva o problema a ser resolvido sob a perspectiva do interesse público. Explique a situação atual, impactos da não contratação e como a solução atenderá a demanda institucional e ao interesse público.",
    areaRequisitante: "Identifique a unidade organizacional demandante e o servidor responsável pela solicitação, com contato e fundamentação da necessidade.",
    requisitos: "Especifique características técnicas, padrões de desempenho, qualidade e prazos de entrega. Evite direcionamento a marcas específicas, priorizando especificações funcionais.",
    levantamentoMercado: "Pesquise fornecedores potenciais, soluções disponíveis, práticas de mercado e benchmarking com contratações similares. Documente fontes consultadas.",
    descricaoSolucao: "Apresente a solução escolhida, justificando sua adequação técnica e econômica. Explique como atenderá aos requisitos e resolverá o problema identificado.",
    estimativaQuantidades: "Calcule quantitativos baseados em séries históricas, demanda prevista e vida útil. Justifique metodologia utilizada com dados concretos.",
    estimativaValor: "Apresente valores de referência obtidos através de pesquisas de preço, cotações e bases oficiais. Inclua memória de cálculo e fontes consultadas.",
    justificativaParcelamento: "Se aplicável, justifique tecnicamente a divisão da contratação em lotes/etapas, demonstrando vantagens econômicas ou operacionais.",
    contratacoesCorrelatas: "Identifique contratos vigentes relacionados e avalie possibilidade de unificação para ganho de escala ou eficiência administrativa.",
    alinhamentoPlanejamento: "Demonstre consonância com PPA, plano de contratações anual e planejamento estratégico institucional. Cite documentos específicos.",
    beneficios: "Descreva resultados esperados, ganhos de eficiência, economia e melhorias nos serviços públicos. Utilize indicadores mensuráveis quando possível.",
    providencias: "Liste ações preparatórias necessárias: adequações orçamentárias, capacitações, infraestrutura e cronograma de implementação.",
    impactosAmbientais: "Avalie consequências ambientais da contratação e medidas mitigadoras. Verifique conformidade com critérios de sustentabilidade do IN SLTI/MPOG.",
    declaracaoViabilidade: "Declaração formal da autoridade competente atestando viabilidade técnica e econômica da contratação com base nos estudos apresentados.",
    responsaveis: "Identifique todos os servidores que participaram da elaboração do ETP com nome, matrícula, função e assinatura."
};

const PROMPT_INSTRUCTIONS: Record<EtpDataKey, (data: EtpData) => string> = {
    processo: () => '',
    problemaDescrito: () => '',
    descricaoNecessidade: (data) => `Com base no processo ${data.processo} e no problema descrito pelo usuário: "${data.problemaDescrito}", gere o conteúdo COMPLETO e FORMAL para o Item 2 - Descrição da Necessidade do ETP.

Instruções obrigatórias baseadas no Art. 18, inciso I, da Lei 14.133/2021:
- Descreva a necessidade da contratação sob a perspectiva do INTERESSE PÚBLICO
- Explique o PROBLEMA a ser resolvido de forma técnica e detalhada
- Apresente a SITUAÇÃO ATUAL e suas deficiências
- Demonstre os IMPACTOS NEGATIVOS caso a contratação não ocorra
- Justifique como a contratação atenderá a demanda e resolverá o problema
- Use linguagem técnico-jurídica formal e fundamentada
- Mínimo de 3 a 5 parágrafos bem estruturados

IMPORTANTE: Responda APENAS com o texto técnico-jurídico do item, sem introduções, saudações ou explicações adicionais. O texto deve ser direto e pronto para inclusão no documento oficial.`,

    areaRequisitante: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto acima, gere o Item 3 - Área Requisitante do GAP - Grupamento de Apoio de Manaus da Força Aérea Brasileira.

ORIENTAÇÕES:
- Identifique a unidade organizacional demandante (setor, divisão ou departamento responsável)
- Sugira um servidor militar ou civil como responsável pela fundamentação da necessidade (pode ser genérico, ex: "Chefe da Seção de Infraestrutura")
- Inclua o posto/cargo do responsável
- Forneça informações de contato genéricas (ramal, e-mail institucional)
- Mencione brevemente a competência da área em relação ao objeto da contratação.

FORMATO: Texto técnico-formal, objetivo, entre 2-3 parágrafos.

IMPORTANTE: Responda APENAS com o texto do item, sem títulos, introduções ou explicações adicionais.`,
    
    requisitos: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto acima, gere o Item 4 - Requisitos da Contratação (Art. 18, inciso II, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS: Os requisitos da contratação são os elementos indispensáveis ao objeto contratual, os quais devem ser definidos de modo a satisfazer plenamente a demanda que motivou a contratação. Tais especificações devem incluir detalhes específicos, necessários e de relevância para resolução do problema. É fundamental verificar se o item a ser contratado consta no catálogo eletrônico de padronização, o qual está acessível através do Portal Nacional de Compras Públicas.
Especifique de forma clara e objetiva:
1. Características técnicas essenciais do objeto (especificações funcionais, não marcas)
2. Padrões de desempenho e qualidade esperados
3. Prazos de entrega ou execução dos serviços
4. Garantias técnicas mínimas exigidas
5. Certificações ou atestados técnicos necessários (quando aplicável)
6. Normas técnicas aplicáveis (ABNT, INMETRO, etc.)

PRINCÍPIOS A OBSERVAR:
- Ampla competitividade (evitar direcionamento)
- Especificações funcionais (não restritivas)
- Fundamentação técnica para cada requisito
- Clareza e objetividade

FORMATO: Texto estruturado em tópicos ou parágrafos, linguagem técnica precisa.

IMPORTANTE: Responda APENAS com o conteúdo técnico do item.`,

    levantamentoMercado: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto acima, gere o Item 5 - Levantamento de Mercado (Art. 18, inciso III, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Descreva a pesquisa de mercado realizada para a solução do problema, incluindo:

1. FORNECEDORES POTENCIAIS:
   - Análise da capacidade técnica do mercado fornecedor para o objeto em questão.
   - Consideração sobre a localização geográfica (local, regional, nacional).

2. SOLUÇÕES DISPONÍVEIS:
   - Tipos de soluções encontradas no mercado que atendem à necessidade.
   - Tecnologias disponíveis e suas diferenças.

3. FONTES CONSULTADAS:
   - Sugerir a consulta ao Painel de Preços (Gov.br), Portal de Compras Governamentais, e consultas diretas a fornecedores.
   - Mencionar a análise de contratos similares de outros órgãos.

4. BENCHMARKING:
   - Comparação com contratações similares em outros órgãos públicos.

FORMATO: Texto descritivo, 3-4 parágrafos, demonstrando uma pesquisa criteriosa e focada no objeto.

IMPORTANTE: Responda APENAS com o texto técnico, sem introduções.`,

    descricaoSolucao: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 6 - Descrição da Solução (Art. 18, inciso IV, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Apresente detalhadamente a solução escolhida:

1. DESCRIÇÃO DA SOLUÇÃO:
   - Detalhe o que será contratado (objeto).
   - Explique como a solução funcionará na prática para resolver o problema.

2. JUSTIFICATIVA TÉCNICA E ECONÔMICA:
   - Fundamente por que esta solução é a mais adequada técnica e economicamente, comparando-a implicitamente com outras possíveis.
   - Demonstre a relação custo-benefício.

3. ADEQUAÇÃO AO PROBLEMA:
   - Conecte diretamente a solução aos requisitos definidos e ao problema original.
   - Descreva os resultados esperados.

FORMATO: Texto argumentativo bem estruturado, 4-5 parágrafos, com fundamentação sólida.

IMPORTANTE: Responda APENAS com o texto do item.`,

    estimativaQuantidades: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 7 - Estimativa de Quantidades (Art. 18, inciso V, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Calcule e justifique os quantitativos necessários para o objeto da contratação:

1. QUANTITATIVOS ESTIMADOS:
   - Apresente a quantidade de cada item/serviço.
   - Especifique a periodicidade (se aplicável) e a duração do contrato.

2. METODOLOGIA DE CÁLCULO:
   - Justifique o método usado para chegar aos números (ex: séries históricas, demanda projetada, levantamento técnico).

3. FUNDAMENTAÇÃO:
   - Apresente a memória de cálculo ou os dados que basearam a estimativa.
   - Demonstre que as quantidades são suficientes e evitam desperdício.

FORMATO: Texto objetivo com dados numéricos, 3-4 parágrafos.

IMPORTANTE: Apresentar dados mensuráveis e fundamentados. Responda APENAS com o texto técnico.`,

    estimativaValor: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 8 - Estimativa do Valor da Contratação, seguindo as diretrizes do Art. 18, inciso VI, da Lei 14.133/2021 e da Instrução Normativa SEGES/ME nº 65, de 7 de julho de 2021.

ORIENTAÇÕES OBRIGATÓRIAS:
A resposta deve ser uma análise completa e estruturada em quatro etapas:

**ETAPA 1: Quadro Comparativo de Preços**
Crie uma tabela em formato Markdown com os resultados de uma pesquisa de preços simulada. A tabela deve conter as seguintes colunas: "Descrição do Item", "Preço Unitário (R$)", e "Fonte da Pesquisa (com link)". Inclua pelo menos 4 a 5 cotações de fontes diversas e realistas (ex: Painel de Preços do Governo Federal, contratações similares em outros órgãos, cotações com fornecedores, sites especializados).

**ETAPA 2: Análise Estatística dos Dados**
Com base nos preços coletados na tabela, calcule e apresente as seguintes métricas estatísticas de forma clara:
- **Valor Mínimo:**
- **Valor Máximo:**
- **Média Aritmética:**
- **Mediana:**
- **Coeficiente de Variação (CV):** (Calcule e explique brevemente se a dispersão dos preços é alta ou baixa).

**ETAPA 3: Análise de Exequibilidade e Preços Excessivos**
Utilize a Média Aritmética como valor de referência da Administração para esta análise.
1.  **Preços Inexequíveis:** Calcule o limite de 75% do valor de referência. Identifique e aponte quais propostas da tabela estão abaixo deste limite e seriam, portanto, consideradas inexequíveis, conforme o Art. 59 da Lei 14.133/2021.
2.  **Preços Excessivamente Elevados:** Identifique e comente sobre propostas que se mostrem muito acima da média, indicando que podem ser valores atípicos (outliers) a serem desconsiderados no cálculo do valor final de referência.

**ETAPA 4: Conclusão do Valor de Referência**
Com base na análise anterior, elabore um parágrafo conclusivo que estabeleça o valor estimado final para a contratação. Justifique a escolha (ex: "Adota-se a média dos preços válidos, expurgando-se os valores inexequíveis e excessivamente elevados..."), demonstrando a compatibilidade do valor final com as práticas de mercado.

FORMATO: Texto técnico-analítico, com tabela em Markdown e subtítulos para cada etapa da análise.

IMPORTANTE: Responda APENAS com o texto técnico completo do item, sem introduções ou saudações.`,

    justificativaParcelamento: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 9 - Justificativa para Parcelamento ou Não da Contratação (Art. 47, Lei 14.133/2021).

ORIENTAÇÕES:
Analise o objeto da contratação e justifique tecnicamente a decisão sobre o parcelamento.

- SE FOR PARCELAR: Explique as vantagens (ampliação da competitividade, viabilidade técnica).
- SE NÃO FOR PARCELAR: Justifique a inviabilidade técnica ou econômica do parcelamento (perda de economia de escala, indivisibilidade do objeto, necessidade de padronização).

FORMATO: Texto justificativo claro, 2-3 parágrafos, baseado na natureza do objeto.

IMPORTANTE: Responda APENAS com o texto do item.`,

    contratacoesCorrelatas: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 10 - Contratações Correlatas e/ou Interdependentes (Art. 18, inciso VII, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Analise se existem outros contratos vigentes no GAP - Manaus relacionados ao objeto.

- SE HOUVER: Identifique os contratos e analise a viabilidade e as vantagens/desvantagens de unificá-los.
- SE NÃO HOUVER (MAIS COMUM): Declare expressamente a inexistência de contratações correlatas que possam ser consolidadas com o presente objeto, justificando brevemente.

FORMATO: Texto analítico, 2-3 parágrafos.

IMPORTANTE: Responda APENAS com o texto técnico do item.`,

    alinhamentoPlanejamento: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 11 - Alinhamento entre a Contratação e o Planejamento (Art. 18, inciso VIII, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Demonstre a consonância da contratação com os instrumentos de planejamento do órgão.

1. PLANO ANUAL DE CONTRATAÇÕES (PAC): Afirme que a contratação está prevista no PAC, citando o item correspondente.
2. PLANEJAMENTO ESTRATÉGICO INSTITUCIONAL: Relacione a contratação a um objetivo estratégico (ex: "Assegurar a infraestrutura adequada", "Garantir a continuidade operacional").
3. DISPONIBILIDADE ORÇAMENTÁRIA: Mencione que há previsão orçamentária, citando genericamente a fonte de recurso e a natureza da despesa.

FORMATO: Texto descritivo estruturado, 3-4 parágrafos.

IMPORTANTE: Responda APENAS com o texto técnico.`,

    beneficios: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 12 - Benefícios Diretos e Indiretos a Alcançar (Art. 18, inciso IX, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Descreva os resultados esperados, focando em:

1. BENEFÍCIOS DIRETOS: Melhorias operacionais, aumento de eficiência, redução de custos, melhoria da qualidade do serviço/produto relacionado ao objeto.
2. BENEFÍCIOS INDIRETOS: Melhoria das condições de trabalho, sustentabilidade, impacto positivo na missão do GAP.
3. INTERESSE PÚBLICO: Como a contratação, ao final, beneficia o interesse público.

FORMATO: Texto descritivo focado em resultados, 3-4 parágrafos.

IMPORTANTE: Responda APENAS com o texto técnico do item.`,

    providencias: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 13 - Providências a Serem Adotadas pela Administração (Art. 18, inciso X, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Liste as ações preparatórias necessárias para viabilizar a contratação:

1. PROVIDÊNCIAS TÉCNICAS E ADMINISTRATIVAS:
   - Elaboração do Termo de Referência.
   - Designação do gestor e fiscal do contrato.
   - Obtenção de parecer jurídico.
   - Aprovação pela autoridade competente.

2. PROVIDÊNCIAS ORÇAMENTÁRIAS:
   - Reserva orçamentária e emissão da nota de empenho.

3. OUTRAS PROVIDÊNCIAS (se aplicável):
   - Adequação de infraestrutura, capacitação de pessoal.

FORMATO: Texto estruturado em tópicos ou parágrafos sequenciais.

IMPORTANTE: Responda APENAS com o texto técnico do item.`,

    impactosAmbientais: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base no contexto, gere o Item 14 - Possíveis Impactos Ambientais e Medidas Mitigadoras (Art. 18, inciso XI, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Analise os impactos ambientais da contratação do objeto.

- SE HOUVER IMPACTOS: Descreva-os (geração de resíduos, consumo de recursos) e proponha medidas mitigadoras (descarte correto, logística reversa, critérios de sustentabilidade).
- SE NÃO HOUVER IMPACTOS SIGNIFICATIVOS: Declare fundamentadamente a ausência de impactos relevantes, mas ressalte que serão observados os critérios de sustentabilidade da legislação.

FORMATO: Texto analítico, 3-4 parágrafos.

IMPORTANTE: Análise técnica fundamentada. Responda APENAS com o texto do item.`,

    declaracaoViabilidade: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Com base em todo o contexto e nos estudos realizados nos itens anteriores, gere o Item 15 - Declaração de Viabilidade da Contratação (Art. 18, inciso XIII, Lei 14.133/2021).

ORIENTAÇÕES OBRIGATÓRIAS:
Elabore uma declaração formal de viabilidade, estruturada da seguinte forma:

1. FUNDAMENTAÇÃO: Afirmar que, com base nos estudos apresentados neste ETP, a contratação é viável.
2. DECLARAÇÃO: Declarar formalmente a VIABILIDADE TÉCNICA e ECONÔMICA da contratação, nos termos da Lei nº 14.133/2021.
3. ENCERRAMENTO: Deixar campos para Local, data, nome, posto/cargo e assinatura da autoridade competente.

FORMATO: Texto formal de declaração oficial, 3-4 parágrafos.

IMPORTANTE: Linguagem jurídico-formal de ato administrativo. Responda APENAS com o texto da declaração.`,

    responsaveis: (data) => `CONTEXTO DA CONTRATAÇÃO:
- Processo: ${data.processo}
- Problema Originalmente Descrito: "${data.problemaDescrito}"
- Descrição Formal da Necessidade (Item 2 do ETP): "${data.descricaoNecessidade}"

TAREFA:
Gere o Item 16 - Responsáveis pela Elaboração do Estudo Técnico Preliminar.

ORIENTAÇÕES OBRIGATÓRIAS:
Crie um modelo/template para identificar os responsáveis pela elaboração, deixando os campos em branco para preenchimento manual.

FORMATO SUGERIDO:
"Este Estudo Técnico Preliminar foi elaborado pela seguinte equipe:

EQUIPE DE ELABORAÇÃO:

Nome: ________________________________
Posto/Cargo: __________________________
Matrícula: ____________________________
Setor: ________________________________
Responsabilidade: _____________________
Assinatura: ______________ Data: ___/___/___

[Repetir para cada membro da equipe, se necessário]

APROVAÇÃO TÉCNICA:

Nome: ________________________________
Posto/Cargo: __________________________
Assinatura: ______________ Data: ___/___/___"

IMPORTANTE: Responda APENAS com o texto formatado do item, com os campos para preenchimento.`,
};

export const getPromptFor = (itemId: EtpDataKey, data: EtpData): string | null => {
    const generator = PROMPT_INSTRUCTIONS[itemId];
    if (generator) {
        return generator(data);
    }
    return null;
};