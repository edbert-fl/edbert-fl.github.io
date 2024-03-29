import { useEffect, useRef, useState } from "react";
import "./assets/css/app.css";
import "./assets/css/main.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const fixedGradientRef = useRef(null);
  const gradientRef = useRef(null);
  const logoRef = useRef(null);
  const [smallScreen, setSmallScreen] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 1000) setSmallScreen(true);
    else setSmallScreen(false);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        } else {
          entry.target.classList.remove("show");
        }
      });
    });

    // Select all elements that are hidden and need to be animated then observe them.
    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((element) => observer.observe(element));

    // Handle scroll position for logo
    const handleScroll = () => {
      if (!logoRef.current) return;
      const scrollY = window.scrollY;

      // Adjust the threshold as needed.
      const transitionThreshold = 420;

      if (scrollY > transitionThreshold) {
        // Once the user scrolls past the threshold, move the text to the top right corner.
        logoRef.current.style.setProperty("--pos", "fixed");
        logoRef.current.style.setProperty("--top", "25px");
        logoRef.current.style.setProperty("--left", "25px");
        logoRef.current.style.setProperty(
          "--shadow",
          "2px 2px 4px rgba(0, 0, 0, 0.5)"
        );
        logoRef.current.classList.remove("logo-centered");

        if (smallScreen) fixedGradientRef.current.classList.remove("hidden-gradient");
      } else {
        logoRef.current.style.setProperty("--pos", "auto");
        logoRef.current.style.setProperty("--top", "auto");
        logoRef.current.style.setProperty("--left", "auto");
        logoRef.current.style.setProperty("--shadow", "transparent");
        logoRef.current.classList.add("logo-centered");

        if (smallScreen) fixedGradientRef.current.classList.add("hidden-gradient");
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Update mouse position for gradient effect.
    const handleMouseMove = (ev) => {
      if (!gradientRef) return;

      const { clientX, clientY } = ev;
      const { scrollY } = window;

      gradientRef.current.style.setProperty("--x", `${clientX}px`);
      gradientRef.current.style.setProperty("--y", `${clientY + scrollY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [smallScreen]);

  return (
    <div className="App">
      <head>
        <title>Edbert's Portfolio</title>
        <link href="../css/main.min.css" rel="stylesheet" />
      </head>

      <body class="body">
        <div ref={gradientRef} className="gradient">
          {smallScreen ? (
            <div
              ref={fixedGradientRef}
              className="fixed-gradient hidden-gradient"
            />
          ) : (
            <div ref={fixedGradientRef} className="fixed-gradient" />
          )}
          <div className="mobile">
            <div className="section container mt-3" id="home">
              <header className="App-header">
                <div class="logo-container">
                  <h1 ref={logoRef} class="logo logo-centered text-start">
                    Hi I'm Edbert.
                  </h1>
                  <h1 class="text-primary logo-caption text-start">
                    <small class="text-body-secondary">
                      {" "}
                      I'm a Software Developer.
                    </small>
                  </h1>
                </div>
                {smallScreen ? (
                  <div class="mobile-socials d-flex align-items-center justify-content-start icons-list">
                    <a
                      href="https://www.linkedin.com/in/edbert-fl"
                      rel="noreferrer"
                      target="_blank"
                      class="text-decoration-none icon-link"
                    >
                      <i class="fa-brands fa-linkedin fa-lg"></i>
                    </a>
                    <a
                      href="mailto:edbert.fl@gmail.com"
                      rel="noreferrer"
                      target="_blank"
                      class="text-decoration-none icon-link"
                    >
                      <i class="fas fa-envelope fa-lg"></i>
                    </a>
                    <a
                      href="https://github.com/edbert-fl"
                      rel="noreferrer"
                      target="_blank"
                      class="text-decoration-none icon-link"
                    >
                      <i class="fa-brands fa-github fa-lg"></i>
                    </a>
                  </div>
                ) : null}
              </header>
            </div>

            <div class="section">
              <div class="container mt-3">
                <div class="row">
                  <div class="col-md-6 section-padding">
                    <h3 class="text-start mb-3">About Me</h3>
                    <p class="text-start text-secondary mb-3">
                      Hi, I'm Edbert, a dynamic Software Developer with a
                      passion for creating user-friendly mobile and web
                      products. I discovered my love for coding in high school
                      and have since honed my skills through self-teaching.
                      Currently pursuing a Bachelor of Advanced Computing at the
                      University of Sydney, majoring in Computer Science and
                      Data Science, I am driven by an unwavering commitment to
                      excellence and enjoy pushing boundaries in software
                      development. Join me on this exciting journey, where every
                      line of code propels us toward the future!
                    </p>
                  </div>
                  <div class="col-md-6">
                    <h3 class="text-start mb-3">Skills</h3>
                    <div class="d-flex flex-wrap gap-1">
                      <button class="btn btn-outline-info btn-sm">
                        Python
                      </button>
                      <button class="btn btn-outline-info btn-sm">Java</button>
                      <button class="btn btn-outline-info btn-sm">
                        Javascript
                      </button>
                      <button class="btn btn-outline-info btn-sm">
                        Typescript
                      </button>
                      <button class="btn btn-outline-info btn-sm">R</button>
                      <button class="btn btn-outline-info btn-sm">React</button>
                      <button class="btn btn-outline-info btn-sm">
                        React Native
                      </button>
                      <button class="btn btn-outline-info btn-sm">Flask</button>
                      <button class="btn btn-outline-info btn-sm">
                        Firebase
                      </button>
                      <button class="btn btn-outline-info btn-sm">
                        PostgreSQL
                      </button>
                      <button class="btn btn-outline-info btn-sm">Git</button>
                      <button class="btn btn-outline-info btn-sm">Bash</button>
                      <button class="btn btn-outline-info btn-sm">C#</button>
                      <button class="btn btn-outline-info btn-sm">HTML</button>
                      <button class="btn btn-outline-info btn-sm">CSS</button>
                      <button class="btn btn-outline-info btn-sm">Jinja</button>
                      <button class="btn btn-outline-info btn-sm">
                        Material-UI
                      </button>
                      <button class="btn btn-outline-info btn-sm">Scrum</button>
                      <button class="btn btn-outline-info btn-sm">Jira</button>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section">
              <div class="container mt-3">
                <h3 class="w-100 text-start mb-3">Experience</h3>

                <dl class="row mb-5 hidden">
                  <dt class="col-sm-3 text-start">November 2023 - Present</dt>
                  <dd class="col-sm-9 text-start">
                    <strong>
                      Ascend Enterprise Solutions • Software Development Intern
                    </strong>
                    <p class="text-secondary">
                      I played a key role in developing a coordinate tracking
                      system for employee authentication. Optimized SQL queries
                      for a large database, achieving a 90% increase in
                      efficiency. Also worked on intern project that involved
                      creating a mobile app for an employee management system.
                    </p>

                    <div class="d-flex flex-wrap gap-1">
                      <button class="btn btn-outline-primary btn-sm">
                        Java
                      </button>
                      <button class="btn btn-outline-primary btn-sm">
                        SQL
                      </button>
                      <button class="btn btn-outline-primary btn-sm">
                        React Native
                      </button>
                      <button class="btn btn-outline-primary btn-sm">
                        Firebase
                      </button>
                      <button class="btn btn-outline-primary btn-sm">
                        Typescript
                      </button>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>

            <div className="section projects-section">
              <div class="container mt-3">
                <h3 class="w-100 text-start mb-3">Featured Projects</h3>

                <div class="d-flex flex-wrap">
                  <div class="project border-0 card mb-2 glass-card mx-1 hidden">
                    <div class="card-body card-content">
                      <h5 class="card-title">WcDonalds Fast Food Mobile App</h5>
                      <p class="card-text text-wrap">
                        A user-friendly fast food mobile app clone for ordering
                        takeaway made with React-Native and Firebase.
                      </p>
                      <p class="card-text project-label">
                        React Native Mobile App
                      </p>
                      <a
                        class="text-decoration-none"
                        href="https://github.com/edbert-fl/wcdonalds"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <p class="card-text show-project">Show Project →</p>
                      </a>
                    </div>
                  </div>

                  <div class="project border-0 card mb-2 glass-card mx-1 hidden">
                    <div class="card-body card-content">
                      <h5 class="card-title">
                        File Management System with Scrum
                      </h5>
                      <p class="card-text">
                        A file management system with client server interactions
                        and built-in admin dashboard for monitoring, built in a
                        team using Scrum framework.
                      </p>
                      <p class="card-text project-label">
                        Java Desktop Application
                      </p>
                      <a
                        class="text-decoration-none"
                        href="https://github.com/edbert-fl/scroll-manager"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <p class="card-text show-project">Show Project →</p>
                      </a>
                    </div>
                  </div>

                  <div class="project border-0 card mb-2 glass-card mx-1 hidden">
                    <div class="card-body card-content">
                      <h5 class="card-title">Cloudy Weather App</h5>
                      <p class="card-text">
                        A playful weather web app with live updates, dynamic
                        videos based on conditions all powered by an integrated
                        API.
                      </p>
                      <p class="card-text project-label">Web Application</p>
                      <a
                        class="text-decoration-none"
                        href="https://github.com/edbert-fl/cloudy"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <p class="card-text show-project">Show Project →</p>
                      </a>
                    </div>
                  </div>

                  <div class="project border-0 card mb-2 glass-card mx-1 hidden">
                    <div class="card-body card-content">
                      <h5 class="card-title">Stock Trading Web App</h5>
                      <p class="card-text">
                        A stock trading web app with real-time stock prices,
                        enabling users to simulate buying and selling stocks
                        using mock currency.
                      </p>
                      <p class="card-text project-label">Web Application</p>
                      <p class="card-text show-project">
                        Project cannot be showed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <script
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
                crossorigin="anonymous"
              ></script>
            </div>

            <div class="container footer">
              <hr />
              <br />
              <div class="row">
                <div class="col-8 align-items-start text-start">
                  <p class="footer-text text-secondary">
                    © 2024 Edbert Felix Lim
                  </p>
                  <a
                    class="text-decoration-none text-secondary footer-text"
                    href="https://www.flaticon.com/free-icons/panda"
                    title="panda icons"
                  >
                    Panda icons created by riajulislam - Flaticon
                  </a>
                </div>
                <div class="col-4 d-flex align-items-center justify-content-end icons-list">
                  <a
                    href="https://www.linkedin.com/in/edbert-fl"
                    rel="noreferrer"
                    target="_blank"
                    class="text-decoration-none mx-2 icon-link"
                  >
                    <i class="fa-brands fa-linkedin fa-lg"></i>
                  </a>
                  <a
                    href="mailto:edbert.fl@gmail.com"
                    rel="noreferrer"
                    target="_blank"
                    class="text-decoration-none mx-2 icon-link"
                  >
                    <i class="fas fa-envelope fa-lg"></i>
                  </a>
                  <a
                    href="https://github.com/edbert-fl"
                    rel="noreferrer"
                    target="_blank"
                    class="text-decoration-none mx-2 icon-link"
                  >
                    <i class="fa-brands fa-github fa-lg"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default App;
