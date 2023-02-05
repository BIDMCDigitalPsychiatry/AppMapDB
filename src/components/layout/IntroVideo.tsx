import ReactPlayer from 'react-player';

const contentPath = require('../../content/Intro.mp4');

export default function IntroVideo({ controls = true, playing = true }) {
  return <ReactPlayer url={contentPath} controls={controls} width='100%' playing={playing} />;
}
