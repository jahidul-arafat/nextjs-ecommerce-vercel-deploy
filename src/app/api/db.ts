import {MongoClient, ServerApiVersion, Db} from 'mongodb';

// cached client
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDb() {
    // caching the client and db if they exist to avoid re-connecting by every route handlers
    if (cachedClient && cachedDb) {
        console.log('Using cached MongoDB connection');
        return {client: cachedClient, db: cachedDb};
    }
    console.log('Creating new MongoDB connection');
    const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.giojp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    await client.connect();

    cachedClient = client;
    cachedDb = client.db('ecommerce-nextjs');
    console.log('Connected to MongoDB');

    return {client, db: cachedDb};

}

