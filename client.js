const socket = io();


function onloadFunction(){
  var isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini)/i);
  if(isMobile){ console.log("MOBILE"); }
  else{ console.log("NOT MOBILE"); }
  var currentPage = sessionStorage.getItem('currentPage');

  if(getQueryParam("post")!==""){
    socket.emit("viewpost", getQueryParam("post"));
  }else if(getQueryParam("user")!==""){
    socket.emit('viewuser', getQueryParam("user"))
  }else if(getQueryParam("tag")!==""){
    socket.emit('requestPostsWithTag', getQueryParam("tag"));
  }else{
    socket.emit('requestTop20Posts');
  }
  console.log(document.URL); ////GEEEEEEEEEEEEEEEEEEEEEEEE
  console.log(getQueryParam("post"));
  if(sessionStorage.getItem('userID') !== null){
    console.log(sessionStorage.getItem('userID'));
    $('#signinstuff').css('display', 'none');
    $('#userprofilestuff').css('display', 'inline-block');
    $('.profallow').css('display', 'inline');
    $('#accountButton').html("<span userid="+sessionStorage.getItem('userID')+">"+sessionStorage.getItem('username')+"</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>"+sessionStorage.getItem('memecoin')+"₿</span>");
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

function clickAccountButton(thisButton){
  console.log($(thisButton).children()[0]);
  if($(thisButton).html()=="Account"){
    $('#signinstuff').css('display', 'inline-block');
    $(thisButton).html("Close");
  }else if($(thisButton).html()=="Close"){
    $('#signinstuff').css('display', 'none');
    $(thisButton).html("Account");
  }else if($($(thisButton).children()[0]).attr('userid')==sessionStorage.getItem('userID')){
    console.log("ETE");
    viewProfilePage(sessionStorage.getItem('userID'));
  }
}

function contextButtonFunction(currentContext){
  console.log(currentContext);
  switch(currentContext){
    case 'About':
      break;
    case 'Home':
      d3.select('svg').selectAll('*').remove();
      $('#d3frame').css('display', 'none');
      sessionStorage.setItem('currentPage', 'home');
      socket.emit('requestTop20Posts');
    case 'Alt':
      $('#entryContainer').empty();
      sessionStorage.setItem('currentPage', 'alt');
      document.getElementById('contextButton').innerHTML = 'Home';
      socket.emit('retrieveDatabase');
      break;
  }
}



function getAllPostsWithThisTag(tagname){
  sessionStorage.setItem('currentPage', 'tag');
  $("#contextButton").html("Home");
  $("#entryContainer").empty();
  window.location.href='/?tag='+tagname;
  //socket.emit("requestPostsWithTag", tagname);
}

function viewPost(postID){
  sessionStorage.setItem('currentPage', 'post');
  $("#contextButton").html("Home");
  $("#entryContainer").empty();
  // socket.emit('viewpost', postID);
}

function viewProfilePage(userID){
  sessionStorage.setItem('currentPage', 'user');
  $("#contextButton").html("Home");
  $("#entryContainer").empty();
  window.location.href='/?user='+userID;
  //socket.emit('viewuser', sessionStorage.getItem('userID'));
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
  console.log(postElement);
  console.log($('#'+postElement));
  censorShieldHarvestContainer.appendTo($('#'+String(postElement)));
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
  shareButtonContainer.appendTo('#'+String(postElement.attr('postID')));
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
  var postID = String(postElement.attr('postID'));
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
  $('#replytoPostID').val(postID);
  console.log(String($(postElement).children('.post').children('.post-helper').children('.post-title').html()));
  $('#title-reply').val(String($(postElement).children('.post').children('.post-helper').children('.post-title').html()));
  var replyContainer = $('#replyContainer');
  replyContainer.detach();
  replyContainer.appendTo('#'+postID);
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

function showTagBox(postID){
  console.log(postID);
  socket.emit('requestTagsForPost', postID);
  
  returnNewPostBox();
  returnReplyBox();
  returnNewStatsBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  var tagContainer = $('#tagContainer');
  tagContainer.detach();
  tagContainer.appendTo('#'+String(postID));
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

function showVoteBox(postID, upIfTrue){
  var postID = parseInt(postID);
  console.log(postID);
  var userID = sessionStorage.getItem('userID');
    returnTagBox();
    returnReplyBox();
    returnNewPostBox();
    returnShieldCensorHarvestBox();
    returnShareBox();
    var newStatsContainer = $('#newStatsContainer');
    newStatsContainer.detach();
    newStatsContainer.appendTo('#'+String(postID));
    console.log($('#'+String(postID)));
    newStatsContainer.css('display', 'block');
    $('#upvotestat').html($('#'+String(postID)).attr('up'));
    $('#downvotestat').html($('#'+String(postID)).attr('down'));
    socket.emit('check', {userID:userID, taskToCheck:'makevote', postToCheck:postID});
  //upvote
  // if(upIfTrue){
  //   socket.emit('voteOnPost', {upIfTrue:true, postID:postID, userID:userID});
  // }
  // //downvote
  // else{

  // }
}



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
  socket.emit('harvestPost', postElement, sessionStorage.getItem("userID"));
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



function favoritePost(postID){
  //
  return;
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
function getRandomInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function is_url(str){
  var regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if(regexp.test(str)){return true;}
  else{return false;}
}
function getQueryParam(param){
  var rx = new RegExp("[?&]" + param + "=([^&]+).*$");
  var returnVal = window.location.search.match(rx);
  return returnVal === null ? "" : decodeURIComponent(returnVal[1].replace(/\+/g, " "));
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
function displayStatus(message){
  document.getElementById("statusbar").outerHTML = '<marquee behavior="slide" direction="left" scrollamount="20" id="statusbar">'+message+'</marquee>';
  //document.getElementById('statusbar').innerHTML = message;
}
//subtitle function
$(function(){
  $.getJSON('subtitles.json',function(data){
    $('#statusbar').html(data[getRandomInt(0,Object.keys(data).length)]['text']);
    $('#sub-title').append(data[getRandomInt(0,Object.keys(data).length)]['text']);
  });
});
//change board by typing it in
$(document).ready(function(){
  $("#tag-filter").keyup(function(){
    console.log($(this).val());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).val());
  });
});



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

socket.on('tagsForPostData', function(tagsForPostData){
  tagsForPostData.forEach(function(tag){
      var mustacheData = {
        otherposts: tag[0],
        tagname: tag[1],
        tagupvotes: tag[2]
      };
      var tagtemplate = `<button class="postTag" tagname="{{tagname}}">(<a title="# of posts with this tag. click to view all posts with this tag" class="other-posts-with-this-tag" onclick="getAllPostsWithThisTag({{tagname}});">{{otherposts}}</a>)&nbsp;-&nbsp;<span class="tagName">{{tagname}}</span>&nbsp;-&nbsp;(<a title="# of upvotes this tag received for this post. click to spend a memecoin to upvote" class="upvotes-for-tag-for-this-post" onclick="upvoteThisTagForThisPost({{tagname}}, $(this).parent().parent().parent().parent().parent().parent().attr('postID'));">{{tagupvotes}}</a>)</button>&nbsp;&nbsp;`;
        var html = Mustache.render(tagtemplate, mustacheData);
      $('#existingTagsForThisPost').append(html);
  });
});

socket.on('receiveTagData', function(topPostsForTag){
  var posts = topPostsForTag[0];
  var tag = topPostsForTag[1];
  console.log(posts);
  posts.forEach(function(post){
    var date = new Date(post.postID * 1000).toDateString();
    console.log(date);
    var processedPost = '<div class="post-container" postID="'+String(post.postID)+'"><div class="post"><a class="post-helper" onclick="viewPost($(this).parent().parent().attr("postID"));" href=""><div class="post-visual"><img src="uploaded/'+String(post.file)+'"/></div><div class="post-title">'+post.title+'</div></a><div class="post-header"><span class="upvotes-tooltip"><span class="tooltiptext">the number of upvotes minus the number of downvotes this post received</span><span class="upvotecount">'+String(post.upvotes-post.downvotes)+'</span>&nbsp;profit</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class="views-tooltip"><span class="tooltiptext">the number of times someone actually clicked on this post</span><span class="viewcount">'+String(post.clicks)+'</span>&nbsp;clicks</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class="post-date">'+date+'</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span><span class="post-numreplies">'+String(post.replycount)+'</span>&nbsp;replies</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span>reply to&nbsp;<span class="replyToId">'+'ERROR'+'</span></span></div></div><div class="post-buttons"><button class="raise anonallow" onclick="showReplyBox($(this).parent().parent());"><span class="tooltiptext">quick reply</span>&#x1f5e8;</button><button class="raise profallow" onclick="showVoteBox($(this).parent().parent().attr("postID"), true);"><span class="tooltiptext">upvote</span>&#10133;</button><button class="raise profallow" onclick="showVoteBox($(this).parent().parent().attr("postID"),false);"><span class="tooltiptext">downvote</span>&#10134;</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(2, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">convert this posts profit into memecoin, then delete post</span>♻</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(1, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">add a free speech shield to this post</span>🛡</button><button class="raise profallow" onclick="showShieldCensorHarvestBox(0, $(this).parent().parent().attr("postID"));"><span class="tooltiptext">attempt to censor this post</span>&#x1f4a3;</button><button class="raise anonallow" onclick="showShareBox($(this).parent().parent());"><span class="tooltiptext">share this post</span><svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#dfe09d" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button><button class="raise profallow" onclick="favoritePost($(this).parent().parent());"><span class="tooltiptext">favorite this post</span>❤</button><button class="raise anonallow" onclick="showTagBox();"><span class="tooltiptext">tag this post</span>🏷</button><div id="'+String(post.postID)+'" up="'+String(post.upvotes)+'" down="'+String(post.downvotes)+'"></div></div></div>';
    $('#entryContainer').append(processedPost);
  });
  $('#pageID').html(tag);
  onloadFunction();
});

socket.on('receiveTop20Data', function(topPostsAndTags){
    var posts = topPostsAndTags[0];
    var tags = topPostsAndTags[1];
    console.log(posts);
    //$("#entryContainer").empty();
    posts.forEach(function(post){
      var date = new Date(post.postID * 1000).toDateString();
      var mustacheData = {
        postID:String(post.postID),
        profit:String(post.upvotes-post.downvotes),
        up:String(post.upvotes),
        down:String(post.downvotes),
        file:String(post.file),
        date:date,
        replycount:String(post.replycount),
        clicks:String(post.clicks),
        title:String(post.title),
        content:String(post.content)
      };
    //console.log(date);
    var processedPostTemplate = `<div class='post-container' postID='{{postID}}'><div class='post'><a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'><div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div><div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div></a><div class='post-header'><span class='upvotes-tooltip'><span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span><span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span>reply to&nbsp;<span class='replyToId'></span></span></div></div><div class='post-buttons'><button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button><button class='raise profallow' onclick='showVoteBox({{postID}}, true);'><span class='tooltiptext'>upvote</span>&#10133;</button><button class='raise profallow' onclick='showVoteBox({{postID}}, false);'><span class='tooltiptext'>downvote</span>&#10134;</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button><button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button><button class='raise profallow' onclick='favoritePost($(this).parent().parent());'><span class='tooltiptext'>favorite this post</span>❤</button><button class='raise anonallow' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button><div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div></div></div>`;
    var html = Mustache.render(processedPostTemplate, mustacheData);
      $('#entryContainer').append(html);
    });
    //console.log(tags);
    tags.forEach(function(tag){
      var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
      $('#popular-tag-span').append(processedTag); 
    });
    $(".popular-tag-button").on("click", function(){
      console.log($(this).children(".tag-name").html());
      $("#entryContainer").empty();
      socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
    });
    //onloadFunction();
  // window.setTimeout(function(){

  // }, 800);
});

socket.on('receiveSinglePostData', function(dataFromServer){
  console.log("receiveSinglePostData");
  console.log(dataFromServer);
  var viewedPost = dataFromServer[0];
  var repliesToPost = dataFromServer[1];
  var tags = dataFromServer[2];
  if(is_url(viewedPost.content)){
    var linkblockUrl = "<iframe src='https://web.archive.org/web/"+viewedPost.content+"' height='300px' width='500px' sandbox='allow-same-origin'></iframe>";
    $("#entryContainer").prepend("<div class='container'><div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"'><div class='metadata-container'><div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div><a href='"+linkblockArray[i]['url']+"' ><div class='content-container'>"+linkblockUrl+"</div></a><div class='lower-metadata-container'><div class='replylinks'></div></div></div></div>");
  }
  var viewedPostData = new Date(viewedPost.postID * 1000).toDateString();
  var viewedPostMustacheData = {
    postID:viewedPost.postID,
    upvotes:String(viewedPost.upvotes),
    downvotes:String(viewedPost.downvotes),
    clicks:String(viewedPost.clicks),
    title:String(viewedPost.title),
    memecoinsspent:String(viewedPost.memecoinsspent),
    date:viewedPostData,
    content:String(viewedPost.content),
    file:String(viewedPost.file)
  };
  var processedViewedPostTemplate = `
        <div postID="{{postID}}">
          <div class="advanced-post-container">
            <div id="advanced-post-stats">
              <span id="advanced-post-upvotes">{{upvotes}}</span>&nbsp;upvotes<br/>
              <span id="advanced-post-upvotes">{{downvotes}}</span>&nbsp;downvotes<br/>
              <span id="advanced-post-upvotes">{{clicks}}</span>&nbsp;clicks<br/>
              <span id="advanced-post-upvotes">{{memecoinsspent}}</span>&nbsp;memecoins spent on post<br/>
              <span id="advanced-post-upvotes">{{date}}</span>&nbsp;post was created<br/>
              <hr/>
              favorited by:<br/>
              <div id="advanced-post-favoriters"><button class="raise" onclick=""></button></div>
            </div>
            <div id="advanced-post">
              <img class="activeimage advimg" src="uploaded/{{file}}"/>
              <div id="advanced-post-title">{{title}}</div>
            </div>
            <div id="advanced-post-tags">
            </div>
          </div>
          <div id="advanced-post-content">{{content}}</div>
          <div class="post-buttons">
            <button class="raise anonallow" onclick="showReplyBox($(this).parent().parent());"><span class="tooltiptext">quick reply</span>&#x1f5e8;</button>
            <button class="raise profallow" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span>&#10133;</button>
            <button class="raise profallow" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span>&#10134;</button>
            <span class="advancedButtons">
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(2, {{postID}});"><span class="tooltiptext">convert this post's profit into memecoin, then delete post</span>♻</button>
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(1, {{postID}});"><span class="tooltiptext">add a free speech shield to this post</span>🛡</button>
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(0, {{postID}});"><span class="tooltiptext">attempt to censor this post</span>&#x1f4a3;</button>
              <button class="raise anonallow" onclick="showShareBox($(this).parent().parent());"><span class="tooltiptext">share this post</span><svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#dfe09d" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button>
              <button class="raise profallow" onclick="favoritePost($(this).parent().parent());"><span class="tooltiptext">favorite this post</span>❤</button>
            </span>
            <button class="raise anonallow" onclick="showTagBox({{postID}});"><span class="tooltiptext">tag this post</span>🏷</button>
            <div class="statusdiv" id="{{postID}}"></div>
          </div>
        </div>`;
      var html = Mustache.render(processedViewedPostTemplate, viewedPostMustacheData);
      //$('#result').html( html );
      $('#entryContainer').append(html);
  repliesToPost.forEach(function(post){
    var date = new Date(post.postID * 1000).toDateString();
    var mustacheData = {
      postID:post.postID,
      profit:String(post.upvotes-post.downvotes),
      upvotes:String(post.upvotes),
      downvotes:String(post.downvotes),
      file:String(post.file),
      date:date,
      replycount:String(post.replycount),
      clicks:String(post.clicks),
      title:String(post.title),
      content:String(post.content)
    };
    var processedPostTemplate = `<div class='post-container' postID='{{postID}}'><div class='post'><a href='/?q={{postID}} class='post-helper' onclick='viewPost({{postID}});'><div class='post-visual'><img src='uploaded/{{file}}'/></div><div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div></a><div class='post-header'><span class='upvotes-tooltip'><span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span><span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span>reply to&nbsp;<span class='replyToId'></span></span></div></div><div class='post-buttons'><button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button><button class='raise profallow' onclick='showVoteBox({{postID}}, true);'><span class='tooltiptext'>upvote</span>&#10133;</button><button class='raise profallow' onclick='showVoteBox({{postID}}, false);'><span class='tooltiptext'>downvote</span>&#10134;</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button><button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button><button class='raise profallow' onclick='favoritePost($(this).parent().parent());'><span class='tooltiptext'>favorite this post</span>❤</button><button class='raise anonallow' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button><div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div></div></div>`;
      var html = Mustache.render(processedPostTemplate, mustacheData);
      //$('#result').html( html );
      $('#entryContainer').append(html);
  });
  console.log(tags);
  tags.forEach(function(tag){
    var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
    $('#popular-tag-span').append(processedTag); 
  });
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
});

socket.on('loggedIn', function(loginData){
  sessionStorage.setItem('userID', loginData.userID);
  sessionStorage.setItem('username', loginData.name);
  sessionStorage.setItem('memecoin', loginData.memecoin);
  $('#signinstuff').css('display', 'none');
  $('.profallow').css('display','inline');
  $('#accountButton').html("<span userid="+sessionStorage.getItem('userID')+"</span>"+sessionStorage.getItem('username')+"&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>"+sessionStorage.getItem('memecoin')+"₿</span>");
  $('#accountButton').attr('userid', sessionStorage.getItem('userID'));
});

socket.on('userDataFound', function(userData){
  var user = userData[0];
  var tags = userData[1];
  var posts = userData[2];
  var faves = userData[3];
  console.log(posts);
  //$("#entryContainer").empty();
  var user_date = "1/9/89";//new Date(user.userID * 1000).toDateString();
  var user_mustacheData = {
    userid:String(user.userID),
    username:String(user.name),
    memecoin:String(user.memecoin),
    file:String(user.file),
    date:user_date,
    postcount:String(posts.length),
    content:String(user.content)
  };
  posts.forEach(function(post){
    var date = new Date(post.postID * 1000).toDateString();
    var mustacheData = {
      postID:String(post.postID),
      profit:String(post.upvotes-post.downvotes),
      up:String(post.upvotes),
      down:String(post.downvotes),
      file:String(post.file),
      date:date,
      replycount:String(post.replycount),
      clicks:String(post.clicks),
      title:String(post.title),
      content:String(post.content)
    };
    var processedPostTemplate = `<div class='post-container' postID='{{postID}}'><div class='post'><a class='post-helper' href='/?q={{postID}}' onclick='viewPost({{postID}});'><div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div><div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div></a><div class='post-header'><span class='upvotes-tooltip'><span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span><span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span>reply to&nbsp;<span class='replyToId'></span></span></div></div><div class='post-buttons'><button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button><button class='raise profallow' onclick='showVoteBox({{postID}}, true);'><span class='tooltiptext'>upvote</span>&#10133;</button><button class='raise profallow' onclick='showVoteBox({{postID}}, false);'><span class='tooltiptext'>downvote</span>&#10134;</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button><button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button><button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button><button class='raise profallow' onclick='favoritePost($(this).parent().parent());'><span class='tooltiptext'>favorite this post</span>❤</button><button class='raise anonallow' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button><div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div></div></div>`;
    var html = Mustache.render(processedPostTemplate, mustacheData);
      $('#entryContainer').append(html);
  });
  //console.log(tags);
  tags.forEach(function(tag){
    var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
    $('#popular-tag-span').append(processedTag); 
  });
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
});

socket.on('sendDatabase', function(results){
  $('#entryContainer').empty();
  $('#adjacentBlocks').empty();
  console.log(results);
  handleRetrievedDatabase(results);
});



var dbresults = {"nodes":[], "links":[]};
var mouseCoordinates = [0, 0];
var selectedNode = null;
var clickOnAddNewTag = false;
var clickOnAddNewPost = false;

var existingTagArray = [];


linkifyOptions = {
  attributes: null,
  className: 'linkified',
  defaultProtocol: 'http',
  events: null,
  format: function (value, type) {
    return value;
  },
  formatHref: function (href, type) {
    return href;
  },
  ignoreTags: [],
  nl2br: false,
  tagName: 'a',
  target: {
    url: '_blank'
  },
  validate: true
};

function clickNewPostButton(){
  closeAllFrames();
  if(clickOnAddNewPost==false){
    document.getElementById('submitnew').style.display="block";
    document.getElementById('uploadNewPostButton').innerHTML="-";
    clickOnAddNewPost=true; 
    
  }else{
    document.getElementById('uploadNewPostButton').innerHTML="+";
    clickOnAddNewPost=false;
  }
}

function displayStatus(message){
  document.getElementById("statusbar").outerHTML = '<marquee behavior="slide" direction="left" scrollamount="20" id="statusbar">'+message+'</marquee>';
  //document.getElementById('statusbar').innerHTML = message;
}

function sendNewPostToServer(){
  var last3chars = document.getElementById('userInputtedContent').value.slice(-3);
  var typeOfUpload = "text";
  if(last3chars=="jpg"||last3chars=="png"||last3chars=="gif"){
    typeOfUpload = "pic";
  }
  if(document.getElementById('tag2').value==""){
    socket.emit('sendNewPostToServer1', {
      nodename: document.getElementById('nodename').value,
      nodecontent: document.getElementById('userInputtedContent').value,
      tag1: document.getElementById('tag1').value.toLowerCase(),
      type: typeOfUpload
    });
  }else{
    socket.emit('sendNewPostToServer2', {
      nodename: document.getElementById('nodename').value,
      nodecontent: document.getElementById('userInputtedContent').value,
      tag1: document.getElementById('tag1').value.toLowerCase(),
      tag2: document.getElementById('tag2').value.toLowerCase(),
      type: typeOfUpload
    });     
  }
  closeAllFrames();     
  document.getElementById('uploadNewPostButton').innerHTML="+";
  clickOnAddNewPost=false;
  displayStatus("Post uploaded successfully");
  $("svg").empty();
  document.getElementById('nodename').value="";
  document.getElementById('userInputtedContent').value="";
  document.getElementById('tag1').value="";
  document.getElementById('tag2').value="";
  socket.emit('retrieveDatabase');
}

function upvoteTag(){
  socket.emit('upvoteTag', {
    nodename: document.getElementById('postNameInModal').innerHTML,
    nodecontent: document.getElementById('contentInModal').innerHTML,
    tag1: document.getElementById('tagNameInModal').innerHTML
  });
  document.getElementById('upvoteTagModal').style.display = "none";
  displayStatus("Tag successfully upvoted");
}

function upvotePost(){
  socket.emit('upvotePost', {
    nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
    nodecontent: document.getElementById('contentInModal').innerHTML
  });
  document.getElementById('previewframe').style.display = "none";
  displayStatus("Post successfully upvoted");
}

function tagPost(){
  var newTagInput = document.getElementById('newTagInput');
  if(clickOnAddNewTag==true){
    if(existingTagArray.indexOf(newTagInput.value.toLowerCase()) === -1){
      socket.emit('tagPost', {
        nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
        nodecontent: document.getElementById('contentInModal').innerHTML,
        newtag: newTagInput.value.toLowerCase() 
      });
      displayStatus("Tag added to post");
    }else{
      socket.emit('upvoteTag', {
        nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
        nodecontent: document.getElementById('contentInModal').innerHTML,
        tag1: newTagInput.value.toLowerCase()
      });
      displayStatus("Tag already existed for this post and was upvoted");
    }
    newTagInput.value = "";
    newTagInput.style.display = "none";
    document.getElementById("tagIt").innerHTML = "Tag it";
    document.getElementById('previewframe').style.display = "none";
    clickOnAddNewTag=false;
  }else{
    newTagInput.style.display = "block";
    document.getElementById("tagIt").innerHTML = "Submit tag?";
    clickOnAddNewTag=true;
  }
  clickOnAddNewPost=false; 
  document.getElementById('uploadNewPostButton').innerHTML="+";
}

function closeAllFrames(){
  var newTagInput = document.getElementById("newTagInput");
  newTagInput.value = "";
  newTagInput.style.display = "none";
  clickOnAddNewTag=false;
  document.getElementById("tagIt").innerHTML="Tag it";
  document.getElementById("submitnew").style.display = "none";
  document.getElementById('previewframe').style.display = "none";
  document.getElementById('upvoteTagModal').style.display = "none";
}

var inputs = $(".submissionslot");

var validateInputs = function validateInputs(inputs){
  var validForm = true;
  inputs.each(function(index) {
    var input = $(this);
    if (input.val()=="") {
      $("#upload").attr("disabled", "disabled");
      validForm = false;
    }
  });
  return validForm;
};

inputs.change(function(){
  if (validateInputs(inputs)) {
    document.getElementById("upload").removeAttribute("disabled");
  }
});

var text_truncate = function(str, length, ending){
  if (length == null) {
    length = 100;
  }
  if (ending == null) {
    ending = '...';
  }
  //console.log(String(str));
  if(str !== null) {
    //console.log("STRING IS NOT NULL");
    if (str.length > length) {
      //console.log(str.substring(0, length - ending.length) + ending);
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }     
  }else{
    //console.log("STRING IS NULL");
    return "null";
  }
};

var previewContent = document.getElementById("previewContent");

function handleRetrievedDatabase(results){

  var promise1 = new Promise(function(resolve, reject){
    console.log("DBRESULTSNODES");
    console.log(dbresults.nodes);
    //0 = id, 1 = upvotes, 2 = content, 3 = tag from results array
    for(let i=0; i<results.length; i++){
      k = i+1;
      var foundPrev = false;
      var thisPostID = results[i][0];
      if(thisPostID==undefined){
        continue;
      }
      for(obj of Object.values(dbresults.nodes)){
        if(obj.id==thisPostID){
          foundPrev=true;
          thisPostID = obj.id;
          break;
        }
      }
      if(foundPrev==false){
        dbresults.nodes.push({id:thisPostID, upvotes:results[i][1], content:results[i][2]});
      }
      if(results[k] == undefined){
        continue;
      }else{
        var thisNextPostID = results[k][0];
        for(obj of Object.values(dbresults.nodes)){
          if(obj.id==thisNextPostID){
            foundPrev=true;
            thisNextPostID = obj.id;
            break;
          }
        }
        var thisPostTag = results[i][3];
        //IF THIS POSTS TAG IS IDENTICAL TO THE NEXT POSTS TAG
        if(thisPostTag==results[k][3] && thisNextPostID !== null){
          //THEN CHECK IF THAT TAG IS ALREADY IN THE EXISTING TAG ARRAY. IF NOT? PUSH IT TO THAT LIST
          existingTagArray.indexOf(thisPostTag) === -1 ? existingTagArray.push(thisPostTag) : console.log("This item already exists");
          //BECAUSE THERE MUST BE AT LEAST TWO POSTS WITH THE SAME TAG FOR A LINK TO EXIST, 
          dbresults.links.push({source:thisPostID, target:thisNextPostID, tag:thisPostTag});
        }
      }
    }
    resolve(dbresults);
  });

  promise1.then(function(data){
    console.log("PROMISE1THEN START");

    console.log(data);
    //console.log(existingTagArray);
    var svg = d3.select("svg")
        .attr("width", 2000)
        .attr("height", 2000)
        .on("mousemove", mousemove);



    var path = svg.append("g")
        .selectAll("path")
        .data(data.links)
        .enter()
        .append("path")
        .attr("class", "linkpath")
        .attr("id", function(d,i){ return "pathId_" + i; })
        .attr("marker-end", function(d) { return "url(#" + d.tag + ")"; });

    var linktext = svg.append("g").selectAll(".gLink").data(data.links);
    
    linktext.enter().append("g").attr("class", "gLink")
         .append("text")
         .attr("class", "gLink")
         .style("font-size", "11px")
         .style("font-family", "sans-serif")
         .attr("x", "50")
         .attr("y", "-4")
         .attr("text-anchor", "start")
         .style("fill", "#f1d141")
         .append("textPath")
         .attr("xlink:href",function(d,i){ return "#pathId_" + i; })
         .text(function(d){ return d.tag; })
         .on("mousedown", clickOnTag);

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
          .attr("r", function(d){ return (d.upvotes != null || d.upvotes != 0) ? 5*d.upvotes : 5;})
          .attr("id", function(d){return "linkId_"+d.id})
          .attr("color", "#cccccc")
          .on("mousedown", clickOnNode)
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    var postTitle = svg.selectAll(".mytext")
      .data(data.nodes)
      .enter()
      .append("text")
      .on("mousedown", clickOnNode);

    postTitle.style("fill", "#cccccc")
      .attr("width", "10")
        .attr("height", "10")
        .style("fill","#ffd24d")
        .text(function(d) { return text_truncate(d.id, 16); });

    // var cursor = svg.append("circle")
    //     .attr("r", 30)
    //     .attr("transform", "translate(-100,-100)")
    //     .attr("class", "cursor");


    var simulation = d3.forceSimulation()
      .force("collision", d3.forceCollide().radius(70))
        .force("link", d3.forceLink().id(function(d, i){ return d.id; }))
        .force("charge", d3.forceManyBody().strength(1000).distanceMin(30))
        .force("center", d3.forceCenter(700 , 700));

    simulation.nodes(data.nodes).on("tick", ticked);
    console.log(data.links);
    simulation.force("link").links(data.links);
    //simulation.force("link").links(data.links);
    console.log("OEIFHJEOIGJHNEOIGJHEOIGJEOGJ");


    var imageElement = svg.append("g").selectAll(".image").data(data.nodes);

    function mousemove(){
      mouseCoordinates = d3.pointer(this);
      //cursor.attr("transform", "translate(" + String(d3.mouse(this)) + ")");
    }

    function mouseoverNode(d, i) {
      var thisObject = d3.select(this)["_groups"][0][0];
      d3.select(node.nodes()[i])
      .transition()
      .attr("r", 2*thisObject["attributes"][0]["nodeValue"] )
      .duration(500);
    }

    function mouseoutNode(d, i) {
      console.log(node);
      console.log(d);
      console.log(i);
      var thisObject = d3.select(this)["_groups"][0][0];
      d3.select(node.nodes()[i])
      .transition()
      .attr("r", thisObject["attributes"][0]["nodeValue"]/2 )
      .duration(500);
    }

    function ticked(){
      node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

      postTitle.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });      

      path.attr("d", function(d) {
          var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y;
          return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y;
      });
    }

    function clickOnTag(d, i){
      //console.log(d);
      closeAllFrames();
      document.getElementById('uploadNewPostButton').innerHTML="-";
      clickOnAddNewPost=true; 
      var upvoteModalElement = document.getElementById('upvoteTagModal').style;
      document.getElementById('tagNameInModal').innerHTML = d.tag;
      document.getElementById('contentInModal').innerHTML = d.source.content;
      document.getElementById('postNameInModal').innerHTML = d.source.id;
      //upvoteModalElement.left = String(mouseCoordinates[0])+"px";
      //upvoteModalElement.top = String(mouseCoordinates[1])+"px";
      upvoteModalElement.display = "block";
    }

    function clickOnNode(d, i){
      //previewFrame.innerHTML = linkifyHtml(d.content, linkifyOptions);
      //linkifyStr(previewFrame, linkifyOptions);
      closeAllFrames();
      clickOnAddNewPost=true;
      document.getElementById('uploadNewPostButton').innerHTML="-";
      document.getElementById('postNameInModalPostOnly').innerHTML = d.id;
      document.getElementById('contentInModal').innerHTML = d.content;
      previewContent.innerHTML = "<a href="+d.content+">"+d.content+"</a>";
      document.getElementById('previewframe').style.display = "block";
    }

    function restart(){
      node = node.data(data.nodes);

      node.enter().insert("circle", ".cursor")
          .attr("class", "node")
          .attr("r", 5)
          .on("mousedown", mousedownNode);

      node.exit()
          .remove();

      link = link.data(data.links);

      link.enter().insert("line", ".node")
          .attr("class", "link");
      link.exit()
          .remove();
      simulation
          .nodes(data.nodes)
          .on("tick", ticked);

      simulation.force("link")
          .links(data.links);
    }

    function dragstarted(d){
      simulation.stop();
      if (!d3.event.active){ simulation.alphaTarget(0.3).restart();}
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d){
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d){
      if (!d3.event.active){simulation.alphaTarget(0);}
      d.fx = null;
      d.fy = null;
    }
  });
}

function autocomplete(inp, arr){
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus-=1;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function(e){ closeAllLists(e.target); });
}

autocomplete(document.getElementById("newTagInput"), existingTagArray);
autocomplete(document.getElementById("tag1"), existingTagArray);
autocomplete(document.getElementById("tag2"), existingTagArray);

window.onload = onloadFunction();