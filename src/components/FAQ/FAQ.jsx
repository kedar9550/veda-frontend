import React, { useState } from 'react';
import './FAQ.css';

const faqData = {
  "Event Details": [
    {
      question: "What is the event about?",
      answer: "The event is a showcase of student projects and achievements throughout the year. It includes exhibitions, presentations, and interactive sessions along with games."
    },
    {
      question: "When and where is the event taking place?",
      answer: "The event will be held on September 15, 2024, at the Aditya University from 10 AM to 5 PM."
    },
    {
      question: "Can I participate if I am not a student at this university/college?",
      answer: "Yes, the event is open to all public/students/professionals regardless of affiliation with Aditya University."
    }
  ],
  "Registration": [
    {
      question: "How do I register for the event?",
      answer: "You can register for the event online through our registration portal on the college website. Registration will be open until March 10, 2024."
    },
    {
      question: "Is there a registration fee?",
      answer: "Yes, registration for the event is according to the particular event. However, early registration is recommended to secure your spot."
    },
    {
      question: "Can I register on the day of the event?",
      answer: "On-the-day registration is subject to availability. We recommend registering in advance to ensure your participation and receive all event materials."
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

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("Event Details");
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setOpenQuestionIndex(null); // Close any open questions when switching tabs
  };

  const toggleQuestion = (index) => {
    if (openQuestionIndex === index) {
      setOpenQuestionIndex(null);
    } else {
      setOpenQuestionIndex(index);
    }
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <p className="faq-subtitle">
        Below is a list of frequently asked questions and answers from partners and 3D artists. Please check this FAQ first before contacting us.
      </p>

      <div className="faq-categories">
        {Object.keys(faqData).map((category) => (
          <button
            key={category}
            className={`faq-category-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="faq-questions">
        {faqData[activeCategory].map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openQuestionIndex === index ? 'open' : ''}`}
            onClick={() => toggleQuestion(index)}
          >
            <div className="faq-question">
              <h4>{faq.question}</h4>
              <span className="faq-icon">
                {openQuestionIndex === index ? '−' : '+'}
              </span>
            </div>
            {openQuestionIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
