import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BattlePassView from "@/views/battlePassView.vue";
import GameModesView from "@/views/gameModesView.vue";
import LeaderBoardView from "@/views/leaderBoardView.vue";
import loginView from "@/views/loginView.vue";
import registerView from "@/views/registerView.vue";
import profileView from "@/views/profileView.vue";
import gameView from "@/views/gameView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/battle-pass',
      name: 'battlePass',
      component: BattlePassView
    },
    {
      path: '/game-modes',
      name: 'gameModes',
      component: GameModesView
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderBoardView
    },
    {
      path: '/login',
      name: 'login',
      component: loginView
    },
    {
      path: '/register',
      name: 'register',
      component: registerView
    },
    {
      path: '/profile',
      name: 'profile',
      component: profileView
    },
    {
      path: '/game-:type-:mode',
      name: 'game',
      component: gameView
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
