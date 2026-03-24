const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  // JWT is sent in the Authorization header as "Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify the signature and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info to req so route handlers can use it
    req.user = decoded;

    // next() passes control to the actual route handler
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
