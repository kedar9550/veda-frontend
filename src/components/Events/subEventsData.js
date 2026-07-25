/**
 * subEventsData.js — Admin panel data source (API-ready)
 * To connect: replace useSubEvents.js fetch with your API endpoint
 */

export const SUB_EVENTS_DATA = {
  krishi: [
    {
      id: 'agro-innovate',
      title: 'Agro Innovate',
      tagline: 'Design the Farm of Tomorrow',
      description:
        'Build a smart greenhouse prototype using IoT sensors, hydroponic systems, or AI-driven irrigation. Present your working model to a panel of agri-tech experts.',
      image: '/events/sub/agro-innovate.png',
      date: '2025-09-12',
      time: '9:00 AM',
      venue: 'Room 202, R&C LAB, Second Floor, Bill Gates Bhavan',
      prize: '₹15,000',
      prizeAmount: 15000,
      teamSize: '2–4',
      registrationDeadline: '2025-09-05',
      category: 'Competition',
      categoryColor: '#22c55e',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 336,
      participationCount: 84,

      // ── Rich content (from admin panel) ──
      overview:
        'Thrust Areas but not limited to... 1. Drone Technology & Agribots 2. Hydroponics & Polyhouse Technology 3. Climate change & resilient agriculture 4. Advanced Agricultural Technologies in Smart farming 5. Artificial Intelligence (AI) in Agricultural Engg. 6. Roof Top Farming & Microgreens 7. Post harvest Management 8. Waste Valorization 9. Renewable Energy / Green Technology',

      rules: [
        'A maximum of two candidates pursuing undergraduate program are allowed per team and registration fee of Rs. 200/- for selected paper.',
        'Interested candidates are required to mail the Technical paper before September 9th, 2025, to sujatha_agri@adityauniversity.in with \'PAPER < Name of the team> <Subject of Paper>\' in the subject line.',
        'The topic of the paper should be relevant to AGRICULTURAL ENGINEERING.',
        'The soft copy should be either .docx or .pdf file.',
        'The mail must also contain the names and respective E-mail IDs of the registered team members, specifying the team leader. Henceforth further mails will be sent to the team leader only.',
        'The participants of the shortlisted papers will be informed through e-mail by September 10th, 2025.',
        'The shortlisted candidates have to mail their Paper and Power Point Presentation by September 11th, 2025 to sujatha_agri@adityauniversity.in with \'PAPER < Name of the team>\' in the subject line.',
        'The presentation should be in PowerPoint Presentation Format (.ppt or .pptx). A maximum of 15 min time slot will be allotted for presentation and 2min for QUERY session.',
      ],

      registrationFee: 'Registration fee is Rs 200/- per team',
    },
    {
      id: 'smart-farm-hack',
      title: 'Smart Farm Hackathon',
      tagline: '24-Hour Precision Agri Challenge',
      description:
        'A 24-hour hackathon to develop tech solutions for modern farming — drone path planning, soil data analysis, crop yield prediction using ML, or water conservation systems.',
      image: '/events/sub/smart-farm-hack.png',
      date: '2025-09-20',
      time: '8:00 AM',
      venue: 'Innovation Hub, Ground Floor, Main Block',
      prize: '₹25,000',
      prizeAmount: 25000,
      teamSize: '3–5',
      registrationDeadline: '2025-09-14',
      category: 'Hackathon',
      categoryColor: '#3b82f6',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 512,
      participationCount: 102,

      overview:
        'Build tech-driven solutions for modern precision agriculture. Problem statements will cover: 1. Drone path optimization for crop spraying 2. Soil health monitoring with ML 3. Smart irrigation using IoT 4. Crop yield prediction models 5. Supply chain optimization for farmers 6. Water conservation algorithms 7. Pest detection using computer vision 8. Weather-based farming advisories.',

      rules: [
        'Team size: 3 to 5 members. At least one member must be from the School of Agriculture.',
        'The hackathon duration is 24 hours from the time of problem statement release.',
        'All code must be written during the hackathon. Pre-built libraries and open datasets are allowed.',
        'Teams must submit a working prototype or demo along with a 10-slide presentation.',
        'Judging criteria: Innovation (30%), Technical Implementation (30%), Impact on Agriculture (25%), Presentation (15%).',
        'Plagiarism or use of pre-existing projects will result in immediate disqualification.',
        'Internet access will be provided. Use of AI coding assistants is permitted.',
        'Final submissions must be uploaded to the provided portal before the deadline.',
      ],

      registrationFee: 'Registration fee is Rs 500/- per team',
    },
    {
      id: 'soil-challenge',
      title: 'Soil Analysis Challenge',
      tagline: 'Decode the Ground Beneath',
      description:
        'Participants will analyze soil samples, identify nutrient deficiencies, suggest amendments, and design optimal cropping patterns. Lab-based practical competition.',
      image: '/events/sub/soil-challenge.png',
      date: '2025-09-25',
      time: '10:00 AM',
      venue: 'Soil Science Lab, Block B, Agriculture Building',
      prize: '₹8,000',
      prizeAmount: 8000,
      teamSize: '1–2',
      registrationDeadline: '2025-09-18',
      category: 'Lab Event',
      categoryColor: '#f59e0b',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 198,
      participationCount: 99,

      overview:
        'Thrust areas include: 1. Physical soil analysis (texture, structure, bulk density) 2. Chemical analysis (pH, EC, NPK levels) 3. Soil microbiology and organic matter assessment 4. Cropping pattern recommendations based on soil profile 5. Soil amendments and fertilizer optimization 6. Identification of soil degradation and remediation techniques.',

      rules: [
        'Individual or two-member teams are permitted.',
        'Participants must bring their own lab coat and safety goggles.',
        'Soil samples will be provided on the day of the event. No external samples allowed.',
        'Each team will receive 3 soil samples and must complete analysis within 2 hours.',
        'Standard lab instruments will be provided. Personal instruments are not allowed.',
        'Results must be submitted in the provided answer sheet. No digital submissions.',
        'Scoring: Accuracy of results (50%), Recommendations quality (30%), Lab technique (20%).',
        'Mobile phones are not allowed inside the lab during the competition.',
      ],

      registrationFee: 'Registration fee is Rs 100/- per team',
    },
    {
      id: 'agro-photography',
      title: 'Agro Photography',
      tagline: 'Capture the Soul of Agriculture',
      description:
        'Submit your best photographs celebrating Indian agriculture — farmers, landscapes, crops, markets, or rural life. Judged by professional wildlife and nature photographers.',
      image: '/events/sub/agro-photography.png',
      date: '2025-10-02',
      time: 'Online Submission',
      venue: 'Online + Exhibition Hall, Admin Block',
      prize: '₹5,000',
      prizeAmount: 5000,
      teamSize: '1',
      registrationDeadline: '2025-09-28',
      category: 'Creative',
      categoryColor: '#ec4899',
      registrationLink: '#',
      isOpen: false,
      registeredUsers: 421,
      participationCount: 421,

      overview:
        'Capture the essence of Indian agriculture through your lens. Theme categories: 1. The Farmer\'s Journey — daily life and struggles 2. Seasons of the Farm — crops across seasons 3. Technology Meets Nature — modern agri-tech 4. Rural Markets & Commerce 5. Soil, Water, and Life — environmental agriculture 6. Women in Agriculture 7. Traditional Farming Practices.',

      rules: [
        'Each participant can submit a maximum of 3 photographs.',
        'Photographs must be original and taken by the participant. Stock photos are not allowed.',
        'Basic editing (brightness, contrast, crop) is allowed. Heavy manipulation is not permitted.',
        'Minimum resolution: 2000 x 1500 pixels. Format: JPG or PNG.',
        'Photographs must be submitted via the online portal with a title and short description (max 50 words).',
        'By submitting, participants grant the university the right to display/publish the photographs.',
        'Photographs must not contain watermarks or signatures.',
        'Judging criteria: Composition (25%), Relevance to Theme (30%), Technical Quality (25%), Originality (20%).',
      ],

      registrationFee: 'Free of cost',
    },
    {
      id: 'drone-agri-demo',
      title: 'Drone Agri Demo',
      tagline: 'Fly. Spray. Analyse.',
      description:
        'Live drone demonstration and flying competition on the university grounds. Participants program autonomous spray paths over a simulated crop field with accuracy scoring.',
      image: '/events/sub/drone-agri-demo.png',
      date: '2025-10-10',
      time: '11:00 AM',
      venue: 'University Grounds, Open Area near Sports Complex',
      prize: '₹20,000',
      prizeAmount: 20000,
      teamSize: '2–3',
      registrationDeadline: '2025-10-03',
      category: 'Live Demo',
      categoryColor: '#06b6d4',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 287,
      participationCount: 96,

      overview:
        'Demonstrate precision agriculture drone skills in: 1. Autonomous flight path programming 2. Precision spraying accuracy on target zones 3. Obstacle avoidance in agricultural settings 4. Multispectral imaging and crop health mapping 5. Real-time data telemetry and analysis 6. Emergency landing protocols 7. Payload optimization for field conditions.',

      rules: [
        'Teams of 2 to 3 members. All members must have a valid student ID.',
        'Participants must bring their own drone (specifications: max 5kg weight, DJI or equivalent).',
        'Drones must be registered and participants must carry proof of registration.',
        'The competition area will be a 50m x 50m simulated crop field.',
        'Each team gets 2 practice runs of 5 minutes and 1 competition run of 10 minutes.',
        'Scoring: Spraying accuracy (40%), Path efficiency (25%), Flight stability (20%), Time (15%).',
        'Any damage to university property due to drone malfunction is the participant\'s responsibility.',
        'Weather conditions may require rescheduling. Updates will be communicated via registered email.',
      ],

      registrationFee: 'Registration fee is Rs 1000/- per team',
    },
  ],

  techno: [
    {
      id: 'robowars',
      title: 'RoboWars',
      tagline: 'Clash of Metal & Minds',
      description: 'Engage in epic mechanical battles. Design a combat robot to outsmart and disable your opponent in the arena.',
      image: '/events/techno.png',
      date: '2025-09-15',
      time: '10:00 AM',
      venue: 'Open Air Theatre (OAT), Central Ground',
      prize: '₹30,000',
      prizeAmount: 30000,
      teamSize: '3–5',
      registrationDeadline: '2025-09-08',
      category: 'Competition',
      categoryColor: '#3b82f6',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 145,
      participationCount: 45,
      overview: 'Design, build and battle! Build a bot that can disable, throw, or out-maneuver your opponent. Bots must comply with weight class specifications (max 15kg). Arena hazards will be active. Safety measures are paramount.',
      rules: [
        'Bot weight must not exceed 15 kg (excluding batteries/remote system).',
        'Use of internal combustion engines or chemical weapons is strictly prohibited.',
        'Match duration: 3 minutes per round.',
        'Shortlist based on safety clearance and technical check on day 1.',
        'Decision of the arena judges is final and binding.'
      ],
      registrationFee: 'Registration fee is Rs 500/- per team'
    },
    {
      id: 'hackoverload',
      title: 'HackOverload',
      tagline: 'Code the Solution',
      description: 'A 36-hour hackathon focused on solving real-world challenges in AI, Web3, and sustainability.',
      image: '/events/techno.png',
      date: '2025-09-21',
      time: '9:00 AM',
      venue: 'AC Seminar Hall, Cotton Bhavan',
      prize: '₹50,000',
      prizeAmount: 50000,
      teamSize: '2–4',
      registrationDeadline: '2025-09-15',
      category: 'Hackathon',
      categoryColor: '#3b82f6',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 340,
      participationCount: 95,
      overview: 'Develop software prototypes addressing critical global issues. Selected tracks: AI/ML for Social Good, Web3 Decentralized Solutions, Green Energy & Carbon Offsetting, Smart Infrastructure.',
      rules: [
        'Teams must consist of 2 to 4 members.',
        'All designs and code must be created within the hackathon timeline.',
        'Use of open source components is permitted with proper attribution.',
        'Final pitch consists of a 5-minute presentation and a live working demo.'
      ],
      registrationFee: 'Registration fee is Rs 300/- per team'
    }
  ],

  pharma: [
    {
      id: 'molecumix',
      title: 'MolecuMix',
      tagline: 'Formulation Challenge',
      description: 'Design a target delivery vehicle or analyze chemical drug interactions in a wet-lab environment.',
      image: '/events/pharma.png',
      date: '2025-09-14',
      time: '11:00 AM',
      venue: 'Advanced Research Lab, Pharmacy Block',
      prize: '₹12,000',
      prizeAmount: 12000,
      teamSize: '2',
      registrationDeadline: '2025-09-08',
      category: 'Lab Event',
      categoryColor: '#a855f7',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 88,
      participationCount: 44,
      overview: 'Analyze given compounds, identify their core components, and formulate an efficient drug delivery plan based on clinical target profiles provided on the spot.',
      rules: [
        'Team size: Exactly 2 members.',
        'Participants must wear proper lab attire: lab coat, closed shoes, and safety goggles.',
        'All reactants and instruments will be provided. No external chemical agents are allowed.',
        'Lab protocols must be strictly adhered to; safety violations lead to disqualification.'
      ],
      registrationFee: 'Registration fee is Rs 200/- per team'
    }
  ],

  scientia: [
    {
      id: 'mathletics',
      title: 'Mathletics',
      tagline: 'The Ultimate Number Crunch',
      description: 'Solve complex mathematical proofs and logical riddles in a fast-paced quiz format.',
      image: '/events/scientia.png',
      date: '2025-09-16',
      time: '10:00 AM',
      venue: 'Ramanujan Hall, Science Block',
      prize: '₹10,000',
      prizeAmount: 10000,
      teamSize: '1–2',
      registrationDeadline: '2025-09-10',
      category: 'Quiz',
      categoryColor: '#f59e0b',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 210,
      participationCount: 105,
      overview: 'A brain-teasing test of arithmetic, calculus, discrete math, and abstract reasoning. Consists of a written preliminary round followed by a buzzer stage.',
      rules: [
        'Individual or maximum team size of 2 is allowed.',
        'Use of programmable calculators is prohibited.',
        'Preliminary round is multiple choice; top 6 teams advance to final buzzer rounds.'
      ],
      registrationFee: 'Registration fee is Rs 100/- per team'
    }
  ],

  entrix: [
    {
      id: 'bizpitch',
      title: 'BizPitch',
      tagline: 'Shark Tank Style Startups',
      description: 'Pitch your innovative business plan to dynamic venture capitalists and industry veterans.',
      image: '/events/entrix.png',
      date: '2025-09-19',
      time: '2:00 PM',
      venue: 'MBA Seminar Hall, Newton Bhavan',
      prize: '₹25,000',
      prizeAmount: 25000,
      teamSize: '1–3',
      registrationDeadline: '2025-09-12',
      category: 'Competition',
      categoryColor: '#f97316',
      registrationLink: '#',
      isOpen: true,
      registeredUsers: 156,
      participationCount: 52,
      overview: 'Present your pitch deck, outline your financial projections, address potential market risks, and convince the sharks to fund your startup dream.',
      rules: [
        'Team size: 1 to 3 members.',
        'Presentation time limit: 7 minutes for pitch + 3 minutes for Q&A.',
        'Pitches must contain target audience analysis, revenue model, and scale plan.'
      ],
      registrationFee: 'Registration fee is Rs 150/- per team'
    }
  ],
};
