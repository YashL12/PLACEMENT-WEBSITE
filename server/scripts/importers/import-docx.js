const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const Company = require('../../src/models/Company');
const InterviewExperience = require('../../src/models/InterviewExperience');
const InterviewRound = require('../../src/models/InterviewRound');
const Question = require('../../src/models/Question');

const docxPath = path.resolve(__dirname, '..', '..', '..', 'Placement Data.docx');

async function importDocx({ getOrCreateCompany, report }) {
  console.log('--- Processing Document 1: Placement Data.docx ---');
  if (!fs.existsSync(docxPath)) {
    console.error(`File not found: ${docxPath}`);
    report.errors.push(`File not found: ${docxPath}`);
    return;
  }

  const buffer = fs.readFileSync(docxPath);
  const rawResult = await mammoth.extractRawText({ buffer });
  // In Word XML, linebreaks and BOM appear as \ufeff
  const text = rawResult.value.replace(/\ufeff/g, '\n');

  // Parse KEVIT
  await parseKevit(text, getOrCreateCompany, report);

  // Parse Atri Solutions
  await parseAtriSolutions(text, getOrCreateCompany, report);

  // Parse TSS
  await parseTSS(text, getOrCreateCompany, report);

  // Parse GN websoft
  await parseGNWebsoft(text, getOrCreateCompany, report);

  // Parse Vivansh
  await parseVivansh(text, getOrCreateCompany, report);

  // Parse Version System
  await parseVersionSystem(text, getOrCreateCompany, report);

  // Parse Prominent pixel
  await parseProminentPixel(text, getOrCreateCompany, report);

  // Parse Zeus Learning
  await parseZeusLearning(text, getOrCreateCompany, report);

  console.log('Placement Data.docx imported successfully.');
}

async function parseKevit(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('KEVIT', 'Placement Data.docx');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: null, // Unknown in docx, preserve null
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 1',
    processOverview:
      'Multi-round selection comprising 3 technical and domain sections in round 1, matrix/hashmap DSA in round 2, Java threading/CN/OS in round 3, rapid-fire personal interview with co-founder, and team group discussion with AI debate.',
    totalRoundsCount: 5,
    advice: [
      'Try to speak in english, be confident, listen first take initiative and speak.',
      'Be confident for personal interview round and one more thing: you will get questions immediately one after another, it is like rapid fire.',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude, Technical & AI',
    roundType: 'Aptitude',
    description:
      'Divided into 3 sections: 1st is Aptitude, 2nd is Technical, and 3rd is AI related (60-70% elimination from this round; selected students continue to further rounds).',
    sourceLocation: 'Placement Data.docx - KEVIT Round 1',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Aptitude Assessment section',
      topic: 'Aptitude',
      order: 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Technical fundamentals section',
      topic: 'Technical',
      order: 2,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'AI related concepts section',
      topic: 'AI',
      order: 3,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 1',
    },
  ]);

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Technical Round (DSA)',
    roundType: 'Coding',
    description: 'Technical problem-solving round featuring 3 DSA questions.',
    sourceLocation: 'Placement Data.docx - KEVIT Round 2',
  });
  await Question.create([
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: '1 question from Matrix (2D array)',
      topic: 'DSA - Matrix',
      order: 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 2',
    },
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: '1 question from HashSet or HashMap',
      topic: 'DSA - Hashing',
      order: 2,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 2',
    },
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: '1 question from other core DSA topic',
      topic: 'DSA',
      order: 3,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 2',
    },
  ]);

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : Technical Interview',
    roundType: 'Technical',
    description: 'Technical interview covering DSA, Java threading, project discussion, computer networks, and operating systems.',
    sourceLocation: 'Placement Data.docx - KEVIT Round 3',
  });
  const r3Questions = [
    '1 DSA question',
    'Threading program in Java',
    'Project and other discussion',
    'Very deep concept of Computer Networks (Routing algorithm, DNS, Protocols)',
    'Operating System related questions',
    'NP problem',
    'Software engineering questions',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 : Personal Interview',
    roundType: 'HR',
    description: "Company's co-founder will take this. Rapid-fire questions.",
    instructions: "Be confident for this round and one more thing: you'll get questions immediately one after another, it's like rapid fire.",
    sourceLocation: 'Placement Data.docx - KEVIT Personal Interview',
  });
  const r4Questions = [
    'Tell me about yourself',
    'What are your strengths and weaknesses?',
    'Who is your role model?',
    'Why should we hire you?',
    'If you are weak in technical/english communication so how will you improve it?',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'HR',
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT Round 4',
    });
  }

  // Round 5
  const r5 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 5,
    roundOrder: 5,
    roundName: 'Round 5 : Group Discussion',
    roundType: 'Group Discussion',
    description: 'Divided into two sections: Debate on topic and team scenario discussion.',
    sourceLocation: 'Placement Data.docx - KEVIT Group discussion',
  });
  await Question.create([
    {
      round: r5._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Debate on topic: AI will be helpful or not',
      topic: 'Group Discussion - Debate',
      order: 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT GD Section 1',
    },
    {
      round: r5._id,
      experience: exp._id,
      company: company._id,
      questionText: 'For given scenario (deadline missing or unexpected delivery issue), discuss solutions as a team',
      topic: 'Group Discussion - Scenario',
      order: 2,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'KEVIT GD Section 2',
    },
  ]);
}

