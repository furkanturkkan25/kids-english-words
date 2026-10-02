/**
 * Cambridge Young Learners (Starters + Movers + Flyers) tabanlı geniş kelime kaynağı.
 * Kelimeler internetten çekilir; görseller Wikipedia üzerinden gelir.
 */

const YLE_CSV_URL =
  "https://raw.githubusercontent.com/ozbonus/yle-vocabulary-dataset/main/yle-vocabulary-dataset.csv";

/** Tema sırası ve Türkçe başlıklar */
const THEME_META = [
  { key: "animals", title: "Hayvanlar" },
  { key: "food_and_drink", title: "Yiyecek & içecek" },
  { key: "colours", title: "Renkler" },
  { key: "body_and_face", title: "Vücut" },
  { key: "clothes", title: "Kıyafetler" },
  { key: "home", title: "Ev" },
  { key: "toys", title: "Oyuncaklar" },
  { key: "transport", title: "Taşıtlar" },
  { key: "sports_and_leisure", title: "Oyun & spor" },
  { key: "world_around_us", title: "Doğa" },
  { key: "weather", title: "Hava" },
  { key: "school", title: "Okul" },
  { key: "places_and_directions", title: "Yerler" },
  { key: "work", title: "Meslekler" },
  { key: "health", title: "Sağlık" },
  { key: "materials", title: "Nesneler" },
];

/**
 * Fotoğraflanamayan, soyut, aile adı veya konuşması zor kelimeler.
 * (Cambridge listesinden elenenler)
 */
const SKIP_WORDS = new Set([
  "thing", "people", "person", "man", "men", "woman", "women", "child", "children", "boy", "girl",
  "baby", "friend", "family", "dad", "mum", "mom", "mother", "father", "brother", "sister", "cousin",
  "aunt", "uncle", "grandpa", "grandma", "grandfather", "grandmother", "grandparent", "grandson",
  "granddaughter", "daughter", "son", "parent", "husband", "wife", "classmate", "kid", "someone",
  "something", "everybody", "everyone", "nobody", "morning", "afternoon", "evening", "night", "day",
  "today", "yesterday", "tomorrow", "weekend", "birthday", "holiday", "hobby", "english", "name",
  "letter", "sentence", "story", "sport", "colour", "color", "number", "food", "drink", "breakfast",
  "lunch", "dinner", "home", "school", "work", "shop", "store", "classroom", "playground", "street",
  "town", "city", "country", "world", "weather", "favourite", "favorite", "alien", "monster", "robot",
  "ghost", "answer", "ask", "example", "question", "part", "right", "word", "line", "page", "lesson",
  "class", "music", "cross", "tick", "correct", "draw", "painting", "drawing", "walk", "song", "game",
  "pet", "animal", "tail", "body", "face", "smile", "hair", "alphabet", "teacher", "end", "start",
  "age", "fun", "love", "idea", "problem", "difference", "message", "text", "website", "internet",
  "email", "address", "password", "money", "pocket", "price", "sale", "market", "supermarket",
  "cinema", "theatre", "theater", "museum", "hospital", "factory", "office", "station", "airport",
  "hotel", "restaurant", "cafe", "café", "library", "pool", "here", "there", "try", "eat", "fruit",
  "meat", "clothes", "room", "floor", "wall", "toy", "hall", "break", "homework", "mistake", "band",
  "comic", "dvd", "goal", "movie", "party", "player", "practice", "present", "score", "video",
  "driver", "ticket", "trip", "cold", "cough", "cry", "matter", "temperature", "earache", "headache",
  "toothache", "downstairs", "upstairs", "stair", "model", "center", "centre", "circle", "square",
  "straight", "map", "building", "countryside", "ground", "o'clock", "o’clock", "friday", "monday",
  "saturday", "sunday", "thursday", "tuesday", "wednesday", "mustache", "moustache", "beard", "back",
  "net", "sauce", "vegetable", "milkshake", "picnic", "space", "time", "way", "place", "year", "week",
  "month", "hour", "minute", "second", "pair", "group", "team", "kind", "sort", "bit", "lot", "half",
  "quarter", "piece", "side", "top", "bottom", "middle", "front", "left", "north", "south", "east",
  "west", "language", "subject", "exam", "test", "mark", "grade", "project", "program", "programme",
  "channel", "screen", "click", "file", "folder", "app", "chat", "call", "ring", "invite", "guest",
  "host", "owner", "member", "neighbour", "neighbor", "stranger", "crowd", "queen", "king", "prince",
  "princess", "castle", "flag", "government", "president", "police", "army", "war", "peace", "law",
  "rule", "right", "wrong", "truth", "lie", "secret", "dream", "wish", "hope", "fear", "feel",
  "feeling", "mind", "thought", "memory", "history", "future", "past", "present", "life", "death",
  "god", "religion", "art", "science", "math", "maths", "geography", "biology", "chemistry", "physics",
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
  "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  "thirty", "forty", "fifty", "hundred", "thousand", "million", "zero", "first", "second", "third",
]);

