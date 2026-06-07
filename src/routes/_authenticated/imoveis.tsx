import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyFormDialog, type PropertyRecord } from "@/components/property-form-dialog";
import { PROPERTY_STATUS, propertyStatusMeta, propertyTypeLabel, formatBRL } from "@/lib/imobflow";
import { Plus, Search, Building2, MapPin, Bed, Bath, Car, Maximize2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/imoveis")({ component: ImoveisPage });

type Property = PropertyRecord & { id: string; created_at: string };

function ImoveisPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("todos");

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (status !== "todos" && p.status !== status) return false;
      if (!q) return true;
      return [p.title, p.neighborhood, p.city, p.reference_code].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [properties, search, status]);

  const delMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Imóvel removido"); qc.invalidateQueries({ queryKey: ["properties"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: properties.length };
    PROPERTY_STATUS.forEach((s) => { c[s.value] = properties.filter((p) => p.status === s.value).length; });
    return c;
  }, [properties]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imóveis</h1>
          <p className="text-sm text-muted-foreground">Portfólio de imóveis em carteira.</p>
        </div>
        <PropertyFormDialog>
          <Button className="bg-gradient-primary shadow-elegant"><Plus className="mr-1 h-4 w-4" />Novo imóvel</Button>
        </PropertyFormDialog>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniStat label="Total" value={counts.total} />
        {PROPERTY_STATUS.map((s) => (
          <MiniStat key={s.value} label={s.label} value={counts[s.value] ?? 0} tone={s.tone} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por título, bairro, cidade ou código…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {PROPERTY_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-card/50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-elegant">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-lg font-semibold">Nenhum imóvel encontrado</div>
          <div className="max-w-md text-sm text-muted-foreground">
            {properties.length === 0 ? "Cadastre seu primeiro imóvel para começar a montar o portfólio." : "Ajuste os filtros para ver mais resultados."}
          </div>
          {properties.length === 0 && (
            <PropertyFormDialog>
              <Button className="bg-gradient-primary"><Plus className="mr-1 h-4 w-4" />Cadastrar imóvel</Button>
            </PropertyFormDialog>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PropertyCard key={p.id} property={p} onDelete={() => delMutation.mutate(p.id)} />)}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone = "muted" }: { label: string; value: number; tone?: "primary" | "success" | "warning" | "muted" }) {
  const map = {
    primary: "text-primary bg-primary/10 ring-primary/20",
    success: "text-success bg-success/10 ring-success/20",
    warning: "text-warning bg-warning/10 ring-warning/20",
    muted: "text-muted-foreground bg-muted ring-border",
  } as const;
  return (
    <Card className="p-4">
      <div className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${map[tone]}`}>{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </Card>
  );
}

function PropertyCard({ property, onDelete }: { property: Property; onDelete: () => void }) {
  const meta = propertyStatusMeta(property.status);
  const toneRing = {
    success: "ring-success/30 text-success",
    warning: "ring-warning/30 text-warning",
    primary: "ring-primary/30 text-primary",
    muted: "ring-border text-muted-foreground",
  } as const;
  const loc = [property.neighborhood, property.city, property.state].filter(Boolean).join(", ");

  return (
    <Card className="group overflow-hidden">
      <div className="relative h-44 bg-gradient-hero">
        {property.cover_url ? (
          <img src={property.cover_url} alt={property.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground"><Building2 className="h-10 w-10 opacity-50" /></div>
        )}
        <Badge className={`absolute left-3 top-3 bg-background/80 backdrop-blur ring-1 ${toneRing[meta.tone]}`} variant="outline">{meta.label}</Badge>
        {property.reference_code && (
          <Badge className="absolute right-3 top-3 bg-background/80 backdrop-blur" variant="outline">#{property.reference_code}</Badge>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{property.title}</h3>
            <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">{propertyTypeLabel(property.property_type)}</span>
          </div>
          {loc && <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{loc}</div>}
        </div>
        <div className="text-lg font-bold text-gradient">{formatBRL(property.price)}</div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {property.bedrooms != null && <span className="inline-flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms}</span>}
          {property.bathrooms != null && <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms}</span>}
          {property.parking_spots != null && <span className="inline-flex items-center gap-1"><Car className="h-3.5 w-3.5" />{property.parking_spots}</span>}
          {property.area_m2 != null && <span className="inline-flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{property.area_m2} m²</span>}
        </div>
        <div className="flex items-center justify-end gap-1 pt-1">
          <PropertyFormDialog initial={property}>
            <Button size="sm" variant="ghost"><Pencil className="mr-1 h-3.5 w-3.5" />Editar</Button>
          </PropertyFormDialog>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Remover este imóvel?")) onDelete(); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
