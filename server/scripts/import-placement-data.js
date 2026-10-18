const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Company = require('../src/models/Company');
const InterviewExperience = require('../src/models/InterviewExperience');
const InterviewRound = require('../src/models/InterviewRound');
const Question = require('../src/models/Question');
const Admin = require('../src/models/Admin');
const ImportReport = require('../src/models/ImportReport');

const workspaceDir = path.resolve(__dirname, '..', '..');

// Canonical Company Mapping Rules & Aliases
const COMPANY_DEFINITIONS = [
  {
    canonicalName: 'RKIT Software Pvt Ltd',
    aliases: ['RKIT', 'RKIT Software', 'RKIT FULLSTACK DEV'],
    website: 'https://www.rkitsoftware.com',
    about: 'Software services and product engineering firm providing web, mobile, and cloud solutions.',
    generalAdvice: [
      'Focus heavily on Core OOP concepts (Inheritance, Polymorphism, Abstraction, Encapsulation) and their real-world code implementations.',
      'Prepare string manipulation, pattern printing, and array sorting algorithms without using built-in libraries.',
      'Be thoroughly prepared to explain every technical decision, architecture, and technology choice in your resume projects.',
    ],
  },
  {
    canonicalName: 'TatvaSoft',
    aliases: ['TATVASOFT', 'TatvaSoft India'],
    website: 'https://www.tatvasoft.com',
    about: 'CMMI Level 3 software development company delivering enterprise web and mobile solutions.',
    generalAdvice: [
      'Be prepared for negative marking in Round 1 online aptitude (0.5 to 1.0 mark deduction per incorrect answer).',
      'Do not use the Programiz online compiler during live coding as it may produce unexpected output in edge cases.',
      'Pattern programming (star, alphabetic, numeric, and recursive) is frequently tested with live screen sharing.',
      'Answer HR questions diplomatically and avoid negative remarks about colleges, departments, or previous organizations.',
    ],
  },
  {
    canonicalName: 'Tark Technologies',
    aliases: ['Tark Technologies LLP.', 'Tark Technologies LLP'],
    website: 'https://tarktechnologies.com',
    about: 'Technology solutions and consulting provider specializing in scalable software applications.',
    generalAdvice: [
      'Expect deep problem-solving and algorithmic thinking rounds (marathon pacing math problems, pizza party, comma counting).',
      'Round 2 requires writing clean data structures, classes, and algorithmic steps on paper.',
      'Technical interview covers SQL vs NoSQL schema comparison, networking concepts (OSI, TCP/IP, DNS), and OOP modeling.',
    ],
  },
  {
    canonicalName: 'Improwised Technologies',
    aliases: ['IMPROWISED TECHNOLOGIES'],
    website: 'https://improwised.com',
    about: 'DevOps and cloud native software consultancy.',
    generalAdvice: [
      'Extensive multi-round selection (8 rounds for SE, 9 rounds for DevOps, 8 rounds for APS).',
      'Round 2 Open-Ended Q&A checks honesty and moral reasoning; responses are cross-examined in subsequent rounds.',
      'Round 6 involves code conversion where internet access is allowed to convert logic into a language you do not know.',
      'DevOps candidates must be comfortable with terminal-based Git operations, rebuilds, and deployments.',
    ],
  },
  {
    canonicalName: 'Gateway Group',
    aliases: ['GATEWAY', 'Gateway Group of Companies'],
    website: 'https://www.gatewaygroup.com',
    about: 'Global enterprise software engineering and technology consulting company.',
    generalAdvice: [
      'Round 1 includes English grammar, Git/GitHub questions, and logical reasoning.',
      'Technical coding evaluates frontend UI components (toggles, counters, nested DOM trees) and SQL aggregation.',
      'HR evaluates team leadership, conflict resolution, and commitment to the internship-to-hire period.',
    ],
  },
  {
    canonicalName: 'SKH Algorithms',
    aliases: ['SKH Algorithms - Software Engineer'],
    website: '',
    about: 'Software development firm focused on algorithms and domain-specific engineering.',
    generalAdvice: [
      'Written pen-paper test includes domain-specific computer science concepts and aptitude.',
    ],
  },
  {
    canonicalName: 'Vivansh Infotech',
    aliases: ['Vivansh', 'Vivansh Infotech frontend developer'],
    website: 'https://vivanshinfotech.com',
    about: 'Web, mobile application, and IT services company.',
    generalAdvice: [
      'Aptitude is scoring and straightforward; aim for high accuracy.',
      'Frontend interviews focus on JavaScript event loop, asynchronous execution (setTimeout, Promises), React hooks, and CSS positioning.',
      'Fluent and confident English communication is emphasized.',
    ],
  },
  {
    canonicalName: 'Shaligram Infotech',
    aliases: ['Shaligram Infotech - Full Stack Developer'],
    website: 'https://shaligraminfotech.com',
    about: 'Full-service offshore software and web development company.',
    generalAdvice: [
      'Separate interview tracks for on-campus and off-campus placements.',
      'Multi-table SQL joins (Customer, Order, Supplier) and OOP 4 pillars are core test topics.',
      'Expect pen-paper logic writing for EMI calculations, prime numbers, and number series manipulation.',
    ],
  },
  {
    canonicalName: 'KOOPS Technologies',
    aliases: ['KOOPS Technologies | Business Developer Executive', 'KOOPS Technologies | Web Technology Developer'],
    website: '',
    about: 'Technology solutions and digital services firm.',
    generalAdvice: [
      'BDE track emphasizes discussion/debate, restaurant onboarding simulations, CRM knowledge, and leadership communication.',
      'Developer track tests JavaScript variable scoping (let/var/const), timer queues, core Java OOP, and SQL triggers/joins.',
    ],
  },
  {
    canonicalName: 'Inara Consultancy Services',
    aliases: ['Inara Consultancy Services (ICS)- Software Engineer', 'ICS'],
    website: '',
    about: 'IT consulting and software engineering firm.',
    generalAdvice: [
      'Three-stage evaluation: MCQ round, coding test with personal interview, and HR round.',
    ],
  },
  {
    canonicalName: 'eSparkBiz',
    aliases: ['E-Sparkbiz', 'eSparkBiz - Software Developer'],
    website: 'https://www.esparkinfo.com',
    about: 'Global software development and IT staff augmentation provider.',
    generalAdvice: [
      'Pen-and-paper coding round contains 10-11 standard string, array, and recursion problems (Fibonacci, Palindrome, Reverse, 2nd Largest, Intersection).',
      'Technical interview drills DSA concepts (Stack, Queue, LinkedList, Sorting algorithms) and SQL update/join/aggregation queries.',
      'CTO round focuses on object-oriented static keywords, real-world analogies, and learning mindset outside coding.',
    ],
  },
  {
    canonicalName: 'TSS Consultancy Private Limited',
    aliases: ['TSS', 'TSS Consultancy'],
    website: 'https://tssconsultancy.com',
    about: 'Financial technology and compliance software products company.',
    generalAdvice: [
      'Strict ban on external libraries: candidates cannot use Java Collections, C++ STL, or built-in sort/search algorithms during technical coding.',
      'Solve problems from scratch using primitive arrays and pointers (e.g. reverse words using char array only).',
      'Advanced DSA topics frequently include Josephus Problem, Longest Prefix-Suffix (KMP), and Dynamic Programming (Making Change).',
    ],
  },
  {
    canonicalName: 'Prominent Pixel',
    aliases: ['Prominent pixel', 'ProminentPixel', '<Prominent Pixel>', '<Prominent Pixel> - <Web Developer>', 'ProminentPixel (Jr. Software Engineer)'],
    website: 'https://prominentpixel.com',
    about: 'Web and mobile app development agency.',
    generalAdvice: [
      'Heavy focus on standard LeetCode problems (First Non-Repeating Element in Window, Longest Consecutive Increasing Sequence in Matrix, Next Greater Element, Valid Parentheses, Missing Number, Spiral Matrix).',
      'Detailed modern JavaScript (ES6+, Hoisting, Higher Order Functions, Promises, Async/Await) and React lifecycle/hooks (useState, useEffect, useContext, Redux).',
      'Senior rounds include current events, environmental problem-solving, and general analytical discussions.',
    ],
  },
  {
    canonicalName: 'CyberCom Creations',
    aliases: ['CyberCom Creations | PHP developer'],
    website: 'https://cybercomcreations.com',
    about: 'Web design, development, and digital marketing agency.',
    generalAdvice: [
      'Focus on nested loop dry-runs, logical trace evaluation, and step-by-step loop output explanation.',
      'Expect basic DBMS, OOP, and relational queries alongside HR questions.',
    ],
  },
  {
    canonicalName: 'Silver Touch Technologies',
    aliases: ['silver touch', 'Silver Touch'],
    website: 'https://www.silvertouch.com',
    about: 'Publicly listed IT solutions and digital transformation provider.',
    generalAdvice: [
      'Technical interview is resume-driven: expect questions on any listed framework or language.',
      'Be prepared to code Tic-Tac-Toe (1-player and 2-player logic) and discuss full-stack React/Node architecture.',
      'Covers medium-to-hard algorithmic problems in DP, recursion, backtracking, and two-pointers.',
    ],
  },
  {
    canonicalName: 'TechXperts',
    aliases: ['TechXperts'],
    website: '',
    about: 'Software consultancy and technical solutions firm.',
    generalAdvice: [
      'Tests JavaScript variable scopes, array indexing, loop mechanisms (entry vs exit control), and OOP class hierarchies.',
      'HTTP fundamentals: difference between GET and POST, form submission lifecycle, request/response cycle.',
    ],
  },
  {
    canonicalName: 'eInfochips',
    aliases: ['Einfochips - An ARROW Company', 'eInfochips An Arrow Company'],
    website: 'https://www.einfochips.com',
    about: 'Arrow Electronics company delivering product engineering and digital transformation services.',
    generalAdvice: [
      'Online test includes 45 MCQs and DSA problems (e.g. LeetCode Watering Plants problem).',
      'Technical interview covers pattern logic, candidate approach during online tests, and advanced SQL/OOP.',
    ],
  },
  {
    canonicalName: 'Sampaarsh Technology',
    aliases: ['SAMPAARSH TECHNOLOGY'],
    website: '',
    about: 'Specialized technology firm focusing on applied mathematics, trigonometry, and 2D/3D visualization.',
    generalAdvice: [
      'Candidates must possess strong mathematical and spatial visualization skills.',
      'Round 2 contains 10 problems with explicit weighted marks (ranging from 1 mark basics to 7-mark DP/Stack problems).',
      'Round 3 tests Java fundamentals, OOP in depth, and Advanced Java (AJP).',
    ],
  },
  {
    canonicalName: 'Silent Infotech',
    aliases: ['Silent Infotech'],
    website: 'https://silentinfotech.com',
    about: 'Custom software, blockchain, and enterprise cloud development firm.',
    generalAdvice: [
      'Online assessment tests timed LeetCode-style questions (Best Time to Buy/Sell Stock, Median of Two Sorted Arrays, Single Number in Pairs).',
      'System design rounds include designing schemas for Hospital Management and College Management systems.',
      'Network protocols (DNS, OSI layers, TCP/IP) and bitwise arithmetic (divisible by 4 without modulo/divide) are tested.',
    ],
  },
  {
    canonicalName: 'Kevit Technologies',
    aliases: ['KEVIT'],
    website: 'https://kevit.io',
    about: 'Conversational AI, chatbot solutions, and enterprise software company.',
    generalAdvice: [
      'Round 1 divides into Aptitude, Technical, and AI sections with a high elimination rate (60-70%).',
      'Technical interview covers Java multithreading, routing algorithms, DNS, protocols, OS, and NP-hard problems.',
      'Personal interview with company co-founder moves rapidly in rapid-fire format; stay confident and articulate.',
      'Group discussion includes debate on AI utility and teamwork scenario problem-solving.',
    ],
  },
  {
    canonicalName: 'Atri Solutions',
    aliases: ['Atri Solutions'],
    website: '',
    about: 'Technology solutions and software development provider.',
    generalAdvice: [
      'Covers classic puzzles (Bulb problem, Horse race puzzle), LLM and AI concepts, advanced backend, and Fibonacci constants.',
    ],
  },
  {
    canonicalName: 'GN Websoft',
    aliases: ['GN websoft'],
    website: 'https://gnwebsoft.com',
    about: 'Web development and digital solutions company.',
    generalAdvice: [
      'Rounds 2 and 3 conducted in Gujarati, featuring classic puzzles (Horse, Bulb, Water Jug) and technology learning questions.',
      'Answer questions regarding stipend, learning duration, and faculty diplomatically.',
      'Final round asks broad open-ended questions ("Tell me what you know") alongside basic CN, OS, and computer architecture (why 1 byte = 8 bits).',
    ],
  },
  {
    canonicalName: 'Version Systems',
    aliases: ['Version System'],
    website: 'https://versionsystems.com',
    about: 'Enterprise software development firm specializing in Microsoft .NET technologies and database systems.',
    generalAdvice: [
      'Round 1 includes 3 sets (A, B, C) featuring complex SQL subqueries, string/array programming, and C# async/await.',
      'Round 2 requires building an Entity Framework Core CRUD project and running SQL queries on it.',
      'Round 3 features pattern printing, high-performance in-memory search (100,000 integers without loops), and 36 deep C#/.NET/SQL technical interview questions.',
    ],
  },
  {
    canonicalName: 'Zeus Learning',
    aliases: ['Zeus Learning'],
    website: 'https://www.zeuslearning.com',
    about: 'E-learning solutions, educational technology, and interactive software provider.',
    generalAdvice: [
      'Round 1 aptitude is of medium difficulty.',
      'Round 2 requires thorough proficiency in Data Structures (Hash, Tree, Graph, List, Array) and Object-Oriented Programming.',
    ],
  },
  // Unassigned / Flagged entries for manual review
  {
    canonicalName: '[Unassigned - React Native / C#.NET Role]',
    aliases: ['position : 1) React Native dev. 2) c#.net developer'],
    website: '',
    about: 'Interview experience extracted from Page 8 of Questions TnP 2025.pdf where the company header was omitted in the source document.',
    generalAdvice: [
      'Candidates assign self-ratings out of 10 for Frontend, Database, and Backend, and interview questions are dynamically tailored to those ratings.',
    ],
    needsReview: true,
    reviewNotes: 'Source document Questions TnP 2025.pdf (Page 8) lacks an explicit company title. Flagged for administrator review to assign to the appropriate company.',
  },
  {
    canonicalName: '[Unassigned - Frontend & Backend Role]',
    aliases: ['Round:1 aptitude test (Frontend & Backend Developer)'],
    website: '',
    about: 'Interview experience extracted from Pages 14-15 of Questions TnP 2025.pdf where the company header was omitted in the source document.',
    generalAdvice: [
      'Covers detailed frontend animation, Tailwind CSS classes, React hooks, Redux vs Context, and backend OOP/SQL concepts.',
    ],
    needsReview: true,
    reviewNotes: 'Source document Questions TnP 2025.pdf (Pages 14-15) lacks an explicit company title. Flagged for administrator review to assign to the appropriate company.',
  },
];

