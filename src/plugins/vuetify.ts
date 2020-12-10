import Vue from 'vue';
import Vuetify from 'vuetify';
import { uiSettingsService } from '@/services/UISettingsService';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: uiSettingsService.darkThemeSet
  }
});
