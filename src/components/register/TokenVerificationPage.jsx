import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import ErrorMessage from "../common/ErrorMessage";
import { verifyToken } from "../../services/authService";
import { API_ERROR_MESSAGES } from "../../constants/validation";
import { Loader2, AlertCircle } from "lucide-react";

export default function TokenVerificationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");

  // Token verification function
  const performTokenVerification = async () => {
    if (!token) {
      setError(API_ERROR_MESSAGES.TOKEN_MISSING);
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    setError("");

    const result = await verifyToken(token);

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
            Verification Failed
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
            {isVerifying ? "Retrying..." : "Try Again"}
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
          Verifying your email...
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Please wait while we verify your email address.
        </p>
      </div>
    </Layout>
  );
}