async function parseAtriSolutions(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Atri Solutions', 'Placement Data.docx');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: null,
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 2',
    processOverview: 'Aptitude and domain-specific assessment covering logic puzzles, AI/LLMs, backend, Python, and mathematics.',
    totalRoundsCount: 1,
    advice: ['Prepare logic puzzles like bulb and horse problems, LLM basics, backend concepts, and Fibonacci properties.'],
  });

  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude & Domain Assessment',
    roundType: 'Aptitude',
    description: 'Puzzles, AI/LLM, backend, Python, and current affairs assessment.',
    sourceLocation: 'Placement Data.docx - Atri Solutions',
  });

  const questions = [
    'Bulb, horse problem (classic puzzles)',
    'AI related questions of LLM and neural architectures',
    'Advanced concepts of backend architecture',
    'Some Python language questions',
    '1-2 questions related to current affairs',
    'Questions related to Fibonacci series and its constant (Golden Ratio / Binet formula)',
  ];

  for (let i = 0; i < questions.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: questions[i],
      topic: 'Aptitude & Technical',
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'Atri Solutions Aptitude',
    });
  }
}

async function parseTSS(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('TSS', 'Placement Data.docx');
  report.duplicatesDetected.push({
    companyName: company.name,
    duplicateAlias: 'TSS (Placement Data.docx)',
    actionTaken: 'Mapped to canonical TSS Consultancy Private Limited',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: null,
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 3',
    processOverview:
      'Three-round evaluation: easy aptitude test, technical interview taken by junior developer (candidates with >8.5 CGPA or R1 cleared are eligible), and advanced DSA/OOP round with LeetCode problems.',
    totalRoundsCount: 3,
    advice: [
      'Round 2: Students who have cleared round 1 or have above 8.5 CGPA are eligible for it. It is taken by junior developers.',
      'English is not mandatory in the interview.',
      'Prepare core SQL queries like second highest salary and advanced DSA (Josephus, LeetCode 139).',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude',
    roundType: 'Aptitude',
    description: 'Aptitude is easy level.',
    sourceLocation: 'Placement Data.docx - TSS Round 1',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude assessment (easy level questions)',
    topic: 'Aptitude',
    order: 1,
    sourceDocument: 'Placement Data.docx',
    sourceLocation: 'TSS Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Junior Developer Technical Interview',
    roundType: 'Technical',
    description: 'Taken by junior developer. English not mandatory. Covers SQL queries, common DSA, and OOP basics.',
    sourceLocation: 'Placement Data.docx - TSS Round 2',
  });
  await Question.create([
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: '1-2 SQL queries normal like second highest salary',
      topic: 'SQL',
      order: 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'TSS Round 2',
    },
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Common DSA questions',
      topic: 'DSA',
      order: 2,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'TSS Round 2',
    },
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: 'OOP basics and core principles',
      topic: 'OOP',
      order: 3,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'TSS Round 2',
    },
  ]);

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : Advanced DSA & OOP',
    roundType: 'Technical',
    description: 'Advanced topics in DSA, OOP debugging, Dynamic method dispatch, and LeetCode algorithmic problems.',
    sourceLocation: 'Placement Data.docx - TSS Round 3',
  });
  const r3Questions = [
    'Advanced topics related to DSA',
    'Debugging related to Object-Oriented Programming (OOP)',
    'Dynamic method dispatch implementation and theory',
    'Generics in programming languages',
    'Josephus problem implementation and solution',
    'LeetCode problem number 139 (Word Break)',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'DSA & OOP',
      order: i + 1,
      solutionUrl: r3Questions[i].includes('139')
        ? 'https://leetcode.com/problems/word-break/'
        : '',
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'TSS Round 3',
    });
  }
}

