const neo4j = require('neo4j-driver');
//const base64Img = require('base64-img');
const uri = 'bolt://localhost:7687';
const dbuser = 'neo4j';
const dbpassword = 'fucksluts';
const driver = neo4j.driver(uri, neo4j.auth.basic(dbuser, dbpassword), { disableLosslessIntegers: true });
const session = driver.session();
// {
//   database: 'memewar2',
//   defaultAccessMode: neo4j.session.WRITE
// });
const express = require('express');
const path = require('path');
var ObjectId = require('node-time-uuid');
const sanitizeHtml = require('sanitize-html');
//const fileUpload = require('express-fileupload');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, __dirname+'\\uploaded');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-';
    //cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');  + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix+file.originalname);
  }
});
var upload = multer({storage:storage});


const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static(__dirname));

// app.use(fileUpload({
//   limits: { fileSize: 50 * 1024 * 1024 },
//   useTempFiles : true,
//   tempFileDir : '/tmp/'
// }));


///////
//CODE FOLDING LEVEL 3
///////

// app.post('/upload', function(req, res){
//   if (!req.files || Object.keys(req.files).length === 0) { return res.status(400); }
//   // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//   let sampleFile = req.files.sampleFile;
//   // Use the mv() method to place the file somewhere on your server
//   sampleFile.mv('filename.jpg', function(err){
//     if(err){ return res.status(500).send(err); }
//     res.redirect('/');
//   });
// });

app.post('/upload', upload.single('sampleFile'), function (req, res, next){
  console.log("UPLOAD POST");
  var blockId = new ObjectId();
  var query;
  var fileName = "officialunofficialplaceholderlogo.jpg";
  var postId = parseInt(blockId.getTimestamp());
  if (typeof req.file === 'object'){ fileName = req.file.filename; }
  var params = {
            postID: postId,
            upvotes: 1,
            downvotes: 0,
            type: req.body.type,
            title: sanitizeHtml(req.body.title),
            content: sanitizeHtml(req.body.content),
            userID: req.body.userID,
            tag: req.body.tag,
            file: fileName,
            clicks: 1,
            censorattempts: 0,
            shields: 0,
            memecoinsspent: 0
  };
  if(req.body.userID=="ANON"){
    query = `
    CREATE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (whichtag)<-[ta:TAGGEDAS]-(newpost)
    RETURN newpost, whichtag
    `;
  }else{
    query = `
    MATCH (whomadeit:User {userID:$userID})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
    MERGE (whichtag)<-[ta:TAGGEDAS]-(newpost)-[cb:CREATEDBY]->(whomadeit)
    RETURN newpost, whichtag
    `;
  }
  session
  .run(query, params)
  .then(function(result){
    console.log(result);
    // result.records[0]["_fields"].forEach(function(record){
    //   console.log(record);
    // });
    // session.close();
  })
  .catch(function(error){
    console.log(error);
  });
  res.redirect('/');
});

app.post('/uploadreply', upload.single('sampleFile-reply'), function (req, res, next){
  console.log("UPLOAD POST REPLY");
  console.log(req.body);
  var blockId = new ObjectId();
  var query;
  var fileName = "officialunofficialplaceholderlogo.jpg";
  var postId = parseInt(blockId.getTimestamp());
  if (typeof req.file === 'object'){ fileName = req.file.filename; }
  var params = {
            postID: postId,
            upvotes: 1,
            downvotes: 0,
            type: req.body.type,
            title: sanitizeHtml(req.body.title),
            content: sanitizeHtml(req.body.content),
            userID: parseInt(req.body.userID),
            tag: req.body.tag,
            file: fileName,
            clicks: 1,
            censorattempts: 0,
            shields: 0,
            memecoinsspent: 0,
            replyto: parseInt(req.body.replyto),
            tagupvotes: 1
  };
  if(req.userID=="ANON"){
    query = `
    MATCH (origPost: {postID:$replyto})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
    MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpost)-[rt:REPLYTO]->(origPost)
    RETURN newpost, whichtag, origPost
    `;
  }else{
    query = `
    MATCH (whomadeit:User {userID:$userID}), (origPost:Post {postID:$replyto})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
    MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpost)-[cb:CREATEDBY]->(whomadeit)
    MERGE (newpost)-[rt:REPLYTO]->(origPost)
    RETURN newpost, whichtag, origPost
    `;
  }
  session
  .run(query, params)
  .then(function(result){
    console.log(result);
    // result.records[0]["_fields"].forEach(function(record){
    //   console.log(record);
    // });
    // session.close();
  })
  .catch(function(error){
    console.log(error);
  });
  res.redirect('/');
});

