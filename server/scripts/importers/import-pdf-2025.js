const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const Company = require('../../src/models/Company');
const InterviewExperience = require('../../src/models/InterviewExperience');
const InterviewRound = require('../../src/models/InterviewRound');
const Question = require('../../src/models/Question');

const pdf2025Path = path.resolve(__dirname, '..', '..', '..', 'Questions TnP 2025.pdf');

async function importPdf2025({ getOrCreateCompany, report }) {
  console.log('--- Processing Document 3: Questions TnP 2025.pdf ---');
  if (!fs.existsSync(pdf2025Path)) {
    console.error(`File not found: ${pdf2025Path}`);
    report.errors.push(`File not found: ${pdf2025Path}`);
    return;
  }

  const buffer = fs.readFileSync(pdf2025Path);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const pages = result.pages;

  // Pages 1-2: Tark Technologies LLP.
  const tarkText = (pages[0]?.text || '') + '\n' + (pages[1]?.text || '');
  await parseTark2025(tarkText, getOrCreateCompany, report);

  // Page 3: silver touch
  await parseSilverTouch2025(pages[2].text, getOrCreateCompany, report);

  // Page 4: TATVASOFT
  await parseTatvasoft2025(pages[3].text, getOrCreateCompany, report);

  // Page 5: GATEWAY
  await parseGateway2025(pages[4].text, getOrCreateCompany, report);

  // Page 6: RKIT | FULLSTACK DEV
  await parseRkit2025(pages[5].text, getOrCreateCompany, report);

  // Page 7: TSS Consultancy Private Limited
  await parseTss2025(pages[6].text, getOrCreateCompany, report);

  // Page 8: Unheaded experience [React Native / C#.NET Role]
  await parseUnassignedPage8_2025(pages[7].text, getOrCreateCompany, report);

  // Page 9: ProminentPixel (Jr. Software Engineer)
  await parseProminentPixel2025(pages[8].text, getOrCreateCompany, report);

  // Page 10: IMPROWISED TECHNOLOGIES
  await parseImprowised2025(pages[9].text, getOrCreateCompany, report);

  // Page 11: TechXperts
  await parseTechXperts2025(pages[10].text, getOrCreateCompany, report);

  // Page 12: Einfochips - An ARROW Company
  await parseEinfochips2025(pages[11].text, getOrCreateCompany, report);

  // Page 13: E-Sparkbiz
  await parseEsparkBiz2025(pages[12].text, getOrCreateCompany, report);

  // Pages 14-15: Unheaded experience [Frontend & Backend Developer Role]
  const unassigned14Text = (pages[13]?.text || '') + '\n' + (pages[14]?.text || '');
  await parseUnassignedPages14_15_2025(unassigned14Text, getOrCreateCompany, report);

  // Page 16: SAMPAARSH TECHNOLOGY
  await parseSampaarsh2025(pages[15].text, getOrCreateCompany, report);

  // Page 17: Silent Infotech
  await parseSilentInfotech2025(pages[16].text, getOrCreateCompany, report);

  console.log('Questions TnP 2025.pdf imported successfully.');
}

async function parseTark2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Tark Technologies LLP.', 'Questions TnP 2025.pdf');
  report.duplicatesDetected.push({
    companyName: company.name,
    duplicateAlias: 'Tark Technologies LLP. (2025 PDF)',
    actionTaken: 'Mapped to canonical Tark Technologies',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Pages 1-2',
    processOverview:
      'Total Rounds: 5. Round 1 Online test (5 sections including pizza party and comma count problems), Round 2 Real life handwritten problem, Round 3 Technical Interview 1, Round 4 Technical Interview 2 (SQL vs MongoDB schema comparison & Computer Networks), Round 5 HR Interaction.',
    totalRoundsCount: 5,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 - Online test',
    roundType: 'Aptitude',
    description: 'Section 1 MCQs, Section 2 Paragraph comprehension, Section 3 Problem Solving (Pizza party & Comma count), Section 4 OOP, Section 5 SQL.',
    sourceLocation: 'Questions TnP 2025.pdf Page 1',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 1 - MCQs related to HTML, DS, C, Java, SQL etc.',
      topic: 'MCQs',
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 2 - MCQs in which you have to find the answer from the given paragraph.',
      topic: 'Comprehension',
      order: 2,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText:
        'Problem 1 (Pizza Party): Alice wants to give a pizza party to his friends. But he wants to invite as many friends so that everyone gets maximum pizza and does not have to cut the pizza. Some of his friends are already present in the party. Given number of pizzas and number of available friends, find the sum of the digits of the total number of friends so everyone gets maximum pizza without cutting.',
      context:
        'Example:\nInput: pizza = 24, friends = 10\nOutput: 3\nExplanation: available friends is 10, hence alice needs to invite two more friends so everyone can get 2 pizzas. Therefore total number of friends will be 12 and 1 + 2 = 3.',
      topic: 'Problem Solving Math',
      order: 3,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 1 Section 3 Q1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText:
        'Problem 2 (Comma Count): Given an integer n. You have to find sum of total number of commas in the numbers from 0 to n. Each number has comma in it after every three digits from right to left (e.g. 12,234 has 1 comma, 4,525,670 has 2 commas).',
      context:
        'Example:\nInput: n = 1010\nOutput: 11\nExplanation: numbers containing commas from 0 to 1010 are 1,001 to 1,010. Hence total commas are 11.',
      topic: 'Problem Solving Math',
      order: 4,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 1 Section 3 Q2',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 4 - OOP: Implement functions for calculating different shapes perimeter.',
      topic: 'OOP',
      order: 5,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 1 Section 4',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 5 - SQL: Query related to GROUP BY, JOIN, ORDER BY and WHERE clauses.',
      topic: 'SQL',
      order: 6,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 1 Section 5',
    },
  ]);

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 - Real life problem (hand written)',
    roundType: 'Technical',
    description: 'Given a problem statement, write Data Structures and necessary classes required for solution; initialization and algorithm of the solution.',
    sourceLocation: 'Questions TnP 2025.pdf Page 1',
  });
  await Question.create({
    round: r2._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Given a real-life problem statement: write Data Structures and necessary classes required for solution of the problem; initialization and Algorithm of the solution.',
    topic: 'Real-life System & Class Design',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'Tark 2025 Round 2',
  });

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 - Technical Interview - 1',
    roundType: 'Technical',
    description: 'Modifications to Round 2 problem, Greedy vs DP, and Recursion tradeoffs.',
    sourceLocation: 'Questions TnP 2025.pdf Page 1',
  });
  const r3Questions = [
    '1) Give me Introduction about yourself.',
    '2) Modification in the question asked in round 2: after modification, what will be the changes in the Data Structures and necessary classes that you defined in your solution?',
    '3) Questions regarding the projects.',
    '4) What is Greedy Approach?',
    '5) Difference between Greedy approach and Dynamic Programming Approach. Which of these two do you prefer while solving a particular problem and why?',
    '6) Disadvantages of Recursion. And how to overcome them?',
    '7) What is the difference between HashMap and HashSet?',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical Interview 1',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 - Technical Interview - 2',
    roundType: 'Technical',
    description: 'MongoDB vs SQL database schema design, aggregation, and Computer Networks.',
    sourceLocation: 'Questions TnP 2025.pdf Pages 1-2',
  });
  const r4Questions = [
    '1) Give me Introduction about yourself.',
    '2) In which languages do you have expertise?',
    '3) Differences between SQL and MongoDB.',
    '4) In a MongoDB collection, employee details are stored in an array in the employee key. Each element contains employee name (string) and skills (array of objects: language and rating out of 10). Write a MongoDB query that gives the count of employees using the most programming languages, the name of that language, and details of each employee.',
    '5) If the same details I want to store in SQL, what is the schema and how many tables does it require to store such data? Which columns become primary keys and foreign keys?',
    '6) Write a query in SQL to do the same task as question 4.',
    '7) Questions Related to Computer Networks: i) When you send a request to a website (e.g. www.google.com), how does the browser know which website to render?',
    '8) What is OSI model? Explain all layers.',
    '9) What is TCP/IP protocol suite?',
    '10) What is IP address? Explain Uniqueness of IP addresses.',
    '11) Difference between IPv4 and IPv6.',
    '12) What is DNS?',
    '13) What is HTTP, HTTPS, and FTP?',
    '14) Client-Server Communication cycle.',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'Database Design & Computer Networks',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 4',
    });
  }

  // Round 5
  const r5 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 5,
    roundOrder: 5,
    roundName: 'Round 5 - HR Interaction',
    roundType: 'HR',
    description: 'Introduction, family background, engineering choice, and inspiration.',
    sourceLocation: 'Questions TnP 2025.pdf Page 2',
  });
  const r5Questions = [
    '1) Give me Introduction about yourself.',
    '2) Discuss your family background.',
    '3) Why did you select Computer Engineering?',
    '4) What or Who is your inspiration?',
    '5) How do you motivate yourself?',
  ];
  for (let i = 0; i < r5Questions.length; i++) {
    await Question.create({
      round: r5._id,
      experience: exp._id,
      company: company._id,
      questionText: r5Questions[i],
      topic: 'HR Interaction',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Tark 2025 Round 5',
    });
  }
}

