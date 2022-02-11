import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import FilesDropzone from '../../application/FilesDropzone';
import { getFileName, isEmpty, toBase64, uuid } from '../../../helpers';
import Image from './Image';
import { getObjectUrl } from '../../../aws-exports';
import { isObject } from '../../application/GenericTable/helpers';
import * as Icons from '@mui/icons-material';
import SharedButton from '../../general/SharedButton';
import OutlinedDiv from '../../general/OutlinedDiv/OutlinedDiv';

const ImageBase64 = ({
  value,
  label = undefined,
  onChange = undefined,
  error = undefined,
  description = undefined,
  width = 500,
  height = 200,
  disabled = undefined,
  required = undefined
}) => {
  var isBase64 = isObject(value);
  var base64 = isBase64 && value?.base64;

  const handleDropCover = async ([file]: File[]) => {
    if (file) {
      if ((file as any).size > 20 * 1024 * 1024) {
        alert('File exceeds 20 MB upload limit.');
      } else {
        const base64 = (await toBase64(file)) as string;
        onChange({
          target: {
            value: {
              value: `${getFileName(file)}_${uuid()}`,
              base64,
              file
            }
          }
        });
      }
    }
  };

  const [resizing, setResizing] = React.useState(false);
  const handleRemoveCover = () => onChange({ target: { value: undefined } });

  const handleSelectCover = base64 => {
    if (isBase64) {
      onChange({
        target: {
          value: {
            ...value,
            base64 // Image has been resized so update accordingling
          }
        }
      });
    } else {
      console.error("Can't resize remote image");
    }
    setResizing(false);
  };
  const handleResizeCover = () => setResizing(prev => !prev);

  return (
    <Box py={1}>
      <OutlinedDiv>
        {label && (
          <Typography
            color='textSecondary'
            style={{
              fontWeight: 700
            }}
            variant='subtitle2'
          >
            {label}
            {required ? ' *' : ''}
          </Typography>
        )}
        {description && (
          <Typography color='textSecondary' variant='caption'>
            {description}
          </Typography>
        )}
        {!isEmpty(value) || isBase64 ? (
          <div style={{ textAlign: 'center' }}>
            {resizing && isBase64 ? (
              <Image value={base64} onChange={handleSelectCover} width={width} height={height} />
            ) : (
              <Box mt={6}>
                <img src={isBase64 ? base64 : getObjectUrl(value)} alt='cover' style={{ width, height }} />
              </Box>
            )}
            <Box
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 16
              }}
            >
              <Grid container justifyContent='flex-end' spacing={2}>
                {isBase64 && ( // Only allow resizing when working with local base64 copy because of cross origin editing limitations
                  <Grid item>
                    {resizing ? (
                      <SharedButton disabled={disabled} Icon={Icons.Cancel} label='Cancel Resize' color='error' onClick={handleResizeCover} />
                    ) : (
                      <SharedButton disabled={disabled} Icon={Icons.AspectRatio} label='Resize Image' color='primary' onClick={handleResizeCover} />
                    )}
                  </Grid>
                )}
                <Grid item>
                  <SharedButton disabled={disabled} Icon={Icons.Delete} label='Remove Image' color='error' onClick={handleRemoveCover} />
                </Grid>
              </Grid>
            </Box>
          </div>
        ) : (
          <FilesDropzone accept='image/*' maxFiles={1} onDrop={handleDropCover} disabled={disabled} />
        )}
        {!isEmpty(error) && (
          <Box mt={2}>
            <Typography align='right' color='error'>
              {error}
            </Typography>
          </Box>
        )}
      </OutlinedDiv>
    </Box>
  );
};

export default ImageBase64;
