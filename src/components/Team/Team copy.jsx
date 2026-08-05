import React from 'react';

const ROW_1_TESTIMONIALS = [
  {
    id: 1,
    quote: "Aditya University's deep connection with tech leaders gave me the edge. The robotics lab provided exactly the production-grade exposure I needed to join Microsoft.",
    name: "Siddharth Verma",
    meta: "SDE-2 at ",
    company: "Microsoft",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
  },
  {
    id: 2,
    quote: "The business management track challenges you to build real ventures. I incubated my agri-tech startup directly on campus with professional mentorship.",
    name: "Ananya Roy",
    meta: "Founder of ",
    company: "GreenRoots",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
  },
  {
    id: 3,
    quote: "PCI approved laboratory work and direct hospital residencies helped me bridge the gap between pharmacology and real medical systems. Highly recommended.",
    name: "Dr. Kabir Malhotra",
    meta: "Lead Researcher at ",
    company: "Pfizer Labs",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
  },
  {
    id: 4,
    quote: "Fascinating curriculum! Combining Data Science theories with real financial analytics projects prepared me perfectly for high-frequency trading firms.",
    name: "Meera Nair",
    meta: "Quantitative Analyst at ",
    company: "Goldman Sachs",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
  },
];

const ROW_2_TESTIMONIALS = [
  {
    id: 5,
    quote: "The IoT labs and smart greenhouses on campus opened my eyes to agricultural automation. The hands-on drone mapping was absolutely elite.",
    name: "Rahul Kulkarni",
    meta: "Smart Ag Specialist at ",
    company: "Deere & Co",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop",
  },
  {
    id: 6,
    quote: "Securing an international exchange in Europe was the highlight of my BBA. It completely redefined my view on global distribution channels.",
    name: "Priyanka Sen",
    meta: "Global Supply Lead at ",
    company: "Amazon Berlin",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
  },
  {
    id: 7,
    quote: "Outstanding mentorship. Professors didn't just teach from slides; they actively helped me submit and file my first research patent.",
    name: "Aditya Hegde",
    meta: "AI Scientist at ",
    company: "OpenAI",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop",
  },
  {
    id: 8,
    quote: "The hackathon culture is electric! Competing in national levels alongside peers taught me more about scrum and agile development than anything else.",
    name: "Shruti Das",
    meta: "Frontend Engineer at ",
    company: "Vercel",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
  },
];

export default function Team() {
  // Helper to double content for seamless sliding marquee
  const doubleList = (list) => [...list, ...list];

  return (
    <section className="testimonials-section">
      <div className="container-premium text-center">
        <span className="testimonials-header-tag">Event Leadership</span>
        <h2 className="testimonials-title text-gradient">
          Meet Our Event Coordinators
        </h2>
      </div>

      <div className="marquee-container">
        
        {/* Row 1: Leftward scrolling track */}
        <div className="marquee-track track-left">
          {doubleList(ROW_1_TESTIMONIALS).map((item, index) => (
            <div key={`${item.id}-${index}`} className="testimonial-card">
              <p className="testimonial-content">"{item.quote}"</p>
              <div className="testimonial-user">
                <img
                  className="testimonial-avatar"
                  src={item.avatar}
                  alt={item.name}
                  loading="lazy"
                />
                <div>
                  <h4 className="testimonial-user-name">{item.name}</h4>
                  <p className="testimonial-user-meta">
                    {item.meta}
                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                      {item.company}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Rightward scrolling track */}
        <div className="marquee-track track-right">
          {doubleList(ROW_2_TESTIMONIALS).map((item, index) => (
            <div key={`${item.id}-${index}`} className="testimonial-card">
              <p className="testimonial-content">"{item.quote}"</p>
              <div className="testimonial-user">
                <img
                  className="testimonial-avatar"
                  src={item.avatar}
                  alt={item.name}
                  loading="lazy"
                />
                <div>
                  <h4 className="testimonial-user-name">{item.name}</h4>
                  <p className="testimonial-user-meta">
                    {item.meta}
                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                      {item.company}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
