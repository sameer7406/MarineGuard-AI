const errorHandler = (err, req, res, next) => {
  console.error(`[API ERROR] ${req.method} ${req.url} - ${err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    status: 'FAILED',
    timestamp: new Date().toISOString()
  });
};

module.exports = { errorHandler };
