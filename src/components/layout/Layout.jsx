// components/layout/Layout.jsx
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-color4 flex flex-col">
      <Header />
      <main className={`flex-1 ${className}`}>{children}</main>
      <Footer />
    </div>
  );
}
