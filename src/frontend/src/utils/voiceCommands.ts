/**
 * Shared voice command handler for VoiceModePage and FloatingVoiceOverlay.
 * Returns a response string if a special command was handled, or null otherwise.
 */
export function handleSpecialCommand(
  text: string,
  lang: "en-US" | "hi-IN",
): string | null {
  const lower = text.toLowerCase();
  const isHindi = lang === "hi-IN";
  const open = (url: string, name: string, nameHi: string) => {
    window.open(url, "_blank");
    return isHindi
      ? `${nameHi} naya tab mein khul gaya!`
      : `${name} opened in a new tab!`;
  };

  // WhatsApp with optional message
  if (lower.includes("whatsapp")) {
    const msgMatch = text.match(
      /(?:message|msg|bhejo|send|bolo).*?(?:ko|to)?\s+(.+)/i,
    );
    const preText = msgMatch ? encodeURIComponent(msgMatch[1].trim()) : "";
    const url = preText
      ? `https://web.whatsapp.com/send?text=${preText}`
      : "https://web.whatsapp.com";
    window.open(url, "_blank");
    return isHindi
      ? "WhatsApp Web naya tab mein khul gaya!"
      : "WhatsApp Web opened in a new tab!";
  }

  // YouTube
  if (lower.includes("youtube") || lower.includes("you tube")) {
    const searchMatch = text.match(
      /(?:search|dhundo|play|chalao)\s+(.+?)(?:\s+on\s+youtube)?$/i,
    );
    const url = searchMatch
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchMatch[1])}`
      : "https://www.youtube.com";
    window.open(url, "_blank");
    return isHindi
      ? "YouTube naya tab mein khul gaya!"
      : "YouTube opened in a new tab!";
  }

  // Google Search
  if (
    lower.includes("google") ||
    lower.includes("search karo") ||
    lower.includes("search kr")
  ) {
    const searchMatch = text.match(
      /(?:search|dhundo|google karo|google kr)\s+(.+)/i,
    );
    const url = searchMatch
      ? `https://www.google.com/search?q=${encodeURIComponent(searchMatch[1])}`
      : "https://www.google.com";
    window.open(url, "_blank");
    return isHindi
      ? "Google naya tab mein khul gaya!"
      : "Google opened in a new tab!";
  }

  if (lower.includes("instagram") || lower.includes("insta"))
    return open("https://www.instagram.com", "Instagram", "Instagram");
  if (lower.includes("facebook"))
    return open("https://www.facebook.com", "Facebook", "Facebook");
  if (
    lower.includes("twitter") ||
    lower.includes("x.com") ||
    lower.includes("tweet")
  )
    return open("https://www.x.com", "Twitter/X", "Twitter");
  if (
    lower.includes("gmail") ||
    lower.includes("email") ||
    lower.includes("mail")
  )
    return open("https://mail.google.com", "Gmail", "Gmail");

  // Google Maps
  if (
    lower.includes("maps") ||
    lower.includes("location") ||
    lower.includes("map")
  ) {
    const placeMatch = text.match(
      /(?:maps|location|navigate|directions|show)\s+(.+)/i,
    );
    const url = placeMatch
      ? `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1])}`
      : "https://maps.google.com";
    window.open(url, "_blank");
    return isHindi
      ? "Google Maps naya tab mein khul gaya!"
      : "Google Maps opened in a new tab!";
  }

  if (
    lower.includes("spotify") ||
    lower.includes("music") ||
    lower.includes("gaana")
  )
    return open("https://open.spotify.com", "Spotify", "Spotify");
  if (lower.includes("netflix"))
    return open("https://www.netflix.com", "Netflix", "Netflix");
  if (lower.includes("amazon"))
    return open("https://www.amazon.in", "Amazon", "Amazon");
  if (lower.includes("flipkart"))
    return open("https://www.flipkart.com", "Flipkart", "Flipkart");
  if (lower.includes("telegram"))
    return open("https://web.telegram.org", "Telegram", "Telegram");
  if (lower.includes("linkedin"))
    return open("https://www.linkedin.com", "LinkedIn", "LinkedIn");
  if (lower.includes("reddit"))
    return open("https://www.reddit.com", "Reddit", "Reddit");
  if (lower.includes("github"))
    return open("https://www.github.com", "GitHub", "GitHub");

  // Wikipedia
  if (lower.includes("wikipedia") || lower.includes("wiki")) {
    const searchMatch = text.match(/(?:wikipedia|wiki)\s+(.+)/i);
    const url = searchMatch
      ? `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(searchMatch[1])}`
      : "https://www.wikipedia.org";
    window.open(url, "_blank");
    return isHindi
      ? "Wikipedia naya tab mein khul gaya!"
      : "Wikipedia opened in a new tab!";
  }

  if (lower.includes("snapchat"))
    return open("https://web.snapchat.com", "Snapchat", "Snapchat");
  if (lower.includes("pinterest"))
    return open("https://www.pinterest.com", "Pinterest", "Pinterest");
  if (lower.includes("hotstar") || lower.includes("disney"))
    return open("https://www.hotstar.com", "Hotstar", "Hotstar");
  if (lower.includes("prime video") || lower.includes("amazon prime"))
    return open("https://www.primevideo.com", "Prime Video", "Prime Video");
  if (lower.includes("paytm"))
    return open("https://paytm.com", "Paytm", "Paytm");
  if (lower.includes("phonepe") || lower.includes("phone pe"))
    return open("https://www.phonepe.com", "PhonePe", "PhonePe");
  if (lower.includes("zomato"))
    return open("https://www.zomato.com", "Zomato", "Zomato");
  if (lower.includes("swiggy"))
    return open("https://www.swiggy.com", "Swiggy", "Swiggy");
  if (lower.includes("olx")) return open("https://www.olx.in", "OLX", "OLX");
  if (lower.includes("meesho"))
    return open("https://www.meesho.com", "Meesho", "Meesho");
  if (lower.includes("myntra"))
    return open("https://www.myntra.com", "Myntra", "Myntra");

  // Device-level impossible commands
  if (lower.includes("screenshot") || lower.includes("screen shot")) {
    return isHindi
      ? "Sorry, screenshot lena web app se possible nahi hai."
      : "Sorry, I cannot take screenshots from a web app.";
  }
  if (
    lower.includes("phone off") ||
    lower.includes("band karo phone") ||
    lower.includes("switch off") ||
    lower.includes("phone band")
  ) {
    return isHindi
      ? "Sorry, phone band karna web app se possible nahi hai."
      : "Sorry, I cannot turn off your phone from a web app.";
  }

  return null;
}
