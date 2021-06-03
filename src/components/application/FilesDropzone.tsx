import type { FC } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import type { DropzoneOptions } from 'react-dropzone';
import { Box, Button, createStyles, IconButton, Link, List, ListItem, ListItemIcon, ListItemText, makeStyles, Tooltip, Typography } from '@material-ui/core';
import DuplicateIcon from '../icons/Duplicate';
import XIcon from '../icons/X';
import { bytesToSize } from '../../helpers';

interface FileDropzoneProps extends DropzoneOptions {
  files?: any[];
  onRemove?: (file: any) => void;
  onRemoveAll?: () => void;
  onUpload?: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: ({ isDragActive }: any) => ({
      alignItems: 'center',
      border: 1,
      borderRadius: 1,
      borderColor: 'divider',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      outline: 'none',
      padding: 6 * 8,
      ...(isDragActive && {
        backgroundColor: 'action.active',
        opacity: 0.5
      }),
      '&:hover': {
        backgroundColor: 'action.hover',
        cursor: 'pointer',
        opacity: 0.5
      }
    }),
    img: {
      '& img': {
        width: 100
      }
    },
    listItem: {
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      '& + &': {
        marginTop: 8
      }
    }
  })
);

const FileDropzone: FC<FileDropzoneProps> = props => {
  const {
    accept,
    disabled,
    files,
    getFilesFromEvent,
    maxFiles,
    maxSize,
    minSize,
    noClick,
    noDrag,
    noDragEventsBubbling,
    noKeyboard,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onFileDialogCancel,
    onRemove,
    onRemoveAll,
    onUpload,
    preventDropOnDocument,
    ...other
  } = props;

  // We did not add the remaining props to avoid component complexity
  // but you can simply add it if you need to.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onDrop
  });

  const classes = useStyles({ isDragActive });

  return (
    <div {...other}>
      <Box className={classes.container} {...getRootProps()}>
        <input {...getInputProps()} />
        <Box className={classes.img}>
          <img alt='Select file' src='/images/undraw_add_file2_gvbb.svg' />
        </Box>
        <Box p={2}>
          <Typography color='textPrimary' variant='h6'>
            {`Select file${maxFiles && maxFiles === 1 ? '' : 's'}`}
          </Typography>
          <Box style={{ marginTop: 16 }}>
            <Typography color='textPrimary' variant='body1'>
              {`Drop file${maxFiles && maxFiles === 1 ? '' : 's'}`}
              {' or '}
              <Link color='primary' underline='always'>
                browse
              </Link>{' '}
              thorough your machine
            </Typography>
          </Box>
        </Box>
      </Box>
      {files.length > 0 && (
        <Box mt={2}>
          <List>
            {files.map(file => (
              <ListItem key={file.path} className={classes.listItem}>
                <ListItemIcon>
                  <DuplicateIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  primaryTypographyProps={{
                    color: 'textPrimary',
                    variant: 'subtitle2'
                  }}
                  secondary={bytesToSize(file.size)}
                />
                <Tooltip title='Remove'>
                  <IconButton edge='end' onClick={() => onRemove && onRemove(file)}>
                    <XIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 16
            }}
          >
            <Button color='primary' onClick={onRemoveAll} size='small' type='button' variant='text'>
              Remove All
            </Button>
            <Button color='primary' onClick={onUpload} size='small' style={{ marginLeft: 16 }} type='button' variant='contained'>
              Upload
            </Button>
          </Box>
        </Box>
      )}
    </div>
  );
};

FileDropzone.propTypes = {
  accept: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  disabled: PropTypes.bool,
  files: PropTypes.array,
  getFilesFromEvent: PropTypes.func,
  maxFiles: PropTypes.number,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
  noClick: PropTypes.bool,
  noDrag: PropTypes.bool,
  noDragEventsBubbling: PropTypes.bool,
  noKeyboard: PropTypes.bool,
  onDrop: PropTypes.func,
  onDropAccepted: PropTypes.func,
  onDropRejected: PropTypes.func,
  onFileDialogCancel: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  onUpload: PropTypes.func,
  preventDropOnDocument: PropTypes.bool
};

FileDropzone.defaultProps = {
  files: []
};

export default FileDropzone;
