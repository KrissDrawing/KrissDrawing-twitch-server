import mqttSub from "graphql-mqtt-subscriptions";
import mqtt from "mqtt";
import { account } from "./account.js";
import { createTokens } from "./auth.js";
import yeelightNode from "yeelight-node";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { kelvinTable } from "./utilities/KelvinToRGB.js";
import schedule from "node-schedule";

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

let isIntervalWorking = false;

const breakInterval = () => {
  if (isIntervalWorking === true) isIntervalWorking = false;
};

const setLinear = (topic, r, g, b, a) => {
  pubsub.publish(topic, { r, g, b, a });
};

const setYeelight = (r, g, b, a) => {
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
};

const daylightLoop = (topic) => {
  // const sunrise = getSunrise(52.237, 21.0175).toLocaleTimeString();
  // const sunset = getSunset(52.237, 21.0175).toLocaleTimeString();
  const minTime = 3;
  const maxTime = 5;

  const xSpan = 61;

  const sunrise = getSunrise(52.237, 21.0175).getTime();
  const sunset = getSunset(52.237, 21.0175).getTime();
  const now = new Date().getTime();
  const sundiff = (sunset - sunrise) / 3600000;
  const nowdiff = (now - sunrise) / 3600000;

  let diff = ((nowdiff / sundiff) * 2 - 1) * xSpan;

  if (diff < -xSpan) {
    diff = -xSpan;
  }
  if (diff > xSpan) {
    diff = xSpan;
  }

  const colorTemp = Math.round((-Math.pow(diff, 2) + 6500) / 100) * 100;

  const randTime = Math.floor(Math.random() * minTime * 60000) + maxTime * 60000;

  const colorTempRGB = kelvinTable[colorTemp];
  const randomBrightness = Math.round((Math.random() * (1 - 0.8) + 0.8) * 100) / 100;
  if (isIntervalWorking) {
    setYeelight(colorTempRGB.r, colorTempRGB.g, colorTempRGB.b, randomBrightness);
    setLinear(topic, colorTempRGB.r, colorTempRGB.g, colorTempRGB.b, randomBrightness);
    setTimeout(() => {
      daylightLoop();
    }, randTime);
  }

  return { r: 100, g: 100, b: 100, a: 0.1 };
};

let alarmJob;
let alarmTime;

const alarmClock = (hour, minute) => {
  alarmJob = schedule.scheduleJob({ hour, minute }, function () {
    console.log("The answer to life, the universe, and everything!");
    alarmTime = null;
  });
};

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
      // alarmJob.cancel();
      if (!req.userId) {
        return null;
      }
      return account;
    },
    getAlarm: () => {
      return alarmTime;
    },
  },
  Mutation: {
    setColorAmbient(_, { topic, r, g, b, a }, __) {
      breakInterval();
      setLinear(topic, r, g, b, a);
      return { r, g, b, a };
    },
    setColorMain(_, { r, g, b, a }, __) {
      breakInterval();
      setYeelight(r, g, b, a);
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
    setAlarm(_, { hour, minute }, __) {
      alarmTime = { hour, minute };
      alarmClock(hour, minute);
      return { hour, minute };
    },
    dismissAlarm() {
      if (alarmJob) alarmJob.cancel();
      alarmTime = null;
      return "Alarm dismissed";
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
