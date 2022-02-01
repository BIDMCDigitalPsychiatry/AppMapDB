import ExploreGridItem from './ExploreGridItem';
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

export default function ExploreGrid({ data, height, ...other }) {
  return (
    <>
      <VirtuosoGrid
        totalCount={data.length}
        style={{ height }}
        overscan={20}
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
          return item && item.getValues && <ExploreGridItem index={index} {...item.getValues()} />;
        }}
        scrollSeekConfiguration={{
          enter: velocity => Math.abs(velocity) > 1200,
          exit: velocity => Math.abs(velocity) < 30,
          // change: (_, range) => console.log({ range })
        }}
      />
    </>
  );
}
