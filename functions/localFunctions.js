import {db} from "./index.js";

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
      display_name: rewardData.userDisplayName.toLowerCase(),
      points_spent: rewardData.rewardCost,
      rewards_count: 1,
    };
  }
  if (dbUser) {
    console.log(dbUser);
    finalUser = {
      display_name: rewardData.userDisplayName.toLowerCase(),
      points_spent: dbUser.points_spent + rewardData.rewardCost,
      rewards_count: dbUser.rewards_count + 1,
    };
  }
  return finalUser;
};

const setUser = async (id, user) => {
  await userRef.doc(id).set(user);
};

export const handleReward = async (rewardData) => {
  const dbUser = await readUser(rewardData.userId);
  const finalUser = updateUser(dbUser, rewardData);
  setUser(rewardData.userId, finalUser);
};

export const ReadSpentPoints = async (user) => {
  const snapshot = await userRef.where("display_name", "==", user.toLowerCase()).get();

  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data();
};

const queueRef = db.collection("queue");

export const saveLastRedeems = async (rewards) => {
  await queueRef.doc("queue").set({rewards});
};

export const loadLastRedeems = async () => {
  const data = await queueRef.doc("queue").get();
  return data.data().rewards;
};

export const saveLastFollow = async (follow) => {
  await queueRef.doc("follow").set({follow});
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

//-----
//QUEUE
//-----
export const addToPlayQueue = async (userName) => {
  const data = await queueRef.doc("playQueue").get();
  const docData = data.data();
  const alreadyIn = docData.queue.find(queueItem => queueItem.name === userName);
  if(alreadyIn) {
    return{
      message: `${Math.floor(Math.random()*500)} razy sie zapisz od razu NotLikeThis`,
      queue: docData.queue,
    };
  } else {
  const userQueue = {
    name: userName,
    costume: Math.floor(Math.random()*100),
  };
  if (data.data().queue?.length <= 15) {
    if (docData.queue) {
      await queueRef
        .doc("playQueue")
        .set({
          ...docData,
          queueBackup: [...docData.queueBackup, userQueue].slice(Math.max(docData.queueBackup.length - 10, 0)),
          queue: [...docData.queue, userQueue],
        });
    } else {
      await queueRef.doc("playQueue").set({...docData, queue: [userQueue]});
    }
    return {
      message: `krissd1BRUH , jesteś ${docData.queue.length + 1} w kolejce`,
      queue: [...docData.queue, userQueue],
    };
  } else {
    return {
      messsage: 'Kolejka jest full Sadge',
      queue: ['full'],
    }
  }
  }
}

export const clearPlayQueue = async () => {
  const data = await queueRef.doc("playQueue").get();
  const docData = data.data();
  await queueRef.doc("playQueue").set({...docData, queue: []});
}

export const nextPlayQueue = async () => {
  const data = await queueRef.doc("playQueue").get();
  const docData = data.data();
  const [player, ...queue] = docData.queue;
  await queueRef
    .doc("playQueue")
    .set({
      ...docData,
      queueBackup: [...docData.queueBackup, player],
      queue: queue,
    });
  return {
    message: `Teraz gra ${player.name}`,
    queue: queue
  };
}

export const getPlayQueue = async () => {
  const data = await queueRef.doc("playQueue").get();
  const {queue} = data.data();
  return queue;
}

// export const prevPlayQueue = async (amount) => {
//   const data = await queueRef.doc("playQueue").get();
//   const docData = data.data();
//   const queue = docData.queueBackup.slice(Math.max(docData.queueBackup.length - docData.queue.length - amount, 0));
//   const queueBackup = docData.queueBackup.slice(0, Math.max(docData.queueBackup.length - amount, 0));
//
//   console.log(queueBackup);
//   await queueRef.doc("playQueue").set({...docData, queueBackup: queueBackup, queue: queue});
// }
