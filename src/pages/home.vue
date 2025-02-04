<template>
  <div>Hello World</div>
</template>

<script>
export default {
  name: 'homePage',
  beforeRouteLeave: function (to, from, next) {
    next()
  },
}
</script>

<style scoped></style>
