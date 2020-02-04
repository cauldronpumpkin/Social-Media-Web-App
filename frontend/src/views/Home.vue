<template>
  <div class="home">
    <div v-for="(post, i) in listOfPosts" :key="post.link">
    <v-card class="innerCard" justify="center" >
            <img class="postImage" style="width: 600px; height: 600px;"/>
            <div style="margin-left: 30px; width: 100px; margin-top: 10px;">
                <div class="row">
                    <div>
                        <pre style="font-family: sans;"><b>{{ post.username }}:</b> {{ post.caption }}</pre>
                    </div>
                    <div>
                        <v-btn icon :disabled="post.isLiked" large v-on:click="likePost(i)" style="margin-right: 20px;">
                            <v-icon >thumb_up</v-icon>
                        </v-btn>
                        <h5> {{ post.likes }} Likes </h5>
                    </div>
                    <div>
                        <v-btn icon :disabled="post.isDisliked" large v-on:click="dislikePost(i)">
                            <v-icon >thumb_down</v-icon>
                        </v-btn>
                        <h5> {{ post.dislikes }} Dislikes </h5>
                    </div>
                </div>
            </div>
        </v-card>
    </div>
  </div>
</template>

<script>
// import fire from '../firebase/index'
import firebase from 'firebase/app';
import 'firebase/firestore' ;
import 'firebase/storage';

export default {
    data: () => ({
      listOfPosts: [],
    }),
    async mounted() {
      var res = await this.$apollo.query({
          query: require('../graphql/getUser.gql'),
          variables: {
              username: localStorage.getItem('loggedUser')
          }
      });
      var listOfFriends = res.data.user.friends;

      for (let i = 0; i < listOfFriends.length; i++) {
        if (listOfFriends[i] == "" || listOfFriends[i] == "admin") {
          continue;
        }
        else {
          var posts = await this.$apollo.query({
            query: require('../graphql/getPosts.gql'),
            variables: {
                username: listOfFriends[i]
            }
          });
          this.listOfPosts = this.listOfPosts.concat(posts.data.userPosts);
        }
      }
      this.listOfPosts.sort(function(a, b){return new Date(b.madeOn) - new Date(a.madeOn)});
      let img = document.getElementsByClassName("postImage");

      for (let i = 0; i < this.listOfPosts.length; i++) {
        this.listOfPosts[i].isLiked = this.listOfPosts[i].likedBy.includes(localStorage.getItem('loggedUser'));
        this.listOfPosts[i].isDisliked = this.listOfPosts[i].dislikedBy.includes(localStorage.getItem('loggedUser'));
      }

      for (let i = 0; i < this.listOfPosts.length; i++) {
        let post = this.listOfPosts[i];
        let ref = firebase.storage().ref(post.link);
        let url = await ref.getDownloadURL();
        this.listOfPosts[i].img = url;
        img[i].src = url; 
      }
    },
    methods: {
      async likePost(i) {
            this.listOfPosts[i].likes += 1;
            this.listOfPosts[i].isLiked = true;
            this.listOfPosts[i].likedBy.push(localStorage.getItem('loggedUser'));
            this.$store.dispatch('likedPost', true);
            let res = await this.$apollo.mutate({
                mutation: require('../graphql/likePost.gql'),
                variables: {
                    postId   : this.listOfPosts[i].postId,
                    username : localStorage.getItem('loggedUser')
                }
            })
            console.log(res);
        },
        async dislikePost(i) {
            this.listOfPosts[i].dislikes += 1;
            this.listOfPosts[i].isDisliked = true;
            this.listOfPosts[i].dislikedBy.push(localStorage.getItem('loggedUser'));
            this.$store.dispatch('dislikedPost', true);
            let res = await this.$apollo.mutate({
                mutation: require('../graphql/dislikePost.gql'),
                variables: {
                    postId   : this.listOfPosts[i].postId,
                    username : localStorage.getItem('loggedUser')
                }
            })
            console.log(res);
        },
    }
}
</script>

<style scoped>
  .home {
    padding: 0px 650px;
    /* width: 500px; */
  }
  .innerCard {
    width: 600px;
    margin-top: 100px;
    height: 720px
  }
</style>