async function parseSilverTouch2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('silver touch', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 3',
    processOverview:
      'Two-round evaluation: Round 1 Apti + Technical MCQ (online) with two coding programs (sliding window / reverse array and OOP classes); Round 2 Technical Interview (resume-based, SQL rollback/commit, Tic-Tac-Toe coding, React/Node components, and DP/backtracking/graph algorithms).',
    totalRoundsCount: 2,
    advice: ['Note: They mainly ask questions based on what you write on your resume.'],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Apti + Technical MCQ (online round)',
    roundType: 'Aptitude',
    description: 'Aptitude MCQs, OOP concepts, basic SQL, and two coding programs.',
    sourceLocation: 'Questions TnP 2025.pdf Page 3',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '1. Aptitude MCQs',
      topic: 'Aptitude',
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silver Touch 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '2. OOP concepts, basic SQL, programming concepts etc.',
      topic: 'Technical MCQs',
      order: 2,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silver Touch 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '3. Program 1: String or pattern matching, sliding window problem, reverse given array etc.',
      topic: 'Coding Program',
      order: 3,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silver Touch 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '4. Program 2: Implement OOPs concepts in program: create classes and their objects to implement predefined functions.',
      topic: 'OOP Implementation',
      order: 4,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silver Touch 2025 Round 1',
    },
  ]);

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Technical Interview',
    roundType: 'Technical',
    description: 'Resume-driven interview covering SQL transactions, game logic implementation, React/Node components, and advanced algorithms.',
    sourceLocation: 'Questions TnP 2025.pdf Page 3',
  });
  const r2Questions = [
    '1. SQL: JOIN queries, ROLLBACK and COMMIT transaction queries, and other basic queries',
    '2. Write Tic-Tac-Toe game code for two-player and single-player (vs AI/computer)',
    '3. Create components in React, backend using JavaScript (Node.js)',
    '4. Medium and hard programming problems: Dynamic Programming, Recursion, Backtracking, DFS/BFS, Two-Pointers',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silver Touch 2025 Round 2',
    });
  }
}

async function parseTatvasoft2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('TATVASOFT', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer (.Net/Node/Java/PHP/iOS/Android/React/React Native)',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 4',
    processOverview:
      'Total Round - 3. Round 1 Online test (80 MCQ, negative marking 50% or 100% based on question marks), Round 2 Technical Interview (3 aptitude questions, pattern programs, recursion, DBMS table joins).',
    totalRoundsCount: 3,
    advice: [
      'Note: Dont use Programiz website for online compilation as it generates wrong output in some cases. Use other online compiler instead.',
      'Negative mark system in 2025: 50% or 100% deduction for each wrong answer based on the questions (1 or 2 marks MCQ questions).',
      'Note: Here also do program of patterns with recursion also, DBMS basic to TABLE Joins.',
      'References: https://www.programiz.com/c-programming/examples/pyramid-pattern | https://www.geeksforgeeks.org/pattern-programs-in-c/',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Online Test',
    roundType: 'Aptitude',
    description: 'Total 80 MCQs (negative marking 50% or 100% based on questions; 1 or 2 mark questions). 35 Aptitude, 35 Reasoning, 10 Technical.',
    sourceLocation: 'Questions TnP 2025.pdf Page 4',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '35 MCQs - Aptitude section',
      topic: 'Aptitude',
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TATVASOFT 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '35 MCQs - Reasoning section',
      topic: 'Reasoning',
      order: 2,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TATVASOFT 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '10 MCQs - Technical (Language fundamentals & SQL queries)',
      topic: 'Technical',
      order: 3,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TATVASOFT 2025 Round 1',
    },
  ]);

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Technical Interview',
    roundType: 'Technical',
    description: 'Asked 3 aptitude questions, introduction, language fundamentals, string/array programs, OOP concepts, pattern programs (with recursion), and DBMS table joins.',
    sourceLocation: 'Questions TnP 2025.pdf Page 4',
  });
  const r2Questions = [
    { text: '3 Aptitude Questions asked during interview', topic: 'Aptitude' },
    { text: 'Introduction and Language fundamentals', topic: 'Introduction' },
    { text: 'Basic programs of String and Array', topic: 'Programming' },
    { text: 'OOPs Concepts and practical demonstrations', topic: 'OOP' },
    {
      text: 'Pattern Program 1: Print numeric triangle\n1\n2 3\n4 5 6\n7 8 9 10',
      context: 'Progressive integer triangle pattern',
      solutionUrl: 'https://www.geeksforgeeks.org/pattern-programs-in-c/',
      topic: 'Pattern Program',
    },
    {
      text: 'Pattern Program 2: Print alternating reversed numeric triangle\n1\n3 2\n6 5 4\n10 9 8 7',
      context: 'Reverse order row number pattern',
      solutionUrl: 'https://www.programiz.com/c-programming/examples/pyramid-pattern',
      topic: 'Pattern Program',
    },
    { text: 'Pattern programs implemented with recursion', topic: 'Recursion Patterns' },
    { text: 'DBMS fundamentals to multi-table SQL JOINs', topic: 'DBMS' },
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i].text,
      context: r2Questions[i].context || '',
      solutionUrl: r2Questions[i].solutionUrl || '',
      topic: r2Questions[i].topic,
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TATVASOFT 2025 Round 2',
    });
  }
}

