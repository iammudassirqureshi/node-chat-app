import jwt from "jsonwebtoken";
import User from "../schemas/User.mjs";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        success: false,
        message: "Token has expired, please log in again",
      });
    }

    const user = await User.findOne({ _id: decoded.sub });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route, user not found",
      });
    }

    req.user = user;
    req.token = token;
    req.tokenData = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please log in again",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token, please log in again",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return (
        res.status(403),
        json({
          success: false,
          message: `Access denied: role ${req.user.role} not allowed`,
        })
      );
    }
    next();
  };
};
