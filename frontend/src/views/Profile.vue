<template>
    <div> <br><br>
    <v-btn v-on:click="sendFriendRequest()" :loading="requestLoading" 
        style="background-color: #00acee; margin-left: 1650px;" v-if="requestButton" text>Send Friend Request</v-btn>
    <br><br><br>
        <v-card class="profileCard">
            <v-img height="100%" src="https://ubikes.com/wp-content/uploads/websitebg-bl_compr1_2.png">
      <v-row align="end" class="fill-height">
        <v-col align-self="start" class="pa-0" cols="12">
          <v-avatar class="profile" color="grey" size="164" >
            <v-img :src="avatar" id="avatarImg" rounded/>
          </v-avatar>
        </v-col>
        <v-col class="py-0">
          <v-list-item color="rgba(0, 0, 0, .4)" dark>
            <v-list-item-content>
              <v-list-item-title class="title" style="font-family: sans;">{{ name }}</v-list-item-title>
              <v-list-item-subtitle style="font-family: sans;">{{ email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>
    </v-img>
    <v-dialog v-model="avatarDialog" id="abc" max-width="490" hide-overlay persistent>
        <v-card>
            <v-card-title>
                Please Wait
            </v-card-title>
        </v-card>
    </v-dialog>
        </v-card>
         <br><br><br><br><br><br>   
        <v-row class="postRow">
            <v-col v-for="post in listOfPosts" :key="post.postId" class="column" cols="3">
             <img alt="Loading Image" class="postImage" v-on:click="selectPost(post)"/>
            </v-col>
        </v-row>
    <v-row justify="center">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition" id="abc">
      <v-card>
        <v-toolbar color="primary" style="background-color: #00acee;">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size: 25px; font-family: sans;">Post</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar><br><br>
        <v-card class="innerCard" justify="center">
            <v-img :src="url" id="selectedPostImage" v-on:dblclick="likePost"/>
            <div style="margin-left: 30px; width: 100px; margin-top: 10px;">
                <div class="row">
                    <div>
                        <pre style="font-family: sans;"><b>{{ selectedPost.username }}:</b> {{ selectedPost.caption }}</pre>
                    </div>
                    <div>
                        <v-btn icon large v-on:click="likePost()" style="margin-right: 20px;" :disabled="liked">
                            <v-icon large>thumb_up</v-icon>
                        </v-btn>
                        <h5> {{ selectedPost.likes }} Likes </h5>
                    </div>
                    <div>
                        <v-btn icon large v-on:click="dislikePost()" :disabled="disliked">
                            <v-icon large>thumb_down</v-icon>
                        </v-btn>
                        <h5> {{ selectedPost.dislikes }} Dislikes </h5>
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
        loading: false,
        requestLoading: false,
        requestButton: true,
        friends: [],
        avatar: "",
        email: "",
        name: "", 
        avatarDialog: false
    }),
    created() {
        if (localStorage.getItem('loggedUser') == sessionStorage.getItem('reqUser')) {
            this.requestButton = false;
        }
        this.$apollo.query({
            query: require('../graphql/getUser.gql'),
            variables: {
                username: sessionStorage.getItem('reqUser')
            }
        }).then(res => {
            this.email = res.data.user.email;
            this.name = res.data.user.name;
            this.friends = res.data.user.friends;
        })
    },
    async mounted() {
        var username = sessionStorage.getItem('reqUser');
        var r = fire.ref(`profile/${username}`);
        r.getDownloadURL().then(url => {
            this.avatar = url;
        })
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
        this.$store.dispatch('listOfPosts', this.listOfPosts);
        let img = document.getElementsByClassName("postImage");
        for (let i = 0; i < this.listOfPosts.length; i++) {
            img[i].src = this.listOfPosts[i].img; 
        }
    },
    computed: {
        selectedPost() {
            return this.$store.getters.selectedPost;
        },
        liked() {
            return this.$store.getters.liked;
        },
        disliked() {
            return this.$store.getters.disliked;
        }
    },
    methods: {
        getPosts() {
            var username = sessionStorage.getItem('reqUser');
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
        sendFriendRequest() {
            this.requestLoading = true;
            // var bool = this.friends.include(localStorage.getItem('loggedUser'));
            var bool = false;
            if (bool) {
                console.log("Already Friends !");
            }
            else {  
                var id = localStorage.getItem('loggedUser') + sessionStorage.getItem('reqUser');  
                this.$apollo.mutate({
                    mutation: require('../graphql/sendRequest.gql'),
                    variables: {
                        toUser     : sessionStorage.getItem('reqUser'),
                        fromUser   : localStorage.getItem('loggedUser'),
                        requestId  : id 
                    }
                }).then(() => {
                    this.requestLoading = false;
                })
            }
        },
        selectPost(post) {
            this.$store.dispatch('selectPost', post);
            let loggedUser = localStorage.getItem('loggedUser');
            var boolLiked = post.likedBy.includes(loggedUser);
            var boolDisliked = post.dislikedBy.includes(loggedUser);
            this.$store.dispatch('likedPost', boolLiked);
            this.$store.dispatch('dislikedPost', boolDisliked);
            this.url = post.img;
            var img = new Image();
            img.src = post.img;
            img.onload = function() 
            {
                let width = this.naturalWidth;
                let height = this.naturalHeight;
                if (width > 800) {
                    width = width/2;
                }
                if (height > 700) {
                    height = height/2.2;
                }
                document.getElementById('selectedPostImage').style.width = width + 'px';
                document.getElementsByClassName('innerCard')[0].style.width = width + 'px';
                document.getElementsByClassName('innerCard')[0].style.height = `${height+100}px`;
                document.getElementById('selectedPostImage').style.height = height + 'px';       
            }
            this.dialog = true;
        },
        likePost() {
            this.liked = true;
            this.selectedPost.likes += 1;
            this.$store.dispatch('likedPost', true);
            for (var i = 0; i < this.listOfPosts.length; i++) {
                if (this.selectedPost.postId == this.listOfPosts[i].postId) {
                    var index = i;
                    break;
                }
            }
            this.listOfPosts[index].likedBy.push(localStorage.getItem('loggedUser'));
            this.$apollo.mutate({
                mutation: require('../graphql/likePost.gql'),
                variables: {
                    postId   : this.selectedPost.postId,
                    username : localStorage.getItem('loggedUser')
                }
            })
        },
        dislikePost() {
            this.disliked = true;
            this.selectedPost.dislikes += 1
            this.$store.dispatch('dislikedPost', true);
            for (var i = 0; i < this.listOfPosts.length; i++) {
                if (this.selectedPost.postId == this.listOfPosts[i].postId) {
                    var index = i;
                    break;
                }
            }
            this.listOfPosts[index].dislikedBy.push(localStorage.getItem('loggedUser'));
            this.$apollo.mutate({
                mutation: require('../graphql/dislikePost.gql'),
                variables: {
                    postId: this.selectedPost.postId,
                    username : localStorage.getItem('loggedUser')
                }
            })
        },
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
        margin-left: 600px;
        margin-top: 0px;
    }
    .profileCard {
        width: 700px;
        margin-left: 600px;
        height: 300px;
    }
</style>