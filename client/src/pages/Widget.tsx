import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { api } from "../lib/api";
import { useFetch } from "../lib/hooks";
import { widgetSchema } from "../lib/validations";

type WidgetData = {
  chatEnabled: boolean;
  callEnabled: boolean;
  allowedOrigins: string | null;
  publicKey: string;
  businessId: number;
};

const Widget = () => {
  const navigate = useNavigate();
  const { data } = useFetch<WidgetData>("/api/dashboard/widget");
  if (!data) return null;

  const embed = `<script src="${window.location.origin}/widget.js" data-business-id="${data.businessId}" data-widget-key="${data.publicKey}"></script>`;

  return (
    <section>
      <h1 className="page-title">Widget</h1>
      <p className="page-subtitle">Customize the visitor-facing chat and call launcher.</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Formik
          initialValues={{
            chatEnabled: data.chatEnabled,
            callEnabled: data.callEnabled,
            allowedOrigins: data.allowedOrigins
          }}
          validationSchema={widgetSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus("");
            try {
              await api("/api/widget/settings", values);
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
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Chat enabled" name="chatEnabled" type="checkbox" />
                <Field label="Call enabled" name="callEnabled" type="checkbox" />
              </div>
              <Field label="Allowed origins" name="allowedOrigins" as="textarea" className="field min-h-24" hint="Extra websites (one per line) where the widget may run. Your business website is always allowed." />
              {status ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status}</div> : null}
              <button type="submit" className="btn-primary w-fit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save widget settings"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="panel p-5 h-fit">
          <h2 className="font-semibold text-slate-900">Embed code</h2>
          <p className="mt-1 text-sm text-slate-500">Paste this script before the closing body tag on any website.</p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">{embed}</pre>
          <a className="btn-secondary mt-4" href="/widget-demo" target="_blank">
            Open demo page
          </a>
        </div>
      </div>
    </section>
  );
}

export default Widget;
