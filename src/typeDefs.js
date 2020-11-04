import apolloServer from "apollo-server-express";
const { gql } = apolloServer;

export const typeDefs = `
  type User {
    id: ID!
    email: String!
  }

  type ColorRGB {
    r: Int!
    g: Int!
    b: Int!
    a: Float!
  }

  type ColorParams {
    brightness: Int!
  }
  union LED = ColorRGB | ColorParams

  type Subscription {
    subscribe2sensor(topic: String!): LED
  }

  type TimeAlarm {
    hour: Int!
    minute: Int!
  }

  type Query {
    sensors: [ColorParams!]!
    me: User
    getAlarm: TimeAlarm
  }

  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }

  type Mutation {
    setColorAmbient(topic: String, r: Int, g: Int, b: Int, a: Float): ColorRGB
    setColorMain(r: Int, g: Int, b: Int, a: Float): ColorRGB
    setScene(name: String): String
    setAlarm(hour: Int!, minute: Int!): TimeAlarm
    dismissAlarm: String
    login(email: String!, password: String!): User
    invalidateTokens: Boolean!
  }
`;
