import { CalendarDays, MapPin, Users } from "lucide-react";

const EventHeader = () => {
  return (
    <header className="text-center py-8 px-4">
      <div className="inline-flex items-center gap-2 text-4xl mb-4 animate-wiggle">
        <span>🧺</span>
        <span>🥪</span>
        <span>🍹</span>
      </div>
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-4">
        草地小清新野餐 Pot Luck
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground font-medium mb-6">
        愿意的心 💕
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
        <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
          <CalendarDays className="w-5 h-5 text-primary" />
          <span className="font-medium">19-10-2025 (周日)</span>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
          <MapPin className="w-5 h-5 text-accent" />
          <span className="font-medium">草地野餐</span>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-medium">每人带一道5人份美食</span>
        </div>
      </div>
      
      <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
        接力吧！每人只需带一道5人份的美食，要非常好吃的美食哦。🤩
        <br />
        每项目美食已设定分量，满了不能加，请另选其他美食项目。🙏
      </p>
    </header>
  );
};

export default EventHeader;
