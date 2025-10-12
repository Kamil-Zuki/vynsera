"use client";
import React, { useEffect, useState } from 'react';

type FriendRequest = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

type Friendship = {
  _id: string;
  users: string[];
  since: string;
};

export default function FriendsList() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/friends');
      if (!res.ok) return;
      const data = await res.json();
      setRequests(data.requests || []);
      setFriendships(data.friendships || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAccept(id: string) {
    await fetch(`/api/friends/request/${id}`, { method: 'POST', body: JSON.stringify({ action: 'accept' }), headers: { 'Content-Type': 'application/json' } });
    fetchData();
  }

  async function handleReject(id: string) {
    await fetch(`/api/friends/request/${id}`, { method: 'POST', body: JSON.stringify({ action: 'reject' }), headers: { 'Content-Type': 'application/json' } });
    fetchData();
  }

  async function handleUnfriend(otherUserId: string) {
    await fetch('/api/friends', { method: 'DELETE', body: JSON.stringify({ otherUserId }), headers: { 'Content-Type': 'application/json' } });
    fetchData();
  }

  return (
    <div>
      <h3>Incoming Requests</h3>
      {loading && <div>Loading...</div>}
      {!loading && requests.length === 0 && <div>No requests</div>}
      <ul>
        {requests.map((r) => (
          <li key={r._id} style={{ marginBottom: 8 }}>
            <strong>{r.fromUserId}</strong> {r.message && <em>- {r.message}</em>}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => handleAccept(r._id)} style={{ marginRight: 8 }}>Accept</button>
              <button onClick={() => handleReject(r._id)}>Reject</button>
            </div>
          </li>
        ))}
      </ul>

      <h3>Friends</h3>
      {!loading && friendships.length === 0 && <div>No friends yet</div>}
      <ul>
        {friendships.map((f) => {
          const currentUser = 'me';
          const other = f.users.find((u) => u !== currentUser) || f.users[0];
          return (
            <li key={f._id} style={{ marginBottom: 8 }}>
              {other} <button onClick={() => handleUnfriend(other)} style={{ marginLeft: 8 }}>Unfriend</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
