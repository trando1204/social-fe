<template>
  <div class="tweet-wrap">
    <div class="tweet-header">
      <img :src="postData.author.avatar" alt="" class="avator" />
      <div>
        <div class="tweet-header-info">
          {{ postData.author.displayName }} <span>@{{ postData.author.handle }}</span
          ><span> . {{ getDisplayTime(postData.indexedAt) }} </span>
        </div>
        <div>
          <HtmlText class="html-text" :richText="contentRichText" :segments="segments" dir="auto" />
        </div>
      </div>
    </div>
    <div class="tweet-img-wrap">
      <!-- 画像 -->
      <div v-if="images && images.length > 0" class="quad-images" :data-number-of-images="images.length">
        <div v-for="(image, imageIndex) of images" :key="imageIndex" class="quad-image">
          <Thumbnail :image="image" :did="postData.author.did" />
        </div>
      </div>
      <div v-if="video != null && video != undefined" class="video-container">
        <VideoPlayer
          :playlist="video.playlist"
          :did="postData.author.did"
          :cid="video.cid ?? video.video?.ref?.toString()"
          :poster="video.thumbnail"
          :style="{ 'aspect-ratio': videoAspectRatio }"
          @updateVideoType="updateVideoType"
          @click.stop
        />
        <p v-if="videoType === 'blob'" class="video-container__message">video is blob</p>
        <p v-else-if="videoType === 'none'" class="video-container__message">video is none</p>
        <HtmlText v-if="video.alt" class="video-container__alt" dir="auto" :text="video.alt" />
      </div>
    </div>
    <div v-if="isRepostPost" class="repost">
      <post-item
        level="2"
        :position="position === 'chatMessage' ? 'postInPost' : position === 'slim' ? 'slim' : 'postInPost'"
        :post="repostData"
        :hasReplyIcon="repostData.value?.reply != null"
        :noLink="position === 'chatMessage' ? false : noLink"
        @click="$emit('click', $event)"
      />
    </div>
    <div class="tweet-info-counts">
      <div class="comments">
        <svg
          class="feather feather-message-circle sc-dnqmqq jxshSx"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          ></path>
        </svg>
        <div class="comment-count">{{ postData.replyCount }}</div>
      </div>

      <div class="retweets">
        <svg
          class="feather feather-repeat sc-dnqmqq jxshSx"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="17 1 21 5 17 9"></polyline>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
          <polyline points="7 23 3 19 7 15"></polyline>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        </svg>
        <div class="retweet-count">{{ postData.repostCount }}</div>
      </div>

      <div class="likes">
        <svg
          class="feather feather-heart sc-dnqmqq jxshSx"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          ></path>
        </svg>
        <div class="likes-count">{{ postData.likeCount }}</div>
      </div>

      <div class="message">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="#5f6368">
          <path
            d="m228-240 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T458-480L320-240h-92Zm360 0 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T818-480L680-240h-92ZM320-500q25 0 42.5-17.5T380-560q0-25-17.5-42.5T320-620q-25 0-42.5 17.5T260-560q0 25 17.5 42.5T320-500Zm360 0q25 0 42.5-17.5T740-560q0-25-17.5-42.5T680-620q-25 0-42.5 17.5T620-560q0 25 17.5 42.5T680-500Zm0-60Zm-360 0Z"
          />
        </svg>
        <div class="quote-count">{{ postData.quoteCount }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { RichText } from '@atproto/api'
import HtmlText from '../labels/HtmlText.vue'
import Thumbnail from '../images/Thumbnail.vue'
import VideoPlayer from '../images/VideoPlayer.vue'
export default {
  name: 'postItem',
  data() {
    return {
      level: 1,
      position: 'post',
      rootPost: {},
      parentPost: {},
      grandparentAuthor: {},
      hasReplyIcon: false,
      hasQuoteRepostIcon: false,
      noLink: false,
      noLabelTags: false,
      forceHideMedia: false,
      forceHideQuoteRepost: false,
      forceUpdatePostThread: false,
      processing: false,
      postData: null,
      contentRichText: '',
      segments: [],
      images: [],
      video: {},
      videoAspectRatio: 'unset',
      videoType: null,
      repostData: null,
    }
  },
  props: {
    post: Object,
  },
  components: {
    HtmlText,
    Thumbnail,
    VideoPlayer,
  },
  computed: {
    isRepostPost() {
      if (!this.postData || !this.postData.embed) {
        return false
      }
      return this.postData.embed.$type.startsWith('app.bsky.embed.record')
    },
  },
  methods: {
    isFocused() {},
    onActivatePost(e) {},
    onActivateReplierLink() {},
    getDisplayTime(time) {
      const date = new Date(Date.parse(time))
      const now = new Date()
      if (now.getTime() - date.getTime() > 86400000) {
        return date.getFullYear() == now.getFullYear()
          ? date.toLocaleString('default', { day: 'numeric', month: 'short' })
          : date.toLocaleString('default', { year: 'numeric', day: 'numeric', month: 'short' })
      } else {
        return Math.round(Math.abs(now - date) / 36e5) + ' hours ago'
      }
    },
    updateVideoType(type) {
      this.videoType = type
    },
    safeURL(uri) {
      try {
        return new URL(uri)
      } catch (err) {
        return undefined
      }
    },
    transformInternalLink(uri) {
      const url = this.safeURL(uri)
      if (url == null) {
        console.warn(`[klearsky/transformInternalLink/${uri}]`, uri)
        return
      }
      switch (url.hostname) {
        case 'bsky.app': {
          const paths = url.pathname.split('/')
          switch (paths[1]) {
            case 'profile': {
              if (paths[2] == null) {
                return
              }
              if (paths[3] == null) {
                return `/profile/feeds?account=${paths[2]}`
              }
              switch (paths[3]) {
                case 'feed': {
                  if (!paths[4]) {
                    return
                  }
                  if (!paths[2].startsWith('did:')) {
                    return `/home/feeds?feed=at://{{${paths[2]}}}/app.bsky.feed.generator/${paths[4]}`
                  }
                  return `/home/feeds?feed=at://${paths[2]}/app.bsky.feed.generator/${paths[4]}`
                }
                case 'lists': {
                  if (!paths[4]) {
                    return
                  }
                  if (!paths[2].startsWith('did:')) {
                    return `/home/list-feeds?list=at://{{${paths[2]}}}/app.bsky.graph.list/${paths[4]}`
                  }
                  return `/home/list-feeds?list=at://${paths[2]}/app.bsky.graph.list/${paths[4]}`
                }
                case 'follows': {
                  return `/profile/following?account=${paths[2]}`
                }
                case 'followers': {
                  return `/profile/follower?account=${paths[2]}`
                }
                case 'post': {
                  if (!paths[4]) {
                    return
                  }
                  return `/post?handle=${paths[2]}&rkey=${paths[4]}`
                }
              }
              break
            }
            case 'search': {
              const q = url.searchParams.get('q')
              if (!q) {
                return
              }
              return `/search/post?text=${q}`
            }
            case 'starter-pack': {
              if (!paths[2] || !paths[3]) {
                return
              }
              return `/home/starter-pack?uri=at://${paths[2]}/app.bsky.graph.starterpack/${paths[3]}`
            }
          }
          break
        }
      }
    },
    initRichText() {
      let facets = this.postData.record ? this.postData.record.facets : undefined
      let text = this.postData.record ? this.postData.record.text : undefined
      if (this.postData.value) {
        if (facets == null || facets == undefined) {
          facets = this.postData.value.facets
        }
        if (text == null || text == undefined) {
          text = this.postData.value.text
        }
      }
      if (!text && !facets) {
        return
      }
      const richText = new RichText(
        {
          text: text,
          facets,
        },
        {
          cleanNewlines: true,
        }
      )
      if (facets == null) {
        richText.detectFacetsWithoutResolution()
      }
      this.contentRichText = richText
      this.segments = []
      for (const segment of richText.segments()) {
        if (segment.isLink()) {
          const uri = this.transformInternalLink(segment.link.uri ?? '')
          if (uri == null)
            this.segments.push({
              type: 'externalLink',
              text: segment.text,
              param: segment.link?.uri ?? '',
            })
          else
            this.segments.push({
              type: 'internalLink',
              text: segment.text.startsWith('http') ? uri : segment.text,
              param: uri,
            })
        } else if (segment.isMention())
          this.segments.push({
            type: 'mention',
            text: segment.text,
            param: segment.mention?.did ?? '',
          })
        else if (segment.isTag())
          this.segments.push({
            type: 'tag',
            text: segment.text,
            param: encodeURIComponent(segment.tag?.tag ?? ''),
          })
        else
          this.segments.push({
            type: 'text',
            text: segment.text,
            param: '',
          })
      }
    },
    initImages() {
      if (!this.postData.embed && !this.postData.embeds && (!this.postData.record || !this.postData.record.embed)) {
        this.images = []
        return
      }
      if (this.postData.embed && this.postData.embed.images) {
        this.images = this.postData.embed.images
      }
      if ((!this.images || this.images.length == 0) && this.postData.embeds && this.postData.embeds.length > 0) {
        this.images = this.postData.embeds[0].images
      }
      if ((!this.images || this.images.length == 0) && this.postData.embed && this.postData.embed.media) {
        this.images = this.postData.embed.media.images
      }
      if ((!this.images || this.images.length == 0) && this.postData.record && this.postData.record.embed) {
        this.images = this.postData.record.embed.images
      }
      if ((!this.images || this.images.length == 0) && this.postData.value && this.postData.value.embed) {
        this.images = this.postData.value.embed.images
      }
    },
    initVideo() {
      let embed = undefined
      if (this.postData.embed) {
        embed = this.postData.embed
      } else if (this.postData.record) {
        embed = this.postData.record.embed
      }
      if (!embed || embed == null) {
        this.video = undefined
        return
      }
      if (embed.$type.startsWith('app.bsky.embed.video')) {
        this.video = embed
        return
      }
      this.video = embed.media
      if (!this.video) {
        this.video = undefined
        return
      }
      this.video = this.video.$type.startsWith('app.bsky.embed.video') ? this.video : undefined
    },
    initVideoAspectRatio() {
      if (
        !this.video ||
        this.video.aspectRatio == null ||
        this.video.aspectRatio.width == null ||
        this.video.aspectRatio.height == null
      ) {
        this.videoAspectRatio = 'unset'
        return
      }
      const aspectHeight = this.video.aspectRatio.height / this.video.aspectRatio.width
      this.videoAspectRatio = `1 / ${aspectHeight}`
    },
    initReportData() {
      if (!this.isRepostPost) {
        return
      }
      this.repostData = this.postData.embed.record
      if (!this.repostData) {
        return
      }
      if (this.repostData.record) {
        this.repostData = this.repostData.record
      }
    },
  },
  watch: {
    post: {
      immediate: true,
      handler(newVal) {
        this.postData = newVal
        this.initRichText()
        this.initImages()
        this.initVideo()
        this.initVideoAspectRatio()
        this.initReportData()
      },
    },
  },
}
</script>
<style lang="scss" scoped>
img {
  max-width: 100%;
}
.html-text {
  white-space: pre-wrap;
  word-break: break-word;
}
.avator {
  border-radius: 100px;
  width: 48px;
  margin-right: 15px;
}

.tweet-wrap {
  max-width: 800px;
  background: #fff;
  margin: 0 auto;
  margin-top: 20px;
  border-radius: 3px;
  padding: 30px;
  border-bottom: 1px solid #e6ecf0;
}

.tweet-header {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
}
.tweet-header-info {
  font-weight: bold;
}
.tweet-header-info span {
  color: #657786;
  font-weight: normal;
  margin-left: 5px;
}
.tweet-header-info p {
  font-weight: normal;
  margin-top: 5px;
}
.tweet-img-wrap {
  padding-left: 50px;
}

.tweet-info-counts {
  display: flex;
  margin-left: 60px;
  margin-top: 10px;
}
.tweet-info-counts div {
  display: flex;
  margin-right: 20px;
}
.tweet-info-counts div svg {
  color: #657786;
  margin-right: 10px;
}
@media screen and (max-width: 430px) {
  body {
    padding-left: 20px;
    padding-right: 20px;
  }
  .tweet-header {
    flex-direction: column;
  }
  .tweet-header img {
    margin-bottom: 20px;
  }
  .tweet-header-info p {
    margin-bottom: 30px;
  }
  .tweet-img-wrap {
    padding-left: 0;
  }
  .tweet-info-counts {
    display: flex;
    margin-left: 0;
  }
  .tweet-info-counts div {
    margin-right: 10px;
  }
}
.repost {
  background-color: rgba(62, 176, 234, 0.125);
  border: 1px solid rgb(62, 176, 234, 0.25);
  border-radius: 0.25em;
  margin-left: 60px;
  margin-top: 10px;

  :not([data-position='slim']) & > .post {
    padding: 0.75em;
  }
  [data-position='slim'] & > .post {
    padding: 0.5em;
  }

  &.textlabel {
    opacity: 0.75;
    padding: 0.75em;
  }
}
.repost .tweet-wrap {
  background: transparent;
}
.repost .tweet-wrap {
  padding: 15px 20px;
}
</style>
