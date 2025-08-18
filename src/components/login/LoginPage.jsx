import Header from "../layout/Header";
import LoginForm from "./LoginForm";
import Footer from "../layout/Footer";
import Layout from "../layout/Layout";

export default function LoginPage() {
  return (
    <Layout className="flex items-center justify-center px-3 max-w-xl mx-auto">
      <LoginForm />
    </Layout>
  );
}