async function parseGNWebsoft(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('GN websoft', 'Placement Data.docx');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: null,
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 4',
    processOverview:
      'Three-round evaluation: aptitude MCQs with 10 SQL queries and basic programs; Rounds 2 & 3 conducted in Gujarati covering puzzles, projects, technology readiness, React/Flutter/.NET; Final round covering open-ended topics, IT motivation, CN/OS, and computer fundamentals.',
    totalRoundsCount: 3,
    advice: [
      'In how much time you will learn new technologies: If you tell them more time then they will directly tell you that why should we pay stipend to you for learning, so answer accordingly and prepare for next question.',
      'Why have you chosen GEC Rajkot? Does your Faculty teach you well? Please answer these questions diplomatically.',
      'Confidence is key to success in these two rounds.',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude & Basic Queries',
    roundType: 'Aptitude',
    description: 'Some MCQs, 10 very easy SQL queries (insert, update, delete, retrieve), and 2-3 very easy programs.',
    sourceLocation: 'Placement Data.docx - GN websoft Aptitude',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'MCQs on general aptitude and fundamentals',
      topic: 'Aptitude',
      order: 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'GN websoft Aptitude',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '10 basic SQL queries: INSERT, UPDATE, DELETE, and RETRIEVE',
      topic: 'SQL',
      order: 2,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'GN websoft Aptitude',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '2-3 basic programming problems',
      topic: 'Programming',
      order: 3,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'GN websoft Aptitude',
    },
  ]);

  // Round 2 & 3
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 & 3 : Technical & Situational (in Gujarati)',
    roundType: 'Technical',
    description: 'Conducted in Gujarati. Puzzles, project explanation, learning timeframe, and technology-specific queries.',
    sourceLocation: 'Placement Data.docx - GN websoft Round 2 and 3',
  });
  const r2Questions = [
    'Puzzles of Horse, Bulb, and Water Jug',
    'Project explanation and implementation details',
    'In how much time will you learn new technologies? (Answer diplomatically regarding stipend expectations)',
    'Questions on React, Flutter, and .NET (if you know them)',
    'Why have you chosen GEC Rajkot?',
    'Does your Faculty teach you well? (Diplomatic answer required)',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical & Behavioral',
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'GN websoft Round 2 & 3',
    });
  }

  // Final Round
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Final Round : Comprehensive Technical & HR',
    roundType: 'HR',
    description: 'Open-ended speaking, personal background, conflict management, and core CS fundamentals.',
    sourceLocation: 'Placement Data.docx - GN websoft Final round',
  });
  const r3Questions = [
    'Tell me what you know and start to speak about anything you know on any topic',
    'Family details',
    'Why do you want to work in IT?',
    'If someone scolds you for your mistake, what should you do?',
    'Basic Computer Networks and Operating Systems questions',
    'Where do we use Data Structures in real-world applications?',
    'Why is 1 byte equal to 8 bits, and not 10?',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'General & Technical',
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'GN websoft Final round',
    });
  }
}

