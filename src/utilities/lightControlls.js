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
export const startInterval = () => {
  if (isIntervalWorking === false) isIntervalWorking = true;
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
  });
};

export const setYeelightTemp = (colorTemp, a) => {
  // yeelight1.start_cf(0, 2, [[1000, 2, 2700, 100]]);
  mainLights.forEach((light) => {
    if (a < 0.01) {
      light.set_power("off");
    } else {
      light.set_power("on");
    }
    light.set_ct_abx(colorTemp, "smooth");
    light.set_bright(a * 100, "smooth");
    // light.start_cf(0, 0, colorFlowScenes.calm);
  });
};

const RGBtoDecimal = (r, g, b) => {
  return r * 255 * 255 + g * 255 + b;
};

const calmTime = 15000;
const energyTime = 15000;
const twitchFollowTime = 1000;
const colorFlowScenes = {
  calm: [
    [calmTime, 1, RGBtoDecimal(20, 255, 50), 100],
    [calmTime, 1, RGBtoDecimal(75, 255, 20), 90],
    [calmTime, 1, RGBtoDecimal(50, 255, 20), 100],
    [calmTime, 1, RGBtoDecimal(20, 255, 50), 90],
  ],
  energy: [
    [energyTime, 1, RGBtoDecimal(20, 20, 255), 100],
    [energyTime, 1, RGBtoDecimal(20, 40, 255), 90],
    [energyTime, 1, RGBtoDecimal(40, 20, 255), 100],
    [energyTime, 1, RGBtoDecimal(50, 20, 255), 90],
  ],
  twitchFollow: [
    [twitchFollowTime, 1, RGBtoDecimal(255, 0, 0), 100],
    [twitchFollowTime, 1, RGBtoDecimal(0, 255, 0), 100],
    [twitchFollowTime, 1, RGBtoDecimal(0, 0, 255), 100],
    [twitchFollowTime, 1, RGBtoDecimal(255, 255, 255), 100],
  ],
};

export const colorFlow = (name, repeat) => {
  mainLights.forEach((light) => {
    light.start_cf(repeat, 0, colorFlowScenes[name]);
  });
};

export const daylightLoop = (topic) => {
  const minTime = 3;
  const maxTime = 5;
  const xSpan = 61;

  // const sunrise = getSunrise(52.237, 21.0175).getTime();
  // const sunset = getSunset(52.237, 21.0175).getTime();
  let sunrise = new Date();
  sunrise.setHours(6);
  sunrise = sunrise.getTime();

  let sunset = new Date();
  sunset.setHours(20);
  sunset = sunset.getTime();

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

  const randomBrightness = Math.round((Math.random() * (1 - 0.7) + 0.7) * 100) / 100;
  console.log(randomBrightness);
  console.log(colorTempRGB);
  console.log(randTime);
  if (isIntervalWorking) {
    setYeelightTemp(colorTemp, randomBrightness);
    setAmbientLight(topic, colorTempRGB.r, colorTempRGB.g, colorTempRGB.b, randomBrightness);
    setTimeout(() => {
      daylightLoop();
    }, randTime);
  }

  return { r: 100, g: 100, b: 100, a: 0.1 };
};

export const hexToRgb = (hex) => {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};
