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
    $('select').material_select();
  }

  function register(){
    
  }

})();
