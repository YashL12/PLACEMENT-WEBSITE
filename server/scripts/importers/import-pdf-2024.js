const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const Company = require('../../src/models/Company');
const InterviewExperience = require('../../src/models/InterviewExperience');
const InterviewRound = require('../../src/models/InterviewRound');
const Question = require('../../src/models/Question');

const pdf2024Path = path.resolve(__dirname, '..', '..', '..', 'Questions TnP 2024 .pdf');

async function importPdf2024({ getOrCreateCompany, report }) {
  console.log('--- Processing Document 2: Questions TnP 2024 .pdf ---');
  if (!fs.existsSync(pdf2024Path)) {
    console.error(`File not found: ${pdf2024Path}`);
    report.errors.push(`File not found: ${pdf2024Path}`);
    return;
  }

  const buffer = fs.readFileSync(pdf2024Path);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const pages = result.pages;

  // Page 1: RKIT Software Pvt Ltd | Full Stack Developer
  await parseRkit2024(pages[0].text, getOrCreateCompany, report);

  // Page 2: TATVASOFT
  await parseTatvasoft2024(pages[1].text, getOrCreateCompany, report);

  // Page 3: Tark Technologies
  await parseTark2024(pages[2].text, getOrCreateCompany, report);

  // Page 4: IMPROWISED TECHNOLOGIES
  await parseImprowised2024(pages[3].text, getOrCreateCompany, report);

  // Page 5: GATEWAY
  await parseGateway2024(pages[4].text, getOrCreateCompany, report);

  // Page 6: SKH Algorithms - Software Engineer
  await parseSkh2024(pages[5].text, getOrCreateCompany, report);

  // Pages 7 & 8: Vivansh Infotech
  const vivanshText = (pages[6]?.text || '') + '\n' + (pages[7]?.text || '');
  await parseVivansh2024(vivanshText, getOrCreateCompany, report);

  // Pages 9 & 10: Shaligram Infotech
  const shaligramText = (pages[8]?.text || '') + '\n' + (pages[9]?.text || '');
  await parseShaligram2024(shaligramText, getOrCreateCompany, report);

  // Page 11: KOOPS Technologies
  await parseKoops2024(pages[10].text, getOrCreateCompany, report);

  // Page 12: Inara Consultancy Services (ICS)
  await parseInara2024(pages[11].text, getOrCreateCompany, report);

  // Page 13: eSparkBiz
  await parseEsparkBiz2024(pages[12].text, getOrCreateCompany, report);

  // Page 14: TSS Consultancy Private Limited
  await parseTss2024(pages[13].text, getOrCreateCompany, report);

  // Page 15: <Prominent Pixel> - <Web Developer>
  await parseProminentPixel2024(pages[14].text, getOrCreateCompany, report);

  // Page 17: CyberCom Creations (Index 16)
  if (pages[16]?.text) {
    await parseCyberCom2024(pages[16].text, getOrCreateCompany, report);
  }

  // Page 23: Template page (Index 22)
  report.flaggedRecords.push({
    recordType: 'Template Page',
    name: '<Company Name> - <Position>',
    reason: 'Document template placeholder on Page 23 of Questions TnP 2024 .pdf. Skipped from live student catalog.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 23',
  });

  console.log('Questions TnP 2024 .pdf imported successfully.');
}

