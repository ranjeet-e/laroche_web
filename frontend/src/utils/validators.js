// Same regex as backend's emailValidator.js — used here for instant frontend feedback
export const studentEmailRegex =
  /^([a-zA-Z]+)\.([a-zA-Z]+)(\d+)@([a-zA-Z0-9]+)\.([a-zA-Z]{2,})\.([a-zA-Z]{2,})$/;

export const isValidStudentEmail = (email) => {
  return studentEmailRegex.test(email);
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const validateSignupForm = ({ name, email, password }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Please enter your full name';
  }

  if (!isValidStudentEmail(email)) {
    errors.email = 'Please use a valid college email (e.g. john.doe23@college.edu.in)';
  }

  if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
};
