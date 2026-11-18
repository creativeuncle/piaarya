import axios from 'axios';

type OnProgress = (percent: number) => void;

export async function uploadFile(file: File, onProgress?: OnProgress) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axios.post('/api/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data.url;
}

export async function uploadFiles(files: File[], onProgress?: OnProgress) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  const { data } = await axios.post('/api/uploads/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data.urls;
}
