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
  var mediaObjects = [];

  function init () {
    firebase.initializeApp(config);
    $('.dropdown-button').dropdown();
    userKey = location.search.split('name=')[1];
    // loadUserInfo();
    loadUserImage();
    loadTimeline();
  }

  // function loadUserInfo() {
  //
  //   var ref = firebase.database().ref('user/'+userKey);
  //   ref.once('value', function(snapshot){
  //     var user = snapshot.val();
  //     $('#user_name').append(user.fName+' '+user.lName);
  //   });
  // }

  function loadUserImage() {
    firebase.storage().ref().child('images/users/' + userKey).getDownloadURL().then(function(url) {
     $('.clip-circle').append('<img src='+url+' style="height:56px;width:56px;">')
   }).catch(function(error) {
     console.log(error);
   });
  }

  function loadTimeline() {

    var ref = firebase.database().ref("user/" + userKey);
    ref.once("value")
      .then(function(snapshot) {
        // console.log(snapshot.val());

        //add the name of the logged in user to the site
        $('#user_name').append(snapshot.child("fName").val()+' '+snapshot.child("lName").val());

        //load the timeline
        snapshot.child("family").forEach(function(familySnapshot) {
          // console.log(familySnapshot.key);
          var ref = firebase.database().ref("family/" + familySnapshot.key);
          // console.log("family/" + familySnapshot.key)
          ref.once("value")
            .then(function(snapshot) {

              //Update the Family Tab to show each family crest that I belong to.
              renderCrests(snapshot);

              //loop through all media that is tagged for this crest and add it to our timeline
              snapshot.child("media").forEach(function(mediaSnapshot){
                // console.log(mediaSnapshot.key);
                var ref = firebase.database().ref("media/"+mediaSnapshot.key);
                ref.once("value")
                  .then(function(snapshot) {
                    renderMedia(snapshot);
                  })
              })

            });

        });
      });
  }

  function renderCrests(snapshot) {
    var crest_url = snapshot.child("crest_url").val();
    var crest_name = snapshot.child("name").val();
    var crest_desc = snapshot.child("desc").val();
    var html =   "<div class='col s12 m7'>" +
      "<div class='card horizontal'>" +
        "<div class='card-image'>" +
          "<img src='" + crest_url + "'>" +
        "</div>" +
        "<div class='card-stacked'>" +
          "<div class='card-content'>" +
            "<h5>" + crest_name + "</h5>" +
            "<p>" + crest_desc + "</p>" +
            "<div id='" + snapshot.key + "'></div>" +
          "</div>" +
          "<div class='card-action'>" +
            "<a href='#'>Invite Others</a>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>"

    $('#familyCrests').append(html);
  }

  function renderMedia(snapshot) {
    var media = snapshot.val();
    var html
    if(media.video_story) {
      html = "<div class='card large'>" +
                   "<div class='card-image waves-effect waves-block waves-light'>" +
                     "<img class='activator' style='background-posting:center top; width=100%; height:auto' src='"+media.media_url+"'>" +
                   "</div>" +

                   "<div class='card-content center'>"+
                     "<span class='card-title activator grey-text text-darken-4'>" + media.title +
                     "<p><em class='card-title activator'>Story Year: " + media.story_year + "</em></p>" +
                     "<div class='btn activator teal lighten-3 center'>Watch Story</div>" +
                   "</div>" +
                 "<div class='card-reveal'>" +
                   "<span class='card-title activator grey-text text-darken-4'>" + media.title + "<i class='material-icons right'>close</i></span>" +
                   "<iframe width='560' height='315' src='" + media.video_url + "?rel=0&amp;showinfo=0' frameborder='0' allowfullscreen></iframe>" +
                   "<p>" + media.desc + "</p>" +
                 "</div>" +
               "</div>"


    } else {
     html = "<div class='card large'>" +
                  "<div class='card-image waves-effect waves-block waves-light'>" +
                    "<img class='activator' style='background-posting:center top; width=100%; height:auto' src='"+media.media_url+"'>" +
                  "</div>" +
                  "<div class='card-content center'>"+
                    "<span class='card-title activator grey-text text-darken-4'>" + media.title +
                    "<p><em class='card-title activator'>Story Year: " + media.story_year + "</em></p>" +
                    "<div class='btn activator teal lighten-3 center'>Read Story</div>" +
                  "</div>" +
                "<div class='card-reveal'>" +
                  "<span class='card-title activator grey-text text-darken-4'>" + media.title + "<i class='material-icons right'>close</i></span>" +
                  "<p>" + media.desc + "</p>" +
                "</div>" +
              "</div>"
    }
    $('#timelineMedia').append(html);
  }

})();
