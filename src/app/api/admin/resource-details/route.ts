import connectDB from '@/lib/mongodb';
import ResourceModel from '@/models/Resource';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await connectDB();
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  const res = await ResourceModel.findOne({ id }).lean();
  if (!res) return NextResponse.json({});
  return NextResponse.json(res);
}
