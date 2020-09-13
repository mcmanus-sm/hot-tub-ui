<template>
  <div>
    <p class="header">Welcome to the GG Hot Tub!</p>
    <div v-if="isLoading">
      <p class="loading-text">Loading...</p>
      <img src="../assets/loading-1.gif">
    </div>
    <div v-else>
      <p v-if="!getTempError" class="status">The current hot tub temparture is {{ temp }}&#176;F</p>
      <p v-else class="status">{{tempErrMsg}}</p>
      <p v-if="!goalTempError" class="status">Your last set temp was {{ goalTemp }}&#176;F</p>
      <p v-else class="status">{{goalTempErrMsg}}</p>
      <p v-if="!getJetsError" class="status">The jets are {{jetsActive ? "ON" : "OFF"}}</p>
      <p v-else class="status">{{jetsErrMsg}}</p>
      <div class="temp-container">
        <label class="set-temp">Set Temperature</label>
        <div class="temp-input-container">
          <input type="range" min="80" max="104" class="slider" v-model="setTemp">
          {{setTemp}}
        </div>
        <input type="submit" class="temp-submit" @click="updateGoalTemp(setTemp)">
        <img v-if="tempLoading && !tempSuccess" class="loader" src="../assets/circular-loader.gif">
        <img v-else-if="tempSuccess" class="loader" src="../assets/thumbs-up.png">
        <div v-else class="loader"></div>
      </div>
      <div class="jets-container">
        <label class="jet-status">Toggle Jets</label>
        <label class="switch">
          <input :disabled="jetsLoading" v-model="setJets" @click="updateJets()" type="checkbox">
          <span class="toggle round"></span>
        </label>
        <img v-if="jetsLoading && !jetsSuccess" class="loader" src="../assets/circular-loader.gif">
        <img v-else-if="jetsSuccess" class="loader" src="../assets/thumbs-up.png">
        <div v-else class="loader"></div>
      </div>
      <div v-if="toggleJetsError" class="status">{{toggleJetsErrMsg}}</div>
    </div>
    <p class="sub-header">Please forward all site grievances to the GG complaints department. ¯\_(ツ)_/¯ </p>
    <div>
      <img src="../assets/f.gif">
    </div>
  </div>
</template>

<script>
import { getHotTubTemp, getGoalTemp, setHotTubTemp } from '../services/temp';
import { getJetStatus, toggleJets } from '../services/jets';

export default {
  name: 'home',
  data () {
    return {
      temp: null,
      goalTemp: null,
      jetsActive: null,
      isLoading: true,
      jetsLoading: false,
      jetsSuccess: false,
      tempLoading: false,
      tempSuccess: false,
      updateIntervalMS: 3000,
      loaderTimeoutMS: 500,
      setTemp: null,
      setJets: false,
      getTempError: false,
      getJetsError: false,
      toggleJetsError: false,
      goalTempError: false,
      tempErrMsg: ``,
      jetsErrMsg: ``,
      toggleJetsErrMsg: ``,
      goalTempErrMsg: ``,
    }
  },
  async created() {
    this.initializeTemps();
    this.initializeJets();
    try {
      let response = await getGoalTemp();
      this.goalTemp = response.data.result;
      this.setTemp = response.data.result;
      console.log(this.setTemp)
    } catch (err) {
      this.goalTempErrMsg = `Failed to get last set temperature. ${err}`;
      console.error(this.goalTempErrMsg);
      this.goalTempError = true;
    }
    this.isLoading = false;
  },
  methods: {
    setHotTubTemp: setHotTubTemp,
    toggleJets: toggleJets,
    async initializeTemps() {
      try {
        let response = await getHotTubTemp();
        this.temp = response.data.result;
        this.setupTempInterval();
      } catch (err) {
        this.tempErrMsg = `Failed to get current temp. ${err}`;
        console.error(this.tempErrMsg);
        this.getTempError = true;
      }
    },
    async initializeJets() {
      try {
        let response = await getJetStatus();
        this.jetsActive = response.data.result;
        this.setJets = response.data.result;
        this.setupJetsInterval();
      } catch (err) {
        this.jetsErrMsg = `Failed to get jets status. ${err}`;
        console.error(this.jetsErrMsg);
        this.getJetsError = true;
      }
    },
    setupTempInterval() {
      let tempInterval;
      tempInterval = setInterval(async () => {
        try {
          let response = await getHotTubTemp();
          this.temp = response.data.result;
        } catch (err) {
          this.tempErrMsg = `Failed to get current temp. ${err}`;
          console.error(this.tempErrMsg);
          clearInterval(tempInterval);
        }
      }, this.updateIntervalMS);
      return;
    },
    setupJetsInterval() {
      let jetsInterval;
      jetsInterval = setInterval(async () => {
        try {
          let response = await getJetStatus();
          this.jetsActive = response.data.result;
        } catch (err) {
          this.jetsErrMsg = `Failed to get jets status. ${err}`;
          console.error(this.jetsErrMsg);
          clearInterval(jetsInterval);
        }
      }, this.updateIntervalMS);
      return;
    },
    async updateGoalTemp(temp) {
      this.goalTempError = false;
      this.tempLoading = true;
      try {
        await setHotTubTemp(temp);
        this.goalTemp = temp;
        this.tempSuccess = true;
        setTimeout(() => { this.tempSuccess = false }, this.loaderTimeoutMS);
      } catch (err) {
        this.goalTempErrMsg = `Failed to update the goal temp. ${err}`;
        console.error(this.goalTempErrMsg);
        this.goalTempError = true;
      }
      this.tempLoading = false;
    },
    async updateJets() {
      this.jetsLoading = true;
      this.toggleJetsError = false;
      try {
        let response = await this.toggleJets();
        this.jetsActive = response.data.result;
        this.jetsSuccess = true;
        setTimeout(() => { this.jetsSuccess = false }, this.loaderTimeoutMS);
      } catch (err) {
        this.toggleJetsErrMsg = `Failed to toggle the jets. ${err}`;
        console.error(this.toggleJetsErrMsg);
        this.toggleJetsError = true;
      }
      this.jetsLoading = false;
    }
  },
}
</script>

<style lang="scss">
.jets-container {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-top: 3%;
  margin-bottom: 3%;
  margin-left: 2%;
}
.loader {
  height: 30px;
  width: 30px;
  margin-left: 1%;
}
.loading-text {
  font-weight: bold;
  font-size: 32px;
}
.temp-container {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  margin-top: 3%;
  margin-bottom: 3%;
  justify-content: center;
  align-items: center;
}
.temp-input-container {
  display: flex;
  flex-flow: row nowrap;
  width: 15%;
  justify-content: center;
  align-items: center;
  margin-left: 3%;
  margin-right: 3%;
}
.header {
  font-size: 64px;
  font-weight: bold;
}
.sub-header {
  font-size: 24px;
  font-weight: bold;
}
.set-temp {
  font-size: 32px;
}
.temp-input {
  font-size: 32px;
  width: 15%;
  margin-right: 1%;
}
.temp-submit {
  font-size: 32px;
}
.jet-status {
  font-size: 32px;
}
.status {
  font-size: 32px;
  margin: 3%;
}
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 25px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 35px;
  height: 35px;
  background: blue;
  cursor: pointer;
}
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 1%;
}
.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}
.toggle:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}
input:checked + .toggle {
  background-color: #2196F3;
}
input:focus + .toggle {
  box-shadow: 0 0 1px #2196F3;
}
input:checked + .toggle:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}
.toggle.round {
  border-radius: 34px;
}
.toggle.round:before {
  border-radius: 50%;
}
</style>
