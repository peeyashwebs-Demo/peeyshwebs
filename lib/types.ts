export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  creationDate: number;
  likedTutorials: string[];
  viewedTutorials: string[];
}

export interface Tutorial {
  tutorialId: string;
  creatorId: string;
  authorName?: string;
  title: string;
  description: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  creationDate: number;
  updateDate: number;
  likesCount: number;
  commentsCount: number;
  shareCount?: number;
}

export interface Comment {
  commentId: string;
  tutorialId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  parentCommentId: string | null;
  timestamp: number;
}

export interface Notification {
  notificationId: string;
  recipientId: string;
  type: 'like' | 'comment' | 'follow';
  triggerUserId: string;
  relatedResourceId: string;
  isRead: boolean;
  timestamp: number;
}
