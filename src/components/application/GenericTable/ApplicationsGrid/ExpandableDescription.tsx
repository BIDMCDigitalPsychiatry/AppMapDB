import React from 'react';
import { Button, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { isEmpty } from '../../../../helpers';

export const getDescription = ({ appleStore, androidStore }) => {
  var description = !isEmpty(appleStore?.description) ? appleStore.description : androidStore?.description;
  return description;
};

// Render bare URLs in store descriptions as clickable links (new tab).
const URL_RE = /(https?:\/\/[^\s]+)/g;
const linkify = (text: string) =>
  String(text ?? '')
    .split(URL_RE)
    .map((part, i) => {
      if (i % 2 === 1) {
        const url = part.replace(/[).,;:!?]+$/, ''); // keep trailing punctuation out of the link
        const trail = part.slice(url.length);
        return (
          <React.Fragment key={i}>
            <a href={url} target='_blank' rel='noopener noreferrer'>
              {url}
            </a>
            {trail}
          </React.Fragment>
        );
      }
      return part;
    });

export default function ExpandableDescription({
  variant = 'body1' as any,
  maxDescription = 1000,
  androidStore = undefined,
  appleStore = undefined,
  handleRefresh = undefined
}) {
  const [expand, setExpand] = React.useState(false);

  const handleToggleExpand = React.useCallback(() => {
    setExpand(prev => !prev);
    handleRefresh && handleRefresh();
  }, [setExpand, handleRefresh]);

  var description = getDescription({ appleStore, androidStore });
  // Expandable when long by characters OR by rendered lines — store text is
  // often newline/bullet heavy, so a character cap alone lets short-charcount
  // descriptions tower.
  const COLLAPSED_LINES = 12;
  const lineCount = (description?.match(/\n/g)?.length ?? 0) + 1;
  const isExpandable = description?.length > maxDescription || lineCount > COLLAPSED_LINES;

  // pre-line preserves the paragraph breaks and bullet lines that store
  // descriptions contain as plain \n characters.
  const textStyle: any = { whiteSpace: 'pre-line' };
  const collapsedStyle: any = {
    ...textStyle,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: COLLAPSED_LINES,
    overflow: 'hidden'
  };

  return isExpandable ? (
    <>
      <Typography variant={variant} style={expand ? textStyle : collapsedStyle}>
        {linkify(description)}
      </Typography>
      <Button
        size='small'
        onClick={handleToggleExpand}
        endIcon={expand ? <Icons.ExpandLess /> : <Icons.ExpandMore />}
        sx={{ textTransform: 'none', fontWeight: 600, mt: 0.5, px: 1 }}
      >
        {expand ? 'Show less' : 'Show more'}
      </Button>
    </>
  ) : (
    <Typography variant={variant} style={textStyle}>
      {linkify(description)}
    </Typography>
  );
}
