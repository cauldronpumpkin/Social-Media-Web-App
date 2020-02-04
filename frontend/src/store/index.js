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
    disliked: false,
    listOfPosts: []
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
    },
    listOfPosts(state) {
      return state.listOfPosts;
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
    },
    LIST_POST(state, listOfPosts) {
      state.listOfPosts = listOfPosts;
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
    listOfPosts({commit}, listOfPosts) {
      commit("LIST_POST", listOfPosts);
    },
  },
  modules: {
  }
})
