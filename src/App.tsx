import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Map as MapIcon, 
  PlusCircle, 
  Building2, 
  User, 
  UtensilsCrossed,
  Leaf,
  BarChart3,
  Users,
  Star as StarIcon,
  ShieldCheck,
  MapPin,
  Clock,
  Camera,
  Heart,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Menu,
  X,
  BadgeAlert,
  LogOut,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Marker } from 'pigeon-maps';
import { cn } from './lib/utils';
import { 
  auth, 
  googleProvider, 
  getOrCreateProfile, 
  updateProfile as apiUpdateProfile, 
  getUserReviews as apiGetUserReviews, 
  addUserReview as apiAddReview,
  UserProfile, 
  UserReview 
} from './lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';

// --- Types ---

type Page = 'landing' | 'map' | 'post' | 'ngo' | 'profile';

interface FoodItem {
  id: string;
  title: string;
  type: string;
  quantity: string;
  expiry: string;
  location: [number, number];
  freshness: 'fresh' | 'good' | 'expiring';
  postedBy: string;
  distance: string;
  hygieneRating: number;
}

// --- Components ---

const Navigation = ({ 
  activePage, 
  setActivePage,
  profile
}: { 
  activePage: Page, 
  setActivePage: (p: Page) => void,
  profile: UserProfile | null
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'map', label: 'Find Nearby', icon: MapIcon },
    { id: 'post', label: 'Post Food', icon: PlusCircle },
    { id: 'ngo', label: 'NGO Portal', icon: Building2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 md:top-0 md:bottom-auto w-full bg-white/80 backdrop-blur-md border-t md:border-b border-stone-200 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('landing')}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-stone-800 tracking-tight">Leftover<span className="text-emerald-600">Connect</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  activePage === item.id 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                )}
              >
                {item.id === 'profile' && profile ? (
                  <img src={profile.photoURL} alt="profile" className="w-5 h-5 rounded-full object-cover border border-emerald-500" />
                ) : (
                  <item.icon className="w-4 h-4" />
                )}
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Nav Icons (Bottom) */}
          <div className="flex md:hidden w-full justify-between items-center px-4">
             {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-200 py-1",
                  activePage === item.id ? "text-emerald-600" : "text-stone-400"
                )}
              >
                {item.id === 'profile' && profile ? (
                  <img src={profile.photoURL} alt="profile" className={cn("w-6 h-6 rounded-full object-cover border", activePage === item.id ? "border-emerald-500" : "border-stone-300")} />
                ) : (
                  <item.icon className={cn("w-6 h-6", activePage === item.id && "animate-pulse")} />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const stats = [
    { label: 'Meals Shared', value: '24,502', icon: UtensilsCrossed, color: 'emerald' },
    { label: 'Active Donors', value: '1,200+', icon: Users, color: 'orange' },
    { label: 'CO2 Saved', value: '3.2 Tons', icon: Leaf, color: 'teal' },
    { label: 'NGO Partners', value: '45', icon: Building2, color: 'stone' },
  ];

  return (
    <div className="pt-10 md:pt-32 pb-24 px-4 overflow-x-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live: 124 food items available nearby
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-stone-900 leading-tight">
            Share What's <span className="text-emerald-600">Extra</span>, Help What's <span className="text-orange-500 italic font-serif">Left</span>.
          </h1>
          <p className="text-lg text-stone-600 max-w-lg leading-relaxed">
            Connect surplus food from your kitchen directly with those who need it. A community-driven platform to eliminate food waste and fight hunger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => onNavigate('post')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Post Food Now
            </button>
            <button 
              onClick={() => onNavigate('map')}
              className="bg-white border-2 border-stone-100 hover:border-orange-200 hover:bg-orange-50 text-stone-800 px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-orange-500" />
              Find Food Nearby
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative lg:h-[500px]"
        >
          <div className="absolute inset-0 bg-emerald-100 rounded-[3rem] -rotate-3 blur-3xl opacity-30" />
          <div className="relative bg-white rounded-[2.5rem] p-4 shadow-2xl border border-stone-100 overflow-hidden transform rotate-2">
             <img 
              src="https://images.unsplash.com/photo-1540331547168-8b63109228b7?auto=format&fit=crop&q=80&w=800" 
              alt="Food Sharing" 
              className="w-full h-[400px] object-cover rounded-[2rem]"
            />
            <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-orange-600 fill-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Top Community Donor</h4>
                  <p className="text-sm text-stone-500">Sarah shared 14 meals this week</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Live Stats */}
      <div className="max-w-7xl mx-auto mb-24">
        <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
          <BarChart3 className="text-emerald-600 w-6 h-6" />
          Our Impact Today
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center text-center space-y-3"
            >
              <div className={cn(
                "p-4 rounded-2xl",
                stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                stat.color === 'orange' ? "bg-orange-50 text-orange-600" :
                stat.color === 'teal' ? "bg-teal-50 text-teal-600" :
                "bg-stone-50 text-stone-600"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-stone-900">{stat.value}</div>
              <div className="text-sm text-stone-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-stone-900">How would you like to help?</h2>
            <p className="text-stone-500 mt-2">Choose your path and start making a difference.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Individual Donor', 
              desc: 'Best for households with extra food from dinners or gatherings.',
              btn: 'Post My Leftovers',
              icon: Home,
              color: 'emerald',
              page: 'post'
            },
            { 
              title: 'Restaurant Partner', 
               desc: 'End-of-day surplus? List it here for bulk NGO pickup.',
              btn: 'Bulk Donation',
              icon: UtensilsCrossed,
              color: 'orange',
              page: 'post'
            },
            { 
              title: 'NGO / Trust', 
              desc: 'Find distributions centers or request pickup for your charity.',
              btn: 'View Dashboard',
              icon: Building2,
              color: 'stone',
              page: 'ngo'
            }
          ].map((card, idx) => (
            <div key={idx} className="group p-8 rounded-[2rem] bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-inner",
                card.color === 'emerald' ? "bg-emerald-100 text-emerald-600" :
                card.color === 'orange' ? "bg-orange-100 text-orange-600" :
                "bg-stone-100 text-stone-600"
              )}>
                <card.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">{card.title}</h3>
              <p className="text-stone-500 mb-8 leading-relaxed">{card.desc}</p>
              <button 
                onClick={() => onNavigate(card.page as Page)}
                className={cn(
                  "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                  card.color === 'emerald' ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                  card.color === 'orange' ? "bg-orange-500 text-white hover:bg-orange-600" :
                  "bg-stone-800 text-white hover:bg-stone-900"
                )}
              >
                {card.btn}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MapView = () => {
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bangalore
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const mockItems: FoodItem[] = [
    { id: '1', title: '5 Meals of Paneer Butter Masala', type: 'Cooked', quantity: '2kg', expiry: '4h', location: [12.9780, 77.5946], freshness: 'fresh', postedBy: 'Kumar', distance: '0.8km', hygieneRating: 4.8 },
    { id: '2', title: 'Assorted Bakery Bread & Cakes', type: 'Bakery', quantity: '4 Boxes', expiry: '12h', location: [12.9650, 77.6101], freshness: 'good', postedBy: 'Baker\'s Delight', distance: '1.2km', hygieneRating: 5.0 },
    { id: '3', title: 'Seasonal Fruits (Mango/Banana)', type: 'Raw', quantity: '5kg', expiry: '2 days', location: [12.9850, 77.5800], freshness: 'fresh', postedBy: 'Fresh Mart', distance: '2.5km', hygieneRating: 4.5 },
    { id: '4', title: 'Rice & Dal (Large batch)', type: 'Cooked', quantity: '20 Meals', expiry: '1h', location: [12.9550, 77.6000], freshness: 'expiring', postedBy: 'Grand Event Hall', distance: '0.4km', hygieneRating: 4.9 },
  ];

  return (
    <div className="h-screen pt-16 md:pt-20 flex flex-col md:flex-row overflow-hidden">
      {/* Map Side */}
      <div className="flex-grow h-[50vh] md:h-full relative shrink-0">
        <Map height={undefined} center={center} zoom={13} onBoundsChanged={({ center }) => setCenter(center)}>
          {mockItems.map((item) => (
            // @ts-ignore
            <Marker key={item.id} width={50} anchor={item.location} onClick={() => setSelectedItem(item)}>
              <div className={cn(
                "w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer",
                item.freshness === 'fresh' ? "bg-emerald-500" :
                item.freshness === 'good' ? "bg-yellow-500" :
                "bg-red-500 animate-pulse"
              )}>
                <UtensilsCrossed className="text-white w-5 h-5" />
              </div>
            </Marker>
          ))}
        </Map>
        
        {/* Search Overlay */}
        <div className="absolute top-6 left-6 right-6 md:right-auto md:w-96 flex flex-col gap-4">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-stone-200">
            <Search className="text-stone-400 ml-3 w-5 h-5" />
            <input 
              placeholder="Search food type, location..." 
              className="w-full py-3 bg-transparent outline-none text-stone-800 placeholder:text-stone-400"
            />
            <button className="p-3 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
              <Filter className="w-5 h-5 text-stone-600" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Fresh (0-4h)', 'Cooked', 'Raw Materials', 'Bakery'].map((filter) => (
              <button key={filter} className="whitespace-nowrap px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-semibold shadow-md border border-stone-100">
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listing / Detail Side */}
      <div className="w-full md:w-[450px] md:h-full bg-white border-l border-stone-200 flex flex-col shadow-2xl z-10 shrink-0">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900">Food Nearby</h2>
          <p className="text-stone-500 text-sm">{mockItems.length} items available in your area</p>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <button onClick={() => setSelectedItem(null)} className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                  ← Back to results
                </button>
                <div className="rounded-3xl overflow-hidden shadow-lg">
                   <img 
                    src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600`} 
                    alt={selectedItem.title} 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="space-y-4 px-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-stone-900">{selectedItem.title}</h3>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      selectedItem.freshness === 'fresh' ? "bg-emerald-100 text-emerald-700" :
                      selectedItem.freshness === 'good' ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {selectedItem.freshness}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-2xl">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Expires In</div>
                        <div className="text-sm font-bold text-stone-800">{selectedItem.expiry}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-2xl">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Hygiene</div>
                        <div className="text-sm font-bold text-stone-800">{selectedItem.hygieneRating}/5.0</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-3xl border border-orange-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900">{selectedItem.postedBy}</div>
                      <div className="text-xs text-stone-500">Verified Platinum Donor</div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button className="flex-grow bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                       Request Pickup
                    </button>
                    <button className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center hover:bg-stone-200 transition-all">
                      <Heart className="w-6 h-6 text-stone-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              mockItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  onClick={() => setSelectedItem(item)}
                  className="group p-4 bg-white border border-stone-100 rounded-3xl hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer flex gap-4"
                >
                  <div className="w-24 h-24 bg-stone-100 rounded-2xl overflow-hidden shrink-0">
                    <img 
                      src={`https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=150`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-stone-900 line-clamp-1">{item.title}</h4>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.freshness === 'fresh' ? "bg-emerald-500 outline outline-emerald-100 outline-4" :
                        item.freshness === 'good' ? "bg-yellow-500" :
                        "bg-red-500 animate-pulse"
                      )} />
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{item.distance} away</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{item.quantity}</div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3" />
                        {item.expiry}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const PostFoodForm = () => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [hygieneRating, setHygieneRating] = useState(0);

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 bg-stone-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900">Post Surplus Food</h1>
            <p className="text-stone-500">Your small sharing makes a big difference.</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "w-12 h-2 rounded-full transition-all duration-500",
                  step >= s ? "bg-emerald-600" : "bg-stone-200"
                )} 
              />
            ))}
          </div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-stone-100"
        >
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label className="text-sm font-black text-stone-400 uppercase tracking-widest mb-4 block">Visual Evidence</label>
                <div 
                  onClick={() => setImage('captured')}
                  className="w-full h-80 bg-stone-50 rounded-[2rem] border-4 border-dashed border-stone-100 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                >
                  {image ? (
                    <img 
                      src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800" 
                      className="w-full h-full object-cover rounded-[1.8rem]"
                    />
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-stone-900 font-bold">Snap a Photo</p>
                        <p className="text-stone-400 text-sm">Help others see the quality</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                 {[
                  { label: 'Cooked', icon: UtensilsCrossed },
                  { label: 'Fresh', icon: Leaf },
                  { label: 'Raw', icon: BarChart3 },
                ].map((cat) => (
                  <button key={cat.label} className="p-4 rounded-2xl border border-stone-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-2">
                    <cat.icon className="w-6 h-6 text-stone-400" />
                    <span className="text-xs font-bold text-stone-800">{cat.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
              >
                Continue to Details
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Title</label>
                <input placeholder="e.g. 5 Packets of Fresh Sourdough Bread" className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Quantity</label>
                  <input placeholder="e.g. 2kg" className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Expires In</label>
                  <select className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                    <option>1 Hour</option>
                    <option>4 Hours</option>
                    <option>12 Hours</option>
                    <option>1 Day</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-600 w-6 h-6" />
                  <h4 className="font-bold text-emerald-900">Hygiene Commitment</h4>
                </div>
                <p className="text-sm text-emerald-700 leading-relaxed">By posting, you confirm the food was prepared in a hygienic environment and is safe for consumption.</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setHygieneRating(star)}
                      className={cn(
                        "transition-colors",
                        star <= hygieneRating ? "text-emerald-600 fill-emerald-600" : "text-emerald-200"
                      )}
                    >
                      <StarIcon className="w-6 h-6" />
                    </button>
                  ))}
                  <span className="text-emerald-600 font-black ml-2 text-sm">{hygieneRating > 0 ? `${hygieneRating}.0 Rated` : "Rate Quality"}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="flex-grow py-5 bg-stone-100 text-stone-800 rounded-2xl font-bold">Back</button>
                <button onClick={() => setStep(3)} className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-bold shadow-lg shadow-emerald-100">Live Post</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 py-10">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-emerald-500/20 rounded-full"
                />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-extrabold text-stone-900">Live & Sharing!</h2>
                 <p className="text-stone-500 max-w-sm mx-auto">Your post is now visible to nearby users and NGOs. We'll notify you as soon as someone requests a pickup.</p>
              </div>
              <div className="pt-6">
                 <button 
                  onClick={() => setStep(1)}
                  className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-bold shadow-2xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const NGODashboard = () => {
  const requests = [
    { id: '1', title: '50 Meals - Wedding Surplus', from: 'Regency Grand Hall', time: '10m ago', distance: '1.4km', priority: 'high', type: 'Cooked' },
    { id: '2', title: 'Veggie Surplus (Carrots/Onions)', from: 'Farmers Mart', time: '45m ago', distance: '3.2km', priority: 'medium', type: 'Raw' },
    { id: '3', title: '20kg Rice & Curry', from: 'Community Kitchen', time: '1h ago', distance: '0.8km', priority: 'high', type: 'Cooked' },
    { id: '4', title: 'Bakery Items (Breads)', from: 'Morning Crust', time: '2h ago', distance: '5.6km', priority: 'low', type: 'Bakery' },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-stone-900">Food Pickup Requests</h1>
              <p className="text-sm text-stone-500">Live feed for Feed India Foundation</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Monitoring</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {requests.map((req) => (
              <motion.div 
                key={req.id}
                whileHover={{ x: 5 }}
                className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-orange-200 transition-all"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    req.priority === 'high' ? "bg-red-50 text-red-600" :
                    req.priority === 'medium' ? "bg-orange-50 text-orange-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    <UtensilsCrossed className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900">{req.title}</h3>
                      {req.priority === 'high' && (
                        <div className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Urgent</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-stone-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.time}</span>
                      <span className="text-stone-800">From: {req.from}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <button className="flex-grow md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Accept</button>
                   <button className="p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-all group-hover:text-stone-800 text-stone-400"><ChevronRight /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-8">
           <div className="bg-stone-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative space-y-2">
               <h3 className="text-stone-400 text-xs font-black uppercase tracking-widest">Volunteer Status</h3>
               <div className="flex items-end justify-between">
                 <div className="text-5xl font-black">12</div>
                 <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">On Ground <Clock className="w-4 h-4" /></div>
               </div>
               {/* Dot Matrix Visualization */}
               <div className="grid grid-cols-10 gap-1 pt-2">
                 {Array.from({ length: 30 }).map((_, i) => (
                   <div key={i} className={cn("h-1 rounded-full", i < 12 ? "bg-emerald-500" : "bg-stone-700")} />
                 ))}
               </div>
             </div>
             <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
               <div className="h-full w-2/3 bg-emerald-500 rounded-full" />
             </div>
             <p className="text-stone-400 text-sm leading-relaxed italic">You have saved 450kg of food this month. That's approx 1,300 carbon units offset.</p>
           </div>

           <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
              <h3 className="text-xl font-extrabold text-stone-900 font-serif italic">Recent Impact</h3>
              <div className="space-y-4">
                 {[
                  { name: 'Slum Distribution', city: 'Indiranagar', meals: 120, time: '2h ago' },
                  { name: 'Shelter Pickup', city: 'Koramangala', meals: 45, time: '5h ago' }
                 ].map((act, i) => (
                   <div key={i} className="flex gap-4 items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{act.name}</div>
                        <div className="text-[10px] text-stone-400 uppercase font-black">{act.meals} Meals • {act.time}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Profile = ({
  user,
  profile,
  reviews,
  isLoading,
  onSignIn,
  onSignOut,
  onUpdate,
  onAddReview
}: {
  user: any;
  profile: UserProfile | null;
  reviews: UserReview[];
  isLoading: boolean;
  onSignIn: (isDemo?: boolean) => void;
  onSignOut: () => void;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
  onAddReview: (text: string, rating: number, authorName: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Review state
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditLocation(profile.location);
    }
  }, [profile, isEditing]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate({ name: editName, location: editLocation });
      setIsEditing(false);
    } catch (err) {
      alert("Error updating profile: " + err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewAuthor.trim()) return;
    setIsSubmittingReview(true);
    try {
      await onAddReview(reviewText, reviewRating, reviewAuthor);
      setReviewText('');
      setReviewAuthor('');
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (err) {
      alert("Error adding review: " + err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 md:pt-32 pb-24 px-4 bg-stone-50 min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <span className="text-stone-500 font-bold mt-4">Connecting to Leftover Connect Network...</span>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="pt-24 md:pt-32 pb-24 px-4 bg-stone-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center space-y-8 bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-stone-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-100/40 blur-3xl rounded-full" />
          
          <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
              Unlock Your <span className="text-emerald-600 font-serif italic">Verified Impact</span> Profile
            </h1>
            <p className="text-stone-500 max-w-md mx-auto text-sm md:text-base leading-relaxed">
              Create a trusted local donor card. Earn reputation scores, collect community badges, level-up your Karma points, and receive genuine NGO pick-up reviews.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-4 text-left">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <StarIcon className="w-5 h-5 text-emerald-600 fill-emerald-600 mb-2" />
              <div className="text-xs font-black text-stone-800">Trust Scores</div>
              <div className="text-[10px] text-stone-400 mt-1">NGO verified ratings</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl">
              <Leaf className="w-5 h-5 text-orange-500 mb-2" />
              <div className="text-xs font-black text-stone-800">Karma Points</div>
              <div className="text-[10px] text-stone-400 mt-1">Level up with sharing</div>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-stone-600 mb-2" />
              <div className="text-xs font-black text-stone-800">Local Badges</div>
              <div className="text-[10px] text-stone-400 mt-1">Celebrate your kindness</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 max-w-md mx-auto">
            <button 
              onClick={() => onSignIn(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-bold font-sans transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
            >
              Sign In with Google
            </button>
            <button 
              onClick={() => onSignIn(true)}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 px-6 rounded-2xl font-bold font-sans transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              🚀 Quick Sandbox Profile (Demo)
            </button>
          </div>
          <p className="text-[10px] text-stone-400 font-medium">Use the Quick Sandbox mode to simulate complete database persistence if Google Popups are blocked in the iframe container.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card Header */}
        <header className="relative mb-12">
          <div className="h-60 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="mx-8 -mt-20 relative flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl border-4 border-white overflow-hidden relative group">
                <img src={profile.photoURL} className="w-full h-full bg-orange-50 rounded-[2rem] object-cover" alt="avatar" />
              </div>
              <div className="pb-4 space-y-1">
                <h1 className="text-4xl font-black text-stone-900 flex flex-wrap items-center gap-3">
                  {profile.name}
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-tighter">Verified Donor</div>
                </h1>
                <p className="text-stone-500 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" /> {profile.location}
                </p>
                <div className="text-xs text-stone-400 font-bold">Email: {profile.email}</div>
              </div>
            </div>
            
            <button 
              onClick={onSignOut}
              className="mb-4 px-4 py-2 bg-stone-150 hover:bg-red-50 hover:text-red-600 text-stone-500 border border-stone-200 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
             {/* Edit mode or Reputation Dashboard */}
             {isEditing ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl space-y-6"
               >
                 <h2 className="text-2xl font-bold text-stone-900">Update Profile Fields</h2>
                 <div className="space-y-4">
                   <div className="space-y-1">
                     <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Full Name</label>
                     <input 
                       type="text" 
                       value={editName}
                       onChange={(e) => setEditName(e.target.value)}
                       className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none focus:border-emerald-500 transition-all font-sans text-stone-800"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Location / Neighborhood</label>
                     <input 
                       type="text" 
                       value={editLocation}
                       onChange={(e) => setEditLocation(e.target.value)}
                       className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none focus:border-emerald-500 transition-all font-sans text-stone-800"
                     />
                   </div>
                 </div>
                 <div className="flex gap-4 pt-2">
                   <button 
                     disabled={isSaving}
                     onClick={() => setIsEditing(false)}
                     className="flex-grow py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     disabled={isSaving}
                     onClick={handleSaveProfile}
                     className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-50"
                   >
                     {isSaving ? "Saving..." : "Save Updates"}
                   </button>
                 </div>
               </motion.div>
             ) : (
               <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-stone-900">Trust & Reputation</h3>
                    <div className="flex items-center gap-1">
                       {[1,2,3,4,5].map(i => (
                         <StarIcon 
                           key={i} 
                           className={cn(
                             "w-5 h-5",
                             i <= Math.round(profile.rating) ? "text-orange-500 fill-orange-500" : "text-stone-200"
                           )} 
                         />
                       ))}
                       <span className="ml-2 font-black text-stone-900">{profile.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 scale-100 hover:scale-[1.02] transition-transform">
                      <div className="text-4xl font-black text-emerald-600">{profile.mealsShared}</div>
                      <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">Meals Shared</div>
                    </div>
                    <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 scale-100 hover:scale-[1.02] transition-transform">
                      <div className="text-4xl font-black text-orange-500">{profile.karmaPoints}</div>
                      <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">Karma Points</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     <h4 className="font-bold text-stone-900">Recent Badges</h4>
                     <div className="flex flex-wrap gap-4">
                        {[
                          { icon: UtensilsCrossed, label: 'Early Bird', color: 'bg-emerald-50 text-emerald-600' },
                          { icon: ShieldCheck, label: 'Safe Server', color: 'bg-blue-50 text-blue-600' },
                          { icon: Heart, label: 'Kind Soul', color: 'bg-red-50 text-red-600' },
                        ].map((badge, i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-sm", badge.color)}>
                                <badge.icon className="w-6 h-6" />
                             </div>
                             <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{badge.label}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex gap-4">
                     <button 
                       onClick={() => setIsEditing(true)}
                       className="w-full py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold rounded-2xl transition-all"
                     >
                       Edit Profiles Settings
                     </button>
                  </div>
               </div>
             )}

             {/* Dynamic simulator widget for community feedback */}
             <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black tracking-wide">Test Feedback Simulator</h3>
                    <p className="text-xs text-stone-400">Write mock partner or NGO reviews to see real average reputation scores update in Firestore.</p>
                  </div>
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-stone-100 text-xs font-bold rounded-xl transition-all"
                  >
                    {showReviewForm ? "Hide" : "Add Live Review"}
                  </button>
                </div>

                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="space-y-4 mt-4 bg-stone-800 p-6 rounded-2xl border border-stone-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-stone-400">Author Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. NGO: Hope India or Neighbor Ravi" 
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          className="w-full p-3 bg-stone-900 border border-stone-700 rounded-xl outline-none text-sm text-stone-100 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-stone-400">Review Star Score</label>
                        <select 
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full p-3 bg-stone-900 border border-stone-700 rounded-xl outline-none text-sm text-stone-100 appearance-none cursor-pointer focus:border-emerald-500"
                        >
                          <option value="5">5 Stars Excellent</option>
                          <option value="4">4 Stars Good</option>
                          <option value="3">3 Stars Average</option>
                          <option value="2">2 Stars Poor</option>
                          <option value="1">1 Star Awful</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-stone-400">Review Feedback</label>
                      <textarea 
                        required
                        rows={2}
                        placeholder="Type what they would say about your leftover item..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full p-3 bg-stone-900 border border-stone-700 rounded-xl outline-none text-sm text-stone-100 focus:border-emerald-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
                    >
                      {isSubmittingReview ? "Submitting..." : <>Push live to Firestore <Send className="w-3.5 h-3.5" /></>}
                    </button>
                  </form>
                )}
             </div>
           </div>

           <div className="space-y-8">
              {/* Dynamic Reviews fetched live from Firestore subcollection */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                <h3 className="text-xl font-bold text-stone-900 mb-6 font-serif flex items-center justify-between">
                  Community Reviews
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-full font-sans font-black">{reviews.length} total</span>
                </h3>
                <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2 scrollbar-hide">
                  {reviews.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 text-xs">
                      No feedback yet. Add a review using the simulator!
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="space-y-2 border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-stone-800">{rev.authorName}</span>
                            <div className="flex gap-0.5">
                               {Array.from({ length: 5 }).map((_, idx) => (
                                 <StarIcon 
                                   key={idx} 
                                   className={cn(
                                     "w-2.5 h-2.5",
                                     idx < rev.rating ? "text-orange-500 fill-orange-500" : "text-stone-100"
                                   )} 
                                 />
                               ))}
                            </div>
                         </div>
                         <p className="text-xs text-stone-500 leading-relaxed italic">"{rev.text}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState<Page>('landing');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    // Listen to authentication state shifts
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoadingProfile(true);
        try {
          // Fetch or initialize the user's Profile card
          const prof = await getOrCreateProfile(user);
          setUserProfile(prof);

          // Retrieve verified NGO/Neighbor reviews from Firestore collection
          const revs = await apiGetUserReviews(user.uid);
          setUserReviews(revs);
        } catch (err) {
          console.error("Could not fetch user profile details", err);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setUserReviews([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (isDemo = false) => {
    setIsLoadingProfile(true);
    try {
      if (isDemo) {
        // Mock a credential or sign in anonymously/custom for local preview completeness
        // We create a demo Firebase session or user payload:
        // Since we are inside the Firebase emulator/production we can create a permanent user Profile in firestore as user /users/demo_user_123
        const demoAuthUser = {
          uid: 'demo_user_123',
          displayName: 'Chinmay Joshi (Demo)',
          email: 'chinmay.joshi@demo-connect.org',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chinmay'
        };
        
        // Setup state simulation as if logged in:
        setCurrentUser(demoAuthUser as any);
        const prof = await getOrCreateProfile(demoAuthUser as any);
        setUserProfile(prof);
        const revs = await apiGetUserReviews(demoAuthUser.uid);
        setUserReviews(revs);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err: any) {
      console.error(err);
      alert("Authentication error: " + err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoadingProfile(true);
    try {
      if (currentUser?.uid === 'demo_user_123') {
        setCurrentUser(null);
        setUserProfile(null);
        setUserReviews([]);
      } else {
        await signOut(auth);
      }
    } catch (err: any) {
      alert("Could not sign out: " + err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      await apiUpdateProfile(currentUser.uid, data);
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error("Failed updating profile", err);
      throw err;
    }
  };

  const handleAddReview = async (text: string, rating: number, authorName: string) => {
    if (!currentUser) return;
    try {
      const newRev = await apiAddReview(currentUser.uid, { text, rating, authorName });
      setUserReviews(prev => [newRev, ...prev]);

      // Calculate new ratings
      const currentRating = userProfile?.rating || 5.0;
      const count = userReviews.length + 1;
      const newAvgRating = parseFloat(((currentRating * (count - 1) + rating) / count).toFixed(1));

      // Append 5 extra karma points for new verified activity!
      const updatedData = {
        rating: newAvgRating,
        karmaPoints: (userProfile?.karmaPoints || 10) + 15
      };

      await apiUpdateProfile(currentUser.uid, updatedData);
      setUserProfile(prev => prev ? {
        ...prev,
        rating: updatedData.rating,
        karmaPoints: updatedData.karmaPoints
      } : null);
    } catch (err) {
      console.error("Failed submitting feedback review", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      <Navigation activePage={activePage} setActivePage={setActivePage} profile={userProfile} />
      
      <main className="transition-all duration-500">
        <AnimatePresence mode="wait">
          {activePage === 'landing' && <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LandingPage onNavigate={setActivePage} /></motion.div>}
          {activePage === 'map' && <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MapView /></motion.div>}
          {activePage === 'post' && <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PostFoodForm /></motion.div>}
          {activePage === 'ngo' && <motion.div key="ngo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><NGODashboard /></motion.div>}
          {activePage === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Profile 
                user={currentUser} 
                profile={userProfile} 
                reviews={userReviews}
                isLoading={isLoadingProfile}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
                onUpdate={handleUpdateProfile}
                onAddReview={handleAddReview}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-stone-50 py-20 px-4 border-t border-stone-200 hidden md:block">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
             <div className="flex items-center gap-2">
                <UtensilsCrossed className="text-emerald-600 w-8 h-8" />
                <span className="text-2xl font-black text-stone-800">Leftover<span className="text-emerald-600">Connect</span></span>
              </div>
              <p className="text-stone-500 max-w-sm leading-relaxed">
                Empowering communities to share surplus food and minimize waste. Together, we can make sure no plate goes empty.
              </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-stone-900">Platform</h4>
            <ul className="text-stone-500 space-y-2 text-sm">
              <li>How it works</li>
              <li>Safety Guidelines</li>
              <li>Success Stories</li>
              <li>Partnerships</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-stone-900">Connect</h4>
            <ul className="text-stone-500 space-y-2 text-sm">
              <li>Contact Us</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>NGO Integration</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-stone-200 text-center text-xs font-bold text-stone-400 uppercase tracking-widest">
           © 2024 Leftover Connect. Built for a better world.
        </div>
      </footer>
    </div>
  );
}
