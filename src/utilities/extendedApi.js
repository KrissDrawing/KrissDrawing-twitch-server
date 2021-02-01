import axios from "axios";

export const getCuriosity = async () => {
  let data;
  try {
    data = await axios.get("https://api.adviceslip.com/advice");
  } catch {
    data = "NotLikeThis, coś się popsuło";
  }
  return data.data.slip.advice;
};

export const getCatFact = async () => {
  let data;
  try {
    data = await axios.get("https://meowfacts.herokuapp.com/");
  } catch {
    data = "NotLikeThis, coś się popsuło";
  }
  return data.data.data[0];
};

export const getRandomFact = async () => {
  let data;
  try {
    data = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
  } catch {
    data = "NotLikeThis, coś się popsuło";
  }
  return data.data.text;
};
