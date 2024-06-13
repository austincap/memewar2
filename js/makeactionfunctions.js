
function upvoteThisTagForThisPost(tagname, postID) {
    console.log(tagname);
    console.log(postID);
    var stuffToCheck = {
        userID: parseInt(sessionStorage.getItem("userID")),
        postID: postID,
        data: tagname,
        task: "upvotetag"
    };
    socket.emit("check", stuffToCheck);
}
function submitTag(tagname, postID) {
    console.log(tagname);
    console.log(postID);
    var tagPostOrUser = {
        tagname: tagname,
        postID: postID,
        userID: sessionStorage.getItem("userID"),
        postIfTrue: true
    };
    socket.emit('tagPostOrUser', tagPostOrUser);
}
function showTagBox(postID) {
    console.log(postID);
    socket.emit('requestTagsForPost', postID);
    returnNewPostBox();
    returnReplyBox();
    returnNewStatsBox();
    returnShieldCensorHarvestBox();
    returnShareBox();
    var tagContainer = $('#tagContainer');
    tagContainer.detach();
    tagContainer.appendTo('#' + String(postID));
    tagContainer.css('display', 'block');
}
function returnTagBox() {
    var tagContainer = $('#tagContainer');
    tagContainer.detach();
    tagContainer.appendTo('#divStorage');
    tagContainer.css('display', 'none');
}
function getAllPostsWithThisTag(tagname) {
    sessionStorage.setItem('currentPage', 'tag');
    $("#contextButton").html("Home");
    $("#entryContainer").empty();
    window.location.href = '/?tag=' + tagname;
    //socket.emit("requestPostsWithTag", tagname);
}


function showNewPollBox() {
    $('#userID-poll').val(sessionStorage.getItem('userID'));
    $('#posttype-poll').val('poll_post');
    var newPollContainer = $('#pollContainer');
    newPollContainer.detach();
    newPollContainer.appendTo('body');
    newPollContainer.css('display', 'block');
}
function addPollOption() {
    var pollOptionCounter = String($("#pollOptionContainer > textarea").length + 1);
    if (parseInt(pollOptionCounter) > 6) { console.log("NO MORE"); }
    else {
        var newOptionId = "uploadPollOption-" + pollOptionCounter;
        var newOptionName = "pollOption" + pollOptionCounter;
        var foo = createElementFromHTML('<textarea type="text" style="height:30px;" placeholder="write a poll option here" id="' + newOptionId + '" name="' + newOptionName + '" maxlength="800"></textarea>');
        $('#pollOptionContainer').append(foo);
        $('#pollOptionContainer').append(document.createElement("br"));
    }
}
function returnPollBox() {
    $('#pollContainer').css('display', 'none');
}
function submitNewPoll() {
    console.log("submit poll");
    $("#uploadTitle-poll").empty();
    $("#uploadPollOption-1").empty();
    $("#uploadPollOption-2").empty();
    $("#uploadPollOption-3").empty();
    $("#uploadPollOption-4").empty();
    $("#uploadPollOption-5").empty();
    $("#uploadPollOption-6").empty();
    $("#sampleFile-poll").empty();
    document.querySelector('#myimg').src = "";
    displayStatus("Poll posted.")
    returnPollBox();
}
function voteForThisPollOption(postID, voteoptionindex, voteoptiontally) {
    var stuffToCheck = {
        userID: parseInt(sessionStorage.getItem('userID')),
        postID: parseInt(postID),
        taskToCheck: 'pollvote',
        data: {
            voteoptionindex: voteoptionindex,
            voteoptiontally: voteoptiontally
        }
    };
    console.log(stuffToCheck);
    socket.emit('check', stuffToCheck);
}


function favoritePost(postID) {
    //0 favorites post, 1 favorites tag, 2 favorites user
    console.log({ faveType: 0, postidORtagnameORuserid: postID, userid: sessionStorage.getItem('userID') });
    socket.emit('favorite', { faveType: 0, postidORtagnameORuserid: postID, userid: parseInt(sessionStorage.getItem('userID')) });
    return;
}
function showAdvancedButtons(postID) {
}

