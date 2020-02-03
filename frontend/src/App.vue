<template>
<div>
  <!-- <v-app id="app"> -->
    <v-toolbar
    style="background-color: #00acee;font-family: monospace;"
    dark
  >
    <v-btn text v-on:click="goHome()"><v-toolbar-title>MyBook</v-toolbar-title></v-btn>
    <v-btn text style="width: 100px; margin-left: 13px;" v-on:click="listAllUsers()">Search user</v-btn>
    <!-- <v-btn icon v-on:click="goToProfile()"> <v-icon> mdi-arrow-right-circle </v-icon></v-btn> -->
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
   <v-dialog v-model="dialog" id="dialog" max-width="200px" style="font-family: sans;">
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

    <v-dialog v-model="dialog2" id="dialog" style="font-family: monospace;" max-width="690px">
      <v-card style="height: 300px;">
        <v-btn icon @click="dialog2 = false"><v-icon>mdi-close-circle</v-icon></v-btn>
        <v-divider />
        <v-list v-for="(notification, index) in listOfNotifications" :key="notification.requestId">
          <v-card v-if="!notification.done" style="margin-left: 15px;margin-bottom: 6px; background-color:#00acee; width: 420px; height: 50px;">
            <v-list-item>
              <pre><b v-on:click="goToProfile(notification.fromUserObj)" id="notification">{{ notification.fromUserObj.name }}</b> wishes to be Your Friend      </pre>
              <v-btn v-on:click="acceptRequest(index)" :loading="acceptLoading" style="background-color: #29f089;height: 50px; margin-left: 12px" text><v-icon small>mdi-account-check</v-icon> Accept</v-btn>
              <v-btn v-on:click="clearRequest(index)" style="background-color: #ed4c07;height: 50px;margin-left: 10px;" text><v-icon small>mdi-delete</v-icon> Done</v-btn>
            </v-list-item>
          </v-card>
        </v-list>
      </v-card>
    </v-dialog>
  <router-view />
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
    listOfNotifications: {},
    acceptLoading: false,
    newNotification: false
  }),
  apollo: {
   $subscribe: {
     online_users: {
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
      router.push('/')
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
