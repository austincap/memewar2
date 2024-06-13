///////////////
//RENDERING FUNCTIONS; RELATED TO HOW DATA IS DISPLAYED ON PAGE
function viewPost(postID) {
    sessionStorage.setItem('currentPage', 'post');
    $("#contextButton").html("Home");
    $("#entryContainer").empty();
    window.location.href = '/?post=' + postID;
    // socket.emit('viewpost', postID);
}
function viewProfilePage(userID) {
    sessionStorage.setItem('currentPage', 'user');
    $("#contextButton").html("Home");
    $("#entryContainer").empty();
    window.location.href = '/?user=' + userID;
    //socket.emit('viewuser', sessionStorage.getItem('userID'));
}
function visitpage(pagenum) {
    $("#contextButton").html("Home");
    $("#entryContainer").empty();
    window.location.href = '/?page=' + String(pagenum);
}

//SORTING FUNCTIONS
function arbitratorSort() {
    socket.emit('requestPostsForArbitration');
}
function algomancerSort() {
    //var algomancyvalues = { commentweight: 1, likeweight: 6, sizeweight: 4, timeweight: 1, userweight: 7, viewweight: 1 };
    //console.log(postsOnThisPage);
    //postsOnThisPage.sort((a, b) => ((parseInt(a.postID) * algomancyvalues.timeweight + parseInt(a.up) * algomancyvalues.likeweight + parseInt(a.content.length) * algomancyvalues.sizeweight + parseInt(a.clicks) * algomancyvalues.viewweight + parseInt(a.replycount) * algomancyvalues.commentweight) < (parseInt(b.postID) * algomancyvalues.timeweight + parseInt(b.up) * algomancyvalues.likeweight + parseInt(b.content.length) * algomancyvalues.sizeweight + parseInt(b.clicks) * algomancyvalues.viewweight + parseInt(b.replycount) * algomancyvalues.commentweight)) ? 1 : -1);
    //console.log(postsOnThisPage);
    socket.emit('requestAlgomancerPosts', 1);
}
function controversialSort() {
    console.log(postsOnThisPage);
    postsOnThisPage.sort((a, b) => (parseInt(a.up) + parseInt(a.down) + parseInt(a.replycount) < parseInt(b.up) + parseInt(b.down) + parseInt(b.replycount)) ? 1 : -1);
    console.log(postsOnThisPage);
}
function likedSort() {
    window.location.href = "/?sort=like";
}
function loathedSort() {
    window.location.href = "/?sort=hate";
}
function recentSort() {
    console.log(postsOnThisPage);
    var sortedPosts = [];//= postsOnThisPage.sort((a,b) => (parseInt(a.postID) < parseInt(b.postID)) ? 1 : -1);

    var my_promise = new Promise(
        function (resolve, reject) {
            sortedPosts = postsOnThisPage.sort((a, b) => (parseInt(a.postID) < parseInt(b.postID)) ? 1 : -1);
            if (true) {
                resolve(sortedPosts);
            } else {
                reject(sortedPosts);
            }
        });

    my_promise
        .then(function (data) { console.log(sortedPosts); $("#entryContainer").empty(); })
        .catch(function (data) { console.log("promise rejected"); });
}
function viewedSort() {
    window.location.href = "/?sort=clks";
}
function randomSort() {
    window.location.href = "/?sort=rand";
}
function recommendedSort() {
    window.location.href = "/?sort=recd";
}
function leaderSort() {
    window.location.href = "/?sort=lead";
}

