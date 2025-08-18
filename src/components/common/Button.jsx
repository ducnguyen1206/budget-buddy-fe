export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base = "rounded-2xl font-medium transition-colors";
  const styles = {
    primary: "bg-primary text-white hover:bg-secondary",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    text: "text-color3 hover:text-primary",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
