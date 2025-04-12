import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-bold text-primary">400lvl.com</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering Nigerian students to excel in their final year projects.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link to="/tools" className="text-sm text-muted-foreground hover:text-primary">Tools</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary">About</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Tools</h3>
            <ul className="space-y-2">
              <li><Link to="/tools/topic-generator" className="text-sm text-muted-foreground hover:text-primary">Topic Generator</Link></li>
              <li><Link to="/tools/reference-converter" className="text-sm text-muted-foreground hover:text-primary">Reference Converter</Link></li>
              <li><Link to="/tools/plagiarism-checker" className="text-sm text-muted-foreground hover:text-primary">Plagiarism Checker</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">support@fypassistant.com</li>
              <li className="text-sm text-muted-foreground">+234 123 456 7890</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} 400lvl.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}