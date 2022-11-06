import axios from 'axios';
import { host } from '../variables';
import credentials from '../../configs/credentials.json';

const username = credentials.username;
const password = credentials.password;

export async function getHotTubTemp() {
  const URL = `${host}/temp`;
  return await axios.get(URL);
}

export async function getTargetTemp() {
  const URL = `${host}/goal-temp`;
  return await axios.get(URL);
}

export async function setHotTubTemp(temp) {
  const URL = `${host}/temp`;
  const body = {
    data: temp
  };
  return await axios.post(URL, body, {
    auth: {
      username,
      password
    }
  });
}
