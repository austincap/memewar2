var socket = io();
  if(!sessionStorage.getItem('currentUserPlayerData')){
    socket.emit('requestInfodrugFeedData', 'main');
    $("#roomId").val('main');
  } else {
    socket.emit('requestInfodrugFeedData', sessionStorage.getItem('currentRoom'));
  }
socket.emit('requestTop50Posts');

function showReplyBox(){
  returnTagBox();
  returnNewPostBox();
  var replyContainer = $('#replyContainer');
  replyContainer.detach();
  replyContainer.appendTo('#statusdiv');
  replyContainer.css('display', 'block');
}

function returnReplyBox(){
  var replyContainer = $('#replyContainer');
  replyContainer.detach();
  replyContainer.appendTo('#divStorage');
  replyContainer.css('display', 'none');
}

function showTagBox(){
  returnNewPostBox();
  returnReplyBox();
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
  returnTagBox();
  returnReplyBox();
  var newPostContainer = $('#newPostContainer');
  newPostContainer.detach();
  newPostContainer.appendTo('body');
  newPostContainer.css('display', 'block');
}

function returnNewPostBox(){
  var newPostContainer = $('#newPostContainer');
  newPostContainer.detach();
  newPostContainer.appendTo('#divStorage');
  newPostContainer.css('display', 'none');
}

function upvoteAndShowStats(element){
  console.log(element);
  returnTagBox();
  returnReplyBox();
  returnNewPostBox();
  var newStatsContainer = $('#newStatsContainer');
  newStatsContainer.detach();
  newStatsContainer.appendTo('#divStorage');
  newStatsContainer.css('display', 'block');
}

function downvoteAndShowStats(element){
  returnTagBox();
  returnReplyBox();
  returnNewPostBox();
  var newStatsContainer = $('#newStatsContainer');
  newStatsContainer.detach();
  newStatsContainer.appendTo('#divStorage');
  newStatsContainer.css('display', 'block');
}

function submitNewPost(){
  console.log("submit");
  var postData = {
    tag: document.getElementById('tagForNewPost').value,
    type: 'text_post',
    title: document.getElementById('title-of-new-post').value,
    content: document.getElementById('new-text-post-data').value,
    upvotes: 1,
    downvotes: 0,
    userID: "ANON",
    file: '/uploaded/'+document.getElementById('')
  };
  socket.emit('addNewPost', postData);
}

function processSelectedFiles(fileInput) {
  var files = fileInput.files;

  for (var i = 0; i < files.length; i++) {
    alert("Filename " + files[i].name);
  }
}

