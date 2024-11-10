'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import AOS from 'aos';

// Import team images
import nour from '@/app/assets/nour chokri.jpg';
import hazem from '@/app/assets/hazem mbarek.jpg';
import aalaedine from '@/app/assets/aalaedine kamoun.jpg';
import mohamedAziz from '@/app/assets/mohamed aziz masmoudi.jpg';
import douaa from '@/app/assets/douaa boudokhane.jpg';
import ranim from '@/app/assets/ranim ammar.png';

// Import hero section images
import Image1 from '@/app/assets/1.jpeg';
import Image2 from '@/app/assets/2.jpg';
import Image3 from '@/app/assets/3.jpg';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-in-out',
        disable: 'mobile'
      });
    }
  }, []);

  const testimonials = [
    {
      text: "The platform made it incredibly easy to find flexible work that fits my schedule. I'm impressed with the quality of opportunities available.",
      name: "Sarah Johnson",
      role: "Student",
      image: "/assets/douaa boudokhane.jpg"
    },
    {
      text: "As an employer, I've found amazing talent through this platform. The process is streamlined and efficient.",
      name: "Michael Chen",
      role: "Business Owner",
      image: "/assets/nour chokri.jpg"
    },
    {
      text: "The support team is exceptional, and the platform's features make job hunting a breeze. Highly recommended!",
      name: "Emma Davis",
      role: "Freelancer",
      image: "/assets/mohamed aziz masmoudi.jpg"
    }
  ];

  const teamMembers = [
    {
      name: "Nour Chokri",
      role: "CEO & Founder",
      image: nour,
      socials: {
        linkedin: "#",
        github: "#",
        email: "#"
      }
    },
    {
      name: "Hazem Mbarek",
      role: "CTO",
      image: hazem,
      socials: {
        linkedin: "#",
        github: "#",
        email: "#"
      }
    },
    {
      name: "Aalaedine Kamoun",
      role: "Lead Backend Developer",
      image: aalaedine,
      socials: {
        linkedin: "#",
        github: "#",
        email: "#"
      }
    },
    {
      name: "Mohamed Aziz Masmoudi",
      role: "Lead Frontend Developer",
      image: mohamedAziz,
      socials: {
        linkedin: "#",
        github: "#",
        email: "#"
      }
    },
    {
      name: "Douaa Boudokhane",
      role: "UI/UX Designer",
      image: douaa,
      socials: {
        linkedin: "#",
        github: "#",
        email: "#"
      }
    },
    {
      name: "Ranim Ammar",
      role: "Product Manager",
      image: ranim,
      socials: {
        linkedin: "#",
        github: "#",
        email: "#"
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-shrink-0">
      {/* Hero Section */}
      <section className="min-vh-100 d-flex align-items-center position-relative" data-aos="fade-up">
        <div className="hero-slider" style={{ height: '100vh', width: '100%', position: 'absolute', top: 0, left: 0 }}>
          <Image
            src={Image1}
            alt="Hero Image"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="overlay position-absolute w-100 h-100" 
               style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
        </div>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="text-center text-white">
            <h1 className="display-3 fw-bold mb-4">Find Your Perfect Part-Time Job</h1>
            <p className="lead fs-4 mb-5">Connect with opportunities that match your schedule and skills</p>
            <a href="/job" className="btn btn-lg" 
               style={{ backgroundColor: '#20B2AA', color: 'white', padding: '15px 30px' }}>
              Browse Jobs
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-vh-100 d-flex align-items-center py-5" data-aos="fade-up">
        <div className="container">
          <h2 className="text-center display-4 mb-5">Our Features</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="card h-100 border-0 shadow-sm p-4">
                <div className="card-body text-center">
                  <i className="bi bi-search display-4 mb-4" style={{ color: '#20B2AA' }}></i>
                  <h3 className="h4 mb-3">Find Jobs</h3>
                  <p className="text-muted">Discover perfect part-time opportunities tailored to your skills and schedule.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div className="card h-100 border-0 shadow-sm p-4">
                <div className="card-body text-center">
                  <i className="bi bi-people display-4 mb-4" style={{ color: '#20B2AA' }}></i>
                  <h3 className="h4 mb-3">Connect</h3>
                  <p className="text-muted">Connect directly with employers and build your professional network.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
              <div className="card h-100 border-0 shadow-sm p-4">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up display-4 mb-4" style={{ color: '#20B2AA' }}></i>
                  <h3 className="h4 mb-3">Grow</h3>
                  <p className="text-muted">Develop your skills and advance your career with flexible opportunities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="min-vh-100 d-flex align-items-center py-5 bg-light" data-aos="fade-up">
        <div className="container">
          <h2 className="text-center display-4 mb-5">What People Say</h2>
          <div className="position-relative">
            <div className="testimonials-slider">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`testimonial-item text-center ${index === currentSlide ? 'active' : ''}`}
                  style={{
                    opacity: index === currentSlide ? 1 : 0,
                    transform: `translateX(${(index - currentSlide) * 100}%)`,
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <div className="stars mb-4">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="bi bi-star-fill text-warning"></i>
                    ))}
                  </div>
                  <p className="testimonial-text mb-4 px-md-5">{testimonial.text}</p>
                  <h5 className="mb-1">{testimonial.name}</h5>
                  <p className="text-muted mb-0">{testimonial.role}</p>
                </div>
              ))}
            </div>
            <div className="testimonial-dots d-flex justify-content-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="min-vh-100 d-flex align-items-center py-5" data-aos="fade-up">
        <div className="container">
          <h2 className="text-center display-4 mb-5">Our Team</h2>
          <div className="row g-4">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="col-lg-4 col-md-6" 
                data-aos="fade-up" 
                data-aos-delay={100 * (index + 1)}
              >
                <div className="card team-card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="team-img-wrapper mb-4">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={200}
                        height={200}
                        className="rounded-circle img-fluid"
                        style={{ 
                          objectFit: 'cover',
                          border: '4px solid #fff',
                          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </div>
                    <h5 className="card-title mb-1">{member.name}</h5>
                    <p className="text-muted mb-3">{member.role}</p>
                    <div className="social-links">
                      <a href={member.socials.linkedin} className="mx-2" style={{ color: '#20B2AA' }}>
                        <i className="bi bi-linkedin"></i>
                      </a>
                      <a href={member.socials.github} className="mx-2" style={{ color: '#20B2AA' }}>
                        <i className="bi bi-github"></i>
                      </a>
                      <a href={member.socials.email} className="mx-2" style={{ color: '#20B2AA' }}>
                        <i className="bi bi-envelope"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}