/** CSV'de teması boş kalan görsel kelimeleri doğru temaya yerleştir */
const EXTRA_BY_THEME = {
  animals: ["dolphin", "kangaroo", "kitten", "lion", "panda", "parrot", "penguin", "puppy", "rabbit", "shark", "snail", "whale", "fly", "bat", "fox", "owl", "butterfly", "camel", "swan", "turtle"],
  food_and_drink: ["cheese", "coffee", "tea", "soup", "salad", "sandwich", "pasta", "noodles", "pancake", "pizza", "yogurt", "honey", "butter", "sugar", "salt", "pepper", "oil", "flour", "biscuit", "cookie", "jam", "cereal", "steak", "icecream"],
  clothes: ["boots", "coat", "helmet", "scarf", "sweater", "swimsuit", "tie", "belt", "glove", "gloves", "uniform", "pyjamas", "pajamas", "cap", "umbrella"],
  home: ["apartment", "box", "mat", "blanket", "towel", "roof", "balcony", "basement", "laptop", "fridge", "freezer", "oven", "microwave", "sink", "toilet", "pillow", "shelf", "curtain", "vase", "candle"],
  toys: ["doll", "kite", "puzzle", "lego", "dice", "card"],
  transport: ["bus", "ship", "tractor", "taxi", "van", "ambulance", "firetruck", "subway", "metro", "ferry"],
  world_around_us: ["sun", "sea", "sand", "shell", "tree", "flower", "park", "garden", "zoo", "farm", "moon", "rock", "star", "waterfall", "wave", "jungle", "road", "island", "forest", "river", "lake", "mountain", "hill", "field", "grass", "plant", "leaf", "bridge", "cave", "desert", "beach"],
  weather: ["sun", "cloud", "ice", "rain", "rainbow", "sky", "snow", "wind", "storm", "fog"],
  school: ["bag", "bookshop", "glue", "scissors", "sharpener", "notebook", "diary", "calendar"],
  sports_and_leisure: ["skateboard", "scooter", "swing", "slide", "camera", "microphone"],
  places_and_directions: ["park", "farm", "circus", "funfair", "zoo", "beach", "bridge", "castle", "church", "mosque", "temple", "stadium", "gym", "bank", "pharmacy"],
  work: ["clown", "cook", "farmer", "pirate", "doctor", "nurse", "dentist", "pilot", "singer", "actor", "artist", "waiter", "chef", "firefighter", "builder"],
  health: ["doctor", "nurse", "dentist", "ambulance", "medicine", "bandage"],
  materials: ["paper", "wood", "metal", "plastic", "glass", "stone", "gold", "silver", "wool", "cotton", "rubber"],
  body_and_face: ["neck", "shoulder", "stomach", "tooth", "teeth", "knee", "finger", "toe", "thumb", "elbow", "chin", "cheek", "lip", "tongue"],
  colours: ["gold", "silver"],
};

const WORDS_PER_LEVEL = 5;

