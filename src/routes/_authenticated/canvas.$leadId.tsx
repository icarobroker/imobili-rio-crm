import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  ArrowLeft, Building2, Link2, MapPin, MessageCircle, Mail, Phone, Plus, Trash2, Route as RouteIcon,
} from "lucide-react";
import { RELATION_STATUS, relationMeta } from "@/lib/canvas-config";
import { PROPERTY_TYPES, formatBRL, initialsOf, originLabel } from "@/lib/imobflow";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/canvas/$leadId")({ component: CanvasPage });

type LeadProp = {
  id: string; property_id: string; relation_status: string; feedback: string | null;
  visited_at: string | null; proposal_value: number | null;
  property: { id: string; title: string; cover_url: string | null; price: number | null; neighborhood: string | null; city: string | null; reference_code: string | null };
};

function CanvasPage() {
  const { leadId } = useParams({ from: "/_authenticated/canvas/$leadId" });
  const { user } = useAuth();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["canvas-lead", leadId],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="grid place-items-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }
  if (!lead) {
    return (
      <Card className="grid place-items-center gap-3 p-16 text-center">
        <div className="text-lg font-semibold">Comprador não encontrado</div>
        <Link to="/canvas" className="text-sm text-primary underline-offset-2 hover:underline">Voltar ao Deal Canvas</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/canvas" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Deal Canvas</Link>
        <span>/</span>
        <span className="text-foreground">{lead.full_name}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <BuyerSidebar lead={lead} leadId={leadId} />
        <PropertiesPanel leadId={leadId} userId={user!.id} />
      </div>
    </div>
  );
}

/* ============================================================ Perfil ===== */

function BuyerSidebar({ lead, leadId }: { lead: any; leadId: string }) {
  const phone = (lead.whatsapp || "").replace(/\D/g, "");
  return (
    <Card className="h-fit space-y-4 p-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-lg font-bold text-primary-foreground shadow-elegant">
          {initialsOf(lead.full_name)}
        </div>
        <div>
          <div className="font-semibold leading-tight">{lead.full_name}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{originLabel(lead.origin)}</div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {phone && (
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-success hover:bg-success/10" title="WhatsApp">
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title="Ligar">
            <Phone className="h-4 w-4" />
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title="E-mail">
            <Mail className="h-4 w-4" />
          </a>
        )}
      </div>

      <Link
        to="/leads/$leadId/jornada"
        params={{ leadId }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent/15 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/25"
      >
        <RouteIcon className="h-3.5 w-3.5" />Abrir Jornada de Compra
      </Link>

      <div className="space-y-3 border-t border-border pt-4 text-sm">
        <InfoRow label="WhatsApp" value={lead.whatsapp} />
        <InfoRow label="E-mail" value={lead.email} />
        <InfoRow label="Região" value={lead.region} />
        <InfoRow label="Faixa de valor" value={
          lead.price_min || lead.price_max
            ? `${formatBRL(lead.price_min ?? 0)} — ${formatBRL(lead.price_max)}`
            : null
        } />
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Tipos desejados</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(lead.property_types as string[] | null)?.length
              ? (lead.property_types as string[]).map((t) => {
                  const def = PROPERTY_TYPES.find((p) => p.value === t);
                  return <Badge key={t} variant="outline" className="text-[10px]">{def?.label ?? t}</Badge>;
                })
              : <span className="text-xs text-muted-foreground">—</span>}
          </div>
        </div>
        {lead.notes && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Notas internas</div>
            <div className="mt-1 whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-xs">{lead.notes}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words text-sm">{value || "—"}</div>
    </div>
  );
}

/* ============================================ Imóveis vinculados ===== */

function PropertiesPanel({ leadId, userId }: { leadId: string; userId: string }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["canvas-properties", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_properties")
        .select("id, property_id, relation_status, feedback, visited_at, proposal_value, property:properties(id,title,cover_url,price,neighborhood,city,reference_code)")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeadProp[];
    },
  });

  const updateRelation = useMutation({
    mutationFn: async ({ id, relation_status }: { id: string; relation_status: string }) => {
      const { error } = await supabase.from("lead_properties").update({ relation_status: relation_status as never }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["canvas-properties", leadId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lead_properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["canvas-properties", leadId] }); toast.success("Vínculo removido"); },
  });

  return (
    <Card className="h-fit space-y-3 p-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-semibold">Imóveis de interesse</h2>
          <p className="text-xs text-muted-foreground">{items.length} vinculado(s)</p>
        </div>
        <LinkPropertyDialog leadId={leadId} userId={userId} existingIds={items.map((i) => i.property_id)}>
          <Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Vincular</Button>
        </LinkPropertyDialog>
      </div>

      {items.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center">
          <Link2 className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm font-medium">Nenhum imóvel vinculado</div>
          <div className="text-[11px] text-muted-foreground">Sugira imóveis do portfólio para este comprador.</div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const meta = relationMeta(item.relation_status);
            const tone = {
              muted: "ring-border text-muted-foreground",
              primary: "ring-primary/30 text-primary",
              warning: "ring-warning/30 text-warning",
              destructive: "ring-destructive/30 text-destructive",
            }[meta.tone];
            const loc = [item.property.neighborhood, item.property.city].filter(Boolean).join(", ");
            return (
              <div key={item.id} className="overflow-hidden rounded-lg border border-border bg-popover/40">
                <div className="relative h-28 bg-gradient-hero">
                  {item.property.cover_url
                    ? <img src={item.property.cover_url} alt={item.property.title} className="h-full w-full object-cover" loading="lazy" />
                    : <div className="grid h-full place-items-center text-muted-foreground"><Building2 className="h-6 w-6 opacity-60" /></div>}
                  <Badge variant="outline" className={`absolute left-2 top-2 bg-background/80 backdrop-blur text-[10px] ring-1 ${tone}`}>{meta.label}</Badge>
                </div>
                <div className="space-y-2 p-3">
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-semibold">{item.property.title}</div>
                    {loc && <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{loc}</div>}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gradient">{formatBRL(item.property.price)}</span>
                    {item.property.reference_code && <span className="text-[10px] text-muted-foreground">#{item.property.reference_code}</span>}
                  </div>
                  <Select value={item.relation_status} onValueChange={(v) => updateRelation.mutate({ id: item.id, relation_status: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RELATION_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-end">
                    <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm("Remover vínculo?")) remove.mutate(item.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function LinkPropertyDialog({ children, leadId, userId, existingIds }: { children: React.ReactNode; leadId: string; userId: string; existingIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const qc = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["all-properties", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, neighborhood, city, price, cover_url, reference_code, status");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const linkMut = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase.from("lead_properties").insert({
        user_id: userId, lead_id: leadId, property_id: propertyId, relation_status: "sugerido" as never,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["canvas-properties", leadId] }); toast.success("Imóvel vinculado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const available = useMemo(() => {
    return (properties as any[]).filter((p) => {
      if (existingIds.includes(p.id)) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.neighborhood ?? ""} ${p.city ?? ""} ${p.reference_code ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [properties, existingIds, q]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Vincular imóvel ao comprador</DialogTitle>
          <DialogDescription>Selecione um imóvel do seu portfólio para sugerir.</DialogDescription>
        </DialogHeader>
        <Input placeholder="Buscar por título, bairro, código…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex-1 overflow-y-auto space-y-2">
          {available.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <Building2 className="h-6 w-6" />
              {(properties as any[]).length === 0 ? "Cadastre imóveis primeiro." : "Nenhum imóvel disponível."}
            </div>
          ) : available.map((p: any) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { linkMut.mutate(p.id); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-popover/40 p-3 text-left transition-all hover:border-primary/40 hover:shadow-soft"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
                {p.cover_url ? <img src={p.cover_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.title}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {[p.neighborhood, p.city].filter(Boolean).join(", ") || "Sem endereço"}
                </div>
              </div>
              <div className="text-right text-xs font-semibold text-gradient">{formatBRL(p.price)}</div>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
