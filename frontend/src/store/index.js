import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedPost: {
      username: "ishu1201",
      likes: 0,
      dislikes: 0,
      caption: "HOTTEST GIRL EVER !!!!!!!!",
      link: "posts/ishu1201-2.jpg",
      postId: "ishu1201-3",
      img: "https://firebasestorage.googleapis.com/v0/b/social-media-d825a.appspot.com/o/posts%2Fishu1201-2.jpg?alt=media&token=b5641e6f-36c7-4778-af25-778c40209ec0"
    },
  },
  getters: {
    selectedPost(state) {
      return state.selectedPost;
    }
  },
  mutations: {
    SET_POST(state, post) {
      state.selectedPost = post;
    }
  },
  actions: {
    selectPost({commit}, post) {
      commit("SET_POST", post);
    }
  },
  modules: {
  }
})
