<template>
  <q-layout class="main-layout" view="hHh lpR fFf">
    <div class="p-relative sidebar-div">
      <div class="p-absolute">
        <q-drawer
          show-if-above
          v-model="leftDrawerOpen"
          :mini="miniState"
          side="left"
          class="left-sidebar"
          :width="230"
        >
          <div class="d-flex justify-content-center q-mt-md">
            <q-btn flat no-caps>
              <div>
                <div class="d-flex justify-content-center q-mb-sm">
                  <q-avatar>
                    <img src="../assets/user-icon.png" />
                  </q-avatar>
                </div>
                <div class="d-flex justify-content-center">
                  <q-item-label lines="1" class="text-size-14 header-text">
                    {{ user.username }}
                  </q-item-label>
                  <q-item-label v-if="user.displayName" lines="2">
                    <span class="text-size-12 header-text">{{ user.username }}</span>
                  </q-item-label>
                </div>
                <div class="d-flex justify-content-center">
                  <q-item-label lines="1" class="text-size-13 avatar-handle"> {{ pdsJwt.handle }} </q-item-label>
                </div>
              </div>
              <q-menu transition-show="jump-down" transition-hide="jump-up">
                <q-list style="min-width: 100px">
                  <q-item @click="logOut" clickable v-close-popup>
                    <q-item-section>Log out</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
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
          <q-btn label="New Post" color="primary" size="md" class="text-center new-post-btn" icon="post_add" />
        </q-drawer>
      </div>
    </div>
    <div class="p-relative float-right sidebar-div">
      <div class="p-absolute">
        <q-drawer show-if-above side="right" class="right-sidebar" :width="230"> </q-drawer>
      </div>
    </div>
    <q-page-container>
      <q-page>
        <router-view :checkPdsSession="checkPdsSession" @updateImagePopupProps="updateImagePopupProps" />
      </q-page>
    </q-page-container>
  </q-layout>
  <div class="popup-container">
    <Transition>
      <ImagePopup
        v-if="imagePopupProps.display"
        :popupData="imagePopupProps"
        @close="imagePopupProps.display = false"
      />
    </Transition>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import role from 'src/consts/role'
import { ref } from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { responseError } from 'src/helper/error'
import ImagePopup from 'src/components/popups/ImagePopup.vue'

export default {
  data() {
    return {
      version: process.env.VERSION.replace(/"/g, ''),
      drawer: false,
      menuList: [
        {
          icon: 'home',
          label: 'Home',
          separator: false,
          to: '/home',
        },
        {
          icon: 'search',
          label: 'Search',
          separator: false,
          to: '/search',
        },
        {
          icon: 'notifications',
          label: 'Notifications',
          separator: false,
          to: '/notifications',
        },
        {
          icon: 'chat',
          label: 'Chat',
          separator: false,
          to: '/chat',
        },
        {
          icon: 'account_circle',
          label: 'Profile',
          separator: false,
          to: '/profile',
        },
        {
          icon: 'settings',
          label: 'Settings',
          separator: false,
          to: '/settings',
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
      checkPdsSession: false,
      imagePopupProps: {},
      pdsJwt: {},
    }
  },
  components: {
    ImagePopup,
  },
  async beforeMount() {
    await this.handlerPdsSession()
    this.checkPdsSession = true
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
    ...mapActions({
      setPdsJwt: 'user/setPdsJwt',
    }),
    shouldDisplayRoute(menuItem) {
      if (menuItem.to == '/report') {
        return this.displayReport
      }
      return !menuItem.role || (menuItem.role === role.ADMIN && this.isAdmin)
    },
    updateImagePopupProps(updateProp) {
      this.imagePopupProps = updateProp
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
    async handlerPdsSession() {
      await this.$api
        .get('/pds/get-pds-session')
        .then((res) => {
          this.setPdsJwt(res)
          this.pdsJwt = res
        })
        .catch((err) => {
          err.message = err.message + '. Please log in again to create a new pds session.'
          responseError(err)
          this.$store.dispatch('user/logOut')
          this.$router.push({ path: '/login' })
        })
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
