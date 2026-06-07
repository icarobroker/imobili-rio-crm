import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Building2, HandCoins, Plus, AlertCircle } from "lucide-react";
import { STAGES, initialsOf, formatBRL } from "@/lib/imobflow";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type Lead = {
  id: string; full_name: string; stage: string; price_max: number | null;
  region: string | null; updated_at: string;
};

function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, full_name, stage, price_max, region, updated_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from("leads").update({ stage: stage as never }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const totalLeads = leads.length;
  const ativos = leads.filter((l) => l.stage !== "fechamento").length;
  const emProposta = leads.filter((l) => ["proposta", "negociacao"].includes(l.stage)).length;
  const fechados = leads.filter((l) => l.stage === "fechamento").length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const semContato = leads.filter((l) => new Date(l.updated_at).getTime() < sevenDaysAgo && l.stage !== "fechamento");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão executiva da sua operação.</p>
        </div>
        <LeadFormDialog>
          <Button className="bg-gradient-primary shadow-elegant"><Plus className="mr-1 h-4 w-4" />Novo lead</Button>
        </LeadFormDialog>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Leads ativos" value={ativos} hint={`${totalLeads} no total`} accent="primary" />
        <KpiCard icon={TrendingUp} label="Em proposta/negociação" value={emProposta} hint="Avanço de pipeline" accent="warning" />
        <KpiCard icon={HandCoins} label="Fechamentos" value={fechados} hint="Negócios concluídos" accent="success" />
        <KpiCard icon={Building2} label="Imóveis" value={0} hint="Em breve" accent="muted" />
      </div>

      {semContato.length > 0 && (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning/5 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-warning/20 text-warning">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{semContato.length} lead(s) sem contato há +7 dias</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {semContato.slice(0, 3).map((l) => l.full_name).join(", ")}
              {semContato.length > 3 && ` e mais ${semContato.length - 3}`}
            </div>
          </div>
        </Card>
      )}

      {/* Kanban */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Pipeline</h2>
            <p className="text-xs text-muted-foreground">Arraste os cards entre etapas.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-card/50" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3" style={{ minWidth: "1100px" }}>
              {STAGES.map((stage) => {
                const items = leads.filter((l) => l.stage === stage.value);
                return (
                  <div
                    key={stage.value}
                    className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card/40"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragId) {
                        moveMutation.mutate({ id: dragId, stage: stage.value });
                        setDragId(null);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                        <span className="text-xs font-semibold uppercase tracking-wider">{stage.label}</span>
                      </div>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{items.length}</span>
                    </div>
                    <div className="flex-1 space-y-2 p-2 min-h-[200px]">
                      {items.map((l) => (
                        <div
                          key={l.id}
                          draggable
                          onDragStart={() => setDragId(l.id)}
                          onDragEnd={() => setDragId(null)}
                          className="cursor-grab rounded-lg border border-border bg-popover p-3 shadow-soft transition-all hover:border-primary/50 active:cursor-grabbing"
                        >
                          <div className="flex items-center gap-2">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                              {initialsOf(l.full_name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{l.full_name}</div>
                              <div className="truncate text-[11px] text-muted-foreground">{l.region || "Sem região"}</div>
                            </div>
                          </div>
                          {l.price_max && (
                            <div className="mt-2 text-[11px] text-muted-foreground">até <span className="font-medium text-foreground">{formatBRL(l.price_max)}</span></div>
                          )}
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="grid h-24 place-items-center rounded-md border border-dashed border-border text-[11px] text-muted-foreground">
                          Solte aqui
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, hint, accent,
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; hint: string;
  accent: "primary" | "success" | "warning" | "muted";
}) {
  const accents = {
    primary: { bg: "bg-primary/15", fg: "text-primary", ring: "ring-primary/20" },
    success: { bg: "bg-success/15", fg: "text-success", ring: "ring-success/20" },
    warning: { bg: "bg-warning/15", fg: "text-warning", ring: "ring-warning/20" },
    muted: { bg: "bg-muted", fg: "text-muted-foreground", ring: "ring-border" },
  }[accent];
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${accents.bg} ${accents.fg} ring-1 ${accents.ring}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </Card>
  );
}
