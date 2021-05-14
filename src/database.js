const couchbase = require('couchbase')

const {user, dbpassword, dbbucket } = require('./keys'); 


const cluster = new couchbase.Cluster('couchbase://localhost', {
  username: user, password: dbpassword
});
const bucket = cluster.bucket(dbbucket);
const collection = bucket.defaultCollection();
console.log('Connecting to DATABASE');

module.exports = {collection,cluster};