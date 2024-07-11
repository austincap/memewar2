const socket = io();
var postsOnThisPage = [];

//ONLOAD
function onloadFunction() {
    var isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini)/i);
    if (isMobile) { console.log("MOBILE"); }
    else { console.log("NOT MOBILE"); }
    //paper.install(window);
    //paper.setup('myCanvas');
    //console.log(paper.view);
    if (getQueryParam("post") !== "") {
        //
        socket.emit("viewpost", getQueryParam("post"));
    } else if (getQueryParam("group") !== "") {
        socket.emit("viewgroup", getQueryParam("group"));
    } else if (getQueryParam("user") !== "") {
        console.log('USER');
        socket.emit('viewuser', getQueryParam("user"));
    } else if (getQueryParam("tag") !== "") {
        //
        socket.emit('requestPostsWithTag', getQueryParam("tag"));
    } else if (getQueryParam("sort") == "like") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestSortedPosts', getQueryParam("sort"), getQueryParam("page"));
        } else {
            socket.emit('requestSortedPosts', getQueryParam("sort"), "0");
        }
    } else if (getQueryParam("sort") == "rand") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestSortedPosts', getQueryParam("sort"), getQueryParam("page"));
        } else {
            socket.emit('requestSortedPosts', getQueryParam("rand"), "0");
        }
    } else if (getQueryParam("sort") == "recd") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestSortedPosts', getQueryParam("sort"), getQueryParam("page"));
        } else {
            socket.emit('requestSortedPosts', getQueryParam("sort"), "0");
        }
    } else if (getQueryParam("sort") == "lead") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestSortedPosts', getQueryParam("lead"), getQueryParam("page"));
        } else {
            socket.emit('requestSortedPosts', "lead", "0");
        }
    } else if (getQueryParam("sort") == "multi") {
        socket.emit('requestMulti');
    } else if (getQueryParam("view") == "old") {
        console.log("OLD IS RUL#34 style");
    } else if (getQueryParam("page") !== "") {
        socket.emit('requestTop20Posts', getQueryParam("page"));
    } else if (getQueryParam("view") == "game") {
        openGameView();
    } else if (getQueryParam("view") == "grid") {
        socket.emit('retrieveDatabaseGrid');
    } else {
        socket.emit('requestTop20Posts', '0');
    }

    console.log(document.URL);
    //$('#gameview').css('display', 'none');

    d3.selectAll('.datamaps-subunit')
        .on('mouseover', function (d) {
            //var $this = d3.select(this);
            console.log(d.id);
        });

    window.setTimeout(function () {
        console.log("TESTSETSTES");
        if ((sessionStorage.getItem('userID')) !== (null && sessionStorage.getItem('userID') !== 'ANON')) {
            var rollString = sessionStorage.getItem('userroles');

            addRoles(sessionStorage.getItem('userroles'), false);
            console.log(sessionStorage.getItem('userID'));
            $('#signinstuff').css('display', 'none');
            $('#userprofilestuff').css('display', 'inline-block');
            $('#accountButton').html("<span userid=" + sessionStorage.getItem('userID') + ">" + sessionStorage.getItem('username') + "</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>" + sessionStorage.getItem('memecoin').substring(0,4) + "₿</span>");
            $('#userID-newpost').val(sessionStorage.getItem('userID'));
            $('#userID-reply').val(sessionStorage.getItem('userID'));
            $('#posttype-newpost').val("text_post");
            $('#posttype-reply').val("text_post");
            //$(".explorers-only").css("display", "block!important");
            $('#currentrole').html(getFirstRole(sessionStorage.getItem('userroles')));
        } else {
            console.log(sessionStorage.getItem('userID'));
            $('#userID-newpost').val("ANON");
            $('#userID-reply').val("ANON");
            $('#posttype-newpost').val("text_post");
            $('#posttype-reply').val("text_post");
            $('.profallow').css('display', 'none');
            $('#signout').css('display', 'none');
        }
        document.querySelectorAll('img').forEach(function (img) {
            img.onerror = function () { this.style.display = 'none'; };
        });
        showPaintedPosts();
    }, 800);
}