// Helper to find or create canonical company
async function getOrCreateCompany(nameCandidate, sourceDoc = '') {
  const trimmed = nameCandidate.trim();
  const lower = trimmed.toLowerCase();

  // Find in predefined definitions
  for (const def of COMPANY_DEFINITIONS) {
    if (
      def.canonicalName.toLowerCase() === lower ||
      def.aliases.some((a) => a.toLowerCase() === lower)
    ) {
      let company = await Company.findOne({ name: def.canonicalName });
      if (!company) {
        company = await Company.create({
          name: def.canonicalName,
          normalizedName: def.canonicalName.toLowerCase(),
          aliases: def.aliases,
          website: def.website,
          about: def.about,
          generalAdvice: def.generalAdvice,
          needsReview: def.needsReview || false,
          reviewNotes: def.reviewNotes || '',
          isPublished: !def.needsReview, // Draft if needs review
        });
        console.log(`[COMPANY CREATED] ${company.name}`);
      }
      return company;
    }
  }

  // Fallback for new names
  let company = await Company.findOne({
    $or: [{ name: trimmed }, { aliases: trimmed }, { normalizedName: lower }],
  });

  if (!company) {
    company = await Company.create({
      name: trimmed,
      normalizedName: lower,
      aliases: [trimmed],
      needsReview: true,
      reviewNotes: `Auto-created from document: ${sourceDoc}. Verify company details and aliases.`,
      isPublished: true,
    });
    console.log(`[COMPANY AUTO-CREATED] ${company.name}`);
  }

  return company;
}