async function parseRkit2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('RKIT Software Pvt Ltd', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Full Stack Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 1',
    processOverview:
      'Total Rounds: 5. Round 1 Aptitude, Round 2 Personal Interview, Round 3 Written Technical Test, Round 4 Panel Interview, Round 5 Coding Round with solution links.',
    totalRoundsCount: 5,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 _ Aptitude',
    roundType: 'Aptitude',
    description: 'Aptitude test',
    sourceLocation: 'Questions TnP 2024 .pdf Page 1',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude test questions',
    topic: 'Aptitude',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'RKIT 2024 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 _ Personal Interview',
    roundType: 'Personal',
    description: 'Personal Information | Hobby Related | Basic OOP Concepts | Basic SQL Queries',
    sourceLocation: 'Questions TnP 2024 .pdf Page 1',
  });
  const r2Questions = [
    'Personal Information',
    'Hobby Related questions',
    'Basic OOP Concepts',
    'Basic SQL Queries',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Personal & Basics',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'RKIT 2024 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 _ Written Technical Test',
    roundType: 'Technical',
    description: 'Written Technical Test covering OOP, HTML, CSS, MySQL, Java, and Data Structures.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 1',
  });
  const r3Questions = [
    'What is the difference between equal to operator(==) and Equals() method? Explain with example.',
    'What is hierarchical inheritance?',
    'Types of lists in HTML',
    'What is constraint? List out at least four MySQL constraint',
    'How to control background image repetition in CSS',
    'Differentiate full join and natural join',
    'What is the difference between CHAR, VARCHAR and TEXT in MySQL',
    'What is the use of INDEX in MySQL',
    'Explain how to add link on image. Write syntax',
    'Does every HTML tag has an ending tag? Explain with example.',
    'Explain CSS float property.',
    'What are access Modifiers?',
    'Types of CSS',
    'Write 4 Data Structure and 1 of each data structure method.',
    'Explain 5 methods of string.',
    'What is video tag? How it is declared?',
    'Explain Hybrid Inheritance',
    'Link external CSS?',
    'Explain Finally block?',
    'Write CSS code for how to center div?',
    'Difference between DELETE, DROP, & TRUNCATE.',
    'Output of a Java Program (reverse string & pattern based question)',
    'Swap values without extra variable',
    'How to give hyperlink to an image ?',
    'Which CSS property is used to repeat background image ?',
    'List of aggregate functions in SQL.',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical Written Test',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'RKIT 2024 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 _ Panel Interview',
    roundType: 'Panel',
    description: 'Project in resume, OOP in detail, puzzles, and JavaScript.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 1',
  });
  const r4Questions = [
    'Deep Understanding about mentioned project in resume',
    'OOP concepts in detail (Inheritance, Abstraction, Interface, Polymorphism)',
    'Logical questions (like puzzles)',
    'Javascript related questions if mentioned in resume',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'Panel Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'RKIT 2024 Round 4',
    });
  }

  // Round 5
  const r5 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 5,
    roundOrder: 5,
    roundName: 'Round 5 _ Coding Round',
    roundType: 'Coding',
    description: 'Coding Round with problem statements and official solution references.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 1',
  });
  const r5Questions = [
    {
      text: 'Array1 & Array2 is given. Find kth position in combined sorted array of both Arrays. (Using Merge Sort)',
      context: 'Input : Array1 = [3,2,1] , Array2 = [6,5,4], k = 2\nOutput : 2 (1 base indexing)',
      solutionUrl: 'https://www.geeksforgeeks.org/k-th-element-two-sorted-arrays/',
    },
    {
      text: 'Check given string is anagram or not.',
      context: 'Input : String1 = "silent" String2 = "listen" -> Output : Given String is anagram.\nInput : String1 = "gram" String2 = "arm" -> Output : Given String is not anagram.',
      solutionUrl: 'https://www.geeksforgeeks.org/check-whether-two-strings-are-anagram-of-each-other/',
    },
    {
      text: 'Draw following pattern (Swastik)',
      context: 'Swastika pattern in Java',
      solutionUrl: 'https://www.javatpoint.com/swastika-pattern-in-java',
    },
    {
      text: 'Pascal Triangle upto n rows.',
      context: 'Print Pascal Triangle in Java/C++',
      solutionUrl: 'https://www.geeksforgeeks.org/java-program-to-print-pascals-triangle/',
    },
    {
      text: 'Extra quiz asked: Switch frogs to the opposite side',
      context: 'Algorithmic puzzle: switch frogs puzzle',
      solutionUrl: 'https://data.bangtech.com/algorithm/switch_frogs_to_the_opposite_side.htm',
    },
  ];
  for (let i = 0; i < r5Questions.length; i++) {
    await Question.create({
      round: r5._id,
      experience: exp._id,
      company: company._id,
      questionText: r5Questions[i].text,
      context: r5Questions[i].context,
      solutionUrl: r5Questions[i].solutionUrl,
      topic: 'Coding Round',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'RKIT 2024 Round 5',
    });
  }
}

async function parseTatvasoft2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('TATVASOFT', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer (.Net/Node/Java/PHP/iOS/Android/React/React Native)',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 2',
    processOverview:
      'Total Round - 3. Note: All details are about technical field only (.Net/Node/Java/PHP/iOS/Android/React/React Native). Its not for QA/Design Field. Round 1 Online test (80 MCQ, -0.5 negative marking), Round 2 Technical Interview (screen sharing code), Round 3 HR Interview (Final Round).',
    totalRoundsCount: 3,
    advice: [
      'Note: Dont use Programiz website for online compilation as it generates wrong output in some cases. Use other online compiler instead.',
      'Be careful while giving answers to the HR. They will ask questions based on your answers so you should be prepared.',
      'Give diplomatic answers to all questions. Make sure that you are not criticizing any college, department, company, or specific person.',
      'Reference: https://www.interviewbit.com/hr-interview-questions',
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
    description: 'Total 80 MCQs with negative marking (-0.5 for each wrong answer). 35 MCQs Aptitude, 35 MCQs Reasoning, 10 MCQs Technical (Basic about language & SQL queries).',
    sourceLocation: 'Questions TnP 2024 .pdf Page 2',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '35 MCQs - Aptitude section',
      topic: 'Aptitude',
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'TATVASOFT 2024 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '35 MCQs - Reasoning section',
      topic: 'Reasoning',
      order: 2,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'TATVASOFT 2024 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: '10 MCQs - Technical (Basic language fundamentals & SQL queries)',
      topic: 'Technical',
      order: 3,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'TATVASOFT 2024 Round 1',
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
    description: 'Introduction | Basic About Any one language | Basic programs of String and array | OOPs Concept | Pattern Programs | Basic of DBMS & SQL queries | Projects.',
    instructions: 'Write Pattern code (Star, Alphabetic, Numeric) with screen sharing (problem given by interviewer).',
    sourceLocation: 'Questions TnP 2024 .pdf Page 2',
  });
  const r2Questions = [
    'Advantages/Features of java.',
    'What is OOPs & 4 pillars of OOPs?',
    'What is Polymorphism & Explain realtime use of method overloading & method overriding?',
    'Explain static keyword? Can we make object of static class?',
    'Concept of Strings and loops.',
    'Difference between For loop & While loop',
    'Write Pattern code (Star, Alphabetic, Numeric) with Sharing the screen (Problem-pattern given by the Interviewer)',
    'Questions on pattern code written by candidate.',
    'What is Array? & Which type of data contain by array?',
    'Basic Strings and array Programs (Eg. Write a program to remove duplicates from array)',
    'What is Primary Key, foreign key, unique key in DBMS?',
    'Explain About Join. What is Having and Like in SQL?',
    'DBMS Concept & Perform sql Queries.',
    'Html Code Writing - Html Table (Using concept of Rowspan and column span)',
    'Debugging, Error finding And Program implementation.',
    'Explain About Your Projects.',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'TATVASOFT 2024 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : HR Interview (Final Round)',
    roundType: 'HR',
    description: 'Personal info, academic results, aptitude/reasoning questions, code debugging, and HR questions.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 2',
  });
  const r3Questions = [
    'Personal Information (Family, College, Technology preference)',
    'Questions on your Academic Results (10th, 12th, JEE/Gujcet PR, ACPC Rank)',
    'Questions on Your Projects.',
    'Aptitude Questions (Ratio, Profit and loss, Percentage, Average, Probability etc.)',
    'Reasoning Questions (Number series, Direction sense etc.)',
    'Technical (Debugging the given code, error finding)',
    'What is your Strength and weakness?',
    'Short term and Long term goal.',
    'Why did you choose TatvaSoft?',
    'Will you leave the company once the bond period is over?',
    'Do you have any plans for your own IT Startup?',
    'Why do you want to do a Job instead of Business?',
    'Where do you want to see yourself in 5 years?',
    'What will you do if we do not select you?',
    'Why did you choose GEC instead of private colleges?',
    'Why did you choose this technology for your project?',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'HR Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'TATVASOFT 2024 Round 3',
    });
  }
}

