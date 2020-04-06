<template>
  <v-card class="pa-5" flat>
    <div class="d-flex">
      <div class="flex-grow-1 mr-3">
        <v-switch
          v-model="enabledTypes"
          label="Guest"
          value="guest"
          hide-details
        />
        <v-switch
          v-model="enabledTypes"
          label="Member"
          value="member"
          hide-details
        />
        <v-switch
          v-model="enabledTypes"
          label="Moderator"
          value="moderator"
          hide-details
        />
        <v-switch
          v-model="enabledTypes"
          label="Owner"
          value="owner"
          hide-details
        />
      </div>
      <div class="flex-grow-1">
        <v-switch
          v-model="enabledTypes"
          label="Super Chat"
          value="super_chat"
          hide-details
        />
        <v-switch
          v-model="enabledTypes"
          label="Membership"
          value="membership"
          hide-details
        />
      </div>
    </div>
    <v-btn class="mt-5" depressed block @click="onClickReset">
      Reset Settings to Default
    </v-btn>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { settingsStore } from '~/store'

@Component
export default class UserTabItem extends Vue {
  get enabledTypes() {
    return settingsStore.enabledTypes
  }
  set enabledTypes(value) {
    settingsStore.setEnabledTypes({ enabledTypes: value })
  }

  onClickReset() {
    settingsStore.resetEnabledTypes()
  }
}
</script>
