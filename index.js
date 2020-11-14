const neo4j = require('neo4j-driver');
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
      var blockId = new ObjectId();
      postData.postId = blockId.getTimestamp();
      var params = {
          postID: int(postData.postId),
          upvotes: int(postData.upvotes),
          downvotes: int(postData.downvotes),
          type: postData.type,
          title: sanitizeHtml(postData.title),
          content: sanitizeHtml(postData.content),
          userID: postData.userID,
          tag: postData.tag,
          file: postData.file
      };
      console.log(postData);
      if(postData.userID=="ANON"){
        var query = `
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content})
        MERGE (whichtag:Tag {name:$tag})<-[r:TAGGEDAS]-(newpost)
        RETURN (newpost), (whichtag)
        `;
      }else{
        var query = `
        MATCH (whomadeit:User {userID:$userID})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content})
        MERGE (whichtag:Tag {name:$tag})<-[r:TAGGEDAS]-(newpost)<-[ra:CREATED]-(whomadeit)
        RETURN (newpost), (whichtag)
        `;
      }
      session
        .run(query, params)
        .then(function(result){
          result.records.forEach(function(record){
            console.log(record);
          });
          session.close();
        })
        .catch(function(error){
          console.log(error);
        });   
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
            newResult += (record.properties);
          });
          socket.emit('receiveData', result);
          //console.log(result.records[0]["_fields"][0]);
          session.close();
        })
        .catch(function(error){
          console.log(error);
        });    
  });

  socket.on('requestPostsWithTag', function(tagname){

  });

});


server.listen(3000, function (){
  //  http://[2606:a000:101a:101:0:5a8b:1cd5:fa71]:3000/index.html
  console.log('Meme War app listening on port 3000 like a prude!');
});