// POPULATING FUNCTIONS
function populateStandardFeed(posts, tags) {
    populatePageWithPosts(posts, "#entryContainer");
    populatePageWithTags(tags, "#popular-tag-span");
}
function populatePageWithPosts(posts, postListContainer) {
    console.log('populatepage');
    console.log(posts);
    // $("#entryContainer").empty();
    // postsOnThisPage = posts;
    posts.forEach(function (post) {
        if (post.type == "text_post") {
            var [mustacheData, processedPostTemplate] = displayTextPost(post);
        } else if (post.type == "poll_post") {
            var [mustacheData, processedPostTemplate] = displayPollPost(post);
        } else if (post.type == "directmessage") {
            var processedPostTemplate = `<span></span>`;
            console.log("DIRECT MESSAGE");
        } else if (post.type == "group") {
            console.log("GROUP");
            var [mustacheData, processedPostTemplate] = displayGroup(post);
        } else {
            var processedPostTemplate = `<span></span>`;
            console.log("UNKNOWN POST TYPE");
        }
        //console.log(processedPostTemplate);
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $(postListContainer).append(html);
    });
}
function populatePageWithTags(tags, tagContainer) {
    //console.log(tags);
    tags.forEach(function (tag) {
        var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">' + tag[0] + '</span>&nbsp;(<span class="number-of-posts-with-tag">' + tag[1] + '</span>)</button>&nbsp;';
        $(tagContainer).append(processedTag);
    });
    $(".popular-tag-button").on("click", function () {
        console.log($(this).children(".tag-name").html());
        $("#entryContainer").empty();
        socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
    });
}
function populateGrid(postsAndAllTagData) {
    console.log(postsAndAllTagData);
    //$("#entryContainer").empty();
    postsOnThisPage = postsAndAllTagData;
    var tags = [];
    postsAndAllTagData.forEach(function (post) {
        console.log(post);
        var date = new Date(post.postID * 1000).toDateString();
        var mustacheData = {
            postID: String(post.postID),
            profit: String(post.upvotes - post.downvotes),
            up: String(post.upvotes),
            down: String(post.downvotes),
            file: 'uploaded/' + String(post.file),
            date: date,
            replycount: String(post.replycount),
            clicks: String(Math.ceil(post.clicks / 10)),
            title: String(post.title),
            content: String(post.content),
            tags: post.tagArray
        };
        postsOnThisPage.push(mustacheData);
        console.log("GRID VIEW");
        console.log(mustacheData.tags);
        tags.push(mustacheData.tags);
        var processedPostTemplate = `<div style='border-width:{{clicks}}px;' class='gridcell' postID='{{postID}}'>
                                <div class='gridtitle'>{{title}}</div>
                                <a id='{{postID}}' data-toggle='tooltip' title='{{title}}{{#tags}}&nbsp;{{.}}&nbsp;{{/tags}}' href='/?post={{postID}}'>
                                <img src='{{file}}'/>
                                </a>
                                <div class='gridtitle'>{{date}}</div>
                                </div>`;
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $('#gridview').append(html);
    });
    $('#entryContainer').append($('#gridview'));
    $('#entryContainer').prepend($('#tagColumn'));
    //populatePageWithTags(tags, '#tagColumn');
    // tags.forEach(function(tag){
    //   var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
    //   $('#popular-tag-span').append(processedTag); 
    // });
    $(".popular-tag-button").on("click", function () {
        console.log($(this).children(".tag-name").html());
        $("#entryContainer").empty();
        socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
    });
}
function populateMultifeed(posts1, posts2, posts3) {
    $('#multiContainer').css('display', 'grid');
    // console.log(posts1);
    // $("#entryContainer").empty();
    // postsOnThisPage = posts;
    posts1.forEach(function (post) {
        if (post.type == "text_post") {
            var [mustacheData, processedPostTemplate] = displayTextPost(post);
        } else
            if (post.type == "poll_post") {
                var [mustacheData, processedPostTemplate] = displayPollPost(post);
            } else {
                var processedPostTemplate = `<span></span>`;
                console.log("UNKNOWN POST TYPE");
            }
        //console.log(processedPostTemplate);
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $('#multi-left').append(html);
    });
    posts2.forEach(function (post) {
        if (post.type == "text_post") {
            var [mustacheData, processedPostTemplate] = displayTextPost(post);
        } else if (post.type == "poll_post") {
            var [mustacheData, processedPostTemplate] = displayPollPost(post);
        } else {
            var processedPostTemplate = `<span></span>`;
            console.log("UNKNOWN POST TYPE");
        }
        //console.log(processedPostTemplate);
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $('#multi-center').append(html);
    });
    posts3.forEach(function (post) {
        if (post.type == "text_post") {
            var [mustacheData, processedPostTemplate] = displayTextPost(post);
        } else if (post.type == "poll_post") {
            var [mustacheData, processedPostTemplate] = displayPollPost(post);
        } else {
            var processedPostTemplate = `<span></span>`;
            console.log("UNKNOWN POST TYPE");
        }
        //console.log(processedPostTemplate);
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $('#multi-right').append(html);
    });
}
function multistreamView() {
    window.location.href = "/?sort=multi";
}

