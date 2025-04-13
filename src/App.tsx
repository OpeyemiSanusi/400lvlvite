import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Tools from '@/pages/tools';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import TopicGenerator from '@/pages/tools/TopicGenerator';
import ReferenceConverter from '@/pages/tools/ReferenceConverter';
import ResearchQuestions from '@/pages/tools/ResearchQuestions';
import ChapterRewriter from './pages/tools/ChapterRewriter';
import MethodologyAdvisor from '@/pages/tools/MethodologyAdvisor';
import RelevantPaper from '@/pages/tools/RelevantPaper';
import PastProjectDirectory from './pages/tools/PastProjectDirectory';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tools/topic-generator" element={<TopicGenerator />} />
            <Route path="/tools/past-projects" element={<PastProjectDirectory />} />
            <Route path="/tools/reference-converter" element={<ReferenceConverter />} />
            <Route path="/tools/relevant-paper" element={<RelevantPaper />} />
            <Route path="/tools/research-questions" element={<ResearchQuestions />} />
            <Route path="/tools/chapter-rewriter" element={<ChapterRewriter />} />
            <Route path="/tools/methodology-advisor" element={<MethodologyAdvisor />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;