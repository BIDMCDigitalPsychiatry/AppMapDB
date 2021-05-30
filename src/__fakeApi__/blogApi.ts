import { subDays, subHours, subMinutes, subSeconds } from 'date-fns';
import { Post } from '../components/application/Blog/post';

const now = new Date();

var posts: Post[] = [
  {
    id: '24b76cac9a128cd949747080',
    authorName: 'Jie Yan Song',
    category: 'News',
    cover: '/static/mock-images/covers/cover_4.jpeg',
    publishedAt: subMinutes(subSeconds(now, 16), 45).getTime(),
    readTime: '5 min',
    shortDescription:
      'MIND and its supporting studies have recently been featured in two articles. The first, "The Mental Health App Marketplace is a Mess, Researchers Find” by Dr. Emaline Friedman, details a recent publication that analyzed the 278 apps comprising the database. The second, “With consumers’ health and privacy on the line, do mental wellness apps need more oversight” by Heather Landi, discusses privacy and quality concerns surrounding mental health apps. Landi introduces MIND as a tool to help users navigate the world of healthcare apps and make informed choices.',
    content:
      'COVER: MIND and its supporting studies have recently been featured in two articles. The first, "The Mental Health App Marketplace is a Mess, Researchers Find” by Dr. Emaline Friedman, details a recent publication that analyzed the 278 apps comprising the database. The second, “With consumers’ health and privacy on the line, do mental wellness apps need more oversight” by Heather Landi, discusses privacy and quality concerns surrounding mental health apps. Landi introduces MIND as a tool to help users navigate the world of healthcare apps and make informed choices.',
    title: 'Press Coverage - MIND featured in popular press articles'
  },
  {
    id: 'a9c19d0caf2ca91020aacd1f',
    authorName: 'Omar Darobe',
    category: 'Announcements',
    cover: '/static/mock-images/covers/cover_5.jpeg',
    publishedAt: subHours(subMinutes(subSeconds(now, 29), 51), 6).getTime(),
    readTime: '6 min',
    shortDescription:
      'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi in turpis ac quam luctus interdum. Nullam ac lorem ligula. Integer sed massa bibendum, blandit ipsum et, iaculis augue. Curabitur nec enim eget dolor tincidunt posuere eget nec dolor. Ut ullamcorper dignissim arcu vel laoreet. Sed ligula dolor, vulputate quis eros ac, maximus pharetra orci. Aenean lobortis volutpat vehicula. Suspendisse vel nunc enim. Cras ultrices metus libero, non aliquam diam condimentum vel. Vestibulum arcu leo, consectetur id diam a, semper elementum odio. Proin eleifend volutpat sapien tempor bibendum. Etiam sagittis nulla sit amet aliquam sollicitudin.',
    title: 'Scrum Has Hit the Glass Ceiling'
  },
  {
    id: '44df90cbf89963b8aa625c7d',
    authorName: 'Siegbert Gottfried',
    category: 'Educational',
    cover: '/static/mock-images/covers/cover_6.jpeg',
    publishedAt: subHours(subMinutes(subSeconds(now, 6), 46), 16).getTime(),
    readTime: '3 min',
    shortDescription:
      'Praesent eget leo mauris. Morbi ac vulputate nibh. In hac habitasse platea dictumst. Praesent fermentum lacus eleifend erat cursus, congue rhoncus mi porta. Mauris rhoncus mollis nisl, vitae tempus tortor. Proin sit amet feugiat felis. Donec nunc urna, pretium sed viverra vel, blandit at urna. Integer pharetra placerat mauris, at fringilla arcu dignissim a. Morbi nec fermentum purus. Integer vel justo interdum lectus euismod bibendum.',
    title: 'How Model View Controller (MVC) Architectures Work'
  },
  {
    id: 'c597c300fe3f817c41a2f01d',
    authorName: 'Iulia Albu',
    category: 'News',
    cover: '/static/mock-images/covers/cover_7.jpeg',
    publishedAt: subDays(subHours(subMinutes(subSeconds(now, 52), 39), 7), 5).getTime(),
    readTime: '1 min',
    shortDescription:
      'Phasellus eu commodo lacus, eget tristique nunc. Ut ullamcorper semper nunc sit amet vehicula. Cras non nisl sed eros ultricies posuere sed quis quam. Morbi neque justo, volutpat eget pretium in, convallis vitae augue. Vestibulum sapien ligula, iaculis nec dui sed, ultrices euismod orci. Duis eget urna vulputate, venenatis est eu, luctus nunc. Nunc id ante ac leo viverra pharetra. Vestibulum blandit tellus ac nunc elementum, ut porta libero sagittis. Sed ultrices lacinia nunc, sed ornare nulla blandit blandit.',
    title: 'Generating Passive Income Is Hard, Here Is a Better Option'
  }
];

class BlogApi {
  getPosts(): Promise<Post[]> {
    return Promise.resolve(posts);
  }

  getPost(id): Promise<Post> {
    return Promise.resolve(posts.find(p => p.id === id));
  }

  addPost(post): Promise<Post> {
    posts = [...posts, post];
    return Promise.resolve(post);
  }

  updatePost(post): Promise<Post> {
    var filtered = posts.filter(p => p.id !== post.id);
    posts = [...filtered, post];
    return Promise.resolve(post);
  }

  deletePost(post): Promise<Post> {
    posts = [...posts, post];
    return Promise.resolve(post);
  }
}

export const blogApi = new BlogApi();
