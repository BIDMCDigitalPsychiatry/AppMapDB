import { useUserEmail } from '../../layout/hooks';

export interface Post {
  id: string;
  authorName: string;
  category: string;
  content?: string;
  cover: string;
  publishedAt: number;
  readTime: string;
  shortDescription: string;
  title: string;
}

export const useDefaultValues = () => {
  const email = useUserEmail();
  return {
    title: '',
    shortDescription: '',
    category: categories[0],
    content: '',
    readTime: '5 min',
    publishedGlobally: true,
    enableComments: true,
    authorName: email
  };
};

export const categories = ['News', 'Annoucements', 'Education'];

export const readTimes = ['1 min', '2 min', '3 min', '4 min', '5 min', '6 min', '7 min', '8 min', '9 min', '10 min', '15 min', '> 15 min'];