/** Wikipedia sayfa başlığı düzeltmeleri (daha iyi fotoğraf için) */
const WIKI_TITLES = {
  plane: "Airplane",
  bike: "Bicycle",
  teddy: "Teddy bear",
  pants: "Trousers",
  jeans: "Jeans",
  hippo: "Hippopotamus",
  motorbike: "Motorcycle",
  soccer: "Association football",
  candy: "Candy",
  gray: "Grey",
  fries: "French fries",
  orange: "Orange",
  bat: "Bat",
  fly: "Fly",
  glasses: "Glasses",
  watch: "Wristwatch",
  mouse: "House mouse",
  chicken: "Chicken",
  duck: "Duck",
  bean: "Bean",
  pea: "Pea",
  pie: "Pie",
  bath: "Bathtub",
  board: "Whiteboard",
  bag: "Schoolbag",
  park: "Park",
  garden: "Garden",
  farm: "Farm",
  zoo: "Zoo",
  flower: "Flower",
  tree: "Tree",
  sand: "Sand",
  shell: "Seashell",
  sea: "Sea",
  sun: "Sun",
  foot: "Foot",
  hand: "Hand",
  eye: "Eye",
  ear: "Ear",
  nose: "Nose",
  mouth: "Mouth",
  head: "Head",
  arm: "Arm",
  leg: "Leg",
  red: "Red",
  blue: "Blue",
  green: "Green",
  yellow: "Yellow",
  pink: "Pink",
  black: "Black",
  white: "White",
  brown: "Brown",
  purple: "Purple",
  ice: "Ice",
  rain: "Rain",
  rainbow: "Rainbow",
  sky: "Sky",
  snow: "Snow",
  wind: "Wind",
  moon: "Moon",
  star: "Star",
  rock: "Rock (geology)",
  wave: "Wind wave",
  waterfall: "Waterfall",
  jungle: "Jungle",
  road: "Road",
  island: "Island",
  forest: "Forest",
  river: "River",
  lake: "Lake",
  mountain: "Mountain",
  hill: "Hill",
  grass: "Grass",
  plant: "Plant",
  leaf: "Leaf",
  bridge: "Bridge",
  cave: "Cave",
  desert: "Desert",
  pizza: "Pizza",
  yogurt: "Yogurt",
  honey: "Honey",
  butter: "Butter",
  sugar: "Sugar",
  salt: "Salt",
  pepper: "Black pepper",
  oil: "Cooking oil",
  flour: "Flour",
  biscuit: "Biscuit",
  cookie: "Cookie",
  jam: "Jam",
  cereal: "Cereal",
  steak: "Steak",
  icecream: "Ice cream",
  puppy: "Puppy",
  kitten: "Kitten",
  panda: "Giant panda",
  parrot: "Parrot",
  penguin: "Penguin",
  dolphin: "Dolphin",
  whale: "Whale",
  shark: "Shark",
  rabbit: "Rabbit",
  kangaroo: "Kangaroo",
  lion: "Lion",
  snail: "Snail",
  butterfly: "Butterfly",
  owl: "Owl",
  fox: "Fox",
  camel: "Camel",
  swan: "Swan",
  turtle: "Turtle",
  tractor: "Tractor",
  taxi: "Taxicab",
  van: "Van",
  ambulance: "Ambulance",
  subway: "Rapid transit",
  ferry: "Ferry",
  scooter: "Kick scooter",
  swing: "Swing (seat)",
  slide: "Playground slide",
  fridge: "Refrigerator",
  oven: "Oven",
  microwave: "Microwave oven",
  sink: "Sink",
  toilet: "Toilet",
  pillow: "Pillow",
  shelf: "Shelf",
  curtain: "Curtain",
  vase: "Vase",
  candle: "Candle",
  puzzle: "Jigsaw puzzle",
  glue: "Adhesive",
  scissors: "Scissors",
  notebook: "Notebook",
  diary: "Diary",
  calendar: "Calendar",
  dentist: "Dentist",
  doctor: "Physician",
  nurse: "Nurse",
  pilot: "Aircraft pilot",
  singer: "Singing",
  actor: "Actor",
  artist: "Artist",
  waiter: "Waiter",
  chef: "Chef",
  firefighter: "Firefighter",
  builder: "Construction worker",
  clown: "Clown",
  cook: "Cooking",
  farmer: "Farmer",
  pirate: "Pirate",
  circus: "Circus",
  funfair: "Funfair",
  castle: "Castle",
  church: "Church (building)",
  mosque: "Mosque",
  temple: "Temple",
  stadium: "Stadium",
  gym: "Gym",
  bank: "Bank",
  pharmacy: "Pharmacy",
  medicine: "Pharmaceutical drug",
  bandage: "Bandage",
  wood: "Wood",
  metal: "Metal",
  plastic: "Plastic",
  stone: "Rock (geology)",
  gold: "Gold",
  silver: "Silver",
  wool: "Wool",
  cotton: "Cotton",
  rubber: "Natural rubber",
  neck: "Neck",
  shoulder: "Shoulder",
  stomach: "Stomach",
  tooth: "Tooth",
  knee: "Knee",
  finger: "Finger",
  toe: "Toe",
  thumb: "Thumb",
  elbow: "Elbow",
  chin: "Chin",
  cheek: "Cheek",
  lip: "Lip",
  tongue: "Tongue",
  coat: "Coat (clothing)",
  helmet: "Helmet",
  scarf: "Scarf",
  sweater: "Sweater",
  swimsuit: "Swimsuit",
  belt: "Belt (clothing)",
  glove: "Glove",
  gloves: "Glove",
  uniform: "Uniform",
  cap: "Cap",
  umbrella: "Umbrella",
  laptop: "Laptop",
  blanket: "Blanket",
  towel: "Towel",
  roof: "Roof",
  balcony: "Balcony",
  basement: "Basement",
  apartment: "Apartment",
  boots: "Boot",
  box: "Box",
  mat: "Mat",
  coffee: "Coffee",
  tea: "Tea",
  soup: "Soup",
  salad: "Salad",
  sandwich: "Sandwich",
  pasta: "Pasta",
  noodles: "Noodle",
  pancake: "Pancake",
  bottle: "Bottle",
  bowl: "Bowl",
  cup: "Cup",
  plate: "Plate (dishware)",
  cloud: "Cloud",
  storm: "Storm",
  fog: "Fog",
  field: "Field (agriculture)",
  microphone: "Microphone",
  bookshop: "Bookstore",
  firetruck: "Fire engine",
  metro: "Rapid transit",
  pyjamas: "Pajamas",
  pajamas: "Pajamas",
  tie: "Necktie",
  lego: "Lego",
  dice: "Dice",
  card: "Playing card",
  sharpener: "Pencil sharpener",
};

