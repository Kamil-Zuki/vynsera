"use client";
import React, { useEffect, useState } from 'react';

type UserLite = { name?: string; email?: string; image?: string };

type FriendRequestItem = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  fromUser?: UserLite | null;
  toUser?: UserLite | null;
};

type FriendshipItem = { _id: string; users: string[]; since?: string; other?: UserLite | { email?: string } };

export default function FriendsList() {
  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestItem[]>([]);
  const [friendships, setFriendships] = useState<FriendshipItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/friends');
      if (!res.ok) return;
      const data = await res.json();
      setIncoming(data.requests || []);
      setOutgoing(data.outgoing || []);
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

  async function handleCancel(id: string) {
    await fetch(`/api/friends/request/${id}`, { method: 'POST', body: JSON.stringify({ action: 'cancel' }), headers: { 'Content-Type': 'application/json' } });
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
      {!loading && incoming.length === 0 && <div>No requests</div>}
      <ul>
        {incoming.map((r) => (
          <li key={r._id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={r.fromUser?.image || '/images/avatar-placeholder.png'} alt={r.fromUser?.name || r.fromUserId} style={{ width: 36, height: 36, borderRadius: 18 }} />
              <div>
                <div><strong>{r.fromUser?.name || r.fromUserId}</strong> <span className="text-xs text-muted-foreground">{r.fromUser?.email}</span></div>
                {r.message && <div className="text-sm text-muted-foreground">{r.message}</div>}
              </div>
            </div>
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
        {friendships.map((f) => (
          <li key={f._id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={(f as any).other?.image || '/images/avatar-placeholder.png'} alt={(f as any).other?.name || (f as any).other?.email} style={{ width: 36, height: 36, borderRadius: 18 }} />
              <div>
                <div><strong>{(f as any).other?.name || (f as any).other?.email}</strong></div>
                <div className="text-xs text-muted-foreground">Friends since {(f.since || '').toString()}</div>
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => handleUnfriend((f as any).other?.email || '')} style={{ marginLeft: 8 }}>Unfriend</button>
            </div>
          </li>
        ))}
      </ul>

      <h3>Outgoing Requests</h3>
      {!loading && outgoing.length === 0 && <div>No outgoing requests</div>}
      <ul>
        {outgoing.map((r) => (
          <li key={r._id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={r.toUser?.image || '/images/avatar-placeholder.png'} alt={r.toUser?.name || r.toUserId} style={{ width: 36, height: 36, borderRadius: 18 }} />
            <div style={{ flex: 1 }}>
              <div><strong>{r.toUser?.name || r.toUserId}</strong> <span className="text-xs text-muted-foreground">{r.toUser?.email}</span></div>
              {r.message && <div className="text-sm text-muted-foreground">{r.message}</div>}
            </div>
            <div>
              <button onClick={() => handleCancel(r._id)}>Cancel</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
