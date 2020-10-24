import apolloServer from "apollo-server-express";
const { gql } = apolloServer;

export const typeDefs = gql`
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

  type Query {
    sensors: [ColorParams!]!
    me: User
  }

  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }

  type Mutation {
    setColorAmbient(topic: String, r: Int, g: Int, b: Int, a: Float): ColorRGB
    setColorMain(r: Int, g: Int, b: Int, a: Float): ColorRGB
    login(email: String!, password: String!): User
    invalidateTokens: Boolean!
  }
`;
