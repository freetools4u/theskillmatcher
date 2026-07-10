export interface JobPosition {
  id: string;
  title: string;
  date: string;
  category: "Model Training" | "Code Trainer" | "Quality Evaluator" | "Domain Specialist";
  skills: string[];
  experience: string; // e.g. "14+", "2+", etc.
  pay: string; // e.g. "$50-70/h"
  description: string;
  scopeOfWork: string[];
  preferredQualifications: string[];
}

export interface TestimonialData {
  id: string;
  name: string;
  country: string;
  quote: string;
  avatarColor: string;
  initials: string;
  avatarUrl?: string;
}

// Rewritten, unique, highly professional testimonials for Zenire AI
export const rewrittenTestimonials: TestimonialData[] = [
  {
    id: "t1",
    name: "Elena Sterling",
    country: "United Kingdom",
    quote: "As an academic researcher, finding flexible freelance projects that align with my expertise was difficult. Zenire AI matched me with high-level prompt evaluation tasks in cognitive biochemistry. Outstanding communication and seamless weekly payouts!",
    avatarColor: "bg-blue-600",
    initials: "ES",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t2",
    name: "Siddharth Nair",
    country: "India",
    quote: "The vetting process at Zenire AI is thorough but extremely rewarding. I was onboarded into an exclusive code generation evaluation cohort within days. It has completely elevated my remote consulting career.",
    avatarColor: "bg-emerald-600",
    initials: "SN",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t3",
    name: "Sophia Martinez",
    country: "United States",
    quote: "Zenire AI has a wonderful ecosystem. I work as an AI Safety and Alignment Specialist, and the variety of prompt-engineering and safety red-teaming tasks keeps my schedule both highly flexible and engaging. Outstanding admin team!",
    avatarColor: "bg-purple-600",
    initials: "SM",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t4",
    name: "Dr. Arthur Vance",
    country: "Canada",
    quote: "As a retired mathematics professor, I enjoy applying my domain expertise to challenge reasoning models. Zenire AI connects me with highly challenging and intellectually satisfying work that I can do right from my home office.",
    avatarColor: "bg-amber-600",
    initials: "AV",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t5",
    name: "Chidi Nwosu",
    country: "Nigeria",
    quote: "I've worked with several crowdsourcing groups, but Zenire AI is on another level. The prompt guidelines are clear, their testing platform is robust, and the pay rates are highly competitive for quality evaluators.",
    avatarColor: "bg-rose-600",
    initials: "CN",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t6",
    name: "Hana Tanaka",
    country: "Japan",
    quote: "The multilingual localization contracts are well-organized and respect my time. I love helping large language models master Japanese cultural nuances and idioms. It's rewarding to see the immediate improvements.",
    avatarColor: "bg-indigo-600",
    initials: "HT",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t7",
    name: "Marc Dumont",
    country: "France",
    quote: "Zenire AI provided fantastic onboarding. I've been training reinforcement learning models with direct human feedback (RLHF) for months now, and their support staff makes the entire workflow stress-free.",
    avatarColor: "bg-teal-600",
    initials: "MD",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t8",
    name: "Gabriela Silva",
    country: "Brazil",
    quote: "What I appreciate most about Zenire AI is the absolute scheduling flexibility. I can contribute to advanced AI evaluation and translation validation projects around my main work hours without any stress.",
    avatarColor: "bg-pink-600",
    initials: "GS",
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "t9",
    name: "Amina Al-Mansoor",
    country: "United Arab Emirates",
    quote: "Participating in domain-expert model training on Zenire AI has been an amazing experience. They truly value expert contributions in medical sciences and make the onboarding flow extremely clear.",
    avatarColor: "bg-sky-600",
    initials: "AM",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
  }
];

