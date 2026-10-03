const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.error('❌ [ErrorHandler Error]:', err.stack || err);
  } else {
    // Production: log error message without leaking sensitive user data or stack
    console.error('❌ [Server Error]:', err.message || 'Internal error');
  }

  let statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
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

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Handle Invalid MongoDB ObjectId CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired authentication session. Please sign in again.';
  }

  // Security Hardening: Never leak internal database errors or stack traces to clients in production
  if (statusCode === 500 && !isDev) {
    message = 'An internal server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { error: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
