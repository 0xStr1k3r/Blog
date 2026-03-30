(function bootstrapUI() {
  const normalizeTargetFile = (href) => {
    if (!href) {
      return "";
    }
    const clean = href.split("?")[0].split("#")[0];
    const segments = clean.split("/").filter(Boolean);
    return segments[segments.length - 1] || "index.html";
  };

  const nav = document.getElementById("site-nav");
  const menuToggle = document.getElementById("menu-toggle");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.textContent = isOpen ? "Close" : "Menu";
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "Menu";
      });
    });
    
    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "Menu";
      }
    });
  }

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  if (nav) {
    nav.querySelectorAll("a").forEach((link) => {
      const target = normalizeTargetFile(link.getAttribute("href"));
      if (
        (currentFile === "" && target === "index.html") ||
        target === currentFile ||
        (currentFile === "/" && target === "index.html")
      ) {
        link.classList.add("active");
      }
    });
  }

  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
  
  // Enhanced smooth scroll header hide/show with throttling
  let lastScrollY = window.scrollY;
  let ticking = false;
  const header = document.querySelector(".site-header");
  
  if (header) {
    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.style.transform = "translateY(-120%)";
        header.style.opacity = "0";
      } else {
        header.style.transform = "translateY(0)";
        header.style.opacity = "1";
      }
      lastScrollY = currentScrollY;
      ticking = false;
    };
    
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
    
    header.style.transition = "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)";
  }
  
  // Add staggered animation to skill chips
  const skillChips = document.querySelectorAll(".skill-chip");
  skillChips.forEach((chip, index) => {
    chip.style.animationDelay = `${index * 80}ms`;
  });

  // Footer social links with stagger
  const footerLinks = document.getElementById("footer-links");
  if (footerLinks) {
    const social = [
      {
        label: "GitHub",
        href: "https://github.com/0xStr1k3r",
        icon:
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.6-1.5-1.4-1.9-1.4-1.9-1.2-.8.1-.8.1-.8 1.3.1 2 .9 2 1 .8 1.3 2.1.9 2.7.7.1-.6.3-1 .6-1.3-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2c-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.4 5.9 18.4 6.2 18.4 6.2c.6 1.6.2 2.8.1 3.1a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.3.7 1 .7 2v2.8c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg>',
      },
      {
        label: "TryHackMe",
        href: "https://tryhackme.com/p/0xStr1k3r",
        icon:
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 2 6.8v10.4l10 5.3 10-5.3V6.8L12 1.5Zm0 2.1 7.9 4.2L12 12 4.1 7.8 12 3.6Zm-8 6 7 3.8v6.7l-7-3.7V9.6Zm9 10.5v-6.7l7-3.8v6.8l-7 3.7Z"/></svg>',
      },
      {
        label: "Portfolio",
        href: "https://0xchiru.dev",
        icon:
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.9 9h-3.1a15.2 15.2 0 0 0-1.3-5A8 8 0 0 1 19.9 11ZM12 4.1c.9 1 2 3.2 2.6 6H9.4c.6-2.8 1.7-5 2.6-6ZM6 11H3.1a8 8 0 0 1 4.4-5 15.2 15.2 0 0 0-1.4 5Zm0 2a15.2 15.2 0 0 0 1.4 5 8 8 0 0 1-4.3-5H6Zm3.4 0h5.2c-.6 2.8-1.7 5-2.6 6-.9-1-2-3.2-2.6-6Zm6.1 5a15.2 15.2 0 0 0 1.3-5h3.1a8 8 0 0 1-4.4 5Z"/></svg>',
      },
      {
        label: "Mail",
        href: "mailto:chiranjeevi@darknode",
        icon:
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2v.2l9 6 9-6V7H3Zm18 2.7-8.4 5.6a1 1 0 0 1-1.2 0L3 9.7V17h18V9.7Z"/></svg>',
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/chiranjeevi-diviti/",
        icon:
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.9 8A1.9 1.9 0 1 1 7 4.2 1.9 1.9 0 0 1 6.9 8ZM5.3 9.5h3.1V20H5.3V9.5Zm5.1 0h3v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5V20h-3.1v-4.9c0-1.2 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V20h-3.1V9.5Z"/></svg>',
      },
    ];

    footerLinks.innerHTML = social
      .map((item, index) => {
        const external = item.href.startsWith("http");
        const target = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a class="footer-link" href="${item.href}"${target} style="animation-delay: ${index * 60}ms">${item.icon}<span>${item.label}</span></a>`;
      })
      .join("");
  }

  // Enhanced typing animation
  const typingTarget = document.getElementById("typing-text");
  if (typingTarget) {
    const lines = [
      "Pentesting",
      "AD Pentesting",
      "Web Security",
      "OSINT",
      "Network Hacking",
      "Cloud Security",
      "Reverse Engineering",
      "Red Team Operations",
      "Think like an attacker. Defend like an engineer.",
      "Security is a process, not a checkbox.",
    ];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      typingTarget.textContent = lines[0];
    } else {
      let lineIndex = 0;
      let charIndex = 0;
      let deleting = false;
      let timer = null;

      const step = () => {
        const line = lines[lineIndex];
        if (!deleting) {
          charIndex += 1;
          typingTarget.textContent = line.slice(0, charIndex);
          if (charIndex >= line.length) {
            deleting = true;
            timer = window.setTimeout(step, 1500);
            return;
          }
          timer = window.setTimeout(step, 50);
          return;
        }

        charIndex -= 1;
        typingTarget.textContent = line.slice(0, Math.max(charIndex, 0));
        if (charIndex <= 0) {
          deleting = false;
          lineIndex = (lineIndex + 1) % lines.length;
          timer = window.setTimeout(step, 200);
          return;
        }
        timer = window.setTimeout(step, 30);
      };

      step();
      window.addEventListener("beforeunload", () => {
        if (timer) {
          window.clearTimeout(timer);
        }
      });
    }
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Enhanced intersection observer with performance optimizations
  const applyRevealToNewContent = () => {
    const revealTargets = document.querySelectorAll(".hero,.panel,.card");
    if (reduceMotion) {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!window.__siteRevealObserver) {
      window.__siteRevealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            // Use requestAnimationFrame for smoother animations
            window.requestAnimationFrame(() => {
              entry.target.classList.add("is-visible");
            });
            window.__siteRevealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
      );
    }

    revealTargets.forEach((el) => {
      el.classList.add("reveal");
      if (!el.classList.contains("is-visible")) {
        window.__siteRevealObserver.observe(el);
      }
    });
  };

  // Add smooth page load animation
  document.documentElement.style.opacity = "0";
  window.addEventListener("DOMContentLoaded", () => {
    window.requestAnimationFrame(() => {
      document.documentElement.style.transition = "opacity 400ms ease";
      document.documentElement.style.opacity = "1";
    });
  });

  window.applyRevealToNewContent = applyRevealToNewContent;
  
  // Defer reveal animations until after page is visible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyRevealToNewContent);
  } else {
    applyRevealToNewContent();
  }
})();
