(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const themeToggle = document.querySelector(".theme-toggle");
  const headerLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("main section[id]");
  const progressFills = document.querySelectorAll(".progress-fill");
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");

  function setTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to bright mode" : "Switch to dark mode");

    try {
      localStorage.setItem("evi-theme", isDark ? "dark" : "light");
    } catch (e) {
      // Theme still changes when storage is unavailable.
    }
  }

  setTheme(document.documentElement.getAttribute("data-theme") || "light");

  themeToggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle.addEventListener("click", function () {
    setMenu(!navLinks.classList.contains("open"));
  });

  headerLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  const progressObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        bar.style.width = bar.dataset.progress + "%";
        observer.unobserve(bar);
      });
    },
    { threshold: 0.4 }
  );

  progressFills.forEach(function (bar) {
    progressObserver.observe(bar);
  });

  function setActiveLink() {
    const fromTop = window.scrollY + 120;
    let current = "home";

    sections.forEach(function (section) {
      if (section.offsetTop <= fromTop) {
        current = section.id;
      }
    });

    headerLinks.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + current;
      link.classList.toggle("active", isActive);
    });
  }

  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  const fields = {
    name: {
      el: document.getElementById("name"),
      validate: function (value) {
        if (!value.trim()) return "Please enter your name.";
        if (value.trim().length < 2) return "Name must be at least 2 characters.";
        return "";
      },
    },
    email: {
      el: document.getElementById("email"),
      validate: function (value) {
        if (!value.trim()) return "Please enter your email.";
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        return ok ? "" : "Enter a valid email address.";
      },
    },
    phone: {
      el: document.getElementById("phone"),
      validate: function (value) {
        const digits = value.replace(/\D/g, "");
        if (!value.trim()) return "Please enter a phone number.";
        if (digits.length < 10) return "Enter a phone number with at least 10 digits.";
        return "";
      },
    },
    message: {
      el: document.getElementById("message"),
      validate: function (value) {
        if (!value.trim()) return "Please add a message.";
        if (value.trim().length < 10) return "Message should be at least 10 characters.";
        return "";
      },
    },
  };

  function showError(name, message) {
    const field = fields[name].el;
    const errorEl = document.querySelector('[data-error-for="' + name + '"]');
    field.classList.toggle("invalid", Boolean(message));
    errorEl.textContent = message;
  }

  function validateField(name) {
    const message = fields[name].validate(fields[name].el.value);
    showError(name, message);
    return !message;
  }

  Object.keys(fields).forEach(function (name) {
    fields[name].el.addEventListener("blur", function () {
      validateField(name);
    });
    fields[name].el.addEventListener("input", function () {
      if (fields[name].el.classList.contains("invalid")) {
        validateField(name);
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    statusEl.textContent = "";
    statusEl.classList.remove("error");

    const valid = Object.keys(fields).every(validateField);
    if (!valid) {
      statusEl.textContent = "Please fix the highlighted fields.";
      statusEl.classList.add("error");
      return;
    }

    statusEl.textContent = "Thank you. Your message has been received.";
    form.reset();
    Object.keys(fields).forEach(function (name) {
      showError(name, "");
    });
  });
})();
