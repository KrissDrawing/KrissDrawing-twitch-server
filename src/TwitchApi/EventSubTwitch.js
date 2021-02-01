import { DirectConnectionAdapter, EventSubListener } from "twitch-eventsub";
import { NgrokAdapter } from "twitch-eventsub-ngrok";
import { apiClient } from "./client.js";
import { PubSub } from "apollo-server";
import { throttle } from "throttle-debounce";
import { colorFlow } from "../utilities/lightControlls.js";
import { chatClient } from "../TwitchApi/client.js";
import { getCuriosity, getCatFact, getRandomFact } from "../utilities/extendedApi.js";

export const pubsub = new PubSub();

const listener = new EventSubListener(apiClient, new NgrokAdapter());
// new DirectConnectionAdapter({
//     hostName: "krissDrawing.ddns.net",
//     sslCert: {
//       key: "aaaaaaaaaaaaaaa"j,
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

const followReplies = [getCuriosity, getCatFact, getRandomFact];

const botCommand = async (user) => {
  const randomNumber = Math.floor(Math.random() * followReplies.length);
  const reply = await followReplies[randomNumber]();
  chatClient.say("#krissdrawing", `@${user}: ${reply}`);
};

export const followSubscription = await listener.subscribeToChannelFollowEvents(
  userId,
  async (e) => {
    console.log(`${e.userDisplayName} just followed!`);

    botCommand(e.userDisplayName);

    colorFlow("twitchFollow", 8);

    pubsub.publish("followers", e.userDisplayName);
  }
);
