import { ApiClient } from "twitch";
import { ClientCredentialsAuthProvider } from "twitch-auth";
import { DirectConnectionAdapter, EventSubListener } from "twitch-eventsub";
import { NgrokAdapter } from "twitch-eventsub-ngrok";
import { PubSub } from "apollo-server";
import dotenv from "dotenv";
dotenv.config();

export const pubsub = new PubSub();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

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

const userId = "48006194";
// const userId = "12826";

const subscriptions = await apiClient.helix.eventSub.getSubscriptions();
console.log(subscriptions);

await Promise.all(
  subscriptions.data.map(async (sub) => {
    await sub.unsubscribe();
  })
);
export const followSubscription = await listener.subscribeToChannelFollowEvents(userId, (e) => {
  console.log(`${e.userDisplayName} just followed!`);
  pubsub.publish("followers", e.userDisplayName);
});