// Main Migration Orchestrator
async function runImport() {
  console.log('====================================================');
  console.log('STARTING PLACEMENT PORTAL DATA IMPORT & MIGRATION');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal');
  console.log('Connected to MongoDB successfully.');

  // Create default admin user if not exists
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@placementportal.edu';
  let admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    admin = await Admin.create({
      username: process.env.ADMIN_INITIAL_USERNAME || 'admin',
      email: adminEmail,
      password: process.env.ADMIN_INITIAL_PASSWORD || 'AdminPlacement@2026',
      role: 'admin',
    });
    console.log(`[ADMIN CREATED] Default admin created: ${admin.email}`);
  } else {
    console.log(`[ADMIN EXISTS] Found existing admin account: ${admin.email}`);
  }

  // Clean existing migration records for idempotent re-import
  console.log('Cleaning previous placement records for clean import...');
  await Question.deleteMany({});
  await InterviewRound.deleteMany({});
  await InterviewExperience.deleteMany({});
  await Company.deleteMany({});
  await ImportReport.deleteMany({});
  console.log('Previous records cleared.');

  const report = {
    sourceFiles: [
      'Placement Data.docx',
      'Questions TnP 2024 .pdf',
      'Questions TnP 2025.pdf',
    ],
    companiesCount: 0,
    experiencesCount: 0,
    roundsCount: 0,
    questionsCount: 0,
    flaggedRecords: [],
    duplicatesDetected: [],
    errorLog: [],
  };

  // Import Document 1: Placement Data.docx
  const docxImporter = require('./importers/import-docx');
  const docxStats = await docxImporter({ getOrCreateCompany, report });

  // Import Document 2: Questions TnP 2024 .pdf
  const pdf2024Importer = require('./importers/import-pdf-2024');
  const pdf2024Stats = await pdf2024Importer({ getOrCreateCompany, report });

  // Import Document 3: Questions TnP 2025.pdf
  const pdf2025Importer = require('./importers/import-pdf-2025');
  const pdf2025Stats = await pdf2025Importer({ getOrCreateCompany, report });

  // Update company metrics (years, experience count)
  console.log('Updating company metadata and aggregates...');
  const companies = await Company.find({});
  for (const comp of companies) {
    const experiences = await InterviewExperience.find({ company: comp._id });
    const years = [
      ...new Set(
        experiences
          .map((e) => e.placementYear)
          .filter((y) => y !== null && y !== undefined)
      ),
    ].sort();

    comp.totalExperiencesCount = experiences.length;
    comp.placementYears = years;
    await comp.save();
  }

  // Compile final numbers
  report.companiesCount = await Company.countDocuments();
  report.experiencesCount = await InterviewExperience.countDocuments();
  report.roundsCount = await InterviewRound.countDocuments();
  report.questionsCount = await Question.countDocuments();

  const savedReport = await ImportReport.create(report);

  console.log('====================================================');
  console.log('IMPORT COMPLETE! SUMMARY REPORT:');
  console.log(`- Companies in DB:       ${report.companiesCount}`);
  console.log(`- Experiences in DB:     ${report.experiencesCount}`);
  console.log(`- Interview Rounds:      ${report.roundsCount}`);
  console.log(`- Questions in DB:       ${report.questionsCount}`);
  console.log(`- Flagged for Review:    ${report.flaggedRecords.length}`);
  console.log(`- Duplicates Detected:   ${report.duplicatesDetected.length}`);
  console.log(`- Errors Encountered:    ${report.errorLog.length}`);
  console.log('====================================================');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

if (require.main === module) {
  runImport().catch((err) => {
    console.error('Fatal error during import:', err);
    process.exit(1);
  });
}

module.exports = { runImport, COMPANY_DEFINITIONS };
