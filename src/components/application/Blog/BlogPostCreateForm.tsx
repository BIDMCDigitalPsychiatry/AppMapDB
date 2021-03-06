import React from 'react';
import { Box, Button, Card, CardContent, Grid, TextField, Typography, useTheme } from '@material-ui/core';
import QuillEditor from '../QuillEditor';
import FilesDropzone from '../FilesDropzone';
import { categories, readTimes } from '../../../database/models/Post';
import Check from '../DialogField/Check';
import DateTimePicker from '../DialogField/DateTimePicker';
import Text from '../DialogField/Text';
import { isEmpty } from '../../../helpers';
import * as StockImageSelectorDialog from '../GenericDialog/StockImageSelector';
import DialogButton from '../GenericDialog/DialogButton';
import Image from '../DialogField/Image';

const toBase64 = (file: File): Promise<ArrayBuffer | string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

const BlogPostCreateForm = ({ values = {} as any, setValues, errors = {} }) => {
  const { title = '', authorName, category, content = '', cover, shortDescription = '', readTime } = values;

  const handleDropCover = async ([file]: File[]) => {
    const cover = (await toBase64(file)) as string;
    setValues(prev => ({ ...prev, cover }));
  };

  const [resizing, setResizing] = React.useState(false);

  const changeValue = id => value => setValues(prev => ({ ...prev, [id]: value }));
  const handleRemoveCover = () => setValues(prev => ({ ...prev, cover: undefined }));
  const handleChange = id => event => setValues(prev => ({ ...prev, [id]: event?.target?.value }));
  const handleSelectCover = cover => {
    console.log({ cover });
    setValues(prev => ({ ...prev, cover }));
    setResizing(false);
  };
  const handleResizeCover = () => setResizing(prev => !prev);

  console.log({ values });

  const theme = useTheme();

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item lg={8} md={6} xl={9} xs={12}>
          <Card variant='outlined'>
            <CardContent>
              <Text label='Post title' margin='normal' name='title' value={title} error={errors['title']} onChange={handleChange('title')} />
              <Box mt={3}>
                <Text
                  margin='normal'
                  multiline
                  label='Short description'
                  rows={6}
                  value={shortDescription}
                  onChange={handleChange('shortDescription')}
                  error={errors['shortDescription']}
                />
              </Box>
              <Typography
                color='textSecondary'
                style={{
                  marginBottom: 16,
                  marginTop: 24
                }}
                variant='subtitle2'
              >
                Cover
              </Typography>
              {cover ? (
                <div style={{ textAlign: 'center' }}>
                  {resizing ? <Image value={cover} onChange={handleSelectCover} /> : <img src={cover} alt='cover' style={{ width: 350 }} />}
                  {!isEmpty(errors['cover']) && (
                    <Box mt={2}>
                      <Typography align='right' color='error'>
                        {errors['cover']}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: 16
                    }}
                  >
                    <Button color='primary' onClick={handleResizeCover} variant='text'>
                      {resizing ? 'Cancel Resize Image' : 'Resize Cover Image'}
                    </Button>
                    <Button color='primary' onClick={handleRemoveCover} variant='text'>
                      Remove Cover Image
                    </Button>
                  </Box>
                </div>
              ) : (
                <>
                  <FilesDropzone accept='image/*' maxFiles={1} onDrop={handleDropCover} />
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: 16
                    }}
                  >
                    <DialogButton variant='default' Module={StockImageSelectorDialog} onChange={handleSelectCover}>
                      Select From Stock Images
                    </DialogButton>
                  </Box>
                </>
              )}
              <Box style={{ marginTop: 24 }}>
                <Typography color='textSecondary' style={{ marginBottom: 16 }} variant='subtitle2'>
                  Content
                </Typography>
                <QuillEditor
                  placeholder='Write something'
                  style={{
                    height: 400,
                    borderRadius: 5,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                  onChange={changeValue('content')}
                  value={content}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item lg={4} md={6} xl={3} xs={12}>
          <Card variant='outlined'>
            <CardContent>
              <Box mt={2}>
                <TextField
                  value={category}
                  onChange={handleChange('category')}
                  fullWidth
                  label='Category'
                  name='category'
                  select
                  SelectProps={{ native: true }}
                  variant='outlined'
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </TextField>
              </Box>
              <Box mt={2}>
                <TextField fullWidth multiline label='Author Name' variant='outlined' value={authorName} onChange={handleChange('authorName')} />
              </Box>
              <Box mt={2}>
                <TextField
                  value={readTime}
                  onChange={handleChange('readTime')}
                  fullWidth
                  label='Read Time'
                  name='readTime'
                  select
                  SelectProps={{ native: true }}
                  variant='outlined'
                >
                  {readTimes.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </TextField>
              </Box>
              <DateTimePicker
                id='publishedAt'
                label='Date Published'
                color='primary'
                onChange={handleChange('publishedAt')}
                value={values['publishedAt']}
                error={errors['publishedAt']}
                margin='normal'
              />
              <Box mt={0}>
                <Check
                  id='adminOnly'
                  label='Admin Only'
                  color='primary'
                  onChange={handleChange('adminOnly')}
                  value={values['adminOnly']}
                  error={errors['adminOnly']}
                />
                <Check
                  id='enableComments'
                  label='Enable Comments'
                  color='primary'
                  onChange={handleChange('enableComments')}
                  value={values['enableComments']}
                  error={errors['enableComments']}
                />
                <Check id='deleted' label='Archived' color='primary' onChange={handleChange('deleted')} value={values['deleted']} error={errors['deleted']} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default BlogPostCreateForm;
