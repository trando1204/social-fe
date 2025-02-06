<template>
  <FeedList :feeds="timelines"></FeedList>
</template>

<script>
import FeedList from 'src/components/lists/FeedList.vue'
export default {
  name: 'homePage',
  beforeRouteLeave: function (to, from, next) {
    next()
  },
  components: {
    FeedList,
  },
  data() {
    return {
      timelines: [],
      cursor: '',
    }
  },
  created() {
    this.$api
      .get('/pds/get-timeline')
      .then((res) => {
        this.cursor = res.cursor
        this.timelines = res.feed
      })
      .catch((err) => {
        responseError(err)
      })
  },
}
</script>

<style scoped></style>
