import LoginForm from "./LoginForm";
import Layout from "../layout/Layout";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken } from "../../services/authService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function LoginPage() {
  const navigate = useNavigate();
  const attemptedRefreshRef = useRef(false);

  useEffect(() => {
    if (attemptedRefreshRef.current) return;
    attemptedRefreshRef.current = true;

    const tryRefresh = async () => {
      const result = await refreshToken();

      if (shouldRedirectToLogin(result)) {
        return;
      }

      if (result?.success) {
        navigate("/transactions", { replace: true });
      }
    };

    void tryRefresh();
  }, [navigate]);

  return (
    <Layout className="flex items-center justify-center px-3 max-w-xl mx-auto">
      <LoginForm />
    </Layout>
  );
}
