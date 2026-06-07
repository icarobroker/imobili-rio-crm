export const STAGES = [
  { value: "primeiro_contato", label: "Primeiro Contato", color: "oklch(0.7 0.16 200)" },
  { value: "descoberta_valor", label: "Descoberta de Valor", color: "oklch(0.72 0.18 230)" },
  { value: "capacidade_financeira", label: "Capacidade Financeira", color: "oklch(0.7 0.18 260)" },
  { value: "financiamento", label: "Financiamento", color: "oklch(0.68 0.2 285)" },
  { value: "permuta", label: "Permuta", color: "oklch(0.7 0.18 320)" },
  { value: "visitas", label: "Visitas", color: "oklch(0.78 0.17 75)" },
  { value: "proposta", label: "Proposta", color: "oklch(0.75 0.18 50)" },
  { value: "negociacao", label: "Negociação", color: "oklch(0.7 0.2 30)" },
  { value: "fechamento", label: "Fechamento", color: "oklch(0.72 0.17 160)" },
] as const;

export type Stage = (typeof STAGES)[number]["value"];

export const ORIGINS = [
  { value: "portal", label: "Portal" },
  { value: "indicacao", label: "Indicação" },
  { value: "redes_sociais", label: "Redes Sociais" },
  { value: "evento", label: "Evento" },
  { value: "outros", label: "Outros" },
] as const;

export const PROPERTY_TYPES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "cobertura", label: "Cobertura" },
  { value: "comercial", label: "Comercial" },
  { value: "terreno", label: "Terreno" },
  { value: "galpao", label: "Galpão" },
] as const;

export const PROPERTY_STATUS = [
  { value: "disponivel", label: "Disponível", tone: "success" as const },
  { value: "reservado", label: "Reservado", tone: "warning" as const },
  { value: "vendido", label: "Vendido", tone: "primary" as const },
  { value: "inativo", label: "Inativo", tone: "muted" as const },
] as const;

export const propertyTypeLabel = (t: string) =>
  PROPERTY_TYPES.find((x) => x.value === t)?.label ?? t;

export const propertyStatusMeta = (s: string) =>
  PROPERTY_STATUS.find((x) => x.value === s) ?? { value: s, label: s, tone: "muted" as const };

export const stageLabel = (s: string) =>
  STAGES.find((x) => x.value === s)?.label ?? s;

export const stageColor = (s: string) =>
  STAGES.find((x) => x.value === s)?.color ?? "var(--muted)";

export const originLabel = (o: string) =>
  ORIGINS.find((x) => x.value === o)?.label ?? o;

export const formatBRL = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const initialsOf = (name: string) =>
  name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
