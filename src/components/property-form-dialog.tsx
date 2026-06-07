import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_TYPES, PROPERTY_STATUS } from "@/lib/imobflow";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export type PropertyRecord = {
  id?: string;
  title: string;
  property_type: string;
  status: string;
  price: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  area_m2: number | null;
  description: string | null;
  cover_url: string | null;
  reference_code: string | null;
};

const empty: PropertyRecord = {
  title: "", property_type: "apartamento", status: "disponivel",
  price: null, address: "", neighborhood: "", city: "", state: "",
  bedrooms: null, bathrooms: null, parking_spots: null, area_m2: null,
  description: "", cover_url: "", reference_code: "",
};

export function PropertyFormDialog({ children, initial }: { children: ReactNode; initial?: PropertyRecord }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PropertyRecord>(initial ?? empty);
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => { if (open) setForm(initial ?? empty); }, [open, initial]);

  const num = (v: string) => (v === "" ? null : Number(v));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const payload = {
        user_id: user.id,
        title: form.title,
        property_type: form.property_type as never,
        status: form.status as never,
        price: form.price,
        address: form.address || null,
        neighborhood: form.neighborhood || null,
        city: form.city || null,
        state: form.state || null,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        parking_spots: form.parking_spots,
        area_m2: form.area_m2,
        description: form.description || null,
        cover_url: form.cover_url || null,
        reference_code: form.reference_code || null,
      };
      if (initial?.id) {
        const { error } = await supabase.from("properties").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(initial?.id ? "Imóvel atualizado!" : "Imóvel cadastrado!");
      qc.invalidateQueries({ queryKey: ["properties"] });
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Editar imóvel" : "Novo imóvel"}</DialogTitle>
          <DialogDescription>Cadastre os dados do imóvel no portfólio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Título *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Apto 3 quartos Vila Mariana" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Preço (R$)</Label>
              <Input type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: num(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Código de referência</Label>
              <Input value={form.reference_code ?? ""} onChange={(e) => setForm({ ...form, reference_code: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Endereço</Label>
              <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Bairro</Label>
              <Input value={form.neighborhood ?? ""} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado (UF)</Label>
              <Input maxLength={2} value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <Label>Área (m²)</Label>
              <Input type="number" value={form.area_m2 ?? ""} onChange={(e) => setForm({ ...form, area_m2: num(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Quartos</Label>
              <Input type="number" value={form.bedrooms ?? ""} onChange={(e) => setForm({ ...form, bedrooms: num(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Banheiros</Label>
              <Input type="number" value={form.bathrooms ?? ""} onChange={(e) => setForm({ ...form, bathrooms: num(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Vagas</Label>
              <Input type="number" value={form.parking_spots ?? ""} onChange={(e) => setForm({ ...form, parking_spots: num(e.target.value) })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>URL da foto de capa</Label>
              <Input value={form.cover_url ?? ""} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Descrição</Label>
              <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-gradient-primary">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