app.get('/user/:userid', function (req, res){
  res.send('user ' + req.params.id);
});

app.get('/post/:postid', function (req, res){

});

app.get('/tag/:tagname', function (req, res){

});


io.on('connection', function(socket) {
  console.log("connection");

  socket.on('requestTop20Posts', function(){
    var topPostsAndTags = [];
      var topPostQuery = `
      MATCH (p:Post)
      WITH p ORDER BY p.upvotes-p.downvotes DESC
      OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
      OPTIONAL MATCH (p)-[rt:REPLYTO]->(:Post)
      RETURN p AS posts, COLLECT(t.name) AS tags, COLLECT(ta.upvotes) AS tagupvotes, COUNT(rt) AS replies
      LIMIT 20
      `;
      var topTagQuery = `
      MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
      WITH t.name AS tag, COUNT(p)+COUNT(ta) AS tagcount 
      RETURN tag, tagcount ORDER BY tagcount DESC LIMIT 10
      `;
      session
        .run(topPostQuery)
        .then(function(result){
          var dataForClient = [];
          result.records.forEach(function(record){
            var processedPostObject = record["_fields"][0]["properties"];
            processedPostObject.tagnames = record["_fields"][1];
            processedPostObject.tagvotes = record["_fields"][2];
            processedPostObject.replycount = record["_fields"][3];
            dataForClient.push(processedPostObject);
          });
          console.log(dataForClient);
          topPostsAndTags.push(dataForClient);
            session
              .run(topTagQuery)
              .then(function(result){
                var tagdataForClient = [];
                result.records.forEach(function(record){
                  tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
                });
                console.log(tagdataForClient);
                topPostsAndTags.push(tagdataForClient);
                socket.emit('receiveTop20Data', topPostsAndTags);
                //socket.emit('receiveTop20Data', tadataForClient);
                //console.log(result.records[0]["_fields"][0]);
                //session.close();
              })
              .catch(function(error){
                console.log(error);
              }); 

          socket.emit('receiveTop20Data', dataForClient);
          //console.log(result.records[0]["_fields"][0]);
          //session.close();
        })
        .catch(function(error){
          console.log(error);
        });    
  });



  /////////////////////
  //ACCOUNT STUFF
  socket.on('registerNewUser', function(registrationData){
      var newuserID = new ObjectId();
      newuserID = newuserID.getTimestamp();
      //newuserID = newuserID.toString("hex").substr(0,15);
      var query = `
      CREATE (newuser:User {name:$username, userID:$userID, password:$password, memecoin:$memecoin})
      RETURN newuser
      `;
      var params = {
          username: registrationData.username,
          userID: parseInt(newuserID),
          password: registrationData.password,
          memecoin: 100
        };
      session
        .run(query, params)
        .then(function(result){
          console.log("REGISTERED USER");
          var logindata = result.records[0]["_fields"][0]["properties"];
          socket.emit('loggedIn', logindata);
          //console.log(result.records[0]["_fields"][0]);
          //session.close();
        })
        .catch(function(error){
          console.log(error);
        });
  });

  socket.on('login', function(loginData){
      var query = `
      MATCH (newuser:User {name:$username, password:$password})
      RETURN newuser
      `;
      var params = {
          username: loginData.username,
          password: loginData.password
      };
      session
        .run(query, params)
        .then(function(result){
          console.log("LOGGED IN USER");
          console.log(result.records[0]["_fields"][0]["properties"]);
          var loginresult = result.records[0]["_fields"][0]["properties"];
          socket.emit('loggedIn', loginresult);
        })
        .catch(function(error){
          console.log(error);
        });
  });

  socket.on('check', function(stuffToCheck){
    console.log("CHECKING TASK");
    var params = {
      userID: parseInt(stuffToCheck.userID),
      postID: parseInt(stuffToCheck.postID),
      data: stuffToCheck.data
    };
    var query;
    console.log(params);
    switch(stuffToCheck.taskToCheck){
      case 'makevote':
        query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        RETURN p,u
        `;
        session
        .run(query, params)
        .then(function(result){
          if(result.records[0] == null){
            socket.emit('userChecked', {task:'firstvote', userID:params.userID, postID:params.postID, cost:0});
            console.log("NULL");
          }else{
            console.log(result.records);
            socket.emit('userChecked', {task:'additionalvote', userID:params.userID, postID:params.postID, cost:Math.pow(2,(result.records[0]["_fields"][0]["properties"]["upvotes"]["low"]+result.records[0]["_fields"][0]["properties"]["downvotes"]["low"]))});
          }
        })
        .catch(function(error){
          socket.emit('userChecked', {task:'additionalvote', userID:params.userID, postID:params.postID, cost:Math.pow(2,(result.records[0]["_fields"][0]["properties"]["upvotes"]["low"]+result.records[0]["_fields"][0]["properties"]["downvotes"]["low"]))});
          console.log(error);
        });
        break;
      case 'harvest':
        query = `
        MATCH (p:Post {postID:$postID})-[c:CREATEDBY]->(u:User {userID:$userID})
        RETURN p
        `;
        session
        .run(query, params)
        .then(function(result){
          console.log(result.records);
          if(result.records[0] == null){
            socket.emit('userChecked', {task:'failedHarvest', userID:params.userID, postID:params.postID, cost:0});
            console.log("user doesnt own it");
          }else{
            var post = result.records[0]["_fields"][0]["properties"];
            var profit = ((post.upvotes-post.downvotes)>0) ? (post.upvotes-post.downvotes) : 0;
            socket.emit('userChecked', {task:'ableToHarvestPost', userID:params.userID, postID:params.postID, cost:profit});
          }
        })
        .catch(function(error){
          socket.emit('userChecked', {task:'failedHarvest', userID:params.userID, postID:params.postID, cost:0});
          console.log(error);
        });
        break;
      case 'shield':
        query = `
        MATCH (n:User {userID:$userID})
        RETURN n.memecoin
        `;
        session
          .run(query, params)
          .then(function(result){
              console.log(result.records);
              if(result.records[0]==null){
                console.log('NO USER WITH THAT ID');
                socket.emit('userChecked', {task:'failedShielding', userID:params.userID, postID:params.postID, cost:0});
              }else{
                console.log("USER EXISTED");
                var memecoin = parseInt(result.records[0]['_fields'][0]);
                 if(memecoin > 50){
                  console.log("MORE THAN 50");
                  socket.emit('userChecked', {task:'ableToApplyShield', userID:params.userID, postID:params.postID, cost:25});
                }else{
                  socket.emit('userChecked', {task:'failedCensoring', userID:params.userID, postID:params.postID, cost:0});
                }
              }
          })
          .catch(function(error){
            socket.emit('userChecked', {task:'failedShielding', userID:params.userID, postID:params.postID, cost:0});
            console.log(error);
          });
        break;
      case 'censor':
        query = `
        MATCH (n:User {userID:$userID}), (p:Post {postID:$postID})
        RETURN n.memecoin, p.censorattempts
        `;
        session
          .run(query, params)
          .then(function(result){
              console.log(result.records);
              if(result.records[0]==null){
                console.log('NO USER WITH THAT ID');
                socket.emit('userChecked', {task:'failedCensoringCauseOther', userID:params.userID, postID:params.postID, cost:0});
              }else{
                var memecoin = parseInt(result.records[0]['_fields'][0]);
                var attempts = parseInt(result.records[0]['_fields'][1]);
                if(memecoin > 50){
                  console.log("MORE THAN 50");
                  socket.emit('userChecked', {task:'ableToCensorPost', userID:params.userID, postID:params.postID, cost:attempts});
                }else{
                  console.log("LESS THAN 50");
                  socket.emit('userChecked', {task:'failedCensoringCauseTooPoor', userID:params.userID, postID:params.postID, cost:0});
                }
              }
          })
          .catch(function(error){
            console.log(error);
          });
        break;
      case 'upvotetag':
        query = `
        MATCH (u:User {userID:$userID})
        RETURN u.memecoin
        `;
        session
        .run(query, params)
        .then(function(result){
          console.log(result.records);
          if(result.records[0] == null){
            socket.emit('userChecked', {task:'failedTagUpvote', userID:params.userID, postID:params.postID, cost:0});
            console.log("user doesnt exist");
          }else{
            var memecoin = parseInt(result.records[0]['_fields'][0]);
            if (memecoin >= 1){
              console.log("user has enough memecoin to upvote tag");
              socket.emit('userChecked', {task:'ableToUpvoteTag', userID:params.userID, postID:params.postID, cost:stuffToCheck.data});
            }else{
              socket.emit('userChecked', {task:'failedTagUpvote', userID:params.userID, postID:params.postID, cost:-1});
            }
          }
        })
        .catch(function(error){
          socket.emit('userChecked', {task:'failedTagUpvote', userID:params.userID, postID:params.postID, cost:0});
          console.log(error);
        });
        break;
      default:
        break;
    } 
  });



  //////////////
  //VIEWING DETAILS
  socket.on('requestPostsWithTag', function(tagname){
    var params = {
      tagname: tagname
    };
    var query = `
    MATCH (p:Post)-[:TAGGEDAS]->(g:Tag {name:$tagname})
    WITH p ORDER BY p.upvotes-p.downvotes DESC
    OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
    OPTIONAL MATCH (p)-[rt:REPLYTO]->(:Post)
    RETURN p AS posts, COLLECT(t.name) AS tags, COLLECT(ta.upvotes) AS tagupvotes, COUNT(rt) AS replies
    LIMIT 20
    `;
    session
      .run(query, params)
      .then(function(result){
        if(result.records[0]==null){
          console.log('NULL');
          socket.emit('noDataFound');
        }else{
          var topPostsForTag = [];
          var dataForClient = [];
          result.records.forEach(function(record){
            var processedPostObject = record["_fields"][0]["properties"];
            processedPostObject.tagnames = record["_fields"][1];
            processedPostObject.tagvotes = record["_fields"][2];
            processedPostObject.replycount = record["_fields"][3];
            dataForClient.push(processedPostObject);
          });
          console.log(dataForClient);
          topPostsForTag.push(dataForClient);
          topPostsForTag.push(tagname);
          socket.emit('receiveTagData', topPostsForTag);
        }
      })
      .catch(function(error){
        console.log(error);
      });
  });

  socket.on('viewuser', function(userID){
    var query = `
      MATCH (n:User {userID:$userID})
      OPTIONAL MATCH (u)-[:TAGGEDAS]->(t:Tag)
      WITH COLLECT(DISTINCT t.name) AS tags
      OPTIONAL MATCH (u)<-[:CREATEDBY]-(p:Post)
      OPTIONAL MATCH (u)-[:FAVORITED]->(f:Post)
      RETURN u, tags, p, f
      `;
      session
        .run(query, {userID: parseInt(userID)})
        .then(function(result){
            console.log(result.records);
            if(result.records[0]==null){
              socket.emit('noDataFound', 'no user found');
              console.log('NULL');
            }else{
              console.log("NOT null");
              result.records[3]["_fields"].forEach(function(record){
                console.log(record);
              });
              socket.emit('userDataFound', result.records);
            }
        })
        .catch(function(error){
          console.log(error);
        });  
  });

  socket.on('viewpost', function(postID){
    var query = `
      MATCH (n:Post {postID:$postID})
      OPTIONAL MATCH (m:Post)-[rt:REPLYTO]->(n)
      OPTIONAL MATCH (n)-[ta:TAGGEDAS]->(t:Tag)
      OPTIONAL MATCH (n)<-[fa:FAVORITED]-(u:User)
      SET n.clicks = n.clicks + 1
      RETURN n AS postToBeViewed, COLLECT(m) AS replies, COLLECT(DISTINCT t.name) AS tags, COLLECT(u) AS usersWhoFavorited
      `;
      session
        .run(query, {postID: parseInt(postID)})
        .then(function(result){
            //console.log(result.records);
            if(result.records[0]==null){
              socket.emit('noDataFound');
              console.log('NULL');
            }else{

              var postToBeViewed = result.records[0]["_fields"][0]["properties"];
              var replies = [];
              var tags = [];
              var usersWhoFavorited = [];
              //console.log(result.records[0]["_fields"][2]);
              console.log(result.records[0]["_fields"][0]["properties"]);
              // console.log(result.records[3]["_fields"]);
              result.records[0]["_fields"][1].forEach(function(record){
                if (record !== null && record.properties !== undefined){
                  replies.push(record.properties);
                }
              });
              console.log(replies);
              result.records[0]["_fields"][2].forEach(function(record){
                  tags.push(record);
              });
              console.log(tags);
              result.records[0]["_fields"][3].forEach(function(record){
                if (record !== null && record.properties !== undefined){
                  usersWhoFavorited.push(record.properties.username);
                }
              });
              console.log(usersWhoFavorited);
              var dataForClient = {postToBeViewed:postToBeViewed, replies:replies, tags:tags, usersWhoFavorited:usersWhoFavorited};
              console.log(dataForClient);
              socket.emit('receiveSinglePostData', dataForClient);   
            }
        })
        .catch(function(error){
          console.log(error);
        });  
  });



  /////////////
  //VOTING
  ///////////
  socket.on('upvoteTag', function(upvoteTagStuff){
    var params = {
        userID: upvoteTagStuff.userID,
        tagname: upvoteTagStuff.tagname,
        postID: upvoteTagStuff.postID
      };
    var query = `
      MATCH (u:User {userID:$userID}), (p:Post {postID:$postID})-[ta:TAGGEDAS]->(m:Tag {name:$tagname})
      SET u.memecoin = u.memecoin - 1
      SET p.memecoinsspent = p.memecoinsspent + 1
      SET ta.upvotes = ta.upvotes + 1
      RETURN ta
      `;
    session
      .run(query, params)
      .then(function(result){
        console.log(result);
      })
      .catch(function(error){
        console.log(error);
      });  
  });

  socket.on('voteOnPost', function(postVoteData){
    var query;
    var params = {
      postID: postVoteData.postID,
      userID: postVoteData.userID
    };
    if(postVoteData.upIfTrue==true){
      query = `
      MATCH (n:Post {postID:$postID}), (u:User {userID:$userID})
      SET n.upvotes = n.upvotes + 1
      MERGE (n)<-[r:VOTEDON]-(u)
      SET r.upvotes = r.upvotes + 1
      RETURN u, n, r
      `;
    }else{
      query = `
      MATCH (n:Post {postID:$postID}), (u:User {userID:$userID})
      SET n.downvotes = n.downvotes + 1
      MERGE (n)<-[r:VOTEDON]-(u)
      SET r.downvotes = r.downvotes + 1
      RETURN u, n, r
      `;
    }
    session
      .run(query, params)
      .then(function(result){
        console.log(result);
        socket.emit('receiveSinglePostData', result.records);
        //console.log(result.records[0]["_fields"][1]);
        //session.close();
      })
      .catch(function(error){
        console.log(error);
      });  
  });

  socket.on('makevote', function(makevotestuff){
    var query;
    var params = {
      userID: makevotestuff.userID,
      postID: makevotestuff.postID
    };
    switch(makevotestuff.voteType) {
      case 'firstvote':
        query = `
        MATCH (u:User {userID:$userID}), (p:Post {postID:$postID})
        MERGE (u)-[v:VOTEDON {upvotes:0, downvotes:0}]->(p)
        `;
        session.run(query, params).then(function(result){
            console.log(result);
            //socket.emit('receiveSinglePostData', result);
            //console.log(result.records[0]["_fields"][1]);
            //session.close();
        })
        .catch(function(error){
            console.log(error);
        });  
        break;
      case 'upvote':
        query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        SET p.upvotes = p.upvotes + 1
        SET v.upvotes = v.upvotes + 1
        RETURN u, p, v
        `;  
        session.run(query, params).then(function(result){
            console.log(result);
            //socket.emit('receiveSinglePostData', result);
            //console.log(result.records[0]["_fields"][1]);
            //session.close();
        })
        .catch(function(error){
            console.log(error);
        });  
        break;
      case 'downvote':
        query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        SET p.downvotes = p.downvotes + 1
        SET v.downvotes = v.downvotes + 1
        RETURN u, p, v
        `;
        session.run(query, params).then(function(result){
            console.log(result);
            //socket.emit('receiveSinglePostData', result);
            //console.log(result.records[0]["_fields"][1]);
            //session.close();
        })
        .catch(function(error){
            console.log(error);
        }); 
        break;
      }
  });


  
  ////////////////
  //TAGGING
  ////////////
  socket.on('tagPostOrUser', function(tagPostOrUserData){  
    var query;
    var params;
    if(tagPostOrUserData.postIfTrue==true){
      params = {
        postID: tagPostOrUserData.postID,
        tagname: tagPostOrUserData.tagname,
        upvotes: 1
      };
      query = `
      MATCH (p:Post {postID:$postID})
      MERGE (t:Tag {name:$tagname})
      MERGE (p)-[ta:TAGGEDAS]->(t)
      ON CREATE SET ta.upvotes = $upvotes
      ON MATCH SET ta.upvotes = ta.upvotes + $upvotes
      RETURN ta
      `;
    }else{
      params = {
        userID: tagPostOrUserData.userID,
        tagname: tagPostOrUserData.tagname,
        upvotes: 1
      };
      query = `
      MATCH (u:User {userID:$userID})
      MERGE (t:Tag {name:$tagname})
      MERGE (u)-[ta:TAGGEDAS]->(t)
      ON CREATE SET ta.upvotes = $upvotes
      ON MATCH SET ta.upvotes = ta.upvotes + $upvotes
      RETURN ta
      `;
    }
    session
      .run(query, params)
      .then(function(result){
        console.log(result);
        socket.emit('tagApplied', result);
        console.log(result.records[0]["_fields"][1]);
        //session.close();
      })
      .catch(function(error){
        console.log(error);
        socket.emit('noDataFound', 'tagPostOrUser fucked up');
      });  
  });


  ///////////////////
  //HARVEST POST               
  //////////////STILL NEED TO MAKE IT SO YOU CANT GET NEGATIVE PROFIT
  socket.on('harvestPost', function(postID, userID){
    console.log("HARVEST POST");
    var params = {
      postID: postID,
      userID: userID
    };
    var query = `
    MATCH (u:User {userID:$userID}), (p:Post {postID:$postID})
    SET u.memecoin = u.memecoin + abs(p.upvotes-p.downvotes)
    DETACH DELETE p
    `;
    session
      .run(query, params)
      .then(function(result){
        result.records.forEach(function(record){
          console.log(record);
        });
        socket.emit('postHarvested');
        // session.close();
      })
      .catch(function(error){
        console.log(error);
      }); 
  });

  ////////////////////     (u:User {userID:$userID})
   // SET u.memecoin = u.memecoin - 50
  //CURRENT CENSOR COST = 50
  ///////////////////
  socket.on('censorAttempt', function(dataFromClient){
    console.log("ATTEMPT CENSOR POST");
    var params = {
      postID: parseInt(dataFromClient.postID),
      userID: parseInt(dataFromClient.userID)
    };
    var query = `
    MATCH (p:Post {postID:$postID}), (u:User {userID:$userID})
    SET p.shields = p.shields - 1
    SET p.memecoinsspent = p.memecoinsspent + 50
    SET u.memecoin = u.memecoin - 50
    RETURN p.shields
    `;
      session
      .run(query, params)
      .then(function(result){
        if(result.records[0]==null){
          console.log('THAT POST DOESNT EXIST');
          socket.emit('userChecked', {task:'failedCensoringCauseOther', userID:params.userID, postID:params.postID, cost:50});
        }else{
          var shields = parseInt(result.records[0]['_fields'][0]);
          console.log(shields);
          if(shields >= 0){
            console.log("STILL HAD AT LEAST 1 SHIELD REMAIINING");
            socket.emit('userChecked', {task:'failedCensoringCauseShield', userID:params.userID, postID:params.postID, cost:shields+1});
          }else{
            console.log("CENSOR SUCCESS");
            socket.emit('userChecked', {task:'successfulCensoring', userID:params.userID, postID:params.postID, cost:50});
          }
        }
    })
    .catch(function(error){
      console.log(error);
      socket.emit('userChecked', {task:'failedCensoringCauseOther', userID:params.userID, postID:params.postID, cost:50});
    });
  });
  
  socket.on('censorSuccess', function(dataFromClient){
    console.log("CENSOR POST");
    var params = {
      postID: parseInt(dataFromClient.postID),
      userID: parseInt(dataFromClient.userID)
    };
    var query = `
    MATCH (p:Post {postID:$postID})
    DETACH DELETE p
    `;
      session
      .run(query, params)
      .then(function(result){
        console.log("DELETED POST FROM DATBASE")
    })
    .catch(function(error){
      console.log(error);
      socket.emit('userChecked', {task:'failedCensoringCauseOther', userID:params.userID, postID:params.postID, cost:50});
    });
  });

  ///////////////////////
  //CURRENT SHIELD COST = 25
  /////////////////////
  socket.on('shieldPost', function(dataFromClient){
    var params = {
      postID: parseInt(dataFromClient.postID),
      userID: parseInt(dataFromClient.userID)
    };
    var query = `
      MATCH (p:Post {postID:$postID}), (u:User {userID:$userID})
      SET p.shields = p.shields + 1
      SET p.memecoinsspent = p.memecoinsspent + 25
      SET u.memecoin = u.memecoin - 25
      RETURN p, u
      `;
      session
        .run(query, params)
        .then(function(result){
          console.log(result);
          socket.emit('appliedShield', result);
          console.log(result.records[0]["_fields"][1]);
          //session.close();
        })
        .catch(function(error){
          console.log(error);
        });     
  });

  ///////////////
  //FAVORITE POST
  socket.on('favoritePost', function(postID, userID){
    var query = `
      MATCH (n:Post {postID:$postID}), (m:User {userID:$userID})
      MERGE (n)<-[r:FAVORITED]-(m)
      RETURN n, m
      `;
      session
        .run(query, {postID: parseInt(postID), userID: userID})
        .then(function(result){
          console.log(result);
          socket.emit('receiveSinglePostData', result);
          console.log(result.records[0]["_fields"][1]);
          //session.close();
        })
        .catch(function(error){
          console.log(error);
        });  
  });


});


server.listen(3000, function (){
  //  http://[2606:a000:101a:101:0:5a8b:1cd5:fa71]:3000/index.html
  console.log('Meme War app listening on port 3000 like a prude!');
});
