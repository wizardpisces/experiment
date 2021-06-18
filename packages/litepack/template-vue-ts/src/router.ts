import {
    createRouter,
    createWebHistory
} from 'vue-router'

const Home = () => import('./pages/home.vue')
const About = () => import('./pages/about.vue')

const routerHistory = createWebHistory()

export const routes = [{
    path: '/',
    name: 'home',
    component: Home
}, {
    path: '/about',
    component: About,
    name: 'about'
}]

const router = createRouter({
    history: routerHistory,
    routes
})

export default router;