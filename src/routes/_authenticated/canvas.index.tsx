import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, LayoutTemplate, ChevronRight } from "lucide-react";
import { initialsOf, stageLabel, stageColor } from "@/lib/imobflow";

export const Route = createFileRoute("/_authenticated/canvas/")({ component: CanvasIndex });

type Lead = { id: string; full_name: string; stage: string; region: string | null; updated_at: string };

function CanvasIndex() {
  const { user } = useAuth();
  const [q, setQ] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["canvas-leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, full_name, stage, region, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });

  const filtered = useMemo(
    () => leads.filter((l) => !q || l.full_name.toLowerCase().includes(q.toLowerCase())),
    [leads, q],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Canvas</h1>
          <p className="text-sm text-muted-foreground">Selecione um comprador para abrir o canvas da negociação.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar comprador…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-card/50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-elegant">
            <LayoutTemplate className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-lg font-semibold">Nenhum comprador encontrado</div>
          <div className="max-w-md text-sm text-muted-foreground">Cadastre compradores no módulo <Link to="/leads" className="text-primary underline-offset-2 hover:underline">Compradores</Link> para abrir o canvas deles aqui.</div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <Link
              key={l.id}
              to="/canvas/$leadId"
              params={{ leadId: l.id }}
              className="group"
            >
              <Card className="flex items-center gap-3 p-4 transition-all hover:border-primary/40 hover:shadow-elegant">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {initialsOf(l.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{l.full_name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-transparent text-[10px]" style={{ background: `${stageColor(l.stage)}20`, color: stageColor(l.stage) }}>
                      {stageLabel(l.stage)}
                    </Badge>
                    {l.region && <span className="text-[11px] text-muted-foreground">{l.region}</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
