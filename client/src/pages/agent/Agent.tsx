import { useNavigate } from "react-router-dom";
import Field from "../../components/Field";
import FormikForm from "../../components/ui/FormikForm";
import PageHeader from "../../components/ui/PageHeader";
import StatusPill from "../../components/ui/StatusPill";
import { api } from "../../lib/api";
import { useFetch } from "../../lib/hooks";
import { agentSchema } from "../../lib/validations";

type AgentData = {
  name: string;
  systemInstructions: string;
  language: string;
  tone: string;
  status: "ACTIVE" | "INACTIVE";
  calendlyUrl: string | null;
};

const Agent = () => {
  const navigate = useNavigate();
  const { data } = useFetch<AgentData>("/api/dashboard/agent");

  if (!data) return null;

  return (
    <section>
      <PageHeader
        title="AI Agent"
        subtitle="Configure the single assistant this business exposes through the widget."
        right={
          <StatusPill variant={data.status === "ACTIVE" ? "green" : "gray"} dot>
            {data.status === "ACTIVE" ? "Active" : "Inactive"}
          </StatusPill>
        }
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <FormikForm
          initialValues={data}
          schema={agentSchema}
          submitLabel="Save agent"
          className="panel grid gap-5 p-5"
          onSubmit={async (values) => {
            await api("/api/agent", values);
            navigate(0);
          }}
        >
          <>
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-slate-900">Agent profile</h2>
                <p className="mt-1 text-sm text-slate-500">Keep instructions direct and grounded in your knowledge base.</p>
              </div>
              <Field label="Agent name" name="name" placeholder="Agent name" />
              <Field label="System instructions" name="systemInstructions" as="textarea" className="field min-h-44" placeholder="Tell the AI how to answer, what to avoid, and how to handle unknowns." />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Language" name="language" placeholder="Language" />
                <Field label="Tone" name="tone" placeholder="Tone" />
                <Field label="Status" name="status" as="select">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Field>
              </div>
              <Field label="Calendly link (booking)" name="calendlyUrl" placeholder="https://calendly.com/your-name" />
            </div>
          </>
        </FormikForm>

        <aside className="panel h-fit p-5 space-y-5">
          <div>
            <div className="section-label">Behavior</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Answers stay grounded in the knowledge base, collect lead details naturally, and avoid inventing business facts.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            Visitor-facing responses use the configured tone, language, and business knowledge for this tenant only.
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">Quick tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-brand">•</span> Be specific about what the AI should NOT do</li>
              <li className="flex gap-2"><span className="text-brand">•</span> Include common objections and responses</li>
              <li className="flex gap-2"><span className="text-brand">•</span> Define when to hand off to a human</li>
              <li className="flex gap-2"><span className="text-brand">•</span> Set clear boundaries for booking/meetings</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Agent;