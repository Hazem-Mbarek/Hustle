import React from 'react';

export default function HomePage() {
  return (
    <main>

   

      {/* Carousel Section */}
      <div id="carouselExample" className="carousel slide custom-carousel" data-bs-ride="carousel" data-bs-interval="3500">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/images/logo4.png" className="d-block w-100" alt="Slide 1" />
            <button className="learn-more-btn">Learn More</button>
          </div>
          <div className="carousel-item">
            <img src="/images/logo4.png" className="d-block w-100" alt="Slide 2" />
            <button className="learn-more-btn">Learn More</button>
          </div>
          <div className="carousel-item">
            <img src="/images/logo4.png" className="d-block w-100" alt="Slide 3" />
            <button className="learn-more-btn">Learn More</button>
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      
 {/* Jumbotron Section */}
 <div className="jumbotron bg-light p-4 mb-4">
        <h1 className="display-4">Welcome to Bootstrap!</h1>
        <hr className="my-4" />
      </div>
    {/* Features Section */}
<div className="row text-center">
  <div className="col-lg-4">
    <div className="feature-icon mb-3">
      {/* Search Icon */}
      <i className="bi bi-search feature-icon" style={{ fontSize: "50px", color: "#17a589" }}></i>
    </div>
    <h2>Search</h2>
    <p className="lead">Easily find a job that suits you.</p>
  </div>
  <div className="col-lg-4">
    <div className="feature-icon mb-3">
      {/* Community Icon */}
      <i className="bi bi-people feature-icon" style={{ fontSize: "50px", color: "#17a589" }}></i>
    </div>
    <h2>Community</h2>
    <p className="lead">Join a thriving community of users.</p>
  </div>
  <div className="col-lg-4">
    <div className="feature-icon mb-3">
      {/* Free Icon */}
      <i className="bi bi-currency-dollar feature-icon" style={{ fontSize: "50px", color: "#17a589" }}></i>
    </div>
    <h2>Free</h2>
    <p className="lead">The money you make is all yours.</p>
  </div>
</div>
    </main>
  );
}
