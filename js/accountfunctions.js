
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
        newuserRoles: $('#rolenumbers').text(),
        role: $('#submitRoleButton').text()
    };
    socket.emit('registerNewUser', registrationData);
}
function loginUser() {
    var logindata = {
        username: $('#signInName').val(),
        password: $('#passwordvalue').val()
    };
    socket.emit('login', logindata);
}
function clickAccountButton(thisButton) {
    console.log($(thisButton).children()[0]);
    console.log($($(thisButton).children()[0]).attr('userid'));
    if ($(thisButton).html() == "Account") {
        $('#signinstuff').css('display', 'inline-block');
        $('#signup-overlay-box').css('display', 'inline-block');
        $(thisButton).html("Close");
    } else if ($(thisButton).html() == "Close") {
        $('#signinstuff').css('display', 'none');
        $(thisButton).html("Account");
    } else if (String($($(thisButton).children()[0]).attr('userid')) == sessionStorage.getItem('userID')) {
        console.log("ETE");
        viewProfilePage(sessionStorage.getItem('userID'));
    }
}
function loggedIn(loginData) {
    sessionStorage.setItem('userID', loginData.userID);
    sessionStorage.setItem('username', loginData.name);
    sessionStorage.setItem('memecoin', loginData.memecoin);
    sessionStorage.setItem("userroles", loginData.userroles);
    addRoles(loginData.userroles, false);
    console.log(loginData);
    displayStatus('Log in successful. Welcome, ' + loginData.name)
    //sessionStorage.setItem('role', loginData.role);
    $('#signinstuff').css('display', 'none');
    $('#signup-overlay-box').css('display', 'none');
    $('#accountButton').html("<span userid=" + sessionStorage.getItem('userID') + "></span>" + sessionStorage.getItem('username') + "&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>" + sessionStorage.getItem('memecoin').substring(0, 4) + "</span>₿");
    $('#accountButton').attr('userid', sessionStorage.getItem('userID'));
    $('#currentrole').html(getFirstRole(loginData.userroles));
}


function addRoles(rollString, falseisnormaltrueisdisplayall) {
    console.log("ADD ROLES");
    console.log(sessionStorage.getItem('userroles'));
    var stringofroles = "";
    if (rollString[0] == '1') {
        $(".haters-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "hater "; }
    } else { $(".haters-only").css("display", "none"); }
    if (rollString[1] == '1') {
        $(".taggers-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "tagger "; }
    } else { $(".taggers-only").css("display", "none"); }
    if (rollString[2] == '1') {
        $(".painters-only").css("display", "inline");
        //document.querySelectorAll('.painters-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "painter "; }
    } else { $(".painters-only").css("display", "none"); }
    if (rollString[3] == '1') {
        $(".pollsters-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "pollster "; }
    } else { $(".pollsters-only").css("display", "none"); }
    if (rollString[4] == '1') {
        $(".tastemakers-only").css("display", "inline");
        //document.querySelectorAll('.tastemakers-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "tastemaker "; }
    } else { $(".tastemakers-only").css("display", "none"); }
    if (rollString[5] == '1') {
        $(".explorers-only").css("display", "inline");
        document.querySelectorAll('.explorers-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "explorer "; }
    } else { $(".explorers-only").css("display", "none"); }
    if (rollString[6] == '1') {
        $(".summoners-only").css("display", "inline");
        //document.querySelectorAll('.summoners-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        if (falseisnormaltrueisdisplayall) { stringofroles += "summoner "; }
    } else { $(".summoners-only").css("display", "none"); }
    if (rollString[7] == '1') {
        $(".protectors-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "protector "; }
    } else { $(".protectors-only").css("display", "none"); }
    if (rollString[8] == '1') {
        $(".arbitrators-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "arbitrator "; }
    } else { $(".arbitrators-only").css("display", "none"); }
    if (rollString[9] == '1') {
        $(".stalkers-only").css("display", "inline");
        socket.emit("get3users");
        if (falseisnormaltrueisdisplayall) { stringofroles += "stalker "; }
    } else { $(".stalkers-only").css("display", "none"); }
    if (rollString[10] == '1') {
        $(".editors-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "editor "; }
    } else { $(".editors-only").css("display", "none"); }
    if (rollString[11] == '1') {
        $(".leaders-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "leader "; }
    } else { $(".leaders-only").css("display", "none"); }
    if (rollString[12] == '1') {
        $(".counselors-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "counselor "; }
    } else { $(".counselors-only").css("display", "none"); }
    if (rollString[13] == '1') {
        $(".founders-only").css("display", "inline");
        if (falseisnormaltrueisdisplayall) { stringofroles += "founder "; }
    } else { $(".founders-only").css("display", "none"); }
    if (rollString[14] == '1') {
        $(".algomancers-only").css("display", "inline");
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
                    return "Censorer";
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
        case "Censorer":
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
