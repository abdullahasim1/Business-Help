import { Link, NavLink, useNavigate } from "react-router-dom";
import { api, type SessionUser } from "@/lib/api";
import { clearUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/store";

const groups = [
  {
    title: "Main",
    items: [
      ["Dashboard", "/dashboard", "⌂"],
      ["Contacts", "/dashboard/contacts", "♙"],
      ["Conversations", "/dashboard/conversations", "◌"],
      ["Calls", "/dashboard/calls", "⌕"]
    ]
  },
  {
    title: "AI setup",
    items: [
      ["AI Agent", "/dashboard/agent", "✦"],
      ["Knowledge Base", "/dashboard/knowledge", "▤"],
      ["Widget", "/dashboard/widget", "▣"]
    ]
  },
  { title: "Account", items: [["Settings", "/dashboard/settings", "⚙"]] }
];

const superGroups = [
  { title: "Platform", items: [["Overview", "/super-admin", "⌂"], ["Businesses", "/super-admin/businesses", "▣"]] }
];

export function Layout({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSuper = user.role === "SUPER_ADMIN";
  const navGroups = isSuper ? superGroups : groups;
  const initials = user.name.slice(0, 2).toUpperCase();

  async function logout() {
    await api("/api/auth/logout", {});
    dispatch(clearUser());
    navigate("/login");
  }

  return (
    <div className="app-background min-h-screen md:flex">
      <aside className="flex shrink-0 flex-col border-b border-slate-200 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-sm font-extrabold text-white">AI</div>
          <div>
            <div className="truncate text-sm font-bold text-slate-900">{user.businessId ? "Business workspace" : "AI Widget"}</div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{isSuper ? "Platform admin" : "Business workspace"}</div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{group.title}</div>
              <div className="grid gap-1">
                {group.items.map(([label, href, icon]) => (
                  <NavLink
                    key={href}
                    to={href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                        isActive ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <span className="grid h-5 w-5 place-items-center text-sm leading-none">{icon}</span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="m-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Widget status</div>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Ready for embeds
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="text-sm font-bold text-slate-800">AI Widget</div>
          <div className="flex items-center gap-3">
            {!isSuper ? (
              <Link to="/dashboard/widget" className="btn-primary hidden py-2 text-xs sm:inline-flex">
                Install widget
              </Link>
            ) : null}
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 md:flex">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-brand">{initials}</div>
              <span className="max-w-32 truncate text-sm font-semibold text-slate-700">{user.name}</span>
            </div>
            <button className="btn-secondary py-2 text-xs" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
