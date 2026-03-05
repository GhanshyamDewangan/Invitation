document.addEventListener("DOMContentLoaded", () => {
  /* =====================================
       NAVBAR SCROLL EFFECT
       ===================================== */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  /* =====================================
       INTERSECTION OBSERVER (REVEAL ANIMATIONS)
       ===================================== */
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.12,
  };

  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-up, .reveal-right",
  );

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => revealObserver.observe(el));

  /* =====================================
       REFINED PARTICLES BACKGROUND
       ===================================== */
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");

  let width, height;
  let particles = [];
  let mouse = { x: null, y: null };

  // Subtle config
  const particleCount = window.innerWidth < 768 ? 40 : 80;
  const maxDistance = 130;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  // Track mouse for subtle interactivity
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 1.5 + 0.5;

      // Muted, premium color palette
      const colors = [
        "rgba(66, 133, 244, 0.6)",    // Google Blue
        "rgba(234, 67, 53, 0.4)",     // Google Red
        "rgba(251, 188, 4, 0.4)",     // Google Yellow
        "rgba(52, 168, 83, 0.4)",     // Google Green
        "rgba(108, 99, 255, 0.5)",    // Accent purple
        "rgba(255, 255, 255, 0.2)",   // Subtle white
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.4 + 0.05;
    }

    update() {
      // Subtle mouse attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          this.vx += dx * 0.00003;
          this.vy += dy * 0.00003;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Slow down velocity (damping)
      this.vx *= 0.999;
      this.vy *= 0.999;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          const opacity = 1 - distance / maxDistance;
          ctx.strokeStyle = `rgba(108, 99, 255, ${opacity * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    drawLines();

    requestAnimationFrame(animate);
  }

  // Initialize
  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });

  resizeCanvas();
  initParticles();
  animate();

  /* =====================================
       SMOOTH SCROLL LINKS
       ===================================== */
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      document
        .querySelectorAll(".nav-links a")
        .forEach((a) => a.classList.remove("active"));
      this.classList.add("active");

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = navbar.offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  /* =====================================
       CONTINUOUS TYPING EFFECT
       ===================================== */
  function extractTextNodes(element) {
    if (!element.textNodesCache) {
      const textNodes = [];
      function extract(node) {
        if (node.nodeType === 3) {
          if (node.nodeValue.length > 0) {
            textNodes.push({ node: node, text: node.nodeValue });
            node.nodeValue = "";
          }
        } else {
          if (node.classList && node.classList.contains("cursor")) return;
          Array.from(node.childNodes).forEach(extract);
        }
      }
      extract(element);
      element.textNodesCache = textNodes;
    }
    return element.textNodesCache;
  }

  function typeSequence(element, speed) {
    return new Promise(resolve => {
      const textNodes = extractTextNodes(element);
      
      textNodes.forEach(obj => obj.node.nodeValue = "");
      
      let nodeIndex = 0;
      let charIndex = 0;

      function type() {
        if (nodeIndex < textNodes.length) {
          const currentObj = textNodes[nodeIndex];
          const char = currentObj.text.charAt(charIndex);
          
          currentObj.node.nodeValue += char;
          charIndex++;

          if (charIndex >= currentObj.text.length) {
            nodeIndex++;
            charIndex = 0;
          }

          let delay = speed + (Math.random() - 0.5) * 30;
          if (char === " " || char === "\n") delay = 0;
          
          setTimeout(type, Math.max(10, delay));
        } else {
          resolve();
        }
      }
      type();
    });
  }

  function untypeSequence(element, speed) {
    return new Promise(resolve => {
      const textNodes = extractTextNodes(element);
      
      textNodes.forEach(obj => obj.node.nodeValue = obj.text);

      let nodeIndex = textNodes.length - 1;
      let charIndex = nodeIndex >= 0 ? textNodes[nodeIndex].text.length : 0;

      function untype() {
        if (nodeIndex >= 0) {
          const currentObj = textNodes[nodeIndex];
          
          charIndex--;
          currentObj.node.nodeValue = currentObj.text.substring(0, charIndex);

          if (charIndex <= 0) {
            nodeIndex--;
            if (nodeIndex >= 0) {
               charIndex = textNodes[nodeIndex].text.length;
            }
          }

          let delay = speed + (Math.random() - 0.5) * 10;
          setTimeout(untype, Math.max(5, delay));
        } else {
          resolve();
        }
      }
      
      if (nodeIndex >= 0) {
        untype();
      } else {
        resolve();
      }
    });
  }

  async function startInfiniteTypingLoop() {
    const typeTitle = document.getElementById("type-title");
    const typeCode = document.getElementById("type-code");

    if (!typeTitle || !typeCode) return;

    while (true) {
      // Type sequence
      await typeSequence(typeTitle, 60);
      await new Promise(r => setTimeout(r, 400));
      
      await typeSequence(typeCode, 30);
      
      // Hold the fully typed text
      await new Promise(r => setTimeout(r, 5000));
      
      // Untype sequence
      await untypeSequence(typeCode, 15);
      await new Promise(r => setTimeout(r, 200));
      
      await untypeSequence(typeTitle, 20);
      
      // Brief pause before restarting
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  // Start typing after a brief delay
  setTimeout(startInfiniteTypingLoop, 600);

});
