(function(){
  $( document ).ready(init);

  var config = {
     apiKey: "AIzaSyAL2tqXh9qWdlKKq1rQfmeaDB5AFZO9_wI",
     authDomain: "lineage-fb03b.firebaseapp.com",
     databaseURL: "https://lineage-fb03b.firebaseio.com",
     storageBucket: "lineage-fb03b.appspot.com",
     messagingSenderId: "476629507898"
   };

  function init() {
    firebase.initializeApp(config);
    $('.datepicker').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15, // Creates a dropdown of 15 years to control year
    });
    addFamiliesToForm()
  }

  function addFamiliesToForm() {
    // for each family a user has, add a check box for that family.
  }

})();
