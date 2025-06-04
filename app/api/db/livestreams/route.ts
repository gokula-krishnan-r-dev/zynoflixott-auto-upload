import { NextResponse } from "next/server";
import { connectToDatabase } from "../users/route";


const dbName = 'ott';
const livestreamCollectionName = 'livestreams';

export async function GET(request: Request) {


    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db(dbName);






    const livestreams = await db.collection(livestreamCollectionName).find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ livestreams });
}