/* ============================================================
   个人网站 · 交互脚本
   无外部依赖，可直接双击 HTML 本地打开
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. 主题（浅色 / 深色） ---------- */
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("site-theme", theme); } catch (e) {}
    const btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "切换到浅色模式" : "切换到深色模式"
      );
    }
  }

  const toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }
  applyTheme(root.getAttribute("data-theme") || "light");

  /* ---------- 2. 导航：吸顶阴影 + 移动端抽屉 ---------- */
  const nav = document.querySelector(".nav");
  const menuBtn = document.querySelector(".menu-btn");

  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    // 点击菜单内链接后自动收起
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 3. 滚动进场动画 ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealables = document.querySelectorAll(".reveal");

  if (!reduce && "IntersectionObserver" in window && revealables.length) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 4. 技能条填充动画 ---------- */
  const bars = document.querySelectorAll(".skill__fill");
  if (bars.length) {
    // HTML 内联 style 已给出最终宽度（无 JS 也能正确显示），这里只做一次 0 → 目标 的动画
    const fill = function (el) {
      const target = el.style.width || (el.dataset.level || 100) + "%";
      el.style.width = "0%";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.style.width = target; });
      });
    };
    if (!reduce && "IntersectionObserver" in window) {
      const so = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fill(entry.target);
            so.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      bars.forEach(function (b) { so.observe(b); });
    } else {
      bars.forEach(function (el) {
        el.style.width = el.dataset.level ? el.dataset.level + "%" : el.style.width;
      });
    }
  }

  /* ---------- 5. 作品筛选（作品页） ---------- */
  const filters = document.querySelectorAll(".filter");
  const works = document.querySelectorAll(".work[data-cat]");

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      const cat = btn.dataset.filter;
      works.forEach(function (w) {
        w.classList.toggle("is-hidden", cat !== "all" && w.dataset.cat !== cat);
      });
    });
  });

  /* ---------- 6. 联系表单：校验 + 唤起邮件客户端 ---------- */
  const form = document.querySelector(".contact-form");
  if (form) {
    const status = form.querySelector(".form-status");

    const setError = function (input, on) {
      const field = input.closest(".field");
      if (field) field.classList.toggle("has-error", on);
      input.setAttribute("aria-invalid", on ? "true" : "false");
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = form.elements.name;
      const email = form.elements.email;
      const subject = form.elements.subject;
      const message = form.elements.message;

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      setError(name, name.value.trim().length < 1);
      setError(email, !emailOk);
      setError(message, message.value.trim().length < 5);

      if (status) {
        if (!name.value.trim() || !emailOk || message.value.trim().length < 5) {
          status.style.color = "";
          status.textContent = "请检查标红的字段：姓名、有效邮箱，以及至少 5 个字的留言。";
          return;
        }
        const body =
          "来自：" + name.value.trim() + " <" + email.value.trim() + ">\n\n" +
          message.value.trim();
        const href =
          "mailto:" + encodeURIComponent(form.dataset.to || "") +
          "?subject=" + encodeURIComponent(subject.value.trim() || "来自个人网站的留言") +
          "&body=" + encodeURIComponent(body);
        window.location.href = href;
        status.textContent = "已为你打开邮件客户端，确认收件人与内容后点发送即可。";
        form.reset();
      }
    });
  }

  /* ---------- 7. 页脚年份 ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
