const config = require("../util/config");

const jwt = require("jsonwebtoken");
// const error = require("../util/error");

function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  // console.log(req.headers);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token
  console.log("authHeader",authHeader);
  console.log("token",token);
  jwt.verify(token, config.constants.encryption_key, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function checkIfTokenExists(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) req.user = { rec_id: -1 }; // if there isn't any token

  jwt.verify(token, config.constants.encryption_key, (err, user) => {
    if (err) req.user = { rec_id: -1 };
    else req.user = user;
    next();
  });
}

function generateAccessToken(username) {
  console.log(username);
  return jwt.sign(username, config.constants.encryption_key, {
    // expiresIn:"10s"
    expiresIn: config.constants.expiry_time,
  });
}

module.exports = { authenticateToken, checkIfTokenExists, generateAccessToken };
