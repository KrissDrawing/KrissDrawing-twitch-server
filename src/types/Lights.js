import apolloServer from "apollo-server-express";
const { gql } = apolloServer;
import {
  pubsub,
  breakInterval,
  setAmbientLight,
  setYeelightLight,
} from "../utilities/lightControlls.js";

export const typeDefs = gql`
  type ColorRGB {
    r: Int!
    g: Int!
    b: Int!
    a: Float!
  }

  type Subscription {
    subscribe2sensor(topic: String!): ColorRGB
  }

  type Query {
    sensors: [ColorRGB!]!
    getAlarm: TimeAlarm
  }

  type Mutation {
    setColorAmbient(topic: String, r: Int, g: Int, b: Int, a: Float): ColorRGB
    setColorMain(r: Int, g: Int, b: Int, a: Float): ColorRGB
    setScene(name: String): String
  }
  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }
`;

export const resolvers = {
  Subscription: {
    subscribe2sensor: {
      resolve: (payload) => {
        return;
      },
      subscribe: (_, args) => {
        return pubsub.asyncIterator(args.topic);
      },
    },
  },
  Query: {
    sensors: () => {
      return [{ id: "Sensor1" }, { id: "Sensor2" }];
    },
  },
  Mutation: {
    setColorAmbient(_, { topic, r, g, b, a }, __) {
      breakInterval();
      setAmbientLight(topic, r, g, b, a);
      return { r, g, b, a };
    },
    setColorMain(_, { r, g, b, a }, __) {
      breakInterval();
      setYeelightLight(r, g, b, a);
      return { r, g, b, a };
    },
    setScene(_, { topic, name }, __) {
      if (name == "daylight") {
        isIntervalWorking = true;
        daylightLoop(topic);
        return name;
      }
      pubsub.publish(topic, name);
      return name;
    },
  },
};