//////////
//LISTENERS
///////////
//userChecked
socket.on('userChecked', function(resultOfCheck){
    console.log(resultOfCheck);
    var upvoteElement = $('[postid=' + resultOfCheck.postID + '] > .post > .post-header > .upvotes-tooltip > .upvotecount');
    var memecoinElement = $('#memecoin-button');
  switch (resultOfCheck.task) {
      case 'successfulnewvote':
          memecoinElement.text(String(parseInt(memecoinElement.text()) - 1));
          $('#accountButton').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
          if (resultOfCheck.upIfTrue) {
              upvoteElement.text(String(parseInt(upvoteElement.text()) + 1));
          } else {
              upvoteElement.text ( String(parseInt(upvoteElement.text()) - 1));
          }
      displayStatus("Vote placed successfully");
    case 'additionalvoteup':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      socket.emit('check', {taskToCheck:'makeadditionalvoteup', userID:resultOfCheck.userID, postID:resultOfCheck.postID, data:resultOfCheck.cost});
      break;
    case 'additionalvotedown':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      socket.emit('check', {taskToCheck:'makeadditionalvotedown', userID:resultOfCheck.userID, postID:resultOfCheck.postID, data:resultOfCheck.cost});
      break;
    case 'madeadditionalvoteup':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      $('#upvotestat').html(String(parseInt($('#upvotestat').html())+1));
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'additionalvoteup'});
      break;
    case 'madeadditionalvotedown':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      $('#downvotestat').html(String(parseInt($('#downvotestat').html())-1));
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'additionalvotedown'});
      break;
    case 'firstvoteup':
      $('#cost-of-next-vote').html("1");
      $('#upvotestat').html("1");
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'firstvoteup'});
      break;
    case 'firstvotedown':
      $('#cost-of-next-vote').html("1");
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'firstvotedown'});
      break;
    case 'failedAdditionalVote':
      console.log('you need more memecoins to vote on this post, but posting on a different one is free!');
      break;
      case 'ableToHarvestPost':
          $('#confirmHarvest').css('display', 'inline');
          $('#harvestmessage-span').html("You'll get "+resultOfCheck.cost+" memecoin from harvesting this post");
          break;
      case 'failedHarvest':
          $('#confirmHarvest').css('display', 'none');
          $('#harvestmessage-span').text('You cant harvest posts you dont own!');
          displayStatus('You cant harvest posts you dont own!');
          break;
      case 'postHarvested':
          memecoinElement.text(String(parseInt(memecoinElement.text()) - resultOfCheck.data));
          $('#accountButton').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
          displayStatus("Post harvested");
          $('[postid=' + resultOfCheck.postID + ']').addClass('zoop');
          break;
    case 'ableToCensorPost':
      $('#confirmCensor').prop('disabled', false);
      $('#censormessage-span').html("there are have been "+resultOfCheck.cost+" attempts to censor this post so far, and if there's at least 1 shield you'll waste your memecoin too");
      break;
    case 'failedCensoringCauseTooPoor':
          $('#confirmCensor').prop('disabled', true);
          $('#censormessage-span').html("you need more memecoins to censor this post. consider just getting over it?");
          displayStatus("you need more memecoins to censor this post. consider just getting over it?");
          console.log('you need more memecoin to censor this post. consider just getting over it?');
          break;
    case 'successfulCensoring':
          $('#censormessage-span').html("success! you will be the last person to ever see this post! reload the page to wipe it from the net completely");
          $('#confirmCensor').prop('disabled', true);
          socket.emit('censorSuccess', { userID: resultOfCheck.userID, postID: resultOfCheck.postID, cost: resultOfCheck.cost });
          memecoinElement.text(String(parseInt(memecoinElement.text()) - 50));
          $('#accountButton').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
          displayStatus("success! you will be the last person to ever see this post! reload the page to wipe it from the net completely");
          break;
    case 'failedCensoringCauseShield':
          $('#censormessage-span').html("your attempt to censor this post has failed, but there are merely " + resultOfCheck.cost + " free speech shields remaining");
          displayStatus("your attempt to censor this post has failed, but there are merely " + String(resultOfCheck.cost) + " free speech shields remaining");
          memecoinElement.text(String(parseInt(memecoinElement.text()) - 50));
          $('#accountButton').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
          break;
    case 'failedCensoringCauseOther':
          console.log('no idea');
          displayStatus('Censoring failed but cause of some weird error');
          break;
    case 'successfulShielding':
          $('#confirmShield').prop('disabled', false);
          displayStatus("Free speech shield applied to post");
          $('[postid=' + resultOfCheck.postID + ']').addClass('shield-animation');
          socket.emit('shieldSuccess', { userID: resultOfCheck.userID, postID: resultOfCheck.postID, cost: resultOfCheck.cost });
          memecoinElement.text(String(parseInt(memecoinElement.text()) - 25));
          $('#accountButton').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
          $('#censorShieldHarvestContainer').css('display', 'none');
          break;
    case 'failedShielding':
          $('#confirmShield').prop('disabled', true);
          displayStatus("you need more memecoins to shield this post. for more memecoins, try harvesting one of your successful posts!");
          $('#shieldmessage-span').html("you need more memecoins to shield this post. for more memecoins, try harvesting one of your successful posts!");
          console.log('you need more memecoins to shield this post. for more memecoins, try harvesting one of your successful posts!');
          break;
    case 'ableToUpvoteTag':
          socket.emit('upvoteTag', { userID: resultOfCheck.userID, postID: resultOfCheck.postID, tagname: resultOfCheck.cost });
          displayStatus("Tag upvoted successfully");
          break;
    case 'failedTagUpvote':
      if (resultOfCheck.cost == -1){
        console.log('you need at least 1 memecoin to strengthen the link between a particular post and a tag, but you can make a new one for free');
      }else{
        console.log("unknown error");
      }
      break;
      case 'favoritedPost':
          displayStatus('Favorited post.')
          break;
      case 'successfulPollVote':
          displayStatus('Successfully cast ballot in poll.');
          memecoinElement.text(String(parseInt(memecoinElement.text()) - 1));
          $('#accountButton').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
          console.log('successfulPollVote');
          break;
      case 'failedPollVote':
          displayStatus('You cant vote on this poll');
          console.log('not enough memecoin to vote');
          break;
    default:
      break;
  }
});
//receiveSingleGroupsData
socket.on('receiveSingleGroupsData', function (dataFromServer) {
    postsOnThisPage = [];
    console.log("receiveSingleGroupsData");
    console.log(dataFromServer);
    var viewedPost = dataFromServer[0];
    var repliesToPost = dataFromServer[1];
    var tags = dataFromServer[2];
    var viewedPostData = new Date(viewedPost.postID * 1000).toDateString();
    var viewedPostMustacheData = {
        postID: viewedPost.postID,
        up: String(viewedPost.upvotes),
        down: String(viewedPost.downvotes),
        clicks: String(viewedPost.clicks),
        title: String(viewedPost.title),
        memecoinsspent: String(viewedPost.memecoinsspent),
        date: viewedPostData,
        content: String(viewedPost.content),
        file: String(viewedPost.file)
    };
    var processedViewedPostTemplate = `
        <div>
          <div class="advanced-post-container" postID="{{postID}}" data-profit="{{profit}}" clicks="{{clicks}}">
            <div id="advanced-post-stats">
              <span id="advanced-post-upvotes">{{up}}</span>&nbsp;upvotes<br/>
              <span id="advanced-post-downvotes">{{down}}</span>&nbsp;downvotes<br/>
              <span id="advanced-post-clicks">{{clicks}}</span>&nbsp;clicks<br/>
              <span id="advanced-post-mcspent">{{memecoinsspent}}</span>&nbsp;memecoins spent on post<br/>
              <span id="advanced-post-date">{{date}}</span>&nbsp;post was created<br/>
              <span id="advanced-post-id">{{postID}}</span>&nbsp;is post's id#
              <hr/>
              favorited by:<br/>
              <div id="advanced-post-favoriters"></div>
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
            <button class="raise profallow" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
            <button class="raise profallow haters-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
            <span class="advancedButtons">
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(2, {{postID}});"><span class="tooltiptext">convert this post's profit into memecoin, then delete post</span>♻</button>
              <button class="raise protectors-only profallow" onclick="showShieldCensorHarvestBox(1, {{postID}});"><span class="tooltiptext">add a free speech shield to this post</span>🛡</button>
              <button class="raise protectors-only profallow" onclick="showShieldCensorHarvestBox(0, {{postID}});"><span class="tooltiptext">attempt to censor this post</span>&#x1f4a3;</button>
              <button class="raise anonallow" onclick="showShareBox($(this).parent().parent());"><span class="tooltiptext">share this post</span><svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#dfe09d" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button>
              <button class="raise profallow" onclick="favoritePost({{postID}});"><span class="tooltiptext">favorite this post</span>❤</button>
            </span>
            <button class="raise taggers-only profallow" onclick="showTagBox({{postID}});"><span class="tooltiptext">tag this post</span>🏷</button>
            <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
          </div>
        </div>`;
    var html = Mustache.render(processedViewedPostTemplate, viewedPostMustacheData);
    //$('#result').html( html );
    $('#entryContainer').append(html);
    if (is_url(viewedPost.content)) {
        $('#advanced-post-content').empty();
        var urlIframe = "<iframe src='https://web.archive.org/web/" + viewedPost.content + "' height='300px' width='500px' sandbox='allow-same-origin'></iframe>";
        $('#advanced-post-content').append(urlIframe);
    }
    viewedPost.favoritedBy.forEach(function (userWhoFaved) {
        $('#advanced-post-favoriters').append('<button class="raise" onclick="viewProfilePage(' + String(userWhoFaved[0]) + ')">' + userWhoFaved[1] + '</button>');
    });
    console.log("TESTS");
    postsOnThisPage.push(viewedPostMustacheData);
    console.log(postsOnThisPage);
    populatePageWithPosts(repliesToPost, "#entryContainer");
    console.log(postsOnThisPage);
    $('#popular-tag-span').empty();
    if (tags.length == (undefined || 0)) {
        tags.forEach(function (tag) {
            var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">' + tag[0] + '</span>&nbsp;(<span class="number-of-posts-with-tag">' + tag[1] + '</span>)</button>&nbsp;';
            $('#popular-tag-span').append(processedTag);
        });
        $(".popular-tag-button").on("click", function () {
            console.log($(this).children(".tag-name").html());
            $("#entryContainer").empty();
            socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
        });
    }
});
//receiveSinglePostData
socket.on('receiveSinglePostData', function(dataFromServer){
  postsOnThisPage = [];
  console.log("receiveSinglePostData");
  console.log(dataFromServer);
  var viewedPost = dataFromServer[0];
  var repliesToPost = dataFromServer[1];
  var tags = dataFromServer[2];
  var viewedPostData = new Date(viewedPost.postID * 1000).toDateString();
  var viewedPostMustacheData = {
    postID:viewedPost.postID,
    up:String(viewedPost.upvotes),
    down:String(viewedPost.downvotes),
    clicks:String(viewedPost.clicks),
    title:String(viewedPost.title),
    memecoinsspent:String(viewedPost.memecoinsspent),
    date:viewedPostData,
    content:String(viewedPost.content),
    file:String(viewedPost.file)
  };
  var processedViewedPostTemplate = `
        <div>
          <div class="advanced-post-container" postID="{{postID}}" data-profit="{{profit}}" clicks="{{clicks}}">
            <div id="advanced-post-stats">
              <span id="advanced-post-upvotes">{{up}}</span>&nbsp;upvotes<br/>
              <span id="advanced-post-downvotes">{{down}}</span>&nbsp;downvotes<br/>
              <span id="advanced-post-clicks">{{clicks}}</span>&nbsp;clicks<br/>
              <span id="advanced-post-mcspent">{{memecoinsspent}}</span>&nbsp;memecoins spent on post<br/>
              <span id="advanced-post-date">{{date}}</span>&nbsp;post was created<br/>
              <span id="advanced-post-id">{{postID}}</span>&nbsp;is post's id#
              <hr/>
              favorited by:<br/>
              <div id="advanced-post-favoriters"></div>
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
            <button class="raise profallow" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
            <button class="raise profallow haters-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
            <span class="advancedButtons">
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(2, {{postID}});"><span class="tooltiptext">convert this post's profit into memecoin, then delete post</span>♻</button>
              <button class="raise protectors-only profallow" onclick="showShieldCensorHarvestBox(1, {{postID}});"><span class="tooltiptext">add a free speech shield to this post</span>🛡</button>
              <button class="raise protectors-only profallow" onclick="showShieldCensorHarvestBox(0, {{postID}});"><span class="tooltiptext">attempt to censor this post</span>&#x1f4a3;</button>
              <button class="raise anonallow" onclick="showShareBox($(this).parent().parent());"><span class="tooltiptext">share this post</span><svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#dfe09d" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button>
              <button class="raise profallow" onclick="favoritePost({{postID}});"><span class="tooltiptext">favorite this post</span>❤</button>
            </span>
            <button class="raise taggers-only profallow" onclick="showTagBox({{postID}});"><span class="tooltiptext">tag this post</span>🏷</button>
            <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
          </div>
        </div>`;
  var html = Mustache.render(processedViewedPostTemplate, viewedPostMustacheData);
  //$('#result').html( html );
  $('#entryContainer').append(html);
  if(is_url(viewedPost.content)){
    $('#advanced-post-content').empty();
    var urlIframe = "<iframe src='https://web.archive.org/web/"+viewedPost.content+"' height='300px' width='500px' sandbox='allow-same-origin'></iframe>";
    $('#advanced-post-content').append(urlIframe);
  }
  viewedPost.favoritedBy.forEach(function(userWhoFaved){
    $('#advanced-post-favoriters').append('<button class="raise" onclick="viewProfilePage('+String(userWhoFaved[0])+')">'+userWhoFaved[1]+'</button>');
  });
  console.log("TESTS");
  postsOnThisPage.push(viewedPostMustacheData);
  console.log(postsOnThisPage);
  populatePageWithPosts(repliesToPost, "#entryContainer");
  console.log(postsOnThisPage);
    $('#popular-tag-span').empty();
    if (tags.length == (undefined || 0)) {
        tags.forEach(function (tag) {
            var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">' + tag[0] + '</span>&nbsp;(<span class="number-of-posts-with-tag">' + tag[1] + '</span>)</button>&nbsp;';
            $('#popular-tag-span').append(processedTag);
        });
        $(".popular-tag-button").on("click", function () {
            console.log($(this).children(".tag-name").html());
            $("#entryContainer").empty();
            socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
        });
  }
});
//paintPosts
socket.on('paintPosts', function (paintDataArray) {
    paintDataArray.forEach(function (paintPostData) {
        paintPostData = JSON.parse(paintPostData);
        console.log(paintPostData.paintPostId);
        var postToPaint = $("[postid=" + paintPostData.paintPostId + "]");
        var color;
        if (postToPaint !== undefined) {
            console.log(postToPaint);
            postToPaint.css("font-family", paintPostData.paintfont);
            postToPaint.css("border-style", paintPostData.paintborder);
            postToPaint.css("font-size", paintPostData.paintsize);
            postToPaint.css("background-color", paintPostData.paintbackground);
        }
    });
});
//loggedIn
socket.on('loggedIn', function (loginData) {
    loggedIn(loginData);
});
//userDataFound
socket.on('userDataFound', function (userData) {
    console.log(userData);
    postsOnThisPage = [];
    var user = userData[0];
    var tags = userData[1];
    var voted = userData[2];
    var posts = userData[3];
    var faves = userData[4];
    var summons = userData[5];
  //$("#entryContainer").empty();
  var user_date = "1/9/89";//new Date(user.userID * 1000).toDateString();
  var user_mustacheData = {
        userid:String(user.userID),
        username:String(user.name),
        memecoin:String(user.memecoin),
        file:String(user.file),
        date: user_date,
        upvotesdealt:String(user.upvotes),
        downvotesdealt:String(user.downvotes),
        postcount:String(posts.length),
        bio: String(user.content),
        roles: String(user.userroles),
        voted: Array(user.voted),
      follows: String(user.follows),
        userroles: user.userroles
    };
    //check if user is viewing own profile
    var processedUserTemplate = `
            <div userID="{{userid}}">
          <div class="advanced-post-container">
            <div id="advanced-post-stats">
              <span id="advanced-post-upvotes">{{upvotesdealt}}</span>&nbsp;upvotes dealt<br/>
              <span id="advanced-post-downvotes">{{downvotesdealt}}</span>&nbsp;downvotes dealt<br/>
              <span id="advanced-post-mcspent">{{memecoin}}</span>&nbsp;memecoin available<br/>
              <span id="advanced-post-date">{{date}}</span>&nbsp;account was created<br/>
              <hr/>
              favorited:<br/>
              <div id="advanced-post-favoriters"></div>
            </div>
            <div id="advanced-post">
              <img class="activeimage advimg" src="uploaded/{{file}}"/>
              <div id="advanced-post-title">{{title}}</div>
            </div>
            <div id="advanced-post-tags">
            </div>
          </div>
    `;
    if (sessionStorage.getItem('userID') == user.userID) {
        console.log("PROFILE VIEWED MATCHES CURRENTLY LOGGED IN USER, LIST EACH VOTED POST");
        processedUserTemplate += `<div id="advanced-post-content">{{bio}}</div>`;
        voted.forEach((element) => processedUserTemplate += "<div><a href='/?post=" + String(element) + "'>" + String(element) + "</a></div>");
        processedUserTemplate += `
          <div><button id="change-user-settings">Change user settings</button></div>
          <div><button id="view-user-messages" onclick="viewUserMessages({{userid}});">View messages</button></div>
          <div><button id="signout" class="raise profallow" onclick="signout(this);">Sign out</button></div>
        </div>`;
    } else {
        if (sessionStorage.getItem('userroles')[9] == '1') {
            console.log("VIEWING PAGE AS STALKER");
            processedUserTemplate += `<div id="advanced-post-content">{{bio}}</div>`;
            console.log(addRoles(user.userroles, true));
            processedUserTemplate += addRoles(user.userroles, true);
            voted.forEach((element) => processedUserTemplate += "<div><a href='/?post=" + String(element) + "'>" + String(element) + "</a></div>");
        }
        if (user.userroles[11] == '1') {
            console.log("VIEWING LEADER'S PAGE");
            processedUserTemplate = `
          <div><button id="follow-user" onclick="followuser({{userid}});">Follow user</button>&nbsp;{{follows}}&nbsp;followers can't be wrong!</div>
        </div>`;
        } else if (user.userroles[6] == '1') {
            console.log("VIEWING SUMMONER'S PAGE");
            processedUserTemplate = `
        <div><button id="message-user">Message user</button></div>
        </div>`;
        } else {
            processedUserTemplate = `
        </div>`;
        }
    }

  var html = Mustache.render(processedUserTemplate, user_mustacheData);
  $('#entryContainer').append(html);
  $('#pageID-tagname').html("&nbsp;:&nbsp;"+user.name);
  window.history.replaceState(null, null, "/?user="+user.name);
  postsOnThisPage = [];
  populatePageWithPosts(posts, '#entryContainer');
  faves.forEach(function(fave){
    console.log(fave);
    var date = new Date(fave.postID * 1000).toDateString();
    var fave_mustacheData = {
      postID:String(fave.postID),
      profit:String(fave.upvotes-fave.downvotes),
      title:String(fave.title)
    };
    var processedFaveTemplate = `<div class='fave-container'><a href='/?post={{postID}}'>{{profit}} - {{title}}</a></div>`;
    var html = Mustache.render(processedFaveTemplate, fave_mustacheData);
    $('#advanced-post-favoriters').append(html);
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
//msgDataFound
socket.on('msgDataFound', function (results) {
    console.log(results);
    for (const [key, value] of Object.entries(results)) {
        console.log(`${key}: ${value}`);
    }
});

//servergive3users
socket.on('servergive3users', function (threerandomusers) {
    console.log(threerandomusers);
    var i = 0;
    for (let i = 0; i <= threerandomusers.length; i++) {
        var user = threerandomusers[i];
        $('#peopletostalk').append("<li><a href=/?user=" + String(user.userID) + ">" + user.name + "</a></li>");
    }
});

//tagsForPostData
socket.on('tagsForPostData', function (tagsForPostData) {
    console.log('tagsForPostData');
    $('#existingTagsForThisPost').empty();
    $('#popular-tag-span').empty();
    tagsForPostData.forEach(function (tag) {
        var mustacheData = {
            otherposts: tag[0],
            tagname: tag[1],
            tagupvotes: tag[2]
        };
        var tagtemplate = `<button class="postTag" tagname="{{tagname}}">(<a title="# of posts with this tag. click to view all posts with this tag" class="other-posts-with-this-tag" onclick="getAllPostsWithThisTag({{tagname}});">{{otherposts}}</a>)&nbsp;-&nbsp;<span class="tagName">{{tagname}}</span>&nbsp;-&nbsp;(<a title="# of upvotes this tag received for this post. click to spend a memecoin to upvote" class="upvotes-for-tag-for-this-post" onclick="upvoteThisTagForThisPost({{tagname}}, $(this).parent().parent().parent().parent().parent().parent().attr('postID'));">{{tagupvotes}}</a>)</button>&nbsp;&nbsp;`;
        var html = Mustache.render(tagtemplate, mustacheData);
        $('#existingTagsForThisPost').append(html);
        var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">' + tag[1] + '</span>&nbsp;(<span class="number-of-posts-with-tag">' + tag[0] + '</span>)</button>&nbsp;';
        $('#popular-tag-span').append(processedTag);
    });
    $(".popular-tag-button").on("click", function () {
        console.log($(this).children(".tag-name").html());
        $("#entryContainer").empty();
        socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
    });
});
//receiveTagData
socket.on('receiveTagData', function (topPostsForTag) {
    postsOnThisPage = [];
    console.log(topPostsForTag);
    populatePageWithPosts(topPostsForTag[0], "#entryContainer");
    $('#pageID-tagname').html("&nbsp;:&nbsp;" + topPostsForTag[1]);
    window.history.replaceState(null, null, "/?tag=" + topPostsForTag[1]);
});
//receiveTop20Data
socket.on('receiveTop20Data', function (topPostsAndTags) {
    postsOnThisPage = [];
    $('#entryContainer').empty();
    if (getQueryParam('view') == 'old') {
        populateOldSchoolView(topPostsAndTags[0], topPostsAndTags[1]);
    } else {
        populateStandardFeed(topPostsAndTags[0], topPostsAndTags[1]);
    }
});
//receiveRecommendedData
socket.on('receiveRecommendedData', function (recommendedData) {
    postsOnThisPage = [];
    populateStandardFeed(recommendedData[0], recommendedData[1]);
});
//receiveLeaderData
socket.on('receiveLeaderData', function (topPostsAndTags) {
    postsOnThisPage = [];
    $('#entryContainer').empty();
    $('#adjacentBlocks').empty();
    console.log(topPostsAndTags);
    populateStandardFeed(topPostsAndTags[0], topPostsAndTags[1]);
});
//receiveBountiesData
socket.on('receiveBountyData', function (bounties) {
    console.log(bounties);
    populatePageWithPosts(bounties, "#entryContainer");
});

//sendDatabase
socket.on('sendDatabase', function (results) {
    postsOnThisPage = [];
    $('#entryContainer').empty();
    $('#adjacentBlocks').empty();
    console.log(results);
    handleRetrievedDatabase(results);
});
//receiveGroupData
socket.on('receiveGroupData', function (results) {
    postsOnThisPage = [];
    $('#entryContainer').empty();
    $('#adjacentBlocks').empty();
    console.log(results);
    populatePageWithGroups(results);
});
//receiveArbitrationPostsArray
socket.on('receiveArbitrationPostsArray', function (results) {
    populatePageWithReports(results);
    console.log(results);
});
//receiveTop20DataGrid
socket.on('receiveTop20DataGrid', function(results){
  postsOnThisPage = [];
  $('#entryContainer').empty();
  $('#adjacentBlocks').empty();
  $('#gridview').empty();
  populateGrid(results[0]);
  console.log(results);
});
//receiveMultifeedData
socket.on('receiveMultifeedData', function (results) {
    console.log(results);
    postsOnThisPage = [];
    populateMultifeed(results[0], results[1], results[2]);
    document.getElementById('contextButton').innerHTML = 'Home';
});

window.onload = onloadFunction();