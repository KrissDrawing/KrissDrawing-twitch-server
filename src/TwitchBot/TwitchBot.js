import axios from "axios";
import { throttle } from "throttle-debounce";
import { PubSub } from "apollo-server";
import { chatClient } from "../TwitchApi/client.js";
import { ReadSpentPoints } from "../../functions/localFunctions.js";
import { hexToRgb, setYeelightLight } from "../utilities/lightControlls.js";

await chatClient.connect();

export const pubsubChat = new PubSub();
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

const lightMessage = throttle(15000, true, async (channel) => {
  chatClient.say(
    channel,
    `Aby zmienić kolor piszemy "!led " + kod koloru HEX, np. z tej strony https://htmlcolorcodes.com/color-picker/ przykładowo "!led #ff0000"`
  );
});

const lightControll = throttle(15000, true, async (message, channel) => {
  let ledColor = hexToRgb(message.split(" ")?.[1]);
  if (ledColor !== null) {
    setYeelightLight(ledColor.r, ledColor.g, ledColor.b, 1);
  } else {
    lightMessage(channel);
  }
});

//Chat commands
const rankCommand = throttle(30000, true, async (channel) => {
  await fetchRank();
  chatClient.say(channel, rank[0]);
  chatClient.say(channel, rank[1]);
  chatClient.say(channel, rank[2]);
});
const followCommand = (channel) => {
  chatClient.say(channel, "Fajnie, że jesteś! Zostaw follow, aby być na bieżąco ze streamkami");
};
const instagramCommand = (channel) => {
  chatClient.say(channel, "insta: https://www.instagram.com/krissdrawing/");
};
const youtubeCommand = (channel) => {
  chatClient.say(channel, "YT: https://www.youtube.com/c/6KRX (Cii... coś dodam kiedyś");
};
const discordCommand = throttle(30000, true, (channel) => {
  chatClient.say(
    channel,
    "Zapraszam na serwerek, można pogadać, poumawiać się na gierki, itp. https://discord.gg/uzr4e7sPxT"
  );
});
const socialsCommand = throttle(30000, true, (channel) => {
  instagramCommand(channel);
  youtubeCommand(channel);
});

export const commandsListener = chatClient.onMessage(async (channel, user, message, msg) => {
  if (["!rank", "!rang", "!ranga", "!ranks", "!rangs"].some((command) => command === message)) {
    rankCommand(channel);
  }

  if (
    ["!socials", "!sociale", "!insta", "!fb", "!facebook", "!instagram", "!twitter"].some(
      (command) => command === message
    )
  ) {
    socialsCommand(channel);
  }

  if (["!discord", "!dc", "!ds", "!dsc", "!diskord"].some((command) => command === message)) {
    discordCommand(channel);
  }

  if ("!points" === message || "!points" === message.split(" ")[0]) {
    let checkUser = user;

    if (message?.split(" ")?.[1]?.trim()) {
      checkUser = message.split(" ")[1].trim();
    }
    let rewardObject = await ReadSpentPoints(checkUser);
    if (!rewardObject) {
      chatClient.say(channel, "KEKW Typ nawet nie odebrał nic LUL");
    } else {
      chatClient.say(
        channel,
        `${checkUser} odebrał nagrody ${rewardObject.rewards_count} razy, wydając łącznie ${rewardObject.points_spent} punktów KEKW`
      );
    }
  }

  if ("!led" === message.toLowerCase()) {
    lightMessage(channel);
  }

  if ("!led" === message.toLowerCase().split(" ")[0] && message.toLowerCase().split(" ")[1]) {
    lightControll(message, channel);
  }
});

//discord alert timer;
setInterval(() => {
  discordCommand("krissdrawing");
}, 860000);

//Follow alert timer
setInterval(() => {
  followCommand("krissdrawing");
  pubsubChat.publish("followAlert", Date.now());
}, 900000);

//Instagram alert timer
setInterval(() => {
  instagramCommand("krissdrawing");
  pubsubChat.publish("instagramAlert", Date.now());
}, 1000000);
