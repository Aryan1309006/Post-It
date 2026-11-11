function apiErrorHandler(err, req, res, next) {
  console.error("API request failed:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: "An unexpected server error occurred" });
}

module.exports = apiErrorHandler;
