import { VALIDATION_RULES } from "../constants/validation";

// Email validation function
export const validateEmail = (email, t) => {
  if (!email) {
    return t
      ? t(VALIDATION_RULES.EMAIL.REQUIRED)
      : VALIDATION_RULES.EMAIL.REQUIRED;
  }

  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return t
      ? t(VALIDATION_RULES.EMAIL.INVALID)
      : VALIDATION_RULES.EMAIL.INVALID;
  }

  return "";
};

// Password validation function (for login)
export const validatePassword = (password, t) => {
  if (!password) {
    return t
      ? t(VALIDATION_RULES.PASSWORD.REQUIRED)
      : VALIDATION_RULES.PASSWORD.REQUIRED;
  }

  if (password.length < 8) {
    return t
      ? t(VALIDATION_RULES.PASSWORD.MIN_LENGTH)
      : VALIDATION_RULES.PASSWORD.MIN_LENGTH;
  }

  return "";
};

// Form validation helper (for registration - email only)
export const isFormValid = (formData, validationErrors) => {
  return formData.email.trim() !== "" && !validationErrors.email;
};

// Login form validation helper (email and password)
export const isLoginFormValid = (formData, validationErrors) => {
  return (
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    !validationErrors.email &&
    !validationErrors.password
  );
};
