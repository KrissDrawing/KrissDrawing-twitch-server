import apolloServer from "apollo-server-express";
const { gql } = apolloServer;
import schedule from "node-schedule";

export const typeDefs = gql`
  type TimeAlarm {
    hour: Int!
    minute: Int!
  }

  type Query {
    getAlarm: TimeAlarm
  }

  type Mutation {
    setAlarm(hour: Int!, minute: Int!): TimeAlarm
    dismissAlarm: String
  }
`;

let alarmJob;
let alarmTime;

const alarmClock = (hour, minute) => {
  alarmJob = schedule.scheduleJob({ hour, minute }, function () {
    console.log("The answer to life, the universe, and everything!");
    alarmTime = null;
  });
};

export const resolvers = {
  Query: {
    getAlarm: () => {
      return alarmTime;
    },
  },
  Mutation: {
    setAlarm(_, { hour, minute }, __) {
      alarmTime = { hour, minute };
      alarmClock(hour, minute);
      return { hour, minute };
    },
    dismissAlarm() {
      if (alarmJob) alarmJob.cancel();
      alarmTime = null;
      return "Alarm dismissed";
    },
  },
};
