import jsonwebtoken from "jsonwebtoken";
const { sign } = jsonwebtoken;
import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "./constants.js";

export const createTokens = (user) => {
  const refreshToken = sign({ userId: user.id, count: user.count }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const accessToken = sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15min",
  });

  return { refreshToken, accessToken };
};
