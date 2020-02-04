<template>
<div>
  <!-- <v-app id="app"> -->
    <v-toolbar
    style="background-color: #00acee;font-family: monospace;"
    dark
    app 
    fixed
    >
    <v-btn text v-on:click="goHome()"><v-toolbar-title>FaceGram</v-toolbar-title></v-btn>
    <v-btn text style="width: 100px; margin-left: 13px;" v-on:click="listAllUsers()">Search user</v-btn>
    <v-spacer></v-spacer>

    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn text v-on:click="newpost()">
        New Post
      </v-btn>
      <v-divider
        inset
        vertical
      ></v-divider>

      <v-btn text v-on:click="notify()">
        Notifications <v-icon small v-if="newNotification">mdi-bell-ring</v-icon>
      </v-btn>

      <v-divider
        inset
        vertical
      ></v-divider>

      <v-btn text v-on:click="signUp()">
        Sign Up
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
  <v-content>
   <v-dialog v-model="dialog" id="dialog" max-width="240px" style="font-family: sans;">
     <v-btn icon @click="dialog = false"><v-icon>mdi-close-circle</v-icon></v-btn>
     <v-text-field style="width: 170px; margin-top: -10px; margin-left: 15px;" v-on:keyup="searchUser()"
        label="Search..." v-model="requestedUser" v-on:click="listAllUsers()">
      </v-text-field>
       <v-card style="height: 300px; margin-top: -19px;">
          <v-list>
            <v-btn v-on:click="goToProfile(user)" text v-for="user in listOfUsers" :key="user.name" class="userButton"><v-list-item>{{ user.name }}</v-list-item> </v-btn>
          </v-list>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialog2" id="dialog" style="font-family: monospace;" max-width="750px">
      <v-card style="height: 300px;">
        <v-btn icon @click="dialog2 = false"><v-icon>mdi-close-circle</v-icon></v-btn>
        <v-divider />
        <v-list v-for="(notification, index) in listOfNotifications" :key="notification.requestId">
          <v-card v-if="!notification.done" style="margin-left: 15px;margin-bottom: 6px; background-color:#00acee; width: 719px; height: 50px;">
            <v-list-item>
              <div style="width: 600px;"><pre><b v-on:click="goToProfile(notification.fromUserObj)" id="notification">{{ notification.fromUserObj.name }}</b> wishes to be Your Friend</pre></div>
              <v-btn v-on:click="acceptRequest(index)" :loading="acceptLoading" style="background-color: #29f089;height: 35px; margin-right: 10px;margin-left: 40px" text><v-icon small>mdi-account-check</v-icon> Accept</v-btn>
              <v-btn v-on:click="clearRequest(index)" style="background-color: #ed4c07;height: 35px;" text><v-icon small>mdi-delete</v-icon> Done</v-btn>
            </v-list-item>
          </v-card>
        </v-list>
      </v-card>
    </v-dialog>
  </v-content>
      <router-view />
      <v-footer
        padless
        style="margin-top: 340px;"
      >
    <v-card
      flat
      tile
      style="background-color: #00acee; width: 10000px;"
      class="indigo lighten-1 white--text text-center"
    >
      <v-card-text style="margin-left: 480px;">
        <v-btn
          v-for="icon in icons"
          :key="icon"
          v-on:click="linkToMe(icon)"
          class="mx-4 white--text"
          style="margin-left: 120px;"
          icon
        >
          <v-icon size="34px">{{ icon }}</v-icon>
        </v-btn>
      </v-card-text>

      <v-card-text class="white--text pt-0" style="font-family: sans; font-size: 15px; margin-top: -20px;">
        <center>This Website Was Created By Kshitiz Jain. To know more about this project refer to Github.</center>
      </v-card-text>

      <v-divider></v-divider>
    </v-card>
  </v-footer>
  <!-- </v-app> -->
</div>
</template>

<script>
import router from './router';

