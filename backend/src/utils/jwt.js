import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const createSecretToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateSixDigitCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};