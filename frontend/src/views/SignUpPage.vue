<template>
  <v-content>
    <v-container
      fluid
      fill-height
    >
      <v-layout
        align-center
        justify-center
      >
        <v-flex
          xs12
          sm8
          md4
        >
          <v-card class="elevation-12" style="margin-left: 650px; width: 500px; margin-top: 100px;">
            <v-toolbar 
              style="background-color: teal;" 
            >
              <v-toolbar-title style="font-family: sans; color: white;">SignUp to MyBook</v-toolbar-title>
              <v-spacer />
            </v-toolbar>
            <v-card-text>
              <v-form 
                ref="form"
                v-model="valid"
                lazy-validation
              >
                <v-container>
                    <v-text-field                    
                    v-model="credentials.name"
                    prepend-icon="person" 
                    :counter="70"
                    label="Your Name"
                    :rules="rules.username"
                    maxlength="70"
                    required
                  />
                  <v-text-field                    
                    v-model="credentials.username"
                    prepend-icon="person" 
                    :counter="70"
                    label="Username"
                    :rules="rules.username"
                    maxlength="70"
                    required
                  />
                  <v-text-field                    
                    v-model="credentials.email"
                    prepend-icon="mail" 
                    :counter="70"
                    label="Email"
                    maxlength="70"
                    required
                  />
                  <v-text-field
                    v-model="credentials.password"
                    prepend-icon="lock" 
                    type="password"
                    :counter="20"
                    label="Password"
                    :rules="rules.password"
                    maxlength="20"
                    required
                  />
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                dark
                v-on:click="signup"
              >
                Signup
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import router from '../router';

export default {
    name: 'Auth',
    data: () => ({
        credentials: {},
        valid:true,
        loading:false,
        rules: {
          username: [
            v => !!v || "Username is required",
            v => (v && v.length > 3) || "A username must be more than 3 characters long",
            v => /^[a-z0-9_]+$/.test(v) || "A username can only contain letters and digits"
          ],
          password: [
            v => !!v || "Password is required",
            v => (v && v.length > 7) || "The password must be longer than 7 characters"
          ]
        }
    }),
    methods: {
        signup() {
              this.loading = true;
              this.$apollo.mutate({
                  mutation  : require('../graphql/newUser.gql'),
                  variables : {
                      name    : this.credentials.name,
                      username: this.credentials.username,
                      email   : this.credentials.email,
                      password: this.credentials.password
                  }
              }).then((res) => {
                  sessionStorage.setItem('username', res.data.addUser.username);
                  router.push('/login');
              })
          
        }
    }
}
</script>