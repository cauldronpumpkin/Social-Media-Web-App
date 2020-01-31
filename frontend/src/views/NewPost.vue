<template>
  <div class="about">
    <v-card class="postCard">
      <v-card-title> Make a New Post</v-card-title>
      <center>
        <img id="uploadPreview" style="width: 0px; height: 0px;" /> <br><br>
        <input type="file" id="uploadImage" @change="changeFile()"> <br><br><br>
        <v-text-field
          class="captionField"
          outlined
          label="Caption"
          v-model="caption"
        ></v-text-field>
        </center>
        <v-btn dark style="margin-left: 500px; width: 100px; font-size: 15px;" :loading="loading" v-on:click="addPost()">
          Post
        </v-btn> <br><br><br>
    </v-card>
  </div>
</template>

<script>
import fire from '../firebase/index';
import router from '../router';

export default {
  data: () => ({
    file: null,
    percent: 0,
    loading: false,
    caption: "",
    path: "",
    numberOfPosts: null
  }),
  created() {
    if(!localStorage.getItem('apollo-token')) {
      router.push('/login');
    }
  },
  mounted() {
    this.$apollo.query({
      query: require('../graphql/getUser.gql'),
      variables: {
        username: localStorage.getItem('loggedUser')
      }
    }).then(res => {
      this.numberOfPosts = res.data.user.numberOfPosts;
    })
  },

  methods: {
    changeFile() {
      this.file = event.target.files[0];
      var img = new Image();
      img.src = window.URL.createObjectURL(this.file);
      img.onload = function() {
        document.getElementById("uploadPreview").style.width = `${this.naturalWidth/2}px`;
        document.getElementById("uploadPreview").style.height = `${this.naturalHeight/2}px`;

      };
      var loggedUser = localStorage.getItem('loggedUser');
      this.path = 'posts/' + loggedUser + '-' + this.numberOfPosts + '.jpg'; 
      var oFReader = new FileReader();
      oFReader.readAsDataURL(this.file);
      oFReader.onload = function (oFREvent) {
          document.getElementById("uploadPreview").src = oFREvent.target.result;
      };
    },
    async uploadFile() {
      this.loading = true;
      await fire.ref(this.path).put(this.file);
    },
    async addPost() {
      await this.uploadFile();
      this.$apollo.mutate({
          mutation: require('../graphql/addPost.gql'),
          variables: {
            username : localStorage.getItem('loggedUser'),
            caption  : this.caption,
            link     : this.path
          }
        }).then(() => {
          this.loading = false;
          location.reload();
        })
      }
  }
}
</script>

<style scoped>
  .postCard {
    margin-top: 10px;
    margin-left: 450px;
    width: 1100px;
    font-family: sans;
  }
  .captionField {
    width: 1000px;
  }
</style>
