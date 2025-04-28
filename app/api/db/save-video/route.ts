import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI || 'mongodb+srv://gokula2323:wqSbxeNfSxVd1eyw@cluster0.vd91zsm.mongodb.net/ott?retryWrites=true&w=majority';
const dbName = 'ott';
const collectionName = 'videos';

// MongoDB client
let client: MongoClient | null = null;

async function connectToDatabase() {
  if (client) return client;
  
  client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB');
  return client;
}

// Function to validate if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  try {
    // Check if the string is a valid hex string of 24 characters
    return /^[0-9a-fA-F]{24}$/.test(id);
  } catch (error) {
    return false;
  }
}

// Function to create a new ObjectId from a string or create a new one if invalid
function createObjectId(id?: string): ObjectId {
  if (id && isValidObjectId(id)) {
    return new ObjectId(id);
  }
  // If id is invalid or not provided, create a new ObjectId
  return new ObjectId();
}

export async function POST(request: NextRequest) {
  try {
    const videoData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'thumbnail', 'preview_video', 'original_video'];
    for (const field of requiredFields) {
      if (!videoData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Add additional fields and defaults
    const now = new Date();
    let userId = process.env.DEFAULT_USER_ID || '66cb15b1fbbbaed0d6f22e53'; // Default user ID
    
    console.log(`Using user ID: ${userId}`);
    
    // Use a default ObjectId if userId is not valid
    const userObjectId = createObjectId(userId);
    
    const document = {
      ...videoData,
      user: userObjectId,
      viewsId: [],
      likesId: [],
      status: true,
      is_banner_video: false,
      is_active_video: true,
      created_by_id: userId,
      created_by_name: 'admin',
      processedImages: {
        medium: {
          caption: 'caption',
          path: `${new ObjectId().toString()}.jpeg`,
          width: 480,
          height: 360,
          type: 'image/jpeg'
        },
        small: {
          caption: 'caption',
          path: `${new ObjectId().toString()}.jpeg`,
          width: 110,
          height: 100,
          type: 'image/jpeg'
        },
        high: {
          caption: 'caption',
          path: `${new ObjectId().toString()}.jpeg`,
          width: 720,
          height: 540,
          type: 'image/jpeg'
        }
      },
      createdAt: now,
      updatedAt: now,
      __v: 0,
      followerCount: 0,
      averageRating: 0,
      ratings: []
    };
    
    // Insert document into MongoDB
    const result = await collection.insertOne(document);
    
    console.log(`Saved video ${videoData.title} to MongoDB with ID: ${result.insertedId}`);
    
    return NextResponse.json({
      ...document,
      _id: result.insertedId,
      message: 'Video details saved to database successfully'
    });
  } catch (error) {
    console.error('Error in MongoDB save API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 