import * as React from 'react';
import { Box, Container } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';
import marked from 'marked';
import DOMPurify from 'dompurify';

const contentPath = require('../../../content/News.md');

export const ContentBox = ({ p = 2, children }) => {
  const fullScreen = useFullScreen();
  return (
    <Box pl={fullScreen ? 1 : p} pr={fullScreen ? 1 : p} pt={fullScreen ? 2 : 4}>
      {children}
    </Box>
  );
};

export default function News() {
  const [state, setState] = React.useState({ markdown: '' });

  React.useEffect(() => {
    fetch(contentPath)
      .then(response => {
        return response.text();
      })
      .then(text => {
        setState({
          markdown: DOMPurify.sanitize(marked(text))
        });
      });
  }, [setState]);

  return (
    <section>
      <Container>
        <article dangerouslySetInnerHTML={{ __html: state.markdown }}></article>
      </Container>
    </section>
  );
}
