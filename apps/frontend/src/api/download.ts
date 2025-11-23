import { api } from './client';

export const downloadFile = async (url: string, filename: string) => {
  const response = await api.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
  const blob = new Blob([response.data]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
