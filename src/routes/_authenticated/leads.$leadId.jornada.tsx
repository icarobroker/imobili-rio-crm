import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Mail, Phone } from "lucide-react";
import { JourneyPanel } from "@/components/journey-panel";
import { initialsOf, originLabel } from "@/lib/imobflow";

export const Route = createFileRoute("/_authenticated/leads/$leadId/jornada")({
  component: LeadJourneyPage,
});

function LeadJourneyPage() {
  const { leadId } = useParams({ from: "/_authenticated/leads/$leadId/jornada" });
  const { user } = useAuth();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
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
        <Link to="/leads" className="text-sm text-primary underline-offset-2 hover:underline">Voltar para Compradores</Link>
      </Card>
    );
  }

  const phone = (lead.whatsapp || "").replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/leads" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />Compradores
        </Link>
        <span>/</span>
        <span className="text-foreground">{lead.full_name}</span>
        <span>/</span>
        <span>Jornada</span>
      </div>

      <Card className="flex flex-wrap items-center gap-4 p-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-elegant">
          {initialsOf(lead.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{lead.full_name}</div>
          <div className="text-xs text-muted-foreground">
            {originLabel(lead.origin)}{lead.region ? ` · ${lead.region}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {phone && (
            <>
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-md text-success hover:bg-success/10" title="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href={`tel:${phone}`} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title="Ligar">
                <Phone className="h-4 w-4" />
              </a>
            </>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title="E-mail">
              <Mail className="h-4 w-4" />
            </a>
          )}
          <Badge variant="outline" className="ml-2">{lead.stage?.replaceAll("_", " ")}</Badge>
        </div>
      </Card>

      <JourneyPanel leadId={leadId} userId={user!.id} />
    </div>
  );
}
