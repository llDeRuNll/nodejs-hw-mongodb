import 'dotenv/config';

const getEnvVar = (name, defaultValue) => {
  const value = process.env[name];
  if (value) return value;
  if (defaultValue) return defaultValue;
  throw new Error(`Cannot find ${name} environement variable`);
};
export default getEnvVar;
