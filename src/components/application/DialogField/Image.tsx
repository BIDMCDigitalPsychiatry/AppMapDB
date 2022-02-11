import React from 'react';
import Slider from '@mui/material/Slider';
import { Grid } from '@mui/material';
import AvatarEditor from 'react-avatar-editor';
import * as Icons from '@mui/icons-material';
import { isEmpty } from '../../../helpers';
import SharedButton from '../../general/SharedButton';

const Image = ({ value = '', onChange = undefined, width = 500, height = 200 }) => {
  const [scale, setScale] = React.useState(1) as any;
  const editorRef = React.useRef() as any;

  const handleSave = () => {
    onChange && onChange(editorRef?.current?.getImage().toDataURL());
  };

  return (
    <Grid container justifyContent='center'>
      <Grid item style={{ textAlign: 'center' }}>
        <AvatarEditor
          ref={editorRef}
          image={value}
          width={width}
          height={height}
          border={50}
          color={[255, 255, 255, 0.9]} // RGBA
          scale={scale}
          rotate={0}
        />
      </Grid>
      <Grid item xs={12}>
        <Slider value={scale} min={0.1} max={4} step={0.01} aria-labelledby='Zoom' onChange={(e, scale) => setScale(scale)} />
      </Grid>
      <Grid item style={{ textAlign: 'right' }} xs={12}>
        <SharedButton disabled={isEmpty(editorRef?.current)} Icon={Icons.Save} label='Select Image' color='success' onClick={handleSave} />
      </Grid>
    </Grid>
  );
};

export default Image;
