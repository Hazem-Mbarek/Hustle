import './Job.css'; // Make sure this path is correct

export default function Job() {
  return (
    <main>
      {/* Welcome Section */}
      <div className="text-center mb-4 pt-5"> {/* Adjusted padding-top to 5 */}
        <h2>Welcome to Your Job Portal</h2>
        <p>Explore job opportunities and enhance your skills.</p>
        <button
          className="btn btn-success"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasTutorial"
          aria-controls="offcanvasTutorial"
        >
          Show Tutorial
        </button>
      </div>

      {/* Offcanvas Tutorial */}
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex={-1}
        id="offcanvasTutorial"
        aria-labelledby="offcanvasTutorialLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasTutorialLabel">
            Welcome Tutorial
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <p>Welcome to the Job Portal! Here are some tips to get you started:</p>
          <ul>
            <li>Explore the job listings to find opportunities that match your skills.</li>
            <li>Use the filters to narrow down your search by location, salary, and job type.</li>
            <li>Create a profile to apply easily and keep track of your applications.</li>
            <li>Don't forget to check our resources for resume tips and interview preparation!</li>
          </ul>
          <p>Good luck on your job search!</p>
        </div>
      </div>

     {/* Bootstrap Search Bar and Dropdown */}
      <div className="container mb-4 pt-10"> {/* Add mt-4 for top margin */}
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="input-group shadow-sm"> {/* Add shadow effect */}
              <select className="form-select" aria-label="Default select example">
                <option value="" disabled selected>Select a filter</option>
                <option value="1">Filter One</option>
                <option value="2">Filter Two</option>
                <option value="3">Filter Three</option>
              </select>
              <input
                type="text"
                className="form-control"
                placeholder="Search for jobs..."
              />
              <button className="btn btn-success" type="button"> {/* Change button color to green */}
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job list */}
      <div className="container p-4">
        <div className="row justify-content-center">
          {/* First Card */}
          <div className="col-6 col-md-3">
            <div className="card card-custom mx-auto">
              <img
                src="/images/logo4.png"
                className="card-img-top card-image"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Card with stretched link</h5>
                <p className="card-text">
                  Some quick example text to build on the card title and make up the bulk of the card's content.
                </p>
                <a href="#" className="btn btn-success stretched-link">Go somewhere</a>
              </div>
            </div>
          </div>

          {/* Second Card */}
          <div className="col-6 col-md-3">
            <div className="card card-custom mx-auto">
              <img
                src="/images/c.jpg"
                className="card-img-top card-image"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Card with stretched link</h5>
                <p className="card-text">
                  Some quick example text to build on the card title and make up the bulk of the card's content.
                </p>
                <a href="#" className="btn btn-success stretched-link">Go somewhere</a>
              </div>
            </div>
          </div>

          {/* Third Card */}
          <div className="col-6 col-md-3">
            <div className="card card-custom mx-auto">
              <img
                src="/images/c.jpg"
                className="card-img-top card-image"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title">Card with stretched link</h5>
                <p className="card-text">
                  Some quick example text to build on the card title and make up the bulk of the card's content.
                </p>
                <a href="#" className="btn btn-success stretched-link">Go somewhere</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