function showAlgomancyBox() {

    $('#algomancy-overlay-box').css('display', 'block');
    $("#likeweight").bind('keyup change click', function (e) {
        if (!$(this).data("previousValue") ||
            $(this).data("previousValue") != $(this).val()
        ) {
            console.log("changed");
            $(this).data("previousValue", $(this).val());
        }
    });
    $("#likeweight").each(function () {
        $(this).data("previousValue", $(this).val());
    });
}
function submitNewAlgomance() {
    console.log("ALGOMANCE SENT");
    $("#likeweight").empty();
    $("#sizeweight").empty();
    $("#viewweight").empty();
    $("#timeweight").empty();
    $("#commentweight").empty();
    $("#userweight").empty();
    returnAlgomancyBox();
}
function returnAlgomancyBox() {
    $('#algomancy-overlay-box').css('display', 'none');
}

function showPaintBox(postid) {
    console.log("SHOW POSTID");
    console.log(postid);
    $('#paintPostId').val(postid);
    $('#paintUserId').val(sessionStorage.getItem('userID'));
    $('#paintContainer').css('display', 'block');
}
function returnPaintBox() {
    $('#paintContainer').css('display', 'none');
}
function submitNewPaint() {
    console.log("SUBMIT PAINT CHANGE");
    displayStatus("Post painted. Refresh to see changes.");
}
function showPaintedPosts() {
    socket.emit('requestPaint');
}

function confirmCensor(postID) {
    if (sessionStorage.getItem('memecoin') > 50) {
        var dataPacket = {
            userID: sessionStorage.getItem('userID'),
            postID: postID
        };
        socket.emit('censorAttempt', dataPacket);
        //$('#censorShieldHarvestContainer').css('display', 'none');
    }
}
function confirmHarvest(postElement) {
    console.log(postElement);
    socket.emit('harvestPost', postElement, sessionStorage.getItem("userID"));
}
function showShieldCensorHarvestBox(zeroIsCensorOneIsShieldTwoIsHarvest, postElement) {
    var userID = (sessionStorage.getItem('userID') !== null) ? sessionStorage.getItem('userID') : "ANON";
    console.log(userID);
    returnTagBox();
    returnNewPostBox();
    returnNewStatsBox();
    returnReplyBox();
    returnShareBox();
    if (zeroIsCensorOneIsShieldTwoIsHarvest == 1) {
        $('.censormessage').css('display', 'none');
        $('.shieldmessage').css('display', 'block');
        $('.harvestmessage').css('display', 'none');
        socket.emit('check', { userID: userID, postID: postElement, taskToCheck: 'shield', data: 'EEEEEEEEEEEE' });
    } else if (zeroIsCensorOneIsShieldTwoIsHarvest == 0) {
        $('.censormessage').css('display', 'block');
        $('.shieldmessage').css('display', 'none');
        $('.harvestmessage').css('display', 'none');
        socket.emit('check', { userID: userID, postID: postElement, taskToCheck: 'censor', data: 'EEEEEEEEEEEE' });
    } else {
        $('.censormessage').css('display', 'none');
        $('.shieldmessage').css('display', 'none');
        $('.harvestmessage').css('display', 'block');
        socket.emit('check', { userID: userID, postID: postElement, taskToCheck: 'harvest', data: 'EEEEEEEEEEEE' });
    }
    var censorShieldHarvestContainer = $('#censorShieldHarvestContainer');
    censorShieldHarvestContainer.detach();
    console.log(postElement);
    console.log($('#' + postElement));
    censorShieldHarvestContainer.appendTo($('#' + String(postElement)));
    censorShieldHarvestContainer.css('display', 'block');
}
function returnShieldCensorHarvestBox() {
    var censorShieldHarvestContainer = $('#censorShieldHarvestContainer');
    censorShieldHarvestContainer.detach();
    censorShieldHarvestContainer.appendTo('#divStorage');
    censorShieldHarvestContainer.css('display', 'none');
}

function showReplyBox(postElement) {
    if (rotateToCloseButton()) {
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
        replyContainer.appendTo('#' + postID);
        replyContainer.css('display', 'flex');
    }
}
function returnReplyBox() {
    // var fileuploader = $('#fileuploader');
    // fileuploader.detach();
    // fileuploader.appendTo('#divStorage');
    // fileuploader.css('display', 'none');
    var replyContainer = $('#replyContainer');
    replyContainer.detach();
    replyContainer.appendTo('#divStorage');
    replyContainer.css('display', 'none');
}
function submitReply(postElement) {
    console.log("submit reply");
    displayStatus("Replied to post.");
    $('#uploadContent-reply').empty();
    //$("#entryContainer").empty();
    $('#tagForNewReply').empty();
    $("#sampleFile-reply").empty();
    document.querySelector('#myimg-reply').src = "";
    returnReplyBox();
}

