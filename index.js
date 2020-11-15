const neo4j = require('neo4j-driver');
const base64Img = require('base64-img');
const uri = 'bolt://localhost:7687';
const dbuser = 'neo4j';
const dbpassword = 'fucksluts';
const driver = neo4j.driver(uri, neo4j.auth.basic(dbuser, dbpassword));
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






io.on('connection', function(socket) {
  console.log("connection");

  socket.on('addNewPost', function(postData){
      console.log("UPLOAD POST");
      var blockId = new ObjectId();
      postData.postId = blockId.getTimestamp();


      if(postData.file.substr(0,11)=='data:image/') {


        base64Img.img(postData.file, 'uploaded', postData.postID, function(err, filepath) {


          //need all this bullshit because of how filepath is returned and how neo4j interprets forward slashes
          var rawstring = String.raw`${filepath}`;
          console.log(rawstring);

          var params = {
              postID: parseInt(postData.postId),
              upvotes: 1,
              downvotes: 0,
              type: postData.type,
              title: sanitizeHtml(postData.title),
              content: sanitizeHtml(postData.content),
              userID: postData.userID,
              tag: postData.tag,
              file: rawstring.substr(0,19).replace(/\\/,"/")+"/"+rawstring.slice(20),
              clicks: 1
          };

          if(postData.userID=="ANON"){
            var query = `
            MATCH (whichtag:Tag {name:$tag})
            MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file})
            MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)
            RETURN (newpost), (whichtag)
            `;
          }else{
            var query = `
            MATCH (whichtag:Tag {name:$tag}), (whomadeit:User {userID:$userID})
            MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file})
            MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)<-[ra:CREATED]-(whomadeit)
            RETURN (newpost), (whichtag)
            `;
          }
          session
            .run(query, params)
            .then(function(result){
              result.records.forEach(function(record){
                console.log(record);
              });
              // session.close();
            })
            .catch(function(error){
              console.log(error);
            }); 

        });
      }
      else{

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
          clicks: 1
      };
         // postData.file = "officialunofficialplaceholderlogo.jpg";
          if(postData.userID=="ANON"){
            var query = `
            MATCH (whichtag:Tag {name:$tag})
            MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file})
            MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)
            RETURN (newpost), (whichtag)
            `;
          }else{
            var query = `
            MATCH (whichtag:Tag {name:$tag}), (whomadeit:User {userID:$userID})
            MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file})
            MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)<-[ra:CREATED]-(whomadeit)
            RETURN (newpost), (whichtag)
            `;
          }

      session
        .run(query, params)
        .then(function(result){
          result.records.forEach(function(record){
            console.log(record);
          });
          // session.close();
        })
        .catch(function(error){
          console.log(error);
        }); 




      }
  
  });

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

  socket.on('requestPostsWithTag', function(tagname){
    var query = `
    MATCH (n:Post)-[r:TAGGEDAS]->(m:Tag {name:$tagname})
    RETURN n
    `;
    session
      .run(query, {postID: postID})
      .then(function(result){
          var newResult = [];
          result.records[0]["_fields"][0].forEach(function(record){
            newResult.push(record.properties);
          });
          socket.emit('receiveData', newResult);
      })
      .catch(function(error){
        console.log(error);
      });
  });

  socket.on('upvoteTag', function(tagname, postID){

  });



  socket.on('reply', function(postData){
      var blockId = new ObjectId();
      postData.postId = blockId.getTimestamp();
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
          clicks: 1
      };
      if(postData.userID=="ANON"){
        var query = `
        MATCH (whichtag:Tag {name:$tag}), (n:Post {postID:$replyToId})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, replyToId:$replyToId})
        MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)-[rb:REPLYTO]->(n)
        RETURN (newpost), (whichtag)
        `;
      }else{
        var query = `
        MATCH (whichtag:Tag {name:$tag}), (whomadeit:User {userID:$userID}), (n:Post {postID:$replyToId})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, replyToId:$replyToId})
        MERGE (whichtag)<-[r:TAGGEDAS]-(newpost)<-[ra:CREATED]-(whomadeit)
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

  socket.on('viewpost', function(postID){
    var query = `
      MATCH (n:Post {postID:$postID})
      OPTIONAL MATCH (m:Post)-[r:REPLYTO]->(n)
      RETURN n, m
      `;
      session
        .run(query, {postID: parseInt(postID)})
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
