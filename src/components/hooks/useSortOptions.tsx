import React from 'react';
import SortAscendingIcon from '../icons/SortAscending';
import SortDescendingIcon from '../icons/SortDescending';

const sortOptions = {
  desc: { label: 'Newest', SortOptionIcon: SortDescendingIcon },
  asc: { label: 'Older', SortOptionIcon: SortAscendingIcon }
};

const useSortOptions = () => {
  const [sortOption, setSortOption] = React.useState<string>(Object.keys(sortOptions)[0]);
  const handleToggleSortDirection = (): void => {
    setSortOption(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const { label, SortOptionIcon } = sortOptions[sortOption];

  return { sortOption, sortLabel: label, SortOptionIcon, handleToggleSortDirection };
};

export default useSortOptions;