async function parseGateway2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('GATEWAY', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 5',
    processOverview:
      'Total Rounds: 4. Round 1 Aptitude Test (Online Assessment: Math, Reasoning, English, Git/GitHub), Round 2 Technical Coding Test (Frontend Toggle/Increment, Backend SQL/C#, Nested DOM), Round 3 HR Round (detailed personal & bond questions), Round 4 Technical Interview.',
    totalRoundsCount: 4,
    advice: [
      'Practice DSA questions thoroughly.',
      'Try to improve your English speaking skills (practicing GD with friends will help a lot).',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude Test (Online Assessment)',
    roundType: 'Aptitude',
    description: '1. Mathematics and reasoning; 2. English + Grammar; 3. Questions related to Git and GitHub.',
    sourceLocation: 'Questions TnP 2025.pdf Page 5',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Mathematics and reasoning section',
      topic: 'Math & Reasoning',
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'GATEWAY 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'English language and grammar section',
      topic: 'English',
      order: 2,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'GATEWAY 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Questions related to Git and GitHub (branches, commits, remotes, pull requests)',
      topic: 'Git & GitHub',
      order: 3,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'GATEWAY 2025 Round 1',
    },
  ]);

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Technical Coding Test (Online Assessment)',
    roundType: 'Coding',
    description: 'Frontend programming, Backend & Database, and DSA questions.',
    sourceLocation: 'Questions TnP 2025.pdf Page 5',
  });
  const r2Questions = [
    {
      text: 'Frontend: Implement a Toggle Button component in React.js',
      solutionUrl: 'https://medium.com/@nishaadequate123/toggle-button-in-react-js-technical-chamber-644475687eb0',
      topic: 'React Frontend',
    },
    {
      text: 'Frontend: Implement on-click increment number functionality',
      solutionUrl: 'https://stackoverflow.com/questions/9186346/onclick-increment-number',
      topic: 'Frontend Interaction',
    },
    {
      text: "Backend & Database: Simple SQL query using 'WHERE' and 'SUM()'",
      solutionUrl: '',
      topic: 'SQL',
    },
    {
      text: 'Backend: Removing null and empty data from the given string using C# / Convert string to JSON object',
      solutionUrl: 'https://www.techieclues.com/blogs/how-to-convert-a-string-to-json-object-in-csharp',
      topic: 'C# Backend',
    },
    {
      text: 'DSA Question: Check if DOM elements are correctly nested (using stack)',
      solutionUrl: 'https://stackoverflow.com/questions/62462345/how-to-check-if-dom-elements-are-correctly-nested',
      topic: 'DSA - Stack',
    },
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i].text,
      solutionUrl: r2Questions[i].solutionUrl,
      topic: r2Questions[i].topic,
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'GATEWAY 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : HR Round',
    roundType: 'HR',
    description: 'Detailed behavioral, team dynamics, internship commitment, and bond discussion.',
    sourceLocation: 'Questions TnP 2025.pdf Page 5',
  });
  const r3Questions = [
    '1) Introduce yourself (including family details).',
    '2) Why do you want to do this job and not pursue Master\'s degree? Do you have any plans for higher studies?',
    '3) What do you like about Gateway that made you apply for this job?',
    '4) You have completed an internship, so why are you not asking them for a full-time role and applying here instead?',
    '5) In your group projects, have you faced issues where another team member was not doing their part of the task?',
    '6) What will you do if one of your team members is not doing their job in the company? (As a team member, not leader).',
    '7) You know the terms of the bond, so have you talked to your parents? What are your thoughts about this 39-month commitment (including 2.5 years post-internship)?',
    '8) Why do you want to join us, knowing that stipend during internship may or may not be provided?',
    '9) Has it happened to you that a team member was unable to complete their assigned task? How did you handle that situation?',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'HR Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'GATEWAY 2025 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 : Technical Interview',
    roundType: 'Technical',
    description: 'Projects, unlisted technologies, and technical skills mentioned in resume.',
    sourceLocation: 'Questions TnP 2025.pdf Page 5',
  });
  const r4Questions = [
    '1) Questions related to the projects mentioned in your resume.',
    '2) Have you worked on other technologies that you have not mentioned in your resume?',
    '3) Questions related to specific technical skills mentioned in your resume.',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'GATEWAY 2025 Round 4',
    });
  }
}

