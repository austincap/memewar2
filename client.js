var socket = io();
socket.emit('requestTop20Posts');


function onloadFunction(){
  if(sessionStorage.getItem('userID') !== null){
    console.log(sessionStorage.getItem('userID'));
    $('#signinstuff').css('display', 'none');
    $('#accountButton').css('display', 'none');
    $('#userprofilestuff').css('display', 'inline-block');
    $('.profallow').css('display', 'inline');
    $('#userProfileButton').html("<span id='"+sessionStorage.getItem('userID')+"'>"+sessionStorage.getItem('username')+"</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>"+sessionStorage.getItem('memecoin')+"₿</span>");
    $('#userID-newpost').val(sessionStorage.getItem('userID'));
    $('#userID-reply').val(sessionStorage.getItem('userID'));
    $('#posttype-newpost').val("text_post");
    $('#posttype-reply').val("text_post");
  }else{
    console.log(sessionStorage.getItem('userID'));
    $('#userID-newpost').val("ANON");
    $('#userID-reply').val("ANON");
    $('#posttype-newpost').val("text_post");
    $('#posttype-reply').val("text_post");
  }
}

function generateUUID(){
  var d = new Date().getTime();
  var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  var uuid = 'xxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16;
    if(d > 0){
      var r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {
      var r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c=='x' ? r : (r&0x7|0x8));
  });
  return uuid;
}



function registerNewUser(){
  var registrationData = {
    username: $('#signInName').val(),
    password: $('#passwordvalue').val()
  };
  socket.emit('registerNewUser', registrationData);
}

function loginUser(){
  var logindata = {
    username: $('#signInName').val(),
    password: $('#passwordvalue').val() 
  };
  socket.emit('login', logindata);
}

function viewProfilePage(){
  
}



function showShieldCensorHarvestBox(zeroIsCensorOneIsShieldTwoIsHarvest, postElement){
  var userID = (sessionStorage.getItem('userID') !== null) ? sessionStorage.getItem('userID') : "ANON";
  console.log(userID);
  returnTagBox();
  returnNewPostBox();
  returnNewStatsBox();
  returnReplyBox();
  returnShareBox();
  if(zeroIsCensorOneIsShieldTwoIsHarvest==1){
    $('.censormessage').css('display', 'none');
    $('.shieldmessage').css('display', 'block');  
    $('.harvestmessage').css('display', 'none');
    socket.emit('check', {userID:userID, postID:postElement, taskToCheck:'shield', data:'EEEEEEEEEEEE'});
  }else if(zeroIsCensorOneIsShieldTwoIsHarvest==0){
    $('.censormessage').css('display', 'block');
    $('.shieldmessage').css('display', 'none');
    $('.harvestmessage').css('display', 'none');
    socket.emit('check', {userID:userID, postID:postElement, taskToCheck:'censor', data:'EEEEEEEEEEEE'});
  }else{
    $('.censormessage').css('display', 'none');
    $('.shieldmessage').css('display', 'none');
    $('.harvestmessage').css('display', 'block');
    socket.emit('check', {userID:userID, postID:postElement, taskToCheck:'harvest', data:'EEEEEEEEEEEE'});
  }

  var censorShieldHarvestContainer = $('#censorShieldHarvestContainer');
  censorShieldHarvestContainer.detach();
  censorShieldHarvestContainer.appendTo('#statusdiv');
  censorShieldHarvestContainer.css('display', 'block');
}

function returnShieldCensorHarvestBox(){
  var censorShieldHarvestContainer = $('#censorShieldHarvestContainer');
  censorShieldHarvestContainer.detach();
  censorShieldHarvestContainer.appendTo('#divStorage');
  censorShieldHarvestContainer.css('display', 'none');
}

function showShareBox(postElement){
  returnTagBox();
  returnNewPostBox();
  returnNewStatsBox();
  returnShieldCensorHarvestBox();
  returnReplyBox();
  var shareButtonContainer = $('#shareButtonContainer');
  shareButtonContainer.detach();
  shareButtonContainer.appendTo('#statusdiv');
  shareButtonContainer.css('display', 'block');
}

