import MetricCard from "@/components/MetricCard";

type StatsCardsProps = {
  contacts: number;
  conversations: number;
  calls: number;
  agentName: string;
  agentStatus: "ACTIVE" | "INACTIVE";
  hasKnowledge: boolean;
};

const StatsCards = ({ contacts, conversations, calls, agentName, agentStatus, hasKnowledge }: StatsCardsProps) => {
  return (
    <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        label="Contacts"
        value={contacts}
        icon="♙"
        iconBg="bg-blue-50"
        note="Total leads captured"
      />
      <MetricCard
        label="Conversations"
        value={conversations}
        icon="◌"
        iconBg="bg-violet-50"
        note="Chat sessions started"
      />
      <MetricCard
        label="Calls"
        value={calls}
        icon="⌕"
        iconBg="bg-emerald-50"
        note="Voice sessions started"
      />
      <MetricCard
        label="AI Agent"
        value={agentStatus === "ACTIVE" ? agentName : "Inactive"}
        icon="✦"
        iconBg={agentStatus === "ACTIVE" ? "bg-emerald-50" : "bg-slate-50"}
        note={agentStatus === "ACTIVE" ? "Ready for visitors" : "Not configured"}
      />
      <MetricCard
        label="Knowledge Base"
        value={hasKnowledge ? "Ready" : "Empty"}
        icon="▤"
        iconBg={hasKnowledge ? "bg-amber-50" : "bg-slate-50"}
        note={hasKnowledge ? "AI can answer questions" : "Add content to enable"}
      />
    </div>
  );
};

export default StatsCards;