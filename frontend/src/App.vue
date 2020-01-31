<template>
<div>
  <!-- <v-app id="app"> -->
    <v-toolbar
    style="background-color: teal;"
    dark
  >
    <v-toolbar-title style="font-family: monospace;">MyBook</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn text>
        News
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

      <v-btn text>
        Music
      </v-btn>

      <v-divider
        inset
        vertical
      ></v-divider>
    </v-toolbar-items>
    <v-app-bar-nav-icon></v-app-bar-nav-icon>
  </v-toolbar>
  <router-view />
  <!-- </v-app> -->
</div>
</template>

<style>
  
</style>
