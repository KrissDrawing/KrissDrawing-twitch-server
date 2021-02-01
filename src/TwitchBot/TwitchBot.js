import axios from "axios";
import { throttle } from "throttle-debounce";
import { chatClient, apiClient } from "../TwitchApi/client.js";

await chatClient.connect();

let rank;

const fetchRank = async () => {
  try {
    rank = await axios.get(
      "https://api.yannismate.de/rank/steam/76561198045986346?playlists=ranked_3v3,ranked_2v2,ranked_1v1"
    );
  } catch (err) {
    console.log(error);
  }
  rank = rank.data;

  rank = rank.split("|").map((item, i) => {
    return (
      i +
      1 +
      "s: " +
      item
        .split(": ")[1]
        .replace(/div/gi, "d")
        .replace(/\B[a-z]+/i, "")
    );
  });
};

const rankCommand = throttle(30000, true, async (channel) => {
  await fetchRank();
  chatClient.say(channel, rank[0]);
  chatClient.say(channel, rank[1]);
  chatClient.say(channel, rank[2]);
});

const socialsCommand = throttle(30000, true, (channel) => {
  chatClient.say(channel, "insta: https://www.instagram.com/krissdrawing/");
  chatClient.say(channel, "YT: https://www.youtube.com/c/6KRX (Cii... coś dodam kiedyś");
});

const discordCommand = throttle(30000, true, (channel) => {
  chatClient.say(
    channel,
    "Zapraszam na serwerek, można pogadać, poumawiać się na gierki, itp. https://discord.gg/uzr4e7sPxT"
  );
});

export const commandsListener = chatClient.onMessage(async (channel, user, message, msg) => {
  if (["!rank", "!rang", "!ranga"].some((command) => command === message)) {
    rankCommand(channel);
  }
  if (
    ["!socials", "!sociale", "!insta", "!fb", "!facebook", "!instagram", "!twitter", "!insta"].some(
      (command) => command === message
    )
  ) {
    socialsCommand(channel);
  }
  if (["!discord", "!dc", "!ds", "!dsc", "diskord"].some((command) => command === message)) {
    discordCommand(channel);
  }
});

// later, when you don't need this command anymore:
// chatClient.removeListener(followAgeListener);
