import { MongoClient, Db } from 'mongodb';

let mongo: Db;

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'tic-tac-toe';

try {
  client.connect();
  mongo = client.db(dbName);
} catch (err) {
  console.error(err);
  process.exit(10);
}

export { mongo };
