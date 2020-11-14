const neo4j = require('neo4j-driver');
const uri = 'http://neo4j:neo4j@localhost:7474';
const dbuser = 'neo4j'
const dbpassword = 'neo4j'
const driver = neo4j.driver(uri, neo4j.auth.basic(dbuser, dbpassword));
const session = driver.session({
  database: 'memewar2',
  defaultAccessMode: neo4j.session.WRITE
});
const personName = 'austin';
const express = require('express');
const path = require('path');
var ObjectId = require('node-time-uuid');
var sanitizeHtml = require('sanitize-html');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static(__dirname));
// just to test the server
app.get('/', (req, res) => {
  res.status(200).send('Working');
});
var db = new neo4j.GraphDatabase('http://'+dbuser+':'+dbpassword+'@localhost:7474');








io.on('connection', function(socket){

  socket.on('addNewPost', function(postData){
    if(postData.userID=="ANON"){
      var blockId = new ObjectId();
      postPata.postId = blockId.getTimestamp();
      console.log(postData);
      var query = `
      MERGE (newpost:Post {postID:{postID}, upvotes:{upvotes}, downvotes:{downvotes}, type:{type}, title:{title}, content:{content}})
      MERGE (whichtag:Tag {name:{tag}})-[r:LABELS]->(newpost)<-[ra:CREATED]-(whomadeit)
      RETURN (newpost), (whichtag)
      `;
      this.db.cypher({
        query: query,
        params: {
          postID: postData.postId,
          upvotes: postData.upvotes,
          downvotes: postData.downvotes,
          type: postData.type,
          title: sanitizeHtml(postData.title),
          content: sanitizeHtml(postData.content),
          userID: postData.userID,
          tag: postData.tag
        }
      }, function(err, results){
        if(err){console.error('Error in BlockService createBlock label', err);}
        callback(null, results);
      });
    }else{
      var blockId = new ObjectId();
      postPata.postId = blockId.getTimestamp();
      console.log(postData);
      var query = `
      MATCH (whomadeit:User {userID:{userID}})
      MERGE (newblock:Post {postID:{postID}, upvotes:{upvotes}, downvotes:{downvotes}, type:{type}, title:{title}, content:{content}})
      MERGE (whichtag:Tag {name:{tag}})-[r:LABELS]->(newblock)<-[ra:CREATED]-(whomadeit)
      RETURN (newblock), (whichtag)
      `;
      this.db.cypher({
        query: query,
        params: {
          postID: postData.postId,
          upvotes: postData.upvotes,
          downvotes: postData.downvotes,
          type: postData.type,
          title: sanitizeHtml(postData.title),
          content: sanitizeHtml(postData.content),
          userID: postData.userID,
          tag: postData.tag
        }
      }, function(err, results){
        if(err){console.error('Error in BlockService createBlock label', err);}
        callback(null, results);
      });


    }
    
  });

});


server.listen(3000, function (){
  //  http://[2606:a000:101a:101:0:5a8b:1cd5:fa71]:3000/index.html
  console.log('Meme War app listening on port 3000 like a prude!');
});
