import React from 'react';
import { Box, Card, CardContent, Grid, TextField, Typography, useTheme } from '@mui/material';
import { categories, readTimes } from '../../../database/models/Post';
import DateTimePicker from '../../application/DialogField/DateTimePicker';
import Text from '../../application/DialogField/Text';
import Check from '../../application/DialogField/Check';
import QuillEditor from '../../application/QuillEditor';
import ImageBase64 from '../../application/DialogField/ImageBase64';

const CreateForm = ({ values = {} as any, setValues, errors = {}, loading = undefined }) => {
  const { title = '', authorName, category, content = '', cover, shortDescription = '', readTime } = values;
  const changeValue = id => value => setValues(prev => ({ ...prev, [id]: value }));
  const handleChange = id => event => setValues(prev => ({ ...prev, [id]: event?.target?.value }));
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
                  disabled={loading}
                />
              </Box>
              <ImageBase64
                label='Cover Image'
                description='This image will also be shown on the news page. 350 x 350 recommended.'
                value={cover}
                error={errors['cover']}
                onChange={handleChange('cover')}
                width={175}
                height={175}
                disabled={loading}
              />
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
                  disabled={loading}
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
                  disabled={loading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </TextField>
              </Box>
              <Box mt={2}>
                <TextField
                  fullWidth
                  multiline
                  label='Author Name'
                  variant='outlined'
                  value={authorName}
                  onChange={handleChange('authorName')}
                  disabled={loading}
                />
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
                  disabled={loading}
                >
                  {readTimes.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </TextField>
              </Box>
              <Box mt={2}>
                <DateTimePicker
                  id='publishedAt'
                  label='Date Published'
                  color='primary'
                  onChange={handleChange('publishedAt')}
                  value={values['publishedAt']}
                  error={errors['publishedAt']}
                  margin='normal'
                  getTime={true}
                  disabled={loading}
                />
              </Box>
              <Box mt={0}>
                <Check
                  id='adminOnly'
                  label='Admin Only'
                  color='primary'
                  onChange={handleChange('adminOnly')}
                  value={values['adminOnly']}
                  error={errors['adminOnly']}
                  disabled={loading}
                />
                <Check
                  id='enableComments'
                  label='Enable Comments'
                  color='primary'
                  onChange={handleChange('enableComments')}
                  value={values['enableComments']}
                  error={errors['enableComments']}
                  disabled={loading}
                />
                <Check
                  id='deleted'
                  label='Archived'
                  color='primary'
                  onChange={handleChange('deleted')}
                  value={values['deleted']}
                  error={errors['deleted']}
                  disabled={loading}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateForm;
