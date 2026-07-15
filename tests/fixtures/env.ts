export interface Credentials {
  username: string;
  password: string;
}

const readCredentials = (
  username: string | undefined,
  password: string | undefined,
): Credentials | undefined => {
  if (!username || !password) return undefined;
  return { username, password };
};

export const env = {
  baseURL: process.env.BASE_URL ?? 'https://pt-test.mrstage.com',
  credentials: readCredentials(
    process.env.E2E_USERNAME,
    process.env.E2E_PASSWORD,
  ),
  limitedCredentials: readCredentials(
    process.env.E2E_LIMITED_USERNAME,
    process.env.E2E_LIMITED_PASSWORD,
  ),
};