export default {
  data: () => ({
    listOfUsers: {},
    dialog: false,
    dialog2: false,
    users: [],
    requestedUser: "",
    listOfNotifications: [],
    acceptLoading: false,
    newNotification: false,
    icons: [
        'mdi-facebook',
        'mdi-twitter',
        'mdi-google-plus',
        'mdi-github-circle',
        'mdi-instagram',
      ],
  }),
  apollo: {
   $subscribe: {
     newNotification: {
       query: require('./graphql/getNotifications.gql'),
       variables: {
         username: localStorage.getItem('loggedUser'),
       },
       result (data) {
         this.listOfNotifications.push(data.data.FriendRequestNotification);
       },
     },
   },
 },
  async created() {
    this.$apollo.query({
        query: require('./graphql/getInitialNotifications.gql'),
        variables: {
          username: localStorage.getItem('loggedUser'),
        },
      }).then(res => {
        this.listOfNotifications = res.data.getNotifications;
      })
    this.$apollo.query({
      query: require('./graphql/allUsers.gql'),
    }).then(res => {
      this.listOfUsers = res.data.allUsers;
    })
  },
  methods: {
    async notify() {
      this.dialog2 = true;
    },
    async getNotifications() {
      this.$apollo.query({
        query: require('./graphql/getInitialNotifications.gql'),
        variables: {
          username: localStorage.getItem('loggedUser'),
        },
      }).then(res => {
        this.listOfNotifications = res.data.getNotifications;
      })
    },
    updated() {
      for (var i = 0; i < this.listOfNotifications.length; i++) {
        if (this.listOfNotifications[i].done == false) {
          this.newNotification = true;
          break;
        }
      }
    },
    logout() {
      localStorage.removeItem('apollo-token');
      localStorage.removeItem('loggedUser');
      router.push('/');
      location.reload();
    },
    newpost() {
      router.push('/newpost');
    },
    signUp() {
      router.push('/signup');
    },
    myProfile() {
      router.push('/myprofile')
    },
    goHome() {
      router.push('/');
    },
    searchUser() {
      var Number = this.listOfUsers.length;
      var x = document.getElementsByClassName('userButton'); 
      for (var i = 0; i < Number; i++) {
          if (!x[i].innerHTML.toLowerCase().includes(this.requestedUser.toLowerCase())) {
              x[i].style.display = "none";
          }
          else { 
              x[i].style.display="inline";                  
          }
      }
    },
    linkToMe(icon) {
      switch(icon) {
        case "mdi-instagram":
          window.open('https://www.instagram.com/_ishu1201_/');
          break;
        case "mdi-facebook":
          window.open('https://www.facebook.com/h.potter.357');
          break;
        case "mdi-twitter":
          window.open('https://twitter.com/ishu35602253');
          break;
        case "mdi-google-plus":
          window.open('https://aboutme.google.com/u/0/?referer=gplus');
          break;
        default:
          window.open('https://github.com/cauldronpumpkin/Social-Media-Web-App');
      }
    },
    listAllUsers() {
      this.dialog = true;
    },
    goToProfile(user) {
      sessionStorage.setItem('reqUser', user.username);
      if (this.$route.path == '/profile') {
        this.dialog = false;
        this.dialog2 = false;
        location.reload();
      }
      else {
        this.dialog = false;
        this.dialog2 = false;
        router.push('/profile');
      }
    },
    async acceptRequest(index) {
      this.acceptLoading = true;
      let res = await this.$apollo.mutate({
        mutation: require('./graphql/requestDone.gql'),
        variables: {
          requestId: this.listOfNotifications[index].requestId
        }
      })
      console.log(res);
      this.listOfNotifications[index].done = true;
      this.$apollo.mutate({
        mutation: require('./graphql/makeFriends.gql'),
        variables: {
          userOne    : localStorage.getItem('loggedUser'),
          userSecond : this.listOfNotifications[index].fromUser
        }
      }).then(() => {
        this.dialog2 = false;
        this.acceptLoading = false;
      })
      
    },
    clearRequest(index) {
      this.$apollo.mutate({
        mutation: require('./graphql/requestDone.gql'),
        variables: {
          requestId: this.listOfNotifications[index].requestId
        }
      }).then(() => {
        this.listOfNotifications[index].done = true;
      })
    }
  }
}
</script>

<style>
  #dialog {
    display: unset;
  }
  #notification {
    cursor: pointer;
  }
  #notification :hover {
    font-style: italic;
  }
</style>
