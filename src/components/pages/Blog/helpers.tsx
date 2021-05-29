import { isEmpty, sortAscending, sortDescending } from '../../../helpers';
import { escapeRegex, isMatch } from '../../application/GenericTable/helpers';
import { format } from 'date-fns';

export const sortPosts = (posts, direction) =>
  direction === 'desc' ? posts.sort((a, b) => sortDescending(a.publishedAt, b.publishedAt)) : posts.sort((a, b) => sortAscending(a.publishedAt, b.publishedAt));

export const searchPosts = (posts, search) => {
  if (isEmpty(search)) {
    return posts;
  } else {
    return posts.filter(post => {
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
