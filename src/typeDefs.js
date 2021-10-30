import apolloServer from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { typeDefs as lightTypes } from "./types/Lights.js";
import { typeDefs as loginTypes } from "./types/Login.js";
import { typeDefs as alarmTypes } from "./types/Alarm.js";
import { typeDefs as twitchTypes } from "./TwitchApi/TwitchResolver.js";

const types = [lightTypes, loginTypes, alarmTypes, twitchTypes];

export default mergeTypeDefs(types);
