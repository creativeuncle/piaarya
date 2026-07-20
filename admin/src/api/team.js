import axios from 'axios';

export async function fetchTeamMembers() {
  const { data } = await axios.get('/api/team');
  return data;
}

export async function fetchTeamRoles() {
  const { data } = await axios.get('/api/team/roles');
  return data;
}

export async function createTeamMember(payload) {
  const { data } = await axios.post('/api/team', payload);
  return data;
}

export async function updateTeamMember(id, payload) {
  const { data } = await axios.put(`/api/team/${id}`, payload);
  return data;
}

export async function deleteTeamMember(id) {
  const { data } = await axios.delete(`/api/team/${id}`);
  return data;
}
