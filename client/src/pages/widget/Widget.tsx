import { useNavigate } from "react-router-dom";
import Field from "../../components/Field";
import FormikForm from "../../components/ui/FormikForm";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import { useFetch } from "../../lib/hooks";
import { widgetSchema } from "../../lib/validations";

type WidgetData = {
  chatEnabled: boolean;
  callEnabled: boolean;
  allowedOrigins: string | null;
  publicKey: string;
  businessId: number;
};

type WidgetForm = { chatEnabled: boolean; callEnabled: boolean; allowedOrigins: string | null };

const Widget = () => {
  const navigate = useNavigate();
  const { data } = useFetch<WidgetData>("/api/dashboard/widget");
  if (!data) return null;

  const embed = `<script src="${window.location.origin}/widget.js" data-business-id="${data.businessId}" data-widget-key="${data.publicKey}"></script>`;

  return (
    <section>
      <PageHeader title="Widget" subtitle="Customize the visitor-facing chat and call launcher." />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <FormikForm<WidgetForm>
          initialValues={{
            chatEnabled: data.chatEnabled,
            callEnabled: data.callEnabled,
            allowedOrigins: data.allowedOrigins
          }}
          schema={widgetSchema}
          submitLabel="Save widget settings"
          className="panel grid gap-4 p-5"
          onSubmit={async (values) => {
            await api("/api/widget/settings", values);
            navigate(0);
          }}
        >
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Chat enabled" name="chatEnabled" type="checkbox" />
              <Field label="Call enabled" name="callEnabled" type="checkbox" />
            </div>
            <Field label="Allowed origins" name="allowedOrigins" as="textarea" className="field min-h-24" hint="Extra websites (one per line) where the widget may run. Your business website is always allowed." />
          </>
        </FormikForm>

        <div className="panel h-fit p-5">
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
};

export default Widget;