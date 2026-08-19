import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Field from "../../components/Field";
import FormikForm from "../../components/ui/FormikForm";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";
import { useFetch } from "../../lib/hooks";
import { widgetSchema } from "../../lib/validations";

type WidgetData = {
  chatEnabled: boolean;
  callEnabled: boolean;
  allowedOrigins: string | null;
  publicKey: string;
  businessId: number;
  primaryColor: string;
};

type WidgetForm = { chatEnabled: boolean; callEnabled: boolean; allowedOrigins: string | null };

const Widget = () => {
  const navigate = useNavigate();
  const { data } = useFetch<WidgetData>("/api/dashboard/widget");
  const [copied, setCopied] = useState(false);
  if (!data) return null;

  const embed = `<script src="${window.location.origin}/widget.js" data-business-id="${data.businessId}" data-widget-key="${data.publicKey}"></script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className="panel grid gap-5 p-5"
          onSubmit={async (values) => {
            await api("/api/widget/settings", values);
            navigate(0);
          }}
        >
          <>
            <div>
              <h2 className="font-semibold text-slate-900">Features</h2>
              <p className="mt-1 text-sm text-slate-500">Enable or disable chat and voice call features.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Chat enabled" name="chatEnabled" type="checkbox" />
              <Field label="Call enabled" name="callEnabled" type="checkbox" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Allowed origins</h2>
              <p className="mt-1 text-sm text-slate-500">Extra websites (one per line) where the widget may run. Your business website is always allowed.</p>
            </div>
            <Field label="Allowed origins" name="allowedOrigins" as="textarea" className="field min-h-24" placeholder="https://example.com&#10;https://shop.example.com" />
          </>
        </FormikForm>

        <div className="panel p-5 space-y-5">
          <div>
            <h2 className="font-semibold text-slate-900">Embed code</h2>
            <p className="mt-1 text-sm text-slate-500">Paste this script before the closing <code className="bg-slate-100 px-1 rounded">{"</body>"}</code> tag on any website.</p>
          </div>

          <div className="relative rounded-md bg-slate-950 p-4">
            <pre className="text-sm leading-6 text-slate-100 overflow-x-auto">{embed}</pre>
            <Button
              type="button"
              className="absolute top-4 right-4 btn-secondary text-xs"
              onClick={copyEmbed}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900">Widget preview</h3>
            <p className="mt-1 text-sm text-slate-500">This is how the launcher will appear on your site.</p>
            <div className="mt-3 relative h-20">
              <div className="absolute bottom-0 right-0 flex items-center gap-2">
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Need help?</div>
                {data.chatEnabled && (
                  <button className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-700 transition">
                    Chat with us
                  </button>
                )}
                {data.callEnabled && (
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-slate-700 transition">
                    Talk to us
                  </button>
                )}
              </div>
            </div>
          </div>

          <a className="btn-secondary w-full text-center" href="/widget-demo" target="_blank">
            Open full demo page
          </a>
        </div>
      </div>
    </section>
  );
};

export default Widget;