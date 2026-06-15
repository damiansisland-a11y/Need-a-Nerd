import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Sun, Moon, Laptop, BookOpen, Brain, 
  GraduationCap, Atom, Code, MonitorPlay, 
  Pencil, Library, Calculator, ChevronDown, ChevronUp,
  Users, Sparkles, Video, Mail, ShieldCheck, CheckCircle2,
  FileText, Award, BarChart, Globe, Menu, X, ArrowRight, ExternalLink
} from 'lucide-react';

// --- NEW IMPORT FOR TOOLS MODULE ---
import ToolsModule from './components/ToolModule';
import CheckInModule from './components/CheckInModule';

// --- FIREBASE ARCHITECTURE (LOCAL) ---
import { auth, db } from './firebase';
import { signInWithCustomToken, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const appId = 'portfolio-engine';

// --- HOOKS ---

const useInView = (options = { threshold: 0.1 }) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, options);
    
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [options]);
  
  return [ref, isInView];
};

// --- SHARED UI COMPONENTS (EXPORTED FOR MODULES) ---

export const FadeInHeading = ({ children, className = '' }) => {
  const [ref, isInView] = useInView();
  return (
    <h2 
      ref={ref}
      className={`transition-all duration-1000 transform ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </h2>
  );
};

export const FadeInSection = ({ children, delay = 'delay-0', className = '' }) => {
  const [ref, isInView] = useInView({ threshold: 0.05 });
  return (
    <div 
      ref={ref}
      className={`transition-all duration-1000 transform ${delay} ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// --- DATA ---

const standardsData = [
  {
    num: 1,
    title: "Know students and how they learn",
    icon: Users,
    areas: [
      { 
        subtitle: "Focus Area 1.1 - Physical, social and intellectual development and characteristics of students", 
        artefact: "Physical, Cognitive, Social and Emotional Development Report (EDUC5005).",
        reflection: "Understanding the nuanced developmental milestones of middle childhood is paramount for effective instructional design. In this report, I analysed the physical, cognitive, and socio-emotional trajectories of students in Years 3 to 6. By grounding my analysis in developmental psychology, I demonstrated my capacity to tailor pedagogical strategies that accommodate the transitional complexities of upper primary students, ensuring that learning environments remain developmentally appropriate and intellectually stimulating.",
        links: [{ label: "View Report", url: "https://drive.google.com/file/d/1xwJ6vK9R_48vtVmt3e91HD3TkOJEyF_z/view?usp=sharing" }]
      },
      { 
        subtitle: "Focus Area 1.4 - Strategies for teaching Aboriginal and Torres Strait Islander students", 
        artefact: "Professional Development Report on Cross-Curriculum Priorities (EDUC6062).",
        reflection: "Culturally responsive pedagogy extends beyond tokenistic inclusion; it requires a deep, authentic engagement with Aboriginal and Torres Strait Islander knowledge systems. My research into the implementation of this Cross-Curriculum Priority highlights my commitment to bridging the gap between policy and practice. I advocate for an inquiry-based approach to professional development that challenges existing biases and empowers educators to foster culturally safe classrooms where First Nations perspectives are intrinsically woven into the curriculum.",
        links: [{ label: "View Report", url: "https://drive.google.com/file/d/1Yltlj-S62IC99S9XhRXPKdJVswxdm7o3/view?usp=sharing" }]
      }
    ]
  },
  {
    num: 2,
    title: "Know the content and how to teach it",
    icon: BookOpen,
    areas: [
      { 
        subtitle: "Focus Area 2.5 - Literacy and Numeracy strategies", 
        artefact: "Reading Investigation (EDUC5031) and Mathematics Connection Report (EDPR5003).",
        reflection: "True literacy and numeracy proficiency require a shift from isolated skill acquisition to interconnected conceptual understanding. My literacy investigation explored the 'Big 6' domains, emphasising the sociocultural foundation of oral language in reading comprehension. Concurrently, my mathematics portfolio demonstrated how linking the Number, Algebra, and Probability strands cultivates flexible mathematical thinking. Together, these artefacts evidence my ability to implement comprehensive, research-based strategies that develop robust literacy and numeracy skills.",
        links: [
          { label: "View Reading Investigation", url: "https://drive.google.com/file/d/1G2o4Lb3oc30TISj3mU2HOmM-NbeF6DGj/view?usp=sharing" },
          { label: "View Mathematics Report", url: "https://drive.google.com/file/d/1Ms83f8iCBzqjZMruZMWPE3CyIZHlRhiA/view?usp=sharing" }
        ]
      }
    ]
  },
  {
    num: 3,
    title: "Plan for and implement effective teaching",
    icon: Pencil,
    areas: [
      { 
        subtitle: "Focus Area 3.2 - Plan, structure and sequence learning programmes", 
        artefact: "5-Week Science Teaching Programme using the 5E Model (EDPR5005).",
        reflection: "Effective learning programmes require deliberate sequencing that builds conceptual depth over time. Utilising the BSCS 5E Instructional Model, I designed a 5-week sequence on the physical properties of light for Year 5 students. By structuring lessons through phases of Engagement, Exploration, Explanation, Elaboration, and Evaluation, I ensured that inquiry-based learning was systematically scaffolded. This artefact demonstrates my proficiency in translating Australian Curriculum standards into engaging, cohesive, and differentiated learning sequences.",
        links: [{ label: "View Programme", url: "https://drive.google.com/file/d/1-WCYyX3A_o_xl-Dnm6j_tXYdcEyTp-R9/view?usp=sharing" }]
      }
    ]
  },
  {
    num: 4,
    title: "Create and maintain safe learning environments",
    icon: ShieldCheck,
    areas: [
      { 
        subtitle: "Focus Area 4.5 - Use ICT safely, responsibly and ethically", 
        artefact: "Digital Footprints and Identity Presentation (EDUC5006).",
        reflection: "In an increasingly digital landscape, educators hold a critical responsibility to guide students in navigating online spaces ethically. I designed a professional development presentation for primary educators focusing on positive digital identity formation. Moving away from fear-based messaging, I advocated for a strengths-based approach that explicitly teaches pro-social online behaviours. This demonstrates my competence in addressing the ethical dimensions of ICT use and my proactive stance on digital citizenship.",
        links: [{ label: "Watch Presentation", url: "https://youtu.be/Lvx4PuUumto?si=-QpOHNvcNM6XSWCG" }]
      }
    ]
  },
  {
    num: 5,
    title: "Assess, provide feedback and report",
    icon: BarChart,
    areas: [
      { 
        subtitle: "Focus Area 5.1 - Assess Student Learning", 
        artefact: "Investigation Report for Year 2/3 Mathematics Sequence (EDPR5001).",
        reflection: "Demonstrating competence in assessment design requires an alignment between pedagogical intent and the expectations outlined in the Australian Curriculum. In my measurement sequence, I designed scaffolded formative assessments that moved beyond standard summative testing. By integrating informal and formal units of measurement into a collaborative inquiry, I was able to observe and document student reasoning in real time. This approach allowed me to gauge conceptual understanding and provided immediate data to refine my instruction.",
        links: [{ label: "View Investigation Report", url: "https://drive.google.com/file/d/1e-kG5bP2dL2jGIWWWI2bnrLVWgzcF5sE/view?usp=sharing" }]
      },
      { 
        subtitle: "Focus Area 5.4 - Interpret Student Data", 
        artefact: "Individual Learning Plan and Data Analysis Report (EDUC6062).",
        reflection: "Effective teaching relies upon the meticulous interpretation of both quantitative and qualitative data. By evaluating the learning profile of a hypothetical Year 6 student experiencing academic and behavioural challenges, I synthesised standard test results with qualitative observational data. This holistic data interpretation was vital in uncovering underlying socio-emotional barriers, thereby facilitating the creation of a precise, compassionate, and highly targeted Individual Learning Plan.",
        links: [{ label: "View Data Analysis Report", url: "https://drive.google.com/file/d/1EsrlXG-Z_6UWumFaDAEaaXhleG9GHBVL/view?usp=sharing" }]
      }
    ]
  },
  {
    num: 6,
    title: "Engage in professional learning",
    icon: Award,
    areas: [
      { 
        subtitle: "Focus Area 6.1 - Identify and plan professional learning needs", 
        artefact: "Professional Development Report on Cross-Curriculum Priorities (EDUC6062).",
        reflection: "A rigorous approach to pedagogy necessitates ongoing, evidence-based professional learning. In this report, I identified a critical gap in educator confidence regarding the integration of the Aboriginal and Torres Strait Islander Histories and Cultures Cross-Curriculum Priority. Utilising Timperley's inquiry circle framework, I planned a targeted professional development sequence aimed at enhancing cultural responsiveness. This artefact demonstrates my capacity to critically analyse systemic pedagogical needs and structure professional learning that moves beyond superficial compliance towards authentic, transformative educational practice.",
        links: [{ label: "View PD Report", url: "https://drive.google.com/file/d/1Yltlj-S62IC99S9XhRXPKdJVswxdm7o3/view?usp=sharing" }]
      }
    ]
  },
  {
    num: 7,
    title: "Engage professionally with colleagues & community",
    icon: Globe,
    areas: [
      { 
        subtitle: "Focus Area 7.3 - Engage with the parents/carers", 
        artefact: "Individual Learning Plan Formulation (EDUC6062).",
        reflection: "Student success is inextricably linked to the strength of the partnership between the school and the home environment. When developing the Individual Learning Plan for a student facing significant personal and academic hurdles, I positioned parent and carer engagement as a central pillar of the intervention strategy. Recognising the socio-emotional context of the student, I articulated pathways for transparent, empathetic communication with the family, ensuring that pedagogical interventions are supported collaboratively outside the classroom.",
        links: [{ label: "View Learning Plan", url: "https://drive.google.com/file/d/1EsrlXG-Z_6UWumFaDAEaaXhleG9GHBVL/view?usp=sharing" }]
      },
      { 
        subtitle: "Focus Area 7.4 - Engage with professional teaching networks and broader communities", 
        artefact: "Professional Development Plan (EDUC6062) and Assessment Data Reflection (EDPR5003).",
        reflection: "Continuous pedagogical improvement is sustained through active participation in professional networks. In my proposal for integrating Aboriginal and Torres Strait Islander histories, I structured a professional development plan based on collaborative inquiry circles. Furthermore, my analysis of student mathematical data highlighted the necessity of moderating assessments with colleagues to ensure consistent, evidence-based instructional decisions. These artefacts underscore my commitment to collaborative professional growth and the sharing of best practices within the broader educational community.",
        links: [
          { label: "View PD Plan", url: "https://drive.google.com/file/d/1Yltlj-S62IC99S9XhRXPKdJVswxdm7o3/view?usp=sharing" },
          { label: "View Data Reflection", url: "https://drive.google.com/file/d/1JSTrkm1m7d-ehnjel8vOsujQxFH-w-p1/view?usp=sharing" }
        ]
      }
    ]
  }
];

// --- PAGE VIEWS ---

const HomeView = ({ navigate, isDarkMode }) => {
  const [scrollY, setScrollY] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    let animationFrameId;
    const animate = () => {
      setTime(prev => prev + 0.01);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scatterIcons = useMemo(() => {
    const iconsList = [Laptop, BookOpen, Brain, GraduationCap, Atom, Code, MonitorPlay, Pencil, Library, Calculator];
    return Array.from({ length: 45 }).map((_, i) => {
      const Icon = iconsList[i % iconsList.length];
      return {
        id: i,
        Icon,
        angle: Math.random() * Math.PI * 2,
        distanceMultiplier: Math.random() * 2.5 + 0.5,
        rotationStart: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        scale: Math.random() * 0.8 + 0.4,
        floatOffset: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  return (
    <>
      <header className="relative h-screen flex flex-col items-center justify-center overflow-hidden pt-16 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
          {scatterIcons.map((item) => {
            const scrollDistance = scrollY * item.distanceMultiplier;
            const x = Math.cos(item.angle) * scrollDistance;
            const y = Math.sin(item.angle) * scrollDistance;
            const floatY = Math.sin(time + item.floatOffset) * 15;
            const floatX = Math.cos(time + item.floatOffset) * 10;
            const opacity = Math.max(0, 1 - (scrollY / 800));

            return (
              <div
                key={item.id}
                className={`absolute transition-opacity ${isDarkMode ? 'text-indigo-400/30' : 'text-indigo-500/20'}`}
                style={{
                  transform: `translate(${x + floatX}px, ${y + floatY}px) rotate(${item.rotationStart + scrollY * item.rotationSpeed}deg) scale(${item.scale})`,
                  opacity: opacity,
                  willChange: 'transform, opacity'
                }}
              >
                <item.Icon size={48} />
              </div>
            );
          })}
        </div>

        <div className="z-10 text-center max-w-4xl px-6">
          <p className="text-indigo-500 font-semibold tracking-widest uppercase mb-4 text-sm animate-pulse">
            Welcome, I'm...
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Mr. Damian Masters.
          </h1>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            "It's not about just feeding content, it's about igniting that desire to discover."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('profile')} className="px-8 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
              Teacher Profile
            </button>
            <button onClick={() => navigate('standards')} className="px-8 py-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              View Standards
            </button>
          </div>
        </div>
      </header>

      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <FadeInSection>
            <h2 className="text-3xl font-bold mb-6">Quick About Me</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Damian Masters is a passionate and multifaceted educator with a strong foundation in teaching, multimedia, and audience engagement. With a background in content creation, IT, marketing, and music, Damian blends creativity with evidence-based pedagogy to create dynamic learning experiences.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              Having completed a Post Graduate Diploma in Education, he is driven by a commitment to modern, student-centred teaching. His expertise spans both traditional and digital platforms, where he develops innovative strategies to support literacy, promote student voice, and engagement.
            </p>
            <button onClick={() => navigate('profile')} className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:gap-3 transition-all">
              Read full profile <ArrowRight className="w-4 h-4" />
            </button>
          </FadeInSection>

          <FadeInSection delay="delay-200">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group h-full">
              <img 
                src="/Profile pic-3 edit.jpg" 
                alt="Damian Masters at a multimedia desk" 
                className="w-full h-full min-h-[300px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop'; 
                }}
              />
              <div className="absolute inset-0 bg-indigo-900/10 dark:bg-indigo-900/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
};

const ProfileView = () => (
  <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto animate-in fade-in duration-500">
    <FadeInHeading className="text-4xl md:text-5xl font-extrabold mb-4">Teacher Profile</FadeInHeading>
    <p className="text-xl text-slate-600 dark:text-slate-400 mb-16">The educator behind the nerd.</p>

    <div className="space-y-16">
      <FadeInSection>
        <h3 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">My Teaching Identity</h3>
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
          <p>I am a creative, reflective, and student-centred educator who sees teaching as a shared journey of discovery. Rooted in my background in music, multimedia, and storytelling, I aim to make learning memorable, meaningful, and emotionally engaging.</p>
          <p>My classroom is a space where students feel seen, safe, and inspired to express themselves. I value curiosity, empathy, and diversity, and I design learning experiences that are inclusive and hands-on.</p>
          <p className="font-medium text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-4 my-6">Grounded in sociocultural and constructivist theory, I see myself as a guide rather than a gatekeeper—someone who walks alongside learners, not ahead of them.</p>
          <p>I continuously reflect on my practice, seek feedback, and embrace innovation to grow both professionally and personally.</p>
        </div>
      </FadeInSection>

      <FadeInSection delay="delay-100">
        <h3 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">My Responsibilities as an Educator</h3>
        <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
          <p>As an educator, my responsibility extends beyond delivering curriculum; it is to ignite curiosity, foster creativity, and build confident, compassionate learners who are equipped to thrive in a rapidly evolving world. I strive to create a classroom that celebrates diversity, encourages risk-taking, and empowers students to express their unique voices through storytelling, collaboration, and critical inquiry.</p>
          <p>With a strong foundation in computer science, multimedia, music, and educational psychology, I design learning experiences that are dynamic, differentiated, and grounded in evidence-based strategies. I integrate hands-on exploration, digital tools, and multimodal resources to support a wide range of learners.</p>
          <p>I see every moment in the classroom as an opportunity to model empathy, resilience, and growth. I champion student wellbeing alongside academic rigour, ensuring learners feel seen, supported, and safe to explore who they are. Through strategies like class discussions, storytelling, and reflective writing, I nurture both intellectual and emotional development.</p>
          <p>Committed to lifelong learning and professional excellence, I constantly reflect on my practice, seek feedback, and stay informed about contemporary educational approaches. This digital portfolio is a living document, a curated collection of lessons, student work, and critical reflections, showcasing my dedication to inclusive, innovative, and impactful teaching.</p>
        </div>
      </FadeInSection>

      <FadeInSection delay="delay-200">
        <h3 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Clearances & Mandatory Certifications</h3>
        <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50">
          <p className="text-slate-700 dark:text-slate-300 mb-6">As a registered teacher in Western Australia, I maintain all required clearances and mandatory certifications. These reflect my commitment to child safety, professional integrity, and the responsibility I carry as an educator.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">Working with Children (WWC)</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">NCCHC Police Clearance</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">First Aid in Education & Care (2024)</span>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection delay="delay-300">
        <h3 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Qualifications & Certifications</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { text: "Graduate Diploma of Education (Primary)", icon: GraduationCap },
            { text: "Bachelor of Recording Arts (Hons)", icon: GraduationCap },
            { text: "Certificate IV in School-based Education Support", icon: Award },
            { text: "Certificate IV in Training and Assessment", icon: Award },
            { text: "Certificate IV in Computer Systems Management", icon: Laptop },
            { text: "Certificate IV in Information Technology", icon: Laptop },
            { text: "Diploma of Music Industry", icon: Library },
            { text: "Grade 8 in Music Theory", icon: BookOpen },
            { text: "Classically trained pianist", icon: Sparkles },
            { text: "Common-sense certified", icon: Brain }
          ].map((qual, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 shrink-0">
                <qual.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200 leading-snug">{qual.text}</span>
            </div>
          ))}
        </div>
      </FadeInSection>
    </div>
  </div>
);

const StandardsView = () => {
  const [openStandard, setOpenStandard] = useState(null);
  
  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen animate-in fade-in duration-500">
      <FadeInHeading className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
        Professional Standards
      </FadeInHeading>
      <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
        A curated collection of reflections and pedagogical artefacts aligned with the Australian Professional Standards for Teachers.
      </p>

      <div className="space-y-4">
        {standardsData.map((std) => {
          const isOpen = openStandard === std.num;
          return (
            <FadeInSection key={std.num} delay={`delay-[${std.num * 50}ms]`}>
              <div 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => setOpenStandard(isOpen ? null : std.num)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${isOpen ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                      <std.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-indigo-500 mb-1">Standard {std.num}</div>
                      <div className="text-lg font-semibold">{std.title}</div>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/50 ml-20">
                    {std.areas.map((area, idx) => (
                      <div key={idx} className="mb-8 last:mb-0">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                          {area.subtitle}
                        </h4>
                        <div className="mb-3">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Artefact: </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{area.artefact}</span>
                        </div>
                        <div className="mb-5 block">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Reflection: </span>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed inline">
                            {area.reflection}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {area.links && area.links.map((link, linkIdx) => (
                            <a 
                              key={linkIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInSection>
          );
        })}
      </div>
    </div>
  );
};

const ContactView = () => (
  <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center animate-in fade-in duration-500">
    <div className="max-w-4xl mx-auto text-center w-full">
      <div className="p-12 md:p-24 rounded-[3rem] bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 text-white">
          <GraduationCap className="w-16 h-16 mx-auto mb-8 opacity-75" />
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight tracking-tight">
            Ready to shape the minds that will change the world?
          </h2>
          <p className="text-indigo-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Whether you are a school principal seeking a dependable relief educator, or a parent looking to bridge the gap in your child's learning journey.
          </p>
          <a href="mailto:damian@needanerd.edu.au" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-indigo-900 font-bold text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl">
            <Mail className="w-6 h-6" />
            Contact Damian Masters
          </a>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);
  
  const [config, setConfig] = useState({
    uid: "",
    settings: { theme: "dark", fontSize: "medium", reduceMotion: false },
    layout: { activeWorkspace: "check-in", whiteboardToolbarPosition: "right", visibleWidgets: ["roster", "timer", "mood-tracker"] },
    importedAssets: []
  });

  const isDarkMode = config.settings.theme === 'dark';

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init failed", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'user_config', 'main');

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setIsRemoteUpdate(true);
        setConfig(snap.data());
      } else {
        const initialSchema = {
          uid: user.uid,
          settings: { theme: "dark", fontSize: "medium", reduceMotion: false },
          layout: { activeWorkspace: "check-in", whiteboardToolbarPosition: "right", visibleWidgets: ["roster", "timer", "mood-tracker"] },
          importedAssets: []
        };
        setDoc(docRef, initialSchema).catch(console.error);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || isRemoteUpdate) {
      setIsRemoteUpdate(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'user_config', 'main');
      setDoc(docRef, config, { merge: true }).catch(console.error);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [config, user]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error("SSO Failed.", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Logout Failed", err);
    }
  };

  const validPages = ['home', 'profile', 'standards', 'tools', 'contact', 'check-in'];
  
  const getHashPage = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    return validPages.includes(hash) ? hash : 'home';
  }, []);

  const [currentPage, setCurrentPage] = useState(getHashPage());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getHashPage());
      window.scrollTo(0, 0); 
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [getHashPage]);

  const navigate = (page) => {
    window.location.hash = page;
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setConfig(prev => ({
      ...prev,
      settings: { ...prev.settings, theme: prev.settings.theme === 'dark' ? 'light' : 'dark' }
    }));
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'profile', label: 'Teacher Profile' },
    { id: 'standards', label: 'Standards' },
    { id: 'tools', label: 'Tools' },
    { id: 'contact', label: 'Contact' }
  ];

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomeView navigate={navigate} isDarkMode={isDarkMode} />;
      case 'profile': return <ProfileView />;
      case 'standards': return <StandardsView />;
      case 'tools': return <ToolsModule user={user} config={config} onLogin={handleGoogleLogin} onLogout={handleLogout} />;
      case 'contact': return <ContactView />;
      default: return <HomeView navigate={navigate} isDarkMode={isDarkMode} />;
    }
  };

  // --- IMMERSIVE OVERRIDE FOR BESPOKE TOOLS ---
  // If the user navigates directly to a tool, we drop the portfolio shell so the application gets 100% of the screen.
  if (currentPage === 'check-in') {
    return (
      <div className={`font-sans min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <CheckInModule user={user} db={db} />
      </div>
    );
  }

  return (
    <div className={`font-sans transition-colors duration-500 flex flex-col min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
            <Brain className="w-8 h-8 text-indigo-500 group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-bold tracking-tight">Need a Nerd</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => navigate(link.id)}
                  className={`text-sm font-bold tracking-wide uppercase transition-colors ${
                    currentPage === link.id 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2">
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-xl py-4 flex flex-col items-center gap-4">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => navigate(link.id)}
                className={`text-lg font-bold w-full py-3 ${
                  currentPage === link.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-slate-500 dark:text-slate-500 text-sm border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Brain className="w-5 h-5" />
          <span className="font-bold">Need a Nerd</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Damian Masters. All rights reserved.</p>
        <p className="mt-2 text-xs">Designed for zero technical friction.</p>
      </footer>

    </div>
  );
}