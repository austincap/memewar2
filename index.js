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
const fetch = require('node-fetch');
const express = require('express');
const path = require('path');
var ObjectId = require('node-time-uuid');
const sanitizeHtml = require('sanitize-html');
//const fileUpload = require('express-fileupload');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, __dirname+path.sep+'uploaded');
    console.log(__dirname+path.sep+'uploaded');
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
            userID: parseInt(req.body.userID),
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
    MATCH (origPost:Post {postID:$replyto})
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


function requestTagsForThisPost(socket, postID){
  var params = {
    postID: parseInt(postID)
  };
  var query = `
    MATCH (p:Post {postID:$postID})-[ta:TAGGEDAS]->(posttags:Tag)
    OPTIONAL MATCH (j:Post)-[:TAGGEDAS]->(t:Tag {name:posttags.name})    
    RETURN COUNT(j) AS otherposts, t.name AS tagname, ta.upvotes AS tagupvotes ORDER BY ta.upvotes DESC
    LIMIT 20
    `;
    session
      .run(query, params)
      .then(function(result){
        if(result.records[0]==null){
          console.log('NULL');
          socket.emit('noDataFound');
        }else{
          var dataForClient = [];
          result.records.forEach(function(record){
            dataForClient.push([record["_fields"][0], record["_fields"][1], record["_fields"][2]]);
          });
          console.log(dataForClient);
          socket.emit('tagsForPostData', dataForClient);
          
        }
      })
      .catch(function(error){
        console.log(error);
      });
}

