export interface Suggestion {
  text: string;
  prompt: string;
}

const basePrompts: { text: string; prompt: string }[] = [
  { text: "T-Shirt", prompt: "T-Shirt" },
  { text: "Jacket", prompt: "Jacket" },
  { text: "Sweater", prompt: "Sweater" },
  { text: "Blouse", prompt: "Blouse" },
  { text: "Hoodie", prompt: "Hoodie" },
  { text: "Jeans", prompt: "Jeans" },
  { text: "Shorts", prompt: "Shorts" },
  { text: "Skirt", prompt: "Skirt" },
  { text: "Trousers", prompt: "Trousers" },
  { text: "Casual Dress", prompt: "Casual Dress" },
  { text: "Evening Dress", prompt: "Evening Dress" },
  { text: "Summer Dress", prompt: "Summer Dress" },
];

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomSuggestions(count: number = 5): Suggestion[] {
  const shuffledPrompts = shuffle(basePrompts);
  
  return shuffledPrompts.slice(0, count).map((item) => ({
    text: item.text,
    prompt: item.prompt,
  }));
}
