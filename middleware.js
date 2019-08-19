const jwt = require("jsonwebtoken");
const secret = process.env.secret;

const withAuth = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.cookies.token;

  if (!token) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).send("Unauthorized: Invalid token");
      } else {
        req.uni = decoded.uni;
        next();
      }
    });
  }
};

const withAdminAuth = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.cookies.token;

  if (!token) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).send("Unauthorized: Invalid token");
      } else if (decoded.admin){
        req.uni = decoded.uni;
        next();
      } else {
        res.status(401).send("Unauthorized: Not an admin");
      }
    });
  }
}

module.exports = {
  withAuth,
  withAdminAuth
};
