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
            socket.emit('requestRandPosts', getQueryParam("rand"), getQueryParam("page"));
        } else {
            socket.emit('requestRandPosts', getQueryParam("rand"), "0");
        }
    } else if (getQueryParam("sort") == "recd") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestRecommendedPosts', getQueryParam("page"));
        } else {
            socket.emit('requestRecommendedPosts', "0");
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
    }, 800);
}

//////////////////////////
// BUBBLE VIEW
function BubbleChart(data, {
  name = ([x]) => x, // alias for label
  label = name, // given d in data, returns text to display on the bubble
  value = ([, y]) => y, // given d in data, returns a quantitative size
  group, // given d in data, returns a categorical value for color
  title, // given d in data, returns text to show on hover
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links, if any
  width = 640, // outer width, in pixels
  height = width, // outer height, in pixels
  padding = 3, // padding between circles
  margin = 1, // default margins
  marginTop = margin, // top margin, in pixels
  marginRight = margin, // right margin, in pixels
  marginBottom = margin, // bottom margin, in pixels
  marginLeft = margin, // left margin, in pixels
  groups, // array of group names (the domain of the color scale)
  colors = d3.schemeTableau10, // an array of colors (for groups)
  fill = "#ccc", // a static fill color, if no group channel is specified
  fillOpacity = 0.7, // the fill opacity of the bubbles
  stroke, // a static stroke around the bubbles
  strokeWidth, // the stroke width around the bubbles, if any
  strokeOpacity, // the stroke opacity around the bubbles, if any
} = {}) {
  // Compute the values.
  const D = d3.map(data, d => d);
  const V = d3.map(data, value);
  const G = group == null ? null : d3.map(data, group);
  const I = d3.range(V.length).filter(i => V[i] > 0);

  // Unique the groups.
  if (G && groups === undefined) groups = I.map(i => G[i]);
  groups = G && new d3.InternSet(groups);

  // Construct scales.
  const color = G && d3.scaleOrdinal(groups, colors);

  // Compute labels and titles.
  const L = label == null ? null : d3.map(data, label);
  const T = title === undefined ? L : title == null ? null : d3.map(data, title);

  // Compute layout: create a 1-deep hierarchy, and pack it.
  const root = d3.pack()
      .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
      .padding(padding)
    (d3.hierarchy({children: I})
        .sum(i => V[i]));



  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("fill", "currentColor")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");


  const leaf = svg.selectAll("a")
    .data(root.leaves())
    .join("a")
      .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => `translate(${d.x},${d.y})`);

  leaf.append("circle")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
      .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
      .attr("fill-opacity", fillOpacity)
      .attr("r", d => d.r);

  if (T) leaf.append("title")
      .text(d => T[d.data]);

  if (L) {
    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    leaf.append("clipPath")
        .attr("id", d => `${uid}-clip-${d.data}`)
      .append("circle")
        .attr("r", d => d.r);

    leaf.append("text")
        .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
      .selectAll("tspan")
      .data(d => `${L[d.data]}`.split(/\n/g))
      .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
        .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
        .text(d => d);
  }

  return Object.assign(svg.node(), {scales: {color}});
}




