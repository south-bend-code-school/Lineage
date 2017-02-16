(function(){
  $( document ).ready(init);

  var config = {
     apiKey: "AIzaSyAL2tqXh9qWdlKKq1rQfmeaDB5AFZO9_wI",
     authDomain: "lineage-fb03b.firebaseapp.com",
     databaseURL: "https://lineage-fb03b.firebaseio.com",
     storageBucket: "lineage-fb03b.appspot.com",
     messagingSenderId: "476629507898"
   };

  var unsubscribe;

  function init () {
    firebase.initializeApp(config);
    $('select').material_select();

    $('.modal').modal();
    $('#login').click(checkLogin);

    $('#loginBtn').click(login)
    $('#registerBtn').click(register);

  }

  function checkLogin() {
    // var user = firebase.auth().currentUser;
    // if(user) {
    //   window.location.replace('./profile.html?name='+user.uid);
    // } else {
    //
    unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          window.location.replace('./profile.html?name='+user.uid);
        } else {
          console.log('user logged out');
          $('#modalLogin').modal('open');
        }
      });

  }

  function login() {
    var email = $('#email').val()
    var password = $('#password').val()

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      console.log('sign in error' + errorMessage);

      $('#password').addClass('valid')
      $('#email').addClass('valid')

      if (errorCode === 'auth/wrong-password') {
        $('#password').removeClass('valid')
        $('#password').addClass('invalid')
        $('#pwd_label').attr('data-error', errorMessage);
      } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/user-disabled' || errorCode === 'auth/invalid-email') {
        $('#email').removeClass('valid')
        $('#email').addClass('invalid')
        $('#email_label').attr('data-error', errorMessage);
      } else {
        alert(errorMessage);
      }

    });
  }

  function register(){

    if(unsubscribe) {
      unsubscribe();
    }

    var fName = $('#first_name').val();
    var lName = $('#last_name').val();
    var city = $('#city').val();
    var state = $('#state').val();
    var email = $('#email_r').val();
    var password = $('#password_r').val();

    var userData = {
      fName : fName,
      lName : lName,
      city : city,
      state : state,
    };

    var updates = {};
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
