(() => {
  "use strict";
  const config = {"palette":{"ink":"#451829","muted":"#7c5966","surface":"#fff5f7","accent":"#c52d61","accent_text":"#ffffff"},"eyebrow":"Listen to your heart","title":"What does love need from you?","intro":"Choose the answers closest to how things feel today.","result_title":"Your love reading is ready","result":"Continue to explore the connection with a specialist.","questions":[{"text":"Where is your heart focused?","choices":["A current partner","Someone new","Healing and self-love"]},{"text":"What do you want to understand?","choices":["Their feelings","Our future","My best next step"]}]};
  let activeDialog = null;
  let previousFocus = null;
  let answers = [];

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const focusable = (root) => Array.from(root.querySelectorAll(
    'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )).filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");

  const closeQuiz = () => {
    if (!activeDialog) return;
    const closing = activeDialog;
    activeDialog = null;
    document.body.classList.remove("nq-scroll-lock");
    if (closing.open) closing.close();
    closing.remove();
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus({ preventScroll: true });
    }
    previousFocus = null;
  };

  const focusFirst = (root) => {
    const first = focusable(root)[0];
    if (first) requestAnimationFrame(() => first.focus());
  };

  const renderResult = (dialog, body, progress) => {
    progress.textContent = "Complete";
    body.replaceChildren();
    const mark = make("div", "nq-mark", "✦");
    mark.setAttribute("aria-hidden", "true");
    body.append(mark, make("h3", "nq-question", config.result_title));
    body.append(make("p", "nq-result-copy", config.result));
    const finalLink = make("a", "nq-final", "Continue to your reading");
    finalLink.href = "/go/";
    finalLink.rel = "nofollow sponsored";
    finalLink.dataset.nebulaQuizFinal = "1";
    body.append(finalLink);
    focusFirst(body);
  };

  const renderQuestion = (dialog, body, progress, index) => {
    const item = config.questions[index];
    progress.textContent = `Question ${index + 1} of ${config.questions.length}`;
    body.replaceChildren();
    const heading = make("h3", "nq-question", item.text);
    heading.id = `nq-question-${index + 1}`;
    const choices = make("div", "nq-choices");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-labelledby", heading.id);
    item.choices.forEach((choice) => {
      const button = make("button", "nq-choice", choice);
      button.type = "button";
      button.addEventListener("click", () => {
        answers[index] = choice;
        if (index + 1 < config.questions.length) {
          renderQuestion(dialog, body, progress, index + 1);
        } else {
          renderResult(dialog, body, progress);
        }
      });
      choices.append(button);
    });
    body.append(heading, choices);
    focusFirst(body);
  };

  const openQuiz = (trigger) => {
    if (activeDialog) return;
    previousFocus = trigger;
    answers = [];

    const dialog = make("dialog", "nq-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "nq-title");
    dialog.setAttribute("aria-describedby", "nq-intro");

    const panel = make("section", "nq-panel");
    const closeButton = make("button", "nq-close", "×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close quiz");
    closeButton.addEventListener("click", closeQuiz);

    const eyebrow = make("p", "nq-eyebrow", config.eyebrow);
    const title = make("h2", "nq-title", config.title);
    title.id = "nq-title";
    const intro = make("p", "nq-intro", config.intro);
    intro.id = "nq-intro";
    const progress = make("p", "nq-progress");
    progress.setAttribute("aria-live", "polite");
    const body = make("div", "nq-body");
    panel.append(closeButton, eyebrow, title, intro, progress, body);
    dialog.append(panel);

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeQuiz();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeQuiz();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const nodes = focusable(dialog);
      if (!nodes.length) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.body.append(dialog);
    activeDialog = dialog;
    document.body.classList.add("nq-scroll-lock");
    renderQuestion(dialog, body, progress, 0);
    dialog.showModal();
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    const origin = event.target instanceof Element ? event.target : event.target.parentElement;
    const anchor = origin && origin.closest("a[href]");
    if (!anchor || anchor.dataset.nebulaQuizFinal === "1") return;
    let url;
    try {
      url = new URL(anchor.getAttribute("href"), document.baseURI);
    } catch (_) {
      return;
    }
    if (url.origin !== window.location.origin || !/^\/go\/?$/.test(url.pathname)) return;
    if (typeof HTMLDialogElement === "undefined" ||
        typeof HTMLDialogElement.prototype.showModal !== "function") return;
    event.preventDefault();
    openQuiz(anchor);
  });
})();