async function parseRkit2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('RKIT', 'Questions TnP 2025.pdf');
  report.duplicatesDetected.push({
    companyName: company.name,
    duplicateAlias: 'RKIT | FULLSTACK DEV (2025 PDF)',
    actionTaken: 'Mapped to canonical RKIT Software Pvt Ltd',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Full Stack Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 6',
    processOverview:
      'Total Rounds: 5. Round 1 Aptitude test (30 MCQs in 1 hr across 8 topics), Round 2 Personal interview (HR + Technical), Round 3 Descriptive test (13 questions in 45 mins), Round 4 Technical round at RKIT office (1 hr 30 mins implementing banking console app without libraries), Round 5 Panel interview.',
    totalRoundsCount: 5,
    alumniContributions: [
      {
        name: 'Priyansh Khunt',
        githubUrl: 'https://github.com/KHUNTPRIYANSH/rk_que',
        notes: 'Alumni repository containing the banking console application solution for RKIT Round 4.',
      },
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 | Aptitude test',
    roundType: 'Aptitude',
    description: 'MCQ pen-paper based test (1 hr / 30 MCQs) covering 8 topics: verbal, arithmetic/geometry, pictographs, OOP/C outputs, JS basics, Software Engineering/Agile, CN, and OS.',
    sourceLocation: 'Questions TnP 2025.pdf Page 6',
  });
  const r1Topics = [
    '1. Verbal aptitude',
    '2. Arithmetic questions: age, time & work, train, profit & loss, % change, Volume and Surface Area',
    '3. Pictograph questions',
    '4. OOP (Java, C++, C#) and output-based questions of C language',
    '5. JavaScript basics',
    '6. Software Engineering questions (Agile models, testing)',
    '7. Computer Networks basics',
    '8. Operating Systems basics',
  ];
  for (let i = 0; i < r1Topics.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: r1Topics[i],
      topic: 'Aptitude & Technical MCQs',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'RKIT 2025 Round 1',
    });
  }

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 | Personal interview (HR + Technical)',
    roundType: 'Technical',
    description: 'Extensive interview covering introduction, hobbies, basic Java OOP, SQL views/cursors/triggers, patterns, DB-API connection, future goals, DOM questions, and .NET/C#.',
    sourceLocation: 'Questions TnP 2025.pdf Page 6',
  });
  const r2Questions = [
    '1. Introduce yourself',
    '2. Hobbies and interests',
    '3. Basic OOP in Java',
    '4. SQL queries for creating Views, Cursors, and Triggers',
    "5. Numeric triangle pattern ending with * (don't mug up, logic tested live)",
    '6. Code to connect database with API (e.g. PHP + MySQL or Node + Mongo)',
    '7. Future plans, career goals, and scenario-based questions',
    '8. What makes you different from others?',
    '9. JavaScript DOM manipulation and onclick events',
    '10. .NET / C# questions',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Personal & Technical',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'RKIT 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 | Descriptive test (13 questions in 45 mins)',
    roundType: 'Technical',
    description: 'Written descriptive assessment testing low-level programming, algorithms, and systems concepts.',
    sourceLocation: 'Questions TnP 2025.pdf Page 6',
  });
  const r3Questions = [
    '1. Difference between free() and delete() in C++',
    '2. SQL queries for complete CRUD operations',
    '3. Code to implement Stack (push, pop) using Linked List (code linked list first, then implement stack)',
    '4. How Merge Sort works, with step-by-step example',
    '5. How Quick Sort works, with step-by-step example',
    '6. About Agile and its software process models',
    '7. Question from Computer Networks',
    '8. OOP-based design question',
    '9. Difference between user thread vs kernel thread in Operating Systems',
    '10. Shortest Remaining Time First (SRTF) vs Shortest Job First (SJF) CPU scheduling',
    '11. Advanced concept question (Unable to recall in original notes)',
    '12. Advanced concept question (Unable to recall in original notes)',
    '13. Advanced concept question (Unable to recall in original notes)',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Descriptive Test',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'RKIT 2025 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 | Technical round at RKIT office [1hr 30min]',
    roundType: 'Coding',
    description:
      'Implement a complete banking console application using Java, C++, or C. No internet or external libraries permitted. Strict time limit of 1 hour 30 minutes.',
    instructions: 'No use of internet or external libraries and time bounded.',
    sourceLocation: 'Questions TnP 2025.pdf Page 6',
  });
  await Question.create({
    round: r4._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Implement a Banking Console Application using Java, C++, or C with account creation, deposits, withdrawals, interest, and transaction history.',
    context: 'Strictly without external libraries or internet access. Time limit: 90 minutes.',
    solutionUrl: 'https://github.com/KHUNTPRIYANSH/rk_que',
    topic: 'Console Application Design',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'RKIT 2025 Round 4',
  });

  // Round 5
  const r5 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 5,
    roundOrder: 5,
    roundName: 'Round 5 | Panel interview',
    roundType: 'Panel',
    description:
      'Questions about background, prior work experience, interests, personal details, along with in-depth technical questions similar to previous rounds.',
    sourceLocation: 'Questions TnP 2025.pdf Page 6',
  });
  await Question.create({
    round: r5._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Panel discussion on personal background, prior experience, project architecture, and cross-discipline technical depth.',
    topic: 'Panel Interview',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'RKIT 2025 Round 5',
  });
}

async function parseTss2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('TSS Consultancy Private Limited', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 7',
    processOverview:
      'Total 3 rounds: Round 1 Online Apti test (3 sections: OOP 10 MCQ, Apti 30 MCQ, 2 Technical coding problems); Round 2 Personal technical interview taken by junior developer (strictly NO libraries or built-in functions allowed); Round 3 Offline technical interview #2 at TSS office.',
    totalRoundsCount: 3,
    advice: [
      'Remember you CANNOT use libraries in technical questions: not even Java Collections framework, C++ STL, built-in sorting/searching/swap/reverse algorithms, and not even string methods in C++/C. Must use primitive char arrays and raw pointers.',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 | Aptitude test online (3 sections)',
    roundType: 'Aptitude',
    description: '1. OOP 10 MCQs; 2. Aptitude 30 MCQs; 3. Technical coding questions.',
    sourceLocation: 'Questions TnP 2025.pdf Page 7',
  });
  const r1Questions = [
    'Section 1: 10 OOP MCQs',
    'Section 2: 30 Aptitude MCQs',
    'Section 3 Coding Q1: Return all palindromes from given integer array',
    'Section 3 Coding Q2: Star (*) pattern printing (Triangle)',
    'Section 3 Coding Q3: Calculate GCD and LCM of numbers',
    'Section 3 Coding Q4: Generate Pascal Triangle',
  ];
  for (let i = 0; i < r1Questions.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: r1Questions[i],
      topic: 'Online Assessment',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TSS 2025 Round 1',
    });
  }

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 | Personal technical interview (taken by junior developer)',
    roundType: 'Technical',
    description:
      'Conducted by junior developer. Zero external libraries permitted (no STL, Collections, or string helper methods).',
    instructions:
      'Remember: You cannot use libraries in technical questions, not even Java Collection Framework, C++ STL, built-in sorting/searching/swap/reverse algorithms, and not even string/stringstream methods in C/C++. Must do everything with char arrays.',
    sourceLocation: 'Questions TnP 2025.pdf Page 7',
  });
  const r2Questions = [
    {
      text: '1. Merge two sorted arrays (You can only use 1 loop; you do not have to print, just sort both arrays)',
      topic: 'Array Algorithms',
    },
    {
      text: '2. Reverse words in a string (e.g. given "today is Sunday" make it "Sunday is today") using only primitive char arrays without string or stringstream methods',
      topic: 'String Manipulation',
    },
    {
      text: '3. Josephus problem algorithm and implementation',
      solutionUrl: 'https://www.youtube.com/watch?v=46zD5d9y9b4&t=365s',
      topic: 'Recursion / Math',
    },
    {
      text: '4. Given an array, find the element having highest frequency. If multiple exist, return -1',
      topic: 'Array Frequency',
    },
    {
      text: '5. Difference between Primary Key, NULL, and Unique Key in SQL + Queries related to JOIN operations',
      topic: 'SQL',
    },
    {
      text: '6. Encode string: Run-length encoding (e.g. encode "aaabbceff" to "3a2b1c1e2f")',
      topic: 'String Encoding',
    },
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i].text,
      solutionUrl: r2Questions[i].solutionUrl || '',
      topic: r2Questions[i].topic,
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TSS 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 | Technical interview #2 at TSS office offline',
    roundType: 'Technical',
    description: 'Offline interview at TSS office covering OOP, DBMS, dynamic method dispatching, DP, and string matching.',
    sourceLocation: 'Questions TnP 2025.pdf Page 7',
  });
  const r3Questions = [
    '1. OOP or DBMS related basic questions',
    '2. Implement dynamic method dispatching + multiple inheritance within a single code file',
    '3. Making change problem (Dynamic Programming)',
    '4. Josephus problem deep-dive',
    '5. Longest prefix which is also suffix in string (KMP Algorithm prefix function)',
    '6. Given an array of words and a long string, determine if the long string can be formed by concatenating words from the array (Word Break)',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Advanced Technical',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TSS 2025 Round 3',
    });
  }
}