/** Çevrimdışı / API hatası için hazır Türkçe karşılıklar */
const TR_FALLBACK = {
  cat: "kedi",
  dog: "köpek",
  bird: "kuş",
  fish: "balık",
  frog: "kurbağa",
  duck: "ördek",
  horse: "at",
  bear: "ayı",
  monkey: "maymun",
  elephant: "fil",
  tiger: "kaplan",
  cow: "inek",
  sheep: "koyun",
  bee: "arı",
  snake: "yılan",
  spider: "örümcek",
  zebra: "zebra",
  giraffe: "zürafa",
  mouse: "fare",
  goat: "keçi",
  chicken: "tavuk",
  crocodile: "timsah",
  donkey: "eşek",
  hippo: "su aygırı",
  lizard: "kertenkele",
  jellyfish: "denizanası",
  apple: "elma",
  banana: "muz",
  grape: "üzüm",
  pear: "armut",
  lemon: "limon",
  mango: "mango",
  kiwi: "kivi",
  orange: "portakal",
  pineapple: "ananas",
  watermelon: "karpuz",
  egg: "yumurta",
  milk: "süt",
  bread: "ekmek",
  cake: "pasta",
  carrot: "havuç",
  tomato: "domates",
  potato: "patates",
  onion: "soğan",
  rice: "pirinç",
  juice: "meyve suyu",
  water: "su",
  cheese: "peynir",
  burger: "hamburger",
  sausage: "sosis",
  chocolate: "çikolata",
  candy: "şeker",
  coconut: "hindistan cevizi",
  bean: "fasulye",
  pea: "bezelye",
  lime: "misket limonu",
  pie: "turta",
  red: "kırmızı",
  blue: "mavi",
  green: "yeşil",
  yellow: "sarı",
  pink: "pembe",
  black: "siyah",
  white: "beyaz",
  brown: "kahverengi",
  purple: "mor",
  gray: "gri",
  hand: "el",
  foot: "ayak",
  eye: "göz",
  ear: "kulak",
  nose: "burun",
  mouth: "ağız",
  head: "kafa",
  arm: "kol",
  leg: "bacak",
  hair: "saç",
  face: "yüz",
  smile: "gülümseme",
  hat: "şapka",
  shoe: "ayakkabı",
  sock: "çorap",
  shirt: "gömlek",
  dress: "elbise",
  jacket: "ceket",
  skirt: "etek",
  pants: "pantolon",
  jeans: "kot pantolon",
  glasses: "gözlük",
  watch: "saat",
  shorts: "şort",
  bed: "yatak",
  chair: "sandalye",
  table: "masa",
  door: "kapı",
  window: "pencere",
  clock: "saat",
  lamp: "lamba",
  sofa: "kanepe",
  mirror: "ayna",
  phone: "telefon",
  book: "kitap",
  desk: "masa",
  rug: "halı",
  camera: "kamera",
  radio: "radyo",
  cupboard: "dolap",
  bath: "küvet",
  house: "ev",
  ball: "top",
  balloon: "balon",
  car: "araba",
  bus: "otobüs",
  train: "tren",
  bike: "bisiklet",
  boat: "tekne",
  plane: "uçak",
  truck: "kamyon",
  ship: "gemi",
  helicopter: "helikopter",
  teddy: "oyuncak ayı",
  kite: "uçurtma",
  doll: "bebek",
  guitar: "gitar",
  piano: "piyano",
  tennis: "tenis",
  soccer: "futbol",
  baseball: "beyzbol",
  basketball: "basketbol",
  beach: "plaj",
  photo: "fotoğraf",
  skateboard: "kaykay",
  sun: "güneş",
  sea: "deniz",
  sand: "kum",
  shell: "deniz kabuğu",
  tree: "ağaç",
  flower: "çiçek",
  park: "park",
  garden: "bahçe",
  zoo: "hayvanat bahçesi",
  farm: "çiftlik",
  pen: "kalem",
  pencil: "kurşun kalem",
  crayon: "pastel boya",
  eraser: "silgi",
  ruler: "cetvel",
  paper: "kâğıt",
  computer: "bilgisayar",
  keyboard: "klavye",
  poster: "poster",
  bag: "çanta",
  board: "tahta",
  dolphin: "yunus",
  kangaroo: "kanguru",
  kitten: "yavru kedi",
  lion: "aslan",
  panda: "panda",
  parrot: "papağan",
  penguin: "penguen",
  puppy: "yavru köpek",
  rabbit: "tavşan",
  shark: "köpekbalığı",
  snail: "salyangoz",
  whale: "balina",
  fly: "sinek",
  bat: "yarasa",
  fox: "tilki",
  owl: "baykuş",
  butterfly: "kelebek",
  camel: "deve",
  swan: "kuğu",
  turtle: "kaplumbağa",
  cheese: "peynir",
  coffee: "kahve",
  tea: "çay",
  soup: "çorba",
  salad: "salata",
  sandwich: "sandviç",
  pasta: "makarna",
  noodles: "erişte",
  pancake: "pancake",
  pizza: "pizza",
  yogurt: "yoğurt",
  honey: "bal",
  butter: "tereyağı",
  sugar: "şeker",
  salt: "tuz",
  pepper: "biber",
  oil: "yağ",
  flour: "un",
  biscuit: "bisküvi",
  cookie: "kurabiye",
  jam: "reçel",
  cereal: "mısır gevreği",
  steak: "biftek",
  icecream: "dondurma",
  bottle: "şişe",
  bowl: "kase",
  cup: "fincan",
  plate: "tabak",
  boots: "bot",
  coat: "palto",
  helmet: "kask",
  scarf: "atkı",
  sweater: "kazak",
  swimsuit: "mayo",
  tie: "kravat",
  belt: "kemer",
  glove: "eldiven",
  gloves: "eldiven",
  uniform: "üniforma",
  cap: "kep",
  umbrella: "şemsiye",
  apartment: "daire",
  box: "kutu",
  mat: "paspas",
  blanket: "battaniye",
  towel: "havlu",
  roof: "çatı",
  balcony: "balkon",
  basement: "bodrum",
  laptop: "dizüstü",
  fridge: "buzdolabı",
  freezer: "derin dondurucu",
  oven: "fırın",
  microwave: "mikrodalga",
  sink: "lavabo",
  toilet: "tuvalet",
  pillow: "yastık",
  shelf: "raf",
  curtain: "perde",
  vase: "vazo",
  candle: "mum",
  puzzle: "yapboz",
  lego: "lego",
  dice: "zar",
  card: "iskambil",
  tractor: "traktör",
  taxi: "taksi",
  van: "van",
  ambulance: "ambulans",
  firetruck: "itfaiye arabası",
  subway: "metro",
  metro: "metro",
  ferry: "feribot",
  moon: "ay",
  rock: "kaya",
  star: "yıldız",
  waterfall: "şelale",
  wave: "dalga",
  jungle: "orman",
  road: "yol",
  island: "ada",
  forest: "orman",
  river: "nehir",
  lake: "göl",
  mountain: "dağ",
  hill: "tepe",
  field: "tarla",
  grass: "çimen",
  plant: "bitki",
  leaf: "yaprak",
  bridge: "köprü",
  cave: "mağara",
  desert: "çöl",
  cloud: "bulut",
  ice: "buz",
  rain: "yağmur",
  rainbow: "gökkuşağı",
  sky: "gökyüzü",
  snow: "kar",
  wind: "rüzgar",
  storm: "fırtına",
  fog: "sis",
  glue: "yapıştırıcı",
  scissors: "makas",
  sharpener: "kalemtıraş",
  notebook: "defter",
  diary: "günlük",
  calendar: "takvim",
  bookshop: "kitapçı",
  scooter: "scooter",
  swing: "salıncak",
  slide: "kaydırak",
  microphone: "mikrofon",
  circus: "sirk",
  funfair: "lunapark",
  castle: "kale",
  church: "kilise",
  mosque: "cami",
  temple: "tapınak",
  stadium: "stadyum",
  gym: "spor salonu",
  bank: "banka",
  pharmacy: "eczane",
  clown: "palyaço",
  cook: "aşçı",
  farmer: "çiftçi",
  pirate: "korsan",
  doctor: "doktor",
  nurse: "hemşire",
  dentist: "dişçi",
  pilot: "pilot",
  singer: "şarkıcı",
  actor: "aktör",
  artist: "sanatçı",
  waiter: "garson",
  chef: "şef",
  firefighter: "itfaiyeci",
  builder: "inşaatçı",
  medicine: "ilaç",
  bandage: "bandaj",
  wood: "ahşap",
  metal: "metal",
  plastic: "plastik",
  glass: "cam",
  stone: "taş",
  gold: "altın",
  silver: "gümüş",
  wool: "yün",
  cotton: "pamuk",
  rubber: "kauçuk",
  neck: "boyun",
  shoulder: "omuz",
  stomach: "karın",
  tooth: "diş",
  teeth: "dişler",
  knee: "diz",
  finger: "parmak",
  toe: "ayak parmağı",
  thumb: "başparmak",
  elbow: "dirsek",
  chin: "çene",
  cheek: "yanak",
  lip: "dudak",
  tongue: "dil",
  television: "televizyon",
  armchair: "koltuk",
  picture: "resim",
  kitchen: "mutfak",
  bathroom: "banyo",
  bedroom: "yatak odası",
  handbag: "el çantası",
  fries: "patates kızartması",
  lemonade: "limonata",
  meatballs: "köfte",
  badminton: "badminton",
  hockey: "hokey",
  fishing: "balık tutma",
  motorbike: "motosiklet",
  gray: "gri",
  pyjamas: "pijama",
  pajamas: "pijama",
};

