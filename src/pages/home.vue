<template>
  <FeedList :feeds="timelines" @updateImagePopupProps="updateImagePopupProps"></FeedList>
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
  props: {
    checkPdsSession: Boolean,
  },
  data() {
    return {
      timelines: [],
      cursor: '',
    }
  },
  methods: {
    updateImagePopupProps(updateProp) {
      this.$emit('updateImagePopupProps', updateProp)
    },
  },
  watch: {
    checkPdsSession: {
      immediate: true,
      handler(checked) {
        if (checked) {
          this.$api
            .get('/pds/get-timeline')
            .then((res) => {
              this.cursor = res.cursor
              this.timelines = res.feed
            })
            .catch((err) => {
              responseError(err)
            })
        }
      },
    },
  },
}
</script>

<style scoped></style>