async function parseUnassignedPage8_2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('[Unassigned - React Native / C#.NET Role]', 'Questions TnP 2025.pdf');
  report.flaggedRecords.push({
    recordType: 'Unassigned Experience',
    name: 'React Native / C#.NET Experience (Page 8)',
    reason: 'Questions TnP 2025.pdf Page 8 contains interview questions without an explicit company header. Flagged for review.',
    sourceLocation: 'Questions TnP 2025.pdf Page 8',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'React Native / C#.NET Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 8',
    processOverview:
      'Positions: 1) React Native dev; 2) C#.NET developer. Topics: Frontend (HTML, CSS, JS, jQuery, ReactJS, Next.js), Backend (C, C++, Java, Node.js, OOP), Database (MySQL, SQL, MongoDB). No rounds: only interview where candidates give self-points out of 10 for Frontend, Database, and Backend, and questions are asked based on points given.',
    totalRoundsCount: 1,
    needsReview: true,
    reviewNotes: 'Source document Page 8 did not specify company name. Preserved with questions and flagged for admin review.',
  });

  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Interview & Question (Rating-Based Interview)',
    roundType: 'Technical',
    description: 'Questions asked based on self-assigned ability score out of 10 across Frontend, Database, and Backend.',
    sourceLocation: 'Questions TnP 2025.pdf Page 8',
  });
  const questions = [
    'Step 1: Rate your ability out of 10 for Frontend, Database, and Backend. Questions asked dynamically based on scores.',
    'Question 1: What is the difference between creating a foreign key relationship and using a join to combine two tables? Is a foreign key required when joining two tables? What is the purpose of each approach and how do they differ in implementation?',
    'Question 2: How does React work when passing data between parent and child components, or vice versa? How can this be achieved, and which techniques, states, or hooks are used?',
    'Question 3: What is the difference between abstraction and encapsulation?',
    'Question 4: How does TypeScript work?',
    'Question 5: Explain the difference between Abstract Classes and Interfaces. When would you use each?',
    'HR Question 1: Tell me something about yourself?',
    'HR Question 2: If sometimes there are mistakes on your side, and you need to complete the task overnight, what should you do?',
  ];
  for (let i = 0; i < questions.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: questions[i],
      topic: 'Rating-Based Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Page 8 Unassigned Q',
    });
  }
}

async function parseProminentPixel2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('ProminentPixel', 'Questions TnP 2025.pdf');
  report.duplicatesDetected.push({
    companyName: company.name,
    duplicateAlias: 'ProminentPixel (Jr. Software Engineer) (2025 PDF)',
    actionTaken: 'Mapped to canonical Prominent Pixel',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Jr. Software Engineer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 9',
    processOverview:
      'Total 4 rounds: Round 1 Technical (JS fundamentals, matrix diagonals, swap, fibonacci); Round 2 Technical (JSX, React, HOF, OOP pillars, string immutability, pattern, prime numbers, factorial); Round 3 Technical (async/await, Redux vs useContext, circular linked list); Round 4 Technical & Analytical (election discussion, climate change solutions, character frequency, second largest element without sorting).',
    totalRoundsCount: 4,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 (Technical)',
    roundType: 'Technical',
    description: 'Self-intro, projects, JS variable scopes, hoisting, higher order functions, promises, sync vs async, useState & useEffect, matrix diagonals, swap, fibonacci.',
    sourceLocation: 'Questions TnP 2025.pdf Page 9',
  });
  const r1Questions = [
    'Tell me about yourself.',
    'Questions related to projects.',
    'Difference between let, const, and var.',
    'What is hoisting in JavaScript?',
    'What are higher order functions in JavaScript?',
    'What is a Promise?',
    'Difference between synchronous and asynchronous programming.',
    'What is the use of useState and useEffect?',
    'Write a program to print sum of diagonal elements of matrix.',
    'Swap two numbers without third variable.',
    'Write a program to print fibonacci series.',
  ];
  for (let i = 0; i < r1Questions.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: r1Questions[i],
      topic: 'Technical 1',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Prominent Pixel 2025 Round 1',
    });
  }

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 (Technical)',
    roundType: 'Technical',
    description: 'JSX, React, map/filter/reduce, hooks, 4 pillars of OOP, string immutability, pattern, prime numbers, factorial.',
    sourceLocation: 'Questions TnP 2025.pdf Page 9',
  });
  const r2Questions = [
    'Questions related to projects.',
    'What is JSX?',
    'What is React and what is the use of it?',
    'What are map, filter, and reduce methods in JavaScript?',
    'What are hooks in React? Explain any two hooks.',
    'Which are the four main pillars of OOP?',
    'What is polymorphism?',
    'What is inheritance and its types?',
    'Why is string immutable?',
    'Write a program to print pattern.',
    'Write a program to print prime numbers between 1 to n.',
    'Write a program to calculate factorial of a number.',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical 2',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Prominent Pixel 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 (Technical)',
    roundType: 'Technical',
    description: 'Objects in JS, callbacks, async/await, APIs, spread/rest, props, useContext vs Redux, React routing, circular linked list.',
    sourceLocation: 'Questions TnP 2025.pdf Page 9',
  });
  const r3Questions = [
    'Questions related to projects.',
    'What are objects in JavaScript?',
    'Difference between synchronous and asynchronous programming.',
    'What is a callback?',
    'What is async/await?',
    'What is an API?',
    'Questions related to spread and rest operators.',
    'What is props in React?',
    'What is useContext and what was the need for it?',
    'What is Redux and how is it different from useContext?',
    'What is routing in React and how to implement it?',
    'What is an interface?',
    'Write a program to check whether a LinkedList is circular or not.',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical 3',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Prominent Pixel 2025 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 (Technical & Analytical)',
    roundType: 'Technical',
    description: 'Self-intro, family, interview reflections, general awareness (election, climate change), character frequency, second largest element without sorting.',
    sourceLocation: 'Questions TnP 2025.pdf Page 9',
  });
  const r4Questions = [
    'Tell me about yourself.',
    'Family background.',
    'How was the interview experience till now?',
    'Describe this year\'s election in 15 to 20 sentences.',
    'How to solve the problem of climate change?',
    'Write a program to print characters which repeat more than n/k times in a given string.',
    'Write a program to find the second largest element of the array without sorting the array.',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'Technical & Analytical',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Prominent Pixel 2025 Round 4',
    });
  }
}