function returnShareBox(){
  var shareButtonContainer = $('#shareButtonContainer');
  shareButtonContainer.detach();
  shareButtonContainer.appendTo('#divStorage');
  shareButtonContainer.css('display', 'none');
}

function showReplyBox(postElement){
  console.log(postElement.attr('postID'));
  console.log($(postElement).children('.post').children('.post-helper').children('.post-title').html());
  returnTagBox();
  returnNewPostBox();
  returnNewStatsBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#replyuploaderholder');
  // fileuploader.css('display', 'block');
  $('#replytoPostID').val(postElement.attr('postID'));
  $('#title-reply').val(String($(postElement).children('.post').children('.post-helper').children('.post-title').html()));
  var replyContainer = $('#replyContainer');
  replyContainer.detach();
  replyContainer.appendTo('#statusdiv');
  replyContainer.css('display', 'block');
}

function returnReplyBox(){
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#divStorage');
  // fileuploader.css('display', 'none');
  var replyContainer = $('#replyContainer');
  replyContainer.detach();
  replyContainer.appendTo('#divStorage');
  replyContainer.css('display', 'none');
}

function showTagBox(){
  returnNewPostBox();
  returnReplyBox();
  returnNewStatsBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  var tagContainer = $('#tagContainer');
  tagContainer.detach();
  tagContainer.appendTo('#statusdiv');
  tagContainer.css('display', 'block');
}

function returnTagBox(){
  var tagContainer = $('#tagContainer');
  tagContainer.detach();
  tagContainer.appendTo('#divStorage');
  tagContainer.css('display', 'none');
}

function showNewPostBox(){
  returnNewStatsBox();
  returnTagBox();
  returnReplyBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#newpostuploaderholder');
  // fileuploader.css('display', 'block');
  var newPostContainer = $('#newPostContainer');
  newPostContainer.detach();
  newPostContainer.appendTo('body');
  newPostContainer.css('display', 'block');
}

function returnNewPostBox(){
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#divStorage');
  // fileuploader.css('display', 'none');
  var newPostContainer = $('#newPostContainer');
  newPostContainer.detach();
  newPostContainer.appendTo('#divStorage');
  newPostContainer.css('display', 'none');
}




function showVoteBox(upIfTrue){
  var postID = parseInt($(this).parent().attr("postID"));
  var userID = sessionStorage.getItem('userID');
    returnTagBox();
    returnReplyBox();
    returnNewPostBox();
    returnShieldCensorHarvestBox();
    returnShareBox();
    var newStatsContainer = $('#newStatsContainer');
    newStatsContainer.detach();
    newStatsContainer.appendTo('#statusdiv');
    newStatsContainer.css('display', 'block');
    socket.emit('check', {userID:userID, taskToCheck:'makevote', postToCheck:postID});
  //upvote
  // if(upIfTrue){
  //   socket.emit('voteOnPost', {upIfTrue:true, postID:postID, userID:userID});
  // }
  // //downvote
  // else{

  // }
}