async function parseTark2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Tark Technologies', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 3',
    processOverview:
      'Total Rounds - 4. Round 1 Online test (3 sections), Round 2 Group discussion with algorithmic marathon puzzle, Round 3 Technical interview, Round 4 HR interview.',
    totalRoundsCount: 4,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Online Test',
    roundType: 'Aptitude',
    description: 'Section 1: Mixed questions (Aptitude, DSA, CN, OS, OOP, C, HTML). Section 2: Array & sorting programs. Section 3: Functional DSA implementations with OOP.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 3',
  });
  await Question.create([
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 1: Mixed questions of aptitude, DSA, CN, OS, OOP, C language, HTML.',
      topic: 'Online Test',
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 2: Find the value which has same numbers of smaller and larger elements than that value (all values different, total odd).',
      topic: 'DSA - Arrays',
      order: 2,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 2: Find the difference of second largest element and second smallest element of array.',
      topic: 'DSA - Arrays',
      order: 3,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 3: Implement functions for calculating different shapes perimeter using OOP concepts.',
      topic: 'OOP / DSA',
      order: 4,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 3: Implement functions for removing given element from encapsulated LinkedList.',
      topic: 'DSA - Linked List',
      order: 5,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 1',
    },
    {
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Section 3: Write SQL query with JOIN, ORDER BY, WHERE, and AND clauses.',
      topic: 'SQL',
      order: 6,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 1',
    },
  ]);

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Group Discussion / Problem Solving',
    roundType: 'Group Discussion',
    description: 'Solve two algorithmic problem statements, write algorithms on paper, and discuss with the interviewer.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 3',
  });
  await Question.create([
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Marathon Problem 1: Find minimum time to complete N km marathon with at most ONE booster dose station. (Your speed decreases by 10% after every km. Booster stations increase speed by % but require waiting minutes).',
      context: 'Inputs: 1. Length of marathon in km; 2. Starting speed km/hr; 3. Booster locations [2,5,8,10]; 4. Effectiveness [5,8,12,9]; 5. Wait time in minutes [1,1,4,2]',
      topic: 'Algorithmic Problem Solving',
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 2',
    },
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: 'Marathon Problem 2: Find minimum time to complete marathon with at most TWO booster doses. You can take only one booster dose from one station.',
      context: 'Same inputs as Problem 1 with at most 2 booster doses allowed.',
      topic: 'Algorithmic Problem Solving',
      order: 2,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 2',
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
    description: 'Resume skills, project conditions, OOP modeling, and algorithms.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 3',
  });
  const r3Questions = [
    'Questions about your resume skills and projects.',
    'Ask for different conditions assigned to your project and how to solve them.',
    'Ask in-depth questions about technical topics and how they can be modeled in OOP.',
    'What is BFS and DFS?',
    'How to implement model for courier transportation with OOP?',
    "What is Prim's and Kruskal's algorithm?",
    'Pattern Question.',
    'Syntax of ArrayList (how to define and initialize it)',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 : HR Interview',
    roundType: 'HR',
    description: 'Personal details, family background, objectives, and hobbies.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 3',
  });
  const r4Questions = [
    'Your personal details.',
    'Your family details.',
    'Why did you choose GECR?',
    'Your career objectives and how you plan to reach them?',
    'Your hobbies and interests.',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'HR Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Tark 2024 Round 4',
    });
  }
}

async function parseImprowised2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('IMPROWISED TECHNOLOGIES', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer / DevOps / APS',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 4',
    processOverview:
      'Total 8 rounds for SE, 9 rounds for DevOps, 8 rounds for APS. Multi-stage evaluation covering aptitude, open-ended moral/technical QA, practical HackerRank test, group discussion, role-specific technical interviews, code conversion with internet access, deployment for DevOps, executive conversation, and HR round.',
    totalRoundsCount: 9,
    advice: [
      'Round 2 Open-Ended Q-A: Beware and be honest as answers are verified during your technical and HR interviews.',
      'Round 3 Practical Test: In HackerRank questions like 501 darts, achieve as many successful testcases as possible; do not abandon the problem.',
      'Round 6 Code Conversion: You can access the internet to convert code into a language you do not know.',
    ],
  });

  const rounds = [
    { num: 1, name: 'Round 1 : Aptitude', type: 'Aptitude', desc: 'Mixed questions of Aptitude and Reasoning.' },
    { num: 2, name: 'Round 2 : Open Handed Q-A', type: 'Technical', desc: 'Project questions, programming languages, and moral/thought-process evaluation.' },
    { num: 3, name: 'Round 3 : Practical Test (HackerRank)', type: 'Coding', desc: 'HackerRank practical test (e.g. 501 darts problem).' },
    { num: 4, name: 'Round 4 : Group Discussion', type: 'Group Discussion', desc: 'Topics: Social Media - boon or bane | OTT vs Cinema | Online money vs Offline money.' },
    { num: 5, name: 'Round 5 : Technical Interview (SE / DevOps / APS)', type: 'Technical', desc: 'SQL joins, OOP principles, resume languages, project architecture, Fibonacci, linear vs non-linear DS, LinkedList in Java without Collections, SQL indexing, real-world DS examples.' },
    { num: 6, name: 'Round 6 : Code Conversion', type: 'Technical', desc: 'Given a solution in a known or unknown language, re-solve and convert it into a language you do not know. Internet access permitted.' },
    { num: 7, name: 'Round 7 : Deployment (DevOps) / Executive Discussion (SE/APS)', type: 'Technical', desc: 'DevOps: Code deployment tasks with tools like GitHub via terminal. SE/APS: Conversation with company executives.' },
    { num: 8, name: 'Round 8 : HR Round', type: 'HR', desc: 'Interview feedback, family background, 5-year goals, knowledge about company, and reflections.' },
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
      sourceLocation: 'Questions TnP 2024 .pdf Page 4',
    });

    await Question.create({
      round: roundDoc._id,
      experience: exp._id,
      company: company._id,
      questionText: `Improwised Technologies ${r.name} - ${r.desc}`,
      topic: r.type,
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: `Improwised 2024 Round ${r.num}`,
    });
  }
}

