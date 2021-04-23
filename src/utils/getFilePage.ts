export function getFilePage(fileName: string): number | null {
  const typeAndPage = fileName.split(' ')[0];
  const page = parseInt(typeAndPage.replace(/[^0-9]/g, ''), 10);

  if (isNaN(page)) {
    return null;
  }

  return page;
}
