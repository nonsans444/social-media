export interface User {
  uid: string;
  username: string;
  email: string;
  city: string;
  photoURL?: string;
  bio?: string;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  mediaURL?: string;
  mediaType?: "image" | "video";
  timestamp: number;
  reactions: {
    heart: string[]; // array of userIds
    like: string[];
    flag: string[];
  };
  privacy: "public" | "friends";
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  read: boolean;
  timestamp: number;
}
