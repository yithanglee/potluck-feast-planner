import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import EventHeader from "@/components/EventHeader";
import FoodCategory from "@/components/FoodCategory";
import FoodSlot from "@/components/FoodSlot";
import SignupModal from "@/components/SignupModal";
import AuthForm from "@/components/AuthForm";
import UserHeader from "@/components/UserHeader";
import { useGoogleSheets, User, Signup } from "@/hooks/useGoogleSheets";

// Food category configurations
const CATEGORIES = {
  mainDish: {
    emoji: "🥪",
    title: "主食",
    description: "每项10人份，2人分配",
    items: [
      { id: "mifun", name: "米粉 / 炒米粉", slots: 2 },
      { id: "nasilemak", name: "NASI LEMAK", slots: 2 },
      { id: "sandwich", name: "三文治", slots: 2 },
      { id: "special_main", name: "特别主食（请注明食物＆分量）", slots: 2 },
    ],
  },
  snacks: {
    emoji: "🍟",
    title: "小吃",
    description: "可以多过5人份，注明小吃和分量",
    items: [{ id: "snacks", name: "小吃", slots: 5 }],
  },
  desserts: {
    emoji: "🍰",
    title: "甜品",
    description: "",
    items: [
      { id: "cake", name: "蛋糕（注明什么蛋糕）", slots: 3 },
      { id: "other_dessert", name: "其他：Jelly/布丁/Tart/糖水/豆腐花/其他", slots: 5 },
    ],
  },
  fruits: {
    emoji: "🍌",
    title: "水果",
    description: "番石榴/哈密瓜/西瓜/木瓜/其他（需放保冷袋，除香蕉）",
    items: [{ id: "fruits", name: "水果", slots: 6 }],
  },
  drinks: {
    emoji: "🍹",
    title: "饮品",
    description: "注明什么饮品，每项1.5L",
    items: [{ id: "drinks", name: "饮品", slots: 3 }],
  },
  special: {
    emoji: "✨",
    title: "特别美食",
    description: "以上填满才能开始填这系列",
    items: [{ id: "special", name: "特别美食", slots: 10 }],
  },
};

