/* ==========================================================================
   VLA-HRC — site behaviour, layered on the same jQuery + bulmaCarousel +
   bulmaSlider stack the Nerfies template ships with. Adds: shared
   navbar/footer injection (so the Bulma navbar markup isn't hand-copied
   onto eleven pages), a before/after drag slider, and a lightbox for
   .img-grid figures.
   ========================================================================== */

(function () {
  "use strict";

  function siteRoot() {
    var depth = window.__SITE_DEPTH__ || 0;
    return depth === 0 ? "./" : "../".repeat(depth);
  }

  var NAV_EXPERIMENTS = [
    { key: "vla-policy", title: "VLA Policy & Simulation", sub: "π0.5 on Baxter in MuJoCo", href: "experiments/vla-policy.html" },
    { key: "checkpoints", title: "Checkpoint & Policy Development", sub: "Six-task iteration, training & inference", href: "experiments/checkpoints.html" },
    { key: "vlm-planner", title: "VLM Planner", sub: "High-level task planning", href: "experiments/vlm-planner.html" },
    { key: "hrc", title: "Human-Robot Collaboration", sub: "Escalation & shared execution", href: "experiments/hrc.html" },
    { key: "cross-embodiment", title: "Cross-Embodiment", sub: "Baxter · Franka · Unitree G1", href: "experiments/cross-embodiment.html" },
    { key: "physical-robot", title: "Physical Robot & Sim-to-Real", sub: "Real Baxter deployment", href: "experiments/physical-robot.html" },
    { key: "real-finetuning", title: "Real-Data Fine-Tuning", sub: "Learning from physical demonstrations", href: "experiments/real-finetuning.html" }
  ];

  function buildNavbar(active) {
    var root = siteRoot();
    var isExpGroup = NAV_EXPERIMENTS.some(function (e) { return e.key === active; });
    var ddItems = NAV_EXPERIMENTS.map(function (e) {
      return (
        '<a class="navbar-item' + (e.key === active ? " is-active-page" : "") + '" href="' + root + e.href + '">' +
        e.title + '<span class="dd-sub">' + e.sub + "</span></a>"
      );
    }).join("");

    var html =
      '<nav class="navbar" role="navigation" aria-label="main navigation">' +
      '<div class="navbar-brand">' +
      '<a class="navbar-item" href="' + root + 'index.html" style="font-weight:700;">' +
      '<img src="' + root + 'static/images/de-niro-logo.png" alt="Robot DE NIRO" style="height:34px;width:auto;margin-right:8px;">VLA&ndash;HRC' +
      "</a>" +
      '<a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="siteNavMenu">' +
      "<span aria-hidden=\"true\"></span><span aria-hidden=\"true\"></span><span aria-hidden=\"true\"></span>" +
      "</a>" +
      "</div>" +
      '<div id="siteNavMenu" class="navbar-menu">' +
      '<div class="navbar-end" style="margin-right:6vw;">' +
      '<a class="navbar-item' + (active === "home" ? " is-active-page" : "") + '" href="' + root + 'index.html">Home</a>' +
      '<div class="navbar-item has-dropdown is-hoverable">' +
      '<a class="navbar-link' + (isExpGroup ? " is-active-page" : "") + '">Experiments</a>' +
      '<div class="navbar-dropdown">' + ddItems + "</div>" +
      "</div>" +
      '<a class="navbar-item' + (active === "about" ? " is-active-page" : "") + '" href="' + root + 'about.html">About</a>' +
      '<a class="navbar-item' + (active === "logbook" ? " is-active-page" : "") + '" href="' + root + 'logbook.html">Logbook</a>' +
      "</div>" +
      "</div>" +
      "</nav>";

    return html;
  }

  function buildFooter() {
    var root = siteRoot();
    return (
      '<footer class="footer">' +
      '<div class="container">' +
      '<div class="content has-text-centered">' +
      '<a class="icon-link" href="#"><i class="fas fa-file-pdf"></i></a>' +
      '<a class="icon-link" href="#"><i class="fab fa-github"></i></a>' +
      "</div>" +
      '<div class="columns is-centered">' +
      '<div class="column is-8">' +
      '<div class="content has-text-centered">' +
      "<p><strong>Towards Generalisable Vision&ndash;Language&ndash;Action Policies for Human&ndash;Robot Collaboration</strong> &mdash; MRes Design Engineering thesis, Imperial College London.</p>" +
      '<p style="font-size:0.85rem;color:#888;">' +
      "Built from the <a href=\"https://github.com/nerfies/nerfies.github.io\" target=\"_blank\" rel=\"noopener\">Nerfies</a> project page template, " +
      "licensed under a <a rel=\"license\" href=\"http://creativecommons.org/licenses/by-sa/4.0/\">Creative Commons Attribution-ShareAlike 4.0 License</a>." +
      "</p>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</footer>"
    );
  }

  function initLightbox() {
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-prev" aria-label="Previous">&larr;</button>' +
      '<img alt="">' +
      '<button class="lb-next" aria-label="Next">&rarr;</button>' +
      '<div class="lightbox-caption"></div>';
    document.body.appendChild(overlay);

    var state = { images: [], index: 0 };
    function render() {
      var img = state.images[state.index];
      if (!img) return;
      overlay.querySelector("img").src = img.src;
      overlay.querySelector(".lightbox-caption").textContent = img.caption || "";
    }
    function open(images, index) {
      state.images = images;
      state.index = index;
      render();
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    overlay.querySelector(".lb-close").addEventListener("click", close);
    overlay.querySelector(".lb-prev").addEventListener("click", function () {
      state.index = (state.index - 1 + state.images.length) % state.images.length;
      render();
    });
    overlay.querySelector(".lb-next").addEventListener("click", function () {
      state.index = (state.index + 1) % state.images.length;
      render();
    });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") { state.index = (state.index - 1 + state.images.length) % state.images.length; render(); }
      if (e.key === "ArrowRight") { state.index = (state.index + 1) % state.images.length; render(); }
    });

    document.querySelectorAll(".img-grid").forEach(function (grid) {
      var figs = Array.from(grid.querySelectorAll("figure[data-lightbox]"));
      var images = figs.map(function (f) {
        var img = f.querySelector("img");
        return { src: img.getAttribute("src"), caption: f.getAttribute("data-caption") || "" };
      });
      figs.forEach(function (f, i) {
        f.addEventListener("click", function () { open(images, i); });
      });
    });
  }

  function initBeforeAfter() {
    document.querySelectorAll(".ba-slider").forEach(function (wrap) {
      var afterImg = wrap.querySelector(".ba-after");
      var handle = wrap.querySelector(".ba-handle");
      if (!afterImg || !handle) return;
      var dragging = false;
      function setPos(clientX) {
        var rect = wrap.getBoundingClientRect();
        var pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
        afterImg.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
      }
      wrap.addEventListener("pointerdown", function (e) { dragging = true; setPos(e.clientX); wrap.setPointerCapture(e.pointerId); });
      wrap.addEventListener("pointermove", function (e) { if (dragging) setPos(e.clientX); });
      wrap.addEventListener("pointerup", function () { dragging = false; });
      wrap.addEventListener("pointerleave", function () { dragging = false; });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var navRoot = document.getElementById("site-navbar");
    if (navRoot) navRoot.outerHTML = buildNavbar(navRoot.getAttribute("data-active") || "");
    var footRoot = document.getElementById("site-footer");
    if (footRoot) footRoot.outerHTML = buildFooter();

    // Navbar burger (same pattern as the original Nerfies index.js)
    document.querySelectorAll(".navbar-burger").forEach(function (burger) {
      burger.addEventListener("click", function () {
        burger.classList.toggle("is-active");
        var target = document.getElementById(burger.dataset.target);
        if (target) target.classList.toggle("is-active");
      });
    });

    if (window.bulmaCarousel) {
      window.bulmaCarousel.attach(".carousel", {
        slidesToScroll: 1,
        slidesToShow: 3,
        loop: true,
        infinite: true,
        autoplay: false
      });
    }
    if (window.bulmaSlider) window.bulmaSlider.attach();

    initLightbox();
    initBeforeAfter();
  });
})();
