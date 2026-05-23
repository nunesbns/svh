declare const __IS_DEV__: boolean;

export const IS_DEV = typeof __IS_DEV__ !== 'undefined' ? __IS_DEV__ : false;

export function log(message: any, ...optionalParams: any[]) {
  if (IS_DEV) {
    console.log(message, ...optionalParams);
  }
}

export function warn(message: any, ...optionalParams: any[]) {
  console.warn(message, ...optionalParams);
}

export function error(message: any, ...optionalParams: any[]) {
  console.error(message, ...optionalParams);
}
