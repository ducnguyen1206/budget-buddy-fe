export default function Header() {
  return (
    <header className="flex justify-center items-center px-6 py-6">
      <div className="flex items-center justify-between w-full max-w-7xl">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Budget Buddy Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-gray-800 font-semibold text-2xl">
            Budget Buddy
          </span>
        </div>
        <div className="text-base text-gray-600">
          Don't have an account?{" "}
          <button className="text-color3 hover:text-primary font-medium">
            Register Now
          </button>
        </div>
      </div>
    </header>
  );
}
