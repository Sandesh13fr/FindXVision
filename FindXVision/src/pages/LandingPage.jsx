import React from 'react';
import {
  Search,
  Shield,
  MapPin,
  ClipboardCheck,
  FileText,
  BarChart3,
  CheckCircle,
  Star,
  UserCheck,
  BellRing,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Home/Hero';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: 'Case Lifecycle Workspace',
      description:
        'Create, update, and resolve missing person cases with structured tabs for profiles, stakeholders, documents, and status.',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Evidence & Attachments Hub',
      description:
        'Upload images, notes, and official paperwork directly to each case so teams have every detail in one secure place.',
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Sightings & Location Intelligence',
      description:
        'Plot last-seen locations, track new sightings, and coordinate field teams with live mapping tools and geospatial context.',
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Lightning-Fast Search & Filters',
      description:
        'Surface relevant cases instantly with powerful query, filter, and sorting options tailored for investigators.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Role-Based Security Controls',
      description:
        'Granular permissions, audit logging, and privacy tooling ensure compliant collaboration across teams.',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Operational Dashboards',
      description:
        'Monitor performance with admin analytics covering case throughput, response times, and notification activity.',
    },
  ];

  const steps = [
    {
      title: 'Launch a Case Profile',
      description: 'Capture identities, timelines, and stakeholders with guided tabs and validation.',
    },
    {
      title: 'Centralize Evidence',
      description: 'Attach documents, photos, and notes so investigators share a single source of truth.',
    },
    {
      title: 'Track Sightings on Maps',
      description: 'Log new leads, update locations, and coordinate teams using live geospatial views.',
    },
    {
      title: 'Coordinate & Resolve',
      description: 'Trigger alerts, monitor dashboards, and close cases with full audit trails.',
    },
  ];

  const comparisons = [
    { traditional: 'Disconnected case files', modern: 'Unified workspace with audit-ready timelines' },
    { traditional: 'Manual evidence handoffs', modern: 'Centralized attachments and case notes' },
    { traditional: 'Guesswork on field activity', modern: 'Live sightings mapped with geospatial context' },
    { traditional: 'Delayed stakeholder updates', modern: 'Instant alerts and performance dashboards' },
  ];

  const profileHighlights = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: 'Trusted identity ledger',
      description:
        'Keep contact points and permissions synchronized so every alert reaches the right responders instantly.',
    },
    {
      icon: <BellRing className="w-6 h-6" />,
      title: 'Real-time notification control',
      description:
        'Tune SMS and email alerts to the teams and cases you follow, ensuring no critical update slips by.',
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: 'Security-first access',
      description:
        'Granular roles and audit trails mean your mission data stays protected while collaboration stays rapid.',
    },
  ];

  return (
    <div className="min-h-screen text-[var(--fx-text-primary)]">
      <Hero />

      <section
        id="features"
        className="py-20 px-6 fx-seamless-section"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--fx-accent)] font-semibold mb-3">
              Platform Highlights
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything teams need to move fast</h2>
            <p className="text-lg text-[var(--fx-text-secondary)] max-w-3xl mx-auto">
              Built for responders, volunteers, and families working together to locate missing people.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl fx-glass-card shadow-[0_24px_64px_rgba(0,0,0,0.35)] hover:shadow-[0_28px_72px_rgba(255,152,0,0.15)] transition-all duration-300 p-8"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(255,152,0,0.15)] text-[var(--fx-accent)] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[var(--fx-text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-20 px-6 fx-seamless-section"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--fx-accent)] font-semibold mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">A coordinated response in four steps</h2>
            <p className="text-lg text-[var(--fx-text-secondary)] max-w-3xl mx-auto">
              From intake to resolution, FindXVision keeps everyone informed and aligned.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="text-center fx-glass-card rounded-3xl px-6 py-10"
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[var(--fx-accent)] text-[#1d1d1d] text-2xl font-bold shadow-[0_0_24px_rgba(255,152,0,0.4)]">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-[var(--fx-text-secondary)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="profile" className="py-20 px-6 fx-seamless-section">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--fx-accent)] font-semibold">
              Profile Command Center
            </p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Your mission identity, orchestrated in one hub
            </h2>
            <p className="text-lg text-[var(--fx-text-secondary)] leading-relaxed">
              The new profile workspace keeps your personal details, notification channels, and case roles in sync.
              Switch between reporting, searching, and coordinating without losing context or visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="px-8 py-4 border border-white/20 bg-[rgba(255,152,0,0.12)] text-[#121212] text-sm font-semibold uppercase tracking-[0.35em] hover:bg-[rgba(255,152,0,0.2)] transition-colors"
              >
                View my profile
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 border border-white/20 text-[var(--fx-text-primary)] text-sm font-semibold uppercase tracking-[0.35em] hover:bg-white/10 transition-colors"
              >
                Create account
              </button>
            </div>
          </div>
          <div className="grid gap-6">
            {profileHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="fx-glass-card rounded-3xl p-6 flex items-start gap-4 shadow-[0_20px_64px_rgba(0,0,0,0.35)]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[rgba(255,152,0,0.15)] text-[var(--fx-accent)] flex items-center justify-center">
                  {highlight.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-[var(--fx-text-secondary)] leading-relaxed">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 fx-seamless-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--fx-accent)] font-semibold mb-3">
              Why FindXVision
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Modern response versus legacy methods</h2>
            <p className="text-lg text-[var(--fx-text-secondary)]">
              Upgrade from reactive and manual to proactive and intelligent.
            </p>
          </div>

          <div className="fx-glass-card rounded-3xl shadow-[0_28px_72px_rgba(0,0,0,0.35)] px-6 md:px-10 py-10">
            <div className="space-y-6">
              {comparisons.map((item) => (
                <div
                  key={item.modern}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-b border-white/10 last:border-b-0"
                >
                  <div className="flex-1 text-white/40 line-through">{item.traditional}</div>
                  <div className="flex items-center gap-2 text-[var(--fx-accent)] font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    {item.modern}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 fx-seamless-section" id="cta">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl fx-glass-card shadow-[0_32px_96px_rgba(0,0,0,0.45)] px-8 py-16 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,var(--fx-accent)_0%,transparent_55%)] pointer-events-none" />
            <div className="relative flex justify-center mb-6 text-[var(--fx-accent)]">
              <Star className="w-16 h-16" />
            </div>
            <h2 className="relative text-4xl md:text-5xl font-bold mb-4">Turn intelligence into action</h2>
            <p className="relative text-lg text-[var(--fx-text-secondary)] mb-10 max-w-2xl mx-auto">
              Activate the FindXVision command center to launch new cases, monitor live sightings, and rally every stakeholder the moment a lead appears.
            </p>
            <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/report')}
                className="px-10 py-4 border border-white/30 bg-[#212121] text-[#121212] text-lg font-semibold uppercase tracking-[0.3em] hover:bg-white/10  transition-colors"
              >
                Open a case
              </button>
              <button
                onClick={() => navigate('/missing-persons')}
                className="px-10 py-4 border border-white/30 text-[var(--fx-text-primary)] text-lg font-semibold uppercase tracking-[0.3em] hover:bg-white/10 transition-colors"
              >
                View active operations
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 text-[var(--fx-text-secondary)] fx-seamless-section ">
        <div className="max-w-6xl mx-auto text-center">
          
          <div className="text-center flex flex-row items-center justify-center">
            <img
              src="/logo.png"
              alt="FindXVision Logo"
              className=" w-30 h-auto rounded-lg shadow-md "
            />
            <div className="text-3xl font-bold text-[var(--fx-text-primary)] ">FindXVision</div>
          </div>
          
          <p className="text-sm">© 2025 FindXVision. Reuniting families with technology and community.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;