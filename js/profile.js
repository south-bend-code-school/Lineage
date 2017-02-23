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
    $('.collapsible').collapsible();
    $('.modal').modal();
    $('#submitStory').click(submitStory);
    $('#submitFamily').click(submitFamily);



    userKey = location.search.split('name=')[1];

    //loadUserImage();
    loadTimeline()
    setTimeout(function() {$('select').material_select();$('.btnViewStory').click(viewStory);}, 2000);
  }

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

              //Update the dropdown box with all our families for our modalNewStory
              var html =   "<option value='" + familySnapshot.key + "'>" + snapshot.child("name").val() + "</option>"

              $('#newStoryFamilyDropDown').append(html)

              //loop through all media that is tagged for this crest and add it to our timeline
              snapshot.child("media").forEach(function(mediaSnapshot){
                // console.log(mediaSnapshot.key);
                var ref = firebase.database().ref("media/"+mediaSnapshot.key);
                ref.once("value")
                  .then(function(snapshot) {
                    renderMedia(snapshot);
                    renderVault(snapshot);
                  })
              })

            });

        });
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
        html = "<div class='row col l6 m6 s12'>" +
                  "<div class='card large' id='"+snapshot.key+"'>" +
                     "<div class='card-image waves-effect waves-block waves-light' style='height:220px !important;'>" +
                       "<img class='activator' style='background-posting:center top; width=100%; height:auto' src='"+media.media_url+"'>" +
                       "<span class='card-title'>" + media.story_year +"</span>" +
                     "</div>" +
                     "<div class='card-content center'>"+
                       "<div class='card-title activator grey-text text-darken-4'>" + media.title + "</div>" +
                       "<div class='btn activator teal lighten-3 center'>Watch Story</div>" +
                       "<div class='switch' style='padding-top:10px;'><label><input type='checkbox'><span class='lever'></span>Vault</label></div>" +
                     "</div>" +
                   "<div class='card-reveal'>" +
                     "<span class='card-title activator grey-text text-darken-4 flow-text'>" + media.title + "<i class='material-icons right'>close</i></span>" +
                     "<iframe width='560' height='315' src='" + media.video_url + "?rel=0&amp;showinfo=0' frameborder='0' allowfullscreen></iframe>" +
                     "<p>" + media.desc + "</p>" +
                   "</div>" +
                 "</div>" + "</div>"


      } else {
       html = "<div class='col l6 m6 s12 row'>" + "<div class='card large' id='"+snapshot.key+"'>" +
                    "<div class='card-image waves-effect waves-block waves-light' style='height:220px !important;'>" +
                      "<img class='activator' style='background-posting:center top; background-size: cover;' src='"+media.media_url+"'>" +
                      "<span class='card-title'>" + media.story_year +"</span>" +
                    "</div>" +
                    "<div class='card-content center'>"+
                      "<div class='card-title activator grey-text text-darken-4'>" + media.title + "</div>" +
                      "<div class='btn activator teal lighten-3 center'>Read Story</div>" +
                      "<div class='switch' style='padding-top:10px;'><label><input type='checkbox'><span class='lever'></span>Vault</label></div>" +
                    "</div>" +
                  "<div class='card-reveal'>" +
                    "<span class='card-title activator grey-text text-darken-4'>" + media.title + "<i class='material-icons right'>close</i></span>" +
                    "<p>" + media.desc + "</p>" +
                  "</div>" +
                "</div>"  + "</div>"
      }
      $('#timelineMedia').append(html);
    }
  }

  function renderVault(snapshot) {
    var media = snapshot.val();
    html =
    '<li>'+
      '<div class="collapsible-header"><i class="material-icons">view_module</i>'+media.title+'<i class="material-icons right">mode_edit</i><i class="material-icons right">delete</i></div>'+
      '<div class="collapsible-body center"><span>'+ media.desc+'</span><img class="materialboxed" style="margin-left:25%;padding:5px;" width=50% src="'+media.media_url+'"></div>'+
    '</li>'
    $('.materialboxed').materialbox();
    $('#vaultmedia').append(html);
  }

  function viewStory() {
    window.location.replace('./family.html?name='+userKey+'&family='+this.id);
  }

})();
