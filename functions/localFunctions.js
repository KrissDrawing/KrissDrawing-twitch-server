import { db } from "./index.js";
const userRef = db.collection("users");

const readUser = async (id) => {
  try {
    const doc = await userRef.doc(id.toString()).get();
    if (!doc.exists) {
      return null;
    } else {
      return doc.data();
    }
  } catch (err) {
    return "error";
  }
};

const updateUser = (dbUser, rewardData) => {
  let finalUser;

  if (dbUser === "error") {
    return;
  }
  if (dbUser === null) {
    finalUser = {
      display_name: rewardData.user.display_name,
      points_spent: rewardData.reward.cost,
      rewards_count: 1,
    };
  }
  if (dbUser) {
    console.log(dbUser);
    finalUser = {
      display_name: rewardData.user.display_name,
      points_spent: dbUser.points_spent + rewardData.reward.cost,
      rewards_count: dbUser.rewards_count + 1,
    };
  }
  return finalUser;
};

const setUser = async (id, user) => {
  await userRef.doc(id).set(user);
};

export const handleReward = async (rewardData) => {
  const dbUser = await readUser(rewardData.user.id);
  const finalUser = updateUser(dbUser, rewardData);
  setUser(rewardData.user.id, finalUser);
};

const queueRef = db.collection("queue");

export const saveLastRedeems = async (rewards) => {
  await queueRef.doc("queue").set({ rewards });
};

export const loadLastRedeems = async () => {
  const data = await queueRef.doc("queue").get();
  return data.data().rewards;
};

export const saveLastFollow = async (follow) => {
  await queueRef.doc("follow").set({ follow });
};

export const loadLastFollow = async () => {
  const data = await queueRef.doc("follow").get();
  return data.data().follow;
};

const tokensRef = db.collection("tokens");

export const saveTokens = async (tokens) => {
  await tokensRef.doc("appToken").set(tokens);
};

export const loadTokens = async () => {
  const data = await tokensRef.doc("appToken").get();
  return data.data();
};
