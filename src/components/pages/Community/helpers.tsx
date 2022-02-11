import { isEmpty, sortAscending, sortDescending } from '../../../helpers';
import { escapeRegex, isMatch } from '../../application/GenericTable/helpers';
import { format } from 'date-fns';

export const sortPosts = (rows, direction) =>
  direction === 'desc' ? rows.sort((a, b) => sortDescending(a.publishedAt, b.publishedAt)) : rows.sort((a, b) => sortAscending(a.publishedAt, b.publishedAt));

export const searchPosts = (rows, search) => {
  if (isEmpty(search)) {
    return rows;
  } else {
    return rows.filter(post => {
      // content - leave this out for now
      const searchObj = {
        authorName: post.authorName,
        category: post.category,
        publishedAt: `${format(post.publishedAt, 'dd MMM')}`,
        readTime: `${post.readTime} read`,
        shortDescription: post.shortDescription,
        title: post.title
      };
      return isMatch(searchObj, escapeRegex(search));
    });
  }
};

export const sortComments = (rows, direction) =>
  direction === 'desc' ? rows.sort((a, b) => sortDescending(a.createdAt, b.createdAt)) : rows.sort((a, b) => sortAscending(a.createdAt, b.createdAt));
