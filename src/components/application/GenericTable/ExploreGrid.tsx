import ExploreGridItem from './ApplicationsGrid/ApplicationsGridItem';
import { VirtuosoGrid } from 'react-virtuoso';
import styled from '@emotion/styled';

const ItemContainer = styled.div`
  padding: 0.5rem;
  width: 25%;
  display: flex;
  flex: none;
  align-content: stretch;

  @media (max-width: 1300px) {
    width: 33%;
  }

  @media (max-width: 1200px) {
    width: 50%;
  }

  @media (max-width: 550px) {
    width: 100%;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
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
