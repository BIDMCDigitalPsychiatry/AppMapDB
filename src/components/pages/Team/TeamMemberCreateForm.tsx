import { Box, Card, CardContent, Container } from '@material-ui/core';
import Text from '../../application/DialogField/Text';
import ImageBase64 from '../../application/DialogField/ImageBase64';
import WholeNumberUpDown from '../../application/DialogField/WholeNumberUpDown';

const TeamMemberCreateForm = ({ values = {} as any, loading: disabled, setValues, errors = {} }) => {
  const { title = '', sortKey, subTitle, cover, shortDescription = '' } = values;
  const handleChange = id => event => setValues(prev => ({ ...prev, [id]: event?.target?.value }));

  return (
    <Container maxWidth='sm'>
      <Card variant='outlined'>
        <CardContent>
          <Text
            label='Title'
            margin='normal'
            name='title'
            value={title}
            error={errors['title']}
            onChange={handleChange('title')}
            required={true}
            disabled={disabled}
          />
          <Text
            label='Position/Subtitle'
            margin='normal'
            name='subTitle'
            value={subTitle}
            error={errors['subTitle']}
            onChange={handleChange('subTitle')}
            disabled={disabled}
          />
          <Box mt={1}>
            <Text
              margin='normal'
              multiline
              label='Short description'
              rows={6}
              value={shortDescription}
              onChange={handleChange('shortDescription')}
              error={errors['shortDescription']}
              disabled={disabled}
            />
          </Box>
          <ImageBase64
            label='Image'
            description='This image will also be shown on the team page. 350 x 350 recommended.'
            value={cover}
            error={errors['cover']}
            onChange={handleChange('cover')}
            width={175}
            height={175}
            disabled={disabled}
          />
          <Box mt={1}>
            <WholeNumberUpDown
              min={0}
              max={99999}
              margin='normal'
              label='Sort Key (Leave blank or enter a larger number to show at the top)'
              value={sortKey}
              onChange={handleChange('sortKey')}
              error={errors['sortKey']}
              disabled={disabled}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TeamMemberCreateForm;
