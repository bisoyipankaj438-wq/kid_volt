export interface QuizQ {
  emoji: string;
  q: string;
  options: { label: string; good: boolean; reaction: string }[];
}

export const QUIZ: QuizQ[] = [
  {
    emoji: "☕",
    q: "You got ₹500. Your favorite cafe/snack spot is nearby!",
    options: [
      {
        label: "Buy the most expensive treats 🍔🥤",
        good: false,
        reaction: "Yummy… but gone in 5 min!",
      },
      {
        label: "Buy a small snack, save the rest 💰",
        good: true,
        reaction: "Smart move! Future-you says thanks.",
      },
      { label: "Save it all 🏦", good: true, reaction: "Money master vibes!" },
    ],
  },
  {
    emoji: "🎮",
    q: "A new game/gadget costs ₹1500. You have ₹400.",
    options: [
      { label: "Beg parents for it 😩", good: false, reaction: "Nope. Try again, tycoon." },
      { label: "Save ₹200/week till you can 📅", good: true, reaction: "Patience = power!" },
      { label: "Forget it forever 🥲", good: false, reaction: "Goals matter — don't quit!" },
    ],
  },
  {
    emoji: "🛒",
    q: "Same item/gadget: ₹800 here, ₹600 online/next shop.",
    options: [
      { label: "Buy now, can't wait!", good: false, reaction: "Always compare prices first!" },
      { label: "Buy the cheaper one 🚶", good: true, reaction: "₹200 saved = snack money!" },
      { label: "Buy both 😅", good: false, reaction: "Ouch, your wallet cried." },
    ],
  },
  {
    emoji: "🎂",
    q: "Birthday gift: ₹1000 from family!",
    options: [
      {
        label: "Spend on fast fashion/candy 👗🍬",
        good: false,
        reaction: "Instant rush, money crash.",
      },
      { label: "Save half, treat half 🎉", good: true, reaction: "Balance king/queen!" },
      { label: "All into savings 💪", good: true, reaction: "Future-you is rich!" },
    ],
  },
  {
    emoji: "👟",
    q: "Friends got cool sneakers. Yours work fine.",
    options: [
      { label: "Buy new ones too!", good: false, reaction: "FOMO is expensive." },
      { label: "Wait till yours wear out", good: true, reaction: "Wisdom level: 100" },
      { label: "Trade with friend 🤝", good: true, reaction: "Creative thinker!" },
    ],
  },
  {
    emoji: "💡",
    q: "What does 'saving' actually mean?",
    options: [
      { label: "Hiding money under bed", good: false, reaction: "Not quite — try again!" },
      {
        label: "Keeping money for later goals 🎯",
        good: true,
        reaction: "Exactly! Goals + patience.",
      },
      { label: "Never spending ever", good: false, reaction: "Saving ≠ never spending." },
    ],
  },
  {
    emoji: "🎟️",
    q: "Carnival! ₹100 left, 3 rides cost ₹40 each.",
    options: [
      { label: "Borrow ₹20 from friend", good: false, reaction: "Debt is a sneaky monster." },
      { label: "Pick your favorite 2 rides", good: true, reaction: "Choices > regrets!" },
      { label: "Skip rides, save it", good: true, reaction: "Strong willpower!" },
    ],
  },
  {
    emoji: "🍕",
    q: "Order pizza ₹400 or cook at home ₹100?",
    options: [
      { label: "Pizza always wins 🍕", good: false, reaction: "Tasty but pricey habit." },
      { label: "Cook today, pizza weekend", good: true, reaction: "Balanced budget hero!" },
      { label: "Both, why not!", good: false, reaction: "Wallet: 'help me'." },
    ],
  },
];
