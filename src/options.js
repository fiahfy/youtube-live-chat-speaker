import Vue from 'vue'
import Vuetify from 'vuetify'
import Options from './components/Options'
import store from './store'

Vue.use(Vuetify)

new Vue({
  el: '#app',
  store,
  components: { Options },
  template: '<Options />'
})
