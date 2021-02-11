import { PubSubClient } from "twitch-pubsub-client";
import { apiClientChannelPoints } from "./client.js";
import { PubSub } from "apollo-server";
import { setYeelightLight, colorFlow } from "../utilities/lightControlls.js";
import { handleReward } from "../../functions/localFunctions.js";
export const pubsubPoints = new PubSub();

const pubSubClient = new PubSubClient();
const userId = await pubSubClient.registerUserListener(apiClientChannelPoints);

export const listener = await pubSubClient.onRedemption(userId, async (message) => {
  const pointsObject = {
    rewardPrompt: message.rewardPrompt,
    userDisplayName: message.userDisplayName,
    rewardCost: message.rewardCost,
    userId: message.userId,
  };

  if (pointsObject.rewardPrompt.includes("zmieni kolor na")) {
    const rewardedColor = pointsObject.rewardPrompt.substring(
      pointsObject.rewardPrompt.lastIndexOf(" ") + 1
    );
    let switchColor;

    switch (rewardedColor) {
      case "czerwony":
        switchColor = { r: 255, g: 0, b: 0, a: 1 };
        break;
      case "zielony":
        switchColor = { r: 0, g: 255, b: 0, a: 1 };
        break;
      case "niebieski":
        switchColor = { r: 0, g: 0, b: 255, a: 1 };
        break;
    }
    setYeelightLight(switchColor.r, switchColor.g, switchColor.b, switchColor.a);
  } else {
    colorFlow("twitchFollow", 4);
  }

  await handleReward(pointsObject);

  pubsubPoints.publish("points", pointsObject);
  console.log(`${message.rewardPrompt} --- ${message.userDisplayName} --- ${message.rewardCost}`);
});
