// /api/user/register
import { NextRequest, NextResponse } from "next/server";
import {connectToDb} from "@/app/api/db";

// /api/user/[username]
export async function GET(req, res) {
    const { username } = req.query;
    const { db } = await connectToDb();

    const user = await db.collection('users').findOne({ username });
    res.status(200).json({ exists: !!user });
}


export async function POST(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const { db } = await connectToDb();

    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists.' });
    }

    await db.collection('users').insertOne({ username, email, password });
    res.status(201).json({ message: 'User registered successfully.' });
}
