import { ApiClient } from "twitch";
import {
  StaticAuthProvider,
  RefreshableAuthProvider,
  ClientCredentialsAuthProvider,
} from "twitch-auth";
import { ChatClient } from "twitch-chat-client";
import dotenv from "dotenv";
import { loadTokens, saveTokens } from "../../functions/localFunctions.js";
dotenv.config();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);

const tokenData = await loadTokens();
const authProviderChannel = new RefreshableAuthProvider(
  new StaticAuthProvider(clientId, tokenData.accessToken),
  {
    clientSecret,
    refreshToken: tokenData.refreshToken,
    expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
    onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
      const newTokenData = {
        accessToken,
        refreshToken,
        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
      };
      await saveTokens(newTokenData);
    },
  }
);

export const apiClient = new ApiClient({ authProvider });
export const apiClientChannelPoints = new ApiClient({ authProvider: authProviderChannel });
export const chatClient = new ChatClient(authProviderChannel, { channels: ["krissdrawing"] });
