import * as React from 'react';
import { Typography, Button, Card, CardContent, CardActions, Popover, Grow, Grid, Divider } from '@mui/material';
import { useTourStep } from '../layout/hooks';
import { Box } from '@mui/system';
import { useScrollElement } from '../layout/ScrollElementProvider';
import useHeight from '../layout/ViewPort/hooks/useHeight';

export const tourSteps = {
  1: {
    title: 'Welcome to MINDApp!',
    subTitle: 'This tour will walk you through a few of the features in this web application.  Please click next to continue.',
    arrowPosition: 'none',
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center'
    }
  },
  2: {
    title: 'Search by Name',
    subTitle: 'If you know the name or company of the app you are looking for then enter it here.',
    arrowPosition: 'top-left'
  },
  3: {
    title: 'Platforms',
    subTitle: 'Select your desired platform(s): iOS, Android or Web.  Leave blank to search all platforms.',
    arrowPosition: 'top-left'
  },
  4: {
    title: 'Features',
    subTitle: 'Select one or many of the desired features.',
    arrowPosition: 'top-left'
  },
  5: {
    title: 'Search',
    subTitle: 'Click this button to see the results.',
    arrowPosition: 'top-right'
  },
  6: {
    title: 'Results',
    subTitle: 'The search results are shown here.',
    arrowPosition: 'none',
    anchorOrigin: {
      vertical: 'center',
      horizontal: 'center'
    }
  },
  7: {
    title: 'More filters',
    subTitle:
      'Use additional filters to refine your search results. When viewing on mobile, this can be opened by clicking the icon in the top left corner of the application bar.',
    arrowPosition: 'top-left'
  },
  8: {
    title: 'Toggle View',
    subTitle: 'Change the view type if you prefer the list view or grid view.',
    arrowPosition: 'top-right'
  },
  9: {
    title: 'Tour Complete!',
    subTitle: 'That covers the basics.  Feel free to explore the other tabs and options within the application.',
    arrowPosition: 'none',
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center'
    }
  }
};

const TourStep = ({ id, onNext = undefined, onPrev = undefined, onOpen = undefined, onClose = undefined, children }) => {
  const {
    title,
    subTitle,
    arrowPosition,
    anchorOrigin = {
      vertical: 'bottom',
      horizontal: 'center'
    },
    transformOrigin = {
      vertical: 'top',
      horizontal: 'left'
    }
  } = tourSteps[id] ?? {};
  const [el, setEl] = React.useState(null);
  const { step, setStep } = useTourStep();
  const handleClose = React.useCallback(() => {
    setStep(0);
    onClose && onClose();
  }, [setStep, onClose]);
  const handlePrev = React.useCallback(() => {
    onPrev && onPrev();
    setStep(step - 1);
  }, [step, setStep, onPrev]);
  const handleNext = React.useCallback(() => {
    onNext && onNext();
    setStep(step + 1);
  }, [step, setStep, onNext]);

  const open = step === id;
  const left = arrowPosition === 'top-right' ? 'calc(75% - 6px)' : arrowPosition === 'top-left' ? 'calc(0% - 6px)' : 'calc(50% - 6px)';
  const isLast = id === Object.keys(tourSteps).length;

  const scrollEl = useScrollElement();
  const height = useHeight();

  React.useEffect(() => {
    if (open && el) {
      var rect = el.getBoundingClientRect();
      scrollEl.scrollTop = rect.top;
    }
  }, [open, el, scrollEl, height]);

  React.useEffect(() => {
    open && onOpen && onOpen();
  }, [open, onOpen]);

  return (
    <>
      <Popover
        open={open}
        TransitionComponent={Grow}
        BackdropProps={{ invisible: false }}
        PaperProps={{
          sx: { background: 'transparent' }
        }}
        anchorEl={el}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        {arrowPosition !== 'none' && (
          <Box
            sx={{
              position: 'relative',
              mt: '10px',
              background: 'transparent',
              '&::before': {
                backgroundColor: 'warning.light',
                content: '""',
                display: 'block',
                position: 'absolute',
                width: 12,
                height: 12,
                top: -6,
                transform: 'rotate(45deg)',
                left
              }
            }}
          />
        )}
        <Box sx={{ p: 1, backgroundColor: 'warning.light', borderRadius: 1 }}>
          <Card style={{ maxWidth: 400 }}>
            <CardContent>
              {step > 0 && (
                <>
                  <Grid container>
                    <Grid item xs={12}>
                      <Grid container alignItems='center'>
                        <Grid item xs>
                          <Typography sx={{ fontSize: 16, fontWeight: 900 }} variant='h5' noWrap>
                            {title}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography sx={{ fontSize: 16, fontWeight: 900 }} variant='h5'>
                            {step} of {Object.keys(tourSteps).length}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Box pt={1}>
                        <Typography variant='body1'>{subTitle}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
            <CardActions>
              {!isLast && (
                <Button size='small' variant='contained' onClick={handleClose}>
                  Close
                </Button>
              )}
              {step > 1 && (
                <Button size='small' variant='contained' onClick={handlePrev}>
                  Previous
                </Button>
              )}
              <Button size='small' variant='contained' onClick={isLast ? handleClose : handleNext}>
                {isLast ? 'Done' : 'Next'}
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Popover>

      <Box ref={setEl} sx={{ outline: open ? '4px solid orange' : undefined }}>
        {children}
      </Box>
    </>
  );
};
export default TourStep;
