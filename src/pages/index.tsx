import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    icon: '💻',
    name: 'Technology',
    desc: 'DevOps, Architecture, Programming & System Design',
    href: '/Technology/',
    color: '#2563eb',
  },
  {
    icon: '🤖',
    name: 'Artificial Intelligence',
    desc: 'Machine Learning, Deep Learning & AI Research',
    href: '/Artificial Intelligence/',
    color: '#7c3aed',
  },
  {
    icon: '💰',
    name: 'Finance',
    desc: 'Investment strategies, Banking & Financial planning',
    href: '/Finance/',
    color: '#059669',
  },
  {
    icon: '🚀',
    name: 'Personal Development',
    desc: 'Self-improvement, Career growth & Soft skills',
    href: '/Personal-Development/',
    color: '#d97706',
  },
];

const FEATURED_NOTES = [
  {
    tag: '💻 Technology',
    title: 'System Design Fundamentals',
    excerpt: 'Core patterns for designing scalable distributed systems — load balancing, caching, and database sharding explained.',
    href: '/Technology/',
  },
  {
    tag: '🤖 AI',
    title: 'Getting Started with LLMs',
    excerpt: 'A practical guide to understanding large language models, prompt engineering, and building AI-powered applications.',
    href: '/Artificial Intelligence/',
  },
  {
    tag: '💰 Finance',
    title: 'Index Fund Investing',
    excerpt: 'Why passive index investing beats active management for most long-term investors, and how to get started.',
    href: '/Finance/',
  },
];

// ── Components ────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-eyebrow">
        <span>🧠</span>
        <span>Personal Knowledge Base</span>
      </div>
      <h1 className="hero-title">
        A second brain for<br />
        <em>continuous learning</em>
      </h1>
      <p className="hero-subtitle">
        Curated notes on technology, AI, finance, and personal growth.
        Built for reference, designed for depth.
      </p>
      <div className="hero-actions">
        <Link className="btn-primary" to="/Technology/">
          Start Exploring →
        </Link>
        <Link className="btn-secondary" to="/tags">
          🏷️ Browse by Tag
        </Link>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <div className="stats-bar">
      {[
        { number: '4', label: 'Knowledge Areas' },
        { number: '∞', label: 'Curiosity' },
        { number: '↑', label: 'Always Growing' },
      ].map((s) => (
        <div className="stat-item" key={s.label}>
          <span className="stat-number">{s.number}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function Categories() {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">// Knowledge Areas</span>
        <h2 className="section-title">What's inside</h2>
      </div>
      <div className="categories-grid">
        {CATEGORIES.map((cat) => (
          <Link key={cat.name} className="category-card" to={cat.href}>
            <span className="category-icon">{cat.icon}</span>
            <h3 className="category-name">{cat.name}</h3>
            <p className="category-desc">{cat.desc}</p>
            <span className="category-arrow">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedNotes() {
  return (
    <section className="recent-section">
      <div className="recent-inner">
        <div className="section-header">
          <span className="section-label">// Featured Notes</span>
          <h2 className="section-title">Start here</h2>
        </div>
        <div className="recent-grid">
          {FEATURED_NOTES.map((note) => (
            <Link key={note.title} className="note-card" to={note.href}>
              <span className="note-tag">{note.tag}</span>
              <h3 className="note-title">{note.title}</h3>
              <p className="note-excerpt">{note.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhilosophyStrip() {
  return (
    <section className="philosophy-strip">
      <p className="philosophy-quote">
        "The mind is not a vessel to be filled, but a fire to be kindled."
      </p>
      <span className="philosophy-author">— Plutarch</span>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="A personal knowledge base for continuous learning across technology, AI, finance, and personal development."
    >
      <Head>
        <meta property="og:title" content="The Second Brain — DK Brain Hub" />
        <meta property="og:description" content="A personal knowledge base for continuous learning." />
      </Head>
      <main>
        <Hero />
        <StatsBar />
        <Categories />
        <FeaturedNotes />
        <PhilosophyStrip />
      </main>
    </Layout>
  );
}
