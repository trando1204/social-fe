<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white shadow-4">
      <q-toolbar class="GNL__toolbar">
        <q-btn
          flat
          dense
          round
          @click="$q.screen.gt.sm ? toogleMiniState() : toggleLeftDrawer()"
          aria-label="Menu"
          icon="menu"
        />
        <q-toolbar-title>
          <q-avatar class="q-mr-sm"><img src="../assets/social.png" /></q-avatar>Social Website
        </q-toolbar-title>
        <q-btn flat no-caps>
          <q-item class="q-pa-none">
            <q-item-section avatar>
              <q-avatar>
                <img src="../assets/user-icon.png" />
              </q-avatar>
            </q-item-section>

            <q-item-section class="text-left" no-caps>
              <q-item-label lines="1" class="text-size-14 header-text">
                {{ user.username }}
              </q-item-label>
              <q-item-label v-if="user.displayName" lines="2">
                <span class="text-size-12 header-text">{{ user.username }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-menu transition-show="jump-down" transition-hide="jump-up">
            <q-list style="min-width: 100px">
              <q-item @click="logOut" clickable v-close-popup>
                <q-item-section>Log out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-drawer show-if-above v-model="leftDrawerOpen" :mini="miniState" side="left" class="left-sidebar" :width="280">
      <q-scroll-area class="fit">
        <q-list padding class="text-grey-2">
          <template v-for="(menuItem, index) in menuList">
            <div
              class="row center-row q-my-sm separator-full-display"
              :key="'separator_' + index"
              v-if="menuItem.label === 'User Management' && isAdmin"
            >
              <q-separator class="width-40" />
              <span class="width-20 text-weight-medium q-pl-sm">Admin</span>
              <q-separator class="width-40" />
            </div>
            <q-separator
              class="separator-mini-display"
              :key="'sepa_no_text_' + index"
              v-if="menuItem.label === 'User Management' && isAdmin"
            />
            <q-item
              :key="index"
              clickable
              :to="menuItem.to"
              active-class="bg-cyan-2 sidebar-active-item"
              class="GNL__drawer-item sidebar-item"
              v-if="shouldDisplayRoute(menuItem)"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon size="md" class="sidebar-icon" :name="'o_' + menuItem.icon" />
              </q-item-section>
              <q-item-section>
                <span class="row sidebar-text justify-between"
                  >{{ menuItem.label }}
                  <q-badge
                    :label="approvalCount"
                    style="font-size: 12px; height: 20px"
                    v-if="menuItem.label === 'Pending Approvals'"
                  >
                    <q-tooltip>Number of invoices that need to be approved</q-tooltip>
                  </q-badge>
                  <q-badge
                    :label="unpaidCount"
                    style="font-size: 12px; height: 20px"
                    v-if="menuItem.label === 'Pay' && unpaidCount > 0"
                  >
                    <q-tooltip>Number of unpaid invoices</q-tooltip>
                  </q-badge></span
                >
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar'
import role from 'src/consts/role'
import { ref } from 'vue'
import { mapGetters } from 'vuex'
import { Notify } from 'quasar'
import { version } from 'core-js'

export default {
  data() {
    return {
      version: process.env.VERSION.replace(/"/g, ''),
      drawer: false,
      menuList: [
        {
          icon: 'schedule',
          label: 'Home',
          separator: false,
          to: '/home',
        },
      ],
      working: false,
      pausing: true,
      approvalCount: 0,
      unpaidCount: 0,
      displayAdminSeparator: true,
      displayReport: true,
      totalTimeSeconds: 0,
      interval: null,
      timeHour: '',
      timeMin: '00',
      timeSecond: '00',
      runningTimer: {},
    }
  },
  setup() {
    const $q = useQuasar()
    const leftDrawerOpen = ref(false)
    const miniState = ref(false)
    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      miniState,
      toogleMiniState() {
        miniState.value = !miniState.value
        this.displayAdminSeparator = !this.displayAdminSeparator
      },
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    isAdmin() {
      return this.user && this.user.role === role.ADMIN
    },
  },
  methods: {
    shouldDisplayRoute(menuItem) {
      if (menuItem.to == '/report') {
        return this.displayReport
      }
      return !menuItem.role || (menuItem.role === role.ADMIN && this.isAdmin)
    },
    logOut() {
      this.$store.dispatch('user/logOut')
      this.$router.push({ path: '/login' })
    },
    empty(str) {
      return (
        typeof str == 'undefined' ||
        !str ||
        str.length === 0 ||
        str === '' ||
        !/[^\s]/.test(str) ||
        /^\s*$/.test(str) ||
        str.replace(/\s/g, '') === ''
      )
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        if (to.meta.requiresAuth && this.user.id === 0) {
          this.$router.push({
            path: '/login',
          })
        }
      },
    },
  },
}
</script>
