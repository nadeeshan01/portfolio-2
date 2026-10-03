import { useScroll, useSpring } from 'framer-motion'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Hero from './components/Hero'
import MetricStrip from './components/MetricStrip'
import Nav from './components/Nav'
import Pipeline from './components/Pipeline'
import PlateRail from './components/PlateRail'
import Projects from './components/Projects'
import Skills from './components/Skills'

export default function App() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 })

  return (
    <div className="min-h-screen bg-ground text-ink">
      <Nav />
      <PlateRail progress={progress} />

      <main className="pt-16">
        <MetricStrip />
        <Hero />
        <Skills />
        <Pipeline />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}
