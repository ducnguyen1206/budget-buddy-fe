import { useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import Button from "../common/Button";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLoginNow = () => {
    navigate("/login");
  };

  return (
    <Layout className="flex items-center justify-center px-3 max-w-4xl mx-auto">
      <div className="w-full max-w-2xl py-8">
        {/* Header with Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 font-inter mb-4">
            {t("registration.registeredSuccessfully")}
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {t("registration.registrationComplete")}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleLoginNow}
            className="w-96 py-3 text-lg"
            variant="primary"
          >
            {t("registration.logInNow")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
