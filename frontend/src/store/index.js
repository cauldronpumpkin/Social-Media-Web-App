import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedPost: {
      likes: 0,
      dislikes: 0
    },
    liked: false,
    disliked: false
  },
  getters: {
    selectedPost(state) {
      return state.selectedPost;
    },
    liked(state) {
      return state.liked;
    },
    disliked(state) {
      return state.disliked;
    }
  },
  mutations: {
    SET_POST(state, post) {
      state.selectedPost = post;
    },
    LIKED_POST(state, boolLiked) {
      state.liked = boolLiked;
    },
    DISLIKED_POST(state, boolDisliked) {
      state.disliked = boolDisliked;
    }
  },
  actions: {
    selectPost({commit}, post) {
      commit("SET_POST", post);
    },
    likedPost({commit}, boolLiked) {
      commit("LIKED_POST", boolLiked);
    },
    dislikedPost({commit}, boolDisliked) {
      commit("DISLIKED_POST", boolDisliked);
    },
  },
  modules: {
  }
})
