import { VALIDATION_RULES } from "../constants/validation";

// Password validation function
export const validatePassword = (password) => {
  if (!password) return VALIDATION_RULES.PASSWORD.REQUIRED;
  if (password.length < 8) return VALIDATION_RULES.PASSWORD.MIN_LENGTH;
  if (!/(?=.*[a-z])/.test(password)) return VALIDATION_RULES.PASSWORD.LOWERCASE;
  if (!/(?=.*[A-Z])/.test(password)) return VALIDATION_RULES.PASSWORD.UPPERCASE;
  if (!/(?=.*\d)/.test(password)) return VALIDATION_RULES.PASSWORD.NUMBER;
  return "";
};

// Confirm password validation function
export const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) return VALIDATION_RULES.PASSWORD.CONFIRM_REQUIRED;
  if (confirmPassword !== password) return VALIDATION_RULES.PASSWORD.MISMATCH;
  return "";
};

// Form validation helper
export const isPasswordFormValid = (formData, validationErrors) => {
  return (
    formData.password.trim() !== "" &&
    formData.confirmPassword.trim() !== "" &&
    !validationErrors.password &&
    !validationErrors.confirmPassword
  );
};