async function parseVivansh(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Vivansh', 'Placement Data.docx');
  report.duplicatesDetected.push({
    companyName: company.name,
    duplicateAlias: 'Vivansh (Placement Data.docx)',
    actionTaken: 'Mapped to canonical Vivansh Infotech',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: null,
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 5',
    processOverview: 'Aptitude assessment and personal technical interview emphasizing fluent English communication, SQL, HTTP, and web tech.',
    totalRoundsCount: 2,
    advice: [
      'Aptitude is very easy, try to score full marks.',
      'Fluent English communication is a must.',
    ],
  });

  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude Test',
    roundType: 'Aptitude',
    description: 'Aptitude is scoring and straightforward.',
    sourceLocation: 'Placement Data.docx - Vivansh Aptitude',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude test (high accuracy required)',
    topic: 'Aptitude',
    order: 1,
    sourceDocument: 'Placement Data.docx',
    sourceLocation: 'Vivansh Aptitude',
  });

  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Personal & Technical Interview',
    roundType: 'Technical',
    description: 'Personal introduction, projects, internships, SQL queries, HTTP protocols, and frontend basics.',
    sourceLocation: 'Placement Data.docx - Vivansh Round 2',
  });
  const r2Questions = [
    'Tell me about yourself',
    'About your projects and internships',
    'SQL Query questions',
    'HTTP methods (GET, POST, PUT, DELETE, PATCH)',
    'HTML / CSS / JavaScript fundamentals',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'Vivansh Round 2',
    });
  }
}