function showNewPostBox() {
    if (rotateToCloseButton()) {
        var newPostContainer = $('#newPostContainer');
        // var fileuploader = $('#fileuploader');
        // fileuploader.detach();
        // fileuploader.appendTo('#newpostuploaderholder');
        // fileuploader.css('display', 'block');
        returnTagBox();
        returnNewStatsBox();
        returnShieldCensorHarvestBox();
        returnReplyBox();
        returnGroupBox();
        newPostContainer.detach();
        newPostContainer.appendTo('#StickingContainer');
        newPostContainer.css('display', 'block');

        if (sessionStorage.getItem('userroles') !== null) {
            $('#userroles-newpost:text').val(sessionStorage.getItem('userroles'));
            if (sessionStorage.getItem('userroles')[11] == "1") {
                $('#leader-newpost:text').val("leader");
            }
        }
    }
}
function returnNewPostBox() {
    var newPostContainer = $('#newPostContainer');
    newPostContainer.css('display', 'none');
    newPostContainer.detach();
    newPostContainer.appendTo('#divStorage');
    
    displayStatus("RETURN NEW POST BOX");
}
function submitNewPost() {
    console.log("submit");
    $("#new-text-post-data").empty();
    $("#tagForNewPost").empty();
    $("#title-of-new-post").empty();
    $("#sampleFile").empty();
    document.querySelector('#myimg').src = "";
    displayStatus("New post uploaded.");
    returnNewPostBox();
}
function previewFile() {
    var preview = document.querySelector('#myimg');
    var previewReply = document.querySelector('#myimg-reply');
    //var file    = document.querySelector('input[type=file]').files[0];
    var file = document.querySelector('#sampleFile').files[0];
    var fileReply = document.querySelector('#sampleFile-reply').files[0];
    var reader = new FileReader();
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

function showVoteBox(postID, upIfTrue) {
    var postID = parseInt(postID);
    var userID = parseInt(sessionStorage.getItem('userID'));
    var userrole = sessionStorage.getItem('role');
    returnTagBox();
    returnReplyBox();
    returnNewPostBox();
    returnShieldCensorHarvestBox();
    returnShareBox();
    var newStatsContainer = $('#newStatsContainer');
    newStatsContainer.detach();
    newStatsContainer.appendTo('#' + String(postID));
    console.log(postsOnThisPage);
    console.log('show vote box');
    var postData = postsOnThisPage.find(obj => { return obj.postID === String(postID) });
    console.log(postData);
    newStatsContainer.css('display', 'block');
    $('#upvotestat').html(postData.up);
    $('#downvotestat').html(postData.down);
    console.log(userID, postID, upIfTrue)
    socket.emit('check', { taskToCheck: 'vote', userID: userID, postID: postID, data: upIfTrue, role: userrole });
}
function submitVote(postID, option) {
    console.log(postID);
    console.log(option);
}
function returnNewStatsBox() {
    var newStatsContainer = $('#newStatsContainer');
    newStatsContainer.detach();
    newStatsContainer.appendTo('#divStorage');
    newStatsContainer.css('display', 'none');
}

function showShareBox(postElement) {
    returnTagBox();
    returnNewPostBox();
    returnNewStatsBox();
    returnShieldCensorHarvestBox();
    returnReplyBox();
    var shareButtonContainer = $('#shareButtonContainer');
    shareButtonContainer.detach();
    shareButtonContainer.appendTo('#' + String(postElement.attr('postID')));
    shareButtonContainer.css('display', 'block');
}
function returnShareBox() {
    var shareButtonContainer = $('#shareButtonContainer');
    shareButtonContainer.detach();
    shareButtonContainer.appendTo('#divStorage');
    shareButtonContainer.css('display', 'none');
}

function deleteThisPost(postID) {
    socket.emit('deletePost', postID);
    //returnReportBox();
}
function showAdminBox(postID) {
    console.log("SHOW POSTID");
    console.log(postID);
    $('#adminToolsContainer').css('display', 'block');
    var newAdminContainer = $('#adminToolsContainer');
    newAdminContainer.detach();
    newAdminContainer.appendTo('body');
    newAdminContainer.css('display', 'block');
}

function showSummonBox() {
    $('#userIDsummon').val(sessionStorage.getItem('userID'));
    var reportContainer = $('#summonUserContainer');
    reportContainer.detach();
    reportContainer.prependTo('#entryContainer');
    reportContainer.css('display', 'block');
}
function returnSummonBox() {
    var reportContainer = $('#summonUserContainer');
    reportContainer.detach();
    reportContainer.appendTo('#divStorage');
    reportContainer.css('display', 'block');
}

function showGroupCreatorBox() {
    $('#userID_newgroup').val(sessionStorage.getItem('userID'));
    var reportContainer = $('#groupCreatorContainer');
    reportContainer.detach();
    reportContainer.prependTo('#entryContainer');
    reportContainer.css('display', 'block');
}
function returnGroupBox() {
    var groupContainer = $('#groupCreatorContainer');
    groupContainer.detach();
    groupContainer.appendTo('#divStorage');
    groupContainer.css('display', 'none');
}

function showReportBox(postID) {
    console.log("SHOW REPORT FOR");
    console.log(postID);
    $('#postID_report').val(postID);
    $('#userID_report').val(sessionStorage.getItem('userID'));
    $('#reportBoxContainer').css('display', 'block');
    var reportContainer = $('#reportBoxContainer');
    reportContainer.detach();
    reportContainer.appendTo('#' + postID);
    reportContainer.css('display', 'block');
}
function submitReport(postID) {
    returnReportBox();
}
function returnReportBox() {
    var reportContainer = $('#reportBoxContainer');
    reportContainer.detach();
    reportContainer.appendTo('#divStorage');
    reportContainer.css('display', 'none');
}


function showRecommendBox(postID) {
    console.log(postID);
    $('#postID_taste').val(postID);
    $('#userID_taste').val(sessionStorage.getItem('userID'));
    $('#tastemakerContainer').css('display', 'block');
    var tastemakerBox = $('#tastemakerContainer');
    tastemakerBox.detach();
    tastemakerBox.appendTo('#' + postID);
    tastemakerBox.css('display', 'block');
}
function submitRecommendation(postID) {
    console.log(postID);
    var postToRec = { userID: sessionStorage.getItem("userID"), postID: postID };
    socket.emit('recommendPost', postToRec);
    returnTastemakerBox();
}
function returnTastemakerBox() {
    var tastemakerBox = $('#tastemakerContainer');
    tastemakerBox.detach();
    tastemakerBox.appendTo('#divStorage');
    tastemakerBox.css('display', 'none');
}


function joinGroup(postIDofGroup) {

    var datapacket = {
        postID: postIDofGroup,
        joinerID: sessionStorage.getItem("userID")
    };
    socket.emit("joingroup", datapacket);
}

function stalkPoster(postID) {
    $("#entryContainer").empty();
    socket.emit("stalkuser", parseInt(postID));
}
function followuser(userID) {
    var datapacket = {
        leaderID: parseInt(userID),
        followerID: parseInt(sessionStorage.getItem("userID"))
    };
    socket.emit("followuser", datapacket);
}

function openInventory() {
    var element = document.getElementById("test-buttons");
    element.classList.toggle("inventory-toolkit");
}

function showBountyCreatorBox() {
    $('#userID_bounty').val(sessionStorage.getItem('userID'));
    var bountyContainer = $('#bountyCreatorContainer');
    bountyContainer.detach();
    bountyContainer.prependTo('#StickingContainer');
    bountyContainer.css('display', 'block');
}
function returnBountyBox() {
    var bountyContainer = $('#bountyCreatorContainer');
    bountyContainer.detach();
    bountyContainer.appendTo('#divStorage');
    bountyContainer.css('display', 'none');
}


function rotateToCloseButton() {
    var plusEmoji = $('#plusemoji');
    if (plusEmoji.hasClass('rotatefortyfive')) {
        returnNewPostBox();
        returnReplyBox();
        returnBountyBox();
        returnAlgomancyBox();
        returnTastemakerBox();
        returnChooseRoleBox();
        returnGroupBox();
        returnNewStatsBox();
        returnTagBox();
        returnPollBox();
        returnPaintBox();
        returnShareBox();
        returnShieldCensorHarvestBox();
        returnReportBox();
        plusEmoji.removeClass('rotatefortyfive');
        return false;
    } else {
        $('#plusemoji').addClass('rotatefortyfive');
        return true;
    }
}