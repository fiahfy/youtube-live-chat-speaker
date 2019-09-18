<template>
  <v-app>
    <v-content>
      <v-container class="pa-0" fluid>
        <v-card flat>
          <v-tabs v-model="tabIndex" grow>
            <v-tab v-for="(tab, index) in tabs" :key="index">
              {{ tab.title }}
            </v-tab>
            <v-tab-item v-for="(tab, index) in tabs" :key="index">
              <component :is="tab.item" />
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import UserTabItem from './UserTabItem'
import VoiceTabItem from './VoiceTabItem'

export default {
  data() {
    return {
      tabIndex: null,
      tabs: [
        { title: 'Voice', item: VoiceTabItem },
        { title: 'User', item: UserTabItem }
      ]
    }
  }
}
</script>

<style scoped>
.v-application {
  min-width: 640px;
}
</style>
