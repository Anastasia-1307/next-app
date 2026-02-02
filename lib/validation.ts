export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Adresa de email nu este validă.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$!%#*?&]{8,30}$/;
  if (!passwordRegex.test(password)) {
    return "Parola trebuie să conțină: 8-30 caractere, o majusculă, o cifră și un simbol.";
  }
  return null;
}

export function validateName(name: string): string | null {
  if (name.trim().length < 3) {
    return "Numele trebuie să aibă minim 3 caractere.";
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) {
    return "Parolele nu coincid.";
  }
  return null;
}

export function validateRegistrationForm(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return errors;
}
