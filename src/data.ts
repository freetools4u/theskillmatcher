import { ServicePackage, Job, Coach, Testimonial } from "./types";

export const servicePackages: ServicePackage[] = [
  {
    id: "resume-rewrite",
    name: "Resume Audit & Rewrite",
    price: 149,
    originalPrice: 199,
    description: "Transform your resume into a high-impact, recruiter-approved marketing tool that passes ATS screening.",
    duration: "3-5 Business Days Delivery",
    features: [
      "Complete content rewrite from scratch",
      "ATS-friendly custom formatting",
      "Action-verb & high-impact metric optimization",
      "Strategic keyword targeting for your industry",
      "1 Round of revisions included"
    ],
    popular: false
  },
  {
    id: "linkedin-makeover",
    name: "LinkedIn Profile Makeover",
    price: 129,
    originalPrice: 169,
    description: "Get found by recruiters. We rewrite your profile to stand out in LinkedIn's search algorithm.",
    duration: "3-5 Business Days Delivery",
    features: [
      "SEO-optimized headline that drives profile visits",
      "High-impact 'About' section storytelling",
      "Experience formatting tailored to recruiters",
      "Skills section restructuring for algorithm match",
      "Profile settings guide to unlock recruiter visibility"
    ],
    popular: false
  },
  {
    id: "ultimate-transition",
    name: "The Ultimate Transition Bundle",
    price: 599,
    originalPrice: 799,
    description: "Our complete premium suite designed to take you from career transitions to signed offers.",
    duration: "Full 60-Day Career Partnership",
    features: [
      "Premium Resume Rewrite + Custom Cover Letter",
      "Complete LinkedIn Profile Makeover",
      "2x 1:1 Live Strategy & Milestone Sessions (60 min)",
      "1x Premium Live Mock Interview Session (60 min)",
      "60 Days of direct Slack/Email access to your Coach",
      "Exclusive Job Search Tracker & Template Kit"
    ],
    popular: true
  },
  {
    id: "career-coaching",
    name: "1:1 Career Strategy Session",
    price: 199,
    description: "Meet with an industry-veteran coach to diagnose your search bottlenecks and outline a roadmap.",
    duration: "60-Minute Live Video Session",
    features: [
      "Personalized search bottleneck assessment",
      "Custom transition strategy blueprint",
      "Compensation negotiation advisory",
      "Networking & LinkedIn outreach script",
      "Follow-up action item list via email"
    ],
    popular: false
  },
  {
    id: "mock-interview",
    name: "Mock Interview & Feedback",
    price: 249,
    description: "Live behavioral and technical preparation to practice pacing, storytelling, and answer structure.",
    duration: "60-Minute Live Video Session",
    features: [
      "Simulated live interview tailored to your target company",
      "STAR method answer coaching and structure tips",
      "Body language, speech pace, and confidence analysis",
      "Written scorecard with actionable feedback",
      "Full video recording of the session"
    ],
    popular: false
  }
];