/** Ağ yoksa kullanılan yedek seviyeler (Unsplash) */
const FALLBACK_LEVELS = [
  {
    id: 1,
    title: "Hayvanlar",
    words: [
      {
        en: "cat",
        tr: "kedi",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
        alt: "Kedi",
      },
      {
        en: "dog",
        tr: "köpek",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cd?auto=format&fit=crop&w=900&q=80",
        alt: "Köpek",
      },
      {
        en: "bird",
        tr: "kuş",
        image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=80",
        alt: "Kuş",
      },
      {
        en: "fish",
        tr: "balık",
        image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
        alt: "Balık",
      },
    ],
  },
];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function cleanWord(raw) {
  let word = String(raw || "").trim().toLowerCase();
  if (word.includes("(")) word = word.split("(")[0].trim();
  if (word.includes("/")) word = word.split("/")[0].trim();
  return word;
}

function extractKidNouns(rows) {
  /** @type {Map<string, Set<string>>} */
  const byTheme = new Map();
  THEME_META.forEach((t) => byTheme.set(t.key, new Set()));

  const used = new Set();

  function accept(word) {
    if (!word || used.has(word) || SKIP_WORDS.has(word)) return false;
    if (word.includes(" ") || word.includes("-")) return false;
    if (word.length < 3 || word.length > 14) return false;
    return true;
  }

  function add(themeKey, word) {
    if (!accept(word)) return;
    const set = byTheme.get(themeKey);
    if (!set) return;
    set.add(word);
    used.add(word);
  }

  for (const row of rows) {
    if (row.noun !== "TRUE" || row.names === "TRUE") continue;
    const isKidsLevel =
      row.starters === "TRUE" || row.movers === "TRUE" || row.flyers === "TRUE";
    if (!isKidsLevel) continue;

    const word = cleanWord(row.american || row.british);
    if (!accept(word)) continue;

    let placed = false;
    for (const theme of THEME_META) {
      if (row[theme.key] === "TRUE") {
        add(theme.key, word);
        placed = true;
        break;
      }
    }

    // Teması belirsiz ama görsel kelimeler ekstra listeden yerleştirilir
    if (!placed) {
      for (const [themeKey, list] of Object.entries(EXTRA_BY_THEME)) {
        if (list.includes(word)) {
          add(themeKey, word);
          break;
        }
      }
    }
  }

  // Elle eklenen çocuk kelimeleri (CSV'de eksik olsa bile)
  Object.entries(EXTRA_BY_THEME).forEach(([themeKey, list]) => {
    list.forEach((word) => add(themeKey, word));
  });

  // Taşıt kelimeleri toys sütununda da olabilir — transport'a taşı
  const toys = byTheme.get("toys");
  const transport = byTheme.get("transport");
  if (toys && transport) {
    ["car", "bus", "train", "bike", "boat", "plane", "truck", "ship", "helicopter", "motorbike"].forEach(
      (w) => {
        if (toys.has(w)) {
          toys.delete(w);
          transport.add(w);
        }
      }
    );
  }

  return byTheme;
}

