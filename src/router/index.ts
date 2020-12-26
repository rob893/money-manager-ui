import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Register from '@/views/Register.vue';
import Login from '@/views/Login.vue';
import Budget from '@/views/Budget.vue';
import Budgets from '@/views/Budgets.vue';
import Dashboard from '@/views/Dashboard.vue';
import { authService } from '@/services/AuthService';
import { RouteName } from './RouteName';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/home',
      name: RouteName.Home,
      component: Home
    },
    {
      path: '/dashboard',
      name: RouteName.Dashboard,
      component: Dashboard
    },
    {
      path: '/about',
      name: RouteName.About,
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
      path: '/register',
      name: RouteName.Register,
      component: Register
    },
    {
      path: '/login',
      name: RouteName.Login,
      component: Login
    },
    {
      path: '/budgets',
      name: RouteName.Budgets,
      component: Budgets
    },
    {
      path: '/budgets/:id',
      name: RouteName.Budget,
      component: Budget
    },
    {
      path: '*',
      name: RouteName.Default,
      component: Dashboard
    }
  ]
});

const unauthenticatedRoutes = new Set<RouteName | string | null | undefined>([
  RouteName.Login,
  RouteName.About,
  RouteName.Register
]);

router.beforeEach((to, _from, next) => {
  if (!unauthenticatedRoutes.has(to.name) && !authService.isUserLoggedIn) {
    next({ name: RouteName.Login });
  } else {
    next();
  }
});

authService.unauthorizedActionAttempted.subscribe(statusCode => {
  if (statusCode === 401 || statusCode === 403) {
    router.push({ name: RouteName.Login });
  }
});

authService.authChanged.subscribe(authStatus => {
  if (!authStatus) {
    router.push({ name: RouteName.Login });
  }
});

export default router;
