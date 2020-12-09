<template>
  <div>
    <v-card elevation="2">
      <v-form ref="form" v-model="formValid">
        <v-text-field v-model="username" :rules="usernameRules" label="Username" required />
        <v-text-field v-model="password" type="password" :rules="passwordRules" label="Password" required />
        <v-btn :disabled="!formValid" color="success" class="mr-4" @click="login">Login</v-btn>
        <v-btn color="error" class="mr-4" @click="resetForm">Clear</v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { authService } from '@/services/AuthService';

export default Vue.extend({
  name: 'Login',

  data: () => ({
    username: null as string | null,
    usernameRules: [(username: string) => !!username || 'Username is required'],
    password: null as string | null,
    passwordRules: [(password: string) => !!password || 'Password is required'],
    formValid: false
  }),

  methods: {
    async login(): Promise<void> {
      if (this.username && this.password) {
        const result = await authService.login(this.username, this.password);

        if (result) {
          this.$router.push('about');
        }
      }
    },

    resetForm(): void {
      (this.$refs.form as any).reset();
    }
  }
});
</script>
