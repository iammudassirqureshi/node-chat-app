import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  const payload = {
    sub: user._id,
    role: user.role,
    iss: "Lorem Ipsum",
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
