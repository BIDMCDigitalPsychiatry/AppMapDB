/// <reference types="react-scripts" />

// CRA's asset typings don't cover video files (the old code used require()).
declare module '*.mp4' {
  const src: string;
  export default src;
}
