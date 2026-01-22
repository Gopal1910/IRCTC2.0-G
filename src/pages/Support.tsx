import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const sampleQueries = [
  "Show next train to Delhi tomorrow morning",
  "Cancel my last booking",
  "Book metro for 6 PM today",
  "What's the status of PNR 1234567890?",
  "How to check train schedule?",
  "What documents needed for train booking?",
  "How to get refund for cancelled ticket?",
  "What is tatkal booking timing?"
];

// IRCTC related responses database
const irctcResponses: { [key: string]: string } = {
  "hello": "Hello! Welcome to SmartRail IRCTC Assistant. How can I help you with your train journey today?",
  "hi": "Hi there! I'm here to assist you with train bookings, cancellations, and railway inquiries.",

  // Train booking related
  "book train": "You can book trains through:\n• IRCTC website or mobile app\n• Make payment via UPI, card, or net banking\n• Need valid ID proof for booking",
  "book metro": "For metro booking:\n• Use the MetroRail app or website\n• Select route, time, and passengers\n• Digital tickets will be sent to your mobile",
  "how to book train": "Train booking steps:\n1. Login to IRCTC\n2. Enter source & destination\n3. Select date and train\n4. Add passenger details\n5. Make payment\n6. Get e-ticket",

  // Cancellation related
  "cancel booking": "To cancel booking:\n• Go to 'My Transactions' on IRCTC\n• Select ticket to cancel\n• Refund will be processed as per rules\n• Cancellation charges apply based on time",
  "cancel my last booking": "Please login to your IRCTC account, go to 'My Transactions' section, and select the recent booking to cancel it. Refund will be credited within 5-7 working days.",

  // Train schedule related
  "show next train to delhi": "Next trains to Delhi:\n• Rajdhani Express - 08:30 AM\n• Shatabdi Express - 11:15 AM\n• Duronto Express - 03:45 PM\n• Check exact schedule on IRCTC website",
  "train schedule": "You can check train schedules:\n• On IRCTC website 'Train Schedule' section\n• Via 'Where is My Train' app\n• By calling railway enquiry 139",

  // PNR status related
  "pnr status": "To check PNR status:\n• Visit IRCTC website PNR enquiry\n• SMS PNR <number> to 139\n• Use IRCTC mobile app\n• Status updates 4 hours before journey",
  "what's the status of pnr": "Please share your 10-digit PNR number and I'll help you check the status. You can also check directly on IRCTC website.",

  // Refund related
  "refund": "Refund process:\n• Automatic refund for e-tickets\n• Processed within 5-7 working days\n• Amount depends on cancellation time\n• Check refund status in 'My Transactions'",
  "how to get refund": "Refunds are automatically processed to your original payment method. For issues, contact:\n• IRCTC Helpdesk: 011-39340000\n• Email: care@irctc.co.in",

  // Documents required
  "documents needed": "Required documents:\n• Valid ID proof (Aadhar, PAN, Voter ID)\n• For foreigners: Passport\n• Concession certificates if applicable",
  "what documents needed for train booking": "Accepted ID proofs:\n• Aadhar Card\n• PAN Card\n• Driving License\n• Voter ID\n• Passport (for foreign tourists)",

  // Tatkal booking
  "tatkal booking": "Tatkal booking timing:\n• AC Classes: 10:00 AM one day before journey\n• Non-AC Classes: 11:00 AM one day before\n• Quick payment is recommended",
  "what is tatkal booking timing": "Tatkal booking opens at:\n• 10:00 AM for AC classes\n• 11:00 AM for non-AC classes\n• One day before journey date (excluding journey day)",

  // General help
  "help": "I can help you with:\n• Train bookings & cancellations\n• PNR status checking\n• Train schedules\n• Refund queries\n• Metro bookings\n• Railway information",

  // Default response
  "default": "I understand you're asking about railway services. For specific assistance with:\n• Bookings - Visit IRCTC website/app\n• Cancellations - Check 'My Transactions'\n• PNR Status - Use PNR enquiry\n• Refunds - Contact IRCTC helpdesk\n\nCan you please rephrase your question?"
};

const initialMessages = [
  {
    id: 1,
    type: "bot",
    text: "Hello! I'm your SmartRail IRCTC Assistant. I can help you with train bookings, cancellations, PNR status, and all railway-related queries. How can I assist you today?",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const Support = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const findBestResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for exact matches first
    for (const [key, response] of Object.entries(irctcResponses)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return response;
      }
    }

    // Check for keyword matches
    if (lowerMessage.includes("train") && lowerMessage.includes("delhi")) {
      return irctcResponses["show next train to delhi"];
    }
    if (lowerMessage.includes("cancel")) {
      return irctcResponses["cancel booking"];
    }
    if (lowerMessage.includes("book") && lowerMessage.includes("train")) {
      return irctcResponses["book train"];
    }
    if (lowerMessage.includes("pnr")) {
      return irctcResponses["pnr status"];
    }
    if (lowerMessage.includes("refund")) {
      return irctcResponses["refund"];
    }
    if (lowerMessage.includes("document")) {
      return irctcResponses["documents needed"];
    }
    if (lowerMessage.includes("tatkal")) {
      return irctcResponses["tatkal booking"];
    }
    if (lowerMessage.includes("metro")) {
      return irctcResponses["book metro"];
    }
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return irctcResponses["hello"];
    }

    return irctcResponses["default"];
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse = findBestResponse(messageText);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Delete a single message
  const handleDeleteMessage = (id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  // Clear all messages
  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 transition-all duration-300">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

            {/* Header */}
            <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1 sm:mb-0">
                  IRCTC Support Assistant
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Get instant help with train bookings, cancellations, and railway services
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleClearChat}
                disabled={messages.length === 1}
              >
                <Trash2 className="h-4 w-4" /> Reset Chat
              </Button>
            </div>

            {/* Sample Queries */}
            <div className="glass-card p-3 sm:p-4">
              <p className="text-sm font-semibold mb-2 sm:mb-3">Try asking about:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(query)}
                    className="text-xs sm:text-sm hover:bg-accent/10 hover:text-accent"
                    disabled={isLoading}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="glass-card p-3 sm:p-6 h-[70vh] sm:h-[600px] flex flex-col">
              <ScrollArea className="flex-1 pr-2 sm:pr-4">
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 sm:gap-3 relative ${message.type === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "bot"
                            ? "bg-accent/20 text-accent"
                            : "bg-primary/20 text-primary"
                          }`}
                      >
                        {message.type === "bot" ? (
                          <Bot className="h-4 sm:h-5 w-4 sm:w-5" />
                        ) : (
                          <User className="h-4 sm:h-5 w-4 sm:w-5" />
                        )}
                      </div>

                      <div
                        className={`flex flex-col max-w-[70%] ${message.type === "user" ? "items-end" : "items-start"
                          }`}
                      >
                        <div
                          className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base ${message.type === "bot"
                              ? "bg-background/50 border border-border/30"
                              : "bg-gradient-to-r from-primary to-accent text-white"
                            }`}
                        >
                          <p className="whitespace-pre-line">{message.text}</p>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="bg-background/50 border border-border/30 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-border/30">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                  placeholder="Ask about train booking, cancellation, PNR status..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSend()}
                  size="icon"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
              </div>
            </div>

            {/* Information */}
            <div className="glass-card p-4 border border-blue-500/30 bg-blue-500/10">
              <p className="text-blue-700 font-semibold">ℹ️ SmartRail IRCTC Assistant</p>
              <p className="text-blue-600 text-sm mt-1">
                I can help you with train bookings, cancellations, PNR status, refunds, and all railway-related queries.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;