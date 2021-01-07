import apolloServer from "apollo-server-express";
const { gql } = apolloServer;
import {
  pubsub,
  breakInterval,
  startInterval,
  setAmbientLight,
  setYeelightLight,
  setYeelightTemp,
  daylightLoop,
  colorFlow,
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
    setColorMain(r: Int, g: Int, b: Int, a: Float, colorTemp: Int): ColorRGB
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
    setColorAmbient(_, { topic, r = 0, g = 0, b = 0, a = 1 }, __) {
      breakInterval();
      setAmbientLight(topic, r, g, b, a);
      return { r, g, b, a };
    },
    setColorMain(_, { r = 0, g = 0, b = 0, a = 1, colorTemp }, __) {
      breakInterval();
      if (colorTemp) {
        setYeelightTemp(colorTemp, a);
      } else {
        setYeelightLight(r, g, b, a);
      }
      return { r, g, b, a };
    },
    setScene(_, { topic, name }, __) {
      breakInterval();
      if (name === "daylight") {
        startInterval();
        daylightLoop(topic);
        return name;
      } else {
        colorFlow(name);
      }
      pubsub.publish(topic, name);
      return name;
    },
  },
};
