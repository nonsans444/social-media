import React, { useState } from "react";
import { Send, Image, MapPin, Smile, Globe, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebase, handleFirestoreError, OperationType } from "../../lib/firebase";

export const CreatePost = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [privacy, setPrivacy] = useState<"public" | "friends">("public");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    try {
      const { db } = getFirebase();
      const postPath = "posts";
      await addDoc(collection(db, postPath), {
        authorId: user.uid,
        authorName: user.username,
        authorPhoto: user.photoURL,
        content: content,
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
        reactions: { heart: [], like: [], flag: [] },
        privacy: privacy,
      });
      setContent("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Error creating post:", error);
      handleFirestoreError(error, OperationType.CREATE, "posts");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm mb-6">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-dz-green/10 flex-shrink-0 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dz-green font-bold">
              {user.username[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Wach rak t’khemem?"
            className="w-full bg-neutral-100 border-none rounded-2xl py-3 px-4 focus:ring-0 outline-none text-sm resize-none min-h-[44px] transition-all"
            rows={isExpanded ? 4 : 1}
          />
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-neutral-100 rounded-lg text-dz-green transition-colors">
                      <Image className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-neutral-100 rounded-lg text-dz-red transition-colors">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-neutral-100 rounded-lg text-amber-500 transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                    <div className="h-6 w-[1px] bg-neutral-200 mx-2" />
                    <button 
                      onClick={() => setPrivacy(privacy === "public" ? "friends" : "public")}
                      className="flex items-center gap-2 px-3 py-1 hover:bg-neutral-100 rounded-lg text-neutral-500 text-xs transition-colors"
                    >
                      {privacy === "public" ? <Globe className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {privacy === "public" ? "Public" : "Friends"}
                    </button>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    className="bg-dz-green hover:bg-dz-green/90 disabled:opacity-50 disabled:hover:bg-dz-green text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-dz-green/20"
                  >
                    <span>Partager</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
