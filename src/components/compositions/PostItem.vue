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
        <div class="comment-count">33</div>
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
        <div class="retweet-count">397</div>
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
        <div class="likes-count">2.6k</div>
      </div>

      <div class="message">
        <svg
          class="feather feather-send sc-dnqmqq jxshSx"
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
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
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
      const facets = this.postData.record.facets
      if (this.postData.value && (facets == null || facets == undefined)) {
        facets = this.postData.value.facets
      }
      const richText = new RichText(
        {
          text: this.postData.record.text,
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
      if (!this.postData.embed && !this.postData.record.embed) {
        this.images = []
        return
      }
      this.images = this.postData.embed.images
      if (!this.images) {
        this.images = this.postData.record.embed.images
      }
    },
    initVideo() {
      const embed = this.postData.embed ?? this.postData.record.embed
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
  padding-left: 60px;
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
</style>