socket.on('userChecked', function(resultOfCheck){
  console.log(resultOfCheck);
  switch(resultOfCheck.task){
    case 'additionalvote':
      //socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost});
      break;
    case 'firstvote':
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost});
      break;
    case 'failedAdditionalVote':
      console.log('you need more memecoins to vote on this post, but posting on a different one is free!');
      break;
    case 'ableToHarvestPost':
      //socket.emit('harvestPost', {userID:resultOfCheck.userID, postID:resultOfCheck.postID});
      $('#harvestmessage-span').html("you'll get "+resultOfCheck.cost+" memecoin from harvesting this post");
      break;
    case 'failedHarvest':
      $('#harvestmessage').html('you cant harvest posts you dont own!');
      console.log('you cant harvest posts you dont own!');
      break;
    case 'ableToCensorPost':
      $('#confirmCensor').prop('disabled', false);
      $('#censormessage-span').html("there are have been "+resultOfCheck.cost+" attempts to censor this post so far, and if there's at least 1 shield you'll waste your memecoin too");
      //socket.emit('censorPost', {userID:resultOfCheck.userID, postID:resultOfCheck.postID});
      break;
    case 'failedCensoringCauseTooPoor':
      $('#confirmCensor').prop('disabled', true);
      $('#censormessage-span').html("you need more memecoins to censor this post. consider just getting over it?");
      console.log('you need more memecoin to censor this post. consider just getting over it?');
      break;
    case 'successfulCensoring':
      $('#censormessage-span').html("success! you will be the last person to ever see this post! reload the page to wipe it from the net completely");
      $('#confirmCensor').prop('disabled', true);
      socket.emit('censorSuccess', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost});
      break;
    case 'failedCensoringCauseShield':
      $('#censormessage-span').html("your attempt to censor this post has failed, but there are merely "+resultOfCheck.cost+" free speech shields remaining");
      break;
    case 'failedCensoringCauseOther':
      console.log('no idea');
      break;
    case 'ableToApplyShield':
      $('#confirmShield').prop('disabled', false);
      //socket.emit('shieldPost', {userID:resultOfCheck.userID, postID:resultOfCheck.postID});
      break;
    case 'failedShielding':
      $('#confirmShield').prop('disabled', true);
      $('#shieldmessage-span').html("you need more memecoins to shield this post. for more memecoins, try harvesting one of your successful posts!");
      console.log('you need more memecoins to shield this post. for more memecoins, try harvesting one of your successful posts!');
      break;
    case 'ableToUpvoteTag':
      socket.emit('upvoteTag', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, tagname:resultOfCheck.cost});
      console.log("tag upvoted!");
      break;
    case 'failedTagUpvote':
      if (resultOfCheck.cost == -1){
        console.log('you need at least 1 memecoin to strengthen the link between a particular post and a tag, but you can make a new one for free');
      }else{
        console.log("unknown error");
      }
      break;
    default:
      break;
  }
});

function upvoteAndShowStats(element){
  returnTagBox();
  returnReplyBox();
  returnNewPostBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  var newStatsContainer = $('#newStatsContainer');
  newStatsContainer.detach();
  newStatsContainer.appendTo('#statusdiv');
  newStatsContainer.css('display', 'block');
  socket.emit('check')
}

function downvoteAndShowStats(element){
  returnTagBox();
  returnReplyBox();
  returnNewPostBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  var newStatsContainer = $('#newStatsContainer');
  newStatsContainer.detach();
  newStatsContainer.appendTo('#statusdiv');
  newStatsContainer.css('display', 'block');
}

function returnNewStatsBox(){
  var newStatsContainer = $('#newStatsContainer');
  newStatsContainer.detach();
  newStatsContainer.appendTo('#divStorage');
  newStatsContainer.css('display', 'none');
}


function confirmCensor(postID){
  if(sessionStorage.getItem('memecoin') > 50){
    var dataPacket = {
      userID: sessionStorage.getItem('userID'),
      postID: postID
    };
    socket.emit('censorAttempt', dataPacket);
    //$('#censorShieldHarvestContainer').css('display', 'none');
  }
}

function confirmHarvest(postElement){
  console.log(postElement);
  //socket.emit('harvestPost', postElement, sessionStorage.getItem("userID"));
}


function submitNewPost(){
  console.log("submit");
  $("#new-text-post-data").empty();
  $("#tagForNewPost").empty();
  $("#title-of-new-post").empty();
  $("#sampleFile").empty();
  document.querySelector('#myimg').src = "";
  returnNewPostBox();
}

function submitReply(postElement){
  console.log("submit reply");
  $('#uploadContent-reply').empty();
  //$("#entryContainer").empty();
  $('#tagForNewReply').empty();
  $("#sampleFile-reply").empty();
  document.querySelector('#myimg-reply').src = "";
  returnReplyBox()
}




function upvoteThisTagForThisPost(tagname, postID){
  console.log(tagname);
  console.log(postID);
  var stuffToCheck = {
    userID: sessionStorage.getItem("userID"),
    postID: postID,
    data: tagname,
    task: "upvotetag"
  };
  socket.emit("check", stuffToCheck);
}



