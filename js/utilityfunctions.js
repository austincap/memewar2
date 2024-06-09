// UTILITY FUNCTIONS


var root = document.documentElement;
const lists = document.querySelectorAll('.hs');
lists.forEach(el => {
    const listItems = el.querySelectorAll('li');
    const n = el.children.length;
    el.style.setProperty('--total', n);
});
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function is_url(str) {
    var regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) { return true; }
    else { return false; }
}
function getQueryParam(param) {
    var rx = new RegExp("[?&]" + param + "=([^&]+).*$");
    var returnVal = window.location.search.match(rx);
    return returnVal === null ? "" : decodeURIComponent(returnVal[1].replace(/\+/g, " "));
}
function enlargePic(theImage) {
    $(theImage).css("height", document.querySelector(theImage[0]).naturalHeight);
    console.log(theImage);
}
function generateUUID() {
    var d = new Date().getTime();
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    var uuid = 'xxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
            var r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            var r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c == 'x' ? r : (r & 0x7 | 0x8));
    });
    return uuid;
}
function displayStatus(message) {
    document.getElementById("statusbar").outerHTML = '<marquee behavior="slide" direction="left" scrollamount="20" id="statusbar">' + message + '</marquee>';
    console.log(message);
}
function gohome() {
    window.location.assign("/");
}
//subtitle function
$(function () {
    $.getJSON('subtitles.json', function (data) {
        $('#statusbar').html(data[getRandomInt(0, Object.keys(data).length)]['text']);
        $('#sub-title').append(data[getRandomInt(0, Object.keys(data).length)]['text']);
    });
});
//change board by typing it in
$(document).ready(function () {
    $("#tag-filter").keyup(function () {
        console.log($(this).val());
        $("#entryContainer").empty();
        socket.emit('requestPostsWithTag', $(this).val());
    });
});
//drop down menu for sorts
function dropDownFunction() {
    var x = document.getElementById("Demo");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}
function randomInt(max) {
    return Math.floor(Math.random() * max);
}
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}