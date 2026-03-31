import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Briefcase, Code, DollarSign, MessageSquare, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
export default function Home() {
    return (<div className="page-enter min-h-screen bg-background dark:bg-gradient-to-b dark:from-black dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="nav-logo flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground"/>
            </div>
            <span className="font-bold text-xl text-foreground">DevBoard</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="nav-link text-foreground/70 hover:text-foreground transition">Features</Link>
            <Link href="#for-developers" className="nav-link text-foreground/70 hover:text-foreground transition">For Developers</Link>
            <Link href="#for-clients" className="nav-link text-foreground/70 hover:text-foreground transition">For Clients</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="nav-login-btn" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-40"/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="hero-title text-5xl sm:text-7xl font-bold text-balance mb-6 text-foreground">
              The Complete Platform to Build Your Freelance Career
            </h1>
            <p className="hero-sub text-xl text-foreground/70 text-balance mb-8">
              Connect with clients, bid on projects, manage contracts, and get paid securely. Your all-in-one freelance marketplace built for developers.
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="primary-cta-btn bg-primary hover:bg-primary/90 text-white">
                <Link href="/signup">Get Started Now <ArrowRight className="arrow-icon w-4 h-4 ml-2"/></Link>
              </Button>
              <Button size="lg" variant="outline" className="secondary-cta-btn" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-border/50 flex items-center justify-center">
              <div className="text-center">
                <Briefcase className="w-16 h-16 text-primary/40 mx-auto mb-4"/>
                <p className="text-foreground/50">Platform Interface Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Developers Section */}
      <section id="for-developers" className="py-20 sm:py-32 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">For Developers</h2>
            <p className="text-xl text-foreground/70 text-balance">Everything you need to find, bid, and complete projects</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
            { icon: Zap, title: 'Smart Job Matching', description: 'Find projects that match your skills and experience level' },
            { icon: MessageSquare, title: 'Direct Communication', description: 'Chat with clients in real-time to clarify requirements' },
            { icon: DollarSign, title: 'Secure Payments', description: 'Get paid safely with milestone-based payments' },
            { icon: Shield, title: 'Protected Work', description: 'Contracts and escrow protect your interests' },
            { icon: Code, title: 'Build Your Portfolio', description: 'Showcase completed projects to attract more clients' },
            { icon: Briefcase, title: 'Flexible Schedule', description: 'Choose projects that fit your availability' },
        ].map((feature, idx) => (<Card key={idx} className="feature-card p-6 border-border/50 bg-card hover:bg-card/80 transition">
                <feature.icon className="w-8 h-8 text-primary mb-4"/>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </Card>))}
          </div>
        </div>
      </section>

      {/* For Clients Section */}
      <section id="for-clients" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">For Clients</h2>
            <p className="text-xl text-foreground/70 text-balance">Hire talented developers and get your projects done right</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
            { icon: Code, title: 'Post Projects', description: 'Create detailed job postings to attract qualified developers' },
            { icon: MessageSquare, title: 'Review Proposals', description: 'Compare proposals, portfolios, and developer ratings' },
            { icon: Shield, title: 'Manage with Confidence', description: 'Use contracts and milestone-based payments for safety' },
            { icon: DollarSign, title: 'Fair Pricing', description: 'Control budget and negotiate rates that work for you' },
            { icon: Zap, title: 'Quick Turnaround', description: 'Find developers and start projects in days, not weeks' },
            { icon: Briefcase, title: 'Quality Assurance', description: 'Rate and review developers for future reference' },
        ].map((feature, idx) => (<Card key={idx} className="feature-card p-6 border-border/50 bg-card hover:bg-card/80 transition">
                <feature.icon className="w-8 h-8 text-primary mb-4"/>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </Card>))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Why Choose DevBoard?</h2>
            <p className="text-xl text-foreground/70 text-balance">Everything you need in one unified platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                {[
            { title: 'Unified Job Marketplace', desc: 'Browse all available projects in one place' },
            { title: 'Transparent Bidding', desc: 'See all proposals and make informed decisions' },
            { title: 'Contract Management', desc: 'Professional contracts with clear terms and conditions' },
            { title: 'Payment Protection', desc: 'Secure escrow system protects both parties' },
        ].map((item, idx) => (<div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-foreground/70 text-sm">{item.desc}</p>
                    </div>
                  </div>))}
              </div>
            </div>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-border/50 flex items-center justify-center">
              <p className="text-foreground/50">Feature Showcase</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-foreground/70 text-balance mb-8">
            Join thousands of developers and clients who are already using DevBoard
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="primary-cta-btn bg-primary hover:bg-primary/90 text-white">
              <Link href="/signup">Sign Up Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="secondary-cta-btn" asChild>
              <Link href="/jobs">Explore Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary-foreground"/>
                </div>
                <span className="font-bold text-foreground">DevBoard</span>
              </div>
              <p className="text-foreground/70 text-sm">The platform for developers and clients to connect and collaborate.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Developers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/jobs" className="text-foreground/70 hover:text-foreground transition">Browse Jobs</Link></li>
                <li><Link href="/proposals" className="text-foreground/70 hover:text-foreground transition">My Proposals</Link></li>
                <li><Link href="/contracts" className="text-foreground/70 hover:text-foreground transition">Contracts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/post-job" className="text-foreground/70 hover:text-foreground transition">Post a Job</Link></li>
                <li><Link href="/find-developers" className="text-foreground/70 hover:text-foreground transition">Find Developers</Link></li>
                <li><Link href="/projects" className="text-foreground/70 hover:text-foreground transition">My Projects</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-foreground/70 hover:text-foreground transition">About</Link></li>
                <li><Link href="/help" className="text-foreground/70 hover:text-foreground transition">Help Center</Link></li>
                <li><Link href="/contact" className="text-foreground/70 hover:text-foreground transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8">
            <p className="text-center text-foreground/50 text-sm">&copy; 2026 DevBoard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>);
}