// ACCOUNT FUNCTIONS
function signout(thisButton) {
    sessionStorage.clear();
    $('#accountButton').html("Account");
    $('#signout').css('display', 'none');
    location.reload("localhost");
}
function registerNewUser() {
    console.log($('#rolenumbers').html());
    console.log($('#submitRoleButton').html());
    var registrationData = {
        username: $('#signInName').val(),
        password: $('#passwordvalue').val(),
        newuserRoles: $('#rolenumbers').html(),
        role: $('#submitRoleButton').html()
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
  console.log($($(thisButton).children()[0]).attr('userid'));
  if($(thisButton).html()=="Account"){
      $('#signinstuff').css('display', 'inline-block');
      $('#signup-overlay-box').css('display', 'inline-block');
      $(thisButton).html("Close");
  }else if($(thisButton).html()=="Close"){
      $('#signinstuff').css('display', 'none');
      $(thisButton).html("Account");
  }else if(String($($(thisButton).children()[0]).attr('userid'))==sessionStorage.getItem('userID')){
      console.log("ETE");
      viewProfilePage(sessionStorage.getItem('userID'));
  }
}


function addRoles(rollString, falseisnormaltrueisdisplayall) {
    console.log("ADD ROLES");
    console.log(sessionStorage.getItem('userroles'));
    var stringofroles = "";
    if (rollString[0] == '1') {
        $(".lurkers-only").css("display", "none");
    } 
    if (rollString[1] == '1') { $(".taggers-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "tagger "; }
    } else { $(".taggers-only").css("display", "none"); }
    if (rollString[2] == '1') { $(".painters-only").css("display", "inline");
        //document.querySelectorAll('.painters-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "painter "; }
    } else { $(".painters-only").css("display", "none"); }
    if (rollString[3] == '1') { $(".pollsters-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "pollster "; }
    } else { $(".pollsters-only").css("display", "none"); }
    if (rollString[4] == '1') { $(".tastemakers-only").css("display", "inline");
        //document.querySelectorAll('.tastemakers-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "tastemaker "; }
    } else { $(".tastemakers-only").css("display", "none"); }
    if (rollString[5] == '1') { $(".explorers-only").css("display", "inline");
        document.querySelectorAll('.explorers-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "explorer "; }
    } else { $(".explorers-only").css("display", "none"); }
    if (rollString[6] == '1') { $(".summoners-only").css("display", "inline");
        //document.querySelectorAll('.summoners-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "summoner "; }
    } else { $(".summoners-only").css("display", "none"); }
    if (rollString[7] == '1') {  $(".protectors-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "protector "; }
    } else { $(".protectors-only").css("display", "none"); }
    if (rollString[8] == '1') { $(".arbitrators-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "arbitrator "; }
    } else { $(".arbitrators-only").css("display", "none"); }
    if (rollString[9] == '1') {
        $(".stalkers-only").css("display", "inline");
        socket.emit("get3users");
        if (falseisnormaltrueisdisplayall) { stringofroles += "stalker "; }
    } else { $(".stalkers-only").css("display", "none"); }
    if (rollString[10] == '1') { $(".editors-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "editor "; }
    } else { $(".editors-only").css("display", "none"); }
    if (rollString[11] == '1') { $(".leaders-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "leader "; }
    } else { $(".leaders-only").css("display", "none"); }
    if (rollString[12] == '1') { $(".counselors-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "counselor "; }
    } else { $(".counselors-only").css("display", "none"); }
    if (rollString[13] == '1') { $(".founders-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "founder "; }
    } else { $(".founders-only").css("display", "none"); }
    if (rollString[14] == '1') { $(".algomancers-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "algomancer "; }
    } else { $(".algomancers-only").css("display", "none"); }
    if (falseisnormaltrueisdisplayall) { return stringofroles; }
}
function getFirstRole(rollString) {
    for (let i = 0; i < rollString.length; i++) {
        if (rollString[i] == '1') {
            switch (i) {
                case 0:
                    return "Hater";
                case 1:
                    return "Tagger";
                case 2:
                    return "Painter";
                case 3:
                    return "Pollster";
                case 4:
                    return "Tastemaker";
                case 5:
                    return "Explorer";
                case 6:
                    return "Summoner";
                case 7:
                    return "Silencer";
                case 8:
                    return "Arbitrator";
                case 9:
                    return "Stalker";
                case 10:
                    return "Editor";
                case 11:
                    return "Leader";
                case 12:
                    return "Counselor";
                case 13:
                    return "Founder";
                case 14:
                    return "Algomancer";
                default:
                    return "No thing found";
            }
        } 
    }
}
function selectThisRole(roleName) {
    console.log(roleName);
    var rolenumber = '000000000000000';
    switch (roleName) {
        case "Hater":
            rolenumber = '100000000000000';
            break;
        case "Tagger":
            rolenumber = '010000000000000';
            break;
        case "Painter":
            rolenumber = '001000000000000';
            break;
        case "Pollster":
            rolenumber = '000100000000000';
            break;
        case "Tastemaker":
            rolenumber = '000010000000000';
            break;
        case "Explorer":
            rolenumber = '000001000000000';
            break;
        case "Summoner":
            rolenumber = '000000100000000';
            break;
        case "Protector":
            rolenumber = '000000010000000';
            break;
        case "Arbitrator":
            rolenumber = '000000001000000';
            break;
        case "Stalker":
            rolenumber = '000000000100000';
            break;
        case "Editor":
            rolenumber = '000000000010000';
            break;
        case "Leader":
            rolenumber = '000000000001000';
            break;
        case "Counselor":
            rolenumber = '000000000000100';
            break;
        case "Founder":
            rolenumber = '000000000000010';
            break;
        case "Algomancer":
            rolenumber = '000000000000001';
            break;
        default:
            rolenumber = '000000000000000';
            break;
    }
    console.log(rolenumber);
    $('#rolenumbers').text(rolenumber);
    $('#submitRoleButton').text(roleName);
}
function returnChooseRoleBox() {
    $('#signup-overlay-box').css('display', 'none');
}



function contextButtonFunction(currentContext) {
    console.log(currentContext);
    switch (currentContext) {
        case 'Home':
            $('#gridview').css('display', 'none');
            d3.select('svg').selectAll('*').remove();
            $('#d3frame').css('display', 'none');
            sessionStorage.setItem('currentPage', 'home');
            window.history.replaceState(null, null, "/?view=" + 'norm');
            document.getElementById('contextButton').innerHTML = 'Net';
            socket.emit('requestTop20Posts', 0);
            break;
        case 'Net':
            $('#entryContainer').empty();
            $('#d3frame').css('display', 'block');
            sessionStorage.setItem('currentPage', 'net');
            window.history.replaceState(null, null, "/?view=" + 'net');
            document.getElementById('contextButton').innerHTML = 'Grid';
            socket.emit('retrieveDatabase');
            break;
        case 'Grid':
            $('#entryContainer').empty();
            d3.select('svg').selectAll('*').remove();
            $('#d3frame').css('display', 'none');
            $('#gridview').css('display', 'grid');
            sessionStorage.setItem('currentPage', 'grid');
            window.history.replaceState(null, null, "/?view=" + 'grid');
            document.getElementById('contextButton').innerHTML = 'Sea';
            socket.emit('retrieveDatabaseGrid');
            break;
        case 'Sea':
            showSeaOfDivs();
            //$('#entryContainer').empty();
            $('#multiContainer').empty();
            $('#multiContainer').css('display', 'none');
            $('#entryContainer').css('display', 'block');
            sessionStorage.setItem('currentPage', 'sea');
            window.history.replaceState(null, null, "/?view=" + 'sea');
            document.getElementById('contextButton').innerHTML = 'Multi';
            break;
        case 'Multi':
            $('#gridview').css('display', 'none');
            $('#entryContainer').empty();
            $('#multiContainer').empty();
            $('#multiContainer').css('display', 'block');
            sessionStorage.setItem('currentPage', 'multi');
            window.history.replaceState(null, null, "/?view=" + 'multi');
            multistreamView();
            document.getElementById('contextButton').innerHTML = 'Home';
            break;
        case '3D':
            window.location.assign("taro.html");
            break;
    }
}


//////////
//LISTENERS
///////////
//userChecked
socket.on('userChecked', function(resultOfCheck){
  console.log(resultOfCheck);
  switch(resultOfCheck.task){
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
    case 'favoritedPost':
      console.log('should be fave now');
      break;
    case 'successfulPollVote':
      console.log('successfulPollVote');
      break;
    case 'failedPollVote':
      console.log('not enough memecoin to vote');
      break;
    default:
      break;
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
socket.on('loggedIn', function(loginData){
    sessionStorage.setItem('userID', loginData.userID);
    sessionStorage.setItem('username', loginData.name);
    sessionStorage.setItem('memecoin', loginData.memecoin);
    sessionStorage.setItem("userroles", loginData.userroles);
    addRoles(loginData.userroles, false);
    console.log(loginData);
    //sessionStorage.setItem('role', loginData.role);
    $('#signinstuff').css('display', 'none');
    $('#signup-overlay-box').css('display', 'none');
    $('#accountButton').html("<span userid="+sessionStorage.getItem('userID')+"></span>"+sessionStorage.getItem('username')+"&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>"+sessionStorage.getItem('memecoin').substring(0,4)+"₿</span>");
    $('#accountButton').attr('userid', sessionStorage.getItem('userID'));
    $('#currentrole').html(getFirstRole(loginData.userroles));
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

//sendDatabase
socket.on('sendDatabase', function (results) {
    postsOnThisPage = [];
    $('#entryContainer').empty();
    $('#adjacentBlocks').empty();
    console.log(results);
    handleRetrievedDatabase(results);
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