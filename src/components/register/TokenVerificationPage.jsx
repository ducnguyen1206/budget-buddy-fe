import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import ErrorMessage from "../common/ErrorMessage";
import { verifyToken } from "../../services/authService";
import { API_ERROR_MESSAGES } from "../../constants/validation";
import { Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TokenVerificationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");

  // Token verification function
  const performTokenVerification = async () => {
    if (!token) {
      setError(t(API_ERROR_MESSAGES.TOKEN_MISSING));
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    setError("");

    const result = await verifyToken(token, t);

    if (result.success) {
      navigate("/reset-password", {
        state: { token },
      });
    } else {
      setError(result.error);
      setIsVerifying(false);
    }
  };

  // Token verification effect
  useEffect(() => {
    performTokenVerification();
  }, [token, navigate]);

  // Retry handler
  const handleRetry = () => {
    performTokenVerification();
  };

  // Error state
  if (error) {
    return (
      <Layout className="flex items-center justify-center px-3 max-w-xl mx-auto">
        <div className="w-full max-w-md py-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-error rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 font-inter mb-4">
            {t("common.error")}
          </h1>
          <ErrorMessage message={error} />
          <button
            onClick={handleRetry}
            disabled={isVerifying}
            className={`inline-block px-6 py-3 rounded-2xl font-medium transition-colors ${
              isVerifying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-secondary"
            }`}
          >
            {isVerifying ? t("common.retry") : t("common.tryAgain")}
          </button>
        </div>
      </Layout>
    );
  }

  // Loading state
  return (
    <Layout className="flex items-center justify-center px-3 max-w-xl mx-auto">
      <div className="w-full max-w-md py-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 font-inter mb-4">
          {t("auth.verifying")}
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          {t("common.loading")}
        </p>
      </div>
    </Layout>
  );
}
