<template>
  <div>
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col>
          <v-card class="mx-auto" elevation="2" max-width="600">
            <v-card-title> Login </v-card-title>

            <v-card-text>
              <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>

              <v-form ref="form" v-model="formValid">
                <v-text-field v-model="username" :rules="usernameRules" label="Username" required />
                <v-text-field v-model="password" type="password" :rules="passwordRules" label="Password" required />
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-btn :disabled="!formValid" color="success" class="mr-4" @click="login">Login</v-btn>
              <v-btn color="error" class="mr-4" @click="resetForm">Clear</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { authService } from '@/services/AuthService';
import { TypeGuards } from '@/helpers/TypeGuards';

export default Vue.extend({
  name: 'Login',

  data: () => ({
    username: null as string | null,
    usernameRules: [(username: string) => !!username || 'Username is required'],
    password: null as string | null,
    passwordRules: [(password: string) => !!password || 'Password is required'],
    formValid: false,
    errorMessage: null as string | null
  }),

  methods: {
    async login(): Promise<void> {
      if (this.username && this.password) {
        try {
          await authService.login(this.username, this.password);
          this.errorMessage = null;
          this.$router.push('about');
        } catch (error) {
          if (TypeGuards.isAxiosError(error) && error.response?.status === 401) {
            this.errorMessage = 'Invalid username or password.';
          } else {
            this.errorMessage = 'Something went wrong.';
          }
        }
      } else {
        this.errorMessage = 'Username and password are required.';
      }
    },

    resetForm(): void {
      this.errorMessage = null;
      (this.$refs.form as any).reset();
    }
  }
});
</script>
