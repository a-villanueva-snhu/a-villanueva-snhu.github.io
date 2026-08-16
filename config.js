window.PORTFOLIO_CONFIG = {
  pageTitle: "CS Capstone ePortfolio",
  metaDescription:
    "CS Capstone ePortfolio with Software Engineering, DSA, and Databases narratives, artifacts, and images.",
  heroEyebrow: "CS Capstone",
  heroTitle: "Aiden Villanueva - ePortfolio",
  heroIntro:
    "A curated portfolio highlighting growth in software engineering, algorithms and data structures, and database design.",
  nav: {
    featuredVideo: "Featured Video",
    selfAssessment: "Professional Self-Assessment",
    softwareEngineering: "Software Engineering",
    dsa: "DSA",
    databases: "Databases",
    artifacts: "Artifacts",
    images: "Images"
  },
  featuredVideo: {
    title: "Featured Video",
    embedUrl: "https://youtu.be/VZsVZ45Xibo",
    embedTitle: "Capstone code review presentation"
  },
  narratives: {
    selfAssessment: {
      title: "Professional Self-Assessment",
      markdownFile: "narratives/professional-self-assessment.md"
    },
    softwareEngineering: {
      title: "Software Engineering Narrative",
      markdownFile: "narratives/software-engineering.md"
    },
    dsa: {
      title: "DSA Narrative",
      markdownFile: "narratives/dsa.md"
    },
    databases: {
      title: "Databases Narrative",
      markdownFile: "narratives/databases.md"
    },
    emptyMessage: "No narrative markdown file configured.",
    loadErrorMessage: "Narrative could not be loaded.",
    missingFilePrefix: "Could not load "
  },
  artifacts: {
    title: "Artifacts",
    note: "This section is loaded from Markdown files in the artifacts folder.",
    emptyMessage: "No artifact markdown files listed in artifacts/index.md yet.",
    loadErrorMessage:
      "Artifacts could not be loaded. Use a local static server when previewing this page.",
    missingFilePrefix: "Could not load artifacts/"
  },
  images: {
    title: "Images",
    note: "Store screenshots in the images folder and update captions as needed.",
    items: [
      {
        src: "images/software-engineering.png",
        alt: "Software engineering artifact screenshot",
        caption: "Software Engineering Screenshot"
      },
      {
        src: "images/dsa.png",
        alt: "DSA artifact screenshot",
        caption: "DSA Screenshot"
      },
      {
        src: "images/databases.png",
        alt: "Database artifact screenshot",
        caption: "Databases Screenshot"
      }
    ]
  },
  footerLastUpdated: "Last updated: August 2026"
};
