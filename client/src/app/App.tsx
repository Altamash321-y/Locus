import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Navbar from "./components/Navbar";
import CategoryTabs from "./components/CategoryTabs";
import NewsCard from "./components/NewsCard";
import TrendingSidebar from "./components/TrendingSidebar";
import BottomNavigation from "./components/BottomNavigation";
import CreatePostModal from "./components/CreatePostModal";
import LocationSelector from "./components/LocationSelector";
import MapView from "./components/MapView";
import {
  get_posts_5km,
  get_posts_10km,
  get_posts_25km,
  get_posts_by_city,
  get_posts_by_country,
  get_all_posts,
} from "../lib/supabase";

const mockNews = [
  {
    id: "1",
    username: "Sarah Johnson",
    avatar: "",
    locality: "Mission District",
    timestamp: "2 hours ago",
    headline: "New Metro Station Opening This Weekend",
    description:
      "SFMTA announces the grand opening of the new 16th Street Metro Station. The station will feature modern amenities and improved accessibility.",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop",
    category: "Transport",
    isBreaking: true,
    initialLikes: 234,
    initialComments: 45,
    distance: "0.5 km away",
  },
  {
    id: "2",
    username: "Mike Chen",
    avatar: "",
    locality: "Hayes Valley",
    timestamp: "4 hours ago",
    headline: "Local Farmers Market Returns for Summer Season",
    description:
      "The popular Hayes Valley Farmers Market is back every Sunday starting this weekend. Featuring organic produce, artisan foods, and live music.",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop",
    category: "Events",
    initialLikes: 189,
    initialComments: 32,
    distance: "1.2 km away",
  },
  {
    id: "3",
    username: "Emily Rodriguez",
    avatar: "",
    locality: "Financial District",
    timestamp: "6 hours ago",
    headline: "Road Closure Alert: Market Street Construction",
    description:
      "Market Street between 4th and 8th will be closed for the next two weeks due to infrastructure improvements. Plan alternate routes.",
    image:
      "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=600&fit=crop",
    category: "Traffic",
    initialLikes: 156,
    initialComments: 28,
    distance: "2.1 km away",
  },
  {
    id: "4",
    username: "Alex Thompson",
    avatar: "",
    locality: "Castro",
    timestamp: "8 hours ago",
    headline: "New Indie Coffee Shop Opens on Castro Street",
    description:
      "Bean & Bloom brings artisanal coffee and sustainable practices to the neighborhood. Grand opening celebration this Saturday with live music.",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
    category: "Business",
    initialLikes: 142,
    initialComments: 19,
    distance: "1.8 km away",
  },
  {
    id: "5",
    username: "David Park",
    avatar: "",
    locality: "Golden Gate Park",
    timestamp: "10 hours ago",
    headline: "Community Clean-up Drive This Saturday",
    description:
      "Join neighbors for a park clean-up event. Gloves and supplies provided. Refreshments will be served to all volunteers.",
    image:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&h=600&fit=crop",
    category: "Community",
    initialLikes: 98,
    initialComments: 15,
    distance: "3.5 km away",
  },
  {
    id: "6",
    username: "Jessica Martinez",
    avatar: "",
    locality: "SoMa",
    timestamp: "12 hours ago",
    headline: "Tech Startup Announces 200 New Local Jobs",
    description:
      "CloudVenture Inc. is expanding its San Francisco headquarters and hiring for various positions. Job fair scheduled for next month.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    category: "Business",
    isBreaking: true,
    initialLikes: 267,
    initialComments: 52,
    distance: "1.5 km away",
  },
  {
    id: "7",
    username: "Ryan Lee",
    avatar: "",
    locality: "Chinatown",
    timestamp: "14 hours ago",
    headline: "Annual Dragon Boat Festival Next Month",
    description:
      "Save the date for the 25th Annual Dragon Boat Festival. Featuring races, cultural performances, and traditional food vendors.",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop",
    category: "Events",
    initialLikes: 178,
    initialComments: 24,
    distance: "2.8 km away",
  },
  {
    id: "8",
    username: "Amanda Wilson",
    avatar: "",
    locality: "Nob Hill",
    timestamp: "16 hours ago",
    headline: "Historic Building Renovation Complete",
    description:
      "The 120-year-old Fairmont Hotel has completed a major renovation while preserving its historical architecture and charm.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    category: "Community",
    initialLikes: 134,
    initialComments: 18,
    distance: "2.2 km away",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("5km");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userCity, setUserCity] = useState("");
  const [userCountry, setUserCountry] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreNews();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [news]);
  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              );

              const locationData = await response.json();

              const city =
                locationData.address.city ||
                locationData.address.town ||
                locationData.address.village ||
                "";

              const country = locationData.address.country || "";

              setUserCity(city);
              setUserCountry(country);

              console.log("Detected city:", city);
              console.log("Detected country:", country);
            } catch (err) {
              console.error("Location fetch failed", err);
            }

            let data = [];

            switch (activeCategory) {
              case "5km":
                data = await get_posts_5km(lat, lng);
                break;

              case "10km":
                data = await get_posts_10km(lat, lng);
                break;

              case "25km":
                data = await get_posts_25km(lat, lng);
                break;

              case "city":
                if (userCity) {
                  data = await get_posts_by_city(userCity);
                }
                break;

              case "country":
                if (userCountry) {
                  data = await get_posts_by_country(userCountry);
                }
                break;

              case "world":
                if (userCountry) {
                  data = await get_all_posts();
                }
                break;

              default:
                data = await get_posts_5km(lat, lng);
            }

            if (!data) {
              setNews([]);
              setIsLoading(false);
              return;
            }

            const formatted = data
              .map((item: any, index: number) => ({
                id: item.id || index,
                username: item.username || "Anonymous",
                avatar: item.avatar || "",
                locality: item.city || item.locality || "Unknown",
                timestamp: item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : "Recently",
                headline: item.headline || item.title || "Untitled",
                description: item.description || "",
                image:
                  item.image ||
                  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
                category: item.category || "General",
                isBreaking: item.is_breaking || false,
                initialLikes: item.upvote || 0,
                initialComments: item.comments || 0,
                upvote: item.upvote || 0,
                downvote: item.downvote || 0,
                distance: item.distance
                  ? `${Number(item.distance).toFixed(1)} km away`
                  : "",
              }))
              .sort((a, b) => b.upvote - b.downvote - (a.upvote - a.downvote));

            setNews(formatted);
            setIsLoading(false);
          },
          (error) => {
            console.error(error);
            setIsLoading(false);
          },
        );
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [activeCategory]);

  const loadMoreNews = () => {};

  const filteredNews = news;

  return (
    <div className="min-h-screen bg-[#0B0B0B] dark p-1">
      <Navbar
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onOpenSearch={() => setIsSearchOpen(!isSearchOpen)}
        onOpenLocation={() => setIsLocationModalOpen(true)}
      />

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "map" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MapView />
              </motion.div>
            ) : (
              <>
                {filteredNews.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NewsCard {...item} />
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-2 border-[#FF5A1F] border-t-transparent rounded-full"
                    />
                  </div>
                )}

                {filteredNews.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No news in this category yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setIsCreateModalOpen(true)}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <LocationSelector
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {isNotificationsOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-16 bottom-0 w-full md:w-96 bg-[#161616] border-l border-[#2A2A2A] z-40 overflow-y-auto"
        >
          <div className="p-4">
            <h2 className="text-white text-xl font-bold mb-4">Notifications</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-[#1F1F1F] rounded-xl border border-[#2A2A2A]"
                >
                  <p className="text-white text-sm font-semibold mb-1">
                    New post in your area
                  </p>
                  <p className="text-gray-400 text-xs">
                    Someone posted about traffic near Mission District
                  </p>
                  <p className="text-gray-500 text-xs mt-2">{i} hour ago</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-0 right-0 z-40 bg-[#161616] border-b border-[#2A2A2A] p-4"
        >
          <div className="max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search local news..."
              autoFocus
              className="w-full bg-[#1F1F1F] text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-[#2A2A2A] focus:border-[#FF5A1F] focus:outline-none"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
