<template>
  <div>
    <h1>This is the login page</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Login',

  data: () => ({}),

  mounted(): void {
    console.log('This is the login page');
  }
});
</script>
