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
  var familyKey;
  var mediaObjects = [];

  function init () {
    firebase.initializeApp(config);

    userKey = getParameterByName('name');
    familyKey = getParameterByName('family');

    loadTimeline()
  }

  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function loadTimeline() {

    var ref = firebase.database().ref("family/" + familyKey);
    ref.once("value")
      .then(function(snapshot) {
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


  }

  function submitStory() {

    // Get a key for a new Post.
    var newMediaKey = firebase.database().ref().child('media').push().key;

    firebase.storage().ref().child("images/media/"+newMediaKey).put($(".photo")[0].files[0])
      .then(function(){
        // Create a reference to the file we want to download
        console.log("storage:" + "images/media/"+newMediaKey)
        var starsRef = firebase.storage().ref().child("images/media/"+newMediaKey);
        // Get the download URL
        starsRef.getDownloadURL().then(function(url) {
          // Insert url into an <img> tag to "download"
          var story_title = $('#story_title').val();
          var story_year = $('#story_year').val();
          var video_link = $('#video_link').val();
          var story_desc = $('#story_desc').val();
          var video_story = false;
          if(video_link) {
            video_story = true;
          }
          // A media post entry.
          var postData = {
            created_by: userKey,
            desc: story_desc,
            media_url: url,
            title: story_title,
            story_year: story_year,
            video_url: video_link,
            video_story: video_story
          };

          // Write the new post's data simultaneously in the media list and the checked families list.
          var updates = {};
          updates['/media/' + newMediaKey] = postData;

          //foreach family checked, add to our updates arrary.
          if($("ul li.active").length > 0) {
            //Assuming we have at least one checked family to share...
            $("ul li.active").each(function() {
              //loop through every checked item and get the name.
              var selected_name = this.innerText;
              $("option").each(function() {
                //with that name, we need to determine the key for the family.
                if(selected_name == this.innerText) {
                  //with the family key, we can push the newMediaKey data into the tree.
                  var d = {}
                  d[newMediaKey] = true;
                  updates['/family/'+this.value+'/media/' +newMediaKey] = true;
                }
              });
            });
          } else {
            //find every family for this user
            $("option").each(function() {
              console.log("all families selected" + this.value)
              var d = {}
              d[newMediaKey] = true;
              updates['/family/'+this.value+'/media/' + newMediaKey] = true;
            });
          }

          return firebase.database().ref().update(updates).then(function(){location.reload();});
        })
      });
  }

  function submitFamily() {
    // Get a key for a new Post.
    var newFamilyKey = firebase.database().ref().child('family').push().key;
    var family_desc = $('#family_desc').val();
    var family_name = $('#family_name').val();
    var emails = $('#emails').val();

    var tree_url = "./imgs/trees/tree"+Math.floor((Math.random() * 13) + 1)+".svg"
    // A media post entry.
    var postData = {
      created_by: userKey,
      desc: family_desc,
      crest_url: tree_url,
      name: family_name
    };

    // Write the new post's data simultaneously in the media list and the checked families list.
    var updates = {};
    updates['/family/' + newFamilyKey] = postData;
    updates['/user/'+ userKey+'/family/'+ newFamilyKey] = true;

    //save and send emails to invite users.  Then reload the page.
    return firebase.database().ref().update(updates).then(function(){
      emailjs.send("sendgrid", "linage_invite", {"family_name":family_name,"email":emails}).then( function(response) {
        console.log("email a success", response);
        location.reload();
      },
      function(error) {
        console.log("Email failed", error);
        location.reload();
      })
    });

  }
  function renderCrests(snapshot) {
    var crest_url = snapshot.child("crest_url").val();
    var crest_name = snapshot.child("name").val();
    var crest_desc = snapshot.child("desc").val();
    var html =   "<div class='col s12 m7'>" +
      "<div class='card horizontal'>" +
        "<div class='card-image'>" +
          "<img src='" + crest_url + "' style='height:250px;padding:15px;'>" +
        "</div>" +
        "<div class='card-stacked'>" +
          "<div class='card-content'>" +
            "<h5>" + crest_name + "</h5>" +
            "<p>" + crest_desc + "</p>" +
            "<div class='valign-wrapper center' id='" + snapshot.key + "'>"  +
              "<img src='https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2017-02-04/137035326931_423613000cebd97f9715_72.png'>" +
               "<span class='thin valign' style='padding-left:10px'>and "+ Math.floor((Math.random() * 13) + 3) + " more</span>" +
            "</div>" +
          "</div>" +
          "<div class='card-action'>" +
            "<a class='btn' style='margin-right:10px' id='"+snapshot.key+"' href='#'>Invite Others</a>" +
            "<div class='btnViewStory btn' style='margin-left:10px' id='"+snapshot.key+"'>View Stories</div>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>"

    $('#familyCrests').append(html);
  }

  function renderMedia(snapshot) {
    var media = snapshot.val();
    var html
    //make sure we don't render duplicate cards if they are shared to multiple families.
    if($("#"+snapshot.key).length < 1) {
      if(media.video_story) {
        html = "<div class='card large' id='"+snapshot.key+"'>" +
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
       html = "<div class='card large' id='"+snapshot.key+"'>" +
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
  }

  function viewStory() {

    this.id
  }

})();