async function parseImprowised2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('IMPROWISED TECHNOLOGIES', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer / DevOps / APS',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 10',
    processOverview:
      'Total 8 rounds for SE, 9 rounds for DevOps, 8 rounds for APS. Multi-round selection identical in structure to 2024: Aptitude, Open-Handed QA, HackerRank 501 darts, GD, role-specific technical, Code conversion with internet, DevOps deployment, Executive interview, and HR round.',
    totalRoundsCount: 9,
  });

  const rounds = [
    { num: 1, name: 'Round - 1 Aptitude', type: 'Aptitude', desc: 'Mixed questions of Aptitude and Reasoning.' },
    { num: 2, name: 'Round - 2 Open Handed Q-A', type: 'Technical', desc: 'Questions on projects, languages, and moral/thought process.' },
    { num: 3, name: 'Round - 3 Practical Test', type: 'Coding', desc: 'HackerRank test - 501 darts problem.' },
    { num: 4, name: 'Round - 4 Group Discussion', type: 'Group Discussion', desc: 'Topics: Social Media - boon or bane | OTT vs Cinema | Online money vs Offline money.' },
    { num: 5, name: 'Round 5(SE/DevOps/APS) - Technical Interview', type: 'Technical', desc: 'SQL joins, OOP pillars, Fibonacci, LinkedList without Collections, indexing, data structures.' },
    { num: 6, name: 'Round 6 - Code Conversion', type: 'Technical', desc: 'Code conversion into an unfamiliar programming language with internet access.' },
    { num: 7, name: 'Round 7 - Deployment (DevOps) / Executive Chat (SE/APS)', type: 'Technical', desc: 'Terminal Git/deployment tasks for DevOps or Executive conversation for SE/APS.' },
    { num: 8, name: 'Round 8 - HR round', type: 'HR', desc: 'Feedback, family background, 5-year vision, company research, and learnings.' },
  ];

  for (const r of rounds) {
    const roundDoc = await InterviewRound.create({
      experience: exp._id,
      company: company._id,
      roundNumber: r.num,
      roundOrder: r.num,
      roundName: r.name,
      roundType: r.type,
      description: r.desc,
      sourceLocation: 'Questions TnP 2025.pdf Page 10',
    });
    await Question.create({
      round: roundDoc._id,
      experience: exp._id,
      company: company._id,
      questionText: `${r.name}: ${r.desc}`,
      topic: r.type,
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Improwised 2025',
    });
  }
}

async function parseTechXperts2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('TechXperts', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 11',
    processOverview:
      'Two rounds: Round 1 Aptitude (reasoning, maths, coding & programming); Round 2 Technical Round (let/var/const, array access, loops, class/object real-life scenarios, encapsulation, inheritance, Pascal/Fibonacci pattern, GET vs POST, form submission).',
    totalRoundsCount: 2,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 Aptitude Round',
    roundType: 'Aptitude',
    description: 'Aptitude (reasoning, maths, coding & programming Questions).',
    sourceLocation: 'Questions TnP 2025.pdf Page 11',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude assessment (reasoning, maths, coding & programming questions)',
    topic: 'Aptitude',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'TechXperts 2025 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 Technical Round',
    roundType: 'Technical',
    description: 'Technical interview covering JavaScript, OOP real-life scenarios, patterns, and HTTP methods.',
    sourceLocation: 'Questions TnP 2025.pdf Page 11',
  });
  const r2Questions = [
    'let, var, and const difference in JavaScript',
    'How to access the second element of an array',
    'Entry-controlled vs exit-controlled loops',
    'Class and object explanation based on real-life scenarios',
    'What is the use of encapsulation? Explain with a project scenario',
    'What is the use of parent class and child class? Why should we use inheritance?',
    'Pascal triangle of Fibonacci series pattern',
    'Difference between GET & POST HTTP methods',
    'Form Submission lifecycle (request & response)',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'TechXperts 2025 Round 2',
    });
  }
}

async function parseEinfochips2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Einfochips - An ARROW Company', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 12',
    processOverview:
      'Total 4 rounds: Round 1 Online test (45 MCQs + LeetCode watering plants problem), Round 2 Technical Interview (resume, frontend, basic SQL/OOP), Round 3 Technical Interview (pattern, DSA approach, advance SQL & OOP), Round 4 HR Round (family & loyalty).',
    totalRoundsCount: 4,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 - Online test',
    roundType: 'Aptitude',
    description: 'Section 1: 45 MCQs related to Aptitude & Reasoning, DS, C, Java, SQL. Section 2: DSA Question (Easy to Moderate level).',
    sourceLocation: 'Questions TnP 2025.pdf Page 12',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 1 - 45 MCQs related to Aptitude & Reasoning, DS, C, Java, SQL etc.',
      topic: 'MCQs',
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Einfochips 2025 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 2 - DSA Question (e.g. LeetCode Watering Plants problem)',
      solutionUrl: 'https://leetcode.com/problems/watering-plants/description/',
      topic: 'DSA Problem',
      order: 2,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Einfochips 2025 Round 1',
    },
  ]);

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 - Technical Interview',
    roundType: 'Technical',
    description: 'Introduction, project questions, frontend basics (HTML/CSS), basic SQL, and OOP.',
    sourceLocation: 'Questions TnP 2025.pdf Page 12',
  });
  const r2Questions = [
    '1) Give me Introduction about yourself.',
    '2) Questions from your resume (about your projects & technology).',
    '3) Frontend questions (basics of HTML & CSS).',
    '4) Some basic SQL and OOP questions.',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical Interview 1',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Einfochips 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 - Technical Interview',
    roundType: 'Technical',
    description: 'Pattern question, DSA approach, advance SQL & OOP, resume technologies.',
    sourceLocation: 'Questions TnP 2025.pdf Page 12',
  });
  const r3Questions = [
    '1) Give me Introduction about yourself.',
    '2) Basic Pattern Question.',
    '3) Explain the approach you used in solving the online DSA question.',
    '4) Advance SQL & OOP questions.',
    '5) Questions about different technologies mentioned in your resume.',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical Interview 2',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Einfochips 2025 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 - HR Round',
    roundType: 'HR',
    description: 'Information about family and checking loyalty for the job.',
    sourceLocation: 'Questions TnP 2025.pdf Page 12',
  });
  await Question.create([
    {
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: '1) Information about family and background.',
      topic: 'HR',
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Einfochips 2025 Round 4',
    },
    {
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: '2) Check family background and your loyalty and long-term commitment for the job.',
      topic: 'HR',
      order: 2,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Einfochips 2025 Round 4',
    },
  ]);
}

