import { useState, useEffect, FormEvent, DragEvent, ChangeEvent } from "react";
import { 
  Menu, 
  X, 
  Users, 
  TrendingUp, 
  Globe, 
  Building2, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Layers, 
  Search, 
  GraduationCap, 
  CheckSquare, 
  Sparkles,
  Briefcase,
  Star,
  Send,
  Linkedin,
  Shield,
  Code,
  MessageSquare,
  Cpu,
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Paperclip,
  Trash2,
  Plus,
  Lock,
  Unlock,
  LogOut,
  LogIn,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { rawJobsData, rewrittenTestimonials, JobPosition } from "./jobsData";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocFromServer, updateDoc, increment, getDoc } from "firebase/firestore";
import { db, auth, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from "./firebase";
// @ts-ignore
import logoImg from "./assets/images/zenire_logo_1783707601229.jpg";



// Types for components
interface TestimonialData {
  id: string;
  name: string;
  country: string;
  quote: string;
  avatarColor: string;
  initials: string;
  avatarUrl?: string;
}

export default function App() {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Positions Grid Category Filter state
  const [positionFilter, setPositionFilter] = useState<string>("All");
  
  // "How It Works" toggle state
  const [activeStepTab, setActiveStepTab] = useState<"candidates" | "companies">("candidates");

  // Dialog modals states
  const [exploreModalOpen, setExploreModalOpen] = useState(false);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [learnMoreModalOpen, setLearnMoreModalOpen] = useState(false);

  // Form states
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    skills: "Model Training",
    linkedin: "",
    notes: ""
  });
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    needs: "Data Labeling",
    notes: ""
  });

  // Candidate CV File state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const removeCvFile = () => {
    setCvFile(null);
  };
  
  // Success notification banner state
  const [notification, setNotification] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseError, setFirebaseError] = useState<{
    message: string;
    type: 'permission' | 'unauthorized-domain' | 'generic';
    path?: string;
  } | null>(null);
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setNotification(`${label} copied to clipboard!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCandidateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const roleName = selectedJobToApply ? selectedJobToApply.title : candidateForm.skills;
    const cvText = cvFile ? ` (with attached resume "${cvFile.name}")` : "";
    
    const subject = `Zenire Application - ${candidateForm.name} - ${roleName}`;
    const body = `Full Name: ${candidateForm.name}
Email Address: ${candidateForm.email}
Skills/Target Category: ${roleName}
LinkedIn/Portfolio: ${candidateForm.linkedin || "N/A"}
Additional Notes: ${candidateForm.notes || "None"}
CV / Resume: ${cvFile ? cvFile.name : "None uploaded"}`;

    const mailtoUrl = `mailto:support@zenire.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      // 1. Save to Firestore
      const appRef = doc(collection(db, "applications"));
      await setDoc(appRef, {
        id: appRef.id,
        name: candidateForm.name,
        email: candidateForm.email,
        skills: roleName,
        linkedin: candidateForm.linkedin,
        notes: candidateForm.notes,
        cvFileName: cvFile ? cvFile.name : "",
        jobId: selectedJobToApply ? selectedJobToApply.id : "",
        jobTitle: selectedJobToApply ? selectedJobToApply.title : "",
        createdAt: new Date().toISOString()
      });

      // 2. Trigger mailto
      window.location.href = mailtoUrl;

      setNotification(`Application for "${roleName}"${cvText} has been saved to our secure database and prepared in your email client for support@zenire.in! If your email client didn't open automatically, please send details directly to support@zenire.in.`);
      setExploreModalOpen(false);
      setSelectedJobToApply(null);
      setCandidateForm({ name: "", email: "", skills: "Model Training", linkedin: "", notes: "" });
      setCvFile(null);
      setTimeout(() => setNotification(null), 15000);
    } catch (err) {
      console.error("Error saving application:", err);
      // Fallback: trigger mailto even if Firestore write fails
      window.location.href = mailtoUrl;
      setNotification(`Application draft prepared for support@zenire.in! (Local state ready; database sync skipped: ${err instanceof Error ? err.message : "network issue"})`);
      setExploreModalOpen(false);
      setSelectedJobToApply(null);
      setCandidateForm({ name: "", email: "", skills: "Model Training", linkedin: "", notes: "" });
      setCvFile(null);
      setTimeout(() => setNotification(null), 15000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const company = companyForm.companyName;
    const email = companyForm.email;
    const needs = companyForm.needs;
    
    const subject = `Zenire Hiring Inquiry - ${company} - ${needs}`;
    const body = `Company Name: ${company}
Contact Person: ${companyForm.contactName}
Email Address: ${email}
Talent Needs: ${needs}
Additional Details: ${companyForm.notes || "None"}`;

    const mailtoUrl = `mailto:support@zenire.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      // 1. Save to Firestore
      const inquiryRef = doc(collection(db, "inquiries"));
      await setDoc(inquiryRef, {
        id: inquiryRef.id,
        companyName: company,
        contactName: companyForm.contactName,
        email: email,
        needs: needs,
        notes: companyForm.notes,
        createdAt: new Date().toISOString()
      });

      // 2. Trigger mailto
      window.location.href = mailtoUrl;

      setNotification(`Hiring inquiry for "${needs}" talent has been saved to our database and prepared in your email client for support@zenire.in! A client partner will also reach out to you within 24 hours.`);
      setHireModalOpen(false);
      setCompanyForm({ companyName: "", contactName: "", email: "", needs: "Data Labeling", notes: "" });
      setTimeout(() => setNotification(null), 15000);
    } catch (err) {
      console.error("Error saving inquiry:", err);
      // Fallback
      window.location.href = mailtoUrl;
      setNotification(`Hiring inquiry draft prepared for support@zenire.in! (Local state ready; database sync skipped: ${err instanceof Error ? err.message : "network issue"})`);
      setHireModalOpen(false);
      setCompanyForm({ companyName: "", contactName: "", email: "", needs: "Data Labeling", notes: "" });
      setTimeout(() => setNotification(null), 15000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Master state for view toggling: 'home' | 'jobs' | 'admin' | 'privacy' | 'terms' | 'agreement' | 'story'
  const [currentView, setCurrentView] = useState<"home" | "jobs" | "admin" | "privacy" | "terms" | "agreement" | "story">("home");

  // Dynamic jobs list stored in state (initialized to raw data)
  const [jobs, setJobs] = useState<JobPosition[]>(rawJobsData);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminQueryActive, setAdminQueryActive] = useState(false);

  // Visitor tracking states
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [visitorCountLoading, setVisitorCountLoading] = useState(true);

  // Track page visitor and subscribe to real-time stats count
  useEffect(() => {
    let unsubscribeStats: (() => void) | undefined;
    
    const initTracking = async () => {
      try {
        const docRef = doc(db, "stats", "visitors");
        const alreadyCounted = sessionStorage.getItem("zenire_visitor_tracked");

        if (!alreadyCounted) {
          try {
            await updateDoc(docRef, {
              count: increment(1),
              updatedAt: new Date().toISOString()
            });
            sessionStorage.setItem("zenire_visitor_tracked", "true");
          } catch (err: any) {
            // If the document doesn't exist (not-found or permissions for non-existing), let's create it
            if (err.code === "not-found") {
              await setDoc(docRef, {
                count: 1,
                updatedAt: new Date().toISOString()
              });
              sessionStorage.setItem("zenire_visitor_tracked", "true");
            } else {
              console.warn("Failed to increment visitor count on first attempt:", err);
              // Let's check if the doc exists first to handle any other cold errors
              try {
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                  await setDoc(docRef, {
                    count: 1,
                    updatedAt: new Date().toISOString()
                  });
                  sessionStorage.setItem("zenire_visitor_tracked", "true");
                } else {
                  await updateDoc(docRef, {
                    count: increment(1),
                    updatedAt: new Date().toISOString()
                  });
                  sessionStorage.setItem("zenire_visitor_tracked", "true");
                }
              } catch (innerErr) {
                console.error("Critical failure during visitor count initialization:", innerErr);
              }
            }
          }
        }

        // Subscribe to real-time changes
        unsubscribeStats = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            setVisitorCount(snapshot.data().count);
          } else {
            setVisitorCount(0);
          }
          setVisitorCountLoading(false);
        }, (error) => {
          console.error("Error listening to stats:", error);
          handleFirestoreError(error, OperationType.GET, "stats");
          setVisitorCountLoading(false);
        });

      } catch (err) {
        console.error("General error in visitor tracker logic:", err);
        setVisitorCountLoading(false);
      }
    };

    initTracking();

    return () => {
      if (unsubscribeStats) {
        unsubscribeStats();
      }
    };
  }, []);

  // Check URL parameters for hidden admin mode activation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "true") {
        setAdminQueryActive(true);
      }
    }
  }, []);

  // Listen for firestore error events to show visual helper cards
  useEffect(() => {
    const handleFirestoreErrEvent = (event: any) => {
      const detail = event.detail;
      if (detail && detail.error) {
        const errorMsg = detail.error;
        if (errorMsg.includes("permissions") || errorMsg.includes("permission-denied") || errorMsg.includes("Missing or insufficient permissions")) {
          setFirebaseError({
            message: "Firestore has restricted access. It looks like the Security Rules on your custom Firebase project 'zenire-custom' need to be updated.",
            type: 'permission',
            path: detail.path
          });
          setShowConfigHelper(true);
        } else {
          setFirebaseError({
            message: errorMsg,
            type: 'generic',
            path: detail.path
          });
        }
      }
    };

    window.addEventListener('firestore-error', handleFirestoreErrEvent);
    return () => {
      window.removeEventListener('firestore-error', handleFirestoreErrEvent);
    };
  }, []);

  // Job form management states
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    category: "Model Training" as JobPosition["category"],
    skills: "",
    experience: "Any",
    pay: "",
    description: "",
    scopeOfWork: "",
    preferredQualifications: "",
    applyUrl: ""
  });

  // Track Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch from Firestore and Sync with onSnapshot
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const jobsRef = collection(db, "jobs");
    const unsubscribe = onSnapshot(
      jobsRef,
      (snapshot) => {
        const fetchedJobs: JobPosition[] = [];
        snapshot.forEach((snapshotDoc) => {
          fetchedJobs.push({ id: snapshotDoc.id, ...snapshotDoc.data() } as JobPosition);
        });
        
        if (fetchedJobs.length > 0) {
          setJobs(fetchedJobs);
        } else {
          setJobs(rawJobsData);
        }
        setLoadingJobs(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "jobs");
        setLoadingJobs(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const isEffectiveAdmin = currentUser?.email === "swipetoconnect@gmail.com";

  // Sync edit form fields when editingJob changes
  useEffect(() => {
    if (editingJob) {
      setJobForm({
        title: editingJob.title,
        category: editingJob.category,
        skills: editingJob.skills.join(", "),
        experience: editingJob.experience || "Any",
        pay: editingJob.pay,
        description: editingJob.description,
        scopeOfWork: editingJob.scopeOfWork ? editingJob.scopeOfWork.join("\n") : "",
        preferredQualifications: editingJob.preferredQualifications ? editingJob.preferredQualifications.join("\n") : "",
        applyUrl: editingJob.applyUrl || ""
      });
    } else {
      setJobForm({
        title: "",
        category: "Model Training",
        skills: "",
        experience: "Any",
        pay: "",
        description: "",
        scopeOfWork: "",
        preferredQualifications: "",
        applyUrl: ""
      });
    }
  }, [editingJob]);

  // Auth Handlers
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setFirebaseError(null);
    } catch (error: any) {
      console.error("Login failed:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes("auth/unauthorized-domain") || (error && error.code === "auth/unauthorized-domain")) {
        setFirebaseError({
          message: "Authentication failed because this domain is not authorized in your custom Firebase project 'zenire-custom'.",
          type: 'unauthorized-domain'
        });
        setShowConfigHelper(true);
      } else {
        setNotification("Login failed: " + errMsg);
        setTimeout(() => setNotification(null), 10000);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Seed default dataset to Firestore
  const handleSeedJobs = async () => {
    if (!isEffectiveAdmin) return;
    setIsSubmitting(true);
    try {
      for (const job of rawJobsData) {
        const jobRef = doc(db, "jobs", job.id);
        const { id, ...jobData } = job;
        await setDoc(jobRef, jobData);
      }
      setNotification("Successfully seeded the 33 baseline jobs to your Firestore database!");
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error("Error seeding jobs:", error);
      alert("Failed to seed jobs: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save/Create Job
  const handleSaveJob = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEffectiveAdmin) {
      alert("Unauthorized! This operation is restricted to the verified administrator.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const skillsArray = jobForm.skills.split(",").map(s => s.trim()).filter(Boolean);
      const scopeArray = jobForm.scopeOfWork.split("\n").map(s => s.trim()).filter(Boolean);
      const qualArray = jobForm.preferredQualifications.split("\n").map(s => s.trim()).filter(Boolean);
      
      const jobData = {
        title: jobForm.title,
        category: jobForm.category,
        skills: skillsArray,
        experience: jobForm.experience,
        pay: jobForm.pay,
        description: jobForm.description,
        scopeOfWork: scopeArray,
        preferredQualifications: qualArray,
        date: editingJob ? editingJob.date : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        applyUrl: jobForm.applyUrl ? jobForm.applyUrl.trim() : ""
      };

      if (editingJob) {
        const jobRef = doc(db, "jobs", editingJob.id);
        await setDoc(jobRef, jobData, { merge: true });
        setNotification(`Successfully updated job "${jobForm.title}"!`);
      } else {
        const newId = `job-${Date.now()}`;
        const jobRef = doc(db, "jobs", newId);
        await setDoc(jobRef, jobData);
        setNotification(`Successfully posted new job "${jobForm.title}" to Firestore!`);
      }

      setEditingJob(null);
      setJobForm({
        title: "",
        category: "Model Training",
        skills: "",
        experience: "Any",
        pay: "",
        description: "",
        scopeOfWork: "",
        preferredQualifications: "",
        applyUrl: ""
      });
      
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Error saving job: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async (id: string, title: string) => {
    if (!isEffectiveAdmin) {
      alert("Unauthorized! This operation is restricted to the verified administrator.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the job "${title}"?`)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const jobRef = doc(db, "jobs", id);
      await deleteDoc(jobRef);
      setNotification(`Successfully deleted job "${title}"!`);
      
      if (editingJob?.id === id) {
        setEditingJob(null);
      }
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Error deleting job: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared Search & Filters states for the synchronized system
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "highest-pay">("newest");
  
  // Selected job for deep-dive detail modal
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobPosition | null>(null);
  
  // Selected job for applying
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobPosition | null>(null);

  // SEO & Deep-linking Hooks
  // 1. On mount (or when jobs list is populated), open deep-linked job if "job" query parameter exists
  useEffect(() => {
    if (typeof window !== "undefined" && jobs.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get("job");
      if (jobId) {
        const matchingJob = jobs.find((j) => j.id === jobId);
        if (matchingJob) {
          setSelectedJobDetails(matchingJob);
        }
      }
    }
  }, [jobs]);

  // 2. Synchronize url parameters whenever selectedJobDetails changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const currentJobId = params.get("job");
      
      if (selectedJobDetails) {
        if (currentJobId !== selectedJobDetails.id) {
          params.set("job", selectedJobDetails.id);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.pushState({ jobId: selectedJobDetails.id }, "", newUrl);
        }
      } else {
        if (currentJobId) {
          params.delete("job");
          const queryStr = params.toString();
          const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
          window.history.pushState(null, "", newUrl);
        }
      }
    }
  }, [selectedJobDetails]);

  // 3. Keep selectedJobDetails in sync with browser Back/Forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get("job");
      if (jobId) {
        const matchingJob = jobs.find((j) => j.id === jobId);
        if (matchingJob) {
          setSelectedJobDetails(matchingJob);
        } else {
          setSelectedJobDetails(null);
        }
      } else {
        setSelectedJobDetails(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [jobs]);

  // 4. Dynamically inject Meta descriptions, page Title, canonical link, and JSON-LD structured schemas
  useEffect(() => {
    if (typeof document === "undefined") return;

    const removeExistingSchema = () => {
      const oldSchema = document.getElementById("zenire-jsonld-schema");
      if (oldSchema) oldSchema.remove();
    };

    if (selectedJobDetails) {
      // Set Job-specific SEO metadata
      const jobTitle = `${selectedJobDetails.title} - Remote ${selectedJobDetails.category} Job | Zenire.in`;
      document.title = jobTitle;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", `Apply for ${selectedJobDetails.title} at Zenire.in. Remote role paying ${selectedJobDetails.pay}. Preferred experience: ${selectedJobDetails.experience}. ${selectedJobDetails.description}`);

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", `https://www.zenire.in/?job=${selectedJobDetails.id}`);

      // Inject structured JobPosting JSON-LD for Search Engines
      removeExistingSchema();
      const schemaScript = document.createElement("script");
      schemaScript.id = "zenire-jsonld-schema";
      schemaScript.type = "application/ld+json";
      
      const jobSchema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": selectedJobDetails.title,
        "description": `
          <p>${selectedJobDetails.description}</p>
          <h4>Scope of Work:</h4>
          <ul>
            ${selectedJobDetails.scopeOfWork ? selectedJobDetails.scopeOfWork.map(item => `<li>${item}</li>`).join("") : ""}
          </ul>
          <h4>Preferred Qualifications:</h4>
          <ul>
            ${selectedJobDetails.preferredQualifications ? selectedJobDetails.preferredQualifications.map(item => `<li>${item}</li>`).join("") : ""}
          </ul>
        `,
        "datePosted": "2026-07-10",
        "validThrough": "2027-07-10",
        "employmentType": "CONTRACT",
        "hiringOrganization": {
          "@type": "Organization",
          "name": "Zenire.in",
          "sameAs": "https://www.zenire.in/",
          "logo": "https://www.zenire.in/assets/images/zenire_logo_1783707601229.jpg"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US",
            "addressRegion": "Remote",
            "addressLocality": "Remote"
          }
        },
        "jobLocationType": "TELECOMMUTE",
        "applicantLocationRequirements": {
          "@type": "Country",
          "name": "US"
        },
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": {
            "@type": "QuantitativeValue",
            "value": parseFloat(selectedJobDetails.pay.replace(/[^0-9.]/g, "")) || 40,
            "unitText": "HOUR"
          }
        }
      };

      schemaScript.text = JSON.stringify(jobSchema);
      document.head.appendChild(schemaScript);

    } else {
      // Restore default Homepage SEO metadata
      document.title = "Zenire.in - Find Remote Jobs, Freelance AI Projects & Tech Contracts";

      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", "Discover high-paying remote jobs, freelance AI projects, model evaluation contracts, prompt engineering gigs, and coding trainer opportunities. Connect directly with global tech giants on Zenire.in.");
      }

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute("href", "https://www.zenire.in/");
      }

      // Inject Graph Schema for Homepage
      removeExistingSchema();
      const schemaScript = document.createElement("script");
      schemaScript.id = "zenire-jsonld-schema";
      schemaScript.type = "application/ld+json";

      const websiteSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": "https://www.zenire.in/#website",
            "url": "https://www.zenire.in/",
            "name": "Zenire.in",
            "description": "Find remote jobs and freelance AI prompt training projects.",
            "publisher": {
              "@id": "https://www.zenire.in/#organization"
            }
          },
          {
            "@type": "Organization",
            "@id": "https://www.zenire.in/#organization",
            "name": "Zenire.in",
            "url": "https://www.zenire.in/",
            "logo": "https://www.zenire.in/assets/images/zenire_logo_1783707601229.jpg",
            "sameAs": [
              "https://twitter.com/zenire_in",
              "https://www.linkedin.com/company/zenire"
            ]
          },
          {
            "@type": "ItemList",
            "@id": "https://www.zenire.in/#joblist",
            "name": "Active Remote Tech & AI Jobs",
            "numberOfItems": jobs.length,
            "itemListElement": jobs.slice(0, 15).map((job, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://www.zenire.in/?job=${job.id}`,
              "name": job.title
            }))
          }
        ]
      };

      schemaScript.text = JSON.stringify(websiteSchema);
      document.head.appendChild(schemaScript);
    }
  }, [selectedJobDetails, jobs]);

  // 9 rewritten testimonials
  const testimonials = rewrittenTestimonials;

  // Dynamic filtered and sorted jobs logic
  const getFilteredJobs = () => {
    return jobs
      .filter((job) => {
        const matchesCategory = positionFilter === "All" || job.category === positionFilter;
        const matchesSearch = 
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === "highest-pay") {
          const getPayValue = (payStr: string) => {
            const numbers = payStr.match(/\d+/g);
            if (numbers && numbers.length > 0) {
              return parseInt(numbers[numbers.length - 1], 10);
            }
            return 0;
          };
          return getPayValue(b.pay) - getPayValue(a.pay);
        } else {
          const parseDate = (dateStr: string) => {
            try {
              const [monthDay, year] = dateStr.split(", ");
              const [month, day] = monthDay.split(" ");
              const months: Record<string, number> = { Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11, Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4 };
              return new Date(parseInt(year), months[month] || 0, parseInt(day)).getTime();
            } catch (e) {
              return 0;
            }
          };
          return parseDate(b.date) - parseDate(a.date);
        }
      });
  };

  const filteredJobs = getFilteredJobs();
  const homepageJobs = filteredJobs.slice(0, 20);


  // 8 gorgeous listed services for Zenire.in
  const services = [
    {
      title: "AI Training & Writing",
      description: "Improve AI dialogue, writing, and prose quality. Feed frontier models high-fidelity baseline prompts and responses.",
      icon: <Layers className="h-5 w-5 text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80"
    },
    {
      title: "Research & Reasoning",
      description: "Solve complex STEM, reasoning, and multi-step math problems to push the boundaries of cognitive intelligence in AI.",
      icon: <Search className="h-5 w-5 text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=80"
    },
    {
      title: "Domain Specifics",
      description: "Apply specialized education in fields like medicine, law, biochemistry, or finance to teach domain-expert professional AI engines.",
      icon: <GraduationCap className="h-5 w-5 text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80"
    },
    {
      title: "Flexible Scheduling",
      description: "Work on meaningful, remote-first AI projects at your own pace, on your own terms, from anywhere in the world.",
      icon: <Globe className="h-5 w-5 text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&auto=format&fit=crop&q=80"
    },
    {
      title: "RLHF & Quality Evaluation",
      description: "Be the human-in-the-loop rating model responses, flagging hallucinations, and ensuring safe, helpful AI interactions.",
      icon: <CheckSquare className="h-5 w-5 text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=500&auto=format&fit=crop&q=80"
    },
    {
      title: "AI Safety & Red Teaming",
      description: "Stress-test safety barriers and alignment frameworks, ensuring enterprise models resist adversarial attacks and jailbreak attempts.",
      icon: <Shield className="h-5 w-5 text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80"
    },
    {
      title: "Multilingual Alignment",
      description: "Tune translation models to capture native idioms, regional vocabulary, and cultural nuances across 100+ global languages.",
      icon: <Sparkles className="h-5 w-5 text-emerald-600" />,
      image: "https://thumbs.dreamstime.com/b/young-woman-working-as-office-manager-planning-work-tasks-writing-down-her-schedule-to-planner-workplace-71060009.jpg?w=500&auto=format&fit=crop&q=80"
    },
    {
      title: "Code Verification",
      description: "Write, validate, and debug advanced code blocks and algorithms to train the next-generation of developer-assist copilots.",
      icon: <Code className="h-5 w-5 text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80"
    }
  ];

  const handleSmoothScroll = (elementId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== "home") {
      setCurrentView("home");
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans antialiased">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-xl bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-slate-800 flex items-start gap-3"
          >
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p className="text-sm font-medium">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white shrink-0">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <div className="flex items-center justify-center h-10 w-10 shrink-0 transform group-hover:scale-105 transition duration-300">
              <img 
                src={logoImg} 
                alt="Zenire Logo" 
                className="h-9 w-9 object-cover rounded-xl border border-slate-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[rgba(0,143,255)] via-[rgba(11,48,215)] to-[rgba(80,13,174)] hover:brightness-110 transition duration-300">Zenire.in</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold -mt-1 font-display">Find Remote Jobs</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => handleSmoothScroll("what-we-do")} className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition">What We Do</button>
            <button 
              onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
              className={`text-xs font-extrabold uppercase tracking-wider transition px-3 py-1.5 rounded-lg border ${
                currentView === "jobs" 
                  ? "text-emerald-700 bg-emerald-50 border-emerald-100" 
                  : "text-slate-600 hover:text-slate-900 border-transparent"
              }`}
            >
              Jobs Board
            </button>
            {(isEffectiveAdmin || adminQueryActive) && (
              <button 
                onClick={() => { setCurrentView("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                className={`text-xs font-extrabold uppercase tracking-wider transition px-3 py-1.5 rounded-lg border ${
                  currentView === "admin" 
                    ? "text-emerald-700 bg-emerald-50 border-emerald-100" 
                    : "text-slate-600 hover:text-slate-900 border-transparent"
                }`}
              >
                Admin Portal
              </button>
            )}
            <button onClick={() => handleSmoothScroll("explore-opportunities")} className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition">Opportunities</button>
            <button onClick={() => handleSmoothScroll("how-it-works")} className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition">How It Works</button>
            <button onClick={() => handleSmoothScroll("contributor-stories")} className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition">Reviews</button>
            <button onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm">Apply Now</button>
          </nav>

          {/* Hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-white border-b border-slate-100 px-6 py-4 space-y-3 shadow-lg animate-in fade-in"
          >
            <button onClick={() => handleSmoothScroll("what-we-do")} className="block w-full text-left py-2 font-semibold text-slate-700 hover:text-slate-900">What We Do</button>
            <button 
              onClick={() => { setCurrentView("jobs"); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
              className={`block w-full text-left py-2 font-bold uppercase tracking-wider text-xs ${currentView === "jobs" ? "text-emerald-600" : "text-slate-700 hover:text-slate-900"}`}
            >
              Jobs Board
            </button>
            {(isEffectiveAdmin || adminQueryActive) && (
              <button 
                onClick={() => { setCurrentView("admin"); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                className={`block w-full text-left py-2 font-bold uppercase tracking-wider text-xs ${currentView === "admin" ? "text-emerald-600" : "text-slate-700 hover:text-slate-900"}`}
              >
                Admin Portal
              </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => { setCurrentView("jobs"); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full text-center py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Explore Opportunities</button>
              <button onClick={() => { setHireModalOpen(true); setMobileMenuOpen(false); }} className="w-full text-center py-2.5 border border-slate-200 text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider">Hire Talent</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {currentView === "home" ? (
        <>
          {/* HERO SECTION */}
          <section className="bg-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
            {/* Background blurred ambient colors */}
            <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-3xl -z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Column: Brand, Tagline, Actions, Widget */}
                <div className="lg:col-span-7 text-left space-y-6">
                  
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                    Premium Opportunities. Real Impact.
                  </span>
                  
                  <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.05] !mb-4">
                    Connecting elite specialists with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">the future of freelance work.</span>
                  </h1>
                  
                  <p className="text-slate-600 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
                    Zenire.in connects young professionals, tech leaders, and digital creators with modern organizations for remote contracts, software projects, and flexible careers. Earn competitively and work on your own terms.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 max-w-md pt-2">
                    <button 
                      onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-emerald-600/10 active:scale-[0.98] transition hover:from-emerald-700 hover:to-emerald-800 flex items-center justify-center gap-2"
                    >
                      Explore Opportunities <ArrowRight className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setHireModalOpen(true)}
                      className="flex-1 bg-white text-slate-800 border border-slate-200 hover:border-slate-300 py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      Hire Talent <Building2 className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Trustpilot Hero Widget */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-md shadow-sm">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-900">Excellent</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div key={s} className="bg-[#00b67a] p-0.5 rounded-sm">
                            <Star className="h-3 w-3 text-white fill-current" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="hidden sm:block h-4 w-[1px] bg-slate-200"></div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span>4.8/5 on</span>
                      <div className="flex items-center gap-1">
                        <div className="bg-[#00b67a] p-0.5 rounded-sm shrink-0">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                        <span className="font-extrabold text-slate-900 tracking-tight">Trustpilot</span>
                      </div>
                      <span className="text-slate-400 font-medium">(300+ reviews)</span>
                    </div>
                  </div>

                </div>

                {/* Right Column: Beautiful Interactive Graphics and Animations */}
                <div className="lg:col-span-5 relative">
                  
                  {/* Glowing background cluster behind illustration */}
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full filter blur-[80px] -z-10 animate-pulse duration-5000" />
                  
                  {/* Beautiful Interactive Neural Constellation Visual */}
                  <div className="relative h-[380px] sm:h-[450px] w-full bg-slate-50 rounded-3xl border border-slate-200/50 flex items-center justify-center overflow-hidden shadow-sm group">
                    {/* Background grid representation */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />
                    
                    {/* Pulsing ambient glows */}
                    <div className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl animate-pulse duration-4000" />

                    {/* Animated Floating Nodes (using framer motion) */}
                    <div className="relative w-full h-full">
                      
                      {/* SVG Connecting lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none animate-pulse duration-3000" viewBox="0 0 400 400">
                        <defs>
                          <linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                          </linearGradient>
                          <linearGradient id="line-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        
                        {/* Neural web lines */}
                        <line x1="200" y1="200" x2="80" y2="100" stroke="url(#line-grad-1)" strokeWidth="1.5" strokeDasharray="4 2" />
                        <line x1="200" y1="200" x2="320" y2="100" stroke="url(#line-grad-2)" strokeWidth="1.5" />
                        <line x1="200" y1="200" x2="90" y2="300" stroke="url(#line-grad-2)" strokeWidth="1.5" />
                        <line x1="200" y1="200" x2="310" y2="300" stroke="url(#line-grad-1)" strokeWidth="1.5" strokeDasharray="4 2" />
                        <line x1="200" y1="200" x2="200" y2="60" stroke="url(#line-grad-1)" strokeWidth="1.5" />
                        <line x1="80" y1="100" x2="200" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                        <line x1="320" y1="100" x2="200" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                        <line x1="80" y1="100" x2="90" y2="300" stroke="#cbd5e1" strokeWidth="1" />
                        <line x1="320" y1="100" x2="310" y2="300" stroke="#cbd5e1" strokeWidth="1" />
                      </svg>

                      {/* CENTRAL HUB: Zenire Logo */}
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                      >
                        <div className="relative h-20 w-20 rounded-full bg-white border-2 border-emerald-500 shadow-xl flex items-center justify-center cursor-pointer group-hover:scale-110 transition duration-500">
                          <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping duration-2000" />
                          <img 
                            src={logoImg} 
                            alt="Zenire Logo" 
                            className="h-14 w-14 object-cover rounded-full"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm mt-3">
                          Zenire Hub
                        </span>
                      </motion.div>

                      {/* SATELLITE NODE 1: Web Dev */}
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute top-[65px] left-[30px] bg-white border border-slate-200 rounded-2xl p-2.5 shadow-md flex items-center gap-2"
                      >
                        <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                          <CheckSquare className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-black text-slate-800 block leading-tight">Web Developers</span>
                          <span className="text-[8px] text-slate-400 block font-semibold">Frontend & UI</span>
                        </div>
                      </motion.div>

                      {/* SATELLITE NODE 2: Software Engineers */}
                      <motion.div 
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                        className="absolute top-[65px] right-[30px] bg-white border border-slate-200 rounded-2xl p-2.5 shadow-md flex items-center gap-2"
                      >
                        <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                          <Code className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-black text-slate-800 block leading-tight">Software Engineers</span>
                          <span className="text-[8px] text-slate-400 block font-semibold">Python, Go, TS</span>
                        </div>
                      </motion.div>

                      {/* SATELLITE NODE 3: Creative Designers */}
                      <motion.div 
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="absolute bottom-[65px] left-[30px] bg-white border border-slate-200 rounded-2xl p-2.5 shadow-md flex items-center gap-2"
                      >
                        <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          <GraduationCap className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-black text-slate-800 block leading-tight">Creative Designers</span>
                          <span className="text-[8px] text-slate-400 block font-semibold">UI/UX, Branding</span>
                        </div>
                      </motion.div>

                      {/* SATELLITE NODE 4: Product Management */}
                      <motion.div 
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
                        className="absolute bottom-[65px] right-[30px] bg-white border border-slate-200 rounded-2xl p-2.5 shadow-md flex items-center gap-2"
                      >
                        <div className="h-6 w-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
                          <Shield className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-black text-slate-800 block leading-tight">Product Managers</span>
                          <span className="text-[8px] text-slate-400 block font-semibold">Agile & Growth</span>
                        </div>
                      </motion.div>

                      {/* SATELLITE NODE 5: Global Scale */}
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="absolute top-[15px] left-1/2 transform -translate-x-1/2 bg-slate-950 text-white rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-1.5 border border-slate-800"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400">3.5k Global Freelancers</span>
                      </motion.div>

                    </div>
                  </div>

                </div>

              </div>
            </div>
          </section>

      {/* STATS SECTION */}
      <section className="py-8 bg-white border-y border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Stat 1 */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 transition hover:bg-slate-50 hover:shadow-sm duration-200">
              <div className="bg-emerald-50 p-2 rounded-xl shrink-0 text-emerald-600">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-black text-slate-900 leading-none">3,500+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1 leading-none">Onboarded</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 transition hover:bg-slate-50 hover:shadow-sm duration-200">
              <div className="bg-emerald-50 p-2 rounded-xl shrink-0 text-emerald-600">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-black text-slate-900 leading-none">250+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1 leading-none">Added / Mo</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 transition hover:bg-slate-50 hover:shadow-sm duration-200">
              <div className="bg-emerald-50 p-2 rounded-xl shrink-0 text-emerald-600">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-black text-slate-900 leading-none">50+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1 leading-none">Countries</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 transition hover:bg-slate-50 hover:shadow-sm duration-200">
              <div className="bg-emerald-50 p-2 rounded-xl shrink-0 text-emerald-600">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-black text-slate-900 leading-none">23+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1 leading-none">Global Partners</span>
              </div>
            </div>

            {/* Stat 5 */}
            <div className="col-span-2 lg:col-span-1 bg-emerald-50/30 border border-emerald-100/40 rounded-2xl p-4 flex items-center gap-3 transition hover:bg-emerald-50/50 hover:shadow-sm duration-200">
              <div className="bg-emerald-100/80 p-2 rounded-xl shrink-0 text-emerald-700">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-black text-slate-900 leading-none">1000+</span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mt-1 leading-none">Matches</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section id="what-we-do" className="py-16 bg-[#fafafa] border-t border-b border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="max-w-xl mb-10">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-3">
              What We Do
            </span>
            
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
              Empowering young specialists in their careers.
            </h2>
            
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              From software engineering and branding to content design and virtual assistance, our community delivers outstanding results for forward-thinking clients.
            </p>

            <button 
              onClick={() => setLearnMoreModalOpen(true)}
              className="group inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider focus:outline-none"
            >
              Learn more about our mission
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Grid of 8 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full"
              >
                {/* Image Header with hover zoom */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-emerald-600 shadow-sm flex items-center justify-center">
                    {service.icon}
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* EXPLORE OPPORTUNITIES SECTION */}
      <section id="explore-opportunities" className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="max-w-xl mb-8">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-3">
              Explore Opportunities
            </span>
            
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
              Find your role in the digital economy.
            </h2>
            
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              From software development to creative branding and operational management, there is a place for your talents. Remote, flexible, and open globally.
            </p>

            <button 
              onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="group inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider focus:outline-none"
            >
              Apply directly to open positions
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Search bar on Homepage for synchronization */}
          <div className="max-w-xl mb-8 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by title, skills, or keywords (e.g., Python, Engineer, Red Team)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 focus:outline-none transition shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "Model Training", "Code Trainer", "Quality Evaluator", "Domain Specialist"].map((cat) => (
              <button
                key={cat}
                onClick={() => setPositionFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider border ${
                  positionFilter === cat 
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                    : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Jobs Status Info */}
          <div className="flex items-center gap-2 mb-6 text-xs text-slate-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Reflecting top 20 listings of the listings page (Showing {homepageJobs.length} of {filteredJobs.length} matches)</span>
          </div>

          {/* Positions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homepageJobs.map((job) => (
              <a 
                href={`/?job=${job.id}`}
                key={job.id} 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedJobDetails(job);
                }}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1 duration-300 cursor-pointer group block text-left"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-2">
                    {job.date}
                  </span>

                  <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-tight mb-4 group-hover:text-emerald-700 transition">
                    {job.title}
                  </h3>
                  
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
                    Required skills
                  </span>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {job.experience && job.experience !== "Any" && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                        {job.experience} Experience
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pay Rate</span>
                    <span className="text-sm font-black text-slate-900">
                      Pay: {job.pay}
                    </span>
                  </div>
                  
                  <div className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:border-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition duration-300">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Empty state or view all button */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl max-w-lg mx-auto">
              <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">No matching opportunities</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">We couldn't find any roles matching "{searchTerm}". Try updating your search or filters.</p>
              <button onClick={() => { setSearchTerm(""); setPositionFilter("All"); }} className="text-xs font-black text-emerald-600 uppercase tracking-wider hover:text-emerald-700">Clear filters</button>
            </div>
          ) : (
            <div className="mt-12 text-center">
              <button 
                onClick={() => {
                  setCurrentView("jobs");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md active:scale-[0.98]"
              >
                Browse All {rawJobsData.length} Open Positions <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}


        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 bg-[#fafafa] border-t border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-3">
              How It Works
            </span>
            
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
              Simple, transparent, and fair.
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              Whether you're a professional or a company, see exactly how Zenire.in works for you.
            </p>
          </div>

          {/* Toggle pill button */}
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex items-center justify-between max-w-md mx-auto mb-10">
            <button
              onClick={() => setActiveStepTab("candidates")}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeStepTab === "candidates" 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Candidates
            </button>
            <button
              onClick={() => setActiveStepTab("companies")}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeStepTab === "companies" 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Companies
            </button>
          </div>

          {/* Tab Contents: Candidates */}
          <AnimatePresence mode="wait">
            {activeStepTab === "candidates" ? (
              <motion.div
                key="candidates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 mb-2">
                  FOR CANDIDATES
                </span>
                
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Join the network in four simple steps.
                </h3>
                
                <p className="text-slate-500 text-xs mb-8">
                  Applying is always free, no hidden costs, no fees, ever. We match you to the right opportunities.
                </p>

                {/* Timeline vertical container */}
                <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                  
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Explore Open Roles
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mb-2">
                        Browse our active remote positions on our Jobs Board, or submit a general application to our elite contributor network.
                      </p>
                      <button 
                        onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                      >
                        Go to Jobs Board <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full border border-emerald-200 bg-white text-emerald-600 font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Submit Your Application
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Fill out your professional details, highlight your core areas of expertise (like Coding, Writing, or Domain Knowledge), and submit.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full border border-emerald-200 bg-white text-emerald-600 font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Apply & Complete Assessments
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Some roles require platform-specific evaluations. We never influence or alter results. Your performance speaks for itself.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full border border-emerald-200 bg-white text-emerald-600 font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      4
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Start Contributing
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Once matched and onboarded, work on meaningful projects remotely, on your schedule, from anywhere in the world.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Important guarantee box */}
                <div className="mt-10 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    <span className="font-bold text-slate-900">Important:</span> Applying does not guarantee selection. We never charge candidates at any stage.
                  </p>
                </div>

                {/* Bottom button */}
                <button
                  onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                >
                  Explore Opportunities <ArrowRight className="h-4 w-4" />
                </button>

              </motion.div>
            ) : (
              <motion.div
                key="companies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 mb-2">
                  FOR COMPANIES
                </span>
                
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Deploy verified human intelligence at scale.
                </h3>
                
                <p className="text-slate-500 text-xs mb-8">
                  Accelerate your model training cycles with domain-expert annotators, coders, and multilingual specialists.
                </p>

                {/* Timeline vertical container */}
                <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                  
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Share Your Project Needs
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Specify required skills (e.g., Python, chemistry, legal drafting), language pairs, and dataset volume requirements.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full border border-emerald-200 bg-white text-emerald-600 font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Screening & Matching
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        We scan our network of 3,500+ professionals, running specialized benchmarks to short-list top candidates.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full border border-emerald-200 bg-white text-emerald-600 font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Seamless Trials
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Initiate low-risk trial blocks to evaluate candidate speed, instruction compliance, and delivery quality.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 shrink-0 rounded-full border border-emerald-200 bg-white text-emerald-600 font-bold flex items-center justify-center text-sm z-10 shadow-sm">
                      4
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                        Scale Seamlessly
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Expand annotation pools as dataset needs change. We handle candidate tracking, scheduling, and billing support.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Important guarantee box */}
                <div className="mt-10 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    <span className="font-bold text-slate-900">Important:</span> Fully flexible engagement models. Work on demand with zero long-term retention contracts.
                  </p>
                </div>

                {/* Bottom button */}
                <button
                  onClick={() => setHireModalOpen(true)}
                  className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                >
                  Hire Talent Now <ArrowRight className="h-4 w-4" />
                </button>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* CONTRIBUTOR STORIES / TESTIMONIALS SECTION */}
      <section id="contributor-stories" className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-3">
              Contributor Stories
            </span>
            
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
              What our network says.
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              Real experiences from professionals across the global Zenire.in network.
            </p>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div 
                key={test.id} 
                className="bg-[#fafafa] border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition hover:-translate-y-0.5 duration-200"
              >
                <div>
                  
                  {/* Trustpilot stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <div key={st} className="bg-[#00b67a] p-0.5 rounded-sm">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-xs text-slate-700 italic leading-relaxed mb-6">
                    "{test.quote}"
                  </p>

                </div>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  {test.avatarUrl ? (
                    <img 
                      src={test.avatarUrl} 
                      alt={test.name} 
                      className="h-10 w-10 rounded-full object-cover border border-slate-100 bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`h-10 w-10 rounded-full ${test.avatarColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                      {test.initials}
                    </div>
                  )}
                  <div>
                    <span className="block text-xs font-black text-slate-900 leading-tight">
                      {test.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-semibold leading-none">
                        {test.country}
                      </span>
                      <span className="text-[10px] text-slate-300 leading-none">•</span>
                      <span className="text-[10px] text-[#00b67a] font-extrabold flex items-center gap-0.5 leading-none">
                        <Check className="h-3 w-3 shrink-0" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
        </>
      ) : currentView === "jobs" ? (
        /* JOBS BOARD VIEW */
        <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen animate-in fade-in duration-300">
          <div className="max-w-6xl mx-auto">
            
            {/* Back Button */}
            <button 
              onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-6 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </button>

            {/* Header Content */}
            <div className="border-b border-slate-200 pb-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-3">
                    Zenire.in Job Board
                  </span>
                  <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-none mb-3">
                    Explore Open Career Opportunities
                  </h1>
                  <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                    Select from our database of active remote projects. Join our elite global talent network working on high-impact projects with leading modern companies.
                  </p>
                </div>
                
                {/* Stats badge */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shrink-0 self-start md:self-auto shadow-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <span className="block text-lg font-black text-slate-950 leading-none">33 Roles</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">100% Active & Remote</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Search */}
                <div className="lg:col-span-5 relative">
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Search Keywords</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search roles or skills (e.g., Go, React, Logistics)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 focus:outline-none transition"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div className="lg:col-span-5">
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Filter Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Model Training", "Code Trainer", "Quality Evaluator", "Domain Specialist"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPositionFilter(cat)}
                        className={`px-3 py-2 rounded-lg text-[11px] font-bold transition uppercase tracking-wider border ${
                          positionFilter === cat 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {cat === "All" ? "All categories" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort order */}
                <div className="lg:col-span-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Sort Listings</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest-pay">Highest Pay</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Results Count Summary */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-slate-500 font-bold">
                Showing <span className="text-slate-900 font-black">{filteredJobs.length}</span> active open positions
              </p>
              {searchTerm || positionFilter !== "All" ? (
                <button 
                  onClick={() => { setSearchTerm(""); setPositionFilter("All"); }}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition"
                >
                  Reset filters
                </button>
              ) : null}
            </div>

            {/* Jobs Grid (listings view) */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl max-w-lg mx-auto shadow-sm">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base font-black text-slate-950 mb-1">No positions found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  We couldn't find any listings matching your search "{searchTerm}" and filter parameters. Try checking your spelling or selecting another category.
                </p>
                <button 
                  onClick={() => { setSearchTerm(""); setPositionFilter("All"); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow transition"
                >
                  Show All 33 Positions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    onClick={() => setSelectedJobDetails(job)}
                    className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[10px] font-bold text-slate-400">
                          {job.date}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                            {job.category}
                          </span>
                          <div className="h-6 w-6 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:border-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition duration-300 shrink-0">
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-tight mb-4 group-hover:text-emerald-700 transition">
                        {job.title}
                      </h3>
                      
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
                        Required skills
                      </span>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {job.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[10px] font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                            {skill}
                          </span>
                        ))}
                        {job.experience && job.experience !== "Any" && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                            {job.experience} Experience
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pay Rate</span>
                          <span className="text-sm font-black text-slate-900">
                            {job.pay}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 font-black tracking-widest uppercase px-2 py-0.5 rounded">
                          Remote
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <a 
                          href={`/?job=${job.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setSelectedJobDetails(job);
                          }}
                          className="text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-wider transition block"
                        >
                          Read Details
                        </a>
                        <a 
                          href={job.applyUrl ? job.applyUrl : `mailto:support@zenire.in?subject=${encodeURIComponent(`Application: ${job.title} - Zenire.in`)}&body=${encodeURIComponent(`Hi Zenire Operations Team,\n\nI want to apply for the "${job.title}" position (${job.pay}, Remote).\n\nName:\nEmail:\nLinkedIn/Portfolio:\nAttached Resume/Notes:\n\nThank you!`)}`}
                          target={job.applyUrl ? "_blank" : undefined}
                          rel={job.applyUrl ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm transition block"
                        >
                          Apply Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* General Applications CTA */}
            <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-8 sm:p-10 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10">
                <Sparkles className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Can't find a direct matchup?</h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
                  Join our general talent network anyway! We evaluate thousands of candidate profiles weekly. Once a contract matching your precise expertise is signed, our matchmakers reach out within hours.
                </p>
                <button 
                  onClick={() => {
                    setSelectedJobToApply(null);
                    setCandidateForm(prev => ({ ...prev, skills: "Domain Specialist" }));
                    setExploreModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg inline-flex items-center gap-1.5"
                >
                  Submit General Application <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </section>
      ) : currentView === "story" ? (
        /* OUR STORY VIEW */
        <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-left">
            
            {/* Back Button */}
            <button 
              onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-8 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </button>

            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
              <div className="h-12 w-12 rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                <img 
                  src={logoImg} 
                  alt="Zenire Logo" 
                  className="h-12 w-12 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Company History</span>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none mt-1">
                  Our Story
                </h1>
                <p className="text-slate-400 text-[10px] font-bold mt-1">Established: January 2026</p>
              </div>
            </div>

            <div className="space-y-10 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              
              {/* Mission Hero Quote */}
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-3">
                  <div className="inline-block bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full">
                    Our Core Vision
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    Powering the remote revolution for the modern professional.
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    In a rapidly evolving digital landscape, traditional employment structures often feel restrictive. Zenire.in was created to dismantle geographic boundaries, connecting elite specialists with next-generation projects on their own terms.
                  </p>
                </div>
              </div>

              {/* Foundation Section */}
              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-center">
                  <div className="text-emerald-600 font-black text-3xl font-display">JAN '26</div>
                  <div className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mt-1">The Spark</div>
                  <div className="h-[2px] bg-emerald-100 w-12 mx-auto my-3"></div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Founded in early 2026 to pioneer a bias-free, asynchronous meritocracy.
                  </p>
                </div>
                <div className="md:col-span-8 space-y-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">Our Foundation</h3>
                  <p>
                    Launched in **January 2026**, Zenire.in emerged from a fundamental realization: the global workforce of independent creators, software programmers, domain experts, and linguistic specialists wanted something better. They required a platform that values sheer competency over administrative credentialism.
                  </p>
                  <p>
                    Starting as a dedicated matchmaking framework for reinforcement learning datasets, Zenire quickly expanded to support high-fidelity AI prompt evaluation, comprehensive reasoning problems, and direct domain-specific contract placement. Today, we stand as the definitive hub for freelance excellence.
                  </p>
                </div>
              </section>

              {/* Motivation Section */}
              <section className="space-y-3 border-t border-slate-100 pt-8">
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">Our Motivation</h3>
                <p>
                  We are fueled by the belief that high-quality, flexible intellectual contributions should be rewarded fairly, securely, and transparently. We are driven to build a system where developers and specialists are never held back by legacy localized job markets.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-500/40 transition">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Global Talent Liberation
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      We dismantle geographic limitations, providing candidates in 50+ countries with direct access to elite enterprise software and AI coaching contracts.
                    </p>
                  </div>
                  <div className="border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-500/40 transition">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span> Absolute Meritocracy
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Through objective baseline assessments, candidates demonstrate their actual capability. We don't care about resumes; we care about performance.
                    </p>
                  </div>
                </div>
              </section>

              {/* Services & Goals */}
              <section className="space-y-4 border-t border-slate-100 pt-8">
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">Our Services & Core Goals</h3>
                <p>
                  At Zenire.in, we match outstanding freelancers with companies needing elite execution. Our operational scope includes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="font-extrabold text-emerald-600 text-lg font-display mb-1">01</div>
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-1.5">AI Training & RLHF</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Tuning frontier models with high-fidelity human reasoning, math verification, and safety stress-testing.
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="font-extrabold text-emerald-600 text-lg font-display mb-1">02</div>
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-1.5">Elite Software Projects</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Placing skilled React/TypeScript frontend engineers, robust backend developers, and agentic AI architects.
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="font-extrabold text-emerald-600 text-lg font-display mb-1">03</div>
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-1.5">Domain Advising</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Leveraging expert education in medicine, advanced mathematics, law, and physical sciences for domain tutoring.
                    </p>
                  </div>
                </div>
              </section>

              {/* Verified Metrics / Trust */}
              <section className="space-y-3 border-t border-slate-100 pt-8">
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">Our Scale and Impact</h3>
                <p className="mb-4">
                  Our growth trajectory reflects the high degree of trust the global developer and contractor community places in us.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                    <div className="text-xl sm:text-2xl font-black text-slate-950 font-display">3,500+</div>
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Freelancers</div>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                    <div className="text-xl sm:text-2xl font-black text-slate-950 font-display">50+</div>
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Countries</div>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                    <div className="text-xl sm:text-2xl font-black text-slate-950 font-display">1000+</div>
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Successful Matches</div>
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                    <div className="text-xl sm:text-2xl font-black text-slate-950 font-display">250+</div>
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">New Monthly Registrations</div>
                  </div>
                </div>
              </section>

            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold">Zenire.in Communications</span>
              <button 
                onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </section>
      ) : currentView === "privacy" ? (
        /* PRIVACY POLICY VIEW */
        <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-left">
            
            {/* Back Button */}
            <button 
              onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-8 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Legal Documentation</span>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none mt-1">
                  Privacy Policy
                </h1>
                <p className="text-slate-400 text-[10px] font-bold mt-1">Last Updated: July 10, 2026</p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-5 mb-4">
                <p className="text-amber-800 font-extrabold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" /> Important Notice Regarding Data & Liability
                </p>
                <p className="text-slate-600 text-xs">
                  Please read this Privacy Policy carefully. By using our website, services, or submitting any information, you agree to the collection, processing, and storage practices outlined herein. <strong>Under no circumstances shall Zenire.in, its operators, parent company, affiliates, or employees be liable for any security breaches, data leaks, unauthorized access, or loss of information.</strong>
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">1. Information We Collect</h3>
                <p>
                  To facilitate matchmaking and career assessments, we collect personal and professional identification data. This includes your full name, email address, LinkedIn profile URL, CV/resume details, and any voluntary background information you provide during submission.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. How We Use Your Data</h3>
                <p>
                  Your information is utilized solely to evaluate your skills, screen your background for open projects, contact you regarding assessments, and facilitate coordinator placement. Zenire.in operates as an asynchronous global talent connector and will share relevant details with prospective contracting partners strictly on a need-to-know basis.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">3. Third-Party Services and Cloud Infrastructure</h3>
                <p>
                  Our services are integrated with world-class cloud platforms. While we leverage industry-standard security measures, we make no representations or warranties regarding absolute security. Information transmitted over the internet or stored in cloud databases is inherently subject to external vulnerabilities.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">4. COMPREHENSIVE WARRANTY AND SECURITY DISCLAIMER</h3>
                <p className="font-semibold text-slate-900 bg-slate-50 p-4 border-l-4 border-slate-300 rounded-r-xl">
                  THE PLATFORM AND ALL CORE SERVICES ARE PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. ZENIRE.IN EXPRESSLY DISCLAIMS ANY AND ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO SECURITY WARRANTIES, DATA INTEGRITY, NON-INFRINGEMENT, OR FREEDOM FROM MALICIOUS CODE. WE DO NOT WARRANT THAT THE WEBSITE WILL REMAIN UNINTERRUPTED, FREE OF SECURITY INCIDENTS, OR SECURED FROM MODERN CYBER THREATS. YOU SUBMIT YOUR PERSONAL INFORMATION AT YOUR OWN SOLE RISK.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-950 uppercase text-xs leading-relaxed">
                  5. TOTAL LIMITATION OF LIABILITY
                </h3>
                <p className="font-bold text-slate-950 uppercase text-xs leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ZENIRE.IN, ITS DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, LOSS OF DATA, LOSS OF USE, LOSS OF GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF THE PLATFORM; (II) ANY UNAUTHORIZED ACCESS, DATA LEAK, DATA BREACH, CORRUPTION, OR LOSS OF YOUR STORED PROFILE AND CV INFORMATION; OR (III) ANY MALICIOUS ATTACK OR SYSTEM BREAKDOWN, REGARDLESS OF THE LEGAL THEORY, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">6. Contact Information</h3>
                <p>
                  For any privacy inquiries, please reach out directly to our support desk at <strong className="text-emerald-700">support@zenire.in</strong>.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold">Zenire.in Legal Division</span>
              <button 
                onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition"
              >
                Acknowledge & Exit
              </button>
            </div>
          </div>
        </section>
      ) : currentView === "terms" ? (
        /* TERMS OF SERVICE VIEW */
        <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-left">
            
            {/* Back Button */}
            <button 
              onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-8 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-600">Legal Documentation</span>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none mt-1">
                  Terms of Service
                </h1>
                <p className="text-slate-400 text-[10px] font-bold mt-1">Last Updated: July 10, 2026</p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              <div className="bg-rose-50/50 border border-rose-200/50 rounded-2xl p-5 mb-4">
                <p className="text-rose-800 font-extrabold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" /> Strict Liability Limitation Agreement
                </p>
                <p className="text-slate-600 text-xs font-medium">
                  BY ACCESSING OR USING THE ZENIRE.IN PLATFORM, YOU AGREE TO THESE TERMS OF SERVICE. IF YOU DO NOT AGREE TO THESE TERMS, YOU ARE STRICTLY PROHIBITED FROM USING THIS SITE AND ITS CONNECTING SERVICES. THESE TERMS CONTAIN AN ABSOLUTE DISCLAIMER OF ALL LEGAL LIABILITIES, CLASS ACTION WAIVERS, AND INDEMNIFICATION REQUIREMENTS THAT FULLY INSULATE ZENIRE.IN FROM CLAIMS.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">1. Acceptance of Terms & Eligibility</h3>
                <p>
                  Zenire.in provides matchmaking, assessment coordination, and professional platform connections for independent developers, content creators, quality evaluators, and client companies. By accessing this platform, you represent that you are of legal age and have the capacity to enter into legally binding contracts under your local jurisdiction.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. Nature of Platform Services</h3>
                <p>
                  Zenire.in acts solely as an independent coordinator matching talent with company opportunities. Under no circumstances does Zenire.in act as a direct employer, labor broker, agency, or co-employer. Zenire.in makes no guarantees regarding the frequency of placement, the approval of candidates, or the quality and continuity of tasks offered by third-party contracting companies.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">3. PROHIBITED USES & PLATFORM CONDUCT</h3>
                <p>
                  Users shall not: (a) bypass or compromise platform authentication; (b) attempt database enumeration or unauthorized write operations; (c) submit false, misleading, or deceptive resume credentials; (d) harvest platform details or target listing contacts for competitive solicitation. Unauthorized activity will result in immediate termination of network eligibility and reportage to legal authorities.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">4. ABSOLUTE DISCLAIMER OF WARRANTIES</h3>
                <p className="font-semibold text-slate-950 bg-slate-50 p-4 border-l-4 border-blue-400 rounded-r-xl">
                  THE SERVICES AND PLATFORM CONTENT PROVIDED BY ZENIRE.IN ARE SUPPLIED STRICTLY ON AN "AS-IS" AND "AS-AVAILABLE" BASIS WITH ZERO REPRESENTATIONS OR WARRANTIES. WE EXPRESSLY DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, STATUTORY OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, SECURED DATA INTEGRITY, ACCURACY OF MATCHES, COMPLETENESS OF RECRUITMENT DETAILS, OR CONTINUOUS AVAILABILITY of THE PLATFORM.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">5. IRONCLAD LIMITATION OF LIABILITY</h3>
                <div className="font-bold text-slate-950 bg-rose-50/20 p-5 border border-rose-200/50 rounded-2xl space-y-2 text-xs leading-relaxed uppercase">
                  <p>
                    UNDER NO CIRCUMSTANCES AND UNDER NO LEGAL THEORY (WHETHER IN CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE, OR OTHERWISE) SHALL ZENIRE.IN, ITS PARENT COMPANY, SUCCESSORS, ASSIGNS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR REPRESENTATIVES BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOSS OF REVENUE, LOST SAVINGS, LOST DATA, SERVICE INTERRUPTIONS, BUSINESS OPPORTUNITIES, SPECIAL, INCIDENTAL, PUNITIVE, INDIRECT, OR CONSEQUENTIAL DAMAGES ARISING FROM THE USE OF, OR INABILITY TO USE, THE PLATFORM.
                  </p>
                  <p>
                    REGARDLESS OF THE LEGAL ARGUMENT, IN NO EVENT SHALL THE TOTAL COMBINED AGGREGATE LIABILITY OF ZENIRE.IN FOR ALL CLAIMS OF ANY KIND EXCEED THE TOTAL AGGREGATE AMOUNT OF USD $0.00 (ZERO DOLLARS) PAID BY YOU TO ZENIRE.IN IN CONNECTION WITH THE SPECIFIC INCIDENT PROMPTING THE DISPUTE. THIS LIMITATION APPLIES EVEN IF ZENIRE.IN HAS BEEN EXPRESSLY ADVISED OF THE POTENTIAL FOR SUCH LOSSES.
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">6. INDEMNIFICATION</h3>
                <p>
                  You agree to fully defend, indemnify, and hold harmless Zenire.in, its parent companies, affiliates, directors, officers, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, expenses, and legal fees (including attorney's fees) arising out of or relating to: (i) your access to or misuse of the platform; (ii) your breach of any representation, warranty, or covenant in these Terms; or (iii) your actions, assessments, or contracts with third-party companies.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">7. MANDATORY ARBITRATION & CLASS ACTION WAIVER</h3>
                <p>
                  Any legal dispute, claim, or controversy arising out of or in connection with these Terms, or the use of Zenire.in, shall be resolved exclusively through final and binding individual arbitration, and not in a court of law. <strong>You hereby irrevocably waive any right to participate in class actions, class-wide arbitrations, or representative litigation.</strong>
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">8. Governing Law & Severability</h3>
                <p>
                  These terms shall be governed by, construed, and enforced in accordance with the laws of the jurisdiction in which the platform operators are domiciled, without giving effect to conflicts of law principles. If any provision of these terms is deemed unenforceable or invalid, that specific provision shall be limited or severed, and the remaining terms shall continue in full force and effect.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold">Zenire.in Legal Division</span>
              <button 
                onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition"
              >
                Acknowledge & Exit
              </button>
            </div>
          </div>
        </section>
      ) : currentView === "agreement" ? (
        /* USER / CANDIDATE AGREEMENT VIEW */
        <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-left">
            
            {/* Back Button */}
            <button 
              onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-8 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Legal Documentation</span>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none mt-1">
                  Candidate & User Agreement
                </h1>
                <p className="text-slate-400 text-[10px] font-bold mt-1">Last Updated: July 10, 2026</p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
                <p className="text-slate-900 font-extrabold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 shrink-0" /> Essential Freelance & Non-Employment Declaration
                </p>
                <p className="text-slate-600 text-xs">
                  This Agreement sets forth the legal conditions governing your enrollment, testing, assessment, and project coordination eligibility within the Zenire.in professional freelance database. By joining the database, submitting applications, or completing assessments, you explicitly endorse these parameters.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">1. No Employer-Employee Relationship</h3>
                <p className="font-semibold text-slate-950">
                  You explicitly acknowledge and agree that your participation in the Zenire.in database and any associated activities does NOT establish, and shall not be construed as establishing, an employer-employee relationship, joint-venture, partnership, or agency between you and Zenire.in.
                </p>
                <p>
                  You are an independent contractor and a self-employed freelancer. You possess zero rights to employee benefits, paid leaves, medical covers, unemployment compensation, pension contributions, or social security payments from Zenire.in. You remain solely responsible for filing and paying all applicable local, federal, state, and corporate taxes arising from any funds earned.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. No Guarantee of Assignments or Work</h3>
                <p>
                  Submission of your profile, resume, CV, or the completion of benchmarks and skill assessments does not guarantee placement, referrals, matching opportunities, or work contracts. Zenire.in acts strictly as a matchmaking platform and coordinate system. Project allocations are completely dynamic, dependent on client requirements, and subject to immediate cancellation at any time without prior notification.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">3. Independent Professional Responsibility</h3>
                <p>
                  You are solely responsible for providing your own equipment, computer workstation, secure internet access, software, utilities, and insurance necessary to perform any coordinated project. You represent that you possess the skills, certifications, and compliance credentials necessary to carry out independent project services.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">4. Intellectual Property & Confidentiality</h3>
                <p>
                  In the event you are selected for a project by a third-party client company, you agree to execute direct agreements transferring all intellectual property, data outputs, code, models, and written material to said client company. You shall hold all client project prompts, instructions, datasets, training methodologies, and correspondence in strict confidentiality.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">5. COMPLETE EXCLUSION OF DAMAGES</h3>
                <p className="font-extrabold text-slate-950 uppercase text-xs leading-relaxed bg-slate-50 p-4 border-l-4 border-emerald-500 rounded-r-xl">
                  IN NO EVENT SHALL ZENIRE.IN BE LIABLE TO YOU OR ANY CANDIDATE FOR SPECULATIVE REVENUE, LOSS OF PROFITS, ANTICIPATED EARNINGS, INTERRUPTED JOB ROLES, OR COST OF PROCUREMENT OF SUBSTITUTE SERVICES. ALL SKILL MATCHINGS, DIRECTORIES, AND REFERRAL SERVICES ARE SUPPLIED "AS IS" WITH ZERO CONTINUOUS INTEGRITY WARRANTIES.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">6. Full Indemnity Obligations</h3>
                <p>
                  You agree to fully defend, indemnify, and hold Zenire.in harmless from any third-party claims, tax authorities audits, benefit claims, intellectual property disputes, or liabilities arising directly out of your performance of independent freelance tasks or violation of local labor regulations.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold">Zenire.in Legal Division</span>
              <button 
                onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition"
              >
                Acknowledge & Exit
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ADMIN PORTAL VIEW */
        <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen animate-in fade-in duration-300">
          <div className="max-w-6xl mx-auto">
            
            {/* Back Button */}
            <button 
              onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-6 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </button>

            {/* Header Content */}
            <div className="border-b border-slate-200 pb-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-3">
                    Zenire.in Administration
                  </span>
                  <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-none mb-3">
                    Job Board Live Management
                  </h1>
                  <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                    Create, update, or remove job listings dynamically in the Firebase Firestore database. All changes reflect live on the candidate-facing Jobs Board.
                  </p>
                </div>

                {/* Status & Analytics Badges */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0 self-start md:self-auto">
                  {/* Status Badge */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className={`h-2.5 w-2.5 rounded-full ${isEffectiveAdmin ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`}></div>
                    <div>
                      <span className="block text-sm font-black text-slate-950 leading-none">
                        {isEffectiveAdmin ? "Administrator Session" : "Unauthorized Session"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                        {currentUser ? currentUser.email : "Signed Out"}
                      </span>
                    </div>
                  </div>

                  {/* Visitor Tracker Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-sm font-black text-slate-950 leading-none">
                        {visitorCountLoading ? (
                          <span className="text-slate-400 animate-pulse font-normal text-xs">Loading...</span>
                        ) : (
                          <span>{visitorCount?.toLocaleString() ?? "0"}</span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                        Total Website Visitors
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Management Panel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
                <div className="space-y-1 md:max-w-xl text-left">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    {isEffectiveAdmin ? <Unlock className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-amber-500" />}
                    Access & Authorization Control
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This administrative portal is fully secured. Access and document write privileges are strictly limited to the verified administrator email <strong className="text-emerald-700">swipetoconnect@gmail.com</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  {/* Google Auth Button */}
                  {currentUser ? (
                    <button 
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <LogIn className="h-3.5 w-3.5" /> Sign In with Google
                    </button>
                  )}
                </div>
              </div>

              {/* Seeding Block */}
              {isEffectiveAdmin && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 block">Database Seeding</span>
                    <p className="text-xs text-slate-500">
                      Empty database? Populate Firestore instantly with the 33 baseline high-fidelity career opportunities with a single click.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSeedJobs}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Seed Baseline Jobs
                  </button>
                </div>
              )}
            </div>

            {/* Live Management Panel */}
            {isEffectiveAdmin ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Form: Create/Edit Form (lg:col-span-5) */}
                <div className="lg:col-span-5">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        {editingJob ? <Edit className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none">
                          {editingJob ? "Edit Job Listing" : "Create New Job Listing"}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">
                          {editingJob ? `Editing: ${editingJob.id}` : "Publish a live remote position"}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveJob} className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Job Title</label>
                        <input 
                          type="text" 
                          required
                          value={jobForm.title}
                          onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                          placeholder="e.g. AI Model Trainer (Expert Level)"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition bg-slate-50/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Category</label>
                          <select 
                            value={jobForm.category}
                            onChange={(e) => setJobForm({ ...jobForm, category: e.target.value as any })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition bg-white"
                          >
                            <option value="Model Training">Model Training</option>
                            <option value="Code Trainer">Code Trainer</option>
                            <option value="Quality Evaluator">Quality Evaluator</option>
                            <option value="Domain Specialist">Domain Specialist</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Pay Rate</label>
                          <input 
                            type="text" 
                            required
                            value={jobForm.pay}
                            onChange={(e) => setJobForm({ ...jobForm, pay: e.target.value })}
                            placeholder="e.g. $45-60/h"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Experience Required</label>
                          <input 
                            type="text" 
                            required
                            value={jobForm.experience}
                            onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                            placeholder="e.g. 1+ Year, Any"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition bg-slate-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Skills (Comma separated)</label>
                          <input 
                            type="text" 
                            required
                            value={jobForm.skills}
                            onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                            placeholder="e.g. Python, Django, Rest APIs"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Overview Description</label>
                        <textarea 
                          required
                          value={jobForm.description}
                          onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                          placeholder="Brief description of the model trainer's role..."
                          rows={4}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition resize-none bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Scope of Work (One item per line)</label>
                        <textarea 
                          value={jobForm.scopeOfWork}
                          onChange={(e) => setJobForm({ ...jobForm, scopeOfWork: e.target.value })}
                          placeholder="Review model outputs for technical accuracy&#10;Correct logical gaps in responses&#10;Author clean baseline datasets"
                          rows={3}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition resize-none bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Preferred Qualifications (One item per line)</label>
                        <textarea 
                          value={jobForm.preferredQualifications}
                          onChange={(e) => setJobForm({ ...jobForm, preferredQualifications: e.target.value })}
                          placeholder="Bachelor's in Computer Science or similar&#10;Prior RLHF training experience&#10;Native level English fluency"
                          rows={3}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition resize-none bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Apply URL (Optional manual external link, e.g. https://forms.gle/...)</label>
                        <input 
                          type="url"
                          value={jobForm.applyUrl}
                          onChange={(e) => setJobForm({ ...jobForm, applyUrl: e.target.value })}
                          placeholder="e.g., https://forms.gle/your-custom-form-id"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none transition bg-slate-50/50"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        {editingJob && (
                          <button
                            type="button"
                            onClick={() => setEditingJob(null)}
                            className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmitting ? "Saving..." : editingJob ? "Update Listing" : "Publish Listing"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Panel: All jobs listed as manageable items (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-4 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Live Job Database Listings ({jobs.length})
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Scroll to edit or remove items
                    </span>
                  </div>

                  {loadingJobs ? (
                    <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
                      <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-xs text-slate-500 font-medium">Syncing with Cloud Firestore...</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[85vh] overflow-y-auto pr-1">
                      {jobs.map((job) => (
                        <div 
                          key={job.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500 border-slate-200 transition duration-300"
                        >
                          <div className="space-y-1 text-left min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                {job.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {job.date}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 truncate">
                              {job.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate max-w-md">
                              {job.pay} • {job.experience} Experience • {job.skills.join(", ")}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingJob(job);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-emerald-600 transition cursor-pointer"
                              title="Edit Listing"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="p-2 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {jobs.length === 0 && (
                        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                          <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                          <h4 className="text-xs font-bold text-slate-700 mb-1">No Jobs Found</h4>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mb-4">
                            Your database is empty. Click "Seed Baseline Jobs" above to populate the list.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              // Unauthorized Access Block
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-md">
                <Lock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-950 mb-2">Authorized Access Required</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  This portal manages live production job listings. Access is restricted to authenticated administrators. Please sign in with the authorized account (<strong className="text-emerald-700">swipetoconnect@gmail.com</strong>) to manage listings.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" /> Sign In with Google
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Col 1: Brand & Desc */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 shrink-0">
                  <img 
                    src={logoImg} 
                    alt="Zenire Logo" 
                    className="h-7 w-7 object-cover rounded-lg border border-slate-800 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[rgba(0,143,255)] via-[rgba(11,48,215)] to-[rgba(80,13,174)] leading-none hover:brightness-110 transition duration-300">Zenire.in</span>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold font-display mt-1">Find Remote Jobs</span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Connecting GenZ professionals with the future of freelance work. From software development to creative design, we empower global talent.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="bg-[#00b67a] p-0.5 rounded-sm shrink-0">
                  <Star className="h-3 w-3 text-white fill-current" />
                </div>
                <span className="text-xs font-black text-white tracking-tight">4.8/5 on Trustpilot</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-[11px]">
               <li>
                  <button onClick={() => handleSmoothScroll("what-we-do")} className="hover:text-emerald-500 text-left transition">What We Do</button>
                </li>
                <li>
                  <button onClick={() => handleSmoothScroll("explore-opportunities")} className="hover:text-emerald-500 text-left transition">Explore Opportunities</button>
                </li>
                <li>
                  <button onClick={() => handleSmoothScroll("how-it-works")} className="hover:text-emerald-500 text-left transition">How It Works</button>
                </li>
                <li>
                  <button onClick={() => handleSmoothScroll("contributor-stories")} className="hover:text-emerald-500 text-left transition">Contributor Stories</button>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-emerald-500 text-left transition flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> Active Jobs Board
                  </button>
                </li>
                <li>
                  <button onClick={() => setLearnMoreModalOpen(true)} className="hover:text-emerald-500 text-left transition">Assurance Mission</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-emerald-500 text-left transition">Assessment Guideline</button>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Mission */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-1">Our Mission</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Zenire.in operates globally to bring clean, verified assessment, placement, and training opportunities to contributors worldwide. No registration fees.
              </p>
              <div className="pt-1">
                <button 
                  onClick={() => { setCurrentView("jobs"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition"
                >
                  Apply to Network
                </button>
              </div>
            </div>

          </div>

          <div className="h-[1px] bg-slate-900 my-8"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-500">
              © {new Date().getFullYear()} Zenire.in. All rights reserved.
              <Lock 
                className="inline h-3 w-3 ml-2 text-slate-800/10 hover:text-emerald-500/50 cursor-pointer transition-all duration-300 animate-pulse" 
                onClick={() => { setCurrentView("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                title="Admin Entrance"
              />
            </p>
            <div className="flex gap-4 text-[10px] text-slate-500">
              <button onClick={() => { setCurrentView("story"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-slate-400 cursor-pointer transition">Read Our Story</button>
              <span>•</span>
              <button onClick={() => { setCurrentView("privacy"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-slate-400 cursor-pointer transition">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => { setCurrentView("terms"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-slate-400 cursor-pointer transition">Terms of Service</button>
              <span>•</span>
              <button onClick={() => { setCurrentView("agreement"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-slate-400 cursor-pointer transition">Candidate Agreement</button>
              <span>•</span>
              <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); window.location.href = "https://www.zenire.in/sitemap.xml"; }} className="hover:text-slate-400 cursor-pointer transition" >Sitemap</button>
            </div>
          </div>

        </div>
      </footer>

      {/* DIALOG MODAL: EXPLORE OPPORTUNITIES */}
      <AnimatePresence>
        {exploreModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              
              {/* Overlay background */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExploreModalOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-left shadow-2xl border border-slate-100 z-10"
              >
                
                {/* Close Button */}
                <button 
                  onClick={() => setExploreModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-none">
                      {selectedJobToApply ? "Apply for Position" : "Apply for Opportunities"}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block mt-0.5">
                      Sends automatically to support@zenire.in
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCandidateSubmit} className="space-y-4">
                  {selectedJobToApply && (
                    <div className="bg-emerald-50 border border-emerald-100/80 rounded-2xl p-4 flex items-start gap-3">
                      <Briefcase className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase font-black tracking-widest text-emerald-800 mb-0.5">Target Selected Role</span>
                        <span className="text-xs font-black text-slate-900 block leading-tight">{selectedJobToApply.title}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-1">{selectedJobToApply.pay} • Remote</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={candidateForm.name}
                      onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                      placeholder="e.g. Steven Castro"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={candidateForm.email}
                      onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                      placeholder="e.g. steven@example.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  {!selectedJobToApply && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Target Role Interest</label>
                      <select 
                        value={candidateForm.skills}
                        onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                      >
                        <option value="Model Training">Web Development & Design</option>
                        <option value="Quality Evaluator">Quality Assurance & Testing</option>
                        <option value="Domain Specialist">Content Writing & Copywriting</option>
                        <option value="Code Trainer">Backend & API Development</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      required
                      value={candidateForm.linkedin}
                      onChange={(e) => setCandidateForm({ ...candidateForm, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Brief Background / Pitch (Optional)</label>
                    <textarea 
                      value={candidateForm.notes}
                      onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                      placeholder="Tell us about your background or specialization..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition resize-none"
                    />
                  </div>

                  {/* CV / Resume Attachment Option */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Attach CV / Resume <span className="text-slate-400 font-medium">(Optional)</span>
                    </label>
                    
                    {!cvFile ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          dragActive 
                            ? "border-emerald-500 bg-emerald-50/50" 
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="file"
                          id="cv-upload-input"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                          <Paperclip className="h-4 w-4" />
                        </div>
                        
                        <p className="text-[10px] font-bold text-slate-700 mb-0.5">
                          Drag & drop your resume, or <span className="text-emerald-600">browse</span>
                        </p>
                        <p className="text-[8px] text-slate-400 font-medium">
                          Supports PDF, DOC, DOCX up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">
                              {cvFile.name}
                            </p>
                            <p className="text-[8px] text-slate-400 font-semibold leading-none mt-0.5">
                              {(cvFile.size / (1024 * 1024)).toFixed(2)} MB • Attached
                            </p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={removeCvFile}
                          className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition shrink-0"
                          aria-label="Remove CV file"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 active:scale-[0.98] disabled:bg-emerald-800/80 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Submit Application
                      </>
                    )}
                  </button>
                </form>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: HIRE TALENT */}
      <AnimatePresence>
        {hireModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              
              {/* Overlay background */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setHireModalOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-left shadow-2xl border border-slate-100 z-10"
              >
                
                {/* Close Button */}
                <button 
                  onClick={() => setHireModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Building2 className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-none">Hire Verified Talent</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block mt-0.5">
                      Sends automatically to support@zenire.in
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Company Name</label>
                    <input 
                      type="text" 
                      required
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                      placeholder="e.g. Acme Corp, TechStart, Stripe"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Contact Name</label>
                    <input 
                      type="text" 
                      required
                      value={companyForm.contactName}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })}
                      placeholder="e.g. Lavjit Singh"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Corporate Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      placeholder="e.g. hiring@company.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Primary Annotation Need</label>
                    <select 
                      value={companyForm.needs}
                      onChange={(e) => setCompanyForm({ ...companyForm, needs: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    >
                      <option value="Model Evaluation">AI Model & Agent Evaluation</option>
                      <option value="Prompt Engineering">Prompt Engineering & Fine-Tuning</option>
                      <option value="Mobile Development">Mobile Application Engineering</option>
                      <option value="Data Science & ML">Data Science & Machine Learning</option>
                      <option value="DevOps & Cloud">DevOps & Cloud Infrastructure</option>
                      <option value="Product Management">Technical Product Management</option>
                      <option value="Finance Expert">Financial Analysis & Domain Training</option>
                      <option value="Healthcare Expert">Medical & Healthcare Data Specialist</option>
                      <option value="STEM Expert">STEM & Advanced Science Engineering</option>
                      <option value="Linguistics Specialist">Linguistics & Multilingual Translation</option>
                      <option value="Legal Tech Expert">Legal Technology & Policy Compliance</option>
                      <option value="Competitive Coding">Competitive Coding & Algorithm Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Scope or Requirements</label>
                    <textarea 
                      value={companyForm.notes}
                      onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                      placeholder="e.g. Need 3 senior React developers for a 3-month contract..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 active:scale-[0.98] disabled:bg-emerald-800/80 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-3.5 w-3.5" /> Submit Inquiry
                      </>
                    )}
                  </button>
                </form>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: LEARN MORE */}
      <AnimatePresence>
        {learnMoreModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              
              {/* Overlay background */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLearnMoreModalOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-left shadow-2xl border border-slate-100 z-10"
              >
                
                {/* Close Button */}
                <button 
                  onClick={() => setLearnMoreModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-none">About Zenire.in</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Our Mission</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                  <p>
                    <span className="font-extrabold text-slate-900">Zenire.in</span> is a premier workspace coordinator matching professional freelancers, designers, and developers with forward-thinking companies around the world.
                  </p>
                  <p>
                    With over <span className="font-extrabold text-slate-900">35,000 onboarded specialists</span>, we facilitate seamless matchmaking, contracting, and support across software, creative, marketing, and operational verticals.
                  </p>
                  <p>
                    Our model is fully global, asynchronous, and optimized for flexible pacing—enabling you to share your knowledge on your own timeline, from anywhere in the world.
                  </p>
                </div>

                <button
                  onClick={() => { setLearnMoreModalOpen(false); setExploreModalOpen(true); }}
                  className="mt-6 w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-[0.98] transition text-center block"
                >
                  Apply For Opportunities
                </button>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: JOB DETAILS */}
      <AnimatePresence>
        {selectedJobDetails && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              
              {/* Overlay background */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJobDetails(null)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 text-left shadow-2xl border border-slate-100 z-10 my-8 flex flex-col max-h-[95vh]"
              >
                
                {/* Header background decoration */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 -mx-6 -mt-6 p-6 pr-12 border-b border-slate-100 shrink-0 relative">
                  {/* Close Button */}
                  <button 
                    onClick={() => setSelectedJobDetails(null)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-slate-200/50 rounded-full text-slate-500 hover:text-slate-950 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-md">
                      {selectedJobDetails.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Posted {selectedJobDetails.date}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                    {selectedJobDetails.title}
                  </h3>
                </div>

                {/* Content body (scrollable) */}
                <div className="space-y-6 overflow-y-auto flex-1 mt-6 pr-1">
                  
                  {/* Key details bar */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pay Rate</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-700">{selectedJobDetails.pay}</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Location</span>
                      <span className="text-xs sm:text-sm font-black text-slate-800">100% Remote</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Experience</span>
                      <span className="text-xs sm:text-sm font-black text-slate-800">{selectedJobDetails.experience} Experience</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Role Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {selectedJobDetails.description}
                    </p>
                  </div>

                  {/* Scope of Work */}
                  {selectedJobDetails.scopeOfWork && selectedJobDetails.scopeOfWork.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                        Scope of Work & Responsibilities
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                        {selectedJobDetails.scopeOfWork.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="h-4 w-4 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications */}
                  {selectedJobDetails.preferredQualifications && selectedJobDetails.preferredQualifications.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                        Preferred Qualifications
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                        {selectedJobDetails.preferredQualifications.map((item, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start">
                            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                {/* Footer Apply CTA */}
                <div className="bg-slate-50 border-t border-slate-100 -mx-6 -mb-6 p-6 shrink-0 flex items-center justify-between gap-4 mt-6">
                  <button
                    onClick={() => setSelectedJobDetails(null)}
                    className="px-5 py-3 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    Back to Listings
                  </button>
                  <a
                    href={selectedJobDetails.applyUrl ? selectedJobDetails.applyUrl : `mailto:support@zenire.in?subject=${encodeURIComponent(`Application: ${selectedJobDetails.title} - Zenire.in`)}&body=${encodeURIComponent(`Hi Zenire Operations Team,\n\nI want to apply for the "${selectedJobDetails.title}" position (${selectedJobDetails.pay}, Remote).\n\nName:\nEmail:\nLinkedIn/Portfolio:\nAttached Resume/Notes:\n\nThank you!`)}`}
                    target={selectedJobDetails.applyUrl ? "_blank" : undefined}
                    rel={selectedJobDetails.applyUrl ? "noopener noreferrer" : undefined}
                    onClick={() => setSelectedJobDetails(null)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-1.5 text-center"
                  >
                    <Send className="h-3.5 w-3.5" /> Apply for This Position Now
                  </a>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
