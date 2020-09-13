import axios from 'axios';
import { host } from '../variables';

export async function getHotTubTemp() {
  const URL = `${host}/temp`;
  return await axios.get(URL);
}

export async function getGoalTemp() {
  const URL = `${host}/goal-temp`;
  return await axios.get(URL);
}

export async function setHotTubTemp(temp) {
  const URL = `${host}/temp`;
  const body = {
    data: temp
  };
  return await axios.post(URL, body);
}
