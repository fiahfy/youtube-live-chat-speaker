import Vue from 'vue'
import Vuetify from 'vuetify'
import Popup from './components/Popup'
import store from './store'

Vue.use(Vuetify)

new Vue({
  el: '#app',
  store,
  components: { Popup },
  template: '<Popup />'
})
