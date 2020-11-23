const socket = io();



function onloadFunction(){
  // var currentPage = sessionStorage.getItem('currentPage');
  // switch (currentPage){
  //   case 'post':
  //     console.log('post');
  //   case 'tag':
  //     socket.emit('requestTop20Posts');
  //   case 'user':
  //     socket.emit('requestTop20Posts');
  //   default:
  //     socket.emit('requestTop20Posts');
  // }
  socket.emit('retrievePostsForMarket');
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

function loadDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("demo").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "demo_get2.asp?fname=Henry&lname=Ford", true);
  xhttp.send();
}



function contextButtonFunction(currentContext){
  console.log(currentContext);
  switch(currentContext){
    case 'Protips':
      break;
    case 'Home':
      sessionStorage.setItem('currentPage', 'home');
      location.reload();
    case 'get data':
        let newItem = String(3423525232);
        $.ajax({
          method: "GET",
          url: "test.js",
          dataType: "script"});
      break;
  }
}