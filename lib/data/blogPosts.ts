export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
  content: BlogSection[];
}

export interface BlogSection {
  type: "intro" | "h2" | "h3" | "p" | "ul" | "ol" | "tip" | "quote" | "cta";
  text?: string;
  items?: string[];
  label?: string;
}

export const BLOG_CATEGORIES = [
  "All",
  "Career Tips",
  "Interview Prep",
  "Salary Guide",
  "Remote Work",
  "For Employers",
  "Fresher Zone",
];

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-write-a-resume-that-gets-noticed-2026",
    title: "How to Write a Resume That Gets Noticed in 2026",
    excerpt:
      "Stand out from hundreds of applicants with these proven resume strategies tailored for the Indian job market.",
    category: "Career Tips",
    author: "Priya Mehta",
    authorRole: "Career Coach",
    publishedAt: "March 10, 2026",
    readTime: "6 min read",
    featured: true,
    tags: ["resume", "career tips", "job search", "ATS"],
    content: [
      {
        type: "intro",
        text: "In 2026, recruiters spend an average of 7 seconds scanning a resume before deciding to read further. With thousands of applications flooding every job posting, your resume needs to grab attention instantly. Here's a complete, actionable guide to writing a resume that gets noticed — and gets you hired.",
      },
      {
        type: "h2",
        text: "1. Start with a Powerful Professional Summary",
      },
      {
        type: "p",
        text: "Your summary is prime real estate. It's the first thing a recruiter reads. Don't waste it with generic phrases like 'results-driven professional'. Instead, lead with your title, years of experience, and two or three specific achievements.",
      },
      {
        type: "tip",
        label: "Good example",
        text: "\"Full-stack developer with 4 years of experience building scalable web apps using React and Node.js. Led the migration of a legacy monolith to microservices, reducing load time by 40% for 2M+ daily users.\"",
      },
      {
        type: "h2",
        text: "2. Tailor Your Resume for Every Application",
      },
      {
        type: "p",
        text: "A generic resume is a dead resume. Read the job description carefully and mirror the exact keywords it uses. ATS (Applicant Tracking Systems) filter out resumes that don't match the job's language — even if you're perfectly qualified.",
      },
      {
        type: "ul",
        items: [
          "Copy 5–8 keywords directly from the JD into your skills section",
          "Rephrase your bullet points to reflect the job's language",
          "Match the job title in your summary if it accurately reflects your experience",
          "Adjust the order of skills to highlight what matters most for this role",
        ],
      },
      {
        type: "h2",
        text: "3. Use the STAR Method for Bullet Points",
      },
      {
        type: "p",
        text: "Transform weak, duty-based bullets into achievement-based ones using the STAR format: Situation, Task, Action, Result. Recruiters love measurable impact.",
      },
      {
        type: "tip",
        label: "Before vs After",
        text: "❌ 'Managed social media accounts'\n✅ 'Grew Instagram following from 2K to 45K in 8 months by launching a Reels strategy, increasing leads by 30%'",
      },
      {
        type: "h2",
        text: "4. Optimise for ATS Systems",
      },
      {
        type: "p",
        text: "Over 75% of resumes are rejected by ATS before a human ever sees them. Avoid these common ATS killers:",
      },
      {
        type: "ul",
        items: [
          "Using tables, columns, or text boxes — ATS can't parse them",
          "Submitting in .jpg or image-based PDFs — always use a text-based PDF",
          "Using fancy fonts or icons instead of plain text",
          "Putting contact info in headers/footers — ATS often ignores these",
          "Missing keywords from the job description",
        ],
      },
      {
        type: "h2",
        text: "5. Keep It to 1–2 Pages",
      },
      {
        type: "p",
        text: "Unless you have 10+ years of directly relevant experience, stick to one page. Recruiters don't read long resumes — they skim them. Every line should earn its place.",
      },
      {
        type: "h2",
        text: "6. The Skills Section: Quality Over Quantity",
      },
      {
        type: "p",
        text: "Don't just list every tool you've ever touched. Group skills into categories (Languages, Frameworks, Tools, Soft Skills) and only include skills you can defend in an interview.",
      },
      {
        type: "h2",
        text: "7. Add a LinkedIn URL and GitHub/Portfolio",
      },
      {
        type: "p",
        text: "In 2026, a resume without a LinkedIn URL is incomplete. If you're in tech, design, or content, your portfolio link is equally critical. Make sure your LinkedIn is updated and aligns with your resume.",
      },
      {
        type: "quote",
        text: "The best resume is one that makes a recruiter say 'I need to meet this person' within the first 10 seconds.",
      },
      {
        type: "h2",
        text: "Final Checklist Before You Hit Send",
      },
      {
        type: "ol",
        items: [
          "Spell-checked with no grammar errors",
          "Contact details are clear and accurate",
          "Keywords from the JD are included",
          "Bullet points show impact, not just duties",
          "File is named: FirstName-LastName-Resume.pdf",
          "Saved as a text-based PDF",
        ],
      },
      {
        type: "cta",
        text: "Upload your updated resume on EkClickJob and start getting matched with relevant jobs today.",
      },
    ],
  },
  {
    slug: "top-20-interview-questions-and-answers-2026",
    title: "Top 20 Interview Questions & How to Answer Them",
    excerpt:
      "Prepare for your next interview with these commonly asked questions and expert-backed answers that actually work.",
    category: "Interview Prep",
    author: "Rahul Sharma",
    authorRole: "Senior HR Manager",
    publishedAt: "March 7, 2026",
    readTime: "8 min read",
    featured: false,
    tags: ["interview", "interview prep", "HR questions", "job tips"],
    content: [
      {
        type: "intro",
        text: "Interviews are predictable. Most companies use the same 20–30 questions, in various forms. If you've practised answering these well, you're already ahead of 80% of candidates. Here are the top 20 questions with frameworks for answering them confidently.",
      },
      {
        type: "h2",
        text: "The Classic Openers",
      },
      {
        type: "h3",
        text: "1. Tell me about yourself.",
      },
      {
        type: "p",
        text: "This is not an invitation to recite your resume. Use the Present–Past–Future framework: start with what you do now, briefly mention relevant past, and connect to why you're excited about this role.",
      },
      {
        type: "h3",
        text: "2. Why do you want to work here?",
      },
      {
        type: "p",
        text: "Do your research. Mention something specific about the company — a product, initiative, value, or recent news. Generic answers like 'it's a great company' are red flags.",
      },
      {
        type: "h3",
        text: "3. What are your greatest strengths?",
      },
      {
        type: "p",
        text: "Pick 2–3 strengths directly relevant to the job. Back each one with a brief, specific example. Don't say 'hard working' — everyone says that.",
      },
      {
        type: "h3",
        text: "4. What is your greatest weakness?",
      },
      {
        type: "p",
        text: "Be honest but strategic. Pick a real weakness, then immediately explain the steps you're actively taking to improve it. Avoid clichés like 'I work too hard'.",
      },
      {
        type: "tip",
        label: "Good answer",
        text: "\"I sometimes over-explain things in presentations. I've been working on this by getting feedback from peers after each deck and keeping slides to 5 bullet points max. It's made my presentations much sharper.\"",
      },
      {
        type: "h2",
        text: "Behavioural Questions (Use STAR)",
      },
      {
        type: "p",
        text: "For all behavioural questions, use STAR: Situation, Task, Action, Result. Keep answers under 2 minutes.",
      },
      {
        type: "h3",
        text: "5. Tell me about a time you failed.",
      },
      {
        type: "h3",
        text: "6. Describe a conflict with a coworker and how you resolved it.",
      },
      {
        type: "h3",
        text: "7. Tell me about a time you led a team under pressure.",
      },
      {
        type: "h3",
        text: "8. Give an example of when you went above and beyond.",
      },
      {
        type: "p",
        text: "Prepare 4–5 strong STAR stories that can be adapted to any of these questions. The best stories show ownership, impact, and growth.",
      },
      {
        type: "h2",
        text: "Role-Specific Questions",
      },
      {
        type: "h3",
        text: "9. Where do you see yourself in 5 years?",
      },
      {
        type: "p",
        text: "Show ambition but keep it realistic and aligned with the company's growth track. You don't need a rigid 5-year plan — just demonstrate you think about growth.",
      },
      {
        type: "h3",
        text: "10. Why are you leaving your current job?",
      },
      {
        type: "p",
        text: "Never badmouth your current employer. Focus on what you're moving towards — new challenges, growth opportunities, or a better role alignment — not what you're running from.",
      },
      {
        type: "h2",
        text: "Salary & Offer Questions",
      },
      {
        type: "h3",
        text: "11. What are your salary expectations?",
      },
      {
        type: "p",
        text: "Research the market rate before the interview. Give a range, not a single number. The bottom of your range should be your actual minimum.",
      },
      {
        type: "h3",
        text: "12. Do you have any other offers?",
      },
      {
        type: "p",
        text: "If you do, it's fine to say so professionally. It often creates positive urgency. Never lie about having an offer you don't have.",
      },
      {
        type: "h2",
        text: "Questions to Ask the Interviewer",
      },
      {
        type: "p",
        text: "Always have 3–4 questions ready. Asking nothing signals disinterest.",
      },
      {
        type: "ul",
        items: [
          "What does success look like in this role in the first 90 days?",
          "What are the biggest challenges the team is facing right now?",
          "How would you describe the team culture?",
          "What's the growth path from this role?",
          "What do you enjoy most about working here?",
        ],
      },
      {
        type: "quote",
        text: "An interview is a two-way street. You're also deciding if this company is right for you.",
      },
      {
        type: "cta",
        text: "Set up interview notifications on EkClickJob so you never miss an opportunity to practise with real roles.",
      },
    ],
  },
  {
    slug: "tech-salaries-india-2026-complete-breakdown",
    title: "Tech Salaries in India 2026 — Complete Breakdown",
    excerpt:
      "From freshers to senior engineers, here's what you should be earning based on role, city, and experience.",
    category: "Salary Guide",
    author: "Anita Krishnan",
    authorRole: "Compensation Analyst",
    publishedAt: "March 5, 2026",
    readTime: "7 min read",
    featured: false,
    tags: ["salary", "tech jobs", "India", "compensation"],
    content: [
      {
        type: "intro",
        text: "Knowing your market worth is the single most powerful tool in any salary negotiation. This guide breaks down tech salaries across roles, experience levels, and cities in India for 2026 — based on aggregated data from thousands of job listings and salary reports.",
      },
      {
        type: "h2",
        text: "Software Engineering Salaries by Level",
      },
      {
        type: "ul",
        items: [
          "Fresher / 0–1 yr: ₹4–8 LPA",
          "Junior Engineer / 1–3 yrs: ₹8–15 LPA",
          "Mid-Level / 3–6 yrs: ₹15–28 LPA",
          "Senior Engineer / 6–10 yrs: ₹28–50 LPA",
          "Staff / Principal Engineer: ₹50–90 LPA",
          "Engineering Manager: ₹40–80 LPA",
        ],
      },
      {
        type: "tip",
        label: "Note",
        text: "These are base salary ranges. Total compensation (TC) at top product companies (Google, Microsoft, Amazon India) typically includes ESOPs/RSUs worth 30–100% of base.",
      },
      {
        type: "h2",
        text: "Data Science & AI Salaries",
      },
      {
        type: "ul",
        items: [
          "Data Analyst (Fresher): ₹5–9 LPA",
          "Data Scientist (2–4 yrs): ₹12–25 LPA",
          "ML Engineer (3–6 yrs): ₹18–40 LPA",
          "AI Research Scientist: ₹30–70 LPA",
          "Head of Data / VP Analytics: ₹50–100 LPA",
        ],
      },
      {
        type: "h2",
        text: "Salary by City",
      },
      {
        type: "p",
        text: "Location still matters significantly in India, though remote work has narrowed the gap:",
      },
      {
        type: "ul",
        items: [
          "Bangalore: Highest base salaries, strong startup ecosystem",
          "Mumbai: Finance-tech premium, 10–15% above national average",
          "Hyderabad: Fast-growing, strong MNC presence",
          "Pune: Competitive, lower cost of living",
          "Delhi/NCR: Broad range, strong non-tech sector",
          "Chennai: Emerging hub, slightly lower than Bangalore",
          "Remote (pan-India): Increasingly matching Bangalore rates",
        ],
      },
      {
        type: "h2",
        text: "Highest-Paying Tech Skills in 2026",
      },
      {
        type: "ol",
        items: [
          "AI/ML Engineering — 35% premium",
          "Kubernetes / Cloud Architecture — 28% premium",
          "Cybersecurity — 25% premium",
          "React/Next.js — 18% premium",
          "DevOps / Site Reliability Engineering — 22% premium",
          "Blockchain — 20% premium",
          "Data Engineering (Spark, Kafka) — 24% premium",
        ],
      },
      {
        type: "h2",
        text: "How to Negotiate Your Offer",
      },
      {
        type: "ul",
        items: [
          "Research your target role on EkClickJob Salary Insights before the interview",
          "Get your number from multiple sources — not just one report",
          "Always negotiate — 85% of employers expect it and will negotiate",
          "Never share your current salary unless legally required",
          "Negotiate base, variable, ESOPs, and joining bonus separately",
          "Counter with 15–20% above your minimum acceptable offer",
        ],
      },
      {
        type: "quote",
        text: "The most expensive negotiation mistake is not negotiating at all. A 10-minute conversation can mean ₹2–5 LPA difference that compounds every year.",
      },
      {
        type: "cta",
        text: "Use EkClickJob's Salary Insights on every job detail page to see if an offer is above or below market rate.",
      },
    ],
  },
  {
    slug: "best-remote-jobs-india-how-to-land-one",
    title: "Best Remote Jobs in India and How to Land One",
    excerpt:
      "Remote work is here to stay. Here are the highest-paying remote roles and how to position yourself for them.",
    category: "Remote Work",
    author: "Karan Joshi",
    authorRole: "Remote Work Consultant",
    publishedAt: "March 3, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["remote work", "WFH", "remote jobs", "work from home"],
    content: [
      {
        type: "intro",
        text: "Remote work in India has crossed a tipping point. Over 60% of tech companies now offer hybrid or fully remote options, and a growing number of global companies are hiring Indian professionals directly. Here's your complete guide to finding and landing a great remote job.",
      },
      {
        type: "h2",
        text: "Highest-Paying Remote Roles in India (2026)",
      },
      {
        type: "ul",
        items: [
          "Software Engineer (Full Stack) — ₹12–40 LPA remote",
          "Product Manager — ₹18–50 LPA remote",
          "DevOps / Cloud Engineer — ₹15–45 LPA remote",
          "UI/UX Designer — ₹10–28 LPA remote",
          "Data Scientist — ₹14–40 LPA remote",
          "Digital Marketing Manager — ₹8–20 LPA remote",
          "Technical Writer — ₹7–18 LPA remote",
          "Customer Success Manager — ₹8–22 LPA remote",
        ],
      },
      {
        type: "h2",
        text: "Where to Find Remote Jobs",
      },
      {
        type: "ul",
        items: [
          "EkClickJob — filter by 'Remote' in job type",
          "LinkedIn — use the Remote filter in job search",
          "AngelList/Wellfound — startup remote roles",
          "Upwork/Toptal — contract and freelance remote work",
          "Remote.co and We Work Remotely — global remote listings",
          "Your network — 40% of remote jobs are never publicly posted",
        ],
      },
      {
        type: "h2",
        text: "How to Stand Out as a Remote Candidate",
      },
      {
        type: "p",
        text: "Remote hiring managers look for specific signals that you can work autonomously and communicate effectively without being in the same room.",
      },
      {
        type: "ul",
        items: [
          "Mention previous remote experience explicitly in your resume and cover letter",
          "Highlight async communication tools you've used: Slack, Notion, Jira, Loom",
          "Show you're self-directed: mention projects you initiated without being asked",
          "Have a professional home office setup visible in video interviews",
          "Demonstrate strong written communication — this is critical for remote work",
        ],
      },
      {
        type: "h2",
        text: "Tips for Thriving in Remote Work",
      },
      {
        type: "ol",
        items: [
          "Set fixed work hours and communicate them to your team",
          "Over-communicate — share updates proactively, don't wait to be asked",
          "Use a proper desk, not your bed — it impacts focus significantly",
          "Block 'deep work' time in your calendar every day",
          "Schedule virtual 1:1s with teammates to maintain relationships",
          "Take actual breaks — remote burnout is real and common",
        ],
      },
      {
        type: "quote",
        text: "Remote work doesn't mean working in isolation — it means working with intention.",
      },
      {
        type: "cta",
        text: "Browse remote job openings on EkClickJob — filter by 'Remote' in the job type section.",
      },
    ],
  },
  {
    slug: "how-to-write-a-job-description-that-attracts-top-talent",
    title: "How to Write a Job Description That Attracts Top Talent",
    excerpt:
      "The words you use in a job posting directly impact the quality and quantity of applicants you receive. Here's how to get it right.",
    category: "For Employers",
    author: "Deepa Nair",
    authorRole: "Talent Acquisition Lead",
    publishedAt: "February 28, 2026",
    readTime: "5 min read",
    featured: false,
    tags: ["employers", "hiring", "job description", "recruitment"],
    content: [
      {
        type: "intro",
        text: "A job description is your first advertisement to potential candidates. A poorly written JD repels top talent and attracts the wrong applicants. A great JD gets you 3× more qualified candidates. Here's how to write one that actually works.",
      },
      {
        type: "h2",
        text: "The Anatomy of a Great Job Description",
      },
      {
        type: "ol",
        items: [
          "Job Title — be specific and searchable (not 'Rockstar Developer')",
          "One-paragraph company intro — what you do and why it matters",
          "Role summary — what this person will own",
          "Key responsibilities — 5 to 8 bullet points, outcomes-focused",
          "Required qualifications — must-haves only",
          "Nice-to-have qualifications — separate from required",
          "What you offer — salary range, benefits, remote policy, growth",
        ],
      },
      {
        type: "h2",
        text: "Common Mistakes That Kill Applications",
      },
      {
        type: "ul",
        items: [
          "Listing 15+ 'required' skills — this discourages great candidates, especially women",
          "Hiding salary — 73% of candidates say they won't apply without a salary range",
          "Vague responsibilities like 'other duties as assigned'",
          "Buzzword-heavy language: 'synergy', 'ninja', 'guru'",
          "Not mentioning remote/hybrid/WFO policy",
          "Copy-pasting from a 5-year-old job description",
        ],
      },
      {
        type: "h2",
        text: "Always Include the Salary Range",
      },
      {
        type: "p",
        text: "This is non-negotiable in 2026. Candidates are increasingly refusing to apply to jobs without salary information. Adding a salary range increases applications by 30–40% and pre-filters for budget alignment, saving everyone's time.",
      },
      {
        type: "h2",
        text: "Use Inclusive Language",
      },
      {
        type: "p",
        text: "Gendered or coded language in JDs unconsciously discourages applications from women and underrepresented groups. Tools like the Gender Decoder can help. Prefer: 'We're looking for...' over 'You must be...'",
      },
      {
        type: "tip",
        label: "Quick tip",
        text: "Replace 'He/She will manage the team' with 'This person will manage the team'. Simple but impactful.",
      },
      {
        type: "quote",
        text: "The best job descriptions read like an honest conversation, not a legal document.",
      },
      {
        type: "cta",
        text: "Post your next job on EkClickJob and reach thousands of qualified candidates instantly.",
      },
    ],
  },
  {
    slug: "fresher-guide-to-landing-your-first-job-2026",
    title: "The Ultimate Fresher's Guide to Landing Your First Job",
    excerpt:
      "No experience? No problem. Here's exactly how to land your first real job when you're just starting out.",
    category: "Fresher Zone",
    author: "Meera Pillai",
    authorRole: "Campus Hiring Specialist",
    publishedAt: "February 25, 2026",
    readTime: "7 min read",
    featured: false,
    tags: ["fresher", "campus", "first job", "internship", "entry level"],
    content: [
      {
        type: "intro",
        text: "Everyone starts somewhere. The 'we need experience' paradox is real, but it's beatable. Thousands of freshers land great jobs every month by doing the right things in the right order. Here's the exact playbook.",
      },
      {
        type: "h2",
        text: "Step 1: Build a Project Portfolio (Even With No Job Experience)",
      },
      {
        type: "p",
        text: "A portfolio is your proof of work. It replaces experience in the eyes of a hiring manager. Even one or two strong projects can outweigh zero work experience.",
      },
      {
        type: "ul",
        items: [
          "Build 2–3 projects that solve real problems, not just tutorials",
          "Put everything on GitHub with a good README",
          "Write about your projects on LinkedIn or Medium",
          "For non-tech roles: create case studies, write samples, design mockups",
        ],
      },
      {
        type: "h2",
        text: "Step 2: Get an Internship First",
      },
      {
        type: "p",
        text: "An internship — even unpaid — breaks the experience paradox. It gives you real work to talk about, references, and often converts to a full-time offer. Apply to internships aggressively in your final year.",
      },
      {
        type: "h2",
        text: "Step 3: Optimise Your LinkedIn Profile",
      },
      {
        type: "ul",
        items: [
          "Use a professional photo — it increases views by 14×",
          "Write a headline beyond 'Student at X College' — describe what you do",
          "Add all projects, coursework, and certifications to the Experience section",
          "Write a summary that explains your goals and what you bring",
          "Connect with 200+ people in your target industry",
          "Post about your learning journey — it builds visibility",
        ],
      },
      {
        type: "h2",
        text: "Step 4: Apply Smart, Not Just a Lot",
      },
      {
        type: "p",
        text: "Sending 200 generic applications yields fewer results than 20 targeted, tailored ones. Research each company, personalise your cover letter, and follow up.",
      },
      {
        type: "h2",
        text: "Step 5: Prepare for the Fresher Interview",
      },
      {
        type: "ul",
        items: [
          "Research the company deeply — know their product, competitors, recent news",
          "Prepare your 'Tell me about yourself' for 2 minutes",
          "Have 2–3 project stories ready using STAR format",
          "Prepare questions to ask — it signals genuine interest",
          "Practice with mock interviews out loud, not just in your head",
        ],
      },
      {
        type: "h2",
        text: "Certifications That Boost Fresher Profiles",
      },
      {
        type: "ul",
        items: [
          "Google Data Analytics Certificate",
          "AWS Cloud Practitioner",
          "Meta Front-End Developer Certificate",
          "Google Digital Garage (Marketing)",
          "HubSpot Content Marketing Certification",
        ],
      },
      {
        type: "quote",
        text: "Companies don't hire experience. They hire people who can solve their problems. Show them you can — with or without a job title.",
      },
      {
        type: "cta",
        text: "Check out our Fresher Zone on EkClickJob — specially curated internships and entry-level openings.",
      },
    ],
  },
  {
    slug: "how-to-negotiate-salary-without-feeling-awkward",
    title: "How to Negotiate Your Salary Without Feeling Awkward",
    excerpt:
      "Practical scripts and strategies to help you ask for what you're worth — and actually get it.",
    category: "Career Tips",
    author: "Vikram Nair",
    authorRole: "Executive Coach",
    publishedAt: "February 20, 2026",
    readTime: "5 min read",
    featured: false,
    tags: ["salary negotiation", "career tips", "offer", "compensation"],
    content: [
      {
        type: "intro",
        text: "85% of hiring managers say they have room to negotiate — but less than 40% of candidates actually try. That gap costs the average professional ₹15–30 LPA over a decade. Here's how to negotiate confidently, without burning the bridge.",
      },
      {
        type: "h2",
        text: "The Golden Rule: Always Negotiate",
      },
      {
        type: "p",
        text: "No offer has ever been rescinded because a candidate politely negotiated. The worst they can say is 'this is our best offer' — and then you decide. But most of the time, there's room.",
      },
      {
        type: "h2",
        text: "Do Your Research First",
      },
      {
        type: "ul",
        items: [
          "Check salary ranges on EkClickJob, LinkedIn Salary, and Glassdoor",
          "Talk to people in similar roles at similar companies",
          "Know the full compensation: base, variable, ESOPs, insurance, WFH allowance",
          "Know your walk-away number before the conversation starts",
        ],
      },
      {
        type: "h2",
        text: "Scripts That Actually Work",
      },
      {
        type: "tip",
        label: "When they ask your expectation first",
        text: "\"Based on my research and the responsibilities of this role, I'm targeting ₹X–Y. Is that in the range you had in mind?\"",
      },
      {
        type: "tip",
        label: "When they give you an offer below your target",
        text: "\"Thank you for the offer — I'm genuinely excited about this role. Based on my experience and market data, I was expecting closer to ₹X. Is there flexibility there?\"",
      },
      {
        type: "tip",
        label: "When they say 'this is our best offer'",
        text: "\"I understand. Can we look at other components — joining bonus, additional leave, or a 6-month review with a performance increase?\"",
      },
      {
        type: "h2",
        text: "Beyond Base Salary: What Else to Negotiate",
      },
      {
        type: "ul",
        items: [
          "Joining bonus (especially if you're giving up unvested ESOPs)",
          "Work-from-home days per week",
          "Performance review timeline (ask for 6 months instead of 12)",
          "Learning and development budget",
          "Additional leave or flexible hours",
          "Title upgrade (sometimes more impactful long-term than salary)",
        ],
      },
      {
        type: "quote",
        text: "Negotiating isn't being greedy — it's demonstrating that you know your value. Companies respect that.",
      },
      {
        type: "cta",
        text: "Use EkClickJob Salary Insights to benchmark your offer before you respond.",
      },
    ],
  },
  {
    slug: "linkedin-profile-tips-get-more-recruiter-messages",
    title: "LinkedIn Profile Tips to Get 10× More Recruiter Messages",
    excerpt:
      "A fully optimised LinkedIn profile can generate inbound recruiter messages daily. Here's how to get there.",
    category: "Career Tips",
    author: "Priya Mehta",
    authorRole: "Career Coach",
    publishedAt: "February 15, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["LinkedIn", "personal branding", "networking", "job search"],
    content: [
      {
        type: "intro",
        text: "Over 95% of recruiters use LinkedIn to source candidates. A weak profile means missed opportunities you never even know about. Here's how to make your profile so good that recruiters reach out to you.",
      },
      {
        type: "h2",
        text: "1. Your Profile Photo is Non-Negotiable",
      },
      {
        type: "p",
        text: "Profiles with photos get 21× more views. Use a professional headshot with good lighting, a clean background, and a genuine smile. Your photo should look like you on your best day at work.",
      },
      {
        type: "h2",
        text: "2. Write a Headline That Sells, Not Just Tells",
      },
      {
        type: "p",
        text: "Your headline appears in every search result and notification. Don't just put your job title. Add your speciality, impact, or unique value.",
      },
      {
        type: "tip",
        label: "Before vs After",
        text: "❌ 'Software Engineer at Infosys'\n✅ 'Full-Stack Engineer | React & Node.js | Building Products Used by 1M+ Users'",
      },
      {
        type: "h2",
        text: "3. Turn on 'Open to Work'",
      },
      {
        type: "p",
        text: "You can make this visible only to recruiters (not your current employer) by selecting the right setting. Profiles with 'Open to Work' (recruiter-only) get 2× more InMail.",
      },
      {
        type: "h2",
        text: "4. Write an About Section That Humans Actually Want to Read",
      },
      {
        type: "p",
        text: "Your About should be 3–5 short paragraphs: who you are, what you do and what you're passionate about, your biggest achievements, and what you're looking for. Write in first person. Avoid third-person bios — they feel distant.",
      },
      {
        type: "h2",
        text: "5. Use the Featured Section as Your Portfolio",
      },
      {
        type: "ul",
          items: [
          "Pin your top post or article",
          "Link to your portfolio, GitHub, or case study",
          "Add a project video or presentation",
          "Feature media coverage or speaking engagements",
        ],
      },
      {
        type: "h2",
        text: "6. Post Content Consistently",
      },
      {
        type: "p",
        text: "Posting even once a week compounds over time. Share lessons learned, project updates, industry takes, or career tips. You don't need to go viral — just stay visible to your network.",
      },
      {
        type: "quote",
        text: "Your LinkedIn profile is working for you 24/7. Make sure it's saying the right things while you sleep.",
      },
      {
        type: "cta",
        text: "Complete your EkClickJob profile today for better job matching and employer visibility.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return blogPosts;
  return blogPosts.filter((p) => p.category === category);
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find((p) => p.featured);
}
