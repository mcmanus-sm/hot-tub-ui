<script>
import { getHotTubTemp, getTargetTemp, setHotTubTemp } from '../services/temp';
import { getJetStatus, toggleJets } from '../services/jets';

export default {
  name: 'home',
  data () {
    return {
      temp: null,
      targetTemp: null,
      isLoading: true,
      jetsActive: null,
      jetsLoading: false,
      jetsSuccess: false,
      tempLoading: false,
      tempSuccess: false,
      updateIntervalMS: 3000,
      loaderTimeoutMS: 500,
      tempErrMsg: ``,
      jetsErrMsg: ``,
      toggleJetsErrMsg: ``,
      targetTempErrMsg: ``
    }
  },
  async created() {
    this.initializeTemps();
    this.initializeJets();
    try {
      let response = await getTargetTemp();
      this.targetTemp = response.data.result;
    } catch (err) {
      this.targetTempErrMsg = `Failed to get last set temperature. Full error in browser console. ${err}`;
      console.error(this.targetTempErrMsg);
    }
    this.$watch('targetTemp', (newTemp) => {
      this.updateTargetTemp(newTemp);
    });
    this.isLoading = false;
  },
  methods: {
    setHotTubTemp: setHotTubTemp,
    toggleJets: toggleJets,
    resetAllErrors() {
      this.tempErrMsg = ``;
      this.jetsErrMsg = ``;
      this.toggleJetsErrMsg = ``;
      this.targetTempErrMsg = ``;
    },
    async initializeTemps() {
      try {
        let response = await getHotTubTemp();
        this.temp = response.data.result;
        this.setupTempInterval();
      } catch (err) {
        this.tempErrMsg = `Failed to get current temp. Full error in browser console. ${err}`;
        console.error(this.tempErrMsg);
      }
    },
    async initializeJets() {
      try {
        let response = await getJetStatus();
        this.jetsActive = response.data.result;
        this.setupJetsInterval();
      } catch (err) {
        this.jetsErrMsg = `Failed to get jets status. Full error in browser console. ${err}`;
        console.error(this.jetsErrMsg);
      }
    },
    setupTempInterval() {
      let tempInterval = setInterval(async () => {
        try {
          let response = await getHotTubTemp();
          this.temp = response.data.result;
          response = await getTargetTemp();
          this.targetTemp = response.data.result;
        } catch (err) {
          this.tempErrMsg = `Failed to get current and target temp. Full error in browser console. ${err}`;
          console.error(this.tempErrMsg);
          clearInterval(tempInterval);
        }
      }, this.updateIntervalMS);
      return;
    },
    setupJetsInterval() {
      let jetsInterval = setInterval(async () => {
        try {
          let response = await getJetStatus();
          this.jetsActive = response.data.result;
        } catch (err) {
          this.jetsErrMsg = `Failed to get jets status. Full error in browser console. ${err}`;
          console.error(this.jetsErrMsg);
          clearInterval(jetsInterval);
        }
      }, this.updateIntervalMS);
      return;
    },
    async updateTargetTemp(temp) {
      this.resetAllErrors();
      this.tempLoading = true;
      try {
        await setHotTubTemp(temp);
      } catch (err) {
        this.targetTempErrMsg = `Failed to update the temp. Full error in browser console. ${err}`;
        console.error(this.targetTempErrMsg);
      }
      this.tempLoading = false;
    },
    async updateJets() {
      this.resetAllErrors();
      this.jetsLoading = true;
      try {
        const response = await this.toggleJets();
        this.jetsActive = response.data.result;
        this.jetsSuccess = true;
        setTimeout(() => { this.jetsSuccess = false }, this.loaderTimeoutMS);
      } catch (err) {
        this.toggleJetsErrMsg = `Failed to toggle the jets. Full error in browser console. ${err}`;
        console.error(this.toggleJetsErrMsg);
      }
      this.jetsLoading = false;
    }
  },
}
</script>

<template>
  <div>
    <div class="header">
      GG Hot Tub
    </div>
    <div v-if="isLoading">
      <p class="loading-text">Loading...</p>
    </div>
    <div v-else class="info-container">
      <p class="status">
        Temp is <b>{{ temp }}&#176;F</b>
        <br>
      </p>
      <p class="status">
        Temp is set to <b>{{ targetTemp }}</b>&#176;F
        <br>
      </p>
      <div class="temp-container">
        <div class="plus-minus-container">
          <div @click="targetTemp-=1" class="minus-icon plus-minus-icons">&#8722;</div>
          <div @click="targetTemp+=1" class="plus-icon plus-minus-icons">&#43;</div>
        </div>
      </div>
      <!-- <p class="status jets-container">
        Jets are<span class="ml-half"><b>{{ jetsActive ? 'on' : 'off' }}</b></span>
        <label class="switch" style="margin-left: 1rem;">
          <input :disabled="jetsLoading" v-model="jetsActive" @click="updateJets()" type="checkbox">
          <span class="toggle round"></span>
          <img v-if="jetsLoading && !jetsSuccess" class="loader" src="../assets/circular-loader.gif">
          <img v-else-if="jetsSuccess" class="loader" src="../assets/thumbs-up.png">
          <div v-else class="loader"></div>
        </label>
        <div v-if="jetsLoading" class="loader"></div>
      </p> -->
      <div v-if="toggleJetsErrMsg !== ''" class="status">{{toggleJetsErrMsg}}</div>
      <div v-if="tempErrMsg !== ''" class="status">{{tempErrMsg}}</div>
      <div v-if="targetTempErrMsg !== ''" class="status">{{targetTempErrMsg}}</div>
      <div v-if="jetsErrMsg !== ''" class="status">{{jetsErrMsg}}</div>
    </div>
    <div class="header">
      <img src="../assets/relaxing.gif" style="max-width: 100%;">
    </div>
  </div>
</template>

<style lang="scss">
.ml-half {
  margin-left: 0.5rem;
}
.plus-minus-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  width: 60%;
}
.plus-minus-icons {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
  width: 70%;
  font-size: 90px;
  border: 1px solid gray;
  border-radius: 5px;
  margin-bottom: 1rem;
  background: rgb(201, 201, 201);
}
.plus-icon {
  color: rgb(255, 25, 17);
  font-weight: bolder;
}
.minus-icon {
  color: rgb(44, 135, 255);
  font-weight: bolder;
}
.error-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
.info-container {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}
.jets-container {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  align-items: center;
}
.loader {
  height: 30px;
  width: 30px;
  margin-left: 1rem;
}
.loading-text {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  font-weight: bold;
  font-size: 32px;
}
.temp-container {
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  margin-top: 3%;
  margin-bottom: 3%;
  justify-content: center;
  align-items: center;
}
.temp-input-container {
  display: flex;
  flex-flow: row nowrap;
  width: 90%;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}
.header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  margin-top: 2rem;
}
.sub-header {
  font-size: 24px;
  font-weight: bold;
}
.set-temp {
  font-size: 32px;
  margin-bottom: 0.5rem;
}
.temp-input {
  font-size: 32px;
  width: 15%;
  margin-right: 1%;
}
.temp-submit {
  font-size: 28px;
  background-color: rgb(65, 65, 231);
  color: #d3d3d3;
  border: 0;
  border-radius: 5px;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
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
  border-radius: 5px;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 45px;
  height: 45px;
  background: rgb(72, 157, 255);
  cursor: pointer;
  border-radius: 50px;
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

.slider.round:before {
  width: 20px;
  height: 20px;
  top: 16.7%;
  left: 5%;
}
.off {
  display: block;
  color: white;
  position: absolute;
  transform: translate(-110%,-50%);
  top: 50%;
  left: 50%;
  font-size: 14px;
}
.on {
  display: none;
  color: white;
  position: absolute;
  transform: translate(50%,-50%);
  top: 50%;
  left: 45%;
  font-size: 14px;
}
input:checked + .slider .off {
  display: none;
}
input:checked + .slider:before {
  -webkit-transform: translateX(98px);
  -ms-transform: translateX(98px);
  transform: translateX(88px);
}
input:checked + .slider .on {
  display: block;
}
</style>

