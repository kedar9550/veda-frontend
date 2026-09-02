import React, { useState, useEffect, useRef } from 'react';
import './ChatbotWidget.css';

const faqData = {
  "Event Details": [
    {
      question: "What is the event about?",
      answer: "The event is a showcase of student projects and achievements throughout the year. It includes exhibitions, presentations, and interactive sessions along with games."
    },
    {
      question: "When and where is the event taking place?",
      answer: "The event will be held on September 11, 2k26, at the Aditya University from 10 AM to 5 PM."
    },
    {
      question: "Can I participate if I am not a student at this university/college?",
      answer: "Yes, the event is open to all public/students/professionals regardless of affiliation with Aditya University."
    }
  ],
  "Registration": [
    {
      question: "How do I Sign Up for the event?",
      answer: "You can Sign Up for the event online through our registration portal on the college website. Registration will be open until March 10, 2024."
    },
    {
      question: "Is there a registration fee?",
      answer: "Yes, registration for the event is according to the particular event. However, early registration is recommended to secure your spot."
    },
    {
      question: "Can I Sign Up on the day of the event?",
      answer: "On-the-day registration is subject to availability. We recommend Sign Up in advance to ensure your participation and receive all event materials."
    }
  ],
  "Miscellaneous": [
    {
      question: "What should I bring to the event?",
      answer: "Please bring your student ID for check-in and any materials you need for the interactive sessions you plan to participate in."
    },
    {
      question: "Will there be any food available?",
      answer: "Yes, refreshments and snacks will be provided throughout the event. There will also be a lunch break with a variety of options."
    }
  ],
  "Follow Up": [
    {
      question: "How can I provide feedback about the event?",
      answer: "Feedback forms will be available at the event, and an online survey will be sent out after the event. Your feedback is important to us."
    },
    {
      question: "Will the event be recorded?",
      answer: "Yes, the event will be recorded and highlights will be available on the college website and social media channels after the event."
    },
    {
      question: "What if I have a question that isn't answered here?",
      answer: "If your question isn't answered in this FAQ, please reach out to us directly. We'll be glad to provide the information you need."
    }
  ]
};

// Flatten for search
const flatFaqData = Object.values(faqData).flat();

