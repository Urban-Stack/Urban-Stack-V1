export const newName = (identifier: string) =>
  identifier
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 35)
    .replace(/-$/, '');