function submitTag(tagname, postID){
  console.log(tagname);
  console.log(postID);
  var tagPostOrUser = {
    tagname:tagname,
    postID:postID,
    userID:sessionStorage.getItem("userID"),
    postIfTrue:true
  };
  socket.emit('tagPostOrUser', tagPostOrUser);
}

function getAllPostsWithThisTag(tagname){
  console.log(tagname);
  socket.emit("requestPostsWithTag", tagname);
}


function viewPost(postID){
  console.log(postID);

  socket.emit('viewpost', postID);
}


function previewFile(){
  var preview = document.querySelector('#myimg');
  var previewReply = document.querySelector('#myimg-reply');
  //var file    = document.querySelector('input[type=file]').files[0];
  var file    = document.querySelector('#sampleFile').files[0];
  var fileReply = document.querySelector('#sampleFile-reply').files[0];
  var reader  = new FileReader();
  reader.onloadend = function () {
    console.log("onlined");
    preview.src = reader.result;
    previewReply.src = reader.result;
  }
  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
  if (fileReply) {
    reader.readAsDataURL(fileReply);
  } else {
    preview.src = "";
  }  
}


function getRandomInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


function testFunction(){
  socket.emit('viewpost', 1605905839);
}


//NEED BETTER SORTER
//NEED SORTER OPTIONS
//CURRENTLY SORTS BY UPVOTES, THEN BY DATE
//DATA PROCESSING FUNCTIONS
  function sorter(a, b){
    return b.getAttribute('data-upvotes') - a.getAttribute('data-upvotes') || b.getAttribute('id').slice(2) - a.getAttribute('id').slice(2);
  }
  function timesorter(a,b){
    return b.getAttribute('id').slice(2) - a.getAttribute('id').slice(2);
  }
  function upvotesorter(a,b){
    return b.getAttribute('data-upvotes') - a.getAttribute('data-upvotes');
  }

  function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  function is_url(str){
    regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if(regexp.test(str)){return true;}
    else{return false;}
  }


  //subtitle function
  $(function(){
    $.getJSON('subtitles.json',function(data){
      $('#sub-title').append(data[getRandomInt(0,Object.keys(data).length)]['text']);
    });
  });

  $(document).ready(function(){
    //change room on typing it in
  $("#tag-filter").keyup(function(){
    console.log($(this).val());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).val());
  });

});


socket.on('receiveTagData', function(topPostsForTag){
  var posts = topPostsForTag[0];
  var tag = topPostsForTag[1];
  console.log(posts);
  posts.forEach(function(post){
    var date = new Date(post.postID * 1000).toDateString();
    console.log(date);
    var processedPost = '<div class="post-container" postID="'+String(post.postID)+'"><div class="post"><a class="post-helper" onclick="viewPost($(this).parent().parent().attr("postID"));" href="#"><div class="post-visual"><img src="uploaded/'+String(post.file)+'"/></div><div class="post-title">'+post.title+'</div></a><div class="post-header"><span class="upvotes-tooltip"><span class="tooltiptext">the number of upvotes minus the number of downvotes this post received</span><span class="upvotecount">'+String(post.upvotes-post.downvotes)+'</span>&nbsp;profit</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class="views-tooltip"><span class="tooltiptext">the number of times someone actually clicked on this post</span><span class="viewcount">'+String(post.clicks)+'</span>&nbsp;clicks</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class="post-date">'+date+'</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span><span class="post-numreplies">'+String(post.replycount)+'</span>&nbsp;replies</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span>reply to&nbsp;<span class="replyToId">'+'ERROR'+'</span></span></div></div><div class="post-buttons"><button class="raise anonallow" onclick="showReplyBox($(this).parent().parent());"><span class="tooltiptext">quick reply</span>&#x1f5e8;</button><button class="raise profallow" onclick="showVoteBox(true);"><span class="tooltiptext">upvote</span>&#10133;</button><button class="raise profallow" onclick="showVoteBox(false);"><span class="tooltiptext">downvote</span>&#10134;</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(2, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">convert this posts profit into memecoin, then delete post</span>♻</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(1, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">add a free speech shield to this post</span>🛡</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(0, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">attempt to censor this post</span>&#x1f4a3;</button><button class="raise anonallow" onclick="showShareBox($(this).parent().parent());"><span class="tooltiptext">share this post</span><svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#dfe09d" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button><button class="raise profallow" onclick="favoritePost($(this).parent().parent());"><span class="tooltiptext">favorite this post</span>❤</button><button class="raise anonallow" onclick="showTagBox();"><span class="tooltiptext">tag this post</span>🏷</button><div id="statusdiv"></div></div></div>';
    $('#entryContainer').append(processedPost);
  });
  $('#pageID').html(tag);
  onloadFunction();
});

