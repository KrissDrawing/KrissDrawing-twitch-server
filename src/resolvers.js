import { mergeResolvers } from "@graphql-tools/merge";
import { resolvers as lightResolvers } from "./types/Lights.js";
import { resolvers as loginResolvers } from "./types/Login.js";
import { resolvers as alarmResolvers } from "./types/Alarm.js";

const resolvers = [lightResolvers, loginResolvers, alarmResolvers];

export default mergeResolvers(resolvers);
