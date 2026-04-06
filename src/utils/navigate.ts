/**
 * Navigate singleton for use in sagas and HTTP interceptors,
 * where React hooks are not available.
 *
 * Populated at app mount via <NavigateSetter /> in router.tsx.
 */
import type { NavigateFunction, Location } from 'react-router-dom';

let _navigate: NavigateFunction = () => {
  console.warn('[navigate] Router not yet mounted');
};

let _location = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
} as Location;

export function setNavigate(n: NavigateFunction): void {
  _navigate = n;
}

export function setLocation(l: Location): void {
  _location = l;
}

/** navigate(to) or navigate(to, { replace: true }) — safe to call from sagas / interceptors */
export const appNavigate: NavigateFunction = (to: any, options?: any) =>
  _navigate(to, options);

/** Get current location — safe to call from sagas / interceptors */
export function getLocation(): Location {
  return _location;
}