const Index = () => {
  const {
    loading: sheetsLoading,
    login,
    register,
    getSignups,
    addSignup,
    removeSignup,
  } = useGoogleSheets();
  const [user, setUser] = useState<User | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(0);

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("potluck_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch signups
  const fetchSignups = useCallback(async () => {
    try {
      const data = await getSignups();
      setSignups(data);
    } catch (err) {
      console.error("Failed to fetch signups:", err);
    }
  }, [getSignups]);

  useEffect(() => {
    fetchSignups();
  }, [fetchSignups]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setAuthError("");
    
    try {
      const loggedInUser = await login(email, password);
      setUser(loggedInUser);
      localStorage.setItem("potluck_user", JSON.stringify(loggedInUser));
      toast.success(`欢迎回来，${loggedInUser.name}！`);
      fetchSignups();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setAuthError("");
    
    try {
      const newUser = await register(email, password, name);
      setUser(newUser);
      localStorage.setItem("potluck_user", JSON.stringify(newUser));
      toast.success(`欢迎加入，${name}！🎉`);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("potluck_user");
    toast.success("已登出");
  };

  const openSignupModal = (categoryId: string, itemId: string, slotNumber: number) => {
    setSelectedCategory(categoryId);
    setSelectedItem(itemId);
    setSelectedSlot(slotNumber);
    setModalOpen(true);
  };

  const handleFoodSignup = async (description: string) => {
    if (!user) return;
    
    try {
      await addSignup(
        selectedCategory,
        selectedItem,
        selectedSlot,
        user.email,
        user.name,
        description
      );
      await fetchSignups();
      toast.success("报名成功！🎊");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "报名失败");
    }
  };

  const handleRemoveSignup = async (signup: Signup) => {
    try {
      await removeSignup(signup.category, signup.item, signup.slot, signup.userEmail);
      await fetchSignups();
      toast.success("已取消报名");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "取消失败");
    }
  };

  const getSignupsForItem = (categoryId: string, itemId: string) => {
    return signups.filter((s) => s.category === categoryId && s.item === itemId);
  };

  const getCategoryName = (categoryId: string, itemId: string) => {
    const category = CATEGORIES[categoryId as keyof typeof CATEGORIES];
    const item = category?.items.find((i) => i.id === itemId);
    return item?.name || category?.title || "";
  };

  const renderFoodSlots = (categoryId: string, itemId: string, totalSlots: number) => {
    const itemSignups = getSignupsForItem(categoryId, itemId);
    const slots = [];

    for (let i = 1; i <= totalSlots; i++) {
      const signup = itemSignups.find((s) => s.slot === i);
      const isCurrentUser = signup?.userEmail === user?.email;

      slots.push(
        <FoodSlot
          key={`${itemId}-${i}`}
          slotNumber={i}
          userName={signup?.userName}
          foodDescription={signup?.notes}
          isCurrentUser={isCurrentUser}
          onClaim={() => openSignupModal(categoryId, itemId, i)}
          onRemove={() => signup && handleRemoveSignup(signup)}
          disabled={!user}
        />
      );
    }

    return slots;
  };

  if (!user) {
    return (
      <div className="min-h-screen gradient-sky flex flex-col">
        <EventHeader />
        <div className="flex-1 flex items-center justify-center pb-12">
          <AuthForm
            onLogin={handleLogin}
            onSignup={handleSignup}
            error={authError}
            loading={loading || sheetsLoading}
          />
        </div>
        <footer className="text-center py-6 text-muted-foreground">
          感谢大家 💕💕💕
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader userName={user.name} onLogout={handleLogout} />
      
      <div className="pt-20">
        <EventHeader />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* Main Dishes */}
            <FoodCategory
              emoji={CATEGORIES.mainDish.emoji}
              title={CATEGORIES.mainDish.title}
              description={CATEGORIES.mainDish.description}
              filledSlots={CATEGORIES.mainDish.items.reduce(
                (acc, item) => acc + getSignupsForItem("mainDish", item.id).length,
                0
              )}
              totalSlots={CATEGORIES.mainDish.items.reduce((acc, item) => acc + item.slots, 0)}
            >
              {CATEGORIES.mainDish.items.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {item.name}
                  </h3>
                  <div className="space-y-2">
                    {renderFoodSlots("mainDish", item.id, item.slots)}
                  </div>
                </div>
              ))}
            </FoodCategory>

            {/* Snacks */}
            <FoodCategory
              emoji={CATEGORIES.snacks.emoji}
              title={CATEGORIES.snacks.title}
              description={CATEGORIES.snacks.description}
              filledSlots={getSignupsForItem("snacks", "snacks").length}
              totalSlots={CATEGORIES.snacks.items[0].slots}
            >
              {renderFoodSlots("snacks", "snacks", CATEGORIES.snacks.items[0].slots)}
            </FoodCategory>

            {/* Desserts */}
            <FoodCategory
              emoji={CATEGORIES.desserts.emoji}
              title={CATEGORIES.desserts.title}
              description={CATEGORIES.desserts.description}
              filledSlots={CATEGORIES.desserts.items.reduce(
                (acc, item) => acc + getSignupsForItem("desserts", item.id).length,
                0
              )}
              totalSlots={CATEGORIES.desserts.items.reduce((acc, item) => acc + item.slots, 0)}
            >
              {CATEGORIES.desserts.items.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {item.name}
                  </h3>
                  <div className="space-y-2">
                    {renderFoodSlots("desserts", item.id, item.slots)}
                  </div>
                </div>
              ))}
            </FoodCategory>

            {/* Fruits */}
            <FoodCategory
              emoji={CATEGORIES.fruits.emoji}
              title={CATEGORIES.fruits.title}
              description={CATEGORIES.fruits.description}
              filledSlots={getSignupsForItem("fruits", "fruits").length}
              totalSlots={CATEGORIES.fruits.items[0].slots}
            >
              {renderFoodSlots("fruits", "fruits", CATEGORIES.fruits.items[0].slots)}
            </FoodCategory>

            {/* Drinks */}
            <FoodCategory
              emoji={CATEGORIES.drinks.emoji}
              title={CATEGORIES.drinks.title}
              description={CATEGORIES.drinks.description}
              filledSlots={getSignupsForItem("drinks", "drinks").length}
              totalSlots={CATEGORIES.drinks.items[0].slots}
            >
              {renderFoodSlots("drinks", "drinks", CATEGORIES.drinks.items[0].slots)}
            </FoodCategory>

            {/* Special Foods */}
            <FoodCategory
              emoji={CATEGORIES.special.emoji}
              title={CATEGORIES.special.title}
              description={CATEGORIES.special.description}
              filledSlots={getSignupsForItem("special", "special").length}
              totalSlots={CATEGORIES.special.items[0].slots}
            >
              {renderFoodSlots("special", "special", CATEGORIES.special.items[0].slots)}
            </FoodCategory>
          </div>
        </main>

        <footer className="text-center py-8 text-muted-foreground">
          <p className="text-2xl mb-2">💕💕💕</p>
          <p>感谢大家的参与！</p>
        </footer>
      </div>

      <SignupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFoodSignup}
        category={getCategoryName(selectedCategory, selectedItem)}
        descriptionPlaceholder="例：西瓜 5人份"
      />
    </div>
  );
};

export default Index;