// All 33 user-provided positions mapped perfectly to four main categories:
// "Model Training" | "Code Trainer" | "Quality Evaluator" | "Domain Specialist"
export const rawJobsData: JobPosition[] = [
  {
    id: "job-01",
    title: "Mechanical Engineer",
    date: "Jul 10, 2026",
    category: "Domain Specialist",
    skills: ["mechanical engineering", "solid mechanics", "structural mechanics"],
    experience: "14+",
    pay: "$50-70/h",
    description: "Apply advanced mechanical engineering expertise to train next-generation physical reasoning models. Review solid dynamics, thermal equations, and structural simulation prompt datasets.",
    scopeOfWork: [
      "Author rigorous single-choice and open-ended technical questions rooted in mechanical engineering.",
      "Review and score model-generated structural mechanics simulations for academic accuracy.",
      "Detail mathematical and engineering rationales to improve model feedback loops."
    ],
    preferredQualifications: [
      "Master's or PhD in Mechanical Engineering or a related core physics field.",
      "Expert-level familiarity with Finite Element Analysis (FEA) and Computational Fluid Dynamics (CFD).",
      "Outstanding communication skills to explain complex physical dynamics clearly."
    ]
  },
  {
    id: "job-02",
    title: "Software Engineer (Go, Python, TS)",
    date: "Jul 10, 2026",
    category: "Code Trainer",
    skills: ["Python", "Go", "Typescript"],
    experience: "Any",
    pay: "$80-100/h",
    description: "Help frontier software engineering models write, debug, and optimize code in Go, Python, and TypeScript. Evaluate multi-step logic and API integrations.",
    scopeOfWork: [
      "Write clean, idiomatic code snippets in Go, Python, and TypeScript to serve as gold-standard reference answers.",
      "Audit model-generated algorithms for memory leaks, type safety, and runtime complexity.",
      "Formulate precise unit tests and edge cases to stress-test compiler assistants."
    ],
    preferredQualifications: [
      "Professional experience building production services in Python, Go, or TypeScript.",
      "Strong command of object-oriented and functional design patterns.",
      "Ability to write extensive code reviews explaining subtle performance bottlenecks."
    ]
  },
  {
    id: "job-03",
    title: "Electrical Engineer",
    date: "Jul 10, 2026",
    category: "Domain Specialist",
    skills: ["electrical engineering", "analog circuits", "digital circuits"],
    experience: "12+",
    pay: "$60-80/h",
    description: "Evaluate circuit designs, signal processing guides, and electromagnetism prompts to refine hardware design reasoning models.",
    scopeOfWork: [
      "Review and correct analog and digital circuit design schematics produced by LLMs.",
      "Generate complex problems covering network theorems, signal-to-noise ratios, and semiconductor physics.",
      "Explain circuit modeling decisions and diagnostic strategies for semiconductor evaluations."
    ],
    preferredQualifications: [
      "Degree in Electrical Engineering (M.S. or PhD preferred) with deep hardware design familiarity.",
      "Familiarity with circuit simulation tools like SPICE or RTL validation methodologies.",
      "Demonstrated ability to write comprehensive, technically pristine analytical guides."
    ]
  },
  {
    id: "job-04",
    title: "Frontend Software Engineer",
    date: "Jul 9, 2026",
    category: "Code Trainer",
    skills: ["Component Style Guides", "Pixel-Perfect UI Implementation", "Typescript"],
    experience: "2+",
    pay: "$40-50/h",
    description: "Train frontend-focused AI models to translate design specs (Figma) into pixel-perfect, highly accessible React and Tailwind CSS markup.",
    scopeOfWork: [
      "Review auto-generated React components for responsiveness, semantics, and accessibility (WAI-ARIA).",
      "Draft modular component style guides as instructional materials for layout training.",
      "Debug typescript typing errors in frontend state management code bases."
    ],
    preferredQualifications: [
      "2+ years of professional frontend web development experience using modern React/Vite/Tailwind.",
      "Exceptional eye for detail regarding margins, font tracking, and layout transitions.",
      "Familiarity with CSS-in-JS, Tailwind variables, and fluid typography rules."
    ]
  },
  {
    id: "job-05",
    title: "Logistics & Supply Chain Management Specialist",
    date: "Jul 9, 2026",
    category: "Model Training",
    skills: ["Logistics", "Supply Chains", "Packing Lists"],
    experience: "2+",
    pay: "$40-50/h",
    description: "Contribute operational logistics knowledge to train planning and supply chain optimization models. Guide models on freight routing and supply planning.",
    scopeOfWork: [
      "Evaluate model-generated supply chain forecasting, inventory management, and multi-depot shipping itineraries.",
      "Draft standard packing list structures and custom clearance workflow guidelines for model instruction.",
      "Redact or optimize inventory audit prompts with professional logistics domain rules."
    ],
    preferredQualifications: [
      "2+ years in global logistics, procurement, freight forwarding, or supply chain analytics.",
      "Familiarity with ERP software layouts, packing list conventions, and container optimization.",
      "Strong analytical thinking to design real-world delivery delay mitigation drills."
    ]
  },
  {
    id: "job-06",
    title: "Agentic AI Expert",
    date: "Jul 9, 2026",
    category: "Code Trainer",
    skills: ["ai agent workflows", "autonomous ai coding agents", "code refactoring"],
    experience: "3+",
    pay: "$70-126/h",
    description: "Develop, review, and evaluate complex multi-agent reasoning graphs and autonomous software workflows. Train models to think in multi-step execution loops.",
    scopeOfWork: [
      "Evaluate system-level decision trees for autonomous coding agents.",
      "Refactor multi-file projects to enhance model compatibility with tools (RAG, Web Search, Executable Sandbox).",
      "Benchmark model capacities in tool-use, self-reflection, and recursive debugging tasks."
    ],
    preferredQualifications: [
      "3+ years of working directly with LangChain, AutoGen, CrewAI, or custom LLM agent systems.",
      "Deep understanding of planning algorithms, memory persistence, and tool invocation hooks.",
      "Strong software development skills with an emphasis on asynchronous API architectures."
    ]
  },
  {
    id: "job-07",
    title: "Business Document Expert (Excel, PowerPoint, Word)",
    date: "Jul 8, 2026",
    category: "Model Training",
    skills: ["microsoft excel", "microsoft powerpoint", "microsoft word"],
    experience: "14+",
    pay: "$35-50/h",
    description: "Train office-productivity AI models to execute highly advanced formulas, master formatting macros, and design flawless slide presentation decks.",
    scopeOfWork: [
      "Evaluate VBA macros, pivot table blueprints, and dynamic lookup logic written by AI assistants.",
      "Structure outline guides for slides to train the spatial positioning and layout logic of PPT generators.",
      "Create high-precision business letter and report templates to validate text style parameters."
    ],
    preferredQualifications: [
      "14+ years of intensive corporate or consulting experience handling business documentation.",
      "Expert knowledge of complex spreadsheet operations (VLOOKUP, INDEX-MATCH, nested IFs, dynamic arrays).",
      "High standard for visual layout consistency and clean corporate storytelling."
    ]
  },
  {
    id: "job-08",
    title: "AI Image & Video Evaluation Specialist (Pacific Standard Time Zone)",
    date: "Jul 8, 2026",
    category: "Quality Evaluator",
    skills: ["visual quality assessment", "image evaluation", "video evaluation"],
    experience: "12+",
    pay: "$30-40/h",
    description: "Evaluate spatial layout, prompt adherence, visual noise, and physical modeling consistency for leading generative image and video diffusion models.",
    scopeOfWork: [
      "Audit high-resolution diffusion outputs, reporting artifacts, lighting errors, and physics violations.",
      "Annotate video sequences for frame-rate consistency, motion blur, and spatial continuity.",
      "Categorize visual styles and verify model adherence to complex negative prompt filters."
    ],
    preferredQualifications: [
      "12+ years of background in digital art, photography, videography, or visual QA.",
      "Must reside or work within the Pacific Standard Time Zone (PST) for real-time validation sprints.",
      "Exceptional visual acuity and a vocabulary to describe lighting, texturing, and geometry anomalies."
    ]
  },
  {
    id: "job-09",
    title: "AI Customer Support Specialist (Pacific Time Zone ONLY)",
    date: "Jul 7, 2026",
    category: "Quality Evaluator",
    skills: ["customer service in tech or saas", "attention to detail", "organization"],
    experience: "4+",
    pay: "$30-34/h",
    description: "Benchmark customer support agent models for empathy, clarity, safety policy alignment, and technical diagnostic capabilities in SaaS scenarios.",
    scopeOfWork: [
      "Engage in multi-turn roleplay conversations simulating frustrated, confused, or complex customer personas.",
      "Score model responses on brand voice alignment, resolution accuracy, and tool usage prompts.",
      "Identify conversational loops, failure to escalate, and policy infractions."
    ],
    preferredQualifications: [
      "4+ years of tech or SaaS customer-facing experience (Intercom, Zendesk, Salesforce workflows).",
      "Must be strictly located in the Pacific Time Zone.",
      "High attention to detail, strong organizing skills, and native-level English written empathy."
    ]
  },
  {
    id: "job-10",
    title: "Senior Software Engineer",
    date: "Jul 7, 2026",
    category: "Code Trainer",
    skills: ["Python3", "JAVA", "Rust"],
    experience: "7+",
    pay: "$50-70/h",
    description: "Train model architectures on backend system design, concurrency primitives, and safe memory management models using Python, Java, and Rust.",
    scopeOfWork: [
      "Draft highly complex back-end architectures as gold-standard training blueprints.",
      "Evaluate code generation outputs for thread safety, safe pointer usage in Rust, and JVM optimization.",
      "Refactor multi-threaded code bases to evaluate model-guided code transformations."
    ],
    preferredQualifications: [
      "7+ years of professional backend software engineering experience with systems-level programming languages.",
      "Strong understanding of memory allocation, concurrency, and distributed networking models.",
      "Experience with Rust memory ownership rules and Java garbage collection strategies is highly valued."
    ]
  },
  {
    id: "job-11",
    title: "Computational Chemistry Expert (PhD)",
    date: "Jul 7, 2026",
    category: "Domain Specialist",
    skills: ["computational chemistry", "molecular simulations", "python"],
    experience: "22+",
    pay: "$40-60/h",
    description: "Train frontier scientific models to interpret molecular dynamics, perform structure-based drug design, and evaluate quantum chemical calculations.",
    scopeOfWork: [
      "Design advanced chemistry-focused prompt datasets covering quantum chemistry and DFT equations.",
      "Verify computational chemistry python scripts (using libraries like RDKit, OpenMM, or PySCF).",
      "Evaluate model predictions on molecular properties, structural docking, and transition states."
    ],
    preferredQualifications: [
      "PhD in Computational Chemistry, Biochemistry, or Molecular Physics with 22+ years of combined academic/field experience.",
      "Deep expertise in molecular dynamics simulations (GROMACS, AMBER) and structure analysis.",
      "Advanced programming skills in scientific Python."
    ]
  },
  {
    id: "job-12",
    title: "Computational Biology Expert (PhD)",
    date: "Code Trainer",
    category: "Code Trainer",
    skills: ["Python", "Bash"],
    experience: "Any",
    pay: "$40-60/h",
    description: "Validate bioinformatics pipelines, gene sequence alignment algorithms, and computational modeling scripts to improve automated biology pipelines.",
    scopeOfWork: [
      "Write and review Bash/Python scripts used in sequence alignment, variant calling, and bulk RNA-seq processing.",
      "Test model comprehension of genomic database structures (NCBI, Ensembl, PDB).",
      "Formulate precise troubleshooting datasets highlighting sequence analysis pipeline errors."
    ],
    preferredQualifications: [
      "PhD or advanced degree in Computational Biology, Bioinformatics, or Genetics.",
      "Comfortable with high-performance computing clusters and bio-repository pipelines.",
      "Proficient in Python (Biopython, pandas) and shell-scripting automation."
    ]
  },
  {
    id: "job-13",
    title: "Chemistry Professor/Researcher (PhD)",
    date: "Jul 6, 2026",
    category: "Domain Specialist",
    skills: ["Chemistry", "Research", "Teaching"],
    experience: "1+",
    pay: "$70-90/h",
    description: "Create and audit higher-education chemistry curriculum datasets. Train models on explaining general organic and physical chemistry theories.",
    scopeOfWork: [
      "Draft exam-level chemistry questions covering stereochemistry, kinetics, and spectroscopy.",
      "Score model explanations for pedagogical clarity, logical progression, and safety during chemical synthesis instructions.",
      "Synthesize multi-step synthesis pathways to test model-reasoning bounds."
    ],
    preferredQualifications: [
      "PhD in Chemistry with experience teaching or conducting peer-reviewed academic research.",
      "Passion for making complex chemical formulations clear and accessible.",
      "Deep understanding of safety guidelines and chemical safety databases."
    ]
  },
  {
    id: "job-14",
    title: "Mathematics Expert",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["advanced mathematics", "mathematical proof writing", "technical report writing"],
    experience: "7+",
    pay: "$20-40/h",
    description: "Write, review, and evaluate mathematical proof chains, ensuring correct logical deductions, variable declarations, and theorem references.",
    scopeOfWork: [
      "Translate advanced mathematical theorems into structured, machine-verifiable proofs.",
      "Evaluate AI reasoning chains in topics like Abstract Algebra, Real Analysis, and Topology.",
      "Author detailed reports highlighting subtle flaws in model-generated mathematical induction steps."
    ],
    preferredQualifications: [
      "M.S. or PhD in Mathematics or highly mathematical sciences.",
      "7+ years of writing peer-reviewed research papers or complex technical reports.",
      "Exceptional command of LaTeX and structural mathematical proofs."
    ]
  },
  {
    id: "job-15",
    title: "Computer Science Specialist",
    date: "Jul 2, 2026",
    category: "Code Trainer",
    skills: ["technical writing", "system design", "algorithms"],
    experience: "11+",
    pay: "$20-40/h",
    description: "Evaluate complex system designs, data structure selections, and core computer science algorithm explanations for advanced model training.",
    scopeOfWork: [
      "Audit model descriptions of microservices, caching architectures, and load balancing algorithms.",
      "Draft comprehensive system architecture challenge prompts.",
      "Explain the performance tradeoffs of spatial indices, graph databases, and memory structures."
    ],
    preferredQualifications: [
      "Degree in Computer Science with 11+ years of combined engineering and technical writing experience.",
      "Expert knowledge of Big-O analysis, network protocol layouts, and cache coherence strategies.",
      "Outstanding technical documentation and review writing skills."
    ]
  },
  {
    id: "job-16",
    title: "Engineering Expert",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["engineering documentation analysis", "technical report writing", "written and verbal communication"],
    experience: "2+",
    pay: "$20-40/h",
    description: "Analyze engineering documents, blueprint specifications, and technical standards to validate model comprehension of civil, chemical, or materials engineering texts.",
    scopeOfWork: [
      "Verify model extractions of structural standards, mechanical parameters, and chemical safety ratios from technical PDFs.",
      "Author concise technical report templates to validate model report generation.",
      "Critique model summaries of ISO and ASTM standards for completeness and context."
    ],
    preferredQualifications: [
      "Degree in Civil, Chemical, Materials, or General Engineering.",
      "2+ years of professional engineering consulting, documentation analysis, or technical reporting.",
      "Rigorous attention to numeric accuracy and specification bounds."
    ]
  },
  {
    id: "job-17",
    title: "Physics Expert",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["physics domain expertise", "data analysis", "experimental design"],
    experience: "9+",
    pay: "$20-40/h",
    description: "Benchmark physics-reasoning engines on complex kinematics, relativistic dynamics, statistical thermodynamics, and electromagnetism.",
    scopeOfWork: [
      "Design simulated experimental setups to test model capabilities in predicting system trajectories.",
      "Score model-generated physical formulas for dimensional integrity and appropriate boundary constraints.",
      "Write rigorous physics analysis reports clarifying subtle wave-mechanics or field-theory concepts."
    ],
    preferredQualifications: [
      "9+ years of professional research or academic training in Theoretical or Experimental Physics.",
      "Proficient in applying mathematical modeling to physical systems.",
      "Deep understanding of classical mechanics, statistical physics, and quantum theory."
    ]
  },
  {
    id: "job-18",
    title: "Chemistry Expert",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["chemistry domain expertise", "experimental write-ups", "technical analysis"],
    experience: "7+",
    pay: "$20-40/h",
    description: "Verify molecular structures, stoichiometry calculations, and chemical reaction mechanisms to train enterprise chemical intelligence models.",
    scopeOfWork: [
      "Formulate multi-step organic synthesis problems and verify model reaction maps.",
      "Audit model stoichiometry guides and thermodynamics analyses for lab-scale reactors.",
      "Draft and review detailed, step-by-step chemical safety procedures for volatile reagents."
    ],
    preferredQualifications: [
      "Degree in Chemistry or Chemical Engineering with 7+ years of laboratory/analytical experience.",
      "Mastery of spectroscopy interpretation (NMR, IR, Mass Spec) and inorganic reaction classes.",
      "Excellent technical documentation and precision writing habits."
    ]
  },
  {
    id: "job-19",
    title: "Biology Expert",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["scientific writing", "biological data analysis", "academic research"],
    experience: "2+",
    pay: "$20-40/h",
    description: "Validate biological model reasoning on genetics, cell division pathways, ecosystem dynamics, and molecular biology mechanics.",
    scopeOfWork: [
      "Audit model explanations of metabolic cycles (e.g., Krebs cycle, photosynthesis) and genetic transcriptions.",
      "Score biological data analysis summaries for scientific rigor.",
      "Design academic biology prompts to challenge model-reasoning limits."
    ],
    preferredQualifications: [
      "Master's degree in Biology, Biochemistry, or Genetics with 2+ years of research or scientific writing.",
      "Deep understanding of laboratory methodologies (PCR, CRISPR, Western blotting).",
      "Exceptional capability to synthesize medical and scientific literature into clean explanations."
    ]
  },
  {
    id: "job-20",
    title: "Medical Specialist",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["Medical writing & documentation", "Confidentiality & de-identification judgment", "Medical Depth"],
    experience: "Any",
    pay: "$20-40/h",
    description: "Evaluate clinical trial reporting, medical research transcription, and symptom-mapping models for extreme accuracy and regulatory safety compliance.",
    scopeOfWork: [
      "Review and verify de-identified clinical notes, pathology documentation summaries, and medical write-ups.",
      "Ensure model outputs adhere strictly to privacy guidelines (HIPAA) and patient safety frameworks.",
      "Score simulated diagnosis explanations for medical completeness and clinical communication quality."
    ],
    preferredQualifications: [
      "Graduate-level medical background (MD, DO, PharmD, BSN, or advanced Nurse Practitioner).",
      "Demonstrated experience writing, editing, or auditing clinical literature or patient-facing materials.",
      "Impeccable ethical judgment regarding medical privacy and diagnostics bounds."
    ]
  },
  {
    id: "job-21",
    title: "Legal Specialist",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["Legal analysis and issue spotting", "Strong legal writing", "Document drafting experience"],
    experience: "1+",
    pay: "$20-40/h",
    description: "Analyze, edit, and score model-drafted contracts, brief summaries, case issue spotters, and regulatory research indices.",
    scopeOfWork: [
      "Inject complex contractual scenarios into model interfaces to evaluate issue spotting capabilities.",
      "Draft precise legal memo templates to serve as gold-standard reference datasets.",
      "Correct model summaries of active case law, checking statutory citations and legal logic."
    ],
    preferredQualifications: [
      "JD, LLM, or paralegal degree with 1+ years of active litigation or transactional drafting experience.",
      "Superb written advocacy skills with a highly structured style of writing (IRAC method).",
      "Capable of reading and digesting multi-page judicial briefs rapidly."
    ]
  },
  {
    id: "job-22",
    title: "Finance Specialist",
    date: "Jul 2, 2026",
    category: "Domain Specialist",
    skills: ["Financial analysis depth", "Financial report writing", "Data visualization and quantitative presentation"],
    experience: "1+",
    pay: "$20-40/h",
    description: "Verify corporate financial analysis, asset pricing models, and investment reports generated by analytical financial AI agents.",
    scopeOfWork: [
      "Score model interpretations of corporate balance sheets, cash flow metrics, and SEC disclosures.",
      "Formulate multi-stage quantitative finance prompts to test algorithmic model accuracy.",
      "Evaluate financial data visualizations and verify narrative summaries."
    ],
    preferredQualifications: [
      "Degree in Finance, Economics, or Quantitative Accounting (CFA or CPA is a major plus).",
      "1+ years of professional financial modeling, investment analysis, or corporate reporting.",
      "Excellent quantitative writing skills and meticulous numerical validation habits."
    ]
  },
  {
    id: "job-23",
    title: "Tongan Bilingual Expert",
    date: "Jul 1, 2026",
    category: "Model Training",
    skills: ["tongan-english bilingual fluency", "audio and video transcription", "timestamping"],
    experience: "9+",
    pay: "$45-95/h",
    description: "Localize translation systems, transcribe Tongan media, and align model outputs with dialectal nuances and Tongan cultural context.",
    scopeOfWork: [
      "Provide high-accuracy Tongan-English translations of legal, agricultural, and cultural literature.",
      "Transcribe and timestamp audio datasets to calibrate speech-recognition engines.",
      "Audit model translation outputs for tone, grammar, and idiom accuracy."
    ],
    preferredQualifications: [
      "9+ years of professional translation, bilingual instruction, or native Tongan cultural consulting.",
      "Flawless written and oral command of both Tongan and English.",
      "Experience handling timestamped transcriptions or subtitle tracking platforms is highly desired."
    ]
  },
  {
    id: "job-24",
    title: "Physics Professor/Researcher (PhD)",
    date: "Jun 30, 2026",
    category: "Domain Specialist",
    skills: ["Physics", "Research", "Teaching"],
    experience: "1+",
    pay: "$70-90/h",
    description: "Synthesize higher-education physics curriculum and verify model capacity to solve advanced thermodynamic, quantum, and solid-state physics equations.",
    scopeOfWork: [
      "Create rigorous, graduate-level textbook physics challenges and reference solution pathways.",
      "Score model reasoning logs on thermodynamic proofs for step-by-step physical accuracy.",
      "Refine model safety thresholds around physical systems safety (e.g., high-voltage circuits, radiation guidelines)."
    ],
    preferredQualifications: [
      "PhD in Physics with academic teaching experience or peer-reviewed publications.",
      "Outstanding pedagogical instincts to clarify physical laws.",
      "Advanced command of mathematical physics techniques."
    ]
  },
  {
    id: "job-25",
    title: "AI Jailbreak & Prompt-Injection Security Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["Ethical Jailbreaks", "LLM Red Teaming", "Prompt Injection"],
    experience: "1+",
    pay: "$50-90/h",
    description: "Stress-test enterprise frontier models against safety barrier bypasses, social engineering attacks, and prompt injection techniques.",
    scopeOfWork: [
      "Conduct offensive red-teaming campaigns targeting model safety frameworks.",
      "Formulate novel prompt-injection attacks to test systemic resistance boundaries.",
      "Provide technical evaluations of safety barrier patches and model compliance."
    ],
    preferredQualifications: [
      "1+ years of offensive cybersecurity, red teaming, or dedicated LLM safety research.",
      "Fluent understanding of context window manipulation and token-level evasion.",
      "Background in application security (OWASP standards) is a huge advantage."
    ]
  },
  {
    id: "job-26",
    title: "Mental-Health Crisis Prevention Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["Psychology", "Mental-Health", "Crisis Response"],
    experience: "2+",
    pay: "$50-90/h",
    description: "Evaluate model-safety parameters regarding mental-health indicators. Train conversational agents to safely direct individuals to professional care.",
    scopeOfWork: [
      "Create complex conversational evaluation scripts covering crisis indicators.",
      "Ensure models strictly reject clinical diagnosis requests while delivering empathetic, safe boundary messages.",
      "Verify that model outputs always suggest professional local and national support channels correctly."
    ],
    preferredQualifications: [
      "Master's or advanced degree in Clinical Psychology, Social Work, or Psychiatric Nursing.",
      "2+ years of crisis center counseling, suicide prevention, or clinical intake coordination.",
      "Absolute clarity regarding safety protocols and clinical communication limits."
    ]
  },
  {
    id: "job-27",
    title: "Financial Crime & AML Compliance Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["AML", "Fraud", "Marketplace Abuse"],
    experience: "4+",
    pay: "$50-90/h",
    description: "Train financial model safety engines to identify, flag, and analyze patterns of money laundering, card fraud, and marketplace manipulation.",
    scopeOfWork: [
      "Design adversarial prompts modeling transaction evasion strategies.",
      "Audit model capabilities to explain anti-money laundering (AML) regulatory frameworks (Bank Secrecy Act).",
      "Test model logic in spotting transaction anomalies and shell company networks."
    ],
    preferredQualifications: [
      "4+ years of professional AML investigation, fraud detection, or financial regulatory compliance.",
      "CAMS (Certified Anti-Money Laundering Specialist) or CFE (Certified Fraud Examiner) credentials.",
      "Deep understanding of structured financial transactions and risk mitigation protocols."
    ]
  },
  {
    id: "job-28",
    title: "Red Team Lead (Offensive Cybersecurity)",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["Cyber Security", "Exploit Chains", "Cloud/Appsec"],
    experience: "1+",
    pay: "$50-90/h",
    description: "Lead comprehensive security evaluation cohorts targeting generative developer tools. Ensure models do not generate exploitative scripts or vulnerability vectors.",
    scopeOfWork: [
      "Audit model code-generation outputs to ensure they do not accidentally draft zero-day exploit scripts.",
      "Red-team model capacity to analyze network traffic log vulnerability patterns.",
      "Construct multi-stage secure-coding challenge sets for compiler model testing."
    ],
    preferredQualifications: [
      "Experience conducting penetration tests, network security audits, or leading enterprise red teams.",
      "Deep knowledge of exploit chains, cloud-native deployments, and application architecture security.",
      "OSCP, OSCE, or related offensive cybersecurity certifications are highly valued."
    ]
  },
  {
    id: "job-29",
    title: "Nuclear & Radiological Security Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["Nuclear Physics", "Radiological Safety", "Nonproliferation"],
    experience: "1+",
    pay: "$50-90/h",
    description: "Conduct nonproliferation safety checks and radiological containment validation tests. Ensure model safety parameters strictly reject sensitive nuclear calculations.",
    scopeOfWork: [
      "Evaluate model boundaries against nuclear physics inquiries, verifying the containment of CBRN instructions.",
      "Draft scenario checks regarding the transport of hazardous radiological isotopes.",
      "Audit model reports on nuclear nonproliferation treaties and compliance frameworks."
    ],
    preferredQualifications: [
      "Degree in Nuclear Physics, Nuclear Engineering, or Global Nonproliferation Policy.",
      "Familiarity with IAEA standards, safety guidelines, and radiological hazard management.",
      "High level of integrity and deep responsibility regarding nuclear security protocols."
    ]
  },
  {
    id: "job-30",
    title: "Financial Services Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["Financial Advising", "Rubrics", "Prompt"],
    experience: "1+",
    pay: "$80-110/h",
    description: "Verify that model-generated advisory outlines, savings plans, and financial reports meet stringent regulatory standards (SEC/FINRA rules).",
    scopeOfWork: [
      "Draft comprehensive grading rubrics defining legal boundaries for model financial advice.",
      "Stress-test model responsiveness to prompt instructions regarding fiduciary duties.",
      "Correct financial calculations and narrative suggestions in simulated client plans."
    ],
    preferredQualifications: [
      "Experience in Financial Planning, Advisory, or compliance at a FINRA-regulated firm.",
      "Series 7, 65, 66, or CFP credentials are highly desirable.",
      "Strong command of professional financial documentation and compliance frameworks."
    ]
  },
  {
    id: "job-31",
    title: "Biosecurity & Synthetic Biology Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["Biosecurity", "Lab Safety", "Biological Misuse"],
    experience: "1+",
    pay: "$50-90/h",
    description: "Analyze synthetic biology inquiries and evaluate biosecurity guardrails. Ensure models strictly refuse requests for viral engineering or toxin synthesis.",
    scopeOfWork: [
      "Formulate safety prompts covering biosecurity compliance, pathogen engineering filters, and lab containment safety.",
      "Audit model refusal logic when presented with instructions on culturing high-risk pathogens.",
      "Verify model accuracy when summarizing DNA synthesis screening standards."
    ],
    preferredQualifications: [
      "Advanced degree (M.S. or PhD) in Virology, Microbiology, Synthetic Biology, or Biosecurity Policy.",
      "Practical experience in Biosafety Level (BSL) 3 or 4 laboratories is highly valued.",
      "Deep understanding of the Dual-Use Research of Concern (DURC) guidelines."
    ]
  },
  {
    id: "job-32",
    title: "Child & Online Safety Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["Child Safety", "CSAM-adjacent Policy", "Teen Safety"],
    experience: "2+",
    pay: "$50-90/h",
    description: "Train model content moderation algorithms to recognize, flag, and remove harmful text and interactive narratives targeting minors.",
    scopeOfWork: [
      "Evaluate interactive prompt trees to verify model alignment with COPPA, age-appropriate design codes, and teen safety rules.",
      "Audit model behavior when asked to simulate age-restricted roleplay, ensuring strict refusal mechanics.",
      "Design advanced semantic safety classifiers to flag grooming, bullying, or self-harm content."
    ],
    preferredQualifications: [
      "2+ years of professional trust & safety experience, content policy drafting, or child protection advocacy.",
      "Fluent understanding of online child exploitation indicators and CSAM mitigation frameworks.",
      "Superb psychological resilience and professional detachment when handling safety guidelines."
    ]
  },
  {
    id: "job-33",
    title: "Military Operations & IHL Expert",
    date: "Jun 29, 2026",
    category: "Quality Evaluator",
    skills: ["War Fighting", "Weapons Targeting", "Defense Operations"],
    experience: "1+",
    pay: "$50-90/h",
    description: "Validate military operation models, weapons systems logic, and international humanitarian law (IHL) safety alignment data.",
    scopeOfWork: [
      "Ensure models strictly refuse tactical kinetic targeting planning requests or chemical weapon synthesis prompt lines.",
      "Evaluate model summaries of the Geneva Conventions and military operational guidelines for compliance.",
      "Audit tactical training simulation dialogues to confirm they prioritize non-combatant safety."
    ],
    preferredQualifications: [
      "Retired military operations officer, military attorney (JAG), or expert in International Humanitarian Law (IHL).",
      "Deep understanding of proportional targeting rules, rules of engagement (ROE), and defensive strategies.",
      "Exceptional analytical precision and written reporting habits."
    ]
  }
];
