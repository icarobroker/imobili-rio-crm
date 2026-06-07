// Definição estrutural das 10 etapas da jornada do comprador (PRD §5.4.4)

export type FieldType = "text" | "textarea" | "number" | "currency" | "date" | "select" | "boolean";

export type StageField = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type JourneyStageDef = {
  key: string;
  index: number;
  label: string;
  short: string;
  description: string;
  icon: string; // lucide icon name
  fields: StageField[];
};

export const JOURNEY_STAGES: JourneyStageDef[] = [
  {
    key: "primeiro_contato", index: 1, label: "Primeiro Contato", short: "Contato",
    description: "Como e quando o lead chegou até você.",
    icon: "MessageSquare",
    fields: [
      { key: "data_contato", label: "Data do contato", type: "date" },
      { key: "canal", label: "Canal", type: "select", options: [
        { value: "whatsapp", label: "WhatsApp" },
        { value: "ligacao", label: "Ligação" },
        { value: "presencial", label: "Presencial" },
        { value: "email", label: "E-mail" },
        { value: "indicacao", label: "Indicação" },
      ]},
      { key: "interesse_inicial", label: "Interesse inicial registrado", type: "textarea", placeholder: "Ex: 3 quartos na Vila Mariana até R$ 800k" },
    ],
  },
  {
    key: "descoberta_valor", index: 2, label: "Descoberta de Valor", short: "Valor",
    description: "Faixa real de investimento e flexibilidade.",
    icon: "DollarSign",
    fields: [
      { key: "valor_minimo", label: "Valor mínimo desejado", type: "currency" },
      { key: "valor_maximo", label: "Valor máximo (teto real)", type: "currency" },
      { key: "negociabilidade", label: "Nota sobre negociabilidade", type: "textarea" },
      { key: "fontes_renda", label: "Fontes de renda relevantes", type: "text" },
    ],
  },
  {
    key: "capacidade_financeira", index: 3, label: "Capacidade Financeira", short: "Capacidade",
    description: "Entrada, simulação e correspondente bancário.",
    icon: "Wallet",
    fields: [
      { key: "tem_entrada", label: "Possui entrada?", type: "boolean" },
      { key: "valor_entrada", label: "Valor da entrada", type: "currency" },
      { key: "fez_simulacao", label: "Fez simulação?", type: "boolean" },
      { key: "banco_simulacao", label: "Banco", type: "text" },
      { key: "valor_aprovado", label: "Valor aprovado na simulação", type: "currency" },
      { key: "tem_cb", label: "Trabalha com correspondente bancário?", type: "boolean" },
      { key: "nome_cb", label: "Nome do CB", type: "text" },
    ],
  },
  {
    key: "financiamento", index: 4, label: "Deu Entrada no Financiamento", short: "Financiamento",
    description: "Processo formal de aprovação de crédito.",
    icon: "Landmark",
    fields: [
      { key: "data_entrada", label: "Data da entrada", type: "date" },
      { key: "banco", label: "Banco / Correspondente", type: "text" },
      { key: "valor_aprovado", label: "Valor aprovado", type: "currency" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "em_analise", label: "Em análise" },
        { value: "aprovado", label: "Aprovado" },
        { value: "reprovado", label: "Reprovado" },
      ]},
      { key: "observacoes", label: "Observações", type: "textarea" },
    ],
  },
  {
    key: "permuta", index: 5, label: "Permuta", short: "Permuta",
    description: "Imóvel oferecido como parte do pagamento.",
    icon: "ArrowLeftRight",
    fields: [
      { key: "tem_permuta", label: "Tem imóvel para permuta?", type: "boolean" },
      { key: "tipo", label: "Tipo do imóvel", type: "text" },
      { key: "valor_estimado", label: "Valor estimado", type: "currency" },
      { key: "endereco", label: "Endereço do imóvel da permuta", type: "text" },
      { key: "aceita_parcial", label: "Aceita permuta parcial?", type: "boolean" },
    ],
  },
  {
    key: "visitas", index: 6, label: "Visitas Realizadas", short: "Visitas",
    description: "Histórico consolidado nas fichas dos imóveis vinculados.",
    icon: "MapPin",
    fields: [
      { key: "resumo", label: "Resumo das visitas / preferências observadas", type: "textarea" },
    ],
  },
  {
    key: "proposta", index: 7, label: "Proposta Enviada", short: "Proposta",
    description: "Oferta formal feita ao proprietário.",
    icon: "Send",
    fields: [
      { key: "imovel", label: "Imóvel da proposta", type: "text" },
      { key: "valor_ofertado", label: "Valor ofertado", type: "currency" },
      { key: "data_envio", label: "Data de envio", type: "date" },
      { key: "condicoes", label: "Condições especiais", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "pendente", label: "Pendente" },
        { value: "aceita", label: "Aceita" },
        { value: "recusada", label: "Recusada" },
        { value: "contraproposta", label: "Contraproposta" },
      ]},
    ],
  },
  {
    key: "negociacao", index: 8, label: "Negociação", short: "Negociação",
    description: "Contrapropostas e posicionamento das partes.",
    icon: "Handshake",
    fields: [
      { key: "ultima_contraproposta", label: "Última contraproposta (valor)", type: "currency" },
      { key: "posicao_proprietario", label: "Posição do proprietário", type: "textarea" },
      { key: "probabilidade", label: "Probabilidade de fechamento (%)", type: "number" },
      { key: "previsao_fechamento", label: "Previsão de fechamento", type: "date" },
    ],
  },
  {
    key: "fechamento", index: 9, label: "Fechamento", short: "Fechamento",
    description: "Negócio concluído.",
    icon: "Trophy",
    fields: [
      { key: "data_negocio", label: "Data do negócio", type: "date" },
      { key: "imovel_fechado", label: "Imóvel fechado", type: "text" },
      { key: "valor_final", label: "Valor final", type: "currency" },
      { key: "tipo_pagamento", label: "Tipo de pagamento", type: "text" },
      { key: "comissao_pct", label: "Comissão (%)", type: "number" },
      { key: "observacoes", label: "Observações finais", type: "textarea" },
    ],
  },
  {
    key: "pos_venda", index: 10, label: "Pós-Venda", short: "Pós-Venda",
    description: "Acompanhamento depois da chave entregue.",
    icon: "Star",
    fields: [
      { key: "data_chaves", label: "Data de entrega das chaves", type: "date" },
      { key: "indicacoes", label: "Indicações geradas", type: "textarea" },
      { key: "nps", label: "NPS interno (0-10)", type: "number" },
      { key: "proxima_oportunidade", label: "Próxima oportunidade registrada", type: "textarea" },
    ],
  },
];

export const stageDef = (key: string) => JOURNEY_STAGES.find((s) => s.key === key);

export const RELATION_STATUS = [
  { value: "sugerido", label: "Sugerido", tone: "muted" as const },
  { value: "visitado", label: "Visitado", tone: "primary" as const },
  { value: "proposta", label: "Proposta enviada", tone: "warning" as const },
  { value: "descartado", label: "Descartado", tone: "destructive" as const },
] as const;

export const relationMeta = (s: string) =>
  RELATION_STATUS.find((r) => r.value === s) ?? { value: s, label: s, tone: "muted" as const };
