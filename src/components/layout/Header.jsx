import Container from "../common/Container";
import Button from "../common/Button";
import { Link, useLocation } from "react-router-dom";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Header() {
  const location = useLocation();
  const { t } = useLanguage();
  const isLoginPage = location.pathname === "/login";

  return (
    <header className="py-6 border-b border-gray-100">
      <Container className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Budget Buddy Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-gray-800 font-semibold text-2xl">
            {t("header.brandName")}
          </span>
        </div>

        {/* Action */}
        <div className="text-base text-gray-600 flex items-center space-x-4">
          {/* Registration link - Only show on login page */}
          {isLoginPage && (
            <div className="flex items-center space-x-2">
              <span>{t("auth.dontHaveAccount")}</span>
              <Link
                to="/register"
                className="text-color3 hover:text-primary font-medium"
              >
                {t("auth.registerNow")}
              </Link>
            </div>
          )}
          {/* Language switcher - Show on all pages */}
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
}
