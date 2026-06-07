import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MessageCircle, Mail, LayoutTemplate, Route as RouteIcon } from "lucide-react";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { STAGES, stageColor, stageLabel, originLabel, formatBRL, initialsOf } from "@/lib/imobflow";

export const Route = createFileRoute("/_authenticated/leads/")({
  component: LeadsPage,
});

type Lead = {
  id: string; full_name: string; whatsapp: string; email: string | null;
  origin: string; stage: string; region: string | null;
  price_min: number | null; price_max: number | null; created_at: string;
};

function LeadsPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, full_name, whatsapp, email, origin, stage, region, price_min, price_max, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (stageFilter !== "all" && l.stage !== stageFilter) return false;
      if (q && !`${l.full_name} ${l.whatsapp} ${l.email ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [leads, q, stageFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compradores</h1>
          <p className="text-sm text-muted-foreground">{leads.length} lead(s) na sua carteira.</p>
        </div>
        <LeadFormDialog>
          <Button className="bg-gradient-primary shadow-elegant"><Plus className="mr-1 h-4 w-4" />Novo lead</Button>
        </LeadFormDialog>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome, WhatsApp ou e-mail..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Etapa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-card/50" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary"><Plus className="h-5 w-5" /></div>
          <div>
            <div className="font-semibold">Nenhum lead {leads.length === 0 ? "cadastrado" : "encontrado"}</div>
            <div className="text-sm text-muted-foreground">{leads.length === 0 ? "Comece cadastrando seu primeiro comprador." : "Tente ajustar os filtros."}</div>
          </div>
          {leads.length === 0 && (
            <LeadFormDialog><Button className="bg-gradient-primary"><Plus className="mr-1 h-4 w-4" />Cadastrar primeiro lead</Button></LeadFormDialog>
          )}
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((l) => (
            <Card key={l.id} className="flex flex-wrap items-center gap-4 p-4 transition-all hover:border-primary/40 hover:shadow-elegant">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {initialsOf(l.full_name)}
              </div>
              <div className="min-w-[180px] flex-1">
                <div className="font-medium">{l.full_name}</div>
                <div className="text-xs text-muted-foreground">{l.region || "—"} · {originLabel(l.origin)}</div>
              </div>
              <div className="text-sm">
                <Badge variant="outline" className="border-transparent" style={{ background: `${stageColor(l.stage)}20`, color: stageColor(l.stage) }}>
                  {stageLabel(l.stage)}
                </Badge>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{formatBRL(l.price_max)}</div>
                <div className="text-[11px] text-muted-foreground">{l.price_min ? `de ${formatBRL(l.price_min)}` : "valor máx."}</div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/leads/$leadId/jornada"
                  params={{ leadId: l.id }}
                  className="inline-flex h-9 items-center gap-1 rounded-md bg-gradient-primary px-3 text-xs font-semibold text-primary-foreground shadow-elegant hover:opacity-90"
                  title="Abrir Jornada de Compra"
                >
                  <RouteIcon className="h-3.5 w-3.5" />Jornada
                </Link>
                <Link
                  to="/canvas/$leadId"
                  params={{ leadId: l.id }}
                  className="inline-flex h-9 items-center gap-1 rounded-md bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/20"
                  title="Abrir Deal Canvas"
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />Canvas
                </Link>
                {l.whatsapp && (
                  <a
                    href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-md text-success hover:bg-success/10"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
                {l.email && (
                  <a href={`mailto:${l.email}`} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title="E-mail">
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
