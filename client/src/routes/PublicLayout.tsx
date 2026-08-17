import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/store";

const PublicLayout = () => {
  const user = useAppSelector((state) => state.user.user);

  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PublicLayout;