function buildLevelsFromRows(rows) {
  const byTheme = extractKidNouns(rows);
  const levels = [];

  for (const theme of THEME_META) {
    const words = Array.from(byTheme.get(theme.key) || []).sort((a, b) => a.localeCompare(b));
    if (!words.length) continue;

    let part = 1;
    for (let i = 0; i < words.length; i += WORDS_PER_LEVEL) {
      const slice = words.slice(i, i + WORDS_PER_LEVEL);
      const manyParts = words.length > WORDS_PER_LEVEL;
      levels.push({
        id: levels.length + 1,
        title: manyParts ? `${theme.title} ${part}` : theme.title,
        words: slice.map((en) => ({
          en,
          tr: TR_FALLBACK[en] || en,
          image: "",
          alt: en,
        })),
      });
      part += 1;
    }
  }

  return levels;
}

function wikiTitleFor(word) {
  return WIKI_TITLES[word] || word.charAt(0).toUpperCase() + word.slice(1);
}

async function fetchCommonsImage(word) {
  const api =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrnamespace: "6",
      gsrlimit: "1",
      gsrsearch: word,
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "800",
    });
  const res = await fetch(api);
  if (!res.ok) throw new Error("commons");
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) throw new Error("no-pages");
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  const url = info?.thumburl || info?.url;
  if (!url) throw new Error("no-url");
  return url;
}