function requestTop20Posts(socket){
  var topPostsAndTags = [];
    var topPostQuery = `
    MATCH (p:Post)
    WITH p ORDER BY p.upvotes-p.downvotes DESC
    OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
    OPTIONAL MATCH (:Post)-[rt:REPLYTO]->(p)
    RETURN p AS posts, COLLECT(DISTINCT [t.name, ta.upvotes]) AS tags, COUNT(DISTINCT rt) AS replies
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
          record["_fields"][1].forEach(function(tagAndVote){
            processedPostObject.tagnames = tagAndVote[0];
            processedPostObject.tagvotes = tagAndVote[1];
          });
          processedPostObject.replycount = record["_fields"][2];
          dataForClient.push(processedPostObject);
        });
        topPostsAndTags.push(dataForClient);
          session
            .run(topTagQuery)
            .then(function(result){
              var tagdataForClient = [];
              result.records.forEach(function(record){
                tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
              });
              topPostsAndTags.push(tagdataForClient);
              console.log(topPostsAndTags);
              console.log("TOP 20 POSTS");
              socket.emit('receiveTop20Data', topPostsAndTags);
            })
            .catch(function(error){
              console.log(error);
            });
      })
      .catch(function(error){
        console.log(error);
      });
}


function retrievePostsForNetView(socket){
  var dataForClient = [];
    var topPostQuery = `
    MATCH (p:Post)-[ta:TAGGEDAS]->(t:Tag)
    WITH p.postID AS id, t.name AS tag, ta.upvotes AS tagupvotes, p.upvotes AS upvotes, p.content AS content, p.title AS title, p.file AS file
    ORDER BY tagupvotes DESC 
    WITH id, upvotes, content, COLLECT(DISTINCT [tag, tagupvotes])[0..3] AS toptags, COUNT(DISTINCT tag) AS tagcount, title, file
    UNWIND toptags AS tags
    RETURN id, upvotes, content, tags[0], title, file
    ORDER BY tags[0] DESC
    `;
    session
      .run(topPostQuery)
      .then(function(result){
        result.records.forEach(function(record){
          console.log(record._fields);
          let tagarray = [];
          let postarray = [];
          
          postarray.push(record["_fields"][0], record["_fields"][1], record["_fields"][4], record["_fields"][3], record["_fields"][2], record["_fields"][5]);
          dataForClient.push(postarray);
          //dataForClient.push(record["_fields"]);
          // dataForClient[record["_fields"][0]] = {
          //   upvotes: record["_fields"][1],
          //   tags: tagarray,
          //   title: record["_fields"][2],
          //   file: record["_fields"][5],
          //   content: record["_fields"][4]
          // };
        });
        console.log(dataForClient);
        console.log("SENT NETVIEW FORMAT POSTS TO CLIENT");
        socket.emit('sendDatabase', dataForClient);
      })
      .catch(function(error){
        console.log(error);
      });
}

io.on('connection', function(socket) {
  console.log("connection");
  //requestTop20Posts(socket);

  // socket.on('retrievePostsForMarket', function(){
  //   requestTop20Posts(socket);
  // });

  socket.on('retrieveDatabase', function(){
    retrievePostsForNetView(socket);
  });


  socket.on('requestTop20Posts', function(){
    requestTop20Posts(socket);
  });

  socket.on('requestTagsForPost', function(postID){
    requestTagsForThisPost(socket, postID);
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
          memecoin: 200
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
    OPTIONAL MATCH (p)<-[rt:REPLYTO]-(:Post)
    RETURN p AS posts, COLLECT(t.name) AS tags, COLLECT(ta.upvotes) AS tagupvotes, COUNT(rt) AS replies
    LIMIT 20
    `;
    session
      .run(query, params)
      .then(function(result){
        if(result.records[0]==null){
          console.log('NULL');
          //socket.emit('noDataFound');
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
      MATCH (u:User {userID:$userID})
      OPTIONAL MATCH (u)-[:TAGGEDAS]->(t:Tag)
      WITH u, COLLECT(DISTINCT t.name) AS tags
      OPTIONAL MATCH (u)<-[:CREATEDBY]-(p:Post)
      WITH u, tags, COLLECT(DISTINCT p) AS posts
      OPTIONAL MATCH (u)-[:FAVORITED]->(f:Post)
      WITH posts, u, tags, COLLECT(DISTINCT f) AS faves
      RETURN u, tags, posts, faves
      `;
      session
        .run(query, {userID: parseInt(userID)})
        .then(function(result){
            if(result.records[0]==null){
              socket.emit('noDataFound', 'no user found');
              console.log('NULL');
            }else{
              console.log("NOT null");
              var dataForClient = [result.records[0]["_fields"][0]["properties"], result.records[0]["_fields"][1]];
              let tempData = [];
              result.records[0]["_fields"][2].forEach(function(record){
                tempData.push(record["properties"]);
              });
              dataForClient.push(tempData);
              tempData = [];
              result.records[0]["_fields"][3].forEach(function(record){
                console.log(record.properties);console.log("record.properties");
                tempData.push(record["properties"]);
              });
              dataForClient.push(tempData);
              console.log(dataForClient);
              socket.emit('userDataFound', dataForClient);
            }
        })
        .catch(function(error){
          console.log(error);
        });  
  });

  socket.on('viewpost', function(postID){
    var query = `
      MATCH (p:Post {postID:$postID})
      OPTIONAL MATCH (m:Post)-[rt:REPLYTO]->(p)
      OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
      OPTIONAL MATCH (p)<-[fa:FAVORITED]-(u:User)
      SET p.clicks = p.clicks + 1
      RETURN p AS postToBeViewed, COLLECT(DISTINCT m) AS replies, COLLECT(DISTINCT [t.name, ta.upvotes]) AS tagstuff, COLLECT(DISTINCT [u.userID, u.name]) AS usersWhoFavorited
      `;
    var topTagQuery = `
      MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
      WITH t.name AS tag, COUNT(ta) AS tagcount 
      RETURN tag, tagcount ORDER BY tagcount
      `;
      session
        .run(query, {postID: parseInt(postID)})
        .then(function(result){
            if(result.records[0]==null){
              //socket.emit('noDataFound');
              console.log('NULL');
            }else{
              var dataForClient = [];
              result.records.forEach(function(record){
                var processedPostObject = record["_fields"][0]["properties"];
                processedPostObject.tags = record["_fields"][2];
                processedPostObject.favoritedBy = record["_fields"][3];
                var repliesArray = [];
                record["_fields"][1].forEach(function(reply){
                  repliesArray.push(reply.properties);
                });
                dataForClient.push(processedPostObject, repliesArray);
              });
              session
                .run(topTagQuery)
                .then(function(result){
                  var tagdataForClient = [];
                  result.records.forEach(function(record){
                    tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
                  });
                  dataForClient.push(tagdataForClient);
                  console.log(dataForClient);
                  socket.emit('receiveSinglePostData', dataForClient);
                })
                .catch(function(error){
                  console.log(error);
                });
              //socket.emit('receiveSinglePostData', dataForClient);   
            }
        })
        .catch(function(error){
          console.log(error);
        });  
  });



  /////////////
  //VOTING
  ///////////
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
        postID: parseInt(tagPostOrUserData.postID),
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
  socket.on('favorite', function(dataFromClient){
    console.log(dataFromClient);
    switch(dataFromClient.faveType){
      case 0:
        var query = `
        MATCH (n:Post {postID:$postID}), (m:User {userID:$userID})
        MERGE (n)<-[r:FAVORITED]-(m)
        RETURN n, m
        `;
        session
          .run(query, {postID: parseInt(dataFromClient.postidORtagnameORuserid), userID: dataFromClient.userid})
          .then(function(result){
            console.log(result);
            socket.emit('userChecked', {task:'favoritedPost', userID:dataFromClient.userid, postID:dataFromClient.postidORtagnameORuserid, cost:50});
          })
          .catch(function(error){
            console.log(error);
          });  
      case 1:
        break;
      case 2:
        break;
    }

  });

});


// server.listen(80,function(){console.log('Meme War app listening on port 80 like a slut!');});
server.listen(3000,function(){console.log('Meme War app listeningn on port 3000 like a prude!');});