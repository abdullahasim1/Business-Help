import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import ErrorBanner from "@/components/ui/ErrorBanner";
import StatusPill from "@/components/ui/StatusPill";
import StatsCards from "@/components/dashboard/StatsCards";
import LaunchChecklist from "@/components/dashboard/LaunchChecklist";
import QuickActions from "@/components/dashboard/QuickActions";
import { useFetch } from "../../lib/hooks";

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
        <PageHeader
          label="Overview"
          title="Dashboard"
          subtitle="Track visitor activity and keep your AI assistant ready to convert leads."
          right={
            <StatusPill dot>
              Workspace online
            </StatusPill>
          }
        />

        {error ? <ErrorBanner message={error} className="mt-4" /> : null}

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