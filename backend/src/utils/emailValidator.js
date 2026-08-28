// Accepts standard email addresses including student/college formats
const studentEmailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const isValidStudentEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return studentEmailRegex.test(email.trim());
};

module.exports = { isValidStudentEmail, studentEmailRegex };
