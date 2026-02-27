import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy – NailPrep',
    description: 'Privacy Policy for the NailPrep mobile application.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-canvas">
            {/* Header */}
            <header className="border-b border-border-light bg-white/70 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 max-w-4xl h-14 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-ink hover:text-rose transition-colors">
                        NailPrep
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-body hover:text-ink transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 max-w-4xl py-12 md:py-20">
                <div className="bg-white rounded-2xl shadow-sm border border-border-light p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-ink mb-2">Privacy Policy</h1>
                    <p className="text-muted text-sm mb-10">Effective as of February 27, 2026</p>

                    <div className="prose-custom space-y-8">

                        <p className="text-body leading-relaxed">
                            This privacy policy applies to the <strong className="text-ink">NailPrep</strong> app (hereby referred to as "Application") for mobile devices that was created by <strong className="text-ink">Tran Quang Huy</strong> (hereby referred to as "Service Provider") as a Freemium service. This service is intended for use "AS IS".
                        </p>

                        <Section title="Information Collection and Use">
                            <p className="text-body leading-relaxed mb-4">
                                The Application collects information when you download and use it. This information may include:
                            </p>
                            <ul className="space-y-2 text-body">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" />
                                    Your device&apos;s Internet Protocol address (e.g. IP address)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" />
                                    The pages of the Application that you visit, the time and date of your visit, the time spent on those pages
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" />
                                    The time spent on the Application
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" />
                                    The operating system you use on your mobile device
                                </li>
                            </ul>
                            <p className="text-body leading-relaxed mt-4">
                                The Application does not gather precise information about the location of your mobile device.
                            </p>
                            <p className="text-body leading-relaxed mt-4">
                                The Application uses Artificial Intelligence (AI) technologies to enhance user experience and provide certain features. The AI components may process user data to deliver personalized content, recommendations, or automated functionalities. All AI processing is performed in accordance with this privacy policy and applicable laws. If you have questions about the AI features or data processing, please contact the Service Provider.
                            </p>
                            <p className="text-body leading-relaxed mt-4">
                                The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.
                            </p>
                            <p className="text-body leading-relaxed mt-4">
                                For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information. The information that the Service Provider requests will be retained by them and used as described in this privacy policy.
                            </p>
                        </Section>

                        <Section title="Third Party Access">
                            <p className="text-body leading-relaxed mb-4">
                                Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways described in this privacy statement.
                            </p>
                            <p className="text-body leading-relaxed mb-4">The Service Provider may disclose User Provided and Automatically Collected Information:</p>
                            <ul className="space-y-2 text-body">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" />
                                    As required by law, such as to comply with a subpoena, or similar legal process
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" />
                                    When they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose flex-shrink-0" />
                                    With their trusted service providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement
                                </li>
                            </ul>
                        </Section>

                        <Section title="Opt-Out Rights">
                            <p className="text-body leading-relaxed">
                                You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
                            </p>
                        </Section>

                        <Section title="Data Retention Policy">
                            <p className="text-body leading-relaxed">
                                The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you&apos;d like them to delete User Provided Data that you have provided via the Application, please contact them at{' '}
                                <a href="mailto:contact@nail-prep.com" className="text-rose hover:underline">contact@nail-prep.com</a>{' '}
                                and they will respond in a reasonable time.
                            </p>
                        </Section>

                        <Section title="Children">
                            <p className="text-body leading-relaxed mb-4">
                                The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
                            </p>
                            <p className="text-body leading-relaxed">
                                The Service Provider does not knowingly collect personally identifiable information from children. The Service Provider encourages all children to never submit any personally identifiable information through the Application and/or Services. The Service Provider encourages parents and legal guardians to monitor their children&apos;s Internet usage and to help enforce this Policy by instructing their children never to provide personally identifiable information through the Application and/or Services without their permission. If you have reason to believe that a child has provided personally identifiable information to the Service Provider through the Application and/or Services, please contact the Service Provider at{' '}
                                <a href="mailto:contact@nail-prep.com" className="text-rose hover:underline">contact@nail-prep.com</a>{' '}
                                so that they will be able to take the necessary actions. You must also be at least 16 years of age to consent to the processing of your personally identifiable information in your country (in some countries we may allow your parent or guardian to do so on your behalf).
                            </p>
                        </Section>

                        <Section title="Security">
                            <p className="text-body leading-relaxed">
                                The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
                            </p>
                        </Section>

                        <Section title="Changes">
                            <p className="text-body leading-relaxed">
                                This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
                            </p>
                        </Section>

                        <Section title="Your Consent">
                            <p className="text-body leading-relaxed">
                                By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
                            </p>
                        </Section>

                        <Section title="Contact Us">
                            <p className="text-body leading-relaxed">
                                If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at{' '}
                                <a href="mailto:contact@nail-prep.com" className="text-rose hover:underline font-medium">
                                    contact@nail-prep.com
                                </a>.
                            </p>
                        </Section>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border-light py-8">
                <div className="container mx-auto px-4 max-w-4xl text-center text-muted text-sm">
                    © {new Date().getFullYear()} NailPrep. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-xl font-bold text-ink mb-3 pb-2 border-b border-border-light">{title}</h2>
            {children}
        </section>
    );
}
