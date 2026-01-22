

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { stations } from "@/data/stations";

export const SearchHero = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 rounded-3xl blur-3xl -z-10"></div>

      <Card className="glass-card p-8 border-2 border-accent/20 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="text-orange-500">AI-Powered</span> Train Search
          </h2>

          <p className="text-muted-foreground">Find the perfect journey with intelligent recommendations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* From Station */}
          <div className="relative">
            <label htmlFor="from-station" className="text-sm font-medium text-muted-foreground mb-2 block">From</label>
            <Combobox
              options={stations}
              value={from}
              onValueChange={setFrom}
              placeholder="Enter station"
              aria-label="Select departure station"
              className="bg-background/50 border-border/50 focus:border-accent pl-10"
            />
            <Search className="absolute left-3 bottom-3 h-4 w-4 text-muted-foreground" />
          </div>

          {/* To Station */}
          <div className="relative">
            <label htmlFor="to-station" className="text-sm font-medium text-muted-foreground mb-2 block">To</label>
            <Combobox
              options={stations}
              value={to}
              onValueChange={setTo}
              placeholder="Enter destination"
              aria-label="Select destination station"
              className="bg-background/50 border-border/50 focus:border-accent pl-10"
            />
            <Search className="absolute left-3 bottom-3 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Date */}
          <div className="relative">
            <label htmlFor="travel-date" className="text-sm font-medium text-muted-foreground mb-2 block">Date</label>
            <input
              id="travel-date"
              type="date"
              className="bg-background/50 border-border/50 focus:border-accent pl-10 rounded-md h-10 w-full"
            />
            <Calendar className="absolute left-3 bottom-3 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Class */}
          <div className="relative">
            <label htmlFor="train-class" className="text-sm font-medium text-muted-foreground mb-2 block">Class</label>
            <select id="train-class" className="w-full h-10 rounded-md bg-background/50 border border-border/50 focus:border-accent px-3 text-sm">
              <option>All Classes</option>
              <option>Sleeper (SL)</option>
              <option>AC 3 Tier (3A)</option>
              <option>AC 2 Tier (2A)</option>
              <option>AC 1st Class (1A)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12 glow-accent"
            onClick={() => navigate('/book', { state: { selectedTrain: 'Rajdhani Express' } })}
          >
            <Search className="mr-2 h-5 w-5" />
            Search Trains
          </Button>
         
        </div>

        
      </Card>
    </div>
  );
};