import apolloServer from "apollo-server-express";
const { gql } = apolloServer;
import { account } from "../account.js";
import { createTokens } from "../auth.js";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): User
    invalidateTokens: Boolean!
  }
`;

export const resolvers = {
  Query: {
    me: (_, __, { req }) => {
      if (!req.userId) {
        return null;
      }
      return account;
    },
  },
  Mutation: {
    login: async (_, { email, password }, { res }) => {
      const user = account.email === email ? account : null;
      if (!user) {
        return null;
      }
      const valid = user.password === password ? true : false;
      if (!valid) {
        return null;
      }
      const { accessToken, refreshToken } = createTokens(user);
      res.cookie("refresh-token", refreshToken);
      res.cookie("access-token", accessToken);

      return user;
    },
    invalidateTokens: async (_, __, { req, res }) => {
      if (!req.userId) {
        return false;
      }
      res.clearCookie("access-token");
      res.clearCookie("refresh-token");

      return true;
    },
  },
};
