import React from 'react';
import { Link } from 'react-router-dom';

const CommunityGuidelines = () => {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'respectful-conduct', title: '1. Respectful Conduct and Professional Discourse' },
    { id: 'safety-protection', title: '2. Safety and Protection of Well-Being' },
    { id: 'inclusion', title: '3. Commitment to Inclusion and Non-Discrimination' },
    { id: 'authenticity', title: '4. Content Authenticity and Information Integrity' },
    { id: 'intellectual-property', title: '5. Intellectual Property Rights' },
    { id: 'content-standards', title: '6. Content Standards and Responsible Sharing' },
    { id: 'platform-use', title: '7. Appropriate Platform Use' },
    { id: 'reporting', title: '8. Reporting and Enforcement Procedures' },
    { id: 'accountability', title: '9. User Accountability' },
    { id: 'evolution', title: '10. Continuous Evolution of Guidelines' },
    { id: 'conclusion', title: 'Conclusion' },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-black mb-4">UROWN Community Guidelines</h1>
          <p className="text-gray-600">Last Updated: October 2025</p>
          <p className="text-gray-600">For questions: urowncontact@gmail.com</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-50 p-6 rounded-lg mb-10 shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-4">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-left w-full"
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Guidelines Content */}
        <div className="space-y-10">
          {/* Introduction */}
          <section id="introduction" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              UROWN is committed to fostering a safe, inclusive, and productive environment where members can engage meaningfully, share ideas, and collaborate with confidence. These Community Guidelines establish the standards of conduct expected of all users and outline the principles that govern participation on our platform.
            </p>
            <p className="text-gray-700">
              By accessing or using UROWN, you acknowledge and agree to comply with these guidelines. Failure to adhere to these standards may result in content removal, account suspension, or permanent termination of access.
            </p>
          </section>

          {/* Section 1 */}
          <section id="respectful-conduct" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">1. Respectful Conduct and Professional Discourse</h2>
            <p className="text-gray-700 mb-4">
              All members are expected to engage with one another in a respectful and professional manner. The following behaviors are strictly prohibited:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Personal attacks, harassment, or threats of any kind</li>
              <li>Hate speech or discriminatory language</li>
              <li>Intimidation or coercion of other users</li>
            </ul>
            <p className="text-gray-700">
              Users are encouraged to engage in constructive dialogue. While disagreement is natural and welcomed, critiques should be directed at ideas and content, not individuals.
            </p>
          </section>

          {/* Section 2 */}
          <section id="safety-protection" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">2. Safety and Protection of Well-Being</h2>
            <p className="text-gray-700 mb-4">
              UROWN maintains a zero-tolerance policy toward content or behavior that endangers the safety or well-being of community members:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Content that promotes, glorifies, or incites violence, self-harm, suicide, or dangerous activities is prohibited</li>
              <li>Bullying, targeted harassment, or coordinated campaigns against individuals or groups are not permitted</li>
              <li>Unauthorized disclosure of private or personally identifiable information (doxxing), including addresses, contact details, identification documents, or financial information, is strictly forbidden</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="inclusion" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">3. Commitment to Inclusion and Non-Discrimination</h2>
            <p className="text-gray-700 mb-4">
              UROWN is dedicated to maintaining an inclusive community that welcomes individuals from all backgrounds. Discrimination of any form will not be tolerated, including but not limited to discrimination based on:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Race, ethnicity, or national origin</li>
              <li>Gender, gender identity, or sexual orientation</li>
              <li>Religion or belief system</li>
              <li>Age, disability, or socioeconomic status</li>
            </ul>
            <p className="text-gray-700">
              The use of slurs, hateful imagery, coded language, or symbols intended to harass, demean, or exclude individuals or groups is expressly prohibited.
            </p>
          </section>

          {/* Section 4 */}
          <section id="authenticity" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">4. Content Authenticity and Information Integrity</h2>
            <p className="text-gray-700 mb-4">
              Users must maintain honesty and transparency in their interactions on UROWN:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Impersonation of individuals, organizations, or entities is prohibited</li>
              <li>Dissemination of deliberately false, misleading, or deceptive information is not permitted</li>
              <li>Spam, fraudulent schemes, phishing attempts, and other deceptive practices will result in immediate removal and may be subject to legal action</li>
              <li>Use of automated systems, bots, artificial engagement tactics, or manipulation of platform mechanisms is strictly forbidden</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="intellectual-property" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">5. Intellectual Property Rights</h2>
            <p className="text-gray-700 mb-4">
              Users must respect the intellectual property rights of others:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Share only content for which you possess appropriate rights, licenses, or permissions</li>
              <li>Do not reproduce, distribute, or claim ownership of copyrighted material, trademarks, or proprietary content without authorization</li>
              <li>Provide proper attribution when required</li>
              <li>If you believe your intellectual property rights have been violated, please utilize our designated reporting procedures</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="content-standards" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">6. Content Standards and Responsible Sharing</h2>
            <p className="text-gray-700 mb-4">
              UROWN enforces clear standards regarding the nature and presentation of content:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Content depicting graphic violence, explicit sexual activity, or exploitation is prohibited</li>
              <li>Mature or sensitive content must be appropriately labeled and shared only in designated contexts</li>
              <li>Any content that exploits, endangers, or sexualizes minors is absolutely prohibited and will be immediately reported to relevant authorities</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="platform-use" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">7. Appropriate Platform Use</h2>
            <p className="text-gray-700 mb-4">
              Users must utilize UROWN's services in accordance with their intended purpose:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Attempts to disrupt services, circumvent security measures, or engage in unauthorized access are prohibited</li>
              <li>Commercial activities, promotional content, and advertisements must comply with UROWN's business partnership policies</li>
              <li>Users must not engage in behavior that disrupts community spaces, including flooding, excessive posting, or coordinated interference with discussions</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="reporting" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">8. Reporting and Enforcement Procedures</h2>
            <p className="text-gray-700 mb-4">
              UROWN maintains systems to address violations of these guidelines:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Users are encouraged to report content or behavior that violates these guidelines through our reporting tools</li>
              <li>Enforcement actions are determined based on the severity, context, and frequency of violations and may include content removal, feature restrictions, temporary suspension, or permanent account termination</li>
              <li>UROWN reserves the right to take immediate action in cases involving imminent harm or severe violations</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="accountability" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">9. User Accountability</h2>
            <p className="text-gray-700 mb-4">
              Each user bears responsibility for their conduct and content on UROWN:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>All users are accountable for ensuring their activity complies with these guidelines</li>
              <li>Lack of awareness of these guidelines does not constitute a valid defense for violations</li>
              <li>By maintaining an account on UROWN, users affirm their commitment to upholding these standards and contributing to a positive community environment</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="evolution" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">10. Continuous Evolution of Guidelines</h2>
            <p className="text-gray-700 mb-4">
              UROWN is committed to the ongoing development and refinement of these Community Guidelines:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>These guidelines may be updated periodically to address emerging challenges and community needs</li>
              <li>Users will be notified of material changes to these guidelines</li>
              <li>Community feedback is valued and considered in the development of policy updates</li>
              <li>Continued use of UROWN following any modifications constitutes acceptance of the revised guidelines</li>
            </ul>
          </section>

          {/* Conclusion */}
          <section id="conclusion" className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-black mb-4">Conclusion</h2>
            <p className="text-gray-700">
              The strength of UROWN lies in its community. These guidelines exist to protect that community and ensure UROWN remains a platform where meaningful engagement, creative expression, and collaborative innovation can thrive in an atmosphere of mutual respect and safety.
            </p>
            <p className="text-gray-700 mt-4">
              We appreciate your commitment to maintaining the integrity and values of the UROWN community.
            </p>
          </section>
        </div>

        {/* Back to Top Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
          >
            Back to Top
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;