async function parseGateway2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('GATEWAY', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 5',
    processOverview:
      'Total Rounds : 5. Round 1 Communication, Round 2 Technical Round, Round 3 Aptitude round, Round 4 HR Interview, Round 5 Technical Interview.',
    totalRoundsCount: 5,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Communication',
    roundType: 'HR',
    description: 'Communication skills assessment.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 5',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Communication and English evaluation',
    topic: 'Communication',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'GATEWAY 2024 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Technical Round',
    roundType: 'Technical',
    description: 'Nested DOM elements and complex SQL queries.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 5',
  });
  await Question.create([
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: 'How to check if DOM elements are correctly nested?',
      solutionUrl: 'https://stackoverflow.com/questions/62462345/how-to-check-if-dom-elements-are-correctly-nested',
      topic: 'Frontend / DOM',
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'GATEWAY 2024 Round 2',
    },
    {
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: 'SQL query containing GROUP BY, HAVING, and ORDER BY clauses',
      topic: 'SQL',
      order: 2,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'GATEWAY 2024 Round 2',
    },
  ]);

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : Aptitude Round',
    roundType: 'Aptitude',
    description: 'Aptitude and reasoning assessment.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 5',
  });
  await Question.create({
    round: r3._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude assessment questions',
    topic: 'Aptitude',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'GATEWAY 2024 Round 3',
  });

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 : HR Interview',
    roundType: 'HR',
    description: 'Behavioral and team leadership questions.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 5',
  });
  const r4Questions = [
    'Walk me through your resume.',
    'Where do you see yourself in the future?',
    'Are you a team player?',
    'Give me a reason for: how you are a team player as well as a team leader.',
    'As a team leader, what will you do if your colleagues are not approaching you for problems?',
    'In which technology are you interested?',
    'Have you done any certification courses?',
    'What will you do if one team member is not working properly?',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'HR Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'GATEWAY 2024 Round 4',
    });
  }

  // Round 5
  const r5 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 5,
    roundOrder: 5,
    roundName: 'Round 5 : Technical Interview (In-depth)',
    roundType: 'Technical',
    description: 'In-depth interview covering OOP, DBMS triggers/indexing, JavaScript, and CSS.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 5',
  });
  const r5Questions = [
    'Questions about your project.',
    'Pillars of OOP in detail.',
    'Exception Handling (Nested Try-Catch Block).',
    'DBMS Triggers, Cursors.',
    'Indexing in DBMS.',
    'Queries involving GROUP BY, JOIN, UNION.',
    'What is a JavaScript callback?',
    'Difference between let and var in JavaScript.',
    'Abstract Class in detail.',
    'Access Modifiers.',
    'Have you done OOP with JavaScript?',
    'Difference between Container and Container-fluid in Bootstrap/CSS.',
  ];
  for (let i = 0; i < r5Questions.length; i++) {
    await Question.create({
      round: r5._id,
      experience: exp._id,
      company: company._id,
      questionText: r5Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'GATEWAY 2024 Round 5',
    });
  }
}

async function parseSkh2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('SKH Algorithms', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 6',
    processOverview:
      'Three-stage evaluation: Round 1 MCQ Pen/Paper Test (Aptitude + Domain specific Questions), Round 2 Technical Interview, Round 3 Final HR Interview.',
    totalRoundsCount: 3,
  });

  const rounds = [
    { num: 1, name: 'Round 1 MCQ Test', type: 'Aptitude', desc: 'Pen/Paper Test, Aptitude + Domain specific Questions' },
    { num: 2, name: 'Round 2 Technical Interview', type: 'Technical', desc: 'Technical domain assessment' },
    { num: 3, name: 'Round 3 Final HR Interview', type: 'HR', desc: 'Final HR interview' },
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
      sourceLocation: 'Questions TnP 2024 .pdf Page 6',
    });
    await Question.create({
      round: roundDoc._id,
      experience: exp._id,
      company: company._id,
      questionText: `${r.name}: ${r.desc}`,
      topic: r.type,
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'SKH Algorithms 2024',
    });
  }
}