async function parseEsparkBiz2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('E-Sparkbiz', 'Questions TnP 2025.pdf');
  report.duplicatesDetected.push({
    companyName: company.name,
    duplicateAlias: 'E-Sparkbiz (2025 PDF)',
    actionTaken: 'Mapped to canonical eSparkBiz',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 13',
    processOverview:
      'Total 5 rounds: Round 1 Online test (60 MCQs, no negative marking), Round 2 Coding Round (pen-paper: reverse array, recursive fibonacci, character frequency, etc.), Round 3 Technical Interview, Round 4 CTO Round, Round 5 HR Round.',
    totalRoundsCount: 5,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 - Online test',
    roundType: 'Aptitude',
    description: 'Aptitude + Reasoning + English + Data Structure + DBMS. Total 60 MCQs with no negative marking.',
    sourceLocation: 'Questions TnP 2025.pdf Page 13',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Total 60 MCQs (No negative marking): Aptitude + Reasoning + English + Data Structure + DBMS',
    topic: 'Online MCQs',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'eSparkBiz 2025 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 Coding Round (pen-paper)',
    roundType: 'Coding',
    description: 'Pen-and-paper coding round.',
    sourceLocation: 'Questions TnP 2025.pdf Page 13',
  });
  const r2Questions = [
    'Write a program to reverse the elements of an array.',
    'Implement a recursive function to print the Fibonacci series up to a certain number.',
    'Check how many times each character appears in a given string.',
    'Find second largest element in array',
    'Find Intersection in two arrays',
    'Find Vowel and consonant in given String',
    'Print 1 to n prime numbers',
    'Using 2 variables to swap numbers (without third variable)',
    'Print Pattern',
    'Check given number is palindrome or not',
    'Check given string is palindrome or not',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Pen-Paper Coding',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'eSparkBiz 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 Technical Interview',
    roundType: 'Technical',
    description: 'Questions on Round 2 code, OOP 4 pillars, Data Structures (Stack, Queue, LinkedList, Sorting), DBMS queries, React hooks, and Exception handling.',
    sourceLocation: 'Questions TnP 2025.pdf Page 13',
  });
  const r3Questions = [
    'Ask on Coding Round Program',
    'What are the 4 pillars of OOP? Explain each in detail',
    'What are SQL joins? Write basic query on paper',
    'What is Data Structure? Different types of data structure',
    'What is Stack? What is Queue? What is Linked List?',
    'What are sorting algorithms and types? Pseudo code and logic of Selection, Insertion, Bubble, Quick, and Merge sort',
    'What are databases and types? Queries: update, select, joins, insert, group by, order by',
    'Different types of joins and explain with examples',
    'What is Encapsulation? Abstraction? Polymorphism and its types?',
    'Method Overloading and Method Overriding difference',
    'What is Inheritance and its types?',
    'React hooks (if mentioned in resume/project)',
    'Questions about projects',
    'Exception Handling',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'eSparkBiz 2025 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 CTO Round',
    roundType: 'Technical',
    description: 'Tell me about yourself, OOP deep-dive on Static keyword, 4 pillars with real-time examples, learning outside coding.',
    sourceLocation: 'Questions TnP 2025.pdf Page 13',
  });
  await Question.create([
    {
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Tell me about yourself',
      topic: 'CTO Intro',
      order: 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'eSparkBiz 2025 Round 4',
    },
    {
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: 'What is OOP? Specially focus on Static Keyword and memory allocation',
      topic: 'CTO Technical',
      order: 2,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'eSparkBiz 2025 Round 4',
    },
    {
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: 'What are the 4 main pillars of OOP? Explain each with a real-time example',
      topic: 'CTO Technical',
      order: 3,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'eSparkBiz 2025 Round 4',
    },
    {
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: 'What have you learned outside of coding?',
      topic: 'CTO Behavioral',
      order: 4,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'eSparkBiz 2025 Round 4',
    },
  ]);

  // Round 5
  const r5 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 5,
    roundOrder: 5,
    roundName: 'Round 5 HR Round',
    roundType: 'HR',
    description: 'Norms of the company, salary, and bond duration.',
    sourceLocation: 'Questions TnP 2025.pdf Page 13',
  });
  await Question.create({
    round: r5._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Discuss about Norms of the Company, salary, and bond duration',
    topic: 'HR',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'eSparkBiz 2025 Round 5',
  });
}

async function parseUnassignedPages14_15_2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('[Unassigned - Frontend & Backend Role]', 'Questions TnP 2025.pdf');
  report.flaggedRecords.push({
    recordType: 'Unassigned Experience',
    name: 'Frontend & Backend Experience (Pages 14-15)',
    reason: 'Questions TnP 2025.pdf Pages 14-15 contain detailed Frontend and Backend interview questions without a company header. Flagged for review.',
    sourceLocation: 'Questions TnP 2025.pdf Pages 14-15',
  });

  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Frontend & Backend Developer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Pages 14-15',
    processOverview:
      'Contains detailed questions for both Frontend and Backend roles: Round 1 Aptitude test, Round 2 Technical interview (Frontend: HTML5, CSS animations, Tailwind CSS, Material UI, closures/hoisting, React hooks, Redux vs Context; Backend: OOP pillars, keywords, SQL joins/injection, pen-paper coding), Round 3 HR round, and CTO+HR evaluation.',
    totalRoundsCount: 4,
    needsReview: true,
    reviewNotes: 'Source document Pages 14-15 lacked an explicit company title. Flagged for administrator review to merge with the appropriate company (e.g. Vivansh Infotech).',
  });

  // Track 1: Frontend Round 2
  const rFe = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 1,
    roundName: 'Round-2 Technical Interview (Frontend Track)',
    roundType: 'Technical',
    description: 'HTML5 semantic tags, CSS animations/TailwindCSS/MUI, JS closures/hoisting, React hooks/Redux.',
    sourceLocation: 'Questions TnP 2025.pdf Page 14',
  });
  const feQuestions = [
    'HTML tags like <meta>, <link>, <iframe>, <script>, <video>, <audio> etc.',
    'Semantic tags in HTML5',
    'Types of display property and difference between them (block, inline, inline-block, flex, grid, none)',
    'CSS visibility, text-decoration, outline, border properties',
    'Various properties of CSS animations: timing-function, keyframes, delay, shorthand',
    'Types of CSS position and difference between them (static, relative, absolute, fixed, sticky)',
    'Explain box-sizing and media queries',
    'What is Tailwind CSS? List out any 5 classes of Tailwind CSS',
    'Questions on Material UI component library',
    'Difference between const, let, and var',
    'Closures and Hoisting in JavaScript',
    'async/await and Promises in JavaScript',
    'Live coding for DOM manipulation',
    'React hooks: useState, useEffect, useReducer, useMemo, useCallback in detail',
    'Prop drilling in React',
    'Benefits of Redux over useContext and the need for Redux',
    'Fragments in React',
    'Real DOM vs Virtual DOM',
    'Questions about client-side routing in React',
  ];
  for (let i = 0; i < feQuestions.length; i++) {
    await Question.create({
      round: rFe._id,
      experience: exp._id,
      company: company._id,
      questionText: feQuestions[i],
      topic: 'Frontend Development',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Pages 14-15 Frontend Q',
    });
  }

  // Track 2: Backend Round 2
  const rBe = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 - Personal Interview Round (Backend Track)',
    roundType: 'Technical',
    description: 'Introduce yourself, OOP 4 pillars with real-time examples, keywords, SQL joins/injection, pen-paper code.',
    sourceLocation: 'Questions TnP 2025.pdf Page 15',
  });
  const beQuestions = [
    'Introduce Yourself',
    'What is OOPs & 4 pillars of OOPs?',
    'What is Polymorphism & Explain real-time use of method overloading & method overriding?',
    'What is Inheritance & Explain with real-time example?',
    'What is Abstraction & Explain with real-time example?',
    'What is Encapsulation & Explain with real-time example?',
    'What is the difference between Abstraction and Encapsulation?',
    'static, super, and final keywords in Java',
    'What is a JOIN? Types of join',
    'What is GROUP BY? Use of GROUP BY and Aggregate Functions',
    'What is the difference between WHERE and HAVING?',
    'What is SQL Injection and prevention techniques?',
    'What is the difference between DELETE, DROP, and TRUNCATE?',
    'Pen-Paper program: Simple if-else program, reverse number, pattern printing',
  ];
  for (let i = 0; i < beQuestions.length; i++) {
    await Question.create({
      round: rBe._id,
      experience: exp._id,
      company: company._id,
      questionText: beQuestions[i],
      topic: 'Backend Development',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Pages 14-15 Backend Q',
    });
  }

  // CTO + HR
  const rCto = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : CTO + HR Evaluation',
    roundType: 'HR',
    description: '3rd largest salary query, single loop sorting, and family background.',
    sourceLocation: 'Questions TnP 2025.pdf Page 15',
  });
  const ctoQuestions = [
    '1. SQL query: find 3rd largest salary from given table',
    '2. Sort Array (Using only one loop without prebuilt functions)',
    '3. Family Background and career motivations',
  ];
  for (let i = 0; i < ctoQuestions.length; i++) {
    await Question.create({
      round: rCto._id,
      experience: exp._id,
      company: company._id,
      questionText: ctoQuestions[i],
      topic: 'CTO & HR',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Pages 14-15 CTO/HR',
    });
  }
}