const mainOptions = [
  { label: 'Search Event', type: 'action' },
  { label: 'Get Participant Pass', type: 'action' },
  { label: 'Get Team Info', type: 'action' },
  ...Object.keys(faqData).map(k => ({ label: k, type: 'category' }))
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: (
        <div style={{ lineHeight: '1.6', padding: '4px' }}>
          <strong className="chat-welcome-title" style={{ fontSize: '1.1em', display: 'block', marginBottom: '8px' }}>👋 Welcome to VEDA 2k26!</strong>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.95em' }}>I'm your AI Assistant. I can help you with Event info, Passes, and Teams.</p>
          <p className="chat-welcome-subtitle" style={{ margin: 0, fontSize: '0.9em', fontStyle: 'italic' }}>Please select a category below or type your question!</p>
        </div>
      ),
      options: mainOptions,
      optionType: 'mixed'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const messagesEndRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  const scrollToBottom = () => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Pre-fetch events for quick matching
  useEffect(() => {
    fetch(`${baseUrl}/api/events`)
      .then(res => res.json())
      .then(data => {
        if (data && data.events) {
          setAllEvents(data.events);
        }
      })
      .catch(err => console.error("Could not preload events:", err));
  }, [baseUrl]);

  const toggleChat = () => setIsOpen(!isOpen);

  const findBestAnswer = (query) => {
    const q = query.toLowerCase();

    let bestMatch = null;
    let maxMatches = 0;

    flatFaqData.forEach(item => {
      const qWords = item.question.toLowerCase().split(/\s+/);
      let matchCount = 0;
      qWords.forEach(word => {
        if (word.length > 3 && q.includes(word)) {
          matchCount++;
        }
      });
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = item.answer;
      }
    });

    if (bestMatch && maxMatches > 0) {
      return bestMatch;
    }

    return "I couldn't find a specific answer to that. Please use the contact form to reach out to us directly.";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInputText('');

    // Add a typing indicator
    const typingId = Date.now();
    setMessages(prev => [...prev, { id: typingId, type: 'bot', text: "Thinking..." }]);

    const removeTyping = () => {
      setMessages(prev => prev.filter(m => m.id !== typingId));
    };

    try {
      const msgLower = userMsg.toLowerCase();

      // 1. Team ID Check (starts with VEDA-, VD26-, or contains team)
      const teamMatch = userMsg.match(/(VEDA-[A-Za-z0-9-]+|VD[0-9]{2}-[A-Za-z0-9-]+)/i);
      if (teamMatch || msgLower.includes("team id")) {
        let teamId = teamMatch ? teamMatch[0] : userMsg.trim();
        const res = await fetch(`${baseUrl}/api/razorpay/registrations?teamId=${encodeURIComponent(teamId)}`);
        const data = await res.json();

        removeTyping();
        if (data.payments && data.payments.length > 0) {
          setMessages(prev => [...prev, { type: 'bot-team-card', data: data.payments[0], options: ["Main Menu"], optionType: 'menu' }]);
          return;
        } else if (teamMatch) {
          setMessages(prev => [...prev, { type: 'bot', text: `Sorry, I couldn't find any team with ID ${teamId}.`, options: ["Main Menu"], optionType: 'menu' }]);
          return;
        }
      }

      // 2. Roll Number / Pass check
      // A roll number/ID should be 6-25 characters, alphanumeric with optional hyphens, and MUST contain at least one digit
      const rollMatch = userMsg.match(/\b(?=.*\d)([a-zA-Z0-9\-]{6,25})\b/);
      if (rollMatch || msgLower.includes("pass")) {
        // Try to extract roll number
        let rollNo = rollMatch ? rollMatch[1] : userMsg.replace(/[^a-zA-Z0-9\-]/g, '');
        if (rollNo && rollNo.length >= 6) {
          const res = await fetch(`${baseUrl}/api/razorpay/registrations?roll=${encodeURIComponent(rollNo)}`);
          const data = await res.json();

          removeTyping();
          if (data.payments && data.payments.length > 0) {
            setMessages(prev => [...prev, { type: 'bot-pass-card', data: data.payments[0], rollNo, options: ["Main Menu"], optionType: 'menu' }]);
            return;
          } else {
            setMessages(prev => [...prev, { type: 'bot', text: `Sorry, I couldn't find a pass for roll number ${rollNo}.`, options: ["Main Menu"], optionType: 'menu' }]);
            return;
          }
        }
      }

      // 3. Event Query check
      if (allEvents.length > 0) {
        // Sort by length descending to avoid partial matches
        const sortedEvents = [...allEvents].sort((a, b) => {
          const lenA = a.eventName ? a.eventName.length : 0;
          const lenB = b.eventName ? b.eventName.length : 0;
          return lenB - lenA;
        });

        const levenshtein = (a, b) => {
          if (a.length === 0) return b.length;
          if (b.length === 0) return a.length;
          const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
          for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
          for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
          for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
              const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
              matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
              );
            }
          }
          return matrix[b.length][a.length];
        };

        const msgWords = msgLower.split(/[\s,.-]+/);

        // Find if any event name is mentioned in the query
        const matchedEvent = sortedEvents.find(ev => {
          if (!ev.eventName) return false;
          const evName = ev.eventName.toLowerCase().trim();
          if (msgLower.includes(evName)) return true;

          const evWords = evName.split(/[\s,.-]+/);
          let matchedAll = true;
          for (const ew of evWords) {
            let wordMatched = false;
            for (const mw of msgWords) {
              if (ew === mw) { wordMatched = true; break; }
              if (ew.length >= 4 && mw.length >= 4 && Math.abs(ew.length - mw.length) <= 1) {
                const d = levenshtein(ew, mw);
                if (d <= 1 || (ew.length >= 6 && d <= 2)) {
                  wordMatched = true; break;
                }
              }
            }
            if (!wordMatched) { matchedAll = false; break; }
          }
          return matchedAll;
        });

        if (matchedEvent) {
          removeTyping();
          if (msgLower.includes("venue") || msgLower.includes("where")) {
            setMessages(prev => [...prev, {
              type: 'bot',
              text: `The venue for **${matchedEvent.eventName}** is **${matchedEvent.venue || "Main Campus"}**.`,
              options: ["Main Menu"],
              optionType: 'menu'
            }]);
            return;
          } else {
            setMessages(prev => [...prev, { type: 'bot-event-card', data: matchedEvent, options: ["Main Menu"], optionType: 'menu' }]);
            return;
          }
        }
      }

      // 4. Fallback to FAQ
      removeTyping();
      setTimeout(() => {
        const answer = findBestAnswer(userMsg);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: answer,
          options: ["Main Menu"],
          optionType: 'menu'
        }]);
      }, 300);

    } catch (err) {
      console.error(err);
      removeTyping();
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I had trouble fetching that information. Please try again." }]);
    }
  };

  const handleOptionClick = (option, type, originalMessageIndex) => {
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: option }]);

    // Remove options from the original message so they aren't clickable twice
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[originalMessageIndex]) {
        newMsgs[originalMessageIndex] = { ...newMsgs[originalMessageIndex], options: null };
      }
      return newMsgs;
    });

    setTimeout(() => {
      if (type === 'action') {
        if (option === 'Search Event') {
          setMessages(prev => [...prev, { type: 'bot', text: 'Please type any event name (e.g., CODE CHAMP) to see its details.' }]);
        } else if (option === 'Get Participant Pass') {
          setMessages(prev => [...prev, { type: 'bot', text: 'Please enter your Roll Number to retrieve your pass.' }]);
        } else if (option === 'Get Team Info') {
          setMessages(prev => [...prev, { type: 'bot', text: 'Please enter your Team ID to view your team information.' }]);
        }
      } else if (type === 'category') {
        const questions = faqData[option].map(item => item.question);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `Here are some questions about ${option}:`,
          options: [...questions, "Main Menu"],
          optionType: 'question'
        }]);
      } else if (type === 'question' && option === "Main Menu") {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "Which topic do you have questions about?",
          options: mainOptions,
          optionType: 'mixed'
        }]);
      } else if (type === 'menu' && option === "Main Menu") {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "Which topic do you have questions about?",
          options: mainOptions,
          optionType: 'mixed'
        }]);
      } else if (type === 'question') {
        const found = flatFaqData.find(q => q.question === option);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: found ? found.answer : "Sorry, I couldn't find that.",
          options: ["Main Menu"],
          optionType: 'menu'
        }]);
      }
    }, 600);
  };

  // Custom Renderers for dynamic cards
  const renderPassCard = (msg) => {
    const p = msg.data;
    const participant = p.participants.find(pt => pt.roll?.toLowerCase() === msg.rollNo?.toLowerCase()) || p.participants[0];

    return (
      <div className="dynamic-bot-card pass-card">
        <div className="pass-header">
          <i className="bi bi-ticket-detailed-fill"></i> Event Pass
        </div>
        <div className="pass-body">
          <h4>{p.eventName}</h4>
          <div className="pass-detail"><strong>Name:</strong> {participant?.name || 'N/A'}</div>
          <div className="pass-detail"><strong>Roll No:</strong> {participant?.roll?.toUpperCase() || 'N/A'}</div>
          <div className="pass-detail"><strong>Team ID:</strong> {p.teamId}</div>
          <div className="pass-detail"><strong>Payment:</strong> {p.paymentStatus}</div>
        </div>
      </div>
    );
  };

  const renderTeamCard = (msg) => {
    const p = msg.data;
    return (
      <div className="dynamic-bot-card team-card">
        <div className="team-header">
          <i className="bi bi-people-fill"></i> Team Details
        </div>
        <div className="team-body">
          <h4>Event: {p.eventName}</h4>
          <div className="team-meta"><strong>Team ID:</strong> <span className="highlight-id">{p.teamId}</span></div>
          <div className="team-meta"><strong>Status:</strong> {p.paymentStatus}</div>
          <h5>Participants:</h5>
          <ul className="participant-list">
            {p.participants && p.participants.map((pt, idx) => (
              <li key={idx}>
                <div className="pt-name">{pt.name}</div>
                <div className="pt-roll">{pt.roll}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderEventCard = (msg) => {
    const ev = msg.data;

    // Parse Venue
    let venueStr = 'Main Campus';
    if (ev.venueType === 'Indoor' && (ev.building || ev.floor)) {
      venueStr = `${ev.building?.name || ev.building || ''}${ev.floor?.name ? ` ${ev.floor.name}` : ''}${ev.roomNo ? `, Room: ${ev.roomNo}` : ''}`;
    } else if (ev.venueType === 'Outdoor' && ev.ground) {
      venueStr = ev.ground?.name || ev.ground || 'Outdoor Ground';
    } else if (ev.venue) {
      venueStr = ev.venue;
    }

    // Parse Faculty Coordinators
    const coordinators = ev.facultyCoordinators && ev.facultyCoordinators.length > 0
      ? ev.facultyCoordinators
      : (ev.facultyCoordinator && ev.facultyCoordinator.employeeName ? [ev.facultyCoordinator] : []);

    // Parse Date
    let dateStr = 'TBA';
    if (ev.startDate && ev.endDate) {
      const sDate = new Date(ev.startDate);
      const eDate = new Date(ev.endDate);
      if (!isNaN(sDate) && !isNaN(eDate)) {
        const sDay = sDate.getDate();
        const eDay = eDate.getDate();
        const sMonth = sDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        const eMonth = eDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        const sYear = sDate.getFullYear();
        const eYear = eDate.getFullYear();

        if (sMonth === eMonth && sYear === eYear) {
          dateStr = sDay === eDay ? `${sDay} ${sMonth}, ${sYear}` : `${sDay} - ${eDay} ${sMonth}, ${sYear}`;
        } else if (sYear === eYear) {
          dateStr = `${sDay} ${sMonth} - ${eDay} ${eMonth}, ${sYear}`;
        } else {
          dateStr = `${sDay} ${sMonth}, ${sYear} - ${eDay} ${eMonth}, ${eYear}`;
        }
      } else {
        dateStr = ev.startDate;
      }
    } else if (ev.date || ev.startDate) {
      const d = new Date(ev.date || ev.startDate);
      if (!isNaN(d)) {
        dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' }).toUpperCase()}, ${d.getFullYear()}`;
      } else {
        dateStr = ev.date || ev.startDate;
      }
    }

    return (
      <div className="dynamic-bot-card event-card">
        <div className="event-header">
          <i className="bi bi-calendar-event-fill"></i> Event Details
        </div>
        <div className="event-body">
          <h4>{ev.eventName}</h4>
          <div className="ev-desc">{ev.overview || ev.description || 'Join us for this exciting event!'}</div>

          <div className="ev-info-grid">
            <div className="ev-info-item">
              <i className="bi bi-currency-rupee"></i>
              <span><strong>Cost:</strong> {ev.price ? `₹${ev.price}` : 'Free'}</span>
            </div>
            <div className="ev-info-item">
              <i className="bi bi-people"></i>
              <span><strong>Max Team Size:</strong> {ev.maxTeamSize || 1}</span>
            </div>
            <div className="ev-info-item">
              <i className="bi bi-geo-alt"></i>
              <span>{venueStr}</span>
            </div>
            <div className="ev-info-item">
              <i className={dateStr !== 'TBA' ? "bi bi-calendar3" : "bi bi-clock"}></i>
              <span>{dateStr}</span>
            </div>
          </div>

          {coordinators.length > 0 && (
            <div className="ev-faculty">
              <h5>Faculty Coordinators:</h5>
              <ul>
                {coordinators.map((fc, i) => {
                  const contact = fc.phone || fc.mobile || fc.mobileNumber;
                  return (
                    <li key={i} style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{fc.employeeName || fc.name}</span>
                      {contact && (
                        <span className="ev-faculty-contact" style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <i className="bi bi-telephone-fill"></i> {contact}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chatbot-wrapper">
      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/AI-Assist.webp" alt="AI Assist" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
            VEDA Assistant
          </div>
          <button className="chatbot-close" onClick={toggleChat}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message-group">
              <div className={`chat-message ${msg.type}`}>
                {msg.type.includes('bot-pass-card') && renderPassCard(msg)}
                {msg.type.includes('bot-team-card') && renderTeamCard(msg)}
                {msg.type.includes('bot-event-card') && renderEventCard(msg)}

                {!msg.type.includes('card') && (
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                )}
              </div>
              {msg.options && (
                <div className="chat-chips-container">
                  {msg.options.map((opt, idx) => {
                    const label = typeof opt === 'string' ? opt : opt.label;
                    const optType = typeof opt === 'string' ? msg.optionType : opt.type;
                    return (
                      <button
                        key={idx}
                        className="chat-chip"
                        onClick={() => handleOptionClick(label, optType, index)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={!inputText.trim()}>
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>

      {/* Floating Action Button */}
      <button className={`chatbot-fab ${isOpen ? 'hidden' : ''}`} onClick={toggleChat}>
        <img src="/AI-Assist.webp" alt="AI Assist Icon" className="chatbot-icon-img" />
      </button>
    </div>
  );
}