async function parseVivansh2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Vivansh Infotech', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Frontend Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Pages 7-8',
    processOverview:
      'Frontend Developer profile. Round 1 Aptitude (Aptitude + Reasoning Mix + SQL + Java code MCQs). Round 2 Personal & Technical Interview covering HTML, CSS positioning, JS event loop, Promises, React hooks (useState, useEffect), output tracing, and array algorithms.',
    totalRoundsCount: 2,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 Aptitude',
    roundType: 'Aptitude',
    description: 'Aptitude + Reasoning mixed questions + SQL + Java code MCQs.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 7',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude + Reasoning mix questions + SQL + Java code MCQs',
    topic: 'Aptitude & MCQs',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'Vivansh 2024 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 - Personal Interview Round',
    roundType: 'Technical',
    description: 'Comprehensive frontend assessment on HTML, CSS, JavaScript, React, async loops, and array manipulation.',
    sourceLocation: 'Questions TnP 2024 .pdf Pages 7-8',
  });
  const r2Questions = [
    'Introduce Yourself',
    'HTML tag attributes',
    'Event handling in JavaScript',
    'Difference between let, var, and const in JavaScript',
    'CSS position properties (relative, absolute, fixed, sticky)',
    'How to change background color using CSS',
    'How to select HTML tags in CSS',
    'How to fix one box in bottom right corner using CSS',
    'Relative vs absolute in CSS',
    'Functions in JavaScript',
    'Promises in JavaScript and sequence of resolving promises',
    'Meta tag in HTML and use of meta tags',
    'API calls in JavaScript (fetch, axios)',
    'Synchronous vs asynchronous execution in JavaScript',
    'GET vs POST methods in JavaScript and their uses',
    'React.js core architecture and advantages',
    'React hooks overview',
    'Difference between setTimeout and setInterval',
    'useState hook in React',
    'useEffect hook in React and purpose of dependency array []',
    'If we do not pass dependency array in useEffect, what happens?',
    'Props in React.js',
    'Predict the output:\nconsole.log("hii")\nsetTimeout(() => { console.log("hii2") }, 1000)\nsetTimeout(() => { console.log("hii3") }, 0)',
    'Given array: let arr = [1,2,3,4,5,3,4,5,6,6,8,7]; Write code for unique validation in array a = [1,2,3,4,5,6,7,8] and duplicate values in array b = [3,4,5,6]',
    'API call implementation in React',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Frontend & React',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Vivansh 2024 Round 2',
    });
  }
}

async function parseShaligram2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Shaligram Infotech', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Full Stack Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Pages 9-10',
    processOverview:
      'Full Stack Developer role with two tracks: Off-Campus (5 rounds: Aptitude, Technical Interview, Coding round, Managerial round, HR round) and On-Campus (3 rounds: Aptitude, Technical + Personal Interview with 3-table join schema, Telephonic Interview).',
    totalRoundsCount: 8,
  });

  // Off-Campus Rounds (1 to 5)
  const offCampusRounds = [
    { num: 1, name: 'Off-Campus Round 1 : Aptitude', type: 'Aptitude', desc: 'Aptitude + Reasoning mix questions + Basic English Grammar.' },
    {
      num: 2,
      name: 'Off-Campus Round 2 : Technical Interview',
      type: 'Technical',
      desc: 'Introduction, project discussion, OOP 4 pillars, polymorphism with real-time examples, inheritance types (why multiple/hierarchical inheritance not in Java), method overloading vs overriding, abstraction vs encapsulation, SQL joins, Truncate vs Delete vs Drop, joining 4 tables.',
    },
    { num: 3, name: 'Off-Campus Round 3 : Coding Round', type: 'Coding', desc: 'Given Principal (P), Rate (R), and Tenure (N), find the EMI per month.' },
    { num: 4, name: 'Off-Campus Round 4 : Managerial Round', type: 'Managerial', desc: 'Self intro, project details, OOP pillars with real-time examples, SQL join queries.' },
    { num: 5, name: 'Off-Campus Round 5 : HR Round', type: 'HR', desc: 'Company overview, salary, bond duration, leave policy.' },
  ];

  for (const r of offCampusRounds) {
    const roundDoc = await InterviewRound.create({
      experience: exp._id,
      company: company._id,
      roundNumber: r.num,
      roundOrder: r.num,
      roundName: r.name,
      roundType: r.type,
      description: r.desc,
      sourceLocation: 'Questions TnP 2024 .pdf Page 9',
    });
    await Question.create({
      round: roundDoc._id,
      experience: exp._id,
      company: company._id,
      questionText: `${r.name}: ${r.desc}`,
      topic: r.type,
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Shaligram 2024 Off-Campus',
    });
  }

  // On-Campus Rounds (6 to 8)
  const rOn2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 6,
    roundOrder: 6,
    roundName: 'On-Campus Round 2 : Technical + Personal Interview',
    roundType: 'Technical',
    description: 'Technical interview with specific JavaScript scoping, SQL schema with 3 tables, and algorithmic conversion.',
    sourceLocation: 'Questions TnP 2024 .pdf Pages 9-10',
  });
  const on2Questions = [
    'Difference between == and === in JavaScript',
    'Explain exception handling: can catch block have return statement? Can try, catch, finally exist without other two blocks?',
    'Difference between var, let, and const in JavaScript',
    'Difference between null and undefined',
    'Predict output:\nconst a = 10;\nfunction example() { let c = 2, b = 2; a = c + b; print(a); }\nprint(a);',
    'Given 3 tables Customer (Cust_ID, Cust_Name, Address), Order (Ord_id, Cust_id, Ord_date), Supplier (Sup_id, Ord_Id, sup_name): Write SQL query to join first two tables, and join all three tables with and without subquery.',
    'Write logic to print prime numbers',
    'Given Series 1: 1 2 4 1 1 4 3 2; Series 2: 1 3 2 2 3 1 4 2. Write logic to convert first series into second.',
    'Basic star pattern questions',
    'Inner join vs left join difference in SQL',
    'Subqueries in SQL',
    'HTML tag questions: wide elements, legend tag',
  ];
  for (let i = 0; i < on2Questions.length; i++) {
    await Question.create({
      round: rOn2._id,
      experience: exp._id,
      company: company._id,
      questionText: on2Questions[i],
      topic: 'On-Campus Technical',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Shaligram 2024 On-Campus Round 2',
    });
  }

  const rOn3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 7,
    roundOrder: 7,
    roundName: 'On-Campus Round 3 : Telephonic Interview',
    roundType: 'Technical',
    description: 'Personal introduction, project architecture, SQL joins, primary vs unique key, ACID properties.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 10',
  });
  const on3Questions = [
    'Personal Introduction + individual project / team project related questions',
    'What is SQL and SQL Joins? What are the types of join?',
    'When do we use a UNIQUE key?',
    'Difference between PRIMARY KEY and UNIQUE KEY?',
    'What is used for connecting tables? (Foreign Key)',
    'What is inheritance? Types of inheritance?',
    'Describe the use of an interface.',
    'What is ACID property in DBMS?',
    'How many tables are required to perform a join operation?',
  ];
  for (let i = 0; i < on3Questions.length; i++) {
    await Question.create({
      round: rOn3._id,
      experience: exp._id,
      company: company._id,
      questionText: on3Questions[i],
      topic: 'Telephonic Technical',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Shaligram 2024 On-Campus Round 3',
    });
  }
}

