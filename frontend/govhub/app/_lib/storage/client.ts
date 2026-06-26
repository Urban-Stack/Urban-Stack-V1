import 'client-only';

export const uploadWithProgress = (
  file: File,
  presigned: { url: string; fields: Record<string, string> },
  onProgress: (percentage: number) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    Object.entries(presigned.fields).forEach(([k, v]) => formData.append(k, v));
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', presigned.url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 204 || xhr.status === 201) resolve();
      else reject(new Error(`Upload failed (status ${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));

    xhr.send(formData);
  });
