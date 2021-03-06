<template>
  <div>
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item v-if="!isUserLoggedIn" link to="/login">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="!isUserLoggedIn" link to="/register">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Sign Up</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isUserLoggedIn" link to="/dashboard">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isUserLoggedIn" link to="/budgets">
          <v-list-item-action>
            <v-icon>mdi-currency-usd</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Budgets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isUserLoggedIn" link to="/tools">
          <v-list-item-action>
            <v-icon>mdi-tools</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Tools</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link to="/about">
          <v-list-item-action>
            <v-icon>mdi-information</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link @click="showSettings = true">
          <v-list-item-action>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isUserLoggedIn" link @click="logout">
          <v-list-item-action>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-app-bar>

    <v-dialog width="500" v-model="showSettings">
      <v-card>
        <v-card-title> Settings </v-card-title>

        <v-card-actions>
          <v-switch v-model="isDarkThemeSet" label="Dark Theme"></v-switch>
        </v-card-actions>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="showSettings = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Subscription } from 'rxjs';
import { authService } from '@/services/AuthService';
import { uiSettingsService } from '@/services/UISettingsService';

export default Vue.extend({
  name: 'Header',

  data: () => ({
    showSettings: false,
    drawer: false,
    title: process.env.VUE_APP_TITLE,
    isUserLoggedIn: false,
    authChangedSubscription: new Subscription()
  }),

  methods: {
    logout(): void {
      authService.logout();
    }
  },

  computed: {
    isDarkThemeSet: {
      get(): boolean {
        return uiSettingsService.darkThemeSet;
      },

      set(value: boolean): void {
        this.$vuetify.theme.dark = value;
        uiSettingsService.darkThemeSet = value;
      }
    }
  },

  mounted(): void {
    this.isUserLoggedIn = authService.isUserLoggedIn;
    this.authChangedSubscription = authService.authChanged.subscribe(authStatus => (this.isUserLoggedIn = authStatus));
  },

  beforeDestroy(): void {
    this.authChangedSubscription.unsubscribe();
  }
});
</script>
