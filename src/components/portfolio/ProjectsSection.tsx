interface Project {
  title: string
  description: string
  githubUrl: string
}

const projects: Project[] = [
  {
    title: 'Translingual Audio Converter',
    description: "A tool based in python using OpenAI's cheap API to convert audio files such as podcasts, video etc from one language to another. Useful for language learning or simple translation.",
    githubUrl: 'https://github.com/SamPlayz6/Trans-lingual-Audio-Converter'
  },
  {
    title: 'ChordGen',
    description: 'A trained neural network tool to convert a sung melody into music played in any instrument with temperature control on the chord progressions created.',
    githubUrl: 'https://github.com/SamPlayz6/ChordGen'
  },
  {
    title: 'Flashcard Story Learning Tool',
    description: 'A language learning tool that generates stories to read and listen to using the vocabulary due on your JPDB due list.',
    githubUrl: 'https://github.com/SamPlayz6/JPDB-FlashCardTool'
  }
]

export default function ProjectsSection() {
  return (
    <section id="projects" className="bg-portfolio-section-dark dark:bg-portfolio-bg-dark pt-[60px] pb-8 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4 pt-8">
        <h2 className="text-portfolio-text-light dark:text-portfolio-text-dark pb-2 border-b-2 border-portfolio-nav-light dark:border-gray-700 mb-6">
          GitHub Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.title}
              className="bg-portfolio-section-light dark:bg-portfolio-section-dark p-4 rounded-md transition-colors duration-300"
            >
              <h3 className="text-lg font-bold mb-2 text-portfolio-text-light dark:text-portfolio-text-dark">
                {project.title}
              </h3>
              <p className="text-portfolio-text-light dark:text-portfolio-text-dark mb-4">
                {project.description}
              </p>
              <a
                href={project.githubUrl}
                className="text-portfolio-link-light dark:text-portfolio-link-dark hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
