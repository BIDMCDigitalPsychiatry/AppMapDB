import { AppState } from './store';
import { theme } from './constants';
import packageJson from '../package.json';

export function hostAddress(append?) {
  return (
    window.location.protocol +
    '//' +
    window.location.hostname +
    (window.location.port ? ':' + window.location.port : '') +
    (append !== undefined ? append : '')
  );
}

export const debugSettings = {
  debugoutput: false,
  logviewport: false,
  logrender: true,
  logmapping: false,
  logreducer: false,
  logselectors: false,
  logform: true,
  logformupdates: true,
  debugfieldonhover: false,
};

export function printHeader() {
  console.log(
    `%c
    
 █████╗ ██████╗ ██████╗       ███╗   ███╗ █████╗ ██████╗       ██████╗ ██████╗ 
██╔══██╗██╔══██╗██╔══██╗      ████╗ ████║██╔══██╗██╔══██╗      ██╔══██╗██╔══██╗
███████║██████╔╝██████╔╝█████╗██╔████╔██║███████║██████╔╝█████╗██║  ██║██████╔╝
██╔══██║██╔═══╝ ██╔═══╝ ╚════╝██║╚██╔╝██║██╔══██║██╔═══╝ ╚════╝██║  ██║██╔══██╗
██║  ██║██║     ██║           ██║ ╚═╝ ██║██║  ██║██║           ██████╔╝██████╔╝
╚═╝  ╚═╝╚═╝     ╚═╝           ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝           ╚═════╝ ╚═════╝ 
██████╗ ██╗██████╗ ███╗   ███╗ ██████╗   
██╔══██╗██║██╔══██╗████╗ ████║██╔════╝   Host: ${hostAddress()}
██████╔╝██║██║  ██║██╔████╔██║██║        
██╔══██╗██║██║  ██║██║╚██╔╝██║██║        Environment: ${process.env.NODE_ENV}
██████╔╝██║██████╔╝██║ ╚═╝ ██║╚██████╗   Version: ${packageJson.version}
╚═════╝ ╚═╝╚═════╝ ╚═╝     ╚═╝ ╚═════╝                            
`,
    'font-family:monospace;color:' + theme.palette.primary.main + ';font-size:12px;'
  );
}

export function getViewPortHeight(state: AppState) {
  return state.layout.height;
}

export function getLayoutHeight(state: AppState) {
  return getViewPortHeight(state);
}

export const setIfEmpty = value => (value === undefined || value === null ? '' : value);
export const checkEmpty = value => value === undefined || value === null || value === '';
export const undefinedIfEmpty = value => (checkEmpty(value) ? undefined : value);
export const isDefined = value => value !== undefined && value !== null;
export const hasChanged = (current, initial) => JSON.stringify(current) !== JSON.stringify(initial);

export const getKey = ({ container, object, id }: any) => [container, object, id].filter(v => !checkEmpty(v)).join('.');

export function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const uncapitalize = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toLowerCase() + s.slice(1);
};

export function copyToLower(obj = {}) {
  var key,
    keys = Object.keys(obj);
  var n = keys.length;
  var newobj = {};
  while (n--) {
    key = keys[n];
    newobj[uncapitalize(key)] = obj[key];
  }
  return newobj;
}

// Converts a string, number or boolean to boolean with default false
export const bool = x =>
  typeof x === 'boolean'
    ? x
    : typeof x === 'number'
    ? x === 1
      ? true
      : false
    : typeof x === 'string'
    ? x === '1'
      ? true
      : x.toLowerCase() === 'true'
      ? true
      : false
    : false;

// If a function, then return the result of the function call with props passed in.  Else return the value
export const evalFunc = (value, props = undefined) => (typeof value === 'function' ? value(props) : value);

export const emptyUndefined = value => (value === false || value === null ? undefined : value);
export const isError = value => (value === undefined || value === null || value === '' ? false : true);

export const copyDeleteKey = (key, obj) => deleteKey(key, { ...obj });

export const deleteKey = (key, obj) => {
  delete obj[key];
  return obj;
};

export const getLabel = f => (f.label === null ? undefined : f.label !== undefined ? f.label : f.id);

export function spread(final, current) {
  return { ...final, ...current };
}

export function isEmpty(str) {
  return !str || 0 === str.length;
}

export function triggerResize() {
  window.dispatchEvent(new CustomEvent('resize')); //Makes the indicator start animating
  setTimeout(() => window.dispatchEvent(new CustomEvent('resize')), 200); //Ensures the animation resized correctly after the drawer finishes opening/closing
}

export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}