function previewFile() {
  var preview = document.querySelector('#myimg');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.onloadend = function () {
    preview.src = reader.result;
  }

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

function convertLinkBlocks(linkblocksIterable){
  var linkBlocks = [];
  console.log(linkblocksIterable);
  for(var i = 0; i < Object.keys(linkblocksIterable).length; i++){
    var singleLinkblock = linkblocksIterable[i];
    linkBlocks.push(singleLinkblock);
  }
  return linkBlocks;
}

function newRoom(roomId){
  document.getElementById('roomId').value = roomId;
}

function showReplyBoxX(blockData){
  document.getElementById('replyX').value = blockData;
}
function showReplyBoxY(blockData){
  document.getElementById('replyY').value = blockData;
}
function showReplyBoxID(blockData){
  document.getElementById('comment-input').focus();
  document.getElementById('replyto').value = blockData;
  $('.active').removeClass('active');
  $('#id'+blockData).addClass('active');
  document.getElementById('replyContainer').style.display = "inline-block";
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function submitReply(){
  console.log(parseInt(document.getElementById('replyX').value));
  document.getElementById('replyContainer').style.display = "none";
  //so the replies aren't too close to each other in the game world
  if(Math.floor((Math.random()*2))==1){ var newX = parseInt(document.getElementById('replyX').value)+getRandomInt(-110,-20); }
  else{ var newX = parseInt(document.getElementById('replyX').value)+getRandomInt(20,110); }
  if(Math.floor((Math.random()*2))==1){ var newY = parseInt(document.getElementById('replyY').value)+getRandomInt(-110,-20); }
  else{ var newY = parseInt(document.getElementById('replyY').value)+getRandomInt(20,110); }
  var blockData = {
    x: newX,
    y: newY,
    type: 'text_post',
    url: document.getElementById('comment-input').value,
    currentRoom: document.getElementById('roomId').value,
    mv: 1,
    replyto: parseInt(document.getElementById('replyto').value)
  };
  socket.emit('addBlock', blockData);
  $("#entryContainer").empty();
  $(" #adjacent-rooms").empty();
  setTimeout(function(){
    socket.emit('requestInfodrugFeedData', document.getElementById('roomId').value);
  }, 700);
  //location.reload();
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


// "<div class='container'>
//   <div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+" data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+">
//     <div class='metadata-container'>
//     <div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-
//     <div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-
//     <button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button>
//     <div class='userID'>userID goes here</div>
//     <div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div>
//     <div class='replylinks'></div>
//     <div class='labels'></div>
//     <div>
//       <a href="+linkblockUrl+">
//         <div class='content-container uploadedimage'><img class='activeimage' src='"+linkblockUrl+"'/></div>
//       </a>
//     </div>
//   </div>"
        // var onclickTextX = "showReplyBoxX(parseInt(document.getElementById('id"+String(linkblockArray[i].blockID)+"').getAttribute('data-x')));";
        // var onclickTextY = "showReplyBoxY(parseInt(document.getElementById('id"+String(linkblockArray[i].blockID)+"').getAttribute('data-y')));";
        // var onclickTextID = "showReplyBoxID('"+String(linkblockArray[i].blockID)+"');";
        //var replyPackage = {x:linkblockArray[i].x, y:linkblockArray[i].y, blockID:linkblockArray[i].blockID};
        //var onclickText = "showReplyBox("+replyPackage+")";


socket.on('receiveData', function(posts){
  console.log(posts);
});

socket.on('sendServerDataToFeed', function(nodeData, replyData){  
  var linkblockArray = convertLinkBlocks(nodeData);  
  for (i=0; i < linkblockArray.length; i++){
    if (linkblockArray[i].url != ""){
        //build reply strings
        var onclickTextX = "showReplyBoxX(parseInt(document.getElementById('id"+String(linkblockArray[i].blockID)+"').getAttribute('data-x')));";
        var onclickTextY = "showReplyBoxY(parseInt(document.getElementById('id"+String(linkblockArray[i].blockID)+"').getAttribute('data-y')));";
        var onclickTextID = "showReplyBoxID('"+String(linkblockArray[i].blockID)+"');";

      if (linkblockArray[i]['type'] == ("vanilla_post" || "mine_post" || "autoturret_post" || "organic_post" || "viral_post")){
        if (linkblockArray[i]['url'].substr(0, 8) ==String.raw`${"public/p"}`){ 
          //if it's an uploaded picture linkblock
          var linkblockUrl = "../"+linkblockArray[i]['url'].slice(7);       
          $("#entryContainer").prepend("<div class='container'><div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+" data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+"><div class='metadata-container'><div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-<div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div><a href="+linkblockUrl+"><div class='content-container uploadedimage'><img class='activeimage' src='"+linkblockUrl+"'/></div></a></div><div class='lower-metadata-container'><div class='replylinks'></div></div></div>");
        } else if(is_url(linkblockArray[i].url)){ //if it's a vanilla, mine, aggro linkblock, organic, or viral linkblock
          if(linkblockArray[i]['url'].substr(0,32)=="https://www.youtube.com/watch?v="){ //if it's a youtube link
            console.log(linkblockArray[i]['url'].substr(32,43));
            var linkblockUrl = "<iframe width='500' height='300' src='https://www.youtube.com/embed/"+linkblockArray[i]['url'].substr(32,43)+"' frameborder='0' allow='autoplay; encrypted-media' allowfullscreen></iframe>";
            //var linkblockUrl = "<iframe src='https://web.archive.org/web/"+linkblockArray[i].url+"' height='300px' width='500px' sandbox='allow-same-origin'></iframe>";
            $("#entryContainer").prepend("<div class='container'><div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+" data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+"><div class='metadata-container'><div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-<div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div><a href='"+linkblockArray[i]['url']+"' ><div class='content-container'>"+linkblockUrl+"</div></a><div class='lower-metadata-container'><div class='replylinks'></div></div></div></div>");
          }else{ //if it's any other kind of link
          //USING A STATIC IMAGE FOR A WEBSITE THUMBNAIL
          //var linkblockImgUrl = "<img src='../images/mv.png'/>";
          //$("#entryContainer").prepend("<div class='container'><div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+"data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+"><div class='metadata-container'><div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-<div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</div><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div class='content-container'><a href='"+String(linkblockArray[i].url)+"'>"+linkblockImgUrl+"<a/></div></div></div>");
          //USING AN IFRAME FOR AN EMBEDDED SITE
          var linkblockUrl = "<iframe src='https://web.archive.org/web/"+linkblockArray[i].url+"' height='300px' width='500px' sandbox='allow-same-origin'></iframe>";
          $("#entryContainer").prepend("<div class='container'><div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+" data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+"><div class='metadata-container'><div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-<div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div><a href='"+linkblockArray[i]['url']+"' ><div class='content-container'>"+linkblockUrl+"</div></a><div class='lower-metadata-container'><div class='replylinks'></div></div></div></div>");
          }
        } else{
          //if it's a postblock full of text, treat as a text_post
          $("#entryContainer").prepend("<div class='container'><div class='text_post block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+" data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+"><div class='metadata-container'><div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-<div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div class='content-container'><p style='white-space: pre-line;' href='"+String(linkblockArray[i].url)+"'>"+linkblockArray[i].url+"<p/></div><div class='lower-metadata-container'><div class='replylinks'></div></div></div></div>");
        }
      } else if (linkblockArray[i].type=="text_post"){//if it's a text_post
        if (linkblockArray[i]['url'].substr(0, 8) ==String.raw`${"public/p"}`){ //if its a text_post with a pic
          var linkblockUrl = "../"+linkblockArray[i]['url'].slice(7);       
          $("#entryContainer").prepend("<div class='container'><div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+" data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+"><div class='metadata-container'><div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-<div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div><a href="+linkblockUrl+"><div class='content-container uploadedimage'><img class='activeimage' src='"+linkblockUrl+"'/></div></a><div class='lower-metadata-container'><div class='replylinks'></div></div></div></div>");
        } else{ //if its plain ol text text_post
          console.log(linkblockArray[i].url.replace('\\n', '\n'));
          $("#entryContainer").prepend("<div class='container'><div class='"+linkblockArray[i].type+" block' id='id"+String(linkblockArray[i].blockID)+"' data-upvotes="+parseInt(linkblockArray[i].upvotes)+" data-x="+linkblockArray[i].x+" data-y="+linkblockArray[i].y+"><div class='metadata-container'><div class='upvotesnum'>"+linkblockArray[i].upvotes+"MV</div>-<div class='time-and-date'>"+timeConverter(linkblockArray[i].blockID)+"</div>-<button class='blockID not-button' onclick="+onclickTextX+onclickTextY+onclickTextID+">"+linkblockArray[i].blockID+"</button><div class='userID'>userID goes here</div><div class='special-action-buttons'><button onclick='window.alert(Post reported.);'>report</button></div><div class='replylinks'></div><div class='labels'></div></div><div class='content-container'><p style='white-space: pre-line;'>"+linkblockArray[i].url.replace(/\\n/g, '\n')+"<p/></div><div class='lower-metadata-container'><div class='replylinks'></div></div></div></div>");          
        }
      } else if (linkblockArray[i].type=="portal"){ 
        //if it's a verse_portal       
        $("#adjacent-rooms").append("<button id='"+linkblockArray[i].url+"' class='adjacent-roomId'>"+linkblockArray[i].url+"</button>&nbsp;");
      } else {

        //if it's a messageblock, teleblock, or anything else DO NOTHING
      }
    }
  }
  for(i=0; i < replyData.length; i++){
    console.log(replyData[i]);
    if(replyData[i]['type']=='REPLYTO'){
      var hasreplyattr = $('#id'+replyData[i]['orig']+' > .metadata-container > .replylinks').attr('data-hasreplyto');
      if(typeof hasreplyattr !== typeof undefined && hasreplyattr !== false){ //dont overwrite a reply if there are multiple replies
        $('#id'+replyData[i]['orig']+' > .metadata-container > .replylinks').attr('data-hasreplyto', hasreplyattr+','+replyData[i]['reply']);
      }else{ //if its the first reply
        $('#id'+replyData[i]['orig']+' > .metadata-container > .replylinks').attr('data-hasreplyto', replyData[i]['reply']);
      }
      var newhasreplyattr = $('#id'+replyData[i]['reply']+' > .lower-metadata-container > .replylinks').attr('data-hasreplyto');
      if(typeof newhasreplyattr !== typeof undefined && newhasreplyattr !== false){ //dont overwrite a reply if there are multiple replies
        $('#id'+replyData[i]['reply']+' > .lower-metadata-container > .replylinks').attr('data-hasreplyto', newhasreplyattr+','+replyData[i]['orig']);
      }else{
        $('#id'+replyData[i]['reply']+' > .lower-metadata-container > .replylinks').attr('data-hasreplyto', replyData[i]['orig']);
      }
    }else if (replyData[i]['type']=='LABELS') {
      var haslabelattr = $('#id'+replyData[i]['orig']+' > .metadata-container > .labels').attr('data-haslabel');
        if(typeof haslabelattr !== typeof undefined && haslabelattr !== false){ //dont overwrite a label if there are multiple labels
          $('#id'+replyData[i]['orig']+' > .metadata-container > .labels').attr('data-haslabel', haslabelattr+','+replyData[i]['reply']);
        }else{ //if its first label
          $('#id'+replyData[i]['orig']+' > .metadata-container > .labels').attr('data-haslabel', replyData[i]['reply']);
        }
    }else{ //idk why this case is happening, but handling it this way was easier than figuring it out
      $('#id'+replyData[i]['orig']+' > .metadata-container > .replylinks').attr('data-hasreplyto', '');
    }
  }
  $("input#newTagSuggestion").on({
    keydown: function(e) {
      print(e);
      if (e.which === 32){
        return false;
      }
    },
    change: function() {
      this.value = this.value.replace(/\s/g, "");
    }
  });
  var sortedDivs = $(".block").toArray().sort(sorter);
  //console.log(sortedDivs);
  $(".container").remove();
  $.each(sortedDivs, function (index, value) {$('#entryContainer').append(value);} );


  window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var img = document.querySelector('img');  // $('img')[0]
            img.src = URL.createObjectURL(this.files[0]); // set src to blob url
            img.onload = imageIsLoaded;
        }
    });
  });

  function imageIsLoaded() { 
    alert(this.src);  // blob url
    // update width and height ...
  }

  $(document).ready(function(){
    // $('.activeimage').mouseleave(function(){
    //   $(this).animate({})
    // });
    //}


    $('.replylinks').each(function (index, e){
      var replies = e.getAttribute('data-hasreplyto');
      if(replies !== null){
        replies = replies.split(',');
        if (replies.length >= 1) {
          for (var i=0; i < replies.length; i++) {
            var aTag = document.createElement('a');
            aTag.setAttribute("href","#id"+replies[i]);
            aTag.classList.add("highlighter");
            aTag.innerHTML = ">>"+replies[i].slice(5);//slice makes things a bit more compact without losing functionality
            e.appendChild(aTag);
            var aSpace = document.createElement('span');
            aSpace.innerHTML = "&nbsp;&nbsp;";
            e.appendChild(aSpace);
          }
        }
      }
    });
    $('.labels').each(function (index, e){
      var replies = e.getAttribute('data-haslabel');
      if(replies !== null){
        replies = replies.split(',');
        if (replies.length >= 1) {
          for (var i=0; i < replies.length; i++) {
            var aTag = document.createElement('a');
            aTag.classList.add("label");
            aTag.innerHTML = "#"+replies[i];
            e.appendChild(aTag);
            var aSpace = document.createElement('span');
            aSpace.innerHTML = "&nbsp;&nbsp;";
            e.appendChild(aSpace);
          }
        }
      }
    });
    $('.highlighter').click(function(event){
        event.preventDefault();
        var full_url = this.href,
          parts = full_url.split('#'),
          trgt = parts[1],
          target_offset = $('#'+trgt).offset(),
          target_top = target_offset.top;
        $('html, body').animate({scrollTop:target_top}, 500);
        $('.active').removeClass('active');
        $($(this).attr('href')).addClass('active');
    });
    $('.label').click(function(event){
      $('.active').removeClass('active');
      event.preventDefault();
      $('div[data-haslabel='+$(this).html().slice(1)+']').each(function(index, e){
        $(e).parent().parent().addClass('active');
      });
    });
  });

    //change room on typing it in
    $("#roomId").keyup(function(){
      $("#entryContainer").empty();
      $(" #adjacent-rooms").empty();
      socket.emit('requestInfodrugFeedData', $(this).val());
    });
    //change room on clicking the button
    $(".adjacent-roomId").on("click", function(){
      document.getElementById('roomId').value = this.id;
      $("#entryContainer").empty();
      $(" #adjacent-rooms").empty();
      socket.emit('requestInfodrugFeedData', this.id);
    });

});