const CSV_FILENAME_REGEX = /^[\sa-zA-Z0-9()+,.;:=@_/-]+\.csv$/i;

export const validFilename = (filename: string) =>
  CSV_FILENAME_REGEX.test(filename);

export const mkDownloadUrl: (tenant: string, project: string) => string = (
  tenant,
  project,
) => {
  const params = new URLSearchParams({
    tenant,
    project,
  });
  return `/api/project/sensor-meta?${params.toString()}`;
};
