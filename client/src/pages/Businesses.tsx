import { Form, Formik } from "formik";
import { Field } from "../components/Field";
import { api } from "../lib/api";
import { useFetch } from "../lib/hooks";
import { businessSchema } from "../lib/validations";

type Business = {
  id: number;
  name: string;
  website: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  users: { name: string; email: string }[];
};

export default function Businesses() {
  const { data, error, reload } = useFetch<Business[]>("/api/super-admin/businesses");
  const businesses = data ?? [];

  return (
    <section>
      <h1 className="page-title">Businesses</h1>
      <p className="page-subtitle">Create tenants and manage their status.</p>
      {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="grid content-start gap-5">
          <Formik
            initialValues={{ name: "", website: "", adminName: "", adminEmail: "", adminPassword: "" }}
            validationSchema={businessSchema}
            onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
              setStatus("");
              try {
                await api("/api/super-admin/businesses", values);
                resetForm();
                reload();
              } catch (err) {
                setStatus((err as Error).message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, status }) => (
              <Form className="panel grid gap-3 p-5">
                <div>
                  <h2 className="font-semibold text-slate-900">Create business</h2>
                  <p className="mt-1 text-sm text-slate-500">Add a tenant and invite its first admin.</p>
                </div>
                <Field label="Business name" name="name" placeholder="Business name" />
                <Field label="Website" name="website" placeholder="https://example.com" />
                <Field label="Admin name" name="adminName" placeholder="Admin name" />
                <Field label="Admin email" name="adminEmail" type="email" placeholder="admin@business.com" />
                <Field label="Admin password" name="adminPassword" type="password" placeholder="Minimum 8 characters" />
                {status ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status}</div> : null}
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </Form>
            )}
          </Formik>

          </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Website</th>
                <th>Status</th>
                <th>Admin</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="font-medium text-slate-900">{business.name}</td>
                  <td>{business.website || "-"}</td>
                  <td>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${business.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {business.status}
                    </span>
                  </td>
                  <td>{business.users[0]?.email || "-"}</td>
                  <td>{new Date(business.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        try {
                          await api(`/api/super-admin/businesses/${business.id}`, {
                            status: business.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                          });
                          reload();
                        } catch {
                          alert("Could not update status");
                        }
                      }}
                    >
                      {business.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {!businesses.length ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No businesses yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}