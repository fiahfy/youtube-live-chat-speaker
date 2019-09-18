<template>
  <v-card class="pa-5" flat>
    <v-row>
      <v-col cols="6" class="py-0">
        <v-switch v-model="types" label="Guest" value="guest" hide-details />
        <v-switch v-model="types" label="Member" value="member" hide-details />
        <v-switch
          v-model="types"
          label="Moderator"
          value="moderator"
          hide-details
        />
        <v-switch v-model="types" label="Owner" value="owner" hide-details />
      </v-col>
      <v-col cols="6" class="py-0">
        <v-switch
          v-model="types"
          label="Super Chat"
          value="super_chat"
          hide-details
        />
        <v-switch
          v-model="types"
          label="Membership"
          value="membership"
          hide-details
        />
      </v-col>
    </v-row>
    <v-btn class="mt-5" depressed block @click="onResetClick">
      Reset Settings to Default
    </v-btn>
  </v-card>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  computed: {
    types: {
      get() {
        return this.$store.getters.types
      },
      set(value) {
        this.$store.dispatch('setTypes', {
          types: value
        })
      }
    }
  },
  methods: {
    onResetClick() {
      this.resetTypes()
    },
    ...mapMutations(['resetTypes'])
  }
}
</script>
