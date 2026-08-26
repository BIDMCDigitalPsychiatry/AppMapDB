/*
 * Video content moved out of the repo/bundle to S3 (~98 MB of MP4s was
 * shipping with every clone and every Pages deploy). The bucket is created
 * and the files uploaded by infrastructure/createMediaBucket.js; objects are
 * public-read, immutable-cached, and served directly to the <video> tags.
 */
const MEDIA_BASE = 'https://mindapps-media-544847369688.s3.amazonaws.com/videos';

export const introVideoUrl = `${MEDIA_BASE}/Intro.mp4`;
export const zoom0VideoUrl = `${MEDIA_BASE}/zoom_0.mp4`;
export const zoom1VideoUrl = `${MEDIA_BASE}/zoom_1.mp4`;
