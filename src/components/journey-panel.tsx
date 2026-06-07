import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Check, ChevronDown, ChevronUp, MessageSquare, DollarSign, Wallet, Landmark,
  ArrowLeftRight, MapPin, Send, Handshake, Trophy, Star,
} from "lucide-react";
import { JOURNEY_STAGES, type JourneyStageDef, type StageField } from "@/lib/canvas-config";
import { toast } from "sonner";

const stageIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare, DollarSign, Wallet, Landmark, ArrowLeftRight, MapPin, Send, Handshake, Trophy, Star,
};

type StageRow = { id: string; stage: string; data: Record<string, unknown>; notes: string | null; completed_at: string | null };

export function JourneyPanel({ leadId, userId }: { leadId: string; userId: string }) {
  const { data: stages = [] } = useQuery({
    queryKey: ["canvas-stages", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_journey_stages")
        .select("id, stage, data, notes, completed_at")
        .eq("lead_id", leadId);
      if (error) throw error;
      return data as StageRow[];
    },
  });
  const byKey = useMemo(() => Object.fromEntries(stages.map((s) => [s.stage, s])), [stages]);
  const completedCount = stages.filter((s) => s.completed_at).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold">Jornada de Compra</h2>
          <p className="text-xs text-muted-foreground">10 etapas — preencha em qualquer ordem.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${(completedCount / 10) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{completedCount}/10</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {JOURNEY_STAGES.map((def) => (
          <StageCard key={def.key} def={def} row={byKey[def.key]} leadId={leadId} userId={userId} />
        ))}
      </div>
    </Card>
  );
}

function StageCard({ def, row, leadId, userId }: { def: JourneyStageDef; row?: StageRow; leadId: string; userId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Record<string, any>>(row?.data ?? {});
  const [notes, setNotes] = useState(row?.notes ?? "");
  const completed = !!row?.completed_at;
  const Icon = stageIcons[def.icon] ?? MessageSquare;

  const save = useMutation({
    mutationFn: async (markComplete?: boolean) => {
      const payload = {
        user_id: userId,
        lead_id: leadId,
        stage: def.key as never,
        data,
        notes: notes || null,
        completed_at: markComplete === true ? new Date().toISOString() : markComplete === false ? null : row?.completed_at ?? null,
      };
      if (row?.id) {
        const { error } = await supabase.from("lead_journey_stages").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lead_journey_stages").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["canvas-stages", leadId] }); toast.success("Etapa salva"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className={`rounded-lg border ${completed ? "border-success/30 bg-success/5" : "border-border bg-popover/40"} transition-all`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${completed ? "bg-success/20 text-success" : "bg-primary/15 text-primary"}`}>
          {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Etapa {def.index}</span>
            {completed && <Badge variant="outline" className="border-success/40 bg-success/10 text-[10px] text-success">Concluída</Badge>}
          </div>
          <div className="text-sm font-semibold">{def.label}</div>
          <div className="truncate text-[11px] text-muted-foreground">{def.description}</div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {def.fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={data[f.key]}
                onChange={(v) => setData({ ...data, [f.key]: v })}
                full={f.type === "textarea"}
              />
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notas adicionais</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações livres sobre esta etapa…" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <label className="inline-flex items-center gap-2 text-xs">
              <Switch checked={completed} onCheckedChange={(v) => save.mutate(v)} />
              Marcar como concluída
            </label>
            <Button size="sm" onClick={() => save.mutate(undefined)} disabled={save.isPending} className="bg-gradient-primary">
              Salvar etapa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange, full }: { field: StageField; value: any; onChange: (v: any) => void; full?: boolean }) {
  const cls = full ? "sm:col-span-2" : "";
  if (field.type === "textarea") {
    return (
      <div className={`space-y-1.5 ${cls}`}>
        <Label className="text-xs">{field.label}</Label>
        <Textarea rows={2} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{field.label}</Label>
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-popover/40 px-3 py-2">
        <Label className="text-xs">{field.label}</Label>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }
  const type = field.type === "currency" || field.type === "number" ? "number" : field.type === "date" ? "date" : "text";
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{field.label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)} placeholder={field.placeholder} />
    </div>
  );
}
