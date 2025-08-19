import { useMemo } from "react";

export default function PasswordStrengthMeter({ password }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "", textColor: "" };

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength level
    if (score <= 2) {
      return {
        score,
        label: "Weak",
        color: "bg-red-500",
        textColor: "text-red-500",
      };
    } else if (score <= 4) {
      return {
        score,
        label: "Fair",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
      };
    } else if (score <= 5) {
      return {
        score,
        label: "Good",
        color: "bg-blue-500",
        textColor: "text-blue-500",
      };
    } else {
      return {
        score,
        label: "Strong",
        color: "bg-green-500",
        textColor: "text-green-500",
      };
    }
  }, [password]);

  const getWidth = () => {
    if (strength.score <= 2) return "w-1/4";
    if (strength.score <= 4) return "w-2/4";
    if (strength.score <= 5) return "w-3/4";
    return "w-full";
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Strength Meter */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            strength.color
          } ${getWidth()}`}
        />
      </div>

      {/* Strength Text */}
      <div className="flex items-center justify-between">
        <span className="text-base text-gray-600 font-medium">
          Password strength:{" "}
          <span className={`font-bold ${strength.textColor}`}>
            {strength.label}
          </span>
        </span>
      </div>
    </div>
  );
}
