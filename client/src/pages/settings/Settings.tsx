import { useNavigate } from "react-router-dom";
import Field from "../../components/Field";
import FormikForm from "../../components/ui/FormikForm";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import { useFetch } from "../../lib/hooks";
import { settingsSchema } from "../../lib/validations";

type SettingsData = {
  name: string;
  website: string | null;
  status: "ACTIVE" | "INACTIVE";
};

const Settings = () => {
  const navigate = useNavigate();
  const { data } = useFetch<SettingsData>("/api/dashboard/settings");
  if (!data) return null;

  return (
    <section>
      <PageHeader title="Settings" subtitle="Business profile details for this workspace." />
      <div className="mt-5 max-w-2xl">
        <FormikForm
          initialValues={data}
          schema={settingsSchema}
          submitLabel="Save settings"
          className="panel grid gap-5 p-5"
          onSubmit={async (values) => {
            await api("/api/dashboard/settings", values);
            navigate(0);
          }}
        >
          <>
            <div>
              <h2 className="font-semibold text-slate-900">Business profile</h2>
              <p className="mt-1 text-sm text-slate-500">This information is used in the widget and for identification.</p>
            </div>
            <Field label="Business name" name="name" placeholder="Business name" />
            <Field label="Website" name="website" type="url" placeholder="https://example.com" />
            <Field label="Status" name="status" as="select">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Field>
          </>
        </FormikForm>
      </div>
    </section>
  );
};

export default Settings;