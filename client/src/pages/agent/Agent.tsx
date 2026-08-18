import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { api } from "../lib/api";
import { useFetch } from "../lib/hooks";
import { agentSchema } from "../lib/validations";

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
      <h1 className="page-title">AI Agent</h1>
      <p className="page-subtitle">Configure the single assistant this business exposes through the widget.</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Formik
          initialValues={data}
          validationSchema={agentSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus("");
            try {
              await api("/api/agent", values);
              navigate(0);
            } catch (error) {
              setStatus((error as Error).message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="panel grid gap-4 p-5">
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
              {status ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status}</div> : null}
              <button type="submit" className="btn-primary w-fit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save agent"}
              </button>
            </Form>
          )}
        </Formik>

        <aside className="panel h-fit p-5">
          <div className="section-label">Behavior</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Answers stay grounded in the knowledge base, collect lead details naturally, and avoid inventing business facts.
          </p>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            Visitor-facing responses use the configured tone, language, and business knowledge for this tenant only.
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Agent;
