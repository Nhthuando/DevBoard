'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Globe, Lock, Zap, Users, TrendingUp, Briefcase } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === 'CLIENT' ? '/dashboard' : '/dev-dashboard');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span className="text-sm font-medium text-foreground">Now accepting registrations</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-balance text-foreground leading-tight">
              Find your next great{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                project or hire talent
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              DevBoard connects skilled developers with clients worldwide. Build amazing things together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: Zap,
                title: 'Fast Matching',
                desc: 'Find the perfect match in minutes'
              },
              {
                icon: Lock,
                title: 'Secure Payments',
                desc: 'Escrow-protected transactions'
              },
              {
                icon: TrendingUp,
                title: 'Build Reputation',
                desc: 'Reviews and ratings system'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-6 border border-border rounded-xl bg-card hover:border-primary/50 transition">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">How it works</h2>
          
          <div className="grid md:grid-cols-2 gap-12 xl:gap-20 items-start">
            {/* For Clients */}
            <div className="space-y-8 mx-auto w-full max-w-xl">
              <h3 className="text-2xl font-bold text-foreground flex items-center justify-center md:justify-start gap-3">
                <Briefcase className="w-8 h-8 text-primary" />
                For Clients
              </h3>
              
              <div className="space-y-6">
                {[
                  { num: '1', title: 'Post a Job', desc: 'Describe what you need done' },
                  { num: '2', title: 'Review Proposals', desc: 'Receive applications from developers' },
                  { num: '3', title: 'Hire & Collaborate', desc: 'Sign contract and start working' },
                  { num: '4', title: 'Pay Securely', desc: 'Release funds through escrow' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Developers */}
            <div className="space-y-8 mx-auto w-full max-w-xl">
              <h3 className="text-2xl font-bold text-foreground flex items-center justify-center md:justify-start gap-3">
                <Users className="w-8 h-8 text-accent" />
                For Developers
              </h3>
              
              <div className="space-y-6">
                {[
                  { num: '1', title: 'Browse Projects', desc: 'Find work that matches your skills' },
                  { num: '2', title: 'Submit Proposal', desc: 'Tell the client about your experience' },
                  { num: '3', title: 'Get Hired', desc: 'Start working on the project' },
                  { num: '4', title: 'Earn & Review', desc: 'Get paid and build your reputation' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground font-bold flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Why DevBoard?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Lock,
                title: 'Secure Escrow',
                desc: 'Your money is safe. Payment only released when work is approved.'
              },
              {
                icon: Globe,
                title: 'Global Community',
                desc: 'Connect with talent and clients from around the world.'
              },
              {
                icon: TrendingUp,
                title: 'Build Reputation',
                desc: 'Earn reviews and ratings that grow your professional profile.'
              },
              {
                icon: Zap,
                title: 'Easy Collaboration',
                desc: 'Integrated tools for communication, contracts, and payments.'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex gap-4">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-foreground">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of developers and clients building amazing projects together.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Your Free Account <ArrowRight className="w-5 h-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-primary text-primary-foreground font-bold flex items-center justify-center">
                  DB
                </div>
                <span className="font-semibold text-foreground">DevBoard</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect with skilled developers. Find your next project.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">For Clients</Link></li>
                <li><Link href="#" className="hover:text-foreground">For Developers</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2026 DevBoard By Ngo Huu Thuan. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              {[
                { label: 'Twitter', href: '#' },
                { label: 'GitHub', href: 'https://github.com/Nhthuando' },
                { label: 'LinkedIn', href: '#' },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground text-sm"
                  target={social.label === 'GitHub' ? '_blank' : undefined}
                  rel={social.label === 'GitHub' ? 'noreferrer' : undefined}
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
