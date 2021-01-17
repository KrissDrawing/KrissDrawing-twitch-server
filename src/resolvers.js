import { mergeResolvers } from "@graphql-tools/merge";
import { resolvers as lightResolvers } from "./types/Lights.js";
import { resolvers as loginResolvers } from "./types/Login.js";
import { resolvers as alarmResolvers } from "./types/Alarm.js";
import { resolvers as twitchResolver } from "./twitchApi/TwitchResolver.js";

const resolvers = [lightResolvers, loginResolvers, alarmResolvers, twitchResolver];

export default mergeResolvers(resolvers);
