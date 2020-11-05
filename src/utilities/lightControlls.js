import mqttSub from "graphql-mqtt-subscriptions";
import mqtt from "mqtt";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import yeelightNode from "yeelight-node";
import { kelvinTable } from "./KelvinToRGB.js";

const { Yeelight } = yeelightNode;
const { MQTTPubSub } = mqttSub;
const { connect } = mqtt;

const yeelight1 = new Yeelight({ ip: "192.168.1.35", port: 55443 });
const yeelight2 = new Yeelight({ ip: "192.168.1.36", port: 55443 });
const yeelight3 = new Yeelight({ ip: "192.168.1.37", port: 55443 });
const mainLights = [yeelight1, yeelight2, yeelight3];

export const client = connect("mqtt://192.168.1.44", {
  reconnectPeriod: 1000,
});

export const pubsub = new MQTTPubSub({
  client,
});

let isIntervalWorking = false;

export const breakInterval = () => {
  if (isIntervalWorking === true) isIntervalWorking = false;
};

export const setAmbientLight = (topic, r, g, b, a) => {
  pubsub.publish(topic, { r, g, b, a });
};

export const setYeelightLight = (r, g, b, a) => {
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

export const daylightLoop = (topic) => {
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
