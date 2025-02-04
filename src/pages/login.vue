<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="parent clearfix">
          <div class="login">
            <div class="position-relative">
              <div class="flex flex-center q-mx-auto window-height">
                <div class="container justify-center">
                  <div>
                    <q-card-section class="q-pa-lg login-form">
                      <p class="text-h5 text-primary text-center"><b>Sign In</b></p>
                      <p class="login-subtitle text-primary text-center q-mt-sm">Sign in with passkey</p>
                      <div class="d-flex justify-content-center q-mb-md q-mt-sm">
                        <q-btn
                          label="Sign in"
                          color="primary"
                          class="text-center"
                          :loading="signBtnLoading"
                          @click="openPasskeyMgr()"
                        />
                      </div>
                      <q-card class="col" flat bordered> </q-card>
                      <div class="text-grey-3 q-mt-md row justify-between">
                        <router-link class="link text-primary underline-link" to="/register"
                          >Create Account</router-link
                        >
                      </div>
                    </q-card-section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { responseError } from 'src/helper/error'
import { Notify } from 'quasar'
import { startAuthentication } from '@simplewebauthn/browser'

export default {
  name: 'pageLogin',
  data() {
    return {
      username: '',
      password: '',
      error: null,
      isPwd: true,
      msg: [],
      signBtnLoading: false,
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
  methods: {
    ...mapActions({
      login: 'user/login',
      setLogin: 'user/setLogin',
    }),
    async goLogin() {
      const { error, data } = await this.login({
        username: this.username,
        password: this.password,
        loginType: this.loginType,
      })
      if (error) {
        this.error = error.message
        return
      }
      this.$router.push({ path: '/home' })
    },
    validateRequiredField(name, value) {
      if (value && value.length > 0) {
        this.msg[name] = ''
        return
      }
      this.msg[name] = 'Please enter your ' + name
    },
    openPasskeyMgr() {
      this.signBtnLoading = true
      this.$api
        .post('/auth/assertion-options', {})
        .then((res) => {
          if (!res.error) {
            const resultData = JSON.parse(res.data)
            if (!resultData || !resultData.options) {
              return
            }
            const opts = resultData.options
            const sessionKey = resultData.sessionkey
            this.handlerLoginFinish(opts, sessionKey, false)
          } else {
            Notify.create({
              type: 'negative',
              message: res.msg,
            })
            this.signBtnLoading = false
          }
        })
        .catch((err) => {
          this.signBtnLoading = false
          responseError(err)
        })
    },
    loginWithOldAccount() {
      if (this.loginType == 0) {
        this.loginType = 1
      } else {
        this.loginType = 0
      }
    },
    async handlerLoginFinish(opts, sessionKey, startConditionalUI) {
      let asseResp
      try {
        asseResp = await startAuthentication(opts.publicKey, startConditionalUI)
      } catch (error) {
        this.signBtnLoading = false
        console.log('Conditional UI request was aborted')
        return
      }
      this.$api
        .post('/auth/assertion-result?sessionKey=' + sessionKey, asseResp)
        .then((res) => {
          this.setLogin(res)
          this.$router.push({ path: '/' })
        })
        .catch((err) => {
          this.signBtnLoading = false
          responseError(err)
        })
    },
  },
  watch: {
    username(value) {
      this.username = value
      this.validateRequiredField('username', value)
    },
    password(value) {
      this.password = value
      this.validateRequiredField('password', value)
    },
  },
}
</script>

<style lang="scss">
.logo {
  height: 2em;
}
.login-form-wrapper {
  max-width: 28rem;
}
.link {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
