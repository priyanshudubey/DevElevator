import { useEffect, useState } from "react";

const roastMessages = [
  "Bro... you writing README or writing a whole book? 📚",
  "You clicked Generate like it's Candy Crush. Calm down, Steve Jobs!",
  "Dear unemployed genius, even your README has more structure than your life 😭",
  "You've generated 3 READMEs today. Touch some grass now. 🌱",
  "One more click and OpenAI will start charging rent from me. 💸",
  "My OpenAI credits are crying in a corner. Please stop. 🥲",
  "I get it, you're excited. But your usage plan says 'chill'. 😤",
  "I hope you're using these READMEs for projects, not just to flex. 🙃",
  "Rate limit reached. Your click finger needs a break. ☕",
  "The DevElevator is closed for maintenance. Powered by dreams and 2 credits. 💀",
  "Used last ₹500 to renew my domain. Can’t buy groceries, but at least you can generate README.md.",

  // 🔥 Fresh new roasts
  "This app is running on hopes, tears, and expired Maggi. 🍜",
  "Dev is so broke, even this message is sponsored by dreams™.",
  "OpenAI sent me a warning: 'Stop being poor.'",
  "You're clicking so much, I'm afraid your repo is a scam. 🚨",
  "Each README costs me a piece of my soul. You're welcome.",
  "If you want unlimited access, consider donating a kidney. Mine’s already gone. 🧠",
  "This isn't GitHub Copilot, this is GitHub Side Hustle.",
  "The developer had to sell Wi-Fi password for credits. Use wisely. 📉",
  "No job, no credits, no hope — just vibes and JavaScript. 🤡",
  "DevElevator is currently running on unpaid internships and unpaid rent. 🧾",
];

const RoastPopup = ({ remaining, onClose, disabledUntil }) => {
  const [roast, setRoast] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const random = Math.floor(Math.random() * roastMessages.length);
    setRoast(roastMessages[random]);
    if (disabledUntil) {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [disabledUntil]);

  const formatTime = (ms) => {
    if (ms <= 0) return "0h 0m";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const canClose = !disabledUntil || disabledUntil - now <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white text-black p-6 rounded-xl shadow-lg max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold">🚨 Roast Alert!</h2>
        <p>{roast}</p>
        {disabledUntil ? (
          <p className="text-red-500 font-medium">
            You’ve exhausted your daily limit. Come back in:{" "}
            <strong>{formatTime(disabledUntil - Date.now())}</strong>
          </p>
        ) : (
          <p className="text-gray-600">
            You have {remaining} requests left today.
          </p>
        )}
        <button
          onClick={onClose}
          className={`mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 ${
            !canClose ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canClose}>
          Got it 😤
        </button>
      </div>
    </div>
  );
};

export default RoastPopup;
