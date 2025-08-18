export default function FormField({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  disabled,
  children,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-lg font-semibold text-gray-700 mb-3 font-inter"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-6 py-3 pr-16 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-colors bg-white text-lg font-inter ${
            error ? "border-error focus:ring-error" : "border-gray-300"
          }`}
        />
        {children}
      </div>
      {error && <p className="mt-2 text-error text-sm font-inter">{error}</p>}
    </div>
  );
}
