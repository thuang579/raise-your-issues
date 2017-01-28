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





// ----------------------------------------------------------------------------

$(document).ready(function () {



// /////////////////////////////////////////////////////////////////////////////
// -------------------------------FROM THE PEOPLE-------------------------------


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

  // use the set method to save data to the messages
  messagesReference.push({
    message: message,
    votes: 0
  })
})

// // on initialization of app (when document is ready) get fan messages
getFanMessages();





// /////////////////////////////////////////////////////////////////////////////
// -------------------------------FROM THE MEDIA-------------------------------


//global variable to have value set in and accessed outside get api request?
var jsonresponse;

var feedItems;

var newyorktimesUrl = 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Frss.nytimes.com%2Fservices%2Fxml%2Frss%2Fnyt%2FPolitics.xml'
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



//expand search on click
$('#search').click(function(){
    console.log("search clicked")
    $('#search').toggleClass('active');
})


//load with new feed
function loadFeed(feedUrl){
  //add loader when getting data
  //$('#popUp').removeClass('hidden');


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
  //$('#popUp').addClass('hidden');


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
$('.dropdown-feed').on('click',function(e){
  $('#main').empty()
  loadFeed($(e.currentTarget).data('feed-url'))
  console.log("dropdown-feed clicked")
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

function getFanMessages() {
// retrieve messages data when .on() initially executes
// and when its data updates
database.ref('messages').on('value', function (results) {
  var $messageBoard = $('.message-board')
  var messages = []

  var allMessages = results.val();
  // iterate through results coming from database call; messages
  for (var msg in allMessages) {
    // get method is supposed to represent HTTP GET method
    var message = allMessages[msg].message
    var votes = allMessages[msg].votes

    // create message element
    var $messageListElement = $('<div></div>')

    // create delete element
    var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>')

    // create up vote element
    var $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>')

    // create down vote element
    var $downVoteElement = $('<i class="fa fa-thumbs-down pull-right"></i>')

    // add id as data attribute so we can refer to later for updating
    $messageListElement.attr('data-id', msg)

    // add message to li
    $messageListElement.html(message)

    // add delete element
    $messageListElement.append($deleteElement)

    // add voting elements
    $messageListElement.append($upVoteElement)
    $messageListElement.append($downVoteElement)

    // show votes
    $messageListElement.append('<div class="vote-count pull-right">' + votes + '</div>')

    // push element to array of messages
    messages.push($messageListElement)

    // remove lis to avoid dupes
    $messageBoard.empty()

    for (var i in messages) {
      $messageBoard.append(messages[i])
    }

  }

  // Attach delete event listeners to all delete buttons in the message-board <ul>:
  $('div.message-board i.delete').on('click', function (event) {
    var id = $(event.target.parentNode).data('id')
    // deleteMessage(id)
    database.ref('messages/' + id).remove();
    console.log("deleting", id)
  })

  // Attach upvote even listeners to all upvote buttons in the message-board <ul>:
  $('div.message-board i.fa-thumbs-up').on('click', function (event) {
    var id = $(event.target.parentNode).data('id')
    var voteCount = $(this).siblings('.vote-count').first().text()
    // Bump up the count by 1:
    voteCount++;
    // Update the vote count in firebase:
    database.ref('messages/' + id).update({
      votes: parseInt(voteCount)
    })
  })

  // Attach downvote even listeners to all downvote buttons in the message-board <ul>:
  $('div.message-board i.fa-thumbs-down').on('click', function (event) {
    var id = $(event.target.parentNode).data('id')
    var voteCount = $(this).siblings('.vote-count').first().text()
    // Decrement the count by 1:
    voteCount--;
    // Update the vote count in firebase:
    database.ref('messages/' + id).update({
      votes: parseInt(voteCount)
    })
  })

})

}
