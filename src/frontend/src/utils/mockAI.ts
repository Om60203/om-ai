// Comprehensive mock AI - Om.ai knowledge base

const INDIAN_NAMES_MALE = [
  "Aarav",
  "Arjun",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Sai",
  "Arnav",
  "Ishaan",
  "Rohan",
  "Karthik",
  "Rahul",
  "Amit",
  "Suresh",
  "Ravi",
  "Deepak",
  "Sanjeev",
  "Manish",
  "Vikram",
  "Rajesh",
  "Pradeep",
  "Nikhil",
  "Sanjay",
  "Ajay",
  "Vijay",
  "Om",
  "Shiv",
  "Krishna",
  "Sachin",
  "Mohit",
  "Gaurav",
  "Harsh",
  "Ankit",
  "Devraj",
  "Pranav",
  "Rishabh",
  "Yash",
  "Kartik",
  "Akash",
  "Shubham",
  "Tushar",
  "Varun",
  "Neeraj",
  "Abhishek",
  "Himanshu",
  "Tarun",
  "Kunal",
  "Vishal",
  "Rohit",
  "Piyush",
  "Akshay",
  "Dhruv",
  "Siddharth",
  "Tanmay",
  "Ashish",
  "Sumit",
  "Arun",
  "Lakshay",
  "Parth",
  "Ayush",
  "Shivam",
  "Vikas",
  "Kapil",
  "Mukesh",
  "Ramesh",
];

const INDIAN_NAMES_FEMALE = [
  "Aadhya",
  "Ananya",
  "Pari",
  "Anika",
  "Aarohi",
  "Myra",
  "Sara",
  "Diya",
  "Priya",
  "Kavya",
  "Neha",
  "Pooja",
  "Anjali",
  "Riya",
  "Sonia",
  "Shreya",
  "Divya",
  "Meera",
  "Nisha",
  "Radha",
  "Sunita",
  "Geeta",
  "Rekha",
  "Seema",
  "Lakshmi",
  "Saraswati",
  "Durga",
  "Parvati",
  "Sita",
  "Ruhi",
  "Tanvi",
  "Tanya",
  "Isha",
  "Nidhi",
  "Komal",
  "Swati",
  "Pallavi",
  "Shivani",
  "Preeti",
  "Sneha",
  "Megha",
  "Garima",
  "Jyoti",
  "Archana",
  "Vandana",
  "Kiran",
  "Lata",
  "Mamta",
  "Shilpa",
  "Aditi",
  "Aishwarya",
  "Deepika",
  "Rani",
  "Usha",
  "Savita",
  "Mona",
  "Sonam",
  "Kritika",
  "Bhavna",
  "Mansi",
  "Ruchi",
  "Hina",
  "Monika",
  "Naina",
];

const ALL_INDIAN_NAMES = [...INDIAN_NAMES_MALE, ...INDIAN_NAMES_FEMALE];

function pickRandom<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function extractNumber(text: string): number {
  const match = text.match(/(\d+)/);
  return match ? Math.min(Number.parseInt(match[1]), 20) : 4;
}

