import { Suspense, lazy, useMemo } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate, useRoutes } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import { useAppSelector } from "@/store/store";
import AuthGuard from "./AuthGuard";
import PublicLayout from "./PublicLayout";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const Conversations = lazy(() => import("@/pages/Conversations"));
const ConversationDetail = lazy(() => import("@/pages/ConversationDetail"));
const Calls = lazy(() => import("@/pages/Calls"));
const Agent = lazy(() => import("@/pages/Agent"));
const Knowledge = lazy(() => import("@/pages/Knowledge"));
const Widget = lazy(() => import("@/pages/Widget"));
const Settings = lazy(() => import("@/pages/Settings"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const Businesses = lazy(() => import("@/pages/Businesses"));
const WidgetDemo = lazy(() => import("@/pages/WidgetDemo"));

const businessRoutes: RouteObject[] = [
  { index: true, element: <Dashboard /> },
  { path: "contacts", element: <Contacts /> },
  { path: "conversations", element: <Conversations /> },
  { path: "conversations/:id", element: <ConversationDetail /> },
  { path: "calls", element: <Calls /> },
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