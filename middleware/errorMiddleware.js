/**
 * Global Error Handling Middleware
 * Handles all exceptions thrown in the service layer (controllers)
 * Returns structured JSON error responses
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error to server console
  console.error(`❌ Error: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Build structured error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.businessRule && {
      businessRule: true,
      currentStatus: err.currentStatus,
    }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: `Duplicate value entered for field: ${Object.keys(err.keyValue).join(', ')}`,
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
    });
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorMiddleware;
