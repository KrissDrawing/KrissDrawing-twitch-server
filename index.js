const { ApolloServer, gql, PubSub } = require("apollo-server");
const { MQTTPubSub } = require("graphql-mqtt-subscriptions");
const { Yeelight } = require("yeelight-node");
const { connect } = require("mqtt");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const client = connect("mqtt://192.168.1.44", {
  reconnectPeriod: 1000,
});

const pubsub = new MQTTPubSub({
  client,
});

const typeDefs = gql`
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
  }

  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }

  type Mutation {
    setBrightness(topic: String, brightness: Int!): ColorParams
    setColor(topic: String, r: Int, g: Int, b: Int, a: Float): ColorRGB
  }
`;

const setUpLights = (r, g, b) => {
  // let yeelight1;
  let yeelight1 = new Yeelight({ ip: "192.168.1.35", port: 55443 });
  // yeelight1.closeConnection();
  console.log(yeelight1);
  // yeelight1._connect({ ip: "192.168.1.35", port: 55443 });
  // yeelight1.set_power("on");
  yeelight1.set_rgb([r, g, b]);
  window.setTimeout(() => {
    yeelight1.closeConnection();
  }, 50);
  // yeelight1
  //   .get_prop("bright")
  //   .then((data) => console.log(data))
  //   .catch((err) => console.log(err));
};

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
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
    setBrightness(root, { topic, brightness }, context) {
      if (brightness < 0) brightness = 0;
      if (brightness > 255) brightness = 255;
      pubsub.publish(topic, brightness);
      return { brightness };
    },
    setColor(root, { topic, r, g, b, a }, context) {
      // setUpLights(r, g, b);
      for (let i = 0; i < 3; i++) {
        // context[i].set_power("on");
        context[i].set_rgb([r, g, b], "smooth", 500).catch((err) => console.log(err));
        // context[i]
        //   .get_prop("bright")
        //   .then((data) => console.log(data))
        //   .catch((err) => console.log(err));

        // console.log(context[i]);
        // context[i].closeConnection();
      }
      pubsub.publish(topic, { r, g, b, a });
      return { r, g, b, a };
    },
  },
};

// bulbs.forEach((bulb) => {
//   bulb.set_power("on");
//   bulb.set_rgb([250, 250, 250]);
//   bulb.get_prop("bright").then((data) => console.log(data));
// });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // const token = req.headers.authorization || "";
    // const user = getUser(token);
    // if (!user) throw new AuthenticationError("you must be logged in");
    // return { user };

    const yeelight1 = new Yeelight({ ip: "192.168.1.35", port: 55443 });
    const yeelight2 = new Yeelight({ ip: "192.168.1.36", port: 55443 });
    const yeelight3 = new Yeelight({ ip: "192.168.1.37", port: 55443 });

    yeelight1.set_music(1);
    yeelight2.set_music(1);
    yeelight3.set_music(1);

    const bulbs = [yeelight1, yeelight2, yeelight3];
    return bulbs;
  },
});

// const server = new ApolloServer({
//   schema,
//   context: async ({ req, connection }) => {
//     if (connection) {
//       // check connection for metadata
//       return connection.context;
//     } else {
//       // check from req
//       const token = req.headers.authorization || "";

//       return { token };
//     }
//   },
// });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
