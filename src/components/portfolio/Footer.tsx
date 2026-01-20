export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="text-center p-4 bg-portfolio-nav-light dark:bg-portfolio-nav-dark transition-colors duration-300">
      <p className="text-portfolio-text-light dark:text-portfolio-text-dark">
        &copy; {currentYear} Sam Dunning
      </p>
    </footer>
  )
}
