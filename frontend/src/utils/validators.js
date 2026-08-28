// Accepts standard email addresses including student/college formats
export const studentEmailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const isValidStudentEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return studentEmailRegex.test(email.trim());
};

export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const digits = phone.toString().replace(/\D/g, '');
  return digits.length === 10;
};

export const isValidOtp = (otp) => {
  if (!otp) return false;
  const digits = otp.toString().trim();
  return /^\d{6}$/.test(digits);
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const validateSignupForm = ({ name, email, password }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Please enter your full name';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidStudentEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidStudentEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
};
