import axios from 'axios';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axios.post('/api/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

export async function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  const { data } = await axios.post('/api/uploads/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls;
}
