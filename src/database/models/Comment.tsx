export interface Comment {  
  _id: string;
  postId: string;
  authorName: string;
  content: string;
  createdBy: string;
  updatedBy: string;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}