async function parseKoops2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('KOOPS Technologies', 'Questions TnP 2024 .pdf');

  // Track 1: Business Developer Executive
  const expBde = await InterviewExperience.create({
    company: company._id,
    role: 'Business Developer Executive',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 11',
    processOverview: 'BDE profile. Round 2 Discussion/Debate on workplace leadership, Round 3 Personal Interview with onboarding case studies.',
    totalRoundsCount: 2,
    order: 1,
  });
  const rBde1 = await InterviewRound.create({
    experience: expBde._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 1,
    roundName: 'Round 2 - Discussion / Debate',
    roundType: 'Group Discussion',
    description: "Debate topics on management and leadership: 'Is women manager better than men?' and 'Why top company CEO is men only'.",
    sourceLocation: 'Questions TnP 2024 .pdf Page 11',
  });
  await Question.create({
    round: rBde1._id,
    experience: expBde._id,
    company: company._id,
    questionText: 'Debate Topics: 1. Are women managers better than men? 2. Why are most top company CEOs men?',
    topic: 'Debate',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'KOOPS BDE Round 2',
  });

  const rBde2 = await InterviewRound.create({
    experience: expBde._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 2,
    roundName: 'Round 3 - Personal Interview Round',
    roundType: 'HR',
    description: 'Personal introduction, platform onboarding strategies, CRM concepts, and salary/growth expectations.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 11',
  });
  const bdeQuestions = [
    'Introduce Yourself',
    'How will you make restaurant owners come onboard on Swiggy platform?',
    'How will you make a non-tech person onboard on one of the platforms (Instagram/WhatsApp/Gmail)?',
    'What is CRM?',
    'How long do you see yourself to be with our company after bond completion?',
    'How much salary do you expect to get after becoming a manager?',
    'How long will it take you to reach a manager post?',
  ];
  for (let i = 0; i < bdeQuestions.length; i++) {
    await Question.create({
      round: rBde2._id,
      experience: expBde._id,
      company: company._id,
      questionText: bdeQuestions[i],
      topic: 'BDE Personal Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'KOOPS BDE Round 3',
    });
  }

  // Track 2: Web Technology Developer
  const expDev = await InterviewExperience.create({
    company: company._id,
    role: 'Web Technology Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 11',
    processOverview: 'Web Technology Developer track. Round 3 Personal/HR Interview covering JavaScript scoping, timer queues, Core Java OOP, and SQL triggers/joins.',
    totalRoundsCount: 1,
    order: 2,
  });
  const rDev = await InterviewRound.create({
    experience: expDev._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 1,
    roundName: 'Round 3 - Personal / Technical Interview Round',
    roundType: 'Technical',
    description: 'JavaScript scoping, Core Java OOP, and SQL database design.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 11',
  });
  const devQuestions = [
    'Introduce yourself and brief explanation of your project',
    'JavaScript basic questions: difference between let, var, and const; console log output evaluation',
    'What is setTimeout and setInterval? Predict output for given code example',
    'Core Java & OOP: What is inheritance and which types does Java support?',
    'Briefly explain polymorphism and its types',
    'What is access modifier in Java?',
    'What is abstraction?',
    'Given a tree structure, how to design and create a SQL table for this tree?',
    'What is a database trigger?',
    'What is a join? Explain inner join and left join.',
  ];
  for (let i = 0; i < devQuestions.length; i++) {
    await Question.create({
      round: rDev._id,
      experience: expDev._id,
      company: company._id,
      questionText: devQuestions[i],
      topic: 'Web Developer Technical',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'KOOPS Web Developer Round 3',
    });
  }
}

async function parseInara2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Inara Consultancy Services', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Engineer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 12',
    processOverview: 'Three rounds: Round 1 MCQ round, Round 2 Coding test + Personal interview, Round 3 HR round.',
    totalRoundsCount: 3,
  });

  const rounds = [
    { num: 1, name: 'Round 1 MCQ round', type: 'Aptitude' },
    { num: 2, name: 'Round 2 Coding test + Personal interview', type: 'Coding' },
    { num: 3, name: 'Round 3 HR round', type: 'HR' },
  ];
  for (const r of rounds) {
    const roundDoc = await InterviewRound.create({
      experience: exp._id,
      company: company._id,
      roundNumber: r.num,
      roundOrder: r.num,
      roundName: r.name,
      roundType: r.type,
      description: r.name,
      sourceLocation: 'Questions TnP 2024 .pdf Page 12',
    });
    await Question.create({
      round: roundDoc._id,
      experience: exp._id,
      company: company._id,
      questionText: `${r.name} assessment`,
      topic: r.type,
      order: 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Inara 2024',
    });
  }
}

