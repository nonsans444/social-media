import React from "react";
import { MessageSquare, Share2, Heart, ThumbsUp, Flag } from "lucide-react";
import { motion } from "motion/react";
import { Post } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getFirebase } from "../../lib/firebase";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  
  const handleReaction = async (type: keyof Post["reactions"]) => {
    if (!user) return;
    
    const { db } = getFirebase();
    const postRef = doc(db, "posts", post.id);
    const hasReacted = post.reactions[type].includes(user.uid);
    
    try {
      await updateDoc(postRef, {
        [`reactions.${type}`]: hasReacted ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dz-green/10 overflow-hidden">
            {post.authorPhoto ? (
              <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dz-green font-bold">
                {post.authorName[0]}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">{post.authorName}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">
                 {formatDistanceToNow(post.timestamp)} ago
              </span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full" />
              <span className="text-[10px] uppercase font-bold text-dz-green tracking-widest">{post.privacy}</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <Share2 className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      <p className="text-neutral-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.mediaURL && (
        <div className="rounded-xl overflow-hidden mb-4 border border-neutral-100">
          <img src={post.mediaURL} alt="Post content" className="w-full object-contain max-h-[400px]" />
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <ReactionButton
            icon={Heart}
            count={post.reactions.heart.length}
            active={user ? post.reactions.heart.includes(user.uid) : false}
            activeColor="text-dz-red"
            onClick={() => handleReaction("heart")}
          />
          <ReactionButton
            icon={ThumbsUp}
            count={post.reactions.like.length}
            active={user ? post.reactions.like.includes(user.uid) : false}
            activeColor="text-dz-green"
            onClick={() => handleReaction("like")}
          />
          <ReactionButton
            icon={Flag}
            count={post.reactions.flag.length}
            active={user ? post.reactions.flag.includes(user.uid) : false}
            activeColor="text-dz-green"
            label="Tahia DZ"
            onClick={() => handleReaction("flag")}
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-neutral-500 hover:text-dz-green transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">12 Chat</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ReactionButton = ({ 
  icon: Icon, 
  count, 
  active, 
  activeColor, 
  onClick,
  label 
}: { 
  icon: any, 
  count: number, 
  active: boolean, 
  activeColor: string, 
  onClick: () => void,
  label?: string
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
      active ? cn(activeColor, "bg-neutral-50") : "text-neutral-500 hover:bg-neutral-100"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "fill-current" : "")} />
    <span className="text-xs font-bold">{count}</span>
    {label && active && <span className="text-[10px] uppercase font-bold ml-1">{label}</span>}
  </button>
);

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
