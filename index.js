const neo4j = require('neo4j-driver');
const base64Img = require('base64-img');
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
var sanitizeHtml = require('sanitize-html');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static(__dirname));

///////
//CODE FOLDING LEVEL 3
///////




io.on('connection', function(socket) {
  console.log("connection");

  socket.on('requestTop50Posts', function(){
      var query = `
      MATCH (n:Post)
      WITH n ORDER BY n.upvotes-n.downvotes DESC
      WITH COLLECT(n) AS results
      RETURN results[0..50]
      `;
      session
        .run(query)
        .then(function(result){
          var newResult = [];
          result.records[0]["_fields"][0].forEach(function(record){
            console.log(record.properties);
            newResult.push(record.properties);
          });
          socket.emit('receiveData', result);
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
      userID: stuffToCheck.userID,
      postID: stuffToCheck.postID
    };
    var query;
    switch(stuffToCheck.taskToCheck){
      case 'makevote':
        query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:userID})
        RETURN v
        `;
        session
        .run(query, params)
        .then(function(result){
          if(result.records[0] == null){
            socket.emit('userChecked', {task:'firstvote', postID:params.postID, cost:null});
            console.log("NULL");
          }else{
            console.log(result.records[0]["_fields"][0]["properties"]["upvotes"]["low"]);
            socket.emit('userChecked', {task:'additionalvote', userID:params.userID, postID:params.postID, cost:Math.pow(2,(result.records[0]["_fields"][0]["properties"]["upvotes"]["low"]+result.records[0]["_fields"][0]["properties"]["downvotes"]["low"]))});
          }
        })
        .catch(function(error){
          socket.emit()
          console.log(error);
        });  
        break;
      case 'harvest':
        query = `
        MATCH (p:Post {postID:$postID})<-[c:CREATEDBY]-(u:User {userID:$userID})
        RETURN c
        `;
        session
        .run(query, params)
        .then(function(result){
          if(result.records[0] == null){
            socket.emit('userChecked', {task:'failedHarvest', postID:params.postID, cost:null});
            console.log("user doesnt own it");
          }else{
            console.log(result.records[0]["_fields"][0]["properties"]["upvotes"]["low"]);
            socket.emit('userChecked', {task:'additionalvote', userID:params.userID, postID:params.postID, cost:Math.pow(2,(result.records[0]["_fields"][0]["properties"]["upvotes"]["low"]+result.records[0]["_fields"][0]["properties"]["downvotes"]["low"]))});
          }
        })
        .catch(function(error){
          socket.emit()
          console.log(error);
        });  
        break;
      case 'shield':
        var query = `
        MATCH (n:User {userID:$userID})
        RETURN n.memecoin
        `;
        session
          .run(query, params)
          .then(function(result){
              console.log(result.records);
              if(result.records[0]==null){

                console.log('NULL');
              }else{
                console.log("NOT null");
                  result.records[3]["_fields"].forEach(function(record){
                    console.log(record);
                    //newResult.push(record.properties);
                  });
              }
              //socket.emit('receiveSinglePostData', result);   
            //session.close();
          })
          .catch(function(error){
            console.log(error);
          });
        break;
      case 'censor':
        //code
        break;
      case 'favorite':
        //code
        break;
      default:
        // code block
    } 
  });



  //////////////
  //VIEWING DETAILS
  socket.on('requestPostsWithTag', function(tagname){
    var query = `
    MATCH (n:Post)-[r:TAGGEDAS]->(m:Tag {name:$tagname})
    OPTIONAL MATCH (:Tag)<-[:TAGGEDAS]-(n)
    WITH n ORDER BY n.upvotes-n.downvotes DESC
    WITH COLLECT(n) AS results
    RETURN results[0..50]
    `;
    session
      .run(query, {tagname: tagname})
      .then(function(result){
        if(result.records[0]==null){
          console.log('NULL');
          socket.emit('noDataFound');
        }else{
          var newResult = [];
          result.records[0]["_fields"][0].forEach(function(record){
            newResult.push(record.properties);
          });
          socket.emit('receiveData', newResult);
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
      WITH COLLECT(t.name) AS tags
      OPTIONAL MATCH (u)<-[:CREATEDBY]-(p:Post)
      OPTIONAL MATCH (u)-[:FAVORITED]->(f:Post)
      RETURN u, tags, p, f
      `;
      session
        .run(query, {postID: parseInt(postID)})
        .then(function(result){
            console.log(result.records);
            if(result.records[0]==null){
              socket.emit('noDataFound');
              console.log('NULL');
            }else{
              console.log("NOT null");
                result.records[3]["_fields"].forEach(function(record){
                  console.log(record);
                  //newResult.push(record.properties);
                });
            }
            //socket.emit('receiveSinglePostData', result);   
          //session.close();
        })
        .catch(function(error){
          console.log(error);
        });  
  });

  socket.on('viewpost', function(postID){
    var query = `
      MATCH (n:Post {postID:$postID}), (t:Tag), (f:User)
      SET n.clicks = n.clicks + 1
      OPTIONAL MATCH (m:Post)-[r:REPLYTO]->(n)
      OPTIONAL MATCH (n)-[ra:TAGGEDAS]->(t)
      OPTIONAL MATCH (n)<-[j:FAVORITED]-(f)
      RETURN n, m, t
      `;
      session
        .run(query, {postID: parseInt(postID)})
        .then(function(result){
            console.log(result.records);
            if(result.records[0]==null){

              console.log('NULL');
            }else{
              console.log("NOT null");
                result.records[3]["_fields"].forEach(function(record){
                  console.log(record);
                  //newResult.push(record.properties);
                });
            }
            //socket.emit('receiveSinglePostData', result);   
          //session.close();
        })
        .catch(function(error){
          console.log(error);
        });  
  });



  //////////////
  //REPLY AND NEW POST
  socket.on('addNewPost', function(postData){
      console.log("UPLOAD POST");
      var blockId = new ObjectId();
      var query;
      postData.postId = blockId.getTimestamp();
      //postData.postId = blockId.toString("hex").substr(15);
      console.log(postData.postId);
      var params = {
                postID: parseInt(postData.postId),
                upvotes: 1,
                downvotes: 0,
                type: postData.type,
                title: sanitizeHtml(postData.title),
                content: sanitizeHtml(postData.content),
                userID: postData.userID,
                tag: postData.tag,
                file: "officialunofficialplaceholderlogo.jpg",
                clicks: 1,
                censorattempts: 0,
                shields: 0,
                memecoinsspent: 0
        };
      // if(postData.file.substr(0,11)=='data:image/'){
      //   base64Img.imgSync(postData.file,'',postData.postId);
      //   params.file = toString(params.postID);
      // }
      if(postData.userID=="ANON"){
        query = `
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
        MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)
        RETURN (newpost), (whichtag)
        `;
      }else{
        query = `
        MATCH (whomadeit:User {userID:$userID})
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
        MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)-[ra:CREATEDBY]->(whomadeit)
        RETURN (newpost), (whichtag)
        `;
      }
      session
      .run(query, params)
      .then(function(result){
        console.log(result);
        result.records.forEach(function(record){
          console.log(record);
        });
        // session.close();
      })
      .catch(function(error){
        console.log(error);
      });


  });


  socket.on('reply', function(postData){
      var blockId = new ObjectId();
      postData.postId = blockId.getTimestamp();
      //postData.postId = blockId.toString("hex").substr(0,15);
      console.log(postData);
      var params = {
          postID: parseInt(postData.postId),
          upvotes: 1,
          downvotes: 0,
          type: postData.type,
          title: sanitizeHtml(postData.title),
          content: sanitizeHtml(postData.content),
          userID: postData.userID,
          tag: postData.tag,
          file: postData.file,
          replyToId: postData.replyToPostID,
          clicks: 1,
          shields: 0,
          censorattempts: 0,
          memecoinsspent: 0
      };
      if(postData.userID=="ANON"){
        var query = `
        MATCH (n:Post {postID:$replyToId})
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent, replyToId:$replyToId})
        MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)-[rb:REPLYTO]->(n)
        RETURN (newpost), (whichtag)
        `;
      }else{
        var query = `
        MATCH (whomadeit:User {userID:$userID}), (n:Post {postID:$replyToId})
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, replyToId:$replyToId})
        MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)-[ra:CREATEDBY]->(whomadeit)
        MERGE (newpost)-[rb:REPLYTO]->(n)
        RETURN (newpost), (whichtag)
        `;
      }
      session
        .run(query, params)
        .then(function(result){
          console.log(result.records[0]["_fields"][0]);
          socket.emit('receiveSinglePostData', result);
          //console.log(result.records[0]["_fields"][0]);
          //session.close();
        })
        .catch(function(error){
          console.log(error);
        });
  });



  /////////////
  //VOTING
  ///////////
  socket.on('upvoteTag', function(tagname, postID){
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
        socket.emit('receiveSinglePostData', result);
        console.log(result.records[0]["_fields"][1]);
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
        tagname: tagPostOrUserData.tagname
      };
      query = `
      MATCH (n:Post {postID:$postID})
      MERGE (m:Tag {name:$tagname})
      MERGE (m)<-[:TAGGEDAS]-(n)
      RETURN m, n
      `;
    }else{
      params = {
        userID: tagPostOrUserData.userID,
        tagname: tagPostOrUserData.tagname
      };
      query = `
      MATCH (n:User {userID:$userID})
      MERGE (m:Tag {name:$tagname})
      MERGE (m)<-[:TAGGEDAS]-(n)
      RETURN m, n
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
        socket.emit('error', 'tagPostOrUser fucked up');
      });  
  });




  ///////////////////
  //HARVEST POST
  socket.on('harvestPost', function(postID, userID){
  });

  ////////////////////
  //CURRENT CENSOR COST = 50
  ///////////////////
  socket.on('censorPost', function(dataFromClient){
    console.log("CENSOR POST");
    var query = `
    MATCH (n:Post {postID:$postID})
    DETACH DELETE (n)
    `;
      // console.log(postData.postId);
      // postData.file = "officialunofficialcensor.jpg";
      // var params = {
      //         upvotes: 0,
      //         downvotes: 0,
      //         type: "censored",
      //         title: "CENSORED BY "+userID,
      //         content: "post content deleted from server",
      //         tag: postData.tag,
      //         file: postData.file,
      //         clicks: 1,
      //         censorattempts: 0,
      //         shields: 0,
      //         memecoinsspent: 0
      // };

      //   var query = `
      //   MATCH (n:Post {postID:$postID)
      //   SET n.upvotes = $upvotes
      //    (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
      //   MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)-[ra:CREATEDBY]->(whomadeit)
      //   RETURN (newpost), (whichtag)
      //   `;
      
      // session
      // .run(query, params)
      // .then(function(result){
      //   result.records.forEach(function(record){
      //     console.log(record);
      //   });
      //   // session.close();
      // })
      // .catch(function(error){
      //   console.log(error);
      // }); 
  });
  
  ///////////////////////
  //CURRENT SHIELD COST = 25
  /////////////////////
  socket.on('shieldPost', function(dataFromClient){
    var params = {
      postID: dataFromClient.postID,
      userID: dataFromClient.userID
    };
    var query = `
      MATCH (p:Post {postID:$postID}), (u:User {userID:$userID})
      SET p.shields = p.shields + 1
      SET u.memecoin = u.memecoin - 25
      RETURN p, u
      `;
      session
        .run(query, params)
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
