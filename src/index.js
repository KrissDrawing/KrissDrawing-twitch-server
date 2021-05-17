import http from "http";
import apolloServer from "apollo-server-express";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { account } from "./account.js";
import { createTokens } from "./auth.js";
import resolvers from "./resolvers.js";
import typeDefs from "./typeDefs.js";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "./constants.js";
// import { followSubscription } from "./TwitchApi/EventSubTwitch.js";

const { ApolloServer } = apolloServer;
const { verify } = jwt;

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => {
      return { req, res };
    },
  });

  const app = express();
  app.use(cookieParser());

  app.use((req, res, next) => {
    const refreshToken = req.cookies["refresh-token"];
    const accessToken = req.cookies["access-token"];

    if (!refreshToken && !accessToken) {
      return next();
    }

    try {
      const data = verify(accessToken, ACCESS_TOKEN_SECRET);
      req.userId = data.userId;
      return next();
    } catch {}

    if (!refreshToken) {
      return next();
    }

    let data;

    try {
      data = verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch {
      return next();
    }
    const user = account;
    const tokens = createTokens(user);

    res.cookie("refresh-token", tokens.refreshToken);
    res.cookie("access-token", tokens.accessToken);
    req.userId = user.id;

    next();
  });
  server.applyMiddleware({
    app,
    cors: {
      // origin: "http://localhost:8001",
      credentials: true,
    },
  });
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port: 3000 }, () =>
    console.log(`🚀 Server ready at http://localhost:3000/graphql`)
  );
};

startServer();