async function parseEsparkBiz2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('eSparkBiz', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 13',
    processOverview:
      'Total 5 rounds: Round 1 Aptitude (online), Round 2 Coding Round (pen-paper with 11 programs), Round 3 Technical Interview (in-depth DSA, OOP, DBMS, React), Round 4 CTO Round, Round 5 HR Round.',
    totalRoundsCount: 5,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude (online)',
    roundType: 'Aptitude',
    description: 'Aptitude + Reasoning + English + Data Structure + DBMS.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 13',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude + Reasoning + English + Data Structure + DBMS',
    topic: 'Online Aptitude',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'eSparkBiz 2024 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Coding Round (pen-paper)',
    roundType: 'Coding',
    description: '11 pen-and-paper programming problems covering array, string, recursion, and patterns.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 13',
  });
  const r2Questions = [
    'Reverse Array Program',
    'Print Fibonacci series using Recursion',
    'Check occurrence of each character in String',
    'Find second largest element in array',
    'Find Intersection in two arrays',
    'Find Vowels and consonants in given String',
    'Print 1 to n prime numbers',
    'Swap 2 numbers without using a third variable',
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
      topic: 'Coding Pen-Paper',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'eSparkBiz 2024 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : Technical Interview',
    roundType: 'Technical',
    description: 'Questions on Round 2 code, OOP 4 pillars, Data Structures (Stack, Queue, LinkedList, Sorting), DBMS queries, React hooks, and Exception handling.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 13',
  });
  const r3Questions = [
    'Explain the logic and approach of programs written in Round 2',
    'What are the 4 pillars of OOP? Explain each in detail',
    'What are SQL joins? Write basic query on paper',
    'What is Data Structure? Explain different types of data structures',
    'What is Stack? What is Queue? What is Linked List?',
    'What are Sorting Algorithms? Pseudo code and logic of Selection sort, Insertion sort, Bubble sort, Quick sort, Merge sort',
    'What is a database and its types? Perform SQL queries: update, select, joins, insert, group by, order by',
    'Different types of joins and explain with examples',
    'What is Encapsulation? What is Abstraction? What is Polymorphism and its types?',
    'Difference between Method Overloading and Method Overriding',
    'What is Inheritance and its types?',
    'React hooks (if mentioned in resume/projects)',
    'Questions about projects and architecture',
    'Exception Handling mechanisms',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'eSparkBiz 2024 Round 3',
    });
  }

  // Round 4
  const r4 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 4,
    roundOrder: 4,
    roundName: 'Round 4 : CTO Round',
    roundType: 'Technical',
    description: 'Tell me about yourself, OOP deep-dive (static keyword), 4 pillars with real-time examples, and learning outside coding.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 13',
  });
  const r4Questions = [
    'Tell me about yourself',
    'What is OOP? Deep-dive into Static Keyword and memory allocation',
    'Explain the 4 main pillars of OOP with real-time examples',
    'What have you learned outside of coding?',
  ];
  for (let i = 0; i < r4Questions.length; i++) {
    await Question.create({
      round: r4._id,
      experience: exp._id,
      company: company._id,
      questionText: r4Questions[i],
      topic: 'CTO Round',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'eSparkBiz 2024 Round 4',
    });
  }

  // Round 5
  const r5 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 5,
    roundOrder: 5,
    roundName: 'Round 5 : HR Round',
    roundType: 'HR',
    description: 'Company norms, salary discussion, and bond duration.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 13',
  });
  await Question.create({
    round: r5._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Discuss about norms of the company, salary, and bond duration',
    topic: 'HR',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'eSparkBiz 2024 Round 5',
  });
}

async function parseTss2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('TSS Consultancy Private Limited', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Software Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 14',
    processOverview:
      'Total 3 rounds: Round 1 Aptitude+OOP+Programming; Round 2 Technical-1 (9 algorithmic problems); Round 3 Technical-2 (6 advanced problems including Kadane, Josephus, and string decoding).',
    totalRoundsCount: 3,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 : Aptitude + OOP + Programming',
    roundType: 'Aptitude',
    description: 'Aptitude, OOP fundamentals, and programming test.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 14',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude + OOP + Programming assessment',
    topic: 'Aptitude & OOP',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'TSS 2024 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 : Technical-1',
    roundType: 'Coding',
    description: '9 algorithmic and data structure problems.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 14',
  });
  const r2Questions = [
    "Find substring's (substring can be repeated) starting index in given pattern",
    'Valid parenthesis problem',
    'Merge two Sorted Arrays',
    'Reverse String with position of special characters remaining same',
    'Find Minimum Distance between 2 Points in Graph',
    'Find Maximum Consecutive elements in Array without sorting the array',
    'Find Pair of elements from Array with Sum equals to Target Sum',
    "Find maximum subarray sum from given array (Kadane's algorithm)",
    'Number of maximum frequency count',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical-1 Algorithms',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'TSS 2024 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 : Technical-2',
    roundType: 'Technical',
    description: '6 advanced array, string, and mathematical problems.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 14',
  });
  const r3Questions = [
    'Merge two arrays: if any elements repeat, that element should appear only once and put zeros in place of repeated elements',
    'Words Reverse of String but Special characters and Space must remain at their correct positions',
    'Combination and Permutation questions',
    'Josephus Problem implementation',
    'String Decoding: input = 3@4Ab5y2jk -> output = @3@Ab44Ab44y5y5yjk22',
    'Code implementation of method overriding',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical-2 Advanced Algorithms',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'TSS 2024 Round 3',
    });
  }
}

