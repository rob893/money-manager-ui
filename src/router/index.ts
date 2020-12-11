import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Budget from '../views/Budget.vue';
import { authService } from '@/services/AuthService';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/budget/:id',
      name: 'Budget',
      component: Budget
    },
    {
      path: '*',
      name: 'Default',
      component: Login
    }
  ]
});

router.beforeEach((to, _from, next) => {
  if (to.name !== 'Login' && !authService.isUserLoggedIn) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

authService.onUserLoggedOut.push(() => router.push({ name: 'Login' }));

export default router;
