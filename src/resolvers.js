import mqttSub from "graphql-mqtt-subscriptions";
import mqtt from "mqtt";
import { account } from "./account.js";
import { createTokens } from "./auth.js";
import yeelightNode from "yeelight-node";

const { Yeelight } = yeelightNode;
const { MQTTPubSub } = mqttSub;
const { connect } = mqtt;

const client = connect("mqtt://192.168.1.44", {
  reconnectPeriod: 1000,
});

const pubsub = new MQTTPubSub({
  client,
});

const yeelight1 = new Yeelight({ ip: "192.168.1.35", port: 55443 });
const yeelight2 = new Yeelight({ ip: "192.168.1.36", port: 55443 });
const yeelight3 = new Yeelight({ ip: "192.168.1.37", port: 55443 });

const mainLights = [yeelight1, yeelight2, yeelight3];
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
    me: (_, __, { req }) => {
      if (!req.userId) {
        return null;
      }
      return account;
    },
  },
  Mutation: {
    setColorAmbient(_, { topic, r, g, b, a }, __) {
      pubsub.publish(topic, { r, g, b, a });
      return { r, g, b, a };
    },
    setColorMain(_, { r, g, b, a }, __) {
      mainLights.forEach((light) => {
        if (a < 0.01) {
          light.set_power("off");
        } else {
          light.set_power("on");
        }
        light.set_rgb([r, g, b]);
        light.set_bright(a * 100);
        if (a < 0.01) {
          light.set_power("off");
        }
      });
      return { r, g, b, a };
    },

    login: async (_, { email, password }, { res }) => {
      const user = account.email === email ? account : null;
      if (!user) {
        return null;
      }

      const valid = user.password === password ? true : false;
      if (!valid) {
        return null;
      }

      const { accessToken, refreshToken } = createTokens(user);

      res.cookie("refresh-token", refreshToken);
      res.cookie("access-token", accessToken);

      return user;
    },
    invalidateTokens: async (_, __, { req, res }) => {
      if (!req.userId) {
        return false;
      }

      res.clearCookie("access-token");
      res.clearCookie("refresh-token");

      return true;
    },
  },
};
