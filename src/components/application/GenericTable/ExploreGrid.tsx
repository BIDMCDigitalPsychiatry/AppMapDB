import ExploreGridItem from './ApplicationsGrid/ApplicationsGridItem';
import { VirtuosoGrid } from 'react-virtuoso';
import styled from '@emotion/styled';
import { grey } from '@mui/material/colors';

/*
 * Columns are driven by the width of the grid itself (container queries),
 * not the viewport — so opening the filter drawer reflows the column count
 * correctly at any screen size.
 */
const ItemContainer = styled.div`
  padding: 12px;
  width: 100%;
  display: flex;
  flex: none;
  align-content: stretch;

  @container (min-width: 600px) {
    width: 50%;
  }

  @container (min-width: 980px) {
    width: 33.333%;
  }

  @container (min-width: 1300px) {
    width: 25%;
  }

  @container (min-width: 1650px) {
    width: 20%;
  }
`;

const ListContainer = styled.div`
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  background: ${grey[100]};
  container-type: inline-size;
`;

export default function ExploreGrid({ data, height, GridItem = undefined, scrollElement = undefined }) {
  GridItem === undefined && console.error('Must provide the GridItem component');
  return (
    <VirtuosoGrid
      customScrollParent={scrollElement}
      totalCount={data.length}
      style={{ height: scrollElement ? undefined : height }}
      components={{
        Item: ItemContainer,
        List: ListContainer as any,
        ScrollSeekPlaceholder: ({ height, width, index }) => (
          <ItemContainer>
            <ExploreGridItem>--</ExploreGridItem>
          </ItemContainer>
        )
      }}
      itemContent={index => {
        const item = data[index] ?? {};
        const values = item.getValues ? item.getValues() : item;
        return values && <GridItem index={index} {...values} />;
      }}
    />
  );
}
