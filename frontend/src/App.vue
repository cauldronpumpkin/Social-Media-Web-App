<template>
<div>
  <!-- <v-app id="app"> -->
    <v-toolbar
    style="background-color: #00acee;"
    dark
  >
    <v-toolbar-title style="font-family: monospace;">MyBook</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn text v-on:click="newpost()">
        New Post
      </v-btn>

      <v-divider
        inset
        vertical
      ></v-divider>

      <v-btn text>
        Blog
      </v-btn>

      <v-divider
        inset
        vertical
      ></v-divider>

      <v-btn text v-on:click="myProfile()">
        My Profile
      </v-btn>

      <v-divider
        inset
        vertical
      ></v-divider>
    </v-toolbar-items>
    <v-btn icon large v-on:click="logout()"><v-icon>mdi-export</v-icon></v-btn>
  </v-toolbar>
  <router-view />
  <!-- </v-app> -->
</div>
</template>

<script>
import router from './router';

export default {
  data: () => ({

  }),
  methods: {
    logout() {
      localStorage.removeItem('apollo-token');
      localStorage.removeItem('loggedUser');
      localStorage.removeItem('likedPosts');
      localStorage.removeItem('dislikedPosts');
      router.push('/')
    },
    newpost() {
      router.push('/newpost');
    },
    myProfile() {
      router.push('/myprofile')
    }
  }
}
</script>

<style>
  
</style>
