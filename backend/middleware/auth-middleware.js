const jwt = require("jsonwebtoken");

function requireApiLogin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication required" });
  }
}

module.exports = { requireApiLogin };
