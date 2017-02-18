(function(){
  $( document ).ready(init);

  var config = {
     apiKey: 'AIzaSyAL2tqXh9qWdlKKq1rQfmeaDB5AFZO9_wI',
     authDomain: 'lineage-fb03b.firebaseapp.com',
     databaseURL: 'https://lineage-fb03b.firebaseio.com',
     storageBucket: 'lineage-fb03b.appspot.com',
     messagingSenderId: '476629507898'
   };
  var userKey;

  function init () {
    firebase.initializeApp(config);
    $('.dropdown-button').dropdown();
    userKey = location.search.split('name=')[1];
    loadUserInfo();
    loadUserImage();
    loadUserLeaves();
  }

  function loadUserInfo() {

    var ref = firebase.database().ref('User/'+userKey);
    ref.once('value', function(snapshot){
      var user = snapshot.val();
      $('#user_name').append(user.fName+' '+user.lName);
    });
  }

  function loadUserImage() {

    firebase.storage().ref().child('images/users/' + userKey).getDownloadURL().then(function(url) {
     $('.clip-circle').append('<img src='+url+' style="height:56px;width:56px;">')
   }).catch(function(error) {
     console.log(error);
   });
  }

  function loadUserLeaves() {

    console.log('/User/' + userKey + '/leaves')

    var ref = firebase.database().ref().child('/User/' + userKey + '/leaves');
    ref.once('value',function(snapshot) {
      snapshot.forEach(function(child) {
        console.log(child.key + child.val())
        var ref = firebase.database().ref('Leaves/'+child.key);
        ref.once('value', function(snapshot){
          var user = snapshot.val();



          var html
          if(user.video_story) {
            html = "<div class='card medium' style='height:480px; width:640px;'>" +
                         "<div class='card-image waves-effect waves-block waves-light'>" +
                           "<img class='activator' style='background-posting:center top; width=100%; height:auto' src='"+user.media_url+"'>" +
                         "</div>" +
                         "<div class='card-content center'>"+
                           "<span class='card-title activator grey-text text-darken-4'>" + user.title +
                           "<p><em class='card-title activator'>Story Year: " + user.story_year + "</em></p>" +
                           "<div class='btn activator teal lighten-3 center'>Watch Story</div>" +
                         "</div>" +
                       "<div class='card-reveal'>" +
                         "<span class='card-title activator grey-text text-darken-4'>" + user.title + "<i class='material-icons right'>close</i></span>" +
                         "<iframe width='560' height='315' src='" + user.video_url + "?rel=0&amp;showinfo=0' frameborder='0' allowfullscreen></iframe>" +
                         "<p>" + user.desc + "</p>" +
                       "</div>" +
                     "</div>"


          } else {
           html = "<div class='card medium' style='height:480px; width:640px;'>" +
                        "<div class='card-image waves-effect waves-block waves-light'>" +
                          "<img class='activator' style='background-posting:center top; width=100%; height:auto' src='"+user.media_url+"'>" +
                        "</div>" +
                        "<div class='card-content center'>"+
                          "<span class='card-title activator grey-text text-darken-4'>" + user.title +
                          "<p><em class='card-title activator'>Story Year: " + user.story_year + "</em></p>" +
                          "<div class='btn activator teal lighten-3 center'>Read Story</div>" +
                        "</div>" +
                      "<div class='card-reveal'>" +
                        "<span class='card-title activator grey-text text-darken-4'>" + user.title + "<i class='material-icons right'>close</i></span>" +
                        "<p>" + user.desc + "</p>" +
                      "</div>" +
                    "</div>"
          }
          $('#leaves').append(html);

          // <div class="card">
          //   <div class="card-image waves-effect waves-block waves-light">
          //     <img class="activator" src="images/office.jpg">
          //   </div>
          //   <div class="card-content">
          //     <span class="card-title activator grey-text text-darken-4">Card Title<i class="material-icons right">more_vert</i></span>
          //     <p><a href="#">This is a link</a></p>
          //   </div>
          //   <div class="card-reveal">
          //     <span class="card-title grey-text text-darken-4">Card Title<i class="material-icons right">close</i></span>
          //     <p>Here is some more information about this product that is only revealed once clicked on.</p>
          //   </div>
          // </div>

        });


      });
    });



    //
    // var ref = firebase.database().ref('User/'+userKey+'/leaves');
    // ref.once('value', function(snapshot){
    //   // var user = snapshot.val();
    //   console.log(snapshot)
    //   snapshot.foreach(function(obj) {
    //       $('#leaves').append(obj.title+' '+obj.desc);
    //   });
    //
    // });

  }

})();
