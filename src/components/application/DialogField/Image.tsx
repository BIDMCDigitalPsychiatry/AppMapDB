import React from 'react';
import Slider from '@material-ui/core/Slider';
import { Grid, Typography } from '@material-ui/core';
import AvatarEditor from 'react-avatar-editor';
import DialogButton from '../GenericDialog/DialogButton';
import * as Icons from '@material-ui/icons';
import { isEmpty } from '../../../helpers';

const Image = ({ value = '', onChange = undefined }) => {
  const [scale, setScale] = React.useState(1) as any;
  const editorRef = React.useRef() as any;

  const handleSave = () => {
    onChange && onChange(editorRef?.current?.getImage().toDataURL());
  };

  return (
    <Grid container justify='center'>
      <Grid item>
        <Typography align='center'>
          <AvatarEditor
            ref={editorRef}
            image={value}
            width={350}
            height={350}
            border={50}
            color={[255, 255, 255, 0.7]} // RGBA
            scale={scale}
            rotate={0}
          />
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Slider value={scale} min={0.1} max={4} step={0.01} aria-labelledby='Zoom' onChange={(e, scale) => setScale(scale)} />
      </Grid>
      <Grid item xs={12}>
        <div style={{ textAlign: 'right' }}>
          <DialogButton disabled={isEmpty(editorRef?.current)} Icon={Icons.Save} color='primary' onClick={handleSave}>
            Update Image
          </DialogButton>
        </div>
      </Grid>
    </Grid>
  );
};

export default Image;