function displayTextPost(post) {
    console.log(post);
    var date = new Date(post.postID * 1000).toDateString();
    var replycount = post.replycount !== undefined ? String(post.replycount) : "?";
    var mustacheData = {
        postID: String(post.postID),
        profit: String(post.upvotes - post.downvotes),
        up: String(post.upvotes),
        down: String(post.downvotes),
        file: String(post.file),
        date: date,
        replycount: replycount,
        clicks: String(post.clicks),
        title: String(post.title),
        content: String(post.content),
        poster: "",
        posterID: ""
    };
    //CHECK IF POST HAS A LOCATION AND IS NOT DEFAULT LOCATION
    if (post.location !== undefined && post.location !== "") {
        console.log("POST HAS LOCATION");
        mustacheData.location = post.location.split("+").map(element => parseFloat(element));
        let circle = L.circle(mustacheData.location, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(mapDisplay);
        circle.bindPopup("<a href='/?post=" + mustacheData.postID + "' onclick='viewPost(" + mustacheData.postID + ");'>" + mustacheData.title + "</a>");
    }
    //CHECK if poster is a Leader
    if (post.poster !== undefined) {
        let temppost = post.poster[0];
        if (!temppost.some(function (i) { return i === null; })) {
            console.log(temppost);
            if (temppost[1][11] == "1") {
                console.log("LEADER FOUND");
                mustacheData["poster"] = temppost[0] + " ⭐";
                mustacheData["posterID"] = temppost[2];
            }
        }
    }

    postsOnThisPage.push(mustacheData);
    //console.log(date);
    var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'>
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div>
                </a>
                <div class='post-header'>
                <span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit
                </span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='poster-tooltip'><a href='/?user={{posterID}}'><span class='tooltiptext'>view OP</span>{{poster}}</a>&nbsp;</span>&nbsp;&nbsp;
                  &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>-->
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                <button class='raise profallow lurkers-not-only' onclick='showVoteBox({{postID}}, true);'><span class='tooltiptext'>upvote</span><span style='filter:sepia(100%);'>🔺</span></button>
                <button class='raise profallow haters-only' onclick='showVoteBox({{postID}}, false);'><span class='tooltiptext'>downvote</span><span style='filter:sepia(100%);'>🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                <button class='raise profallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='showRecommendBox({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button>
                <button class='raise profallow stalkers-only' onclick='stalkPoster({{postID}});'><span class='tooltiptext'>stalk user</span>🔍</button>
                <button class='raise anonallow' onclick='showReportBox({{postID}});'><span class='tooltiptext'>report this post</span>⚠️</button>
                <button class='raise profallow' onclick='showAdminBox({{postID}});'><span class='tooltiptext'>admin tools</span>🛠️</button>
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
    return [mustacheData, processedPostTemplate];
}
function displayPollPost(post) {
    console.log('POLL POST');
    console.log(post);
    var date = new Date(post.postID * 1000).toDateString();
    console.log("OPTIONVOTESCONTENT");
    console.log(post.optionvotes);
    var percentagearray = [];
    var percentagetotal = post.optionvotes.reduce((a, b) => a + b, 0);
    console.log(percentagetotal);
    for (var i = 0; i < post.content.length; ++i) {
        percentagearray[i] = (100 * post.optionvotes[i] / (percentagetotal + 1)).toFixed(1);
    }
    console.log("PERCENTAGEARRAY");
    console.log(percentagearray);
    //newvoteoptionscontains[index in optionvote array, vote tally in optionvote array]
    var newvoteoptions = [];
    for (const [index, element] of percentagearray.entries()) {
        newvoteoptions.push([index, post.optionvotes[index]]);
    }
    console.log(newvoteoptions);
    var mustacheData = {
        postID: String(post.postID),
        profit: String(post.upvotes - post.downvotes),
        up: String(post.upvotes),
        down: String(post.downvotes),
        file: String(post.file),
        date: date,
        replycount: String(post.replycount),
        clicks: String(post.clicks),
        title: String(post.title),
        content: post.content,
        percentagearray: percentagearray,
        voteoptions: newvoteoptions
    };
    postsOnThisPage.push(mustacheData);
    //console.log(date); <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'> </a>  {{#percentagearray}}<ul class="chartlist"> <li><span class='count'>{{.}}</span><span class='index' style='width: {{.}}%'></span></li></ul>{{/percentagearray}}
    var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>

                <div class='post'>
                    <div class='permahidden post-visual'><img class='activeimage' src='uploaded/{{file}}' /></div>
                    <div class='post-title-helper'><span class='post-title'>{{title}}</span></div>
                        <div class="post-content">
                            <div class='post-content-span polldiv'>
                                <div display='table'>
                                    <div style='float:left; width:8%;'>
                                        {{#percentagearray}} <div style='font-size:1.25vw; line-height:1.2;'>{{.}}%</div>{{/percentagearray}}
                                    </div>
                                    <div style='float:left; width:8%;'>
                                        {{#content}}<div style='font-size:1.25vw; line-height:1.2;'>{{.}} </div> {{/content}}
                                    </div>
                                    <div class='pollButtons'>
                                        {{#voteoptions}}<button class='pollButtons' style='font-size:1.25vw; line-height:1.2;' onclick='voteForThisPollOption({{postID}},{{.}});'>vote</button>{{/voteoptions}}
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>

                <div class='post-header'>
                    <span class='upvotes-tooltip'>
                        <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                        <span class='upvotecount'>{{profit}}</span>&nbsp;profit
                    </span>&nbsp;&nbsp;|
                    &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                    &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                    &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                    &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>-->
                </div>

                <div class='post-buttons'>
                    <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                    <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
                    <button class="raise profallow haters-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
                    <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                    <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                    <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                    <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                    <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                    <button class='raise anonallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                    <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                    <button class='raise profallow tastemakers-only' onclick='showRecommendBox({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                    <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button>
                    <button class='raise profallow stalkers-only' onclick='stalkPoster({{postID}});'><span class='tooltiptext'>stalk user</span>🔍</button>
                    <button class='raise anonallow' onclick='showReportBox({{postID}});'><span class='tooltiptext'>report this post</span>⚠️</button>
                    <button class='raise profallow' onclick='showAdminBox({{postID}});'><span class='tooltiptext'>admin tools</span>🛠️</button>
                    <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
                </div>
            </div>`;
    return [mustacheData, processedPostTemplate];
}
function displayGroup(group) {
    console.log(group);
    var date = new Date(group.postID * 1000).toDateString();
    var mustacheData = {
        postID: String(group.postID),
        profit: String(group.upvotes - group.downvotes),
        up: String(group.upvotes),
        down: String(group.downvotes),
        file: String(group.file),
        date: date,
        clicks: String(group.clicks),
        title: String(group.title),
        content: String(group.content),
        poster: group.poster,
        posterID: String(group.postID),
        members: String(group.members),
        settings: String(group.settings),
        postcount: String(group.posts),
        members: String(group.members)
    };
    //CHECK IF POST HAS A LOCATION AND IS NOT DEFAULT LOCATION
    if (group.location !== undefined && group.location !== "") {
        console.log("POST HAS LOCATION");
        mustacheData.location = post.location.split("+").map(element => parseFloat(element));
        let circle = L.circle(mustacheData.location, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(mapDisplay);
        circle.bindPopup("<a href='/?post=" + mustacheData.postID + "' onclick='viewPost(" + mustacheData.postID + ");'>" + mustacheData.title + "</a>");
    }


    postsOnThisPage.push(mustacheData);
    //console.log(date);
    var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                <a class='post-helper' href='/?group={{postID}}' onclick='viewGroup({{postID}});'>
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div>
                </a>
                <div class='post-header'>
                <span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit
                </span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{postcount}}</span>&nbsp;posts</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-memcount'>{{members}}</span>&nbsp;members</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='poster-tooltip'><a href='/?user={{posterID}}'><span class='tooltiptext'>view OP</span>{{poster}}</a>&nbsp;</span>&nbsp;&nbsp;
                  &nbsp;&nbsp;
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise profallow lurkers-not-only' onclick='showVoteBox({{postID}}, true);'><span class='tooltiptext'>upvote</span><span style='filter:sepia(100%);'>🔺</span></button>
                <button class='raise profallow haters-only' onclick='showVoteBox({{postID}}, false);'><span class='tooltiptext'>downvote</span><span style='filter:sepia(100%);'>🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise profallow' onclick='joinGroup({{postID}});'><span class='tooltiptext'>join this group</span>👐</button>
                <button class='raise profallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='showRecommendBox({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button>
                <button class='raise profallow stalkers-only' onclick='stalkPoster({{postID}});'><span class='tooltiptext'>stalk founder</span>🔍</button>
                <button class='raise anonallow' onclick='showReportBox({{postID}});'><span class='tooltiptext'>report this post</span>⚠️</button>
                <button class='raise profallow' onclick='showAdminBox({{postID}});'><span class='tooltiptext'>admin tools</span>🛠️</button>
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
    return [mustacheData, processedPostTemplate];
}

function viewGroup(groupID) {

}

//POPULATING WITH NON-POSTS
function viewUserMessages(userID) {
    socket.emit('viewmessages', userID);
}
function populateMessages(messages) {
    console.log(messages);
}
function populatePageWithReports(reportarray) {
    var html = `<table>
              <tr>
                <th>PostID</th>
                <th>Title</th>
                <th>Reasons</th>
                <th>Upvotes</th>
              </tr>`;
    $('#entryContainer').append(html);
    reportarray.forEach(function (post) {
        var mustacheData = {
            postID: String(post[0]),
            title: post[1],
            reasons: post[2],
            upvotes: post[3]
        }
        postsOnThisPage.push(mustacheData);
        //console.log(date);
        var processedPostTemplate = `
            <tr>
            <td>{{postID}}</td><td>{{title}}</td><td>{{reasons}}</td><td>{{upvotes}}</td>
            </tr>
        `;
        html = Mustache.render(processedPostTemplate, mustacheData);
        $('#entryContainer').append(html);
    });
    $('#entryContainer').append('</table>');
}
function requestGroups() {
    console.log('request groups');
    socket.emit('requestGroups', 0);
}
function populatePageWithGroups(groups) {
    $('#pageID').html('all groups');
    populatePageWithPosts(groups[0], "#entryContainer");
}

function showSeaOfDivs() {
    console.log('SEA VIEW');
    //window.history.replaceState(null, null, "/?view=sea");
    for (var i = 0; post = postsOnThisPage[i]; i++) {
        console.log(post.postID);
        let el = document.querySelector('[postid="' + String(post.postID) + '"]');
        if (el !== undefined && el !== null) {
            el.style.setProperty('--rand', Math.random());
            var ne = $('div[postid=' + String(post.postID) + ']');
            ne.addClass("animate");
            ne.addClass("x");
            ne.addClass("y");
        }
    }
    $('#entryContainer').css({ "maxHeight": "700px" });
}
function showMap() {
    $('#entryContainer').empty();
    var mapContainer = $('#mapDisplay');
    mapContainer.detach();
    mapContainer.appendTo('#entryContainer');
    mapContainer.css('display', 'block');
}
