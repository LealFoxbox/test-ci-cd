import { format } from 'date-fns';

import { downloadDir, downloaderStorage, requestStoragePermission } from 'src/services/storage';
import config from 'src/config';
import { DownloadStore } from 'src/pullstate/downloadStore';

import { getApiUrl } from '../api/utils';

// note: timestamp t is unix time but in full seconds
function getNow() {
  return format(new Date(), 'yy_MM_dd t');
}

export type DownloadType = 'assignments' | 'structures';

function getFileUrl(params: { type: DownloadType; subdomain: string; token: string; page: number }) {
  if (params.type === 'structures') {
    return `${getApiUrl(params.subdomain)}/downloads/structures?user_credentials=${params.token}&page=${params.page}`;
  }

  return `${getApiUrl(params.subdomain)}/downloads/inspection_form_assignments?user_credentials=${params.token}&page=${
    params.page
  }`;
}

export async function downloadFile(params: { type: DownloadType; subdomain: string; token: string; page: number }) {
  const url = getFileUrl(params);
  const fileName = `${params.type}${params.page} - ${getNow()}.json`;

  const options = {
    path: `${downloadDir}/${fileName}`,
  };
  let storagePermission = true;

  if (parseInt(config.SYSTEM_VERSION, 10) < 10) {
    storagePermission = await requestStoragePermission();
  }

  if (storagePermission) {
    const res = await downloaderStorage({
      options,
      url,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    // this structure is useful because it matches the pullstate of structuresFilePaths and assignmentsFilePaths
    return { [fileName]: res.path() };
  } else {
    DownloadStore.update((s) => {
      s.error = `Failed to download. Permission denied.`;
      console.log(`handleError: ${s.error}`);
    });
  }
  return {};
}
