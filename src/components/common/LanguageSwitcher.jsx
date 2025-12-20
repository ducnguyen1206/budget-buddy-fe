import { useLanguage, LANGUAGES } from "../../contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageChange = (language) => {
    changeLanguage(language);
  };

  const getLanguageName = (lang) => {
    return lang === LANGUAGES.EN ? "English" : "Tiếng Việt";
  };

  const getLanguageFlag = (lang) => {
    return lang === LANGUAGES.EN ? "🇺🇸" : "🇻🇳";
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Globe icon */}
      <Globe className="w-4 h-4 text-gray-500" />

      {/* Language buttons */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleLanguageChange(LANGUAGES.EN)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
            currentLanguage === LANGUAGES.EN
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
          title="Switch to English"
        >
          <span className="text-sm">{getLanguageFlag(LANGUAGES.EN)}</span>
          <span className="hidden sm:inline">
            {getLanguageName(LANGUAGES.EN)}
          </span>
          <span className="sm:hidden">EN</span>
        </button>

        <button
          onClick={() => handleLanguageChange(LANGUAGES.VI)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
            currentLanguage === LANGUAGES.VI
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
          title="Chuyển sang Tiếng Việt"
        >
          <span className="text-sm">{getLanguageFlag(LANGUAGES.VI)}</span>
          <span className="hidden sm:inline">
            {getLanguageName(LANGUAGES.VI)}
          </span>
          <span className="sm:hidden">VI</span>
        </button>
      </div>
    </div>
  );
}
