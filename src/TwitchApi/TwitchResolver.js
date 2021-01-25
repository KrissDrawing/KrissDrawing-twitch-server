import apolloServer from "apollo-server-express";
import { pubsub } from "./EventSubTwitch.js";
import { pubsubPoints } from "./PubSubTwitch.js";
const { gql } = apolloServer;

export const typeDefs = gql`
  type pointsObject {
    rewardPrompt: String!
    userDisplayName: String!
    rewardCost: String!
  }

  type Subscription {
    subscribeFollow(topic: String!): String
    subscribePoints(topic: String!): pointsObject
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
    subscribePoints: {
      resolve: (payload) => {
        return payload;
      },
      subscribe: (_, args) => pubsubPoints.asyncIterator(args.topic),
    },
  },
};
