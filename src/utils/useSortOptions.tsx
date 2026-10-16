import React from 'react';
import { tx } from '../i18n';
import SortAscendingIcon from '../components/icons/SortAscending';
import SortDescendingIcon from '../components/icons/SortDescending';

const sortOptions = {
  desc: { label: tx('Newest') as string, SortOptionIcon: SortDescendingIcon },
  asc: { label: tx('Older') as string, SortOptionIcon: SortAscendingIcon }
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
