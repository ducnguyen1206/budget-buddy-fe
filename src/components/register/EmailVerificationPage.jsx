import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import Button from "../common/Button";
import { ArrowLeft, Mail } from "lucide-react";

export default function EmailVerificationPage() {
  const navigate = useNavigate();

  const handleOpenEmailInbox = () => {
    // Open Gmail in new tab
    window.open("https://mail.google.com", "_blank");
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <Layout className="flex items-center justify-center px-3 max-w-4xl mx-auto">
      <div className="w-full max-w-2xl py-8">
        {/* Header with Email Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 font-inter mb-4">
            Check your email!
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Thanks! An email was sent that will ask you to click on a link to
            register for the new account. If you don't get the email, please
            contact{" "}
            <a
              href="mailto:budgetbuddy@budgetbd.com"
              className="text-primary hover:text-secondary underline"
            >
              budgetbuddy@budgetbd.com
            </a>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 flex flex-col items-center">
          <Button
            onClick={handleOpenEmailInbox}
            className="w-96 py-3 text-lg"
            variant="primary"
          >
            Open email inbox
          </Button>

          <Button
            onClick={handleBackToLogin}
            className="w-96 py-3 text-lg text-gray-500 hover:text-gray-700 flex items-center justify-center"
            variant="text"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to login
          </Button>
        </div>
      </div>
    </Layout>
  );
}
