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
    $('#submit').click(register);
  }

  function register(){
    var fName = $('#first_name').val();
    var lName = $('#last_name').val();
    var city = $('#city').val();
    var state = $('#state').val();
    var email = $('#email').val();
    var password = $('#password').val();

    var userData = {
      fName : fName,
      lName : lName,
      city : city,
      state : state,
    };

    var updates = {};
    console.log('here')
    firebase.auth().createUserWithEmailAndPassword(email,password)
      .then(function(user){
        firebase.storage().ref().child("images/users/"+user.uid).put($(".photo")[0].files[0])
          .then(function(snapshot){
            updates['/User/' + user.uid] = userData;
            return firebase.database().ref().update(updates)
              .then(function(){
                window.location.replace('./profile.html?name='+user.uid);
              });
          });
      });

  }

})();
