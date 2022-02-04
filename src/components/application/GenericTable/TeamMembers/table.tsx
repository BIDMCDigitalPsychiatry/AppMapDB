import { useScrollElement } from '../../../layout/ScrollElementProvider';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import TeamMemberGridItem from './TeamMemberGridItem';
import * as SortKeyDialog from '../../GenericDialog/SortKey';
import { renderDialogModule } from '../../GenericDialog/DialogButton';

const name = 'Team Members';
export const defaultTeamMemberProps: GenericTableContainerProps = {
  isGrid: true,
  GridItem: TeamMemberGridItem,
  name,
  toolbar: false,
  footer: false,
  search: false,
  elevation: 0
};

export const TeamMembers = ({ data, handleRefresh, HeaderComponent = undefined, ...other }) => {
  const { columns, ...defaultProps } = defaultTeamMemberProps;
  const scrollElement = useScrollElement();
  return (
    <>
      {renderDialogModule({ ...SortKeyDialog, handleRefresh })}
      {HeaderComponent && <HeaderComponent />}
      <GenericTableContainer {...defaultProps} columns={columns} data={data} showScroll={true} scrollElement={scrollElement} {...other} />
    </>
  );
};
