import Container from "../common/Container";
import Button from "../common/Button";
import { Link } from "react-router-dom";

export default function Header() {
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
            Budget Buddy
          </span>
        </div>

        {/* Action */}
        <div className="text-base text-gray-600 flex items-center space-x-2">
          <span>Don’t have an account?</span>
          <Link
            to="/register"
            className="text-color3 hover:text-primary font-medium"
          >
            Register Now
          </Link>
        </div>
      </Container>
    </header>
  );
}
