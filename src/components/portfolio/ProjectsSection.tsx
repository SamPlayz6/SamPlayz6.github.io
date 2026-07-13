interface Project {
  title: string
  description: string
  githubUrl: string
}

const projects: Project[] = [
  {
    title: 'LLMs for Reward Functions in RL',
    description: 'Final year research using large language models to generate reinforcement-learning reward functions from natural language, with a testbed evaluating accuracy, consistency and robustness. Won the yieldHUB Excellence in Data Science Award.',
    githubUrl: 'https://github.com/SamPlayz6/FYP-Using-LLMs-to-Generate-Reward-Functions-from-Natural-Language-in-RL-Environments'
  },
  {
    title: 'ChordGen',
    description: 'A trained neural network that turns a sung melody into music played by any instrument, with temperature control over the generated chord progressions.',
    githubUrl: 'https://github.com/SamPlayz6/ChordGen'
  },
  {
    title: 'JPDB Flashcard Story Tool',
    description: 'A language-learning tool that generates stories to read and listen to, built from the vocabulary due on your JPDB review list.',
    githubUrl: 'https://github.com/SamPlayz6/JPDB-FlashCardTool'
  },
  {
    title: 'Multi-Agent Kit',
    description: 'A toolkit for running multiple Claude Code agents as autonomous AI "employees", with templates, orchestration scripts and a dashboard.',
    githubUrl: 'https://github.com/SamPlayz6/multi-agent-kit'
  },
  {
    title: 'Background Habit Tracker',
    description: 'A lightweight habit tracker that lives quietly in the background of your desktop.',
    githubUrl: 'https://github.com/SamPlayz6/Background-Habit-Tracker'
  },
  {
    title: 'Translingual Audio Converter',
    description: 'A Python tool using the OpenAI API to convert audio files (podcasts, video, etc.) from one language to another, for language learning or quick translation.',
    githubUrl: 'https://github.com/SamPlayz6/Trans-lingual-Audio-Converter'
  }
]

export default function ProjectsSection() {
  return (
    <section id="projects" className="bg-portfolio-section-light dark:bg-portfolio-section-dark pt-8 pb-8 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-portfolio-text-light dark:text-portfolio-text-dark pb-2 border-b-2 border-portfolio-nav-light dark:border-gray-700 mb-6">
          GitHub Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.title}
              className="bg-portfolio-section-light dark:bg-neutral-700 dark:border dark:border-neutral-600 p-4 rounded-md shadow-md transition-colors duration-300"
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
