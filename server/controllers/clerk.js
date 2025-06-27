import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const event = req.body;

    if (event.type === 'user.created') {
      const user = event.data;

      const userDocument = {
        _id: user.id, // Clerk user ID
        email: user.email_addresses[0]?.email_address || null,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        imageUrl: user.image_url,
        createdAt: new Date(user.created_at),
      };

      await client.connect();
      const db = client.db('hotel-booking');
      const users = db.collection('users');

      await users.insertOne(userDocument);

      return res.status(200).json({ message: 'User created and saved to DB' });
    } else {
      return res.status(400).json({ message: 'Unsupported event type' });
    }
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
