import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Gift, Star, Zap, Crown, Sparkles, Target, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const rewards = [
  {
    id: 1,
    title: "₹500 Discount Voucher",
    points: 1000,
    description: "Valid on bookings above ₹2000",
    icon: Gift,
    category: "voucher",
    popular: true,
  },
  {
    id: 2,
    title: "Free Meal Upgrade",
    points: 500,
    description: "Premium meal on your next journey",
    icon: Star,
    category: "upgrade",
  },
  {
    id: 3,
    title: "Priority Boarding Pass",
    points: 750,
    description: "Skip the queue at major stations",
    icon: Zap,
    category: "privilege",
  },
  {
    id: 4,
    title: "Lounge Access",
    points: 1200,
    description: "1-hour premium lounge access",
    icon: Crown,
    category: "privilege",
    popular: true,
  },
];

const badges = [
  {
    id: 1,
    name: "Frequent Traveler",
    earned: true,
    icon: "🚂",
    description: "10+ journeys completed",
    progress: 100,
    tier: "gold"
  },
  {
    id: 2,
    name: "Early Bird",
    earned: true,
    icon: "🌅",
    description: "5+ morning journeys",
    progress: 100,
    tier: "silver"
  },
  {
    id: 3,
    name: "Metro Master",
    earned: false,
    icon: "🚇",
    description: "20 metro rides",
    progress: 65,
    tier: "bronze"
  },
  {
    id: 4,
    name: "5-Star Journey",
    earned: false,
    icon: "⭐",
    description: "Rate 10 journeys",
    progress: 30,
    tier: "bronze"
  },
];

const tiers = [
  { name: "Bronze", points: 0, color: "text-amber-800" },
  { name: "Silver", points: 1000, color: "text-gray-400" },
  { name: "Gold", points: 5000, color: "text-yellow-500" },
  { name: "Platinum", points: 10000, color: "text-blue-400" },
];

const Rewards = () => {
  const [currentPoints, setCurrentPoints] = useState(2450);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const nextTier = tiers.find(tier => tier.points > currentPoints) || tiers[3];
  const currentTier = tiers.reverse().find(tier => tier.points <= currentPoints) || tiers[0];
  const progressPercent = (currentPoints / nextTier.points) * 100;

  const filteredRewards = activeFilter === "all"
    ? rewards
    : rewards.filter(reward => reward.category === activeFilter);

  const handleClaim = async (reward: any) => {
    if (currentPoints >= reward.points) {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPoints(prev => prev - reward.points);
      toast.success("Reward claimed successfully!", {
        description: `You've redeemed ${reward.title}`,
        icon: <Sparkles className="h-4 w-4" />,
      });
      setIsLoading(false);
    } else {
      toast.error("Insufficient points", {
        description: `You need ${reward.points - currentPoints} more points to claim this reward`,
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold": return "text-yellow-500";
      case "silver": return "text-gray-400";
      case "bronze": return "text-amber-800";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex flex-col">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 pt-20 px-4 sm:px-6 lg:px-8 transition-all duration-300",
            "ml-0 md:ml-64"
          )}
        >
          <div className="max-w-7xl mx-auto space-y-8 pb-8">
            {/* Enhanced Header */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Rewards & Loyalty
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Earn points, unlock exclusive benefits, and level up your travel experience
              </p>
            </div>

            {/* Enhanced Points Summary */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/10">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="text-center lg:text-left mb-6 lg:mb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Crown className={`h-5 w-5 ${currentTier.color}`} />
                        <span className={`font-semibold ${currentTier.color}`}>
                          {currentTier.name} Tier
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-accent/20 text-accent">
                        {currentPoints} Points
                      </Badge>
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-display font-bold mb-2">
                      {currentPoints}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Total Points Earned
                    </p>
                  </div>

                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                      <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span>Progress to {nextTier.name} Tier</span>
                    <span className="font-semibold">
                      {currentPoints} / {nextTier.points}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-3 bg-muted/50" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{currentTier.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    <Target className="h-4 w-4 inline mr-1" />
                    {nextTier.points - currentPoints} points to unlock {nextTier.name} benefits
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Rewards Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 sm:mb-0">
                  Redeem Your Points
                </h2>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {["all", "voucher", "upgrade", "privilege"].map((filter) => (
                    <Button
                      key={filter}
                      variant={activeFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "capitalize whitespace-nowrap",
                        activeFilter === filter && "bg-accent text-accent-foreground"
                      )}
                    >
                      {filter === "all" ? "All Rewards" : filter}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredRewards.map((reward) => {
                  const RewardIcon = reward.icon;
                  const canAfford = currentPoints >= reward.points;

                  return (
                    <Card
                      key={reward.id}
                      className={cn(
                        "transition-all duration-300 hover:shadow-xl border-2",
                        canAfford
                          ? "hover:border-accent/50 cursor-pointer"
                          : "opacity-60 border-muted",
                        reward.popular && "ring-2 ring-yellow-500/20"
                      )}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            canAfford ? "bg-accent/20" : "bg-muted"
                          )}>
                            <RewardIcon className={cn(
                              "h-6 w-6",
                              canAfford ? "text-accent" : "text-muted-foreground"
                            )} />
                          </div>

                          {reward.popular && (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
                              Popular
                            </Badge>
                          )}
                        </div>

                        <CardTitle className="text-lg font-display">
                          {reward.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {reward.points} points
                          </div>
                          {!canAfford && (
                            <span className="text-xs text-red-500 font-medium">
                              -{reward.points - currentPoints}
                            </span>
                          )}
                        </div>

                        <Button
                          onClick={() => handleClaim(reward)}
                          disabled={!canAfford || isLoading}
                          className={cn(
                            "w-full transition-all duration-300",
                            canAfford
                              ? "bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105"
                              : "bg-muted"
                          )}
                          size="sm"
                        >
                          {isLoading ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Claiming...
                            </>
                          ) : canAfford ? (
                            "Claim Reward"
                          ) : (
                            "Insufficient Points"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Badges Section */}
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-6">
                Your Achievement Badges
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={cn(
                      "text-center transition-all duration-300 hover:shadow-lg",
                      badge.earned ? "hover:border-accent/30" : "opacity-60"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className={cn(
                        "text-4xl mb-4 transition-transform duration-300",
                        badge.earned && "hover:scale-110"
                      )}>
                        {badge.icon}
                      </div>

                      <div className="flex items-center justify-center gap-1 mb-2">
                        <h3 className="font-display font-semibold text-lg">
                          {badge.name}
                        </h3>
                        {badge.earned && (
                          <Sparkles className={cn("h-4 w-4", getTierColor(badge.tier))} />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {badge.description}
                      </p>

                      {!badge.earned ? (
                        <div className="space-y-2">
                          <Progress value={badge.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {badge.progress}% complete
                          </p>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "bg-gradient-to-r from-primary/20 to-accent/20",
                            getTierColor(badge.tier)
                          )}
                        >
                          {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Points History/Activity Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Journey Completed", points: "+50", date: "2 hours ago" },
                    { action: "Reward Claimed", points: "-1000", date: "1 day ago" },
                    { action: "Monthly Bonus", points: "+200", date: "3 days ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <span className={cn(
                        "font-semibold",
                        activity.points.startsWith("+") ? "text-green-600" : "text-red-600"
                      )}>
                        {activity.points}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Rewards;