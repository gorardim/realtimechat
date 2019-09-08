Vue.use(Vuefire)
const config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "m",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

/* global Vue, firebase */
var firebaseApp = firebase.initializeApp(config)
const db = firebaseApp.firestore()
db.settings({ timestampsInSnapshots: true })
// child Component
Vue.component('messagecomponent', {
  template: "<div class='panel-body'><ul class='chat'><li class='left clearfix'> <span class='chat-img pull-left'> <img :src='adminAvater' alt='Admin' class='img-circle' height='50px'/> </span> <div class='chat-body clearfix'> <div class='header'> <strong class='primary-font'>Admin</strong> </div><p>Hello there, What's your query?</p></div></li></ul><ul class='chat' v-for='msg in messages'><li :key='msg.id' class='right clearfix' v-if='userid === msg.senderID'> <span class='chat-img pull-right'> <img :src='userphoto' :alt='username' class='img-circle' height='50px'/> </span> <div class='chat-body clearfix'> <div class='header sender-header'> <strong class='pull-right primary-font'>{{username}}</strong></div><p class='sender-msg'>{{msg.msg}}</p></div></li><li v-else class='left clearfix'> <span class='chat-img pull-left'> <img :src='adminAvater' alt='Admin' class='img-circle' height='50px'/> </span> <div class='chat-body clearfix'> <div class='header'> <strong class='primary-font'>Admin</strong> </div><p>{{msg.msg}}</p></div></li></ul></div>",
  props: ['userid', 'userphoto', 'username'],
  data: function() {
    return {
      messages: [],
      adminAvater: 'https://previews.123rf.com/images/simo988/simo9881112/simo988111200024/11656822-businessman-icon.jpg'
    }
  },
  firestore () {
    var messageComObj = this
    return {
      messages: db.collection('liveChat').doc(messageComObj.userid).collection('messages').orderBy('createdAt')
    }
  }
})
// Main Component
new Vue({
  el: '#app',
  name: 'app',
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user = {
          email: user.email,
          photo: user.photoURL,
          name: user.displayName,
          uid: user.uid
        }
        this.isLogin = true
      }
    })
  },
  firestore() {
    return {
      liveChat: db.collection('liveChat')
    }
  },
  data () {
    return {
      user: {},
      test: 'hello world',
      liveChat: [],
      isLogin: false
    }
  },
  methods: {
    async googleLogin() {
      baseProvider = new firebase.auth.GoogleAuthProvider()
      await firebaseApp.auth().signInWithPopup(baseProvider).then(
        user => {
          this.user = {
            email: user.email,
            photo: user.photoURL,
            name: user.displayName,
            uid: user.uid
          }
          this.isLogin = true
          db.collection('liveChat').doc(firebaseApp.auth().currentUser.uid).set({
            userEmail: firebaseApp.auth().currentUser.email,
            userName: firebaseApp.auth().currentUser.displayName,
            userAvater: firebaseApp.auth().currentUser.photoURL,
            unread: true
          })
        },
        err => {
          alert(err.message)
        }
      )
    },
    async sendChatMsg (event) {
      const msg = event.target.msg.value
      if (msg !== '' && firebaseApp.auth().currentUser) {
        await db.collection('liveChat').doc(firebaseApp.auth().currentUser.uid).update({
          unread: true
        })
        await db.collection('liveChat').doc(this.user.uid).collection('messages').add({
          senderID: this.user.uid,
          msg: msg,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(res => {
          document.getElementById("chatMsg").reset()
        })
      } else {
        alert('Please Login First!')
      }
    },
    logOut() {
      firebaseApp
        .auth()
        .signOut()
        .then(() => {
          this.isLogin = false
        })
    }
  }
})
