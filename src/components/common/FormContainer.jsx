import { useState } from "react";
import FormField from "./FormField";
import ErrorMessage from "./ErrorMessage";
import SocialButton from "./SocialButton";

export default function FormContainer({
  title,
  subtitle,
  fields = [],
  onSubmit,
  socialProviders = [],
  footerLinks = [],
  termsText,
  loading = false,
  error = "",
  children,
  formData = {},
  validationErrors = {},
  handleChange,
  handleBlur,
  submitButton,
  socialLayout = "col", // Add prop to control social buttons layout
}) {
  const [showPassword, setShowPassword] = useState(false);

  const renderField = (field) => {
    const commonProps = {
      key: field.name,
      label: field.label,
      name: field.name,
      type: field.type,
      placeholder: field.placeholder,
      value: formData[field.name] || "",
      onChange: handleChange,
      onBlur: handleBlur,
      error: validationErrors[field.name],
      disabled: loading,
    };

    if (field.type === "password") {
      return (
        <FormField {...commonProps} type={showPassword ? "text" : "password"}>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </FormField>
      );
    }

    return <FormField {...commonProps} />;
  };

  return (
    <div className="w-full max-w-md py-8">
      {/* Header */}
      <div className="text-center mb-8">
        {children}
        <h1 className="text-2xl font-bold text-gray-800 font-inter">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 text-lg font-normal font-inter mt-2">
            {subtitle}
          </p>
        )}
      </div>

      <ErrorMessage message={error} />

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {fields.map(renderField)}
        {submitButton}
      </form>

      {/* Social Login */}
      {socialProviders.length > 0 && (
        <>
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div
            className={`space-y-3 ${
              socialLayout === "row"
                ? "grid grid-cols-3 gap-4"
                : "flex flex-col"
            }`}
          >
            {socialProviders.map((provider) => (
              <SocialButton
                key={provider.id}
                {...provider}
                disabled={loading}
              />
            ))}
          </div>
        </>
      )}

      {/* Terms */}
      {termsText && (
        <p className="mt-6 text-xs text-gray-500 text-center font-inter">
          {termsText}
        </p>
      )}

      {/* Footer Links */}
      {footerLinks.map((link, index) => (
        <p
          key={index}
          className="mt-4 text-sm text-gray-600 text-center font-inter"
        >
          {link.text}{" "}
          <a href={link.href} className="text-primary hover:underline">
            {link.label}
          </a>
        </p>
      ))}
    </div>
  );
}