socket.on('receiveTop20Data', function(topPostsAndTags){
  var posts = topPostsAndTags[0];
  var tags = topPostsAndTags[1];
  console.log(posts);
  posts.forEach(function(post){
    var date = new Date(post.postID * 1000).toDateString();
    console.log(date);
    var processedPost = '<div class="post-container" postID="'+String(post.postID)+'"><div class="post"><a class="post-helper" onclick="viewPost($(this).parent().parent().attr("postID"));" href="#"><div class="post-visual"><img src="uploaded/'+String(post.file)+'"/></div><div class="post-title">'+post.title+'</div></a><div class="post-header"><span class="upvotes-tooltip"><span class="tooltiptext">the number of upvotes minus the number of downvotes this post received</span><span class="upvotecount">'+String(post.upvotes-post.downvotes)+'</span>&nbsp;profit</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class="views-tooltip"><span class="tooltiptext">the number of times someone actually clicked on this post</span><span class="viewcount">'+String(post.clicks)+'</span>&nbsp;clicks</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class="post-date">'+date+'</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span><span class="post-numreplies">'+String(post.replycount)+'</span>&nbsp;replies</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span>reply to&nbsp;<span class="replyToId">'+'ERROR'+'</span></span></div></div><div class="post-buttons"><button class="raise anonallow" onclick="showReplyBox($(this).parent().parent());"><span class="tooltiptext">quick reply</span>&#x1f5e8;</button><button class="raise profallow" onclick="showVoteBox(true);"><span class="tooltiptext">upvote</span>&#10133;</button><button class="raise profallow" onclick="showVoteBox(false);"><span class="tooltiptext">downvote</span>&#10134;</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(2, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">convert this posts profit into memecoin, then delete post</span>♻</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(1, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">add a free speech shield to this post</span>🛡</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(0, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">attempt to censor this post</span>&#x1f4a3;</button><button class="raise anonallow" onclick="showShareBox($(this).parent().parent());"><span class="tooltiptext">share this post</span><svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#dfe09d" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button><button class="raise profallow" onclick="favoritePost($(this).parent().parent());"><span class="tooltiptext">favorite this post</span>❤</button><button class="raise anonallow" onclick="showTagBox();"><span class="tooltiptext">tag this post</span>🏷</button><div id="statusdiv"></div></div></div>';
    $('#entryContainer').append(processedPost);
  });
  console.log(tags);
  tags.forEach(function(tag){
    var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
    $('#popular-tag-span').append(processedTag); 
  });
    //change room on clicking the button
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
  onloadFunction();
});

socket.on('receiveSinglePostData', function(dataFromServer){
  console.log(dataFromServer);
});



socket.on('loggedIn', function(loginData){
  sessionStorage.setItem('userID', loginData.userID);
  sessionStorage.setItem('username', loginData.name);
  sessionStorage.setItem('memecoin', loginData.memecoin);
  $('#signinstuff').css('display', 'none');
  $('#accountButton').css('display', 'none');
  $('#userprofilestuff').css('display', 'inline-block');
  $('.profallow').css('display','inline');
  $('#userProfileButton').html(sessionStorage.getItem('username')+"&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>"+sessionStorage.getItem('memecoin')+"₿</span>");

});