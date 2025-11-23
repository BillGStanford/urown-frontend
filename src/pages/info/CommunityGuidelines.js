// src/pages/info/CommunityGuidelines.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Handshake, 
  Shield, 
  Globe, 
  Check, 
  Copyright, 
  FileText, 
  Settings, 
  Library, 
  Scale, 
  User, 
  RefreshCw, 
  ChevronRight,
  AlertCircle,
  Home,
  Phone
} from 'lucide-react';

const CommunityGuidelines = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [scrollProgress, setScrollProgress] = useState(0);

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: BookOpen },
    { id: 'respectful-conduct', title: 'Respectful Conduct and Professional Discourse', icon: Handshake, number: '1' },
    { id: 'safety-protection', title: 'Safety and Protection of Well-Being', icon: Shield, number: '2' },
    { id: 'inclusion', title: 'Commitment to Inclusion and Non-Discrimination', icon: Globe, number: '3' },
    { id: 'authenticity', title: 'Content Authenticity and Information Integrity', icon: Check, number: '4' },
    { id: 'intellectual-property', title: 'Intellectual Property Rights', icon: Copyright, number: '5' },
    { id: 'content-standards', title: 'Content Standards and Responsible Sharing', icon: FileText, number: '6' },
    { id: 'platform-use', title: 'Appropriate Platform Use', icon: Settings, number: '7' },
    { id: 'ebook-standards', title: 'E-Book Publishing & Long-Form Writing Standards', icon: Library, number: '8' },
    { id: 'reporting', title: 'Reporting and Enforcement Procedures', icon: Scale, number: '9' },
    { id: 'accountability', title: 'User Accountability', icon: User, number: '10' },
    { id: 'evolution', title: 'Continuous Evolution of Guidelines', icon: RefreshCw, number: '11' },
    { id: 'conclusion', title: 'Conclusion', icon: Check },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setScrollProgress(progress);

      // Update active section based on scroll position
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i].element;
        if (element && element.getBoundingClientRect().top <= 150) {
          setActiveSection(sectionElements[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gray-800 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-800 px-4 py-3">
                  <h3 className="text-white font-semibold text-sm">Navigation</h3>
                </div>
                <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${
                          activeSection === section.id
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">
                          {section.number && <span className="font-mono mr-2">{section.number}.</span>}
                          {section.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {/* Hero Section */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <BookOpen className="h-10 w-10" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
                Community Guidelines
              </h1>
              <p className="text-gray-600 text-lg mb-2">Building a safer, more inclusive platform</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  Last Updated: November 2025
                </span>
                <span className="hidden sm:inline">•</span>
                <Link to="/contact" className="text-gray-800 hover:text-gray-900 font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Questions? Contact us
                </Link>
              </div>
            </div>

            {/* Mobile TOC */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Table of Contents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">
                        {section.number && <span className="font-mono mr-1">{section.number}.</span>}
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guidelines Content */}
            <div className="space-y-8">
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Introduction</h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    UROWN is unequivocally committed to cultivating a secure, inclusive, and intellectually stimulating environment where participants can engage substantively, disseminate perspectives, and collaborate with unwavering confidence. These Community Guidelines establish comprehensive behavioral expectations for all platform participants and delineate foundational principles governing user engagement across our ecosystem.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing, utilizing, or maintaining an account on UROWN, you explicitly acknowledge, comprehend, and consent to comply unconditionally with these guidelines. Non-adherence to these established standards may precipitate content moderation, temporary account restrictions, or permanent termination of platform access privileges.
                  </p>
                </div>
              </section>

              {/* Section 1 */}
              <section id="respectful-conduct" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Handshake className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">01.</span>
                      Respectful Conduct and Professional Discourse
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All community participants are categorically expected to maintain professional decorum and engage constructively with fellow users. The following behaviors constitute unacceptable conduct and are subject to enforcement action:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Personal attacks, harassment, or intimidation:</strong> Targeted hostility, threatening language, or coordinated campaigns designed to humiliate, silence, or intimidate individuals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Hate speech or discriminatory language:</strong> Expressions, terminology, or rhetoric intended to degrade, marginalize, or dehumanize individuals based on protected characteristics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Coercion or manipulation:</strong> Attempts to compel behavior, extract concessions, or exploit vulnerabilities through psychological pressure or deceptive tactics</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    While intellectual disagreement is not only permitted but actively encouraged as essential to productive discourse, criticisms and counterarguments must be substantively directed toward ideological positions, methodological approaches, or content quality—never toward personal characteristics, identity, or dignity of individual participants.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="safety-protection" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">02.</span>
                      Safety and Protection of Well-Being
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    UROWN maintains an uncompromising zero-tolerance policy concerning content, conduct, or coordinated activities that endanger physical safety, psychological well-being, or personal security of community participants:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Violence promotion or glorification:</strong> Content that encourages, normalizes, celebrates, or provides instructional guidance for violent acts, self-harm, suicide, or participation in inherently dangerous activities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Systematic harassment and bullying:</strong> Sustained campaigns of psychological torment, coordinated group attacks, or organized efforts to isolate, intimidate, or silence individuals or communities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Unauthorized disclosure of private information:</strong> Publication or distribution of personally identifiable information including residential addresses, telecommunications data, identification documentation, financial account details, or other sensitive personal data without explicit authorization (commonly referred to as "doxxing")</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Psychological manipulation and emotional harm:</strong> Deliberate dissemination of content specifically engineered to inflict emotional distress, trigger psychological trauma, or exploit known vulnerabilities</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section id="inclusion" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">03.</span>
                      Commitment to Inclusion and Non-Discrimination
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    UROWN is fundamentally dedicated to maintaining an authentically inclusive community infrastructure that welcomes, respects, and accommodates individuals representing full spectrum of human diversity. Discriminatory conduct in any manifestation will be subject to immediate enforcement action, including but not limited to discrimination predicated upon:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Racial, ethnic, or national identity:</strong> Discrimination, stereotyping, or prejudicial treatment based on race, ethnicity, ancestry, or national origin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Gender identity and sexual orientation:</strong> Discrimination targeting individuals based on gender expression, gender identity, biological sex, or sexual orientation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Religious or philosophical beliefs:</strong> Intolerance, mockery, or discriminatory treatment of individuals based on religious affiliation, spiritual practices, or philosophical worldviews</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Age, disability, or socioeconomic status:</strong> Prejudicial treatment, exclusion, or harassment based on chronological age, physical or cognitive disabilities, or economic circumstances</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    The utilization of derogatory terminology, hateful imagery, coded linguistic patterns, dog-whistle rhetoric, or symbolic representations deliberately employed to harass, demean, marginalize, or systematically exclude individuals or demographic groups is expressly and categorically prohibited under all circumstances.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="authenticity" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Check className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">04.</span>
                      Content Authenticity and Information Integrity
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Platform participants must maintain uncompromising standards of honesty, transparency, and authenticity throughout all platform interactions and content contributions:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Identity misrepresentation prohibition:</strong> Impersonation of individuals, institutional entities, organizational representatives, or public figures through deceptive profile creation, fraudulent credentials, or misleading attribution</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Misinformation and disinformation:</strong> Deliberate fabrication, intentional distortion, or strategic dissemination of demonstrably false, misleading, or deceptive information designed to manipulate perceptions or mislead audiences</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Fraudulent activities:</strong> Engagement in spam operations, confidence schemes, phishing campaigns, social engineering attacks, or any deceptive practices intended to extract personal information, financial resources, or unauthorized access credentials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Artificial engagement manipulation:</strong> Deployment of automated systems, computational bots, coordinated inauthentic behavior networks, artificial engagement inflation tactics, or any technological manipulation of platform mechanisms, metrics, or algorithmic systems</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="intellectual-property" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Copyright className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">05.</span>
                      Intellectual Property Rights
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All platform participants bear absolute responsibility for respecting intellectual property rights, creative ownership, and proprietary interests of content creators, copyright holders, and trademark owners:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Authorized content sharing:</strong> Publish, distribute, or display exclusively content for which you possess legitimate ownership rights, appropriate licensing agreements, or explicit authorization from rights holders</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Copyright and trademark compliance:</strong> Refrain from unauthorized reproduction, distribution, modification, or commercial exploitation of copyrighted materials, registered trademarks, service marks, or proprietary intellectual property</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Proper attribution requirements:</strong> Provide comprehensive, accurate attribution and appropriate credit when incorporating, referencing, or building upon creative works, research contributions, or intellectual property of others</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Violation reporting mechanisms:</strong> If you possess reasonable grounds to believe your intellectual property rights have been infringed, please utilize our designated reporting infrastructure and follow established takedown notification procedures</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section id="content-standards" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">06.</span>
                      Content Standards and Responsible Sharing
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    UROWN enforces comprehensive standards governing nature, presentation, and distribution of user-generated content across all platform features:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Prohibited graphic content:</strong> Materials depicting extreme violence, graphic sexual activity, non-consensual intimate imagery, or exploitation of vulnerable individuals are categorically prohibited</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Mature content protocols:</strong> Content addressing mature themes, sensitive subject matter, or potentially disturbing material must be appropriately labeled, contextualized, and shared exclusively within designated platform spaces with appropriate content warnings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Child safety protections:</strong> Any content that exploits, endangers, sexualizes, or inappropriately depicts minors is absolutely prohibited under all circumstances and will precipitate immediate account termination and mandatory reporting to appropriate law enforcement authorities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Shock content prohibition:</strong> Content deliberately engineered to terrorize, traumatize, shock, or inflict emotional distress upon viewers for recreational purposes is not permitted</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 7 */}
              <section id="platform-use" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">07.</span>
                      Appropriate Platform Use
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Platform participants must utilize UROWN's services, features, and infrastructure in accordance with their documented intended purposes and established operational parameters:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>System integrity protection:</strong> Attempts to disrupt platform services, circumvent security protocols, exploit system vulnerabilities, or gain unauthorized access to restricted infrastructure components are strictly prohibited</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Commercial activity regulations:</strong> Commercial promotions, advertisement distribution, marketing campaigns, and business solicitations must comply comprehensively with UROWN's established business partnership policies and commercial content guidelines</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Community disruption prevention:</strong> Behaviors that substantially disrupt community spaces, including coordinated flooding, excessive repetitive posting, spam distribution, or orchestrated interference with legitimate discussions are prohibited</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Automated system restrictions:</strong> Deployment of automated posting systems, data scraping infrastructure, content harvesting tools, or unauthorized data mining operations without explicit platform authorization is categorically forbidden</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 8 - New E-Book Standards */}
              <section id="ebook-standards" className="scroll-mt-24 bg-gray-100 rounded-lg shadow-sm border-2 border-gray-300 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Library className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded-full mb-3">
                      NEW POLICY
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">08.</span>
                      E-Book Publishing & Long-Form Writing Standards
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    UROWN | E-Book represents a strategic extension of platform's mission into long-form content creation and literary publishing. To maintain exceptional quality standards and ensure user safety across extended narrative formats, following specialized guidelines govern e-book publishing:
                  </p>

                  <div className="bg-white rounded-lg p-6 mb-6 border border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-gray-800">A.</span> Content Quality Requirements
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Authentic authorship standards:</strong> Published e-books must demonstrate meaningful human authorship, creative contribution, and original intellectual effort. Wholesale plagiarism or predominantly AI-generated content lacking substantive human creative input is prohibited</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Ideological extremism prohibition:</strong> Publications promoting hateful ideologies, extremist recruitment materials, violent radicalization content, or manifestos advocating harm against individuals or demographic groups are categorically forbidden</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Explicit sexual content restrictions:</strong> E-books containing explicit sexual content, graphic intimate descriptions, or erotic fiction are not permitted on platform</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Graphic violence limitations:</strong> Gratuitous depictions of extreme violence, torture, mutilation, or gore intended primarily for shock value rather than legitimate narrative purposes are prohibited</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Harassment documentation prohibition:</strong> Personal revenge narratives, targeted harassment compilations, defamatory exposés, or "call-out books" designed to systematically harm, humiliate, or destroy the reputation of specific individuals are not permitted</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-6 border border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-gray-800">B.</span> Structural and Technical Standards
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Chapter organization requirements:</strong> All published e-books must utilize UROWN's integrated chapter management system, maintaining logical structural organization and reader-friendly navigation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Formatting compliance:</strong> Content must adhere to established formatting protocols, excluding embedded imagery, external media embeds, or non-standard formatting that disrupts platform functionality</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Metadata accuracy:</strong> Book titles, descriptions, categorizations, and associated metadata must accurately represent content characteristics and must not employ deceptive or misleading descriptions to manipulate discovery algorithms</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-6 border border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-gray-800">C.</span> Author Accountability Standards
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Factual accuracy obligations:</strong> Authors bear responsibility for ensuring factual accuracy, appropriate sourcing, and intellectual honesty in non-fiction works, particularly those addressing historical events, scientific claims, or public affairs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Genre classification requirements:</strong> Fictional narratives must be transparently designated as fiction, preventing reader confusion regarding veracity or documentary nature of content</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Real person portrayal ethics:</strong> Literary works depicting real individuals, whether biographical, autobiographical, or fictionalized accounts involving real persons, must be approached with ethical responsibility, factual accuracy where applicable, and respect for personal dignity</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-6 border border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-gray-800">D.</span> Minor Protection Protocols
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Absolute prohibition on minor sexualization:</strong> Any depictions, references, implications, or fictional narratives that sexualize, romanticize inappropriate relationships with, or exploit minors in any capacity are absolutely forbidden</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Minor safety endangerment:</strong> Content encouraging minors to engage in dangerous activities, self-harm, substance abuse, or other behaviors harmful to their physical or psychological well-being is prohibited</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-red-600">E.</span> E-Book Enforcement Mechanisms
                    </h3>
                    <p className="text-gray-700 mb-4">Violations of e-book publishing standards may result in progressive enforcement actions:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-3">
                        <ChevronRight className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Removal of individual chapters containing policy violations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Complete book unpublishing and removal from platform discovery</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Restriction or permanent revocation of e-book publishing privileges</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Temporary account suspension or permanent termination for severe violations</span>
                      </li>
                    </ul>
                    <p className="text-gray-700 mt-4 font-semibold">
                      Systematic abuse of UROWN | E-Book publishing features will result in permanent loss of all writing and publishing privileges across the platform.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 9 */}
              <section id="reporting" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">09.</span>
                      Reporting and Enforcement Procedures
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    UROWN maintains comprehensive infrastructure and established protocols to address violations of these Community Guidelines effectively and equitably:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Violation reporting mechanisms:</strong> Platform participants are actively encouraged to report content, conduct, or coordinated activities that violate these guidelines through designated reporting tools integrated throughout the platform interface</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Proportionate enforcement framework:</strong> Enforcement determinations are calibrated based on comprehensive assessment of violation severity, contextual circumstances, historical user conduct patterns, and frequency of infractions. Potential actions include content removal, temporary feature restrictions, account suspension, or permanent account termination</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Emergency response protocols:</strong> UROWN reserves unequivocal authority to implement immediate enforcement action in circumstances involving imminent physical danger, severe psychological harm, child safety concerns, or egregious policy violations requiring urgent intervention</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Law enforcement cooperation:</strong> In situations involving illegal activity, credible threats to public safety, or content exploiting minors, UROWN will cooperate fully with appropriate law enforcement authorities and regulatory agencies</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 10 */}
              <section id="accountability" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">10.</span>
                      User Accountability
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Each individual platform participant bears personal responsibility for their conduct, content contributions, and adherence to established community standards:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Individual compliance obligation:</strong> All users are individually accountable for ensuring their platform activities, published content, and interpersonal interactions comply comprehensively with these guidelines</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Awareness responsibility:</strong> Lack of awareness, unfamiliarity with guidelines, or claims of ignorance regarding established policies do not constitute valid justification or acceptable defense for policy violations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Community commitment affirmation:</strong> By maintaining an active account on UROWN, users explicitly affirm their commitment to upholding these standards and contributing constructively to a positive, safe, and intellectually vibrant community environment</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 11 */}
              <section id="evolution" className="scroll-mt-24 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      <span className="text-gray-400 font-mono mr-3">11.</span>
                      Continuous Evolution of Guidelines
                    </h2>
                    <div className="h-1 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    UROWN maintains an ongoing commitment to continuous development, refinement, and evolution of these Community Guidelines:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Adaptive policy framework:</strong> These guidelines may be periodically updated, revised, or expanded to address emerging technological challenges, evolving community needs, novel safety concerns, or changing regulatory landscapes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Transparent communication:</strong> Users will receive advance notification of material modifications to these guidelines through platform announcements, email communications, or in-application notifications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Community participation:</strong> User feedback, community perspectives, and stakeholder input are valued and thoughtfully considered during policy development and revision processes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Acceptance through continued use:</strong> Continued utilization of UROWN following implementation of guideline modifications constitutes implicit acceptance of revised policies and standards</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Conclusion */}
              <section id="conclusion" className="scroll-mt-24 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Check className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">Conclusion</h2>
                    <div className="h-1 w-20 bg-white/50 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none text-white">
                  <p className="leading-relaxed mb-4 text-white/95">
                    The fundamental strength and enduring success of UROWN reside inextricably within its community—the collective intelligence, creative energy, and collaborative spirit of its participants. These Community Guidelines exist to safeguard that community's integrity and ensure UROWN remains an environment where meaningful intellectual engagement, authentic creative expression, and productive collaborative innovation can flourish within an atmosphere characterized by mutual respect, personal safety, and inclusive participation.
                  </p>
                  <p className="leading-relaxed text-white/95">
                    We extend our sincere appreciation for your commitment to maintaining integrity, values, and exceptional quality standards that define the UROWN community experience.
                  </p>
                </div>
              </section>
            </div>

            {/* Contact CTA */}
            <div className="mt-12 bg-gray-800 rounded-lg shadow-lg p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-3">Questions About Our Guidelines?</h3>
              <p className="mb-6 text-gray-300">
                Our team is here to help clarify any questions or concerns you may have.
              </p>
              <Link
                to="/contact"
                className="inline-block px-8 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all font-semibold"
              >
                Contact Support Team
              </Link>
            </div>

            {/* Back to Top Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium border border-gray-200"
              >
                <ChevronRight className="h-4 w-4 rotate-270" />
                <span>Back to Top</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;