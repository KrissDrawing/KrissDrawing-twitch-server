import { DirectConnectionAdapter, EventSubListener } from "twitch-eventsub";
import { NgrokAdapter } from "twitch-eventsub-ngrok";
import { apiClient } from "./client.js";
import { PubSub } from "apollo-server";
import { debounce } from "throttle-debounce";
import { colorFlow } from "../utilities/lightControlls.js";
import { chatClient } from "../TwitchApi/client.js";
import { getCuriosity, getCatFact, getRandomFact } from "../utilities/extendedApi.js";
import { saveLastFollow } from "../../functions/localFunctions.js";

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

const userId = "48006194"; //my ID
// const userId = "12826"; // twitch ID

const subscriptions = await apiClient.helix.eventSub.getSubscriptions();

await Promise.all(
  subscriptions.data.map(async (sub) => {
    await sub.unsubscribe();
  })
);

const followReplies = [getCuriosity, getCatFact, getRandomFact];

const botCommand = debounce(1000, async (user) => {
  const randomNumber = Math.floor(Math.random() * followReplies.length);
  const reply = await followReplies[randomNumber]();
  chatClient.say("#krissdrawing", `@${user}: ${reply}`);
});

const botGreeting = debounce(1000, async (user) => {
  chatClient.say("#krissdrawing", `@${user}, Witaj na streamku! Dzięki za follow krissd1GamingCat`);
});

export const followSubscription = await listener.subscribeToChannelFollowEvents(
  userId,
  async (e) => {
    console.log(`${e.userDisplayName} just followed!`);
    botGreeting(e.userDisplayName);
    // botCommand(e.userDisplayName);
    const followData = await apiClient.helix.users.getFollows({ followedUser: "48006194" });
    const followerObject = { name: e.userDisplayName, count: followData.total };

    saveLastFollow(followerObject);
    colorFlow("twitchFollow", 8);

    pubsub.publish("followers", followerObject);
  }
);
