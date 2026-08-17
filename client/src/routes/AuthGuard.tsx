import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import { api, type SessionUser } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";
import { Layout } from "@/components/Layout";

const AuthGuard = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(() => !user);
  const [isValid, setIsValid] = useState(() => !!user);

  useEffect(() => {
    if (user) {
      setIsValid(true);
      setIsVerifying(false);
      return;
    }

    api<{ user: SessionUser | null }>("/api/auth/me")
      .then((data) => {
        if (data.user) dispatch(setUser(data.user));
        setIsValid(Boolean(data.user));
      })
      .catch(() => setIsValid(false))
      .finally(() => setIsVerifying(false));
  }, [user, dispatch]);

  if (isVerifying) return <Loader fullScreen />;
  if (!isValid) return <Navigate to="/login" replace />;

  return (
    <Layout user={user!}>
      <Outlet />
    </Layout>
  );
};

export default AuthGuard;