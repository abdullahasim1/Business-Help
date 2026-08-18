import PageContainer from "@/components/ui/PageContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import LaunchChecklist from "@/components/dashboard/LaunchChecklist";
import QuickActions from "@/components/dashboard/QuickActions";
import { useFetch } from "../lib/hooks";

type DashboardData = {
  contacts: number;
  conversations: number;
  calls: number;
  business: {
    agentName: string;
    agentStatus: "ACTIVE" | "INACTIVE";
    knowledgeText: string | null;
    website: string | null;
  };
};

const Dashboard = () => {
  const { data, error } = useFetch<DashboardData>("/api/dashboard");
  const business = data?.business;

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-[1172px]">
        <DashboardHeader
          label="Overview"
          title="Dashboard"
          subtitle="Track visitor activity and keep your AI assistant ready to convert leads."
          right={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Workspace online
            </span>
          }
        />

        {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <StatsCards
          contacts={data?.contacts ?? 0}
          conversations={data?.conversations ?? 0}
          calls={data?.calls ?? 0}
          agentName={business?.agentName ?? ""}
          agentStatus={business?.agentStatus ?? "INACTIVE"}
          hasKnowledge={Boolean(business?.knowledgeText)}
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
          <LaunchChecklist
            agentName={business?.agentName ?? ""}
            agentStatus={business?.agentStatus ?? "INACTIVE"}
            hasKnowledge={Boolean(business?.knowledgeText)}
            hasWebsite={Boolean(business?.website)}
          />
          <QuickActions />
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;