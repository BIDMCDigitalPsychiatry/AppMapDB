import ReactPlayer from 'react-player';

import { introVideoUrl as contentPath } from '../../content/videos';

// Responsive 16:9 player — fills whatever container it's placed in.
export default function IntroVideo({ controls = true, playing = true }) {
  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      <ReactPlayer
        url={contentPath}
        controls={controls}
        playing={playing}
        width='100%'
        height='100%'
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}