export const curatedJobs: Job[] = [
  {
    id: "job-1",
    title: "Senior React Developer",
    company: "Supabase",
    category: "Tech",
    salary: "$140,000 - $170,000",
    location: "Remote (USA/Global)",
    type: "Full-time",
    posted: "2 days ago",
    hurdles: [
      "High-level live technical systems design whiteboard",
      "Overwhelming applicant volume (typically 500+ in 24 hrs)"
    ],
    solutions: [
      "Resume Rewrite focuses on open-source contributions and state performance scaling metrics.",
      "1:1 Coaching session specifically practices Postgres & real-time system architecture whiteboard pacing."
    ]
  },
  {
    id: "job-2",
    title: "Lead Product Designer",
    company: "Figma",
    category: "Design",
    salary: "$150,000 - $185,000",
    location: "Remote (USA)",
    type: "Full-time",
    posted: "1 day ago",
    hurdles: [
      "Extremely rigorous multi-stage portfolio presentation",
      "Behavioral session evaluating design system governance and collaboration"
    ],
    solutions: [
      "Portfolio layout blueprint integrated into our LinkedIn/resume service.",
      "Mock Interview session practices storytelling for design trade-offs and cross-functional engineering partnerships."
    ]
  },
  {
    id: "job-3",
    title: "Remote Content & Growth Specialist",
    company: "Notion",
    category: "Marketing",
    salary: "$95,000 - $125,000",
    location: "Remote (Global)",
    type: "Full-time",
    posted: "3 days ago",
    hurdles: [
      "Keyword-heavy automated ATS filtering before any human view",
      "Submitting an actual marketing written portfolio case study"
    ],
    solutions: [
      "Resume content is optimized specifically for Notion product marketing-led growth (PLG) keywords.",
      "LinkedIn Profile Makeover aligns headline with visual product marketing authority to hook recruiters."
    ]
  },
  {
    id: "job-4",
    title: "Customer Success Manager",
    company: "Zapier",
    category: "Operations",
    salary: "$85,000 - $110,000",
    location: "Remote (USA/Canada)",
    type: "Full-time",
    posted: "4 days ago",
    hurdles: [
      "Rigorous behavioral screen with written simulation exercises",
      "Prerequisite knowledge of API integration and modern workflow automation tools"
    ],
    solutions: [
      "Resume Audit extracts automation experiences and structures technical client success metrics.",
      "1:1 Strategy session maps out standard API/Zapier scenario responses for the written simulation exam."
    ]
  },
  {
    id: "job-5",
    title: "Product Marketing Manager",
    company: "Stripe",
    category: "Marketing",
    salary: "$130,000 - $165,000",
    location: "Remote (USA)",
    type: "Full-time",
    posted: "5 days ago",
    hurdles: [
      "Intense commercial case study and product launch strategy presentation",
      "Hurdle explaining non-fintech or legacy backgrounds to a native startup team"
    ],
    solutions: [
      "Resume rewrite shifts focus from generic marketing activities to commercial revenue drivers & launch metrics.",
      "Mock interview practices structural case presentation and framing of non-traditional experience as an asset."
    ]
  }
];

export const coaches: Coach[] = [
  {
    id: "coach-1",
    name: "Sarah Chen",
    role: "Ex-Google Talent Acquisition Lead",
    bio: "Recruiting veteran with 8+ years scanning resumes inside FAANG. She knows exactly what keywords, layout structures, and project summaries cause tech recruiters to pause and click 'Approve'.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400",
    specialties: ["Tech Resume Audit", "ATS Search Algorithms", "Recruiter Outreach Scripts"]
  },
  {
    id: "coach-2",
    name: "Marcus Vance",
    role: "Executive Coach & Negotiation Strategist",
    bio: "15+ years guiding candidates through stressful mid-career pivots, salary negotiations, and high-stakes executive interview processes. He has helped clients add over $4M in cumulative salary.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400",
    specialties: ["Executive Interview Prep", "Compensation Negotiation", "Imposter Syndrome Advisory"]
  },
  {
    id: "coach-3",
    name: "Elena Rostova",
    role: "Ex-Design Director & Portfolio Advisor",
    bio: "Elena was a Design Director at modern startups, hiring designers, product managers, and creative builders. She helps non-traditional candidates craft case studies and portfolio layouts that sell.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400",
    specialties: ["Creative & Product Portfolios", "Behavioral Storytelling", "Career Transition Strategy"]
  }
];

export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "David K.",
    formerRole: "Retail Store Manager",
    newRole: "Customer Success Manager",
    quote: "Crossing Hurdles literally rebuilt my career representation. Re-framing my operational leadership in retail into CS retention and account management metrics got me interviews at Stripe, Notion, and Slack in 3 weeks. Sarah Chen is a genius!",
    company: "Slack",
    timeToLand: "35 Days",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "test-2",
    name: "Aisha M.",
    formerRole: "High School Biology Teacher",
    newRole: "Associate Product Manager",
    quote: "I was terrified of transition. The Hurdles team rewrote my resume, optimized my LinkedIn, and coached me on how to frame classroom management as cross-functional product governance. Landed an APM role at an ed-tech startup!",
    company: "Duolingo",
    timeToLand: "42 Days",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "test-3",
    name: "Jordan T.",
    formerRole: "Junior Software Engineer",
    newRole: "Senior Frontend Engineer",
    quote: "I was stuck at the final technical case study screen for months. Marcus Vance ran two mock interview sessions with me, refining how I explain architectural trade-offs under stress. He also helped me negotiate an extra $25k in base salary!",
    company: "Vercel",
    timeToLand: "28 Days",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
  }
];
