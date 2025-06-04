import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = 'ott';
const userCollectionName = 'user_profiles';
const companyCollectionName = 'productioncompanies';

// Helper function to connect to MongoDB
export async function connectToDatabase() {
    const client = new MongoClient(uri);
    await client.connect();
    return client;
}


export async function GET(request: NextRequest) {
    try {
        // Connect to MongoDB
        const client = await connectToDatabase();
        const db = client.db(dbName);

        // Get search parameters
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';

        let result: any = {};

        // Fetch user profiles
        if (type === 'all' || type === 'users') {
            const userCollection = db.collection(userCollectionName);
            const users = await userCollection.find({}).sort({ createdAt: -1 }).toArray();
            result.users = users;
        }

        // Fetch production companies
        if (type === 'all' || type === 'companies') {
            const companyCollection = db.collection(companyCollectionName);
            const companies = await companyCollection.find({}).sort({ createdAt: -1 }).toArray();
            result.companies = companies;
        }

        await client.close();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
} 