'use client';

import { useEffect, useState } from 'react';
import { fetchDomains, connectDomain, verifyDomain, makePrimaryDomain, removeDomain } from '../../../../lib/api/domains';

const STATUS_STYLES = {
  verified: 'btn-action-green',
  active: 'btn-action-green',
  pending: 'btn-action-gray',
  failed: 'btn-action-red',
};

function StatusBadge({ status }) {
  return <span className={`btn-action ${STATUS_STYLES[status] || 'btn-action-gray'}`}>{status}</span>;
}

export default function DomainsSettings() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [dnsInfo, setDnsInfo] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchDomains()
      .then(setDomains)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleConnect(e) {
    e.preventDefault();
    setError(null);
    setAdding(true);
    try {
      const { domain, dns } = await connectDomain(newDomain.toLowerCase().trim());
      setDomains((prev) => [domain, ...prev]);
      setDnsInfo({ domain: domain.domain, ...dns });
      setNewDomain('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleVerify(id) {
    setBusyId(id);
    setError(null);
    try {
      const updated = await verifyDomain(id);
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMakePrimary(id) {
    setBusyId(id);
    setError(null);
    try {
      await makePrimaryDomain(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(id) {
    if (!window.confirm('Disconnect this domain?')) return;
    try {
      await removeDomain(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Domains</h1>
      <p className="text-sm text-gray-500 mb-6">
        Connect your own domain (e.g. shop.yourbrand.com) so customers see it instead of the default address.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleConnect} className="bg-white rounded-lg shadow border border-gray-100 p-5 mb-6">
        <label className="block text-xs text-gray-500 mb-1">Domain</label>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="shop.yourbrand.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            required
          />
          <button type="submit" disabled={adding} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50 whitespace-nowrap">
            {adding ? 'Connecting...' : 'Connect Domain'}
          </button>
        </div>
      </form>

      {dnsInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6 text-sm">
          <p className="font-semibold text-gray-900 mb-2">
            Add this DNS record for <span className="font-mono">{dnsInfo.domain}</span>
          </p>
          <div className="grid grid-cols-[100px_1fr] gap-y-1 font-mono text-xs">
            <span className="text-gray-500">Type</span>
            <span>{dnsInfo.recordType}</span>
            <span className="text-gray-500">Host</span>
            <span>{dnsInfo.host}</span>
            <span className="text-gray-500">Target</span>
            <span>{dnsInfo.target}</span>
          </div>
          <p className="text-gray-600 mt-3">{dnsInfo.note}</p>
          <p className="text-gray-500 mt-2">
            After adding the record, DNS can take a few minutes to a few hours to propagate — then click "Verify DNS" below.
          </p>
          <button onClick={() => setDnsInfo(null)} className="btn-secondary mt-3">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Verification</th>
              <th className="px-4 py-3 font-medium">SSL</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {domains.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No domains connected yet.
                </td>
              </tr>
            )}
            {domains.map((d) => (
              <tr key={d.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{d.domain}</span>
                    {d.isPrimary && (
                      <span className="text-[10px] uppercase tracking-wide bg-gray-900 text-white px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={d.verificationStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={d.sslStatus} /></td>
                <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {d.verificationStatus !== 'verified' && (
                    <button onClick={() => handleVerify(d.id)} disabled={busyId === d.id} className="btn-action btn-action-blue">
                      {busyId === d.id ? 'Verifying...' : 'Verify DNS'}
                    </button>
                  )}
                  {d.verificationStatus === 'verified' && !d.isPrimary && (
                    <button onClick={() => handleMakePrimary(d.id)} disabled={busyId === d.id} className="btn-action btn-action-green">
                      Make Primary
                    </button>
                  )}
                  <button onClick={() => handleRemove(d.id)} className="btn-action btn-action-red">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
