export interface Job {
  id: string;
  title: string;
  company: string;
  category: "Tech" | "Design" | "Marketing" | "Operations" | "Sales";
  salary: string;
  location: string;
  type: string;
  posted: string;
  hurdles: string[];
  solutions: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  duration: string;
  popular?: boolean;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  formerRole: string;
  newRole: string;
  quote: string;
  company: string;
  timeToLand: string;
  avatar: string;
}

export interface ResumeAnalysisResult {
  score: number;
  atsScore: number;
  verbScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  hurdles: string[];
  formattingTips: string[];
  bulletRewrites: {
    original: string;
    rewritten: string;
    explanation: string;
  }[];
  coachingAdvice: string;
}