async function fetchWikiImage(word) {
  const title = wikiTitleFor(word);
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "KelimeBahcesi/2.0 (edu)" },
    });
    if (!res.ok) throw new Error("wiki");
    const data = await res.json();
    const image = data?.originalimage?.source || data?.thumbnail?.source || null;
    if (!image) throw new Error("no-image");
    return String(image).replace(/\/\d+px-/, "/800px-");
  } catch {
    try {
      return await fetchCommonsImage(word);
    } catch {
      return `https://picsum.photos/seed/${encodeURIComponent(word)}/800`;
    }
  }
}

async function fetchTurkish(word) {
  if (TR_FALLBACK[word]) return TR_FALLBACK[word];
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|tr`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("tr");
    const data = await res.json();
    const text = data?.responseData?.translatedText;
    if (!text || /INVALID/i.test(text)) throw new Error("bad");
    return String(text).toLowerCase();
  } catch {
    return word;
  }
}


export {
  THEME_META,
  WORDS_PER_LEVEL,
  TR_FALLBACK,
  WIKI_TITLES,
  FALLBACK_LEVELS,
  parseCsv,
  buildLevelsFromRows,
  wikiTitleFor,
  fetchWikiImage,
  fetchTurkish,
};

export async function buildLevelsFromNetwork() {
  const res = await fetch(YLE_CSV_URL);
  if (!res.ok) throw new Error("csv fetch failed");
  return buildLevelsFromRows(parseCsv(await res.text()));
}
