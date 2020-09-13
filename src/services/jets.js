import axios from 'axios';
import { host } from '../variables';

export async function getJetStatus() {
  const URL = `${host}/jets`;
  return await axios.get(URL);
}

export async function toggleJets() {
  const URL = `${host}/jets`;
  return await axios.post(URL);
}
  