const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server';

  // Handle MongoDB Unique Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    if (field === 'phone') {
      message = 'An account with this mobile number already exists. Please sign in instead.';
    } else if (field === 'email') {
      message = 'An account with this email address already exists. Please sign in instead.';
    } else {
      message = 'An account with these details already exists. Please sign in.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
