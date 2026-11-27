'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { fetchCampaignSegments, createCampaign } from '../../../../../lib/api/marketing';
import { SEGMENT_LABELS } from '../../../../../constants/marketingSegments';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean'],
  ],
};

export default function NewEmailCampaign() {
  const router = useRouter();
  const [segments, setSegments] = useState([]);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCampaignSegments()
      .then((data) => {
        setSegments(data);
        setSegment((prev) => prev || data[0] || 'all_customers');
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError('Campaign name, subject, and body are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createCampaign({ name, subject, body, segment });
      router.push('/marketing');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">New Email Campaign</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-5 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Campaign Name</label>
          <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Subject</label>
          <input className="input w-full" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Body</label>
          <ReactQuill
            theme="snow"
            value={body}
            onChange={setBody}
            modules={QUILL_MODULES}
            className="bg-white [&_.ql-container]:rounded-b-md [&_.ql-toolbar]:rounded-t-md [&_.ql-editor]:min-h-[320px]"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Audience Segment</label>
          <select className="input" value={segment} onChange={(e) => setSegment(e.target.value)}>
            {segments.map((s) => (
              <option key={s} value={s}>{SEGMENT_LABELS[s] || s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => router.push('/marketing')}
          className="border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
