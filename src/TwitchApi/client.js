import { ApiClient } from "twitch";
import { StaticAuthProvider, ClientCredentialsAuthProvider } from "twitch-auth";
import { ChatClient } from "twitch-chat-client";
import dotenv from "dotenv";
dotenv.config();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const accessToken = process.env.TWITCH_OAUTH_POINTS;
const accessTokenChatBot = process.env.TWITCH_OAUTH_CHAT_BOT;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const authProviderChannelPoints = new StaticAuthProvider(clientId, accessToken);
const authProviderChatBot = new StaticAuthProvider(clientId, accessTokenChatBot);
export const apiClient = new ApiClient({ authProvider });
export const apiClientChannelPoints = new ApiClient({ authProvider: authProviderChannelPoints });
export const chatClient = new ChatClient(authProviderChatBot, { channels: ["krissdrawing"] });
