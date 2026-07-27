import client from './client';

export async function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  const { data } = await client.post('/uploads/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls;
}
