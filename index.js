const neo4j = require('neo4j-driver');
const uri = 'http://neo4j:neo4j@localhost:7474';
const dbuser = 'neo4j'
const dbpassword = 'neo4j'
const driver = neo4j.driver(uri, neo4j.auth.basic(dbuser, dbpassword));
const session = driver.session();
const personName = 'austin';
const express = require('express');
const path = require('path');
var ObjectId = require('node-time-uuid');
var sanitizeHtml = require('sanitize-html');
try {
  const result = await session.run(
    'CREATE (a:User {name: $name}) RETURN a',
    { name: personName }
  )

  const singleRecord = result.records[0]
  const node = singleRecord.get(0)

  console.log(node.properties.name)
} finally {
  await session.close()
}

// on application exit:
await driver.close()