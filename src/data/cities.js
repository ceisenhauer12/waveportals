// src/data/cities.js
// Central place for all city + land data.

export const CITY_DB = {
  "north-chicago": {
    title: "North Chicago – US Navy RTC",
    blurb:
      "Great Lakes Naval Station gateway. Hospitality, graduation events, and family lodging funnels.",
    tags: ["Navy", "Hospitality", "Family Traffic"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/1714183257322253755729502084421709477194",
    coords: [42.3173, -87.8376],
    lands: [
      {
        id: "rtc-ceremonial-drill-hall",
        name: "RTC Ceremonial Drill Hall",
        blurb:
          "Graduation ceremonies hub; anchor for weekend surges and family itineraries.",
        channelId: "UCZuVv_Qnvp-2hIqwBIoq5Aw",
        videoUrl: "",
        fallbackVideoUrl: "https://www.youtube.com/watch?v=7l7a1uigRg4",
        affiliateUrl:
          "https://www.navygear.com/?utm_source=waveportals&utm_medium=affiliate&utm_campaign=rtc",
      },
      {
        id: "recruit-family-welcome-center",
        name: "Recruit Family Welcome Center",
        blurb:
          "Off-base ticketing and info hub for Navy graduation families. Pick up tickets, verify access, and plan your visit.",
        videoUrl: "",
        affiliateUrl: "",
        info: `
### Recruit Family Welcome Center – Graduation Guide
Information from [Official RTC site](https://www.bootcamp.navy.mil/Graduation/)

**Step 1: Security Access Form**
- All guests (age 3+) must be listed (max 4).  
- Submit by **Monday of graduation week** or no access.  
- [Online form link](https://forms.osi.apps.mil/Pages/ResponsePage.aspx?id=AD4z43fIh0u2rUXpQt4XUOyouc5PxTJBvrdVD4UdnLVUOFc2TlhZWVRBRU82Ujk1U1U3ODJNMFdMUCQlQCN0PWcu)  
- Only your recruit can update the guest list.  

**Step 2: Travel Planning**
- Hotels/transport: book your own.  
- Resources: [NavyLifeGL.com](https://www.navylifegl.com/rtc)  

**Step 3: Pick Up Tickets (Required)**
- Location: Navy Exchange Burkey Mall, 2650 Green Bay Rd, North Chicago, IL 60088.  
- Hours:  
  - Day before: 10:00 AM – 7:30 PM  
  - Day of: 5:30 AM – 8:30 AM  
- Valid REAL ID or passport required. No ticket = no base entry.  

**Step 4: Graduation Day (9:00–10:45 AM)**
- 6:30 AM – Gates + drill hall open (if driving arrive extra early recommended) 
- 9:00 AM – Ceremony begins (doors close, no late entry)  
- 10:45 AM – Ceremony ends  

**Base Access**
- Adults: photo ID. Minors: school ID, permit, or birth certificate.  
- Driving: license, registration, insurance/rental agreement, ticket.  
- Pedestrians: Gate 8 (by METRA).  

**Security**
- Allowed: small purse, camera bag, stroller, wheelchair/walker.  
- Not allowed: backpacks, large bags, flowers, signs, weapons, alcohol/drugs.  
- All people, bags, and vehicles subject to search.  

**After Graduation**
- Many Sailors transfer immediately to “A” school.  
- Ask your recruit directly about liberty/departure.  
        `,
      },
    ],
    affiliatesMapUrl:
      "https://www.google.com/maps/d/embed?mid=1A4ajxHJ6DaBCJoQm400Etczyfm7OEkc&ehbc=2E312F",
    featuredPartner: {
      label: "NavyGear — official merch",
      href: "https://www.navygear.com/?utm_source=waveportals&utm_medium=affiliate&utm_campaign=rtc",
      imgSrc: "/images/affiliates/navygear-banner.jpg",
      ctaLabel: "Shop NavyGear",
    },
    affiliates: [
      {
        category: "Hotels (Welcome Center / Drill Hall access)",
        items: [
          {
            name: "Hampton Inn Chicago North-Loyola",
            href: "https://maps.google.com/?q=Hampton+Inn+Chicago+North+Loyola",
          },
          {
            name: "Courtyard by Marriott Waukegan/Gurnee",
            href: "https://maps.google.com/?q=Courtyard+Waukegan",
          },
          {
            name: "Great Wolf Lodge Gurnee (family)",
            href: "https://maps.google.com/?q=Great+Wolf+Lodge+Gurnee",
          },
        ],
      },
      {
        category: "Food & Coffee (pre/post ceremony)",
        items: [
          {
            name: "Levée Lounge (Navy Exchange)",
            href: "https://www.mynavyexchange.com/",
          },
          {
            name: "Shanty Wadsworth",
            href: "https://maps.google.com/?q=The+Shanty+Wadsworth",
          },
          {
            name: "Upper Crust Bagel Co.",
            href: "https://maps.google.com/?q=Upper+Crust+Bagel+Waukegan",
          },
        ],
      },
      {
        category: "Essentials & Gear",
        items: [
          {
            name: "NavyGear (official)",
            href: "https://www.navygear.com/?utm_source=waveportals&utm_medium=affiliate&utm_campaign=rtc",
          },
          { name: "Target Gurnee", href: "https://maps.google.com/?q=Target+Gurnee" },
        ],
      },
    ],
  },

  "baden-at": {
    title: "Baden bei Wien, Austria – Spa & UNESCO",
    blurb:
      "Prestigious spa town with Roman spa heritage, UNESCO recognition, Casino Baden, and Beethoven history.",
    tags: ["UNESCO", "Casino", "Beethoven"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/101096994512716552136651044731009297320",
    coords: [48.005, 16.2309],
    lands: [
      {
        id: "casino-baden",
        name: "Casino Baden",
        blurb: "High-traffic entertainment anchor with regional draw.",
        videoUrl: "https://www.youtube.com/watch?v=TB4LEtAShe0",
        affiliateUrl: "https://www.casinos.at/casinos/baden",
      },
      {
        id: "beethovenhaus",
        name: "Beethovenhaus",
        blurb:
          "Historic residence & museum celebrating Beethoven’s summers in Baden where he composed Symphony #9 famously called Ode to Joy",
        videoUrl: "https://youtu.be/CLB5LanzHEc?feature=shared&t=3726",
        affiliateUrl: "",
      },
    ],
  },

  "varmdo-se": {
    title: "Värmdö (Viggsö Island), Sweden – ABBA cottage",
    blurb: "The ABBA cottage landmark in the Stockholm archipelago.",
    tags: ["ABBA", "Archipelago", "Pilgrimage"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/1981164889395449286388285702829111517",
    coords: [59.325, 18.716],
    lands: [
      {
        id: "viggso-abba-cottage",
        name: "Viggsö ABBA Cottage",
        blurb: "Iconic songwriting hideaway; essential ABBA stop.",
        videoUrl: "https://www.youtube.com/watch?v=FHDRRiX1now",
        affiliateUrl: "",
      },
    ],
  },

  "deadwood-sd": {
    title: "Deadwood, SD – Legendary Old West town",
    blurb: "Historic saloons and casinos in a Black Hills Old West setting.",
    tags: ["Old West", "Casinos", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/152919129197892936510323545052036063139",
    coords: [44.3767, -103.729],
    lands: [
      {
        id: "saloon-no-10",
        name: "Saloon No. 10 / Main Street",
        blurb: "Wild Bill lore + high foot traffic on Main.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "durant-ok": {
    title: "Durant, OK – Home of the Choctaw Indian Nation",
    blurb: "Cultural Center, Casino & Resort.",
    tags: ["Choctaw", "Casino", "Resort"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/3102497881153330170438973525061606546437",
    coords: [33.9934, -96.3971],
    lands: [
      {
        id: "choctaw-casino-resort",
        name: "Choctaw Casino & Resort",
        blurb: "Stay Awhile. Play Awhile",
        videoUrl: "https://www.youtube.com/watch?v=GP3MUj5O9Yw",
        affiliateUrl: "",
      },
      {
        id: "choctaw-cultural-center",
        name: "Choctaw Cultural Center",
        blurb: "Fascinating history of the Choctaw Indian Nation.",
        videoUrl: "https://www.youtube.com/watch?v=nnyqzGxGLXU",
        affiliateUrl: "",
      },
    ],
  },

  "galveston-tx": {
    title: "Galveston, TX – Gulf Coast tourism hub",
    blurb: "Beaches, cruises, and The Strand historic district.",
    tags: ["Beaches", "Cruises", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/3796720729377725520913484692403980473937",
    coords: [29.3013, -94.7977],
    lands: [
      {
        id: "the-strand",
        name: "The Strand Historic District @ Saengerfest Park",
        blurb:
          "Victorian-era downtown: brick-lined blocks of shops, museums, and nightlife.",
        videoUrl:
          "https://www.youtube.com/embed/QIBmMEbLtKw?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1",
        affiliateUrl: "",
      },
    ],
  },

  "roskilde-dk": {
    title: "Roskilde, Denmark – Festival city",
    blurb:
      "World-renowned for the Roskilde Festival; historic cathedral town.",
    tags: ["Festival", "Music", "Culture"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/3010604377317538654113723260261144075391",
    coords: [55.6419, 12.0804],
    lands: [
      {
        id: "roskilde-festival-grounds",
        name: "Roskilde Festival Grounds",
        blurb: "One of Europe’s largest music festivals.",
        videoUrl: "https://youtu.be/8MsWM5tNfQ4?si=1DzmXtfZaTkfy_MH",
        affiliateUrl: "",
      },
    ],
  },

  "cluj-napoca-ro": {
    title: "Cluj-Napoca, Romania – University & culture",
    blurb: "Major university center; home of the UNTOLD Festival.",
    tags: ["University", "Festival", "Tech"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/392837052132320215465070341702007820571",
    coords: [46.7712, 23.6236],
    lands: [
      {
        id: "cluj-arena-untold",
        name: "Cluj Arena / UNTOLD",
        blurb: "Festival epicenter with massive international draw.",
        videoUrl: "https://youtu.be/qV9uPUgvjWU?si=EDouF2dai6mvuxGU",
        affiliateUrl: "",
      },
    ],
  },

  "colmar-fr": {
    title: "Colmar, France – Alsace jewel",
    blurb: "Picturesque old town; inspiration for Beauty and the Beast.",
    tags: ["Alsace", "Old Town", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/50561775335783996739267028111362698303",
    coords: [48.079, 7.3585],
    lands: [
      {
        id: "little-venice",
        name: "Little Venice",
        blurb: "Iconic canals and timbered houses.",
        videoUrl: "https://www.youtube.com/watch?app=desktop&v=qJybMLaIF-4",
        affiliateUrl: "",
      },
    ],
  },

  "college-park-md": {
    title: "College Park, MD – University of Maryland",
    blurb: "Academia, research, and proximity to Washington, D.C.",
    tags: ["University", "Research", "DC Area"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/42171341694941743383174122333559370955",
    coords: [38.9807, -76.9369],
    lands: [
      {
        id: "xfinity-center",
        name: "Xfinity Center",
        blurb: "Maryland Terrapins arena and events hub.",
        videoUrl: "",
        affiliateUrl: "",
      },
      {
        id: "secu-stadium- Maryland Terrapins",
        name: "SECU Stadium — Football Game Day",
        blurb: "Football Stadium for Maryland Terrapins",
        videoUrl: "https://youtu.be/9q155EcabSs?t=676",
        affiliateUrl: "",
      },
    ],
  },

  "jeonju-kr": {
    title: "Jeonju, South Korea – UNESCO & food",
    blurb: "UNESCO-listed historic center; birthplace of bibimbap.",
    tags: ["UNESCO", "Food", "Hanok"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/2887003481325296536527846355464262990798",
    coords: [35.8242, 127.148],
    lands: [
      {
        id: "jeonju-hanok-village",
        name: "Jeonju Hanok Village",
        blurb: "Traditional architecture and culinary magnet.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "ostrava-cz": {
    title: "Ostrava, Czech Republic – Industry to culture",
    blurb: "Industrial city turned culture/tech hub.",
    tags: ["Tech", "Industry", "Culture"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/8620721531334460754235230511301466764",
    coords: [49.8209, 18.2625],
    lands: [
      {
        id: "dolni-vitkovice",
        name: "Dolní Vítkovice",
        blurb: "Legendary industrial complex reborn as culture zone.",
        videoUrl: "",
        affiliateUrl: "",
      },
      {
        id: "beats-for-love",
        name: "Beats for Love @ Dolní Vítkovice",
        blurb:
          "One of Central Europe’s biggest electronic music festivals. Every early July, 100k+ fans take over Ostrava’s reimagined steelworks—dozens of stages threaded through blast furnaces, the Gong hall, and Bolt Tower. House, techno, DnB, trance, and more in a surreal industrial backdrop.",
        videoUrl: "https://youtu.be/U7YEdDONt-0?si=XcqGEkEhGMH95Mj0",
        affiliateUrl: "",
      },
    ],
  },

  "reutlingen-de": {
    title: "Reutlingen, Germany – Near Stuttgart",
    blurb: "Historic German city; high livability and strong economy.",
    tags: ["Historic", "Economy", "Baden-Württemberg"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/292573116128912471666181257203360368220",
    coords: [48.4914, 9.2043],
    lands: [
      {
        id: "marienkirche",
        name: "Marienkirche",
        blurb: "Gothic church and city symbol.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "round-rock-tx": {
    title: "Round Rock, TX – Dell & sports",
    blurb: "Dell HQ, Dell Diamond, and Kalahari Falls.",
    tags: ["Tech", "Baseball", "Resort"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/50838639324434473282824924603582481238",
    coords: [30.5083, -97.6789],
    lands: [
      {
        id: "dell-diamond",
        name: "Dell Diamond",
        blurb: "Home of the Round Rock Express; family sports magnet.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "cedar-park-tx": {
    title: "Cedar Park, TX – Austin metro growth",
    blurb: "Strong in sports and concerts (H-E-B Center).",
    tags: ["Sports", "Concerts", "Growth"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/2117950553333762095295601353507265581",
    coords: [30.5052, -97.8203],
    lands: [
      {
        id: "heb-center",
        name: "H-E-B Center",
        blurb: "Arena for AHL hockey, concerts, and events.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "grapevine-tx": {
    title: "Grapevine, TX – DFW gateway",
    blurb:
      "Direct tie to DFW Airport; huge utility for travel and tourism.",
    tags: ["DFW", "Tourism", "Transit"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/2471320665400692406924760230033371170721",
    coords: [32.9343, -97.0781],
    lands: [
      {
        id: "gaylord-texan",
        name: "Gaylord Texan",
        blurb: "Convention/resort juggernaut + seasonal events.",
        videoUrl: "",
        affiliateUrl: "",
      },
    ],
  },

  "norrkoping-se": {
    title: "Norrköping, Sweden – Reinvented industrial hub",
    blurb:
      "Historic industrial core turned into a tech & creative cluster — gateway to Kolmården Wildlife Park.",
    tags: ["Tech", "Creative", "Industrial", "Wildlife"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/328978773740509271303684149061232454165",
    coords: [58.5877, 16.1924],
    lands: [
      {
        id: "visualization-center-c",
        name: "Visualization Center C",
        blurb: "Science visualization and education magnet.",
        videoUrl: "",
        affiliateUrl: "",
      },
      {
        id: "kolmarden-zoo",
        name: "Kolmården Wildlife Park",
        blurb:
          "Scandinavia’s largest zoo overlooking the Baltic Sea — home to wildlife safaris, marine shows, and the record-breaking Wildfire coaster.",
        videoUrl: "https://youtu.be/XYrQATi5nXI?si=bouKvBVHdNLaYaK5",
        affiliateUrl: "",
        sublands: [
          {
            id: "wildfire",
            name: "Wildfire Wooden Coaster",
            blurb:
              "An RMC wooden coaster that drops 57 meters, hits 115 km/h, and roars over forest cliffs with Baltic views.",
            videoUrl: "https://youtu.be/aFm5e8fHGQ4?si=goKUMU01FS2kD34E",
            affiliateUrl: "",
          },
        ],
      },
    ],
  },

  "carolina-pr": {
    title: "Carolina, Puerto Rico – SJU gateway",
    blurb:
      "Right next to San Juan’s airport; casino resorts & high tourism.",
    tags: ["SJU", "Resorts", "Tourism"],
    earthmetaUrl:
      "https://app.earthmeta.ai/city/955592025429317683616476297681314486268",
    coords: [18.3808, -65.9574],
    lands: [
      {
        id: "isla-verde-beach",
        name: "Isla Verde Beachfront",
        blurb: "Resort-lined beach; premium foot traffic.",
        videoUrl: "https://www.youtube.com/watch?v=IFb8ffLZx3E",
        affiliateUrl: "",
      },
    ],
  },
};

export default CITY_DB;
