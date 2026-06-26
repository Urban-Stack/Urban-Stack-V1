import 'client-only';

export const uploadSensorMetadata = (
  file: File,
  uploadUrl: string,
  onProgress: (percentage: number) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);

    const resolvedContentType = file.type || 'text/csv';
    if (resolvedContentType) {
      xhr.setRequestHeader('Content-Type', resolvedContentType);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      const status = xhr.status;
      if (isOK(status)) return resolve();
      else if (isUnsupportedMediaType(status))
        reject(new Error('Nur CSV Dateien werden unterstützt'));
      else if (isUnprocessable(status))
        reject(new Error('CSV Inhalt entspricht nicht gefordertem Format'));
      else reject(new Error(`Upload fehlgeschlagen (status ${status})`));
    };
    xhr.onerror = () => reject(new Error('Unbekannter Fehler'));

    xhr.send(file);
  });

const isOK = (status: number) => status >= 200 && status < 300;
const isUnsupportedMediaType = (status: number) => status == 415;
const isUnprocessable = (status: number) => status == 422;
