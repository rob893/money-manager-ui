import Vue from 'vue';
import GAuth from 'vue-google-oauth2';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';

declare module 'vue/types/vue' {
  interface Vue {
    $gAuth: {
      GoogleAuth: gapi.auth2.GoogleAuth;
      isAuthorized: boolean;
      isInit: boolean;
      signIn(
        successCallback?: (googleUser: gapi.auth2.GoogleUser) => void,
        errorCallback?: (error: any) => void
      ): Promise<gapi.auth2.GoogleUser>;
      signOut(successCallback?: () => void, errorCallback?: (error: any) => void): Promise<boolean>;
      getAuthCode(successCallback?: (code: string) => void, errorCallback?: (error: any) => void): Promise<string>;
    };
  }
}

const gauthOption = {
  clientId: '504553588506-joctqv1rhpn8o06apgdb2904qfi6fn26.apps.googleusercontent.com'
};

Vue.use(GAuth, gauthOption);

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app');
