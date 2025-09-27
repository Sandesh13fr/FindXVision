import React from 'react';
import { Search, Shield, Users, MapPin, Zap, CheckCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Home/Hero';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'AI-Powered Case Management',
      description: 'Advanced algorithms help organize and track cases with intelligent pattern recognition and automated updates.',
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Interactive Map Coordination',
      description: 'Visualize last-seen locations, track sightings, and coordinate field teams in real time.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Military-Grade Security',
      description: 'End-to-end encryption and role-based access keep family data protected and compliant.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Network',
      description: 'Verified volunteers, NGOs, and law enforcement collaborate securely in one workspace.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-Time Intelligence',
      description: 'Instant notifications, live updates, and AI-assisted lead prioritization for faster outcomes.',
    },
  ];

  const steps = [
    { title: 'Report & Document', description: 'Secure case creation with smart forms' },
    { title: 'Visualize & Analyze', description: 'AI-powered mapping and pattern detection' },
    { title: 'Mobilize Community', description: 'Verified volunteer network activation' },
    { title: 'Reunite Families', description: 'Coordinated resolution and support' },
  ];

  const comparisons = [
    { traditional: 'Paper-based tracking', modern: 'AI-powered digital workflows' },
    { traditional: 'Limited communication', modern: 'Real-time global network' },
    { traditional: 'Basic documentation', modern: 'Advanced analytics & insights' },
    { traditional: 'Reactive approach', modern: 'Predictive intelligence system' },
  ];

  return (
    <div className="bg-gray-50 text-gray-900">
      <Hero />

      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-emerald-600 font-semibold mb-3">Platform Highlights</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Everything teams need to move fast</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built for responders, volunteers, and families working together to locate missing people.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-emerald-100 bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 p-8"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-emerald-200 font-semibold mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">A coordinated response in four steps</h2>
            <p className="text-lg text-emerald-100 max-w-3xl mx-auto">
              From intake to resolution, FindXVision keeps everyone informed and aligned.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center bg-white/5 rounded-3xl px-6 py-10 backdrop-blur">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-emerald-500 text-white text-2xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-emerald-100 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-emerald-600 font-semibold mb-3">Why FindXVision</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Modern response versus legacy methods</h2>
            <p className="text-lg text-gray-600">Upgrade from reactive and manual to proactive and intelligent.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 px-6 md:px-10 py-10">
            <div className="space-y-6">
              {comparisons.map((item) => (
                <div key={item.modern} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1 text-gray-400 line-through">{item.traditional}</div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    {item.modern}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white" id="cta">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-emerald-100 shadow-xl px-8 py-16 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
            <div className="flex justify-center mb-6 text-emerald-500">
              <Star className="w-16 h-16" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Every second counts</h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Join families, investigators, and volunteers using FindXVision to coordinate faster searches and reunite loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/report')}
                className="px-10 py-4 rounded-full bg-emerald-600 text-white text-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Create a report
              </button>
              <button
                onClick={() => navigate('/missing-persons')}
                className="px-10 py-4 rounded-full border border-emerald-200 text-emerald-700 text-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Browse active cases
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 px-6 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-3xl font-bold text-white mb-6">FindXVision</div>
          <p className="text-sm">© 2025 FindXVision. Reuniting families with technology and community.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;