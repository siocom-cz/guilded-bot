import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = 'mongodb://localhost:27017/';

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    retryReads: true,
    retryWrites: true,
});

const cleanup = (event) => {
    console.log('Closing database connection');
    void client.close();
    process.exit();
};

console.log('Connecting to mongo database');
await client.connect();
await client.db('admin').command({ ping: 1 });
console.log('Pinged your deployment. You successfully connected to MongoDB!');

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

export default client.db('siocom-guilded');