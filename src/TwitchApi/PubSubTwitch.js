import { ApiClient } from "twitch";
import { PubSubClient } from "twitch-pubsub-client";
import { apiClientChannelPoints } from "./client.js";
import { PubSub } from "apollo-server";
export const pubsubPoints = new PubSub();

const pubSubClient = new PubSubClient();
const userId = await pubSubClient.registerUserListener(apiClientChannelPoints);

export const listener = await pubSubClient.onRedemption(userId, (message) => {
  const pointsObject = {
    rewardPrompt: message.rewardPrompt,
    userDisplayName: message.userDisplayName,
    rewardCost: message.rewardCost,
  };
  pubsubPoints.publish("points", pointsObject);
  console.log(`${message.rewardPrompt} --- ${message.userDisplayName} --- ${message.rewardCost}`);
});