async function parseSampaarsh2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('SAMPAARSH TECHNOLOGY', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer (Math & Visualization)',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 16',
    processOverview:
      'They wanted persons having strong skills in applied mathematics, trigonometry and 2D-3D visualization. Total 4 rounds: Round 1 Applied Math & Trigonometry (15 aptitude questions), Round 2 Technical Round (10 weighted questions in 1 hour), Round 3 Technical Java/OOP/AJP, Round 4 Personal details interview.',
    totalRoundsCount: 4,
    advice: [
      'They wanted candidates with strong skills in applied mathematics, trigonometry, and 2D-3D spatial visualization.',
      'Round 2 has explicit marks allocated per question (from 1 mark to 7 marks); prioritize according to your ability and time management.',
    ],
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Applied Mathematics & Trigonometry',
    roundType: 'Aptitude',
    description: 'Applied mathematics and trigonometry based 15 aptitude questions.',
    sourceLocation: 'Questions TnP 2025.pdf Page 16',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: '15 aptitude questions based on applied mathematics, trigonometry, and 2D-3D visualization',
    topic: 'Applied Mathematics',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'Sampaarsh 2025 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Technical Coding Round (10 Weighted Questions in 1 Hr)',
    roundType: 'Coding',
    description: '10 programming questions given to solve in 1 hour with explicit mark weights.',
    sourceLocation: 'Questions TnP 2025.pdf Page 16',
  });
  const r2Questions = [
    '1. Calculate the sum of first n natural numbers (1 mark)',
    '2. Check if given string is palindrome or not (1 mark)',
    '3. Check if given number is prime or not (1 mark)',
    '4. Program to find LCM of two numbers (1 mark)',
    '5. Print fibonacci series upto n (3 marks)',
    '6. Transpose of given matrix (3 marks)',
    '7. Selection sort - sort the array (3 marks)',
    '8. Program to remove duplicates from the array (3 marks)',
    '9. Program to find the median of two sorted arrays (7 marks)',
    '10. Check if a string containing parentheses is balanced or not using stack (7 marks)',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical Coding with Marks',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Sampaarsh 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : Java & OOPs Technical Round',
    roundType: 'Technical',
    description: 'Technical round covering basics of Java, OOP concepts in depth, and Advanced Java (AJP).',
    sourceLocation: 'Questions TnP 2025.pdf Page 16',
  });
  await Question.create({
    round: r3._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Basics of Java, Object-Oriented Programming concepts in depth, and Advanced Java (AJP) concepts',
    topic: 'Java & OOP',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'Sampaarsh 2025 Round 3',
  });

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 : Personal Interview',
    roundType: 'HR',
    description: 'Personal interview round - only personal details were asked.',
    sourceLocation: 'Questions TnP 2025.pdf Page 16',
  });
  await Question.create({
    round: r4._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Personal interview evaluating candidate background and details',
    topic: 'Personal',
    order: 1,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourceLocation: 'Sampaarsh 2025 Round 4',
  });
}

async function parseSilentInfotech2025(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Silent Infotech', 'Questions TnP 2025.pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: 2025,
    sourceDocument: 'Questions TnP 2025.pdf',
    sourcePage: 'Page 17',
    processOverview:
      'Total rounds: 3. Round 1 Aptitude test (Online Assessment with timed MCQs and 5-6 coding programs: Stock buy/sell, Median of two sorted arrays, Single number in pairs); Round 2 Technical coding test (Hospital DB design, Web architecture/DNS, OOP, DFS/BFS, bitwise div by 4, OSI/TCP layers); Round 3 HR + Technical (College DB design, linear/binary search, sorting, array sum pair, why GEC Rajkot, company research).',
    totalRoundsCount: 3,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1: Aptitude test (Online Assessment)',
    roundType: 'Aptitude',
    description: 'Timed MCQs (direction, pattern) and 5 to 6 coding programs.',
    sourceLocation: 'Questions TnP 2025.pdf Page 17',
  });
  const r1Questions = [
    '1. MCQs related to aptitude and reasoning (direction, pattern, etc.) with time limit for each question',
    '2. Coding Program: Best Time to Buy and Sell Stock',
    '3. Coding Program: Median of Two Sorted Arrays',
    '4. Coding Program: Given a sorted array in which every number is repeated twice except one number, find that single number',
  ];
  for (let i = 0; i < r1Questions.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: r1Questions[i],
      topic: 'Online Assessment Coding',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silent Infotech 2025 Round 1',
    });
  }

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2: Technical coding test',
    roundType: 'Technical',
    description: 'System design, networking, OOP, and graph algorithms.',
    sourceLocation: 'Questions TnP 2025.pdf Page 17',
  });
  const r2Questions = [
    '1. Design a database schema for Hospital Management System',
    '2. How the web works and what is DNS',
    '3. OOPs questions and design principles',
    '4. Questions about your projects in resume',
    '5. DFS and BFS graph traversal algorithms',
    '6. Check whether a number entered by the user is divisible by 4 or not, without using modulo (%) and division (/) operators (bitwise check: (n & 3) == 0)',
    '7. Layers of OSI model and TCP/IP protocol stack',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical & System Design',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silent Infotech 2025 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3: HR + Technical',
    roundType: 'Technical',
    description: 'Database schema design for college, searching, sorting, array sum verification, and college/company motivations.',
    sourceLocation: 'Questions TnP 2025.pdf Page 17',
  });
  const r3Questions = [
    '1. Introduce yourself',
    '2. Design a database schema for College Management System',
    '3. Linear search vs Binary search',
    '4. Different types of sorting algorithms and their complexities',
    '5. Implement any one sorting algorithm live',
    '6. Given two arrays: if the addition of any two elements from the first array is present in the second array, print those two elements',
    '7. Why did you select GEC Rajkot?',
    '8. What do you know about Silent Infotech?',
    '9. Why do you want to join Silent Infotech?',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'HR + Technical',
      order: i + 1,
      sourceDocument: 'Questions TnP 2025.pdf',
      sourceLocation: 'Silent Infotech 2025 Round 3',
    });
  }
}

module.exports = importPdf2025;
