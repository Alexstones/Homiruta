import { MongoClient } from "mongodb";

if (!process.env.MONGO_URI) {
    console.error('⚠️ [MONGODB-ADAPTER] Missing MONGO_URI environment variable. Auth database features will be disabled.');
}

const uri = process.env.MONGO_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    if (!(global as any)._mongoClientPromise && uri) {
        client = new MongoClient(uri, options);
        (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
} else if (uri) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
} else {
    clientPromise = Promise.resolve(null as any);
}


export default clientPromise;
