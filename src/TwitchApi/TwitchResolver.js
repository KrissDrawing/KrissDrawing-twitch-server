import apolloServer from "apollo-server-express";
import { pubsub } from "./EventSubTwitch.js";
import { pubsubPoints } from "./PubSubTwitch.js";
import { pubsubChat } from "../TwitchBot/TwitchBot.js";
import {
  loadLastRedeems,
  saveLastRedeems,
  loadLastFollow,
} from "../../functions/localFunctions.js";
import { apiClientChannelPoints } from "./client.js";
import { getInstagramLink } from "../InstagramApi/InstagramApi.js";
// const { loadLastRedeems } = firebaseFunctions;
const { gql } = apolloServer;

export const typeDefs = gql`
  type SubObject {
    name: String!
    count: Int!
  }

  type Query {
    queue: String!
    follow: String!
    instagramPhoto: String!
    lastSub: SubObject!
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
    subscribeAlert(topic: String!): String
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
    lastSub: async () => {
      const data = await apiClientChannelPoints.helix.subscriptions.getSubscriptions(
        process.env.TWITCH_CHANNEL_ID
      );
      return { name: data?.data?.[0]?.userDisplayName, count: data?.data?.length };
    },
  },
  Subscription: {
    subscribeAlert: {
      resolve: (payload) => {
        return payload;
      },
      subscribe: (_, args) => pubsubChat.asyncIterator(args.topic),
    },
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
