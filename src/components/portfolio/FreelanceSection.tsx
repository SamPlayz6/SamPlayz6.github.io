interface Work {
  title: string
  description: string
  url: string
  urlLabel: string
}

const work: Work[] = [
  {
    title: 'SafeAssess',
    description: 'An AI risk-assessment tool for care homes. Full-stack build with React, Supabase and the Gemini API, delivered end to end with pilot onboarding and a GDPR posture.',
    url: 'https://safeassess.com',
    urlLabel: 'Visit site'
  },
  {
    title: 'Maupka',
    description: 'An online maths tutor for the Irish Junior Cycle and Leaving Cert curriculum, with an AI Socratic tutoring engine and a teacher dashboard. Built with React, Supabase and Stripe.',
    url: 'https://maupka.com',
    urlLabel: 'Visit site'
  }
]

export default function FreelanceSection() {
  return (
    <section id="freelance" className="bg-portfolio-section-alt dark:bg-portfolio-bg-dark pt-8 pb-8 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-portfolio-text-light dark:text-portfolio-text-dark pb-2 border-b-2 border-portfolio-nav-light dark:border-gray-700 mb-6">
          Freelance &amp; Product Work
        </h2>
        <div className="space-y-4">
          {work.map((item) => (
            <article
              key={item.title}
              className="bg-portfolio-section-light dark:bg-neutral-700 dark:border dark:border-neutral-600 p-4 rounded-md shadow-md transition-colors duration-300"
            >
              <h3 className="text-lg font-bold mb-2 text-portfolio-text-light dark:text-portfolio-text-dark">
                {item.title}
              </h3>
              <p className="text-portfolio-text-light dark:text-portfolio-text-dark mb-2">
                {item.description}
              </p>
              <a
                href={item.url}
                className="text-portfolio-link-light dark:text-portfolio-link-dark hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.urlLabel}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
