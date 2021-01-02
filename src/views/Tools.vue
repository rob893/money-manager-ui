<template>
  <div>
    <v-tabs>
      <v-tab>Investment Allocator</v-tab>
      <v-tab>Some Other Tool</v-tab>
      <v-tab>Test</v-tab>

      <br />

      <v-tab-item>
        <investment-allocator />
      </v-tab-item>

      <v-tab-item>Some other tool that is useful.</v-tab-item>

      <v-tab-item>Testing.</v-tab-item>
    </v-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import InvestmentAllocator from '@/components/InvestmentAllocator.vue';

export default Vue.extend({
  name: 'Tools',

  components: {
    InvestmentAllocator
  }
});
</script>
