import { AllDatasets } from '@/app/_lib/resource-api/graphql/datasets';
import { ClickHouseFormat } from '@/app/__generated__/types';
import { genHash } from '@/app/_lib/misc/misc';

export type DatasetFormat = 'csv' | 'json' | 'json-compact';

export type Dataset = {
  readonly name: string;
  readonly path: string;
  readonly format: DatasetFormat;
  readonly _tag: 'Dataset';
};

export const toDatasets: (
  result: AllDatasets,
) => ReadonlyMap<string, Dataset> = (result) =>
  new Map(
    (result.data?.project?.datasets ?? []).map((d) => [
      d.config.path,
      mkDataset(d.dataset, d.config.path, formatMap[d.config.format]),
    ]),
  );

export const unsafeToDatasetFormat: (filetype?: string) => DatasetFormat = (
  filetype,
) => {
  if (!filetype)
    throw new Error('Filetype is required to determine dataset format');

  const lower = filetype.toLowerCase();
  const ext = lower.startsWith('.') ? lower.slice(1) : lower;
  switch (ext) {
    case 'csv':
      return 'csv';
    case 'json':
      return 'json';
    default:
      throw new Error(`Unknown dataset format: ${ext}`);
  }
};

export const datasetName: (filename: string) => string = (filename) => {
  // prevent collisions using a hash
  const hash = Math.abs(genHash(filename)).toString().slice(0, 8);

  const cleaned = filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 27); // reserve space for dash + hash

  return `${cleaned}-${hash}`;
};

const formatMap: Readonly<Record<ClickHouseFormat, DatasetFormat>> = {
  CSV: 'csv',
  JSON: 'json',
  JSONCompact: 'json-compact',
};

const mkDataset: (
  name: string,
  path: string,
  format: DatasetFormat,
) => Dataset = (name, path, format) => ({
  name,
  path,
  format,
  _tag: 'Dataset',
});

export const internal = {
  mkDataset,
};
