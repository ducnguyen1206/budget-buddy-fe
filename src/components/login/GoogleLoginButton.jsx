import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from 'react-google-button';
import { loginWithGoogle } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        console.log("Google auth code received:", codeResponse.code);
        
        // Call the backend API with the authorization code
        const result = await loginWithGoogle(codeResponse.code, t);
        
        if (result.success) {
          console.log("Login successful, tokens stored");
          // Navigate to dashboard on success
          navigate("/dashboard");
          
          // Call parent's onSuccess if provided
          if (onSuccess) {
            onSuccess(result);
          }
        } else {
          console.error("Login failed:", result.error);
          // Call parent's onError if provided
          if (onError) {
            onError(result.error);
          }
        }
      } catch (error) {
        console.error("Error processing Google login:", error);
        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      setIsLoading(false);
      if (onError) {
        onError(error);
      }
    },
    flow: 'auth-code',
  });

  return (
    <div className="w-full flex justify-center">
      <GoogleButton
        onClick={() => login()}
        disabled={isLoading}
        label={isLoading ? "Signing in..." : "Sign in with Google"}
        type="light"
      />
    </div>
  );
};

export default GoogleLoginButton;