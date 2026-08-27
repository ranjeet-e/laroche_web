const studentEmailRegex =
  /^([a-zA-Z]+)\.([a-zA-Z]+)(\d+)@([a-zA-Z0-9]+)\.([a-zA-Z]{2,})\.([a-zA-Z]{2,})$/;

const isValidStudentEmail = (email) => {
  return studentEmailRegex.test(email);
};

module.exports = { isValidStudentEmail, studentEmailRegex };