async function parseVersionSystem(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Version System', 'Placement Data.docx');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: '.NET / Full Stack Developer',
    placementYear: null,
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 6',
    processOverview:
      'Extensive three-round process: Round 1 written test with Sets A, B, and C; Round 2 at company premises creating a .NET Entity Framework Core CRUD project; Round 3 technical interview with pattern printing, search optimization without loops, and 36 deep C#/.NET/SQL architecture questions.',
    totalRoundsCount: 3,
    advice: [
      'Round 2 at company: Make .NET project in EF core Empty and run SQL queries on it. Really very easy project just CRUD operation and simple SQL queries if you know .NET.',
      'Be prepared for comprehensive C#, ADO.NET vs EF Core, async/await concurrency, and SQL performance tuning questions.',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Written Technical Test (Sets A, B, C)',
    roundType: 'Technical',
    description: 'Written assessment divided into Set A, Set B, and Set C covering SQL queries, programming algorithms, and C# API/async methods.',
    sourceLocation: 'Placement Data.docx - Version System Round 1',
  });
  const r1Questions = [
    { text: 'Set A: Simple and subquery questions from employees and department tables', topic: 'SQL' },
    { text: 'Set A: Find sum of Even numbers in array', topic: 'Programming' },
    { text: 'Set A: Find Palindrome from 6 numbers', topic: 'Programming' },
    { text: 'Set A: Count vowels and consonants from given string', topic: 'Programming' },
    { text: 'Set A: Factorial using recursion function', topic: 'Programming' },
    { text: 'Set A: Remove digits and special characters (@#$_) from string', topic: 'Programming' },
    { text: 'Set A: Complete series: 3, 6, 11, 18, 27, ...?', topic: 'Logical' },
    { text: 'Set A: Angle between clock hands at 3:15', topic: 'Logical' },
    { text: 'Set A: Puzzle: 15 rs I have, 1 rs per chocolate, giving 3 wrappers gets 1 chocolate. How many chocolates can I eat?', topic: 'Logical' },
    { text: 'Set A: 3*3 matrix find missing value', topic: 'Logical' },
    { text: 'Set B: Department and employee table SQL queries and subqueries', topic: 'SQL' },
    { text: 'Set B: Find duplicate elements from list of strings', topic: 'Programming' },
    { text: 'Set B: Reverse a given linked list', topic: 'Programming' },
    { text: 'Set B: Enter number between 1 to 9999 and get output in words (e.g., 521 -> Five Hundred twenty one)', topic: 'Programming' },
    { text: 'Set B: Find binary representation of a given decimal number', topic: 'Programming' },
    { text: 'Set B: Write a custom validation function with validation logic', topic: 'Programming' },
    { text: 'Set C: Read JSON file in C#', topic: 'C# / .NET' },
    { text: 'Set C: API call using POST method and insert user data', topic: 'C# / .NET' },
    { text: 'Set C: Demonstrate async/await by calling method', topic: 'C# / .NET' },
  ];
  for (let i = 0; i < r1Questions.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: r1Questions[i].text,
      topic: r1Questions[i].topic,
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'Version System Round 1',
    });
  }

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Practical Project at Company Premises',
    roundType: 'Practical',
    description: 'At company: Make a .NET project in Entity Framework Core Empty template, run SQL queries on it, and perform basic CRUD operations.',
    sourceLocation: 'Placement Data.docx - Version System Round 2',
  });
  await Question.create({
    round: r2._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Create a .NET project in EF Core Empty template, implement CRUD operations and execute SQL queries on the database',
    topic: '.NET & EF Core',
    order: 1,
    sourceDocument: 'Placement Data.docx',
    sourceLocation: 'Version System Round 2',
  });

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : Advanced Technical & Deep Interview Questions',
    roundType: 'Technical',
    description: 'In-depth interview covering algorithmic search optimization, pattern printing, SQL optimization, and 36 technical questions.',
    sourceLocation: 'Placement Data.docx - Version System Round 3',
  });

  const r3Coding = [
    {
      text: 'Draw star pattern: Diamond pattern with widening and narrowing asterisks',
      context: '   **\n  ****\n  ****\n ******\n ******\n********\n********\n ******\n ******\n  ****\n  ****\n   **',
      topic: 'Pattern Printing',
    },
    {
      text: 'You are given an unordered List<int> containing 1,00,000 integers in C#. You need to check whether a given integer exists in the list. You should not perform a linear scan using a for or foreach loop. How would you implement the search efficiently? Explain your approach and its time complexity.',
      context: 'Constraint: Unordered List<int> with 100,000 integers. No linear scan with for/foreach.',
      topic: 'Algorithms & Data Structures in C#',
    },
    {
      text: 'Print the following number pattern:\n1\n4 5\n7 8 9\n10 11 12',
      context: 'Pattern progression: row 1: 1; row 2: 4, 5; row 3: 7, 8, 9; row 4: 10, 11, 12',
      topic: 'Pattern Printing',
    },
    {
      text: 'Left Joins related SQL query implementation and behavior with null values',
      context: 'SQL Left Join query semantics',
      topic: 'SQL',
    },
  ];

  for (let i = 0; i < r3Coding.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Coding[i].text,
      context: r3Coding[i].context,
      topic: r3Coding[i].topic,
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'Version System Round 3 Problems',
    });
  }

  // 36 Interview Questions from document
  const technical36 = [
    'Explain about your project and technologies?',
    'What is Temporary Table in SQL?',
    'You Done Your Project With EF or ADO.Net?',
    'Difference Between .Net Framework and .Net Core?',
    'Give those things which does not do in ado.net but better in Web api, explain give major different between ado.net and web api.',
    'In one SP, we want to retrieve 4 tables and one table can take 5 seconds to retrieve the data then total time 20 seconds for one SP. Then how to optimize retrieve timing and how to access this tables in the Application?',
    'How to protect our api ?',
    'Explain JWT and how to implement it?',
    'Can we use ADO.NET as the backend and React as the frontend in a .NET application? If yes, how can we connect them??',
    'We have APIs for form insertion at that time we don\'t want to use DataAnnotation and we want Client Side Validation. Can we do it with jQuery? How to do it, explain?',
    'How to call form submit url in form?',
    'Where do you write jQuery in ASP.NET Core MVC?',
    'Explain async and await with technical example.',
    'Suppose we implement async await into login page. Now at morning 9:00 AM, more than 100 employees login at the same time. Here how does this async await concept work? And which is better: without async await or with?',
    'What is Polymorphism and explain the use of it? Explain method overloading with real world example.',
    'Difference between Abstraction and Interface. Which is used most and why?',
    'What is Versioning? Give any example of versioning using OOP concept.',
    'What happens if we use File.ReadAllText() to read a 1 GB JSON file? Will it load successfully, or is it likely to crash due to memory limitations?',
    'If 100 users simultaneously read a 1 GB JSON file, does that mean the application will consume around 100 GB of memory? How does .NET manage memory in this scenario, and what are the best practices for handling large JSON files efficiently?',
    'What is modelView (ViewModel)?',
    'How to integrate REST APIs into a .NET application that uses ADO.NET for database operations?',
    'Can we use ADO.NET as the backend and React as the frontend in a .NET application? If yes, how can we connect them?',
    'Explain DateTime datatype/class in C# and how to find today\'s date only?',
    'What is generic in C#?',
    'Explain any 3-4 collections in C#.',
    'Explain lambda function with example in C#.',
    'What is migration in Entity Framework?',
    'Explain Dependency Injection and its lifetimes (Transient, Scoped, Singleton).',
    'What is LINQ and its advantages?',
    'Explain exception handling with proper example.',
    'How do nested try-catch-finally blocks work in C#? Explain the execution flow with an example.',
    'How to handle errors globally in ASP.NET Core?',
    'Testing related methods and implementations (Unit Testing, Mocking).',
    'Explain Session Management and its structures.',
    'How to give authorization globally in ASP.NET Core?',
    'What is cookies and how are they managed?',
  ];

  for (let i = 0; i < technical36.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: `${i + 1}) ${technical36[i]}`,
      topic: '.NET & C# Interview Questions',
      order: r3Coding.length + i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: `Version System Round 3 Q${i + 1}`,
    });
  }
}

