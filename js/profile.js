(function(){
  $( document ).ready(init);

  var config = {
     apiKey: "AIzaSyAL2tqXh9qWdlKKq1rQfmeaDB5AFZO9_wI",
     authDomain: "lineage-fb03b.firebaseapp.com",
     databaseURL: "https://lineage-fb03b.firebaseio.com",
     storageBucket: "lineage-fb03b.appspot.com",
     messagingSenderId: "476629507898"
   };

  function init () {
    firebase.initializeApp(config);
    $(".dropdown-button").dropdown();
    loadUserInfo();
    loadUserImage();
  }

  function loadUserInfo() {
    var userKey = location.search.split('name=')[1];
    var ref = firebase.database().ref('User/'+userKey);
    ref.once('value', function(snapshot){
      var user = snapshot.val();
      $('.card-image').append("<img src"++">")
    });
  }

  function loadUserImage() {
    var userKey = location.search.split('name=')[1];

    firebase.storage().ref().child("images/users/" + userKey).getDownloadURL().then(function(url) {
     $('.card-image').append("<img src"+url+">")
   }).catch(function(error) {
     console.log(error);
   });
  }

})();
