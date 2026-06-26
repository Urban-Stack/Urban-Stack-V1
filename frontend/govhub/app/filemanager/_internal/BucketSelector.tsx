'use client';

import { Project } from '@/app/_lib/resource-api/project';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SEARCH_PARAMS } from './common';
import { Select } from 'flowbite-react';
import { useCallback, useEffect } from 'react';
import { bucketName } from '@/app/_lib/storage/common';

const BucketSelector = ({ projects }: { projects: Project[] }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bucket = searchParams.get(SEARCH_PARAMS.bucket) ?? undefined;

  const onSelectionChange = useCallback(
    (bucket?: string) => {
      const params = new URLSearchParams(searchParams);
      if (bucket) {
        params.set(SEARCH_PARAMS.bucket, bucket);
      } else {
        params.delete(SEARCH_PARAMS.bucket);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const exists = bucket && projects.find((v) => bucketName(v) === bucket);
    if (projects.length === 0 || exists) return;

    onSelectionChange(bucketName(projects[0]));
  }, [projects, bucket, searchParams, onSelectionChange]);

  return (
    <Select
      name='bucket-selector'
      disabled={projects.length === 0}
      onChange={(e) => onSelectionChange(e.target.value)}
      className='w-full max-w-[40rem]'
      value={bucket}
    >
      {projects.map((p) => (
        <option key={`${p.tenant}_${p.name}`} value={bucketName(p)}>
          {p.name} ({p.tenant})
        </option>
      ))}
    </Select>
  );
};

export default BucketSelector;
