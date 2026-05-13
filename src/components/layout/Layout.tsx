import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, Bell, Search, User, LogOut, TrendingUp, Cpu, Globe } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";

const translations = {
  ar: {
    search: "بحث في DZ-Connect...",
    feed: "الرئيسية",
    messages: "الرسائل",
    trending: "الرائج",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",
    trending_title: "الرائج في الجزائر",
    khouya_chat: "دردشة الخاوة",
    made_by: "صنع من طرف",
  },
  fr: {
    search: "Rechercher sur DZ-Connect...",
    feed: "Fil d'actualité",
    messages: "Messages",
    trending: "Tendances",
    profile: "Profil",
    logout: "Déconnexion",
    trending_title: "Tendances en Algérie",
    khouya_chat: "Khouya Chat",
    made_by: "Réalisé par",
  },
  dz: {
    search: "Hous f DZ-Connect...",
    feed: "L'accueil",
    messages: "Les messages",
    trending: "Li rahom 'el fouq'",
    profile: "Profil ta'i",
    logout: "Khrouj",
    trending_title: "Wach rahou sari f DZ",
    khouya_chat: "Derdcha ta' l'khawa",
    made_by: "Khdemha",
  },
  en: {
    search: "Search DZ-Connect...",
    feed: "Feed",
    messages: "Messages",
    trending: "Trending",
    profile: "Profile",
    logout: "Log Out",
    trending_title: "Trending in DZ",
    khouya_chat: "Khouya Chat",
    made_by: "Made by",
  }
};

type Lang = "ar" | "fr" | "dz" | "en";

export const Header = () => {
  const { user } = useAuth();
  const [lang, setLang] = useState<Lang>("dz");

  const t = translations[lang];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-dz-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">DZ</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
            Connect
          </span>
        </Link>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={t.search}
              className="w-full bg-neutral-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-dz-green outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative group">
            <button className="flex items-center gap-1 p-2 hover:bg-neutral-100 rounded-lg text-xs font-bold uppercase transition-colors">
              <Globe className="w-4 h-4" />
              <span>{lang}</span>
            </button>
            <div className="absolute top-full right-0 mt-1 bg-white border border-neutral-100 rounded-xl shadow-xl py-2 min-w-[100px] hidden group-hover:block">
              {(Object.keys(translations) as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors uppercase font-bold",
                    lang === l ? "text-dz-green" : "text-neutral-600"
                  )}
                >
                  {l} {l === 'ar' ? '(العربية)' : l === 'fr' ? '(Français)' : l === 'en' ? '(English)' : '(Darja)'}
                </button>
              ))}
            </div>
          </div>

          <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-neutral-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-dz-red rounded-full" />
          </button>
          
          <Link to="/messages" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <MessageSquare className="w-5 h-5 text-neutral-600" />
          </Link>

          <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden border border-neutral-100">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                {user?.username?.[0] || "?"}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const SidebarLeft = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Feed", path: "/" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: TrendingUp, label: "Trending", path: "/trending" },
    { icon: User, label: "Profile", path: `/profile/${user?.uid}` },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sticky top-16">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 mb-4 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-dz-green/10 mb-4 overflow-hidden border-2 border-dz-green/20">
             {user?.photoURL ? (
              <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dz-green font-bold text-2xl">
                {user?.username?.[0] || "?"}
              </div>
            )}
          </div>
          <h3 className="font-bold text-lg">{user?.username || "Guest"}</h3>
          <p className="text-neutral-500 text-sm mb-4">{user?.city || "Algeria"}</p>
          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <span className="block font-bold text-sm">1.2k</span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">Followers</span>
            </div>
            <div className="flex-1">
              <span className="block font-bold text-sm">856</span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">Following</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                isActive 
                  ? "bg-dz-green text-white shadow-lg shadow-dz-green/20" 
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-neutral-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 space-y-4">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-neutral-600 hover:bg-dz-red/10 hover:text-dz-red transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
        
        <div className="p-4 bg-neutral-900 rounded-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-dz-green" />
            <span className="text-[10px] uppercase tracking-widest font-bold">DZ-Connect Pro</span>
          </div>
          <p className="text-xs text-neutral-400 mb-2">Developed by</p>
          <p className="text-sm font-display font-medium text-dz-green">Bandir Faysal</p>
        </div>
      </div>
    </div>
  );
};

export const SidebarRight = () => {
  const trending = [
    { tag: "#Algerie", posts: "45.2k" },
    { tag: "#Sahara", posts: "12.8k" },
    { tag: "#JSK", posts: "8.4k" },
    { tag: "#Couscous", posts: "22.1k" },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] p-4 sticky top-16 space-y-4">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-dz-red" />
          Trending in DZ
        </h3>
        <div className="space-y-4">
          {trending.map((item) => (
            <div key={item.tag} className="group cursor-pointer">
              <p className="font-bold text-neutral-800 group-hover:text-dz-green transition-colors">
                {item.tag}
              </p>
              <p className="text-xs text-neutral-500">{item.posts} posts</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
        <h3 className="font-display font-bold text-lg mb-4">Khouya Chat</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-neutral-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center relative">
                <span className="text-xs font-bold text-neutral-400">U{i}</span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-dz-green border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Ahmed El Dz</p>
                <p className="text-xs text-neutral-500 truncate">Wach el khawa!</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">
          © 2024 DZ-Connect • Made by Bandir Faysal
        </p>
      </div>
    </div>
  );
};
