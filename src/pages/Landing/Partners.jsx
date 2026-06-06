import React from 'react';
import MarketingLayout from './MarketingLayout';
import { FiArrowRight, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import "./Landing.css";

const PARTNERS = [
  { name: "Meta Business", desc: "Official WhatsApp & Facebook Ads Integrations", logo: "Ⓜ️", category: "Official" },
  { name: "Stripe", desc: "Secure Global Payment Infrastructure", logo: "💳", category: "Payments" },
  { name: "Twilio", desc: "Cloud Communications & Messaging", logo: "📞", category: "Telecom" },
  { name: "Google Cloud", desc: "Scalable Infrastructure & AI Services", logo: "☁️", category: "Infrastructure" },
  { name: "HubSpot", desc: "CRM & Marketing Automation Sync", logo: "🧡", category: "CRM" },
  { name: "Zapier", desc: "Connect 5,000+ Apps Seamlessly", logo: "⚡", category: "Automation" },
  { name: "Shopify", desc: "E-commerce Integration & Notifications", logo: "🛍️", category: "E-commerce" },
  { name: "Zendesk", desc: "Unified Customer Support Experience", logo: "🤝", category: "Support" },
];

export default function Partners({ onGoto }) {
  return (
    <MarketingLayout onGoto={onGoto} currentPath="/partners">
      <div className="ln">
        {/* Hero Section */}
        <section className="ln-hero ln-section">
          <div className="ln-hero-grain"></div>
          <div className="ln-container ln-hero-grid">
            <div className="ln-hero-copy">
              <div className="ln-hero-pill">OUR GLOBAL NETWORK</div>
              <h1>Empowering Growth Through <span className="ln-hero-hl">Strategic</span> Partnerships</h1>
              <p className="ln-hero-sub">
                Leadnator collaborates with industry leaders to provide a seamless, 
                AI-powered ecosystem for your business. Scale faster with our integrated solutions.
              </p>
              <div className="ln-hero-cta">
                <button className="ln-btn ln-btn-primary ln-btn-lg">Become a Partner</button>
                <button className="ln-btn ln-btn-outline ln-btn-lg">View API Docs</button>
              </div>
            </div>
            <div className="ln-partners-art-wrap">
              <div className="ln-partners-art">
                 <FiGlobe className="globe-icon" />
                 <div className="node node-1"></div>
                 <div className="node node-2"></div>
                 <div className="node node-3"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="ln-section ln-section-tint">
          <div className="ln-container">
            <div className="ln-head">
              <span className="ln-eyebrow">Enterprise Partners</span>
              <h2>Industry Leaders We Work With</h2>
              <p>Built on the world's most reliable platforms and services to ensure your success.</p>
            </div>

            <div className="ln-partners-grid">
              {PARTNERS.map((p, i) => (
                <div key={i} className="ln-partner-card">
                  <div className="ln-partner-badge">{p.category}</div>
                  <div className="ln-partner-logo">{p.logo}</div>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <a href="#" className="ln-link-arrow">
                    Learn more <FiArrowRight />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="ln-stats">
          <div className="ln-container ln-stats-grid">
            <div>
              <div className="ln-stat-value">500+</div>
              <div className="ln-stat-label">Verified Partners</div>
            </div>
            <div>
              <div className="ln-stat-value">99.9%</div>
              <div className="ln-stat-label">Integration Uptime</div>
            </div>
            <div>
              <div className="ln-stat-value">50M+</div>
              <div className="ln-stat-label">API Requests/Day</div>
            </div>
            <div>
              <div className="ln-stat-value">24/7</div>
              <div className="ln-stat-label">Partner Support</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="ln-cta ln-section">
          <div className="ln-container">
            <div className="ln-cta-card">
              <div className="ln-cta-copy">
                <h2>Ready to join our ecosystem?</h2>
                <p>Unlock new opportunities and drive innovation by partnering with Leadnator.</p>
                <ul className="ln-cta-list">
                  <li><FiCheckCircle /> Priority Technical Support</li>
                  <li><FiCheckCircle /> Co-Marketing Opportunities</li>
                  <li><FiCheckCircle /> Early Access to Beta Features</li>
                </ul>
              </div>
              <div className="ln-cta-actions">
                <button className="ln-btn ln-btn-yellow ln-btn-lg">Apply for Partnership</button>
                <div className="ln-cta-call">
                  Questions? <a href="/contact">Contact Partner Desk</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
