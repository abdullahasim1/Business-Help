import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Field from "../../components/Field";
import FormikForm from "../../components/ui/FormikForm";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import { useFetch } from "../../lib/hooks";
import { knowledgeSchema } from "../../lib/validations";

type KnowledgeDoc = {
  id: number;
  fileName: string;
  fileSize: number;
  createdAt: string;
};

type KnowledgeData = { knowledgeText: string; documents: KnowledgeDoc[] };

type KnowledgeForm = { type: "MANUAL" | "WEBSITE"; url: string; content: string };

const Knowledge = () => {
  const navigate = useNavigate();
  const { data, reload } = useFetch<KnowledgeData>("/api/dashboard/knowledge");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  if (!data) return null;

  const handleUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadStatus("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("File size must be less than 10 MB.");
      return;
    }
    setUploading(true);
    setUploadStatus("");
    try {
      const form = new FormData();
      form.append("file", file);
      await api("/api/knowledge/upload", form);
      reload();
      setUploadStatus("Uploaded successfully.");
    } catch (error) {
      setUploadStatus((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleUpload(file);
    event.target.value = "";
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api(`/api/knowledge/documents/${id}`, {}, { method: "DELETE" });
      reload();
    } catch (error) {
      setUploadStatus((error as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <PageHeader title="Knowledge Base" subtitle="Keep all business knowledge in one simple place for the AI. Add inline text or upload PDFs." />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <FormikForm<KnowledgeForm>
          initialValues={{ type: "MANUAL", url: "", content: data.knowledgeText }}
          schema={knowledgeSchema}
          submitLabel="Save knowledge"
          className="panel grid gap-5 p-5"
          onSubmit={async (values) => {
            await api("/api/knowledge", values);
            navigate(0);
          }}
        >
          {({ values, setFieldValue }) => (
            <>
              <div>
                <h2 className="font-semibold text-slate-900">Inline text</h2>
                <p className="mt-1 text-sm text-slate-500">Paste your services, FAQs, hours, policies, and other information.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                  <span>Source</span>
                  <select className="field" value={values.type} onChange={(event) => setFieldValue("type", event.target.value)}>
                    <option value="MANUAL">Paste text manually</option>
                    <option value="WEBSITE">Fetch from website</option>
                  </select>
                </label>
                {values.type === "WEBSITE" ? (
                  <Field label="Website URL" name="url" type="url" placeholder="https://example.com" />
                ) : null}
              </div>

              {values.type === "MANUAL" ? (
                <Field label="Knowledge content" name="content" as="textarea" className="field min-h-64" placeholder="Services, FAQs, hours, policies..." />
              ) : null}
            </>
          )}
        </FormikForm>

        <div className="panel grid gap-5 p-5">
          <div>
            <h2 className="font-semibold text-slate-900">PDF documents</h2>
            <p className="mt-1 text-sm text-slate-500">Upload PDFs — the AI reads their text as part of the knowledge base.</p>
          </div>

          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition ${
              dragActive ? "border-brand bg-brand/5" : "border-slate-300 hover:border-brand hover:bg-brand/5"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input type="file" accept="application/pdf" className="hidden" id="pdf-upload" onChange={handleFileSelect} disabled={uploading} />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-brand text-2xl">📄</div>
              <p className="mt-3 text-sm font-medium text-slate-900">Drag & drop a PDF or click to browse</p>
              <p className="mt-1 text-xs text-slate-500">Max 10 MB • PDF only</p>
            </label>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                  <p className="mt-2 text-sm font-medium text-slate-700">Uploading...</p>
                </div>
              </div>
            )}
          </div>

          {uploadStatus ? (
            <div className={`rounded-md px-3 py-2 text-sm ${uploadStatus === "Uploaded successfully." ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {uploadStatus}
            </div>
          ) : null}

          <ul className="divide-y divide-slate-200">
            {data.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600 font-bold">📄</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{doc.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {(doc.fileSize / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  className="btn-secondary shrink-0 text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                >
                  {deletingId === doc.id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
            {!data.documents.length ? (
              <li className="py-8 text-center text-sm text-slate-500">No PDFs uploaded yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Knowledge;