import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Header, SidebarLeft, SidebarRight } from "./components/layout/Layout";
import { CreatePost } from "./components/feed/CreatePost";
import { PostCard } from "./components/feed/PostCard";
import { Post } from "./types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebase } from "./lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Flag as FlagIcon } from "lucide-react";

const Feed = () => {
  const { isSetup } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!isSetup) return;
    
    try {
      const { db } = getFirebase();
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Post, "id">)
        }));
        setPosts(postsData);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firestore error:", e);
    }
  }, [isSetup]);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <CreatePost />
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Login = () => {
  const { login, user } = useAuth();
  
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-dz-green flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-dz-green rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-dz-green/20">
          <span className="text-white font-bold text-4xl">DZ</span>
        </div>
        <h1 className="font-display font-bold text-3xl mb-2">DZ-Connect</h1>
        <p className="text-neutral-500 mb-8 text-sm">
          Join the largest Algerian social network.<br />
          Connect with friends and family.
        </p>
        
        <button 
          onClick={login}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>
        
        <div className="mt-8 pt-8 border-t border-neutral-100">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
            Platform Identity
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-8 h-4 bg-dz-green rounded-sm" />
            <div className="w-8 h-4 bg-white border border-neutral-200 rounded-sm" />
            <div className="w-8 h-4 bg-dz-red rounded-sm" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isSetup } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-dz-green border-t-transparent rounded-full"
      />
    </div>
  );

  if (!isSetup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Initialisation de DZ-Connect</h2>
        <p className="text-neutral-500 max-w-md">
          Please complete the Firebase setup in the developer panel to start connecting with the community.
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-neutral-50">
                <Header />
                <main className="max-w-7xl mx-auto flex gap-6">
                  <aside className="hidden lg:block w-72 flex-shrink-0">
                    <SidebarLeft />
                  </aside>
                  <section className="flex-1 min-w-0 border-x border-neutral-200 bg-white/50 backdrop-blur-sm min-h-[calc(100vh-4rem)]">
                    <Routes>
                      <Route path="/" element={<Feed />} />
                      <Route path="/messages" element={<div className="p-8 text-center font-display font-medium text-neutral-400">Khouya Chat coming soon...</div>} />
                      <Route path="/trending" element={<div className="p-8 text-center font-display font-medium text-neutral-400">Trending DZ...</div>} />
                      <Route path="/profile/:id" element={<div className="p-8 text-center font-display font-medium text-neutral-400">Profile View...</div>} />
                    </Routes>
                  </section>
                  <aside className="hidden xl:block w-80 flex-shrink-0">
                    <SidebarRight />
                  </aside>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