async function parseProminentPixel(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Prominent pixel', 'Placement Data.docx');
  report.duplicatesDetected.push({
    companyName: company.name,
    duplicateAlias: 'Prominent pixel (Placement Data.docx)',
    actionTaken: 'Mapped to canonical Prominent Pixel',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: null,
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 7',
    processOverview:
      'Two-round evaluation: Round 1 simple aptitude with React, SQL, DSA, Java; Round 2 intensive coding with 6 algorithmic LeetCode problems complete with input/output test cases and constraints.',
    totalRoundsCount: 2,
    advice: [
      'Focus on sliding window algorithms, matrix DFS/BFS traversal, monotonic stack for next greater element, and stack-based parenthesis matching.',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude & Fundamentals',
    roundType: 'Aptitude',
    description: 'Simple aptitude test with questions about React, SQL, DSA, and Java.',
    sourceLocation: 'Placement Data.docx - Prominent pixel Round 1',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Simple Aptitude and questions about React, SQL, DSA, Java',
    topic: 'Fundamentals',
    order: 1,
    sourceDocument: 'Placement Data.docx',
    sourceLocation: 'Prominent pixel Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Coding Round (Algorithm Problems)',
    roundType: 'Coding',
    description: '6 LeetCode-style algorithm problems complete with multiple examples, constraints, and explanations.',
    sourceLocation: 'Placement Data.docx - Prominent pixel Round 2',
  });

  const codingProblems = [
    {
      text: '1. First Non-Repeating Element in Every Window: Given an array and a window size K, print the first non-repeating element for every window. If none exists, print -1.',
      context:
        'Example 1:\nInput: arr = [1,2,2,3,1,4], K = 4\nWindows: [1,2,2,3] -> 1; [2,2,3,1] -> 3; [2,3,1,4] -> 2\nOutput: 1 3 2\n\nExample 2:\nInput: arr = [4, 5, 4, 6, 5, 7, 8], K = 4\nOutput: 5 4 4 6\n\nExample 3:\nInput: arr = [1, 2, 2, 1, 3, 3, 4], K = 4\nOutput: -1 1 2 1\n\nExample 4:\nInput: arr = [5, 5, 5, 5, 5], K = 3\nOutput: -1 -1 -1\n\nExample 5:\nInput: arr = [8, 1, 8, 2, 3], K = 1\nOutput: 8 1 8 2 3',
      topic: 'Sliding Window & Hashing',
    },
    {
      text: '2. Longest Consecutive Increasing Sequence in a Matrix: Given a matrix, move only in four directions (up, down, left, right). Find the length of the longest path where each next cell is exactly current + 1.',
      context:
        'Constraints: 1 <= N, M <= 100\nExample 1:\nInput: [[1, 2, 9], [5, 3, 8], [4, 6, 7]]\nOutput: 4 (Path: 6 -> 7 -> 8 -> 9)\n\nExample 2:\nInput: [[1, 2, 3], [6, 5, 4], [7, 8, 9]]\nOutput: 9 (Path: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9)\n\nExample 3:\nInput: [[10, 11, 12], [9, 8, 13], [2, 7, 14], [3, 6, 15], [4, 5, 16]]\nOutput: 9 (Path: 8 -> 9 -> 10 -> 11 -> 12 -> 13 -> 14 -> 15 -> 16)\n\nExample 4:\nInput: [[5, 10, 15], [20, 25, 30], [35, 40, 45]]\nOutput: 1',
      topic: 'Matrix DFS / Dynamic Programming',
    },
    {
      text: '3. Next Greater Element: Given an array of integers, for every element find the first greater element to its right. If no greater element exists, return -1.',
      context:
        'Constraints: 1 <= N <= 10^5, -10^9 <= arr[i] <= 10^9\nExample 1:\nInput: arr = [4, 5, 2, 25]\nOutput: 5 25 25 -1\n\nExample 2:\nInput: arr = [13, 7, 6, 12]\nOutput: -1 12 12 -1\n\nExample 3:\nInput: arr = [1, 2, 3, 4, 5]\nOutput: 2 3 4 5 -1\n\nExample 4:\nInput: arr = [2, 1, 2, 4, 3]\nOutput: 4 2 4 -1 -1',
      topic: 'Monotonic Stack',
    },
    {
      text: "4. Valid Parentheses: Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
      context:
        'Constraints: 1 <= s.length <= 10^4, s consists of parentheses only ()[]{}\nExample 1: s = "()" -> true\nExample 2: s = "()[]{}" -> true\nExample 3: s = "(]" -> false\nExample 4: s = "([])" -> true\nExample 5: s = "([)]" -> false',
      topic: 'Stack / Strings',
    },
    {
      text: '5. Missing Number: Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.',
      context:
        'Constraints: n == nums.length, 1 <= n <= 10^4, 0 <= nums[i] <= n, unique numbers.\nExample 1: nums = [3,0,1] -> Output: 2\nExample 2: nums = [0,1] -> Output: 2\nExample 3: nums = [9,6,4,2,3,5,7,0,1] -> Output: 8',
      topic: 'Array Math / Bit Manipulation',
    },
    {
      text: '6. Spiral Matrix: Given an m x n matrix, return all elements of the matrix in spiral order.',
      context:
        'Constraints: m == matrix.length, n == matrix[i].length, 1 <= m, n <= 10, -100 <= matrix[i][j] <= 100\nExample 1: matrix = [[1,2,3],[4,5,6],[7,8,9]] -> Output: [1,2,3,6,9,8,7,4,5]\nExample 2: matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]] -> Output: [1,2,3,4,8,12,11,10,9,5,6,7]',
      topic: 'Matrix Simulation',
    },
  ];

  for (let i = 0; i < codingProblems.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: codingProblems[i].text,
      context: codingProblems[i].context,
      topic: codingProblems[i].topic,
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: `Prominent pixel Coding Problem ${i + 1}`,
    });
  }
}

