export default function SocialButton({ id, icon, label, onClick, disabled }) {
  return (
    <button
      key={id}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center space-x-2 py-4 px-5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors bg-white font-inter disabled:opacity-50"
    >
      <img src={icon} alt={label} className="w-5 h-5" />
      <span className="text-lg font-medium text-gray-700 font-inter">
        {label}
      </span>
    </button>
  );
}
