import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserMultiple02Icon } from '@hugeicons/core-free-icons';
import { fetchTeamMembers, fetchTeamRoles, createTeamMember, updateTeamMember, deleteTeamMember } from '../api/team';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  support_staff: 'Support Staff',
};

export default function Team() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    fetchTeamMembers()
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchTeamRoles().then(setRoles).catch(() => {});
  }, []);

  async function handleRoleChange(id, role) {
    try {
      const updated = await updateTeamMember(id, { role });
      setMembers((prev) => prev.map((m) => (m._id === id ? updated : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(member) {
    try {
      const updated = await updateTeamMember(member._id, { isActive: !member.isActive });
      setMembers((prev) => prev.map((m) => (m._id === member._id ? updated : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await deleteTeamMember(id);
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <HugeiconsIcon icon={UserMultiple02Icon} size={22} strokeWidth={1.5} />
          Team Management
        </h1>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
          Add Team Member
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={5}>Loading...</td></tr>
            )}
            {!loading && members.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={5}>No team members yet.</td></tr>
            )}
            {members.map((member) => (
              <tr key={member._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                <td className="px-4 py-3">{member.email}</td>
                <td className="px-4 py-3">
                  <select className="input" value={member.role} onChange={(e) => handleRoleChange(member._id, e.target.value)}>
                    {roles.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {member.isActive ? (
                    <span className="text-green-600 text-xs font-medium">Active</span>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button onClick={() => toggleActive(member)} className="btn-action btn-action-gray">
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(member._id)} className="btn-action btn-action-red">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TeamMemberForm
          roles={roles}
          onClose={() => setShowForm(false)}
          onSaved={(member) => {
            setMembers((prev) => [member, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function TeamMemberForm({ roles, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roles[0] || 'support_staff');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const member = await createTeamMember({ name, email, password, role });
      onSaved(member);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Member'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
