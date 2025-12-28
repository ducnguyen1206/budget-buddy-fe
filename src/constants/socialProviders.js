// Google OAuth Client ID
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1030623240280-fngn7eqokfl1u6fm65rirmrru2eqp1o7.apps.googleusercontent.com";

// Social provider configurations for registration (with "Continue with..." prefix)
export const SOCIAL_PROVIDERS = [
  {
    id: "google",
    icon: "https://developers.google.com/identity/images/g-logo.png",
    label: "Continue with Google",
  },
  {
    id: "facebook",
    icon: "/facebook.png",
    label: "Continue with Facebook",
  },
  {
    id: "apple",
    icon: "/apple.png",
    label: "Continue with Apple",
  },
];

// Social provider configurations for login (shorter labels)
export const LOGIN_SOCIAL_PROVIDERS = [
  {
    id: "google",
    icon: "https://developers.google.com/identity/images/g-logo.png",
    label: "Google",
  }
];
