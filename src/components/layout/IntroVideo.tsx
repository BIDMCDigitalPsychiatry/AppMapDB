import ReactPlayer from 'react-player';

const contentPath = require('../../content/Intro.mp4');

export default function IntroVideo() {
  return <ReactPlayer url={contentPath} controls={true} width='100%' playing={true} />;
}
