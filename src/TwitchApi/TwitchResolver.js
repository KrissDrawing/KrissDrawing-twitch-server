import apolloServer from "apollo-server-express";
import { pubsub } from "./client.js";
import { withFilter } from "apollo-server";
const { gql } = apolloServer;

export const typeDefs = gql`
  type Subscription {
    subscribeFollow(topic: String!): String
  }

  schema {
    subscription: Subscription
  }
`;

export const resolvers = {
  Subscription: {
    subscribeFollow: {
      resolve: (payload) => {
        return payload;
      },
      subscribe: (_, args) => pubsub.asyncIterator(args.topic),
    },
  },
};
