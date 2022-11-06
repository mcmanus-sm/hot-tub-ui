import axios from 'axios';
import { host } from '../variables';
import credentials from '../../configs/credentials.json';

const username = credentials.username;
const password = credentials.password;

export async function getJetStatus() {
  const URL = `${host}/jets`;
  return await axios.get(URL);
}

export async function toggleJets() {
  const URL = `${host}/jets`;
  return await axios.post(URL, {}, {
    auth: {
      username,
      password
    }
  });
}
  