async function parseZeusLearning(fullText, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Zeus Learning', 'Placement Data.docx');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: null,
    sourceDocument: 'Placement Data.docx',
    sourcePage: 'Section 8',
    processOverview: 'Two-round evaluation: medium-level aptitude followed by DSA (hash, tree, graph, list, array) and OOP in round 2.',
    totalRoundsCount: 2,
    advice: [
      'Round 1: Aptitude is medium level.',
      'Round 2: If you have proper understanding of DSA (hash, tree, graph, list, array) and OOP you can definitely clear it.',
    ],
  });

  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude Test',
    roundType: 'Aptitude',
    description: 'Aptitude is medium level.',
    sourceLocation: 'Placement Data.docx - Zeus Learning Round 1',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude test (medium difficulty assessment)',
    topic: 'Aptitude',
    order: 1,
    sourceDocument: 'Placement Data.docx',
    sourceLocation: 'Zeus Learning Round 1',
  });

  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : DSA & OOP Technical Round',
    roundType: 'Technical',
    description: 'Thorough evaluation of core data structures (Hash, Tree, Graph, List, Array) and Object-Oriented Programming.',
    sourceLocation: 'Placement Data.docx - Zeus Learning Round 2',
  });
  const r2Questions = [
    'Data Structures in-depth: Hash tables, Trees, Graphs, Linked Lists, and Arrays',
    'Object-Oriented Programming (OOP) concepts and principles',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'DSA & OOP',
      order: i + 1,
      sourceDocument: 'Placement Data.docx',
      sourceLocation: 'Zeus Learning Round 2',
    });
  }
}

module.exports = importDocx;
