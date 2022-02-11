import { useScrollElement } from '../../../layout/ScrollElementProvider';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import NewsForumGridItem from './NewsForumGridItem';
import * as SortKeyDialog from '../../GenericDialog/SortKey';
import { renderDialogModule } from '../../GenericDialog/DialogButton';

const name = 'News Forum';
export const defaultTeamMemberProps: GenericTableContainerProps = {
  isGrid: true,
  GridItem: NewsForumGridItem,
  name,
  toolbar: false,
  footer: false,
  search: false,
  elevation: 0
};

export const NewsForum = ({ data, handleRefresh = undefined, ...other }) => {
  const { columns, ...defaultProps } = defaultTeamMemberProps;
  const scrollElement = useScrollElement();
  return (
    <>
      {renderDialogModule({ ...SortKeyDialog, handleRefresh })}
      <GenericTableContainer {...defaultProps} columns={columns} data={data} showScroll={true} scrollElement={scrollElement} {...other} />
    </>
  );
};
