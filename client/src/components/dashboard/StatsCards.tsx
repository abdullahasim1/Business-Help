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
      <MetricCard label="Contacts" value={contacts} />
      <MetricCard label="Conversations" value={conversations} />
      <MetricCard label="Calls" value={calls} />
      <MetricCard label="Active AI Agent" value={agentStatus === "ACTIVE" ? agentName : "None"} />
      <MetricCard label="Knowledge" value={hasKnowledge ? "Ready" : "Empty"} />
    </div>
  );
};

export default StatsCards;