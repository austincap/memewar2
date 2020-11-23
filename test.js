console.log('test');
const neo4j = require('neo4j-driver');
//const base64Img = require('base64-img');
const uri = 'bolt://localhost:7687';
const dbuser = 'neo4j';
const dbpassword = 'fucksluts';
const driver = neo4j.driver(uri, neo4j.auth.basic(dbuser, dbpassword), { disableLosslessIntegers: true });
const session = driver.session();
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
                //socket.emit('receiveTop20Data', topPostsAndTags);
              })
              .catch(function(error){
                console.log(error);
              });
        })
        .catch(function(error){
          console.log(error);
        });    