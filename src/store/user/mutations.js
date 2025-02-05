export default {
  setUser(state, user) {
    localStorage.setItem('user', JSON.stringify(user))
    state.user = user
  },
  setPdsJwt(state, pdsJwt) {
    localStorage.setItem('pdsJwt', JSON.stringify(pdsJwt))
    state.pdsJwt = pdsJwt
  },
  setQrImage(state, val) {
    state.qrImage = val
  },
  setQrKey(state, val) {
    state.qrKey = val
  },
  setQrAccount(state, val) {
    state.qrAccount = val
  },
  setTempPassword(state, val) {
    state.tempPassword = val
  },
  setAuthenticated(state, authenticated) {
    state.authenticated = authenticated
  },
}
