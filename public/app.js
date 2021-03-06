// Initialize Firebase
var config = {
  apiKey: "AIzaSyDnP2bb-xcGSZnObJ6oYqizAC0VIB2g7Nk",
  authDomain: "raise-your-issues.firebaseapp.com",
  databaseURL: "https://raise-your-issues.firebaseio.com",
  storageBucket: "raise-your-issues.appspot.com",
  messagingSenderId: "429655373927"
};
firebase.initializeApp(config);

// connect to your Firebase application using your reference URL
var database = firebase.database()




//Compile elements using handlebars
  var source = $('#articleItemTemplate').html();
  var articleItemTemplate = Handlebars.compile(source);

  var popupsource = $('#popUpTemplate').html();
  var popUpTemplate = Handlebars.compile(popupsource);

  var postersource = $('#posterTemplate').html();
  var posterTemplate = Handlebars.compile(postersource);

  var photosource = $('#photoTemplate').html();
  var photoTemplate = Handlebars.compile(photosource);






// ----------------------------------------------------------------------------

$(document).ready(function () {

  //initialize 500px
  _500px.init({
    sdk_key: 'e5b8b1fd9d9a3a4802f16cc420af6cf45a8591cf'
  });

  get500Photos();




  // /////////////////////////////////////////////////////////////////////////////
  // -------------------------------FROM PEOPLE-------------------------------


  $('#message-form').submit(function (event) {
    // by default a form submit reloads the DOM which will subsequently reload all our JS
    // to avoid this we preventDefault()
    event.preventDefault()

    // grab user message input
    var message = $('#message').val()

    // clear message input (for UX purposes)
    $('#message').val('')

    // create a section for messages data in your db
    var messagesReference = database.ref('messages');
    var posterColor = $('.poster-color-input').val() // grab user color input

    // use the set method to save data to the messages
    messagesReference.push({
      message: message,
      posterColor: posterColor,
      votes: 0
    })

    // clear color input (for UX purposes)
    $('.poster-color-input').val('');
  })

  // // on initialization of app (when document is ready) get messages
  getPosterMessages();


  $('.grid').isotope({
    // options
    itemSelector: '.from-people',
    layoutMode: 'fitRows'
  });




  // /////////////////////////////////////////////////////////////////////////////
  // -------------------------------FROM THE MEDIA-------------------------------


  //global variable to have value set in and accessed outside get api request
  var jsonresponse;

  var feedItems;

  var newyorktimesUrl = 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Frss.nytimes.com%2Fservices%2Fxml%2Frss%2Fnyt%2FPolitics.xml'
  var cnnUrl = 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Frss.cnn.com%2Frss%2Fcnn_allpolitics.rss'
  var breitbartUrl = 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.feedburner.com%2Fbreitbart';
  var foxUrl = 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.foxnews.com%2Ffoxnews%2Fpolitics';



  //ajax code for if error
  $.ajax({
      url: "https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.foxnews.com%2Ffoxnews%2Fpolitics",

      data: {
          format: "json"
      },

      success: function() {
          console.log("success");
      },

      error: function(){
          alert("Problem loading feed!")
      }
  })




  //load with new feed
  function loadFeed(feedUrl){

    //add loader when getting data
    $('#popUp').removeClass('hidden');

    $.get(feedUrl, function(r){

    feedItems = r.items

    console.log("loadFeed called")


  //handlebars repopulating
  for (var i = 0; i < 10; i++) {

        var itemContent = {i: i, imageurl: feedItems[i].thumbnail, title: feedItems[i].title}
        var html = articleItemTemplate(itemContent)

        $("#main").append(html)
  }


  //remove loader when get data
  $('#popUp').addClass('hidden');


  //open popUp on click
    $('#main article').click(function(e){
      console.log("test")

      //open popUp
      $('#popUp').removeClass('hidden');

      //set popUp contents
      var i = $(e.currentTarget).data('i')
      var popupContent = {title: feedItems[i].title, description: feedItems[i].description, link: feedItems[i].link}

      //remove loader when get data
      $('#popUp').removeClass('loader');

      //populate template
      var html = popUpTemplate(popupContent)
      $('#popUp').html(html)

      //close popUp
      $('.closePopUp').click(function(){
        $('#popUp').addClass('hidden');
        console.log("x clicked")
      })
    })


  })
}



  //to call loadFeed with selected source
  $('.headline-feed').on('click',function(e){
    $('#main').empty()
    loadFeed($(e.currentTarget).data('feed-url'))
    console.log("dropdown-feed clicked")

    console.log(($(e.currentTarget).data('feed-url')))

    var $selectedFeed = ($(e.currentTarget).data('feed-url'))

    console.log("the selection feed is " + $selectedFeed);

    function clearColorClass(){
      $('#main').removeClass('nytimes-color');
      $('#main').removeClass('cnn-color');
      $('#main').removeClass('fox-color');
      $('#main').removeClass('breitbart-color');
    }

    if ($selectedFeed === newyorktimesUrl){
      clearColorClass();
      $('#main').addClass('nytimes-color');
      console.log("nytimes clicked")

    } else if ($selectedFeed === cnnUrl){
      clearColorClass();
      $('#main').addClass('cnn-color');
      console.log("cnn clicked")

    } else if ($selectedFeed === foxUrl){
      clearColorClass();
      $('#main').addClass('fox-color');
      console.log("fox clicked")

    } else if ($selectedFeed === breitbartUrl){
      clearColorClass();
      $('#main').addClass('breitbart-color');
      console.log("breitbart clicked")
    }



  })



  //initial call to New York Times feed
  $.get(newyorktimesUrl, function(r){
    console.log(r);

    feedItems = r.items;

    jsonresponse = r;


      for (var i = 0; i < 10; i++) {

            var itemContent = {i: i, imageurl: feedItems[i].thumbnail, title: feedItems[i].title}
            var html = articleItemTemplate(itemContent)

            $("#main").append(html)
      }


    //remove loader when get data
    $('#popUp').addClass('hidden');


    //open popUp on click
    $('#main article').click(function(e){
      console.log("test")

      //open popUp
      $('#popUp').removeClass('hidden');

      //set popUp contents
      var i = $(e.currentTarget).data('i')
      var popupContent = {title: feedItems[i].title, description: feedItems[i].description, link: feedItems[i].link}

      //remove loader when get data
      $('#popUp').removeClass('loader');

      //populate template
      var html = popUpTemplate(popupContent)
      $('#popUp').html(html)

      //close popUp
      $('.closePopUp').click(function(){
        $('#popUp').addClass('hidden');
        console.log("x clicked")
      })
    })


  })

  console.log(jsonresponse);


});