async function parseProminentPixel2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('Prominent Pixel', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'Web Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 15',
    processOverview:
      '<Prominent Pixel> - <Web Developer>. Three technical interview rounds covering ES6, React props, async programming, matrix diagonal traversal, splice vs slice, and dynamic programming coin selection.',
    totalRoundsCount: 3,
  });

  // Technical 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 <Technical 1>',
    roundType: 'Technical',
    description: 'OOP, projects, sync/async, React props, ES6 features, scoping, and array/string manipulation.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 15',
  });
  const r1Questions = [
    '1. Basic of OOPS concepts',
    '2. Mention and explain projects from resume',
    '3. What is synchronous and asynchronous programming?',
    '4. What is props in React?',
    '5. What are the new changes in ES6?',
    '6. let vs var vs const in JavaScript',
    '7. Swap two numbers without third variable',
    '8. In 2D array, print only diagonal elements',
    '9. Palindrome check for string',
    '10. Debug const in for loop (scoping issues)',
  ];
  for (let i = 0; i < r1Questions.length; i++) {
    await Question.create({
      round: r1._id,
      experience: exp._id,
      company: company._id,
      questionText: r1Questions[i],
      topic: 'Technical 1',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Prominent Pixel 2024 Round 1',
    });
  }

  // Technical 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 <Technical 2>',
    roundType: 'Technical',
    description: 'String vs StringBuilder, splice vs slice, second largest element, and pointer manipulation.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 15',
  });
  const r2Questions = [
    '1. Difference between String and StringBuilder',
    '2. Difference between splice and slice in JavaScript',
    '3. String inbuilt methods and implementations',
    '4. Find second largest element in array',
    '5. Linked list: adding number to pointing address',
    '6. Integer stored as string variable: convert to integer variable without using built-in methods',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical 2',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Prominent Pixel 2024 Round 2',
    });
  }

  // Technical 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 <Technical 3>',
    roundType: 'Technical',
    description: '2D matrix sum, merge arrays without built-in methods, Pythagorean theorem pairs, and coin change.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 15',
  });
  const r3Questions = [
    '1. In 2D array, calculate sum of diagonal elements',
    '2. Given two arrays, remove duplicate values and merge into new array without using inbuilt methods',
    '3. Find pairs between 1 to 1000 for Pythagorean theorem (a^2 + b^2 = c^2)',
    '4. Minimal coin selection for given amount (Greedy / DP Coin Change)',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'Technical 3',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'Prominent Pixel 2024 Round 3',
    });
  }
}

async function parseCyberCom2024(text, getOrCreateCompany, report) {
  const company = await getOrCreateCompany('CyberCom Creations', 'Questions TnP 2024 .pdf');
  const exp = await InterviewExperience.create({
    company: company._id,
    role: 'PHP Developer',
    placementYear: 2024,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourcePage: 'Page 17',
    processOverview:
      'PHP Developer profile. Total 3 rounds: Round 1 MCQ Test / Aptitude Round; Round 2 Technical / Personal Interview (tracing output of 3-variable nested loops); Round 3 HR Round.',
    totalRoundsCount: 3,
  });

  // Round 1
  const r1 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 1,
    roundOrder: 1,
    roundName: 'Round 1 <MCQ Test / Aptitude Round>',
    roundType: 'Aptitude',
    description: 'Aptitude + Reasoning + DBMS questions + OOP concepts + Output of given code.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 17',
  });
  await Question.create({
    round: r1._id,
    experience: exp._id,
    company: company._id,
    questionText: 'Aptitude + Reasoning + DBMS questions + OOP concepts + Output of given code',
    topic: 'MCQs & Aptitude',
    order: 1,
    sourceDocument: 'Questions TnP 2024 .pdf',
    sourceLocation: 'CyberCom 2024 Round 1',
  });

  // Round 2
  const r2 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 2,
    roundOrder: 2,
    roundName: 'Round 2 <Technical / Personal Interview Round>',
    roundType: 'Technical',
    description: 'Self-introduction and deep logical tracing of nested loops with conditions.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 17',
  });
  const r2Questions = [
    '1) Tell me about yourself',
    '2) Logical Thinking of output from code and explain how the answer is derived: How many stars will be printed from nested for loop of 3 variables?',
    '3) How many stars will be printed if loop is nested in i, j, k and conditions are like: if(i==4 || j==4 || k==4) etc.',
  ];
  for (let i = 0; i < r2Questions.length; i++) {
    await Question.create({
      round: r2._id,
      experience: exp._id,
      company: company._id,
      questionText: r2Questions[i],
      topic: 'Technical Interview',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'CyberCom 2024 Round 2',
    });
  }

  // Round 3
  const r3 = await InterviewRound.create({
    experience: exp._id,
    company: company._id,
    roundNumber: 3,
    roundOrder: 3,
    roundName: 'Round 3 <HR Round>',
    roundType: 'HR',
    description: 'Introduction, family background, strengths/weaknesses, life goals, projects.',
    sourceLocation: 'Questions TnP 2024 .pdf Page 17',
  });
  const r3Questions = [
    '1) Give brief introduction of yourself',
    '2) Tell me about your family background',
    '3) What are your strengths and weaknesses?',
    '4) What are your life goals?',
    '5) Tell me about your Projects',
  ];
  for (let i = 0; i < r3Questions.length; i++) {
    await Question.create({
      round: r3._id,
      experience: exp._id,
      company: company._id,
      questionText: r3Questions[i],
      topic: 'HR Round',
      order: i + 1,
      sourceDocument: 'Questions TnP 2024 .pdf',
      sourceLocation: 'CyberCom 2024 Round 3',
    });
  }
}

module.exports = importPdf2024;
