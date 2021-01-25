import { DirectConnectionAdapter, EventSubListener } from "twitch-eventsub";
import { NgrokAdapter } from "twitch-eventsub-ngrok";
import { apiClient } from "./client.js";
import { PubSub } from "apollo-server";

export const pubsub = new PubSub();

const listener = new EventSubListener(apiClient, new NgrokAdapter());
// new DirectConnectionAdapter({
//     hostName: "krissDrawing.ddns.net",
//     sslCert: {
//       key: "aaaaaaaaaaaaaaa",
//       cert: "bbbbbbbbbbbbbbb",
//     },
//   }),
//   "thisShouldBeARandomlyGeneratedFixedString"

await listener.listen();

// const userId = "48006194"; //my ID
const userId = "12826"; // twitch ID

const subscriptions = await apiClient.helix.eventSub.getSubscriptions();

await Promise.all(
  subscriptions.data.map(async (sub) => {
    await sub.unsubscribe();
  })
);
export const followSubscription = await listener.subscribeToChannelFollowEvents(userId, (e) => {
  console.log(`${e.userDisplayName} just followed!`);
  pubsub.publish("followers", e.userDisplayName);
});
