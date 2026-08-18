import { Suspense, lazy, useMemo } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate, useRoutes } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import { useAppSelector } from "@/store/store";
import AuthGuard from "./AuthGuard";
import PublicLayout from "./PublicLayout";

const Login = lazy(() => import("@/pages/auth/Login"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Contacts = lazy(() => import("@/pages/contacts/Contacts"));
const Conversations = lazy(() => import("@/pages/conversations/Conversations"));
const ConversationDetail = lazy(() => import("@/pages/conversations/ConversationDetail"));
const Calls = lazy(() => import("@/pages/calls/Calls"));
const Bookings = lazy(() => import("@/pages/bookings/Bookings"));
const Agent = lazy(() => import("@/pages/agent/Agent"));
const Knowledge = lazy(() => import("@/pages/knowledge/Knowledge"));
const Widget = lazy(() => import("@/pages/widget/Widget"));
const Settings = lazy(() => import("@/pages/settings/Settings"));
const SuperAdmin = lazy(() => import("@/pages/super-admin/SuperAdmin"));
const Businesses = lazy(() => import("@/pages/super-admin/Businesses"));
const WidgetDemo = lazy(() => import("@/pages/demo/WidgetDemo"));

const businessRoutes: RouteObject[] = [
  { index: true, element: <Dashboard /> },
  { path: "contacts", element: <Contacts /> },
  { path: "conversations", element: <Conversations /> },
  { path: "conversations/:id", element: <ConversationDetail /> },
  { path: "calls", element: <Calls /> },
  { path: "bookings", element: <Bookings /> },
  { path: "agent", element: <Agent /> },
  { path: "knowledge", element: <Knowledge /> },
  { path: "widget", element: <Widget /> },
  { path: "settings", element: <Settings /> }
];

const superAdminRoutes: RouteObject[] = [
  { index: true, element: <SuperAdmin /> },
  { path: "businesses", element: <Businesses /> }
];

const Home = () => {
  const user = useAppSelector((state) => state.user.user);
  return <Navigate to={user?.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard"} replace />;
};

const Routes = () => {
  const user = useAppSelector((state) => state.user.user);
  const role = user?.role ?? "";

  const roleBasedRoutes = useMemo(() => {
    if (role === "SUPER_ADMIN") return superAdminRoutes;
    if (role === "BUSINESS_ADMIN") return businessRoutes;
    return [];
  }, [role]);

  const routes = useRoutes([
    {
      element: <AuthGuard />,
      children: [
        { path: "dashboard", children: role === "BUSINESS_ADMIN" ? roleBasedRoutes : [] },
        { path: "super-admin", children: role === "SUPER_ADMIN" ? roleBasedRoutes : [] }
      ]
    },
    {
      element: <PublicLayout />,
      children: [{ path: "login", element: <Login /> }]
    },
    { path: "widget-demo", element: <WidgetDemo /> },
    { path: "/", element: <Home /> },
    { path: "*", element: <Navigate to="/" replace /> }
  ]);

  return <Suspense fallback={<Loader fullScreen />}>{routes}</Suspense>;
};

export default Routes;