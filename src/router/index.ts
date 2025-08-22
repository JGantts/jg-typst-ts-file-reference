import { route } from 'quasar/wrappers'
import { createRouter, createWebHashHistory, type Router } from 'vue-router'

// No routes; you also don't need <router-view/> anywhere.
export default route(function (): Router {
  return createRouter({
    history: createWebHashHistory(process.env.VUE_ROUTER_BASE),
    routes: [], // empty on purpose
  })
})