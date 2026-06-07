import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ORIGINS, PROPERTY_TYPES } from "@/lib/imobflow";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LeadFormDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "", whatsapp: "", email: "", region: "",
    origin: "outros", price_min: "", price_max: "", notes: "",
    property_types: [] as string[],
  });
  const { user } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("leads").insert({
        user_id: user.id,
        full_name: form.full_name,
        whatsapp: form.whatsapp,
        email: form.email || null,
        region: form.region || null,
        origin: form.origin as never,
        property_types: form.property_types as never,
        price_min: form.price_min ? Number(form.price_min) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead cadastrado!");
      qc.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      setForm({ full_name: "", whatsapp: "", email: "", region: "", origin: "outros", price_min: "", price_max: "", notes: "", property_types: [] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao cadastrar"),
  });

  const togglePT = (v: string) =>
    setForm((f) => ({ ...f, property_types: f.property_types.includes(v) ? f.property_types.filter((x) => x !== v) : [...f.property_types, v] }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo lead comprador</DialogTitle>
          <DialogDescription>Cadastre um novo cliente comprador.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome completo *</Label>
              <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp *</Label>
              <Input required placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Select value={form.origin} onValueChange={(v) => setForm({ ...form, origin: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORIGINS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Região de interesse</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Bairro, cidade" />
            </div>
            <div className="space-y-1.5">
              <Label>Valor mínimo (R$)</Label>
              <Input type="number" value={form.price_min} onChange={(e) => setForm({ ...form, price_min: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor máximo (R$)</Label>
              <Input type="number" value={form.price_max} onChange={(e) => setForm({ ...form, price_max: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Tipo de imóvel desejado</Label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((p) => {
                  const active = form.property_types.includes(p.value);
                  return (
                    <Badge
                      key={p.value}
                      onClick={() => togglePT(p.value)}
                      variant={active ? "default" : "outline"}
                      className={`cursor-pointer ${active ? "bg-gradient-primary border-transparent" : ""}`}
                    >
                      {p.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notas internas</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-gradient-primary">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