function tryMath(lower: string): string | null {
  const expr = lower.match(/[\d.\s]+[+\-*/][\d.\s+\-*/().]+/);
  if (!expr) return null;
  const cleaned = expr[0].replace(/[^0-9+\-*/().\s]/g, "").trim();
  if (cleaned.length < 3) return null;
  try {
    // biome-ignore lint/security/noGlobalEval: controlled math eval
    const result = eval(cleaned);
    if (typeof result === "number" && Number.isFinite(result)) {
      return `**${cleaned} = ${Number.isInteger(result) ? result : result.toFixed(4)}**`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getMockResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  // ---- GREETINGS ----
  if (
    /^(hi|hello|hey|howdy|sup|greetings|good\s*(morning|evening|afternoon|night)|hii+|helo+|namaste|namaskar|salam|salaam|yo\b|what'?s\s*up)/.test(
      lower,
    )
  ) {
    const g = [
      "Hello! I'm Om, your AI assistant. How can I help you today?",
      "Hey there! Ready to help you with coding, knowledge, or any questions.",
      "Hi! Whether it's code, concepts, or creative ideas — I'm here for you!",
      "Namaste! Om.ai at your service. What can I help you with?",
    ];
    return g[Math.floor(Math.random() * g.length)];
  }

  if (
    /how are you|how r u|kaisa hai|kaise ho|kya haal|are you ok|how have you been/.test(
      lower,
    )
  ) {
    return "I'm doing great, thanks for asking! My systems are running smoothly and I'm ready to help. What's on your mind today?";
  }

  if (
    /your name|who are you|what are you|aap kaun|tumhara naam|introduce yourself/.test(
      lower,
    )
  ) {
    return "I'm **Om**, an AI assistant on **Om.ai**! I can help with:\n\n- 💻 Coding (Python, JS, React, CSS, HTML, Git)\n- 🇮🇳 Indian GK, History, Cricket, Bollywood\n- 🔬 Science & Math\n- 🌍 World Geography & History\n- 🤖 AI, Technology\n- 💡 General Knowledge\n\nAsk me anything!";
  }

  if (/thank|thanks|shukriya|dhanyawad|thx|ty\b|tysm/.test(lower)) {
    return "You're welcome! Happy to help. Feel free to ask anything else.";
  }

  if (/bye|goodbye|alvida|cya|see you/.test(lower)) {
    return "Goodbye! Have a great day. Come back anytime! 😊";
  }

  if (
    /what can you do|your capabilities|help me|what do you know/.test(lower)
  ) {
    return "I can help you with:\n\n**Knowledge:**\n- Indian & World GK, History, Geography\n- Science (Physics, Chemistry, Biology)\n- Mathematics & Calculations\n\n**Technology:**\n- Python, JavaScript, TypeScript, React, CSS, HTML\n- AI, Blockchain, Internet, 5G\n\n**India:**\n- Cricket, Bollywood, Food, Culture, Festivals\n- State capitals, Indian names, History\n\n**Everyday:**\n- Date & time, Jokes, Motivation\n\nJust ask anything!";
  }

  // ---- INDIAN NAMES ----
  if (/indian.*name|name.*indian|hindi.*name|name.*hindi/i.test(lower)) {
    const isMale = /male|boy|man|ladka|purush/i.test(lower);
    const isFemale = /female|girl|woman|ladki|mahila/i.test(lower);
    const count = extractNumber(lower);
    const pool = isMale
      ? INDIAN_NAMES_MALE
      : isFemale
        ? INDIAN_NAMES_FEMALE
        : ALL_INDIAN_NAMES;
    const names = pickRandom(pool, count);
    const genderNote = isMale ? " (male)" : isFemale ? " (female)" : "";
    return `Here are ${count} Indian names${genderNote}:\n\n${names.map((n, i) => `${i + 1}. **${n}**`).join("\n")}\n\nThese are popular names in India with deep cultural significance.`;
  }

  if (/give.*\d+.*name|list.*name|\d+.*name/i.test(lower)) {
    const count = extractNumber(lower);
    const names = pickRandom(ALL_INDIAN_NAMES, count);
    return `Here are ${count} names:\n\n${names.map((n, i) => `${i + 1}. **${n}**`).join("\n")}\n\nLet me know if you want names from a specific category!`;
  }

  // ---- INDIA GK ----
  if (/capital.*india|india.*capital/.test(lower)) {
    return "The capital of India is **New Delhi**. It is the seat of the Indian government, including Parliament, Rashtrapati Bhavan, and Supreme Court.";
  }

  if (/prime minister.*india|india.*prime minister|pm.*india/.test(lower)) {
    return "The Prime Minister of India is **Narendra Modi** (as of 2024). He is the 14th PM, in office since May 2014, leader of BJP. He was re-elected for a third term in 2024.";
  }

  if (/president.*india|india.*president/.test(lower)) {
    return "The President of India is **Droupadi Murmu** (as of 2024). She is the 15th President, elected in July 2022 — the first tribal woman and second woman to hold this office.";
  }

  if (
    /independence.*india|india.*independence|15.*august|august.*15/.test(lower)
  ) {
    return "India gained independence on **15 August 1947** from British rule. Jawaharlal Nehru was the first PM who gave the famous 'Tryst with Destiny' speech at midnight.";
  }

  if (/republic.*day|26.*january|january.*26/.test(lower)) {
    return "**Republic Day** is on **26 January**. India's Constitution came into force on 26 Jan 1950. A grand parade is held at Kartavya Path in New Delhi every year.";
  }

  if (/constitution.*india/.test(lower)) {
    return "India's **Constitution** came into effect on **26 January 1950**, drafted under **Dr. B.R. Ambedkar**. It is the world's longest written constitution. India is a Sovereign, Socialist, Secular, Democratic Republic.";
  }

  if (/national.*animal|india.*tiger/.test(lower)) {
    return "India's national symbols:\n- 🐯 **National Animal**: Bengal Tiger\n- 🦚 **National Bird**: Indian Peacock\n- 🪷 **National Flower**: Lotus\n- 🥭 **National Fruit**: Mango\n- 🌲 **National Tree**: Banyan\n- 🏏 **National Sport**: Field Hockey";
  }

  if (/ipl|indian premier league/.test(lower)) {
    return "**IPL (Indian Premier League)** — world's richest cricket league.\n- Founded: 2008 by BCCI\n- 10 teams\n- Most titles: **Mumbai Indians** (5)\n- Broadcast in 120+ countries\n- Attracts top players worldwide";
  }

  if (/cricket|virat|rohit|dhoni|sachin|bumrah|kohli/.test(lower)) {
    return "India's cricket legends:\n\n1. **Sachin Tendulkar** — God of Cricket, 100 international centuries, Bharat Ratna\n2. **MS Dhoni** — Captain Cool, WC 2007 & 2011 winner\n3. **Virat Kohli** — Greatest modern batsman, 70+ centuries\n4. **Rohit Sharma** — Current captain, master of big scores\n5. **Jasprit Bumrah** — World's #1 fast bowler\n\nIndia won World Cups: 1983, 2007 (T20), 2011!";
  }

  if (
    /bollywood|hindi.*film|shahrukh|shah rukh|deepika|aamir|amitabh/.test(lower)
  ) {
    return "**Bollywood** — Hindi film industry based in Mumbai, one of world's largest.\n\n🎬 Shah Rukh Khan — King of Bollywood\n🎬 Amitabh Bachchan — Shehenshah, greatest ever\n🎬 Aamir Khan — Mr. Perfectionist (3 Idiots, Dangal)\n🎬 Deepika Padukone — Top global actress\n\nBlockbusters: Dangal, Baahubali, RRR, KGF, 3 Idiots, DDLJ";
  }

  if (/taj mahal/.test(lower)) {
    return "**Taj Mahal** — White marble mausoleum in **Agra, UP**. Built by Mughal Emperor **Shah Jahan** (1632–1653) in memory of wife **Mumtaz Mahal**. UNESCO World Heritage Site & one of the **7 Wonders of the World**. 20,000 workers built it.";
  }

  if (/mahatma gandhi|bapu/.test(lower)) {
    return "**Mahatma Gandhi** (1869–1948) — Father of the Nation. Led India's independence through **non-violence (Ahimsa)** and **Satyagraha**. Key movements: Non-Cooperation (1920), Civil Disobedience/Salt March (1930), Quit India (1942). Assassinated 30 Jan 1948. Birthday Oct 2 = International Non-Violence Day.";
  }

  if (/ambedkar|br ambedkar/.test(lower)) {
    return "**Dr. B.R. Ambedkar** (1891–1956) — Father of the Indian Constitution. Jurist, economist, social reformer. Chaired Constitution Drafting Committee. India's first Law Minister. Fought for Dalit rights. Converted to Buddhism in 1956. Posthumously awarded **Bharat Ratna** in 1990.";
  }

  if (/india.*state|state.*india|how many.*state/.test(lower)) {
    return "India has **28 States** and **8 Union Territories**.\n- Largest by area: **Rajasthan**\n- Most populous: **Uttar Pradesh**\n- Smallest: **Goa**\n- Newest state: **Telangana** (2014)";
  }

  if (/isro|chandrayaan|mangalyaan|india.*space/.test(lower)) {
    return "**ISRO** (Indian Space Research Organisation) founded 1969.\n\n🚀 **Chandrayaan-3** (2023) — First soft landing near Moon's south pole\n🛸 **Mangalyaan** (2014) — First Asian Mars mission, succeeded on first attempt\n🛰️ PSLV — world's most reliable rocket\n\nIndia is the **4th country to land on the Moon**!";
  }

  if (/festival.*india|diwali|holi|navratri|eid|durga puja/.test(lower)) {
    return "India — land of festivals:\n\n🪔 **Diwali** — Festival of Lights (Oct-Nov)\n🎨 **Holi** — Festival of Colors (March)\n🕌 **Eid** — End of Ramadan\n🌺 **Navratri/Durga Puja** — 9 nights of devotion\n🌾 **Pongal/Lohri/Baisakhi** — Harvest festivals\n🎊 **Ganesh Chaturthi** — Ganesha's birthday";
  }

  if (/nehru|jawaharlal/.test(lower)) {
    return "**Jawaharlal Nehru** (1889–1964) — India's first Prime Minister (1947–1964). Key founder of modern India. Established IITs, AIIMS, scientific institutions. Children's Day = his birthday November 14. Led Non-Alignment Movement.";
  }

  if (/bharat ratna/.test(lower)) {
    return "**Bharat Ratna** is India's highest civilian honour. Notable recipients include Sachin Tendulkar (2014), Dr. APJ Abdul Kalam (1997), Mother Teresa (1980), Dr. B.R. Ambedkar (1990, posthumous), Atal Bihari Vajpayee (2015).";
  }

  if (/rupee|inr|india.*currency/.test(lower)) {
    return "India's currency: **Indian Rupee (₹ / INR)**. Symbol ₹ designed by D. Udaya Kumar (2010). Issued by **Reserve Bank of India (RBI)**. Notes: ₹2000, ₹500, ₹200, ₹100, ₹50, ₹20, ₹10.";
  }

  // ---- STATE CAPITALS ----
  if (/capital.*rajasthan/.test(lower))
    return "Capital of Rajasthan: **Jaipur** (Pink City)";
  if (/capital.*gujarat/.test(lower))
    return "Capital of Gujarat: **Gandhinagar**";
  if (/capital.*karnataka/.test(lower))
    return "Capital of Karnataka: **Bengaluru** (Bangalore)";
  if (/capital.*kerala/.test(lower))
    return "Capital of Kerala: **Thiruvananthapuram**";
  if (/capital.*tamil.*nadu/.test(lower))
    return "Capital of Tamil Nadu: **Chennai**";
  if (/capital.*west.*bengal/.test(lower))
    return "Capital of West Bengal: **Kolkata**";
  if (/capital.*punjab/.test(lower)) return "Capital of Punjab: **Chandigarh**";
  if (/capital.*bihar/.test(lower)) return "Capital of Bihar: **Patna**";
  if (/capital.*maharashtra/.test(lower))
    return "Capital of Maharashtra: **Mumbai** (financial capital of India)";
  if (/capital.*uttar pradesh|capital.*up\b/.test(lower))
    return "Capital of Uttar Pradesh: **Lucknow**";
  if (/capital.*madhya pradesh/.test(lower))
    return "Capital of Madhya Pradesh: **Bhopal**";
  if (/capital.*andhra pradesh/.test(lower))
    return "Capital of Andhra Pradesh: **Amaravati**";
  if (/capital.*telangana/.test(lower))
    return "Capital of Telangana: **Hyderabad**";
  if (/capital.*odisha/.test(lower))
    return "Capital of Odisha: **Bhubaneswar**";
  if (/capital.*assam/.test(lower)) return "Capital of Assam: **Dispur**";
  if (/capital.*himachal/.test(lower))
    return "Capital of Himachal Pradesh: **Shimla**";
  if (/capital.*uttarakhand/.test(lower))
    return "Capital of Uttarakhand: **Dehradun**";
  if (/capital.*jharkhand/.test(lower))
    return "Capital of Jharkhand: **Ranchi**";
  if (/capital.*chhattisgarh/.test(lower))
    return "Capital of Chhattisgarh: **Raipur**";
  if (/capital.*haryana/.test(lower))
    return "Capital of Haryana: **Chandigarh**";

  // ---- MATH ----
  const mathResult = tryMath(lower);
  if (mathResult) return `${mathResult}\n\nCalculated using arithmetic.`;

  if (/what is.*pi|value.*pi/.test(lower)) {
    return "**π (Pi)** ≈ 3.14159265358979...\n\nRatio of a circle's circumference to its diameter. Irrational number — never repeats. Used in geometry, physics, engineering everywhere.";
  }

  if (/pythagor/.test(lower)) {
    return "**Pythagorean Theorem:** a² + b² = c²\n\nIn a right triangle, the square of the hypotenuse (c) equals the sum of squares of the other two sides.\n\nExample: a=3, b=4 → c = √(9+16) = **5**";
  }

  if (/square root|√/.test(lower)) {
    const numMatch = lower.match(/(?:square root|√)\s*(?:of\s*)?(\d+)/);
    if (numMatch) {
      const n = Number.parseInt(numMatch[1]);
      const sq = Math.sqrt(n);
      return `√${n} = **${Number.isInteger(sq) ? sq : sq.toFixed(4)}**`;
    }
    return "Square root: √n = number that when multiplied by itself gives n. √4=2, √9=3, √16=4, √25=5, √100=10";
  }

  if (/percentage|percent/.test(lower)) {
    const pct = lower.match(/(\d+)\s*%?\s*of\s*(\d+)/);
    if (pct) {
      const result = (Number.parseInt(pct[1]) / 100) * Number.parseInt(pct[2]);
      return `**${pct[1]}% of ${pct[2]} = ${result}**\n\nFormula: (${pct[1]} / 100) × ${pct[2]} = ${result}`;
    }
  }

  if (/prime.*number|is.*prime/.test(lower)) {
    const numMatch = lower.match(/(\d+)/);
    const n = numMatch ? Number.parseInt(numMatch[1]) : null;
    if (n && n < 100000) {
      let isPrime = n > 1;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
          isPrime = false;
          break;
        }
      }
      return isPrime
        ? `**${n} is a prime number** — divisible only by 1 and ${n}.`
        : `**${n} is NOT a prime number** — it has other factors.`;
    }
    return "**Prime numbers** are divisible only by 1 and themselves: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37...";
  }

  if (/area.*circle|circle.*area/.test(lower)) {
    const r = lower.match(
      /radius\s*(?:=|is|of)?\s*(\d+)|(\d+)\s*(?:as\s*)?radius/,
    );
    if (r) {
      const rad = Number.parseInt(r[1] || r[2]);
      return `Area of circle (radius=${rad}) = π × r² = **${(Math.PI * rad * rad).toFixed(2)} sq units**`;
    }
    return "Area of circle = **π × r²** where r = radius. Example: r=7 → Area = 3.14159 × 49 = **153.94 sq units**";
  }

  if (/quadratic|ax2|x\^2/.test(lower)) {
    return "**Quadratic Formula:** For ax² + bx + c = 0\n\nx = **(-b ± √(b²-4ac)) / 2a**\n\nThe discriminant (b²-4ac): >0 = 2 real roots, =0 = 1 root, <0 = no real roots.";
  }

  if (/compound interest|ci formula/.test(lower)) {
    return "**Compound Interest Formula:**\n\nA = P(1 + r/n)^(nt)\n\n- P = Principal amount\n- r = Annual interest rate (decimal)\n- n = Times compounded per year\n- t = Time in years\n\nCI = A - P";
  }

  if (/simple interest|si formula/.test(lower)) {
    return "**Simple Interest Formula:**\n\nSI = (P × R × T) / 100\n\n- P = Principal\n- R = Rate of interest (%)\n- T = Time (years)\n\nAmount = P + SI";
  }

  // ---- SCIENCE / PHYSICS ----
  if (/speed.*light|light.*speed/.test(lower)) {
    return "Speed of light = **299,792,458 m/s** (≈ 3 × 10⁸ m/s). Nothing with mass can reach this speed. Light takes **8 minutes 20 seconds** from the Sun to Earth.";
  }

  if (/water.*formula|chemical.*water|h2o/.test(lower)) {
    return "Water formula: **H₂O** — 2 hydrogen + 1 oxygen. Covers 71% of Earth. Boils at 100°C, freezes at 0°C. Universal solvent. Essential for all known life.";
  }

  if (/newton.*law|laws.*motion/.test(lower)) {
    return "**Newton's 3 Laws of Motion:**\n\n1. **Inertia** — Object stays at rest or uniform motion unless a force acts on it\n2. **F = ma** — Force = mass × acceleration\n3. **Action-Reaction** — Every action has equal & opposite reaction";
  }

  if (/gravity|gravitational/.test(lower)) {
    return "**Gravity** is a fundamental force attracting masses.\n- Earth: **g = 9.8 m/s²**\n- Moon: ~1.6 m/s² (1/6th Earth)\n- Black holes: gravity so strong even light can't escape\n- Described by Newton (1687) and refined by Einstein (1915)";
  }

  if (/einstein|relativity|e=mc/.test(lower)) {
    return "**Albert Einstein** (1879–1955):\n- Famous equation: **E = mc²** (energy = mass × speed of light squared)\n- Special Relativity (1905): time and space are relative\n- General Relativity (1915): gravity curves spacetime\n- Nobel Prize in Physics 1921";
  }

  if (/dna|genetics|gene/.test(lower)) {
    return "**DNA (Deoxyribonucleic Acid)** — double helix structure. 4 bases: A, T, G, C. Human genome: ~3 billion base pairs, ~20,000 genes. Discovered by Watson, Crick, Franklin (1953). Every cell contains your complete DNA.";
  }

  if (/photosynthesis/.test(lower)) {
    return "**Photosynthesis:** 6CO₂ + 6H₂O + sunlight → C₆H₁₂O₆ + 6O₂\n\nPlants convert CO₂ + water + sunlight into glucose (food) + oxygen. Occurs in **chloroplasts** using green **chlorophyll**. Basis of all food chains.";
  }

  if (/periodic.*table|elements/.test(lower)) {
    return "**Periodic Table** has **118 elements**. Arranged by atomic number.\n- Lightest: **Hydrogen (H, #1)**\n- Heaviest natural: **Uranium (U, #92)**\n- Most abundant in crust: **Oxygen**\n- Created by **Dmitri Mendeleev** (1869)";
  }

  if (/black hole/.test(lower)) {
    return "**Black Holes** — regions where gravity is so strong nothing escapes, not even light. Form when massive stars collapse. Milky Way center: **Sagittarius A***. First image captured: 2019 (M87*). Time slows near black holes (gravitational time dilation).";
  }

  if (/atom|proton|neutron|electron/.test(lower)) {
    return "**Atom Structure:**\n- **Protons** (+) — in nucleus\n- **Neutrons** (neutral) — in nucleus\n- **Electrons** (-) — orbit the nucleus\n\nAtomic number = number of protons. Smallest atom: Hydrogen (1 proton, 1 electron). Atoms are 99.9% empty space!";
  }

  if (/sound.*speed|speed.*sound/.test(lower)) {
    return "Speed of sound in air = **343 m/s** (at 20°C). In water = ~1,480 m/s. In steel = ~5,100 m/s. Sound travels faster in denser mediums. Supersonic = faster than sound (Mach 1+).";
  }

  // ---- WORLD GK ----
  if (/capital.*france/.test(lower))
    return "Capital of France: **Paris** — City of Light. Eiffel Tower, Louvre, Notre-Dame.";
  if (/capital.*usa|capital.*america/.test(lower))
    return "Capital of USA: **Washington D.C.** (NOT New York City). Home of White House, Congress, Supreme Court.";
  if (/capital.*china/.test(lower))
    return "Capital of China: **Beijing**. Largest city: Shanghai.";
  if (/capital.*uk|capital.*england/.test(lower))
    return "Capital of UK: **London**. Home to Buckingham Palace, Big Ben, Tower Bridge.";
  if (/capital.*japan/.test(lower))
    return "Capital of Japan: **Tokyo** — world's largest metropolitan area.";
  if (/capital.*russia/.test(lower)) return "Capital of Russia: **Moscow**.";
  if (/capital.*germany/.test(lower)) return "Capital of Germany: **Berlin**.";
  if (/capital.*brazil/.test(lower))
    return "Capital of Brazil: **Brasília** (NOT Rio de Janeiro or São Paulo).";
  if (/capital.*australia/.test(lower))
    return "Capital of Australia: **Canberra** (NOT Sydney or Melbourne).";
  if (/capital.*canada/.test(lower))
    return "Capital of Canada: **Ottawa** (NOT Toronto or Vancouver).";
  if (/capital.*pakistan/.test(lower))
    return "Capital of Pakistan: **Islamabad**.";
  if (/capital.*bangladesh/.test(lower))
    return "Capital of Bangladesh: **Dhaka**.";
  if (/capital.*sri lanka/.test(lower))
    return "Capital of Sri Lanka: **Sri Jayawardenepura Kotte** (legislative), **Colombo** (commercial).";
  if (/capital.*nepal/.test(lower)) return "Capital of Nepal: **Kathmandu**.";
  if (/capital.*italy/.test(lower)) return "Capital of Italy: **Rome**.";
  if (/capital.*spain/.test(lower)) return "Capital of Spain: **Madrid**.";

  if (/tallest.*mountain|mount everest|everest/.test(lower)) {
    return "**Mount Everest** = **8,848.86 m** (29,031.7 ft). Nepal-Tibet border. First climbed: **Edmund Hillary & Tenzing Norgay** on 29 May 1953. About 10,000+ people have attempted.";
  }

  if (/largest.*country|biggest country/.test(lower)) {
    return "Largest countries by area:\n1. **Russia** — 17.1M km²\n2. **Canada** — 10M km²\n3. **USA** — 9.8M km²\n4. **China** — 9.6M km²\n5. **Brazil** — 8.5M km²\n7. **India** — 3.3M km²";
  }

  if (/most populous|population.*country|largest.*population/.test(lower)) {
    return "Most populous countries (2024):\n1. **India** — 1.44 billion (overtook China in 2023!)\n2. **China** — 1.41 billion\n3. **USA** — 340 million\n4. **Indonesia** — 280 million\n5. **Pakistan** — 240 million";
  }

  if (/world war 2|ww2/.test(lower)) {
    return "**WW2 (1939–1945):**\n- Started: Germany invaded Poland Sep 1, 1939\n- USA entered after Pearl Harbor (Dec 7, 1941)\n- D-Day: Normandy landing Jun 6, 1944\n- Germany surrendered: May 8, 1945\n- Japan surrendered: Aug 15, 1945 (atomic bombs)\n- Deaths: ~70–85 million\n- Led to formation of United Nations";
  }

  if (/world war 1|ww1/.test(lower)) {
    return "**WW1 (1914–1918)** — The Great War:\n- Trigger: Assassination of Archduke Franz Ferdinand (Jun 28, 1914)\n- ~20 million deaths\n- Ended with Treaty of Versailles (1919)\n- Collapsed Ottoman, Austro-Hungarian, Russian, German empires";
  }

  if (/united nations|\bun\b.*organization/.test(lower)) {
    return "**United Nations (UN)** — founded 1945. HQ: New York. Members: **193 countries**. Permanent Security Council: USA, UK, France, China, Russia. Agencies: WHO, UNESCO, UNICEF, IMF, World Bank.";
  }

  if (/olympics|olympic games/.test(lower)) {
    return "**Olympics** — held every 4 years. Summer + Winter editions.\n- Ancient Greece origin (776 BC)\n- Modern Olympics revived 1896 in Athens\n- 2024: **Paris, France**\n- India's best: Neeraj Chopra (Javelin Gold, Tokyo 2020)\n- Most gold medals ever: USA";
  }

  // ---- TECHNOLOGY ----
  if (/what is.*internet|how.*internet/.test(lower)) {
    return "**Internet** — global computer network. Key facts:\n- Origin: ARPANET (1969, US military)\n- WWW invented by **Tim Berners-Lee** (1989)\n- Uses **TCP/IP** protocol\n- India: 2nd most internet users (~700M)\n- DNS converts domain names to IP addresses";
  }

  if (/artificial intelligence|machine learning|\bai\b.*mean/.test(lower)) {
    return "**Artificial Intelligence (AI)** — computers simulating human intelligence.\n\n1. **Machine Learning** — learns from data\n2. **Deep Learning** — neural networks\n3. **NLP** — language (ChatGPT, Gemini)\n4. **Computer Vision** — image understanding\n5. **Robotics** — AI-powered machines\n\nUsed in: Google Search, Netflix, Siri, self-driving cars, medical diagnosis.";
  }

  if (/blockchain|bitcoin|cryptocurrency/.test(lower)) {
    return "**Blockchain** — decentralized digital ledger. **Bitcoin** (2009) first cryptocurrency.\n- Data in immutable 'blocks'\n- No central authority\n- Ethereum: smart contracts\n- India taxes crypto at 30%\n- Bitcoin creator: pseudonymous **Satoshi Nakamoto**";
  }

  if (/5g/.test(lower)) {
    return "**5G** — 5th generation mobile network.\n- Speed: up to 20 Gbps\n- Latency: <1 millisecond\n- Supports IoT, autonomous vehicles, smart cities\n- India launched 5G: October 2022\n- Providers: Jio, Airtel";
  }

  if (/chatgpt|openai|gpt/.test(lower)) {
    return "**ChatGPT** by **OpenAI** — launched Nov 2022. Uses GPT-4 model. Reached **100 million users in 2 months** — fastest-growing app ever. Can write code, essays, answer questions, translate.";
  }

  if (/deepseek/.test(lower)) {
    return "**DeepSeek** — Chinese AI company. DeepSeek-R1 (2025) matched top US models at far lower cost. Open-source. Caused major disruption in the AI industry.";
  }

  if (/gemini|google.*ai/.test(lower)) {
    return "**Google Gemini** (formerly Bard) — Google's AI assistant. Multimodal: understands text, images, audio, video. Competes with ChatGPT.";
  }

  // ---- CODING ----
  if (/hello.*world|first.*program/.test(lower)) {
    return 'Hello World in multiple languages:\n\n```python\nprint("Hello, World!")  # Python\n```\n```javascript\nconsole.log("Hello, World!");  // JavaScript\n```\n```java\nSystem.out.println("Hello, World!");  // Java\n```';
  }

  if (/python/.test(lower)) {
    if (/reverse.*string|string.*reverse/.test(lower)) {
      return 'Reverse string in Python:\n\n```python\ntext = "Hello, Om.ai!"\nreversed_text = text[::-1]\nprint(reversed_text)  # !ia.mO ,olleH\n```\n\n`[::-1]` slicing is the most Pythonic approach.';
    }
    if (/fibonacci|fib/.test(lower)) {
      return "Fibonacci in Python:\n\n```python\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint([fibonacci(i) for i in range(10)])\n# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n```";
    }
    if (/sort/.test(lower)) {
      return "Sorting in Python:\n\n```python\nnums = [3, 1, 4, 1, 5, 9, 2, 6]\nsorted_asc = sorted(nums)           # ascending\nsorted_desc = sorted(nums, reverse=True)  # descending\nnums.sort()  # in-place sort\n```";
    }
    if (/list.*comprehension|comprehension/.test(lower)) {
      return "Python list comprehension:\n\n```python\n# Basic\nsquares = [x**2 for x in range(10)]\n\n# With condition\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Nested\nmatrix = [[i*j for j in range(3)] for i in range(3)]\n```";
    }
    return 'Python — powerful, beginner-friendly language:\n\n```python\ndata = [3, 1, 4, 1, 5, 9, 2, 6]\nprint(f"Sum: {sum(data)}")\nprint(f"Avg: {sum(data)/len(data):.2f}")\nprint(f"Max: {max(data)}, Min: {min(data)}")\nevens = [x for x in data if x % 2 == 0]\nprint(f"Evens: {evens}")\n```\n\nUsed in: AI/ML, web dev (Django/Flask), data science, automation.';
  }

  if (/javascript|\bjs\b|typescript|\bts\b/.test(lower)) {
    return "JavaScript/TypeScript:\n\n```typescript\nasync function fetchData(url: string) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return await res.json();\n  } catch (err) {\n    console.error('Error:', err);\n    return null;\n  }\n}\n\n// Array methods\nconst nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconst evens = nums.filter(n => n % 2 === 0);\nconst sum = nums.reduce((a, b) => a + b, 0);\n```";
  }

  if (/react|jsx|tsx|\bhook\b/.test(lower)) {
    return "React with hooks:\n\n```tsx\nimport { useState, useEffect } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `Count: ${count}`;\n  }, [count]);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>+</button>\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}\n```";
  }

  if (/css|flexbox|grid/.test(lower)) {
    return "Modern CSS centering:\n\n```css\n/* Grid - most concise */\n.container {\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n}\n\n/* Flexbox */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n/* Responsive grid */\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1.5rem;\n}\n```";
  }

  if (/html.*basic|what is html/.test(lower)) {
    return 'HTML basics:\n\n```html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>Welcome to my site!</p>\n  <a href="https://example.com">Link</a>\n  <button onclick="alert(\'Hi!\')">Click me</button>\n</body>\n</html>\n```';
  }

  if (/git|version control/.test(lower)) {
    return 'Git essential commands:\n\n```bash\ngit init              # Initialize repo\ngit clone <url>       # Clone repo\ngit add .             # Stage all\ngit commit -m "msg"   # Commit\ngit push              # Push to remote\ngit pull              # Get latest\ngit branch            # List branches\ngit checkout -b new   # New branch\ngit merge branch      # Merge\ngit log --oneline     # History\n```';
  }

  if (/sql|database|mysql|postgres/.test(lower)) {
    return "SQL basics:\n\n```sql\n-- Create table\nCREATE TABLE users (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100),\n  email VARCHAR(100) UNIQUE,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\n-- Query\nSELECT * FROM users WHERE name LIKE 'A%';\n\n-- Join\nSELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id;\n```";
  }

  // ---- HEALTH ----
  if (/heart.*beat|heart.*rate/.test(lower)) {
    return "Human heart beats **60–100 times/minute** at rest. Lifetime: ~2.5 billion beats. Pumps **5 liters/minute**. Athletes: 40–60 bpm (stronger heart). Fast heart rate (>100 bpm) = tachycardia.";
  }

  if (/how many.*bone|bones.*human/.test(lower)) {
    return "Adult humans have **206 bones**. Babies: ~270-300 (fuse during growth). Smallest: **stapes** (ear, 3mm). Longest: **femur** (thigh). Strongest: **jawbone**.";
  }

  if (/vitamin/.test(lower)) {
    return "Essential vitamins:\n- **A** — Vision (carrots, sweet potato)\n- **B12** — Brain, nerves (meat, dairy)\n- **C** — Immunity (citrus, amla — highest C content!)\n- **D** — Bones (sunlight, fish)\n- **E** — Antioxidant (nuts, seeds)\n- **K** — Blood clotting (leafy greens)";
  }

  if (/blood.*group|blood type/.test(lower)) {
    return "Human blood types:\n- **A, B, AB, O** — based on antigens\n- **O negative** = universal donor\n- **AB positive** = universal recipient\n- Most common in India: **B+ and O+**\n- Blood type is inherited from parents";
  }

  // ---- FOOD ----
  if (
    /biryani|butter chicken|paneer|samosa|dal|chapati|roti|dosa|curry/.test(
      lower,
    )
  ) {
    return "Famous Indian dishes:\n\n🍛 **Biryani** — fragrant spiced rice\n🍗 **Butter Chicken** — creamy tomato curry\n🧀 **Paneer Tikka** — grilled cottage cheese\n🥟 **Samosa** — crispy fried pastry\n🫓 **Dal Makhani** — slow-cooked lentils\n🥞 **Dosa** — South Indian crispy crepe\n🍞 **Roti** — whole wheat flatbread\n\nIndia's cuisine varies massively by region — 28 states, 28 different food cultures!";
  }

  // ---- JOKES ----
  if (/joke|funny|make me laugh|comedy/.test(lower)) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs! 😄",
      "Why did the computer go to school? To improve its byte! 💻",
      "A SQL query walks into a bar, approaches two tables: 'Can I JOIN you?' 😂",
      "Why do Java programmers wear glasses? Because they don't C#! 🤓",
      "How many programmers to change a light bulb? None — that's a hardware problem! 💡",
      "Why was the math book sad? Too many problems! 📚",
      "Why can't you trust an atom? Because they make up everything! ⚛️",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // ---- TIME ----
  if (/what.*time|current time|what.*date|today.*date|aaj.*date/.test(lower)) {
    const now = new Date();
    return `Current date/time: **${now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })}** (IST)`;
  }

  // ---- MOTIVATION ----
  if (/motivat|inspire|sad|depressed|feeling down|demotivat/.test(lower)) {
    const quotes = [
      '"The only way to do great work is to love what you do." — Steve Jobs\n\nEvery expert was once a beginner. Keep going! 💪',
      '"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill 🌟',
      '"Believe you can and you\'re halfway there." — Theodore Roosevelt ✨',
      '"Koshish karne walon ki kabhi haar nahi hoti" — Harivansh Rai Bachchan 🇮🇳',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // ---- HINDI ----
  if (/kya.*ho|kaise.*ho|sab.*theek|kya.*hua/.test(lower)) {
    return "Sab theek hai! Main Om hoon — Om.ai ka AI assistant. Koi bhi sawaal poochh sakte hain: GK, coding, science, maths, ya koi bhi topic!";
  }

  // ---- WHAT IS / EXPLAIN ----
  if (/what is|explain|define|tell me about/.test(lower)) {
    const topic = lower
      .replace(/what is|explain|define|tell me about/, "")
      .trim();
    if (topic.length > 2) {
      return `**${topic.charAt(0).toUpperCase() + topic.slice(1)}** is an important concept. Here's what I know:\n\nThis topic has several key aspects worth exploring. For the most accurate and detailed answer, please ask more specifically:\n\n- "Explain ${topic} in science"\n- "What is ${topic} in mathematics"\n- "History of ${topic}"\n\nI'll give you a much better targeted answer!`;
    }
  }

  // ---- DEFAULT ----
  return `I understand you asked: **"${input}"**\n\nI can help with many topics! Try asking:\n\n**🇮🇳 India:** capitals, history, cricket, Bollywood, ISRO, festivals\n**🔬 Science:** physics, chemistry, biology, space\n**🧮 Maths:** calculations, formulas, prime numbers\n**💻 Coding:** Python, JavaScript, React, CSS, Git\n**🌍 World:** capitals, world records, history\n**🤖 Tech:** AI, internet, blockchain, 5G\n\nAsk with more detail for a better answer!`;
}
