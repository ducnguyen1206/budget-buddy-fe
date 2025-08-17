import Header from "../Header";
import LoginForm from "./LoginForm";
import Footer from "../Footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-color4 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-6xl">
          {/* Center - Login Form */}
          <div className="col-span-12 lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
