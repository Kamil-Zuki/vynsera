"use client";
import React, { useEffect, useState } from 'react';

type Resource = { id: string; title: string; link: string };

export default function AdminSuggestedStep({ stepId, stepTitle, suggested }: { stepId: string; stepTitle: string; suggested: string[] }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [overrides, setOverrides] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const res = await Promise.all(suggested.slice(0, 12).map(async (id) => {
        const r = await fetch(`/api/admin/resource-details?id=${encodeURIComponent(id)}`).then((r) => r.json());
        return { id: r.id, title: r.title || id, link: r.link || '' };
      }));
      setResources(res.filter(Boolean));
    }
    load();
  }, [suggested]);

  function accept(id: string) {
    setOverrides((o) => Array.from(new Set([...o, id])));
  }
  function reject(id: string) {
    setOverrides((o) => o.filter((x) => x !== id));
  }

  async function save() {
    // post override array for this step
    const form = new FormData();
    form.append('override', JSON.stringify(overrides));
    await fetch(`/api/admin/roadmap-overrides?step=${encodeURIComponent(stepId)}`, { method: 'POST', body: form });
    alert('Saved override for ' + stepId);
  }

  return (
    <div>
      <h4>{stepTitle}</h4>
      <ul>
        {resources.map((r) => (
          <li key={r.id} style={{ marginBottom: 6 }}>
            <a href={r.link} target="_blank" rel="noreferrer">{r.title}</a>
            <div style={{ display: 'inline-block', marginLeft: 12 }}>
              <button onClick={() => accept(r.id)}>Accept</button>
              <button onClick={() => reject(r.id)} style={{ marginLeft: 6 }}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <strong>Current overrides:</strong>
        <pre>{JSON.stringify(overrides, null, 2)}</pre>
        <button onClick={save}>Save override</button>
      </div>
    </div>
  );
}
