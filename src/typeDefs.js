import apolloServer from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { typeDefs as lightTypes } from "./types/Lights.js";
import { typeDefs as loginTypes } from "./types/Login.js";
import { typeDefs as alarmTypes } from "./types/Alarm.js";

const types = [lightTypes, loginTypes, alarmTypes];

export default mergeTypeDefs(types);
