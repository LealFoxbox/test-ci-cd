export const EXPIRATION_SECONDS = 60 * 60 * 24; // one day in seconds
export const EXPIRATION_MILISECONDS = EXPIRATION_SECONDS * 1000; // one day in miliseconds

export function getUnixSeconds() {
  return Date.now() * 0.001;
}

export function isSecondsExpired(timestamp: null | number) {
  return timestamp !== null && getUnixSeconds() - timestamp > EXPIRATION_SECONDS;
}

export function isMilisecondsExpired(timestamp: null | number) {
  return timestamp !== null && Date.now() - timestamp > EXPIRATION_MILISECONDS;
}
