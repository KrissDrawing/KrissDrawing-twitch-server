import apolloServer from "apollo-server-express";
import { pubsub } from "./EventSubTwitch.js";
import { pubsubPoints } from "./PubSubTwitch.js";
import { pubsubChat } from "../TwitchBot/TwitchBot.js";
import {
  loadLastRedeems,
  saveLastRedeems,
  loadLastFollow, getPlayQueue,
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

  type FollowObject {
    name: String!
    count: Int!
  }
  
  type QueuePlayer {
    name: String!
    costume: Int!
    startPlaying: String
  }
  
  type QueueObject {
    queue: [QueuePlayer]!
  }
  

  type Query {
    queue: String!
    follow: FollowObject!
    instagramPhoto: String!
    lastSub: SubObject!
    playQueue: [QueuePlayer]!
  }

  type Mutation {
    queue(payload: String!): String
  }

  type pointsObject {
    rewardPrompt: String!
    userDisplayName: String!
    rewardCost: String!
    userId: String!
    id: String!
  }

  type Subscription {
    subscribeAlert(topic: String!): String
    subscribeFollow(topic: String!): FollowObject
    subscribePoints(topic: String!): pointsObject
    subscribeQueue(topic: String!): QueueObject
    subscribeHelloReward(topic: String!): Boolean
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
    playQueue: async () => {
      return await getPlayQueue();
    },
    follow: async () => {
      console.log(await loadLastFollow());
      return await loadLastFollow();
    },
    instagramPhoto: async () => {
      return await getInstagramLink();
    },
    lastSub: async () => {
      const data = await apiClientChannelPoints.helix.subscriptions.getSubscriptions(
        process.env.TWITCH_CHANNEL_ID
      );
      return {
        name:
          data?.data?.length > 1
            ? data?.data?.[data?.data?.length - 2].userDisplayName
            : data?.data?.[0]?.userDisplayName,
        count: data?.data?.length,
      };
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
    subscribeQueue: {
      resolve: (payload) => {
        return payload;
      },
      subscribe: (_, args) => pubsubChat.asyncIterator(args.topic),
    },
    subscribeHelloReward: {
      resolve: (payload) => {
        return payload;
      },
      subscribe: (_, args) => pubsubPoints.asyncIterator(args.topic),
    },
  },
};
