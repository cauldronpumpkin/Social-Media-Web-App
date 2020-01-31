<template>
    <div> <br><br><br><br><br>
        <v-row class="postRow">
            <v-col v-for="post in listOfPosts" :key="post.postId" class="column" cols="3">
             <img src="../images/sh.jpg" class="postImage" v-on:click="selectPost(post)"/>
            </v-col>
        </v-row>
    <v-row justify="center">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition" id="abc">
      <v-card>
        <v-toolbar color="primary" style="background-color: teal;">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size: 25px; font-family: sans;">Post</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <div style="margin-left: 1720px; margin-top: 10px;">
            <v-btn dark v-on:click="deletePost()"> Delete This Post </v-btn>
        </div>
        <v-card class="innerCard" justify="center">
            <v-img :src="url" id="selectedPost"/>
            <div style="margin-left: 30px; width: 100px; margin-top: 10px;">
                <div class="row"> 
                    <div>
                        <v-btn icon large v-on:click="likePost()" style="margin-right: 20px;">
                            <v-icon large>thumb_up</v-icon>
                        </v-btn>
                        <h2> {{ selectedPost.likes }} </h2>
                    </div>
                    <div>
                        <v-btn icon large v-on:click="dislikePost()">
                            <v-icon large>thumb_down</v-icon>
                        </v-btn>
                        <h2> {{ selectedPost.dislikes }} </h2>
                    </div>
                </div>
            </div>
        </v-card>
      </v-card>
    </v-dialog>
  </v-row>
    </div>
</template>

<script>
import fire from '../firebase/index';

export default {
    data: () => ({
        listOfPosts: {},
        width: 300,
        dialog: false,
        url: "",
        loading: false
    }),
    async mounted() {
        var username = localStorage.getItem('loggedUser');
        var res = await this.$apollo.query({
        query: require('../graphql/getPosts.gql'),
        variables: {
            username: username
        }
        });
        this.listOfPosts = res.data.userPosts;
        for (let i = 0; i < this.listOfPosts.length; i++) {
                let post = this.listOfPosts[i];
                let ref = fire.ref(post.link);
                let url = await ref.getDownloadURL();
                this.listOfPosts[i].img = url;
        }
        console.log(this.listOfPosts)
        let img = document.getElementsByClassName("postImage");
        for (let i = 0; i < this.listOfPosts.length; i++) {
            img[i].src = this.listOfPosts[i].img; 
        }
    },
    computed: {
        selectedPost() {
            return this.$store.getters.selectedPost;
        }
    },
    methods: {
        getPosts() {
            var username = localStorage.getItem('loggedUser');
            this.$apollo.query({
            query: require('../graphql/getPosts.gql'),
            variables: {
                username: username
            }
            }).then(res => {
                this.listOfPosts = res.data.userPosts;
                for (let i = 0; i < this.listOfPosts.length; i++) {
                    let post = this.listOfPosts[i];
                    let ref = fire.ref(post.link);
                    ref.getDownloadURL().then((url) => {
                        this.listOfPosts[i].img = url;
                    })
                }
            })
        },
        selectPost(post) {
            this.$store.dispatch('selectPost', post);
            this.url = post.img;
            this.dialog = true;
        },
        likePost() {
            this.selectedPost.likes++;
            this.$store.dispatch('selectPost', this.selectPost);
            this.$apollo.mutate({
                mutation: require('../graphql/likePost.gql'),
                variables: {
                    postId: this.selectedPost.postId,
                }
            }).then(() => {
                this.getPosts();
            })
        },
        dislikePost() {
            this.selectedPost.dislikes++;
            this.$store.dispatch('selectPost', this.selectPost);
            this.$apollo.mutate({
                mutation: require('../graphql/dislikePost.gql'),
                variables: {
                    postId: this.selectedPost.postId,
                }
            }).then(() => {
                this.getPosts();
            })
        },
        async deletePost() {
            this.loading = true;
            console.log("kabs")
            await fire.ref(this.selectedPost.link).delete();
            console.log("aibgdcy")
            this.$apollo.mutate({
                mutation: require('../graphql/deletePost.gql'),
                variables: {
                    postId: this.selectedPost.postId
                }
            }).then(() => {
                this.loading = false;
                this.dialog = false;
                this.getPosts();
            })
        }
    }

}
</script>

<style scoped>
    .postCard {
        width: 500px;
        height: 700px;
        margin-left: 650px;
    }
    .postRow {
        padding: 0px 600px;
    }
    .postImage {
        width: 170px;
        height: 170px;
        display:inline-block;
    }
    .column :hover {
        cursor: pointer;
        transform: scale(1.05); 
    }
    #abc {
        display: unset; 
    }
    .innerCard {
        width: 600px;
        height: 800px;
        margin-left: 600px;
        margin-top: 50px;
    }
    #selectedPost {
        width: 600px;
        height: 600px;
    }
</style>