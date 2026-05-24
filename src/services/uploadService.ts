import { apiFetch } from './api';

interface UploadImageResponse {
  url: string;
  publicId: string;
}

export const uploadService = {
  uploadMenuImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<UploadImageResponse>('/api/uploads/menu-image', {
      method: 'POST',
      body: formData,
    });
  },
};
