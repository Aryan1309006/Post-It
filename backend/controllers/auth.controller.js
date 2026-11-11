const authService = require("../services/auth.service");

async function me(req, res) {
  const result = await authService.getApiProfile(req.user.userid);
  if (!result.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  res.json(result);
}

async function register(req, res) {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (await authService.findUserByEmail(email)) {
    return res.status(409).json({ error: "User already exists" });
  }

  const user = await authService.createUser({ name, email, password });
  authService.setAuthCookie(res, user);
  res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email } });
}

async function login(req, res) {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const user = await authService.findUserByEmail(email);

  if (!user || !(await authService.verifyPassword(password, user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  authService.setAuthCookie(res, user);
  res.json({ user: { _id: user._id, name: user.name, email: user.email } });
}

function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.sendStatus(204);
}

module.exports = { me, register, login, logout };