// ----------------------------------------------------------------------------

function get500Photos(){


    // search the API for poster photos
  _500px.api('/photos/search', {term: "demonstration march poster", image_size: 3}, function(response) {
    if (response.data.photos.length == 0) {
      alert('No photos found!');
    } else {
      handleResponseSuccess(response);
    }
  });


  function handleResponseSuccess(response) {
    console.log("response from 500",response)
    var allData = response.data.photos;


    // for Handlebars

    //to set counter to set limit inside
    var i = 0

    $.each(allData, function(data) {

      var imgUrl = {imgUrl: this.image_url}
      var html = photoTemplate(imgUrl)

      $('#image-board').append(html)

      if(++i > 8) {
         return false;
       }

    });


  }

}


function getPosterMessages() {

  database.ref('messages').orderByChild('votes').on('value', function (results) {

    var $messageBoard = $('.message-board')
    var messages = []

    var allMessages = results.val();
    // iterate through results coming from database call; messages

    $messageBoard.empty()




  // for Handlebars
  for (var msg in allMessages) {


      var message = allMessages[msg].message
      var votes = allMessages[msg].votes

      var posterColor=allMessages[msg].posterColor

      var posterContent = {posterText: message, voteCount: votes, id: msg, posterColor: posterColor}
      var html = posterTemplate(posterContent)

      $messageBoard.append(html)
  }






  // Attach delete event listeners to all delete buttons in the message-board <ul>:
  $('div.message-board i.delete').on('click', function (event) {

    var id = $(event.currentTarget).closest('.from-people').data("id")
    // deleteMessage(id)
    database.ref('messages/' + id).remove();
    console.log("deleting", id)
  })

  // Attach downvote even listeners to all downvote buttons in the message-board <ul>:
  $('div.message-board i.fa-thumbs-down').on('click', function (event) {
    var id = $(event.currentTarget).closest('.from-people').data("id")

    var voteCount = $(this).siblings('.vote-count').first().text()
    // Decrement the count by 1:
    voteCount--;
    // Update the vote count in firebase:
    database.ref('messages/' + id).update({
      votes: parseInt(voteCount)
    })
  })

  // Attach upvote even listeners to all upvote buttons in the message-board <ul>:
  $('div.message-board i.fa-thumbs-up').on('click', function (event) {
    var id = $(event.currentTarget).closest('.from-people').data("id")

    var voteCount = $(this).siblings('.vote-count').first().text()
    // Bump up the count by 1:
    voteCount++;
    // Update the vote count in firebase:
    database.ref('messages/' + id).update({
      votes: parseInt(voteCount)
    })
  })



})

}
