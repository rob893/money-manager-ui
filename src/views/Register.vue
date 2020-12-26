<template>
  <div>
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col>
          <v-card v-if="socialLoginType === 'Google'" class="mx-auto" elevation="2" max-width="600">
            <v-card-title>Register using Google Account</v-card-title>

            <v-card-text>
              <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>

              <v-form ref="registerUsingGoogleAccountForm" v-model="registerUsingGoogleAccountForm.formValid">
                <v-text-field
                  v-model="registerUsingGoogleAccountForm.username"
                  :rules="registerUsingGoogleAccountForm.usernameRules"
                  label="Username"
                  required
                />
              </v-form>
            </v-card-text>

            <v-card-actions v-if="loading">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-card-actions>

            <v-card-actions v-if="!loading">
              <v-btn
                :disabled="!registerUsingGoogleAccountForm.formValid"
                color="success"
                class="mr-4"
                @click="registerUsingGoogleAccount"
                >Continue</v-btn
              >
              <v-btn color="error" class="mr-4" @click="resetRegisterUsingGoogleAccountForm">Clear</v-btn>
            </v-card-actions>
          </v-card>

          <v-card v-else class="mx-auto" elevation="2" max-width="600">
            <v-card-title>Register</v-card-title>

            <v-card-text>
              <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>

              <v-form ref="registerForm" v-model="registerForm.formValid">
                <v-text-field
                  v-model="registerForm.username"
                  :rules="registerForm.usernameRules"
                  label="Username"
                  required
                />
                <v-text-field
                  v-model="registerForm.password"
                  type="password"
                  :rules="registerForm.passwordRules"
                  label="Password"
                  required
                />
                <v-text-field
                  v-model="registerForm.firstName"
                  :rules="registerForm.firstNameRules"
                  label="First Name"
                  required
                />
                <v-text-field
                  v-model="registerForm.lastName"
                  :rules="registerForm.lastNameRules"
                  label="Last Name"
                  required
                />
                <v-text-field
                  v-model="registerForm.email"
                  type="email"
                  :rules="registerForm.emailRules"
                  label="Email"
                  required
                />
              </v-form>
            </v-card-text>

            <v-card-actions v-if="loading">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-card-actions>

            <v-card-actions v-if="!loading">
              <v-btn :disabled="!registerForm.formValid" color="success" class="mr-4" @click="register">Continue</v-btn>
              <v-btn color="error" class="mr-4" @click="resetRegisterForm">Clear</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { authService } from '@/services';
import { RouteName } from '@/router/RouteName';
import { LinkedAccountType } from '@/models';

export default Vue.extend({
  name: 'Register',

  data: () => ({
    socialLoginType: null as LinkedAccountType | null,
    registerUsingGoogleAccountForm: {
      username: null as string | null,
      usernameRules: [(username: string) => !!username || 'Username is required'],
      idToken: null as string | null,
      formValid: false
    },
    registerForm: {
      username: null as string | null,
      usernameRules: [(username: string) => !!username || 'Username is required'],
      password: null as string | null,
      passwordRules: [
        (password: string) => !!password || 'Password is required',
        (password: string) =>
          (password.length >= 6 && password.length <= 256) || 'Password must be between 6 and 256 characters long.'
      ],
      firstName: null as string | null,
      firstNameRules: [(firstName: string) => !!firstName || 'First name is required'],
      lastName: null as string | null,
      lastNameRules: [(lastName: string) => !!lastName || 'Last name is required'],
      email: null as string | null,
      emailRules: [(email: string) => !!email || 'Email is required'],
      formValid: false
    },
    errorMessage: null as string | null,
    loading: false
  }),

  methods: {
    async register(): Promise<void> {
      const { username, password, formValid, firstName, lastName, email } = this.registerForm;

      if (!formValid || !password || !username || !firstName || !lastName || !email) {
        this.errorMessage = 'Invalid form.';
        return;
      }

      try {
        this.loading = true;
        await authService.registerUser({
          username,
          password,
          firstName,
          lastName,
          email
        });
        this.errorMessage = null;
        this.$router.push({ name: RouteName.Dashboard });
      } catch (error) {
        this.errorMessage = 'Something went wrong.';
      } finally {
        this.loading = false;
      }
    },

    async registerUsingGoogleAccount(): Promise<void> {
      const { username, idToken, formValid } = this.registerUsingGoogleAccountForm;

      if (!formValid || !idToken || !username) {
        this.errorMessage = 'Invalid form.';
        return;
      }

      try {
        this.loading = true;
        await authService.registerUserUsingGoogleAccount(username, idToken);
        this.errorMessage = null;
        this.$router.push({ name: RouteName.Dashboard });
      } catch (error) {
        this.errorMessage = 'Something went wrong.';
      } finally {
        this.loading = false;
      }
    },

    resetRegisterForm(): void {
      this.errorMessage = null;
      (this.$refs.registerForm as any).reset();
    },

    resetRegisterUsingGoogleAccountForm(): void {
      this.errorMessage = null;
      (this.$refs.registerUsingGoogleAccountForm as any).reset();
    }
  },

  mounted(): void {
    const { socialLogin } = this.$route.query;

    if (
      socialLogin &&
      socialLogin === LinkedAccountType.Google &&
      gapi &&
      typeof gapi?.auth2?.getAuthInstance === 'function' &&
      gapi.auth2.getAuthInstance().isSignedIn.get()
    ) {
      this.socialLoginType = LinkedAccountType.Google;
      const currentUser = gapi.auth2.getAuthInstance().currentUser.get();

      this.registerUsingGoogleAccountForm.idToken = currentUser.getAuthResponse().id_token;
      this.registerUsingGoogleAccountForm.username = currentUser.getBasicProfile().getEmail()?.split('@')[0] || null;
    }
  }
});
</script>
