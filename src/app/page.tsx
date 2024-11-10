import React from 'react';
import Image from 'next/image';
import Image1 from '@/app/assets/1.jpeg';
import Image2 from '@/app/assets/2.jpg';
import Image3 from '@/app/assets/3.jpg';

export default function HomePage() {
  return (
    <main className="flex-shrink-0">
      {/* Hero Section with Image Slider */}
      <div className="position-relative" style={{ height: '600px' }}>
        <div className="hero-slider">
          <div className="slide">
            <Image
              src={Image1}
              alt="Career opportunities"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="slide">
            <Image
              src={Image2}
              alt="Work environment"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="slide">
            <Image
              src={Image3}
              alt="Office space"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="hero-content position-absolute top-50 start-50 translate-middle text-center text-white z-1">
            <h1 className="display-3 fw-bold mb-4">Start Your Career in Part-Time</h1>
            <p className="lead mb-4 fs-4">We are the people who connect dreams & opportunities.</p>
          </div>
        </div>
      </div>

      {/* Monthly Visitors Section */}
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Our Growing Community</h2>
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="visitor-counter text-center p-4 rounded-3 shadow-sm bg-white">
                <h3 className="display-1 text-primary mb-3">5,234</h3>
                <p className="lead">Monthly Active Users</p>
                <div className="progress mb-3" style={{ height: '10px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '75%' }}></div>
                </div>
                <p className="text-muted">75% increase from last month</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="achievements p-4">
                <div className="achievement-item mb-4">
                  <i className="bi bi-people-fill text-primary fs-1"></i>
                  <h4>Growing Network</h4>
                  <p>Join thousands of professionals finding their ideal part-time roles</p>
                </div>
                <div className="achievement-item">
                  <i className="bi bi-graph-up-arrow text-primary fs-1"></i>
                  <h4>Success Stories</h4>
                  <p>Over 1000+ successful job placements this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container py-5">
        <h2 className="text-center mb-5">What Our Clients Say</h2>
        <div className="row g-4">
          {[
            {
              name: 'Sarah Johnson',
              role: 'Web Developer',
              text: 'Found my dream part-time role through this platform. The process was smooth and efficient.',
              rating: 5
            },
            {
              name: 'Michael Chen',
              role: 'UI Designer',
              text: 'Great platform for finding flexible work arrangements. Highly recommended!',
              rating: 5
            },
            {
              name: 'Emma Davis',
              role: 'Marketing Specialist',
              text: 'The quality of job listings and employers on this platform is outstanding.',
              rating: 4
            }
          ].map((testimonial, index) => (
            <div key={index} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm testimonial-card">
                <div className="card-body">
                  <div className="mb-3">
                    {'★'.repeat(testimonial.rating)}
                    {'☆'.repeat(5 - testimonial.rating)}
                  </div>
                  <p className="card-text">{testimonial.text}</p>
                  <div className="d-flex align-items-center mt-3">
                    <div className="testimonial-avatar">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ms-3">
                      <h5 className="mb-0">{testimonial.name}</h5>
                      <small className="text-muted">{testimonial.role}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Meet Our Team</h2>
          <div className="row g-4">
            {[
              {
                name: 'John Doe',
                role: 'CEO & Founder',
                image: '/assets/team1.jpg'
              },
              {
                name: 'Jane Smith',
                role: 'Head of Operations',
                image: '/assets/team2.jpg'
              },
              {
                name: 'David Wilson',
                role: 'Lead Developer',
                image: '/assets/team3.jpg'
              }
            ].map((member, index) => (
              <div key={index} className="col-md-4">
                <div className="card border-0 shadow-sm team-card">
                  <div className="card-body text-center">
                    <div className="team-member-image mb-3">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={150}
                        height={150}
                        className="rounded-circle"
                      />
                    </div>
                    <h4>{member.name}</h4>
                    <p className="text-muted">{member.role}</p>
                    <div className="social-links">
                      <a href="#" className="text-primary mx-2"><i className="bi bi-linkedin"></i></a>
                      <a href="#" className="text-primary mx-2"><i className="bi bi-twitter"></i></a>
                      <a href="#" className="text-primary mx-2"><i className="bi bi-envelope"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}