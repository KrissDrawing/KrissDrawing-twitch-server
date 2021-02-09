import apolloServer from "apollo-server-express";
import { pubsub } from "./EventSubTwitch.js";
import { pubsubPoints } from "./PubSubTwitch.js";
import {
  loadLastRedeems,
  saveLastRedeems,
  loadLastFollow,
} from "../../functions/localFunctions.js";
import { getInstagramLink } from "../InstagramApi/InstagramApi.js";
// const { loadLastRedeems } = firebaseFunctions;
const { gql } = apolloServer;

export const typeDefs = gql`
  type Query {
    queue: String!
    follow: String!
    instagramPhoto: String!
  }

  type Mutation {
    queue(payload: String!): String
  }

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
    query: Query
    mutation: Mutation
  }
`;

export const resolvers = {
  Mutation: {
    queue(_, { payload }, __) {
      saveLastRedeems(payload);
      return payload;
    },
  },
  Query: {
    queue: async () => {
      return await loadLastRedeems();
    },
    follow: async () => {
      return await loadLastFollow();
    },
    instagramPhoto: async () => {
      return await getInstagramLink();
    },
  },
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
