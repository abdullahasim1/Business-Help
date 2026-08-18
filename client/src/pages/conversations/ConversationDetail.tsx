import { useParams } from "react-router-dom";
import { useFetch } from "../../lib/hooks";
import { readMessages, type Conversation } from "../../lib/conversations";

const ConversationDetail = () => {
  const { id } = useParams();
  const { data, error } = useFetch<Conversation>(`/api/dashboard/conversations/${id}`);

  if (error) return <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>;
  if (!data) return null;

  const firstMessage = readMessages(data.messagesJson)[0];

  return (
    <section>
      <h1 className="page-title">Conversation</h1>
      <p className="page-subtitle">
        {data.contact?.email || data.contact?.phone || "Unknown visitor"}
        {firstMessage ? ` · ${new Date(firstMessage.createdAt).toLocaleString()}` : ""}
      </p>
      <div className="panel mt-5 grid gap-3 bg-slate-50/70 p-5">
        {readMessages(data.messagesJson).map((message, index) => (
          <div key={`${message.createdAt}-${index}`} className={message.role === "user" ? "justify-self-end" : "justify-self-start"}>
            <div
              className={
                message.role === "user"
                  ? "max-w-xl rounded-lg bg-brand px-4 py-2.5 text-sm leading-6 text-white shadow-sm"
                  : "max-w-xl rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm leading-6 text-slate-700 shadow-sm"
              }
            >
              {message.content}
            </div>
            <div className={`mt-1 text-[11px] text-slate-400 ${message.role === "user" ? "text-right" : ""}`}>
              {new Date(message.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ConversationDetail;