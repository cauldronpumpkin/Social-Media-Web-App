import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store'
import VueSession from 'vue-session'
import axios from 'axios'
import { createProvider } from './vue-apollo'
import vuetify from '@/plugins/vuetify'
import * as firebase from "firebase"
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFontAwesome } from '@fortawesome/free-brands-svg-icons'
 
library.add(faUserSecret)
library.add(faFontAwesome)
 
Vue.component('font-awesome-icon', FontAwesomeIcon)


Vue.use(VueSession);
Vue.use(Vuetify);


Vue.config.productionTip = false
const base = axios.create({
  baseURL: 'http://localhost:8000'
})
Vue.prototype.$http = base;

var firebaseConfig = {
  apiKey: "AIzaSyAUZGURy0FUzcLMHwl4_pJMekxy96Z7qUQ",
  authDomain: "social-media-d825a.firebaseapp.com",
  databaseURL: "https://social-media-d825a.firebaseio.com",
  projectId: "social-media-d825a",
  storageBucket: "social-media-d825a.appspot.com",
  messagingSenderId: "424754063514",
  appId: "1:424754063514:web:54e86a0e2399ecb8799723",
  measurementId: "G-34RXHE4XYB"
};

firebase.initializeApp(firebaseConfig);

new Vue({
  router,
  store,
  vuetify,
  apolloProvider: createProvider(),
  render: h => h(App)
}).$mount('#app')
