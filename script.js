(function () {
  "use strict";

  const themeToggle = document.getElementById("themeToggle");
  function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark);
    if (themeToggle) {
      themeToggle.textContent = isDark ? "Light" : "Dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
    }
    try {
      localStorage.setItem("toolbox-theme", isDark ? "dark" : "light");
    } catch (e) {}
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(!document.body.classList.contains("dark"));
    });
  }
  try {
    if (localStorage.getItem("toolbox-theme") === "dark") applyTheme(true);
  } catch (e) {}

  let toastTimer = null;
  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function storageGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function daysBetween(isoDate) {
    const start = new Date(isoDate + "T12:00:00");
    const now = new Date();
    const ms = now.getTime() - start.getTime();
    if (isNaN(ms)) return 0;
    return Math.max(0, Math.floor(ms / 86400000));
  }

  function hoursUntil(isoDateTime) {
    const end = new Date(isoDateTime).getTime();
    if (isNaN(end)) return 0;
    return Math.max(0, Math.ceil((end - Date.now()) / 3600000));
  }

  function uid() {
    return String(Date.now()) + "-" + Math.floor(Math.random() * 10000);
  }

  const titles = {
    waiting: "Waiting on",
    replies: "Reply debt",
    impulse: "Impulse lock",
    leaveby: "Leave by",
    decisions: "Decision log",
    meetcost: "Meeting cost",
    loops: "Open loops"
  };

  const validTools = {
    waiting: true,
    replies: true,
    impulse: true,
    leaveby: true,
    decisions: true,
    meetcost: true,
    loops: true
  };

  // Breadcrumbs
  const crumbSection = document.getElementById("crumbSection");
  const crumbTool = document.getElementById("crumbTool");
  const crumbToolSep = document.querySelector(".crumb-tool-sep");

  function setBreadcrumb(toolName) {
    if (!crumbSection || !crumbTool || !crumbToolSep) return;
    if (toolName) {
      crumbSection.classList.remove("current");
      crumbSection.textContent = "Tools";
      crumbToolSep.hidden = false;
      crumbTool.hidden = false;
      crumbTool.textContent = toolName;
    } else {
      crumbSection.classList.add("current");
      crumbSection.textContent = "Tools";
      crumbToolSep.hidden = true;
      crumbTool.hidden = true;
      crumbTool.textContent = "";
    }
  }

  function updateBreadcrumbFromScroll() {
    if (document.body.dataset.tool) return;
    const about = document.getElementById("about");
    const tools = document.getElementById("tools");
    if (!crumbSection) return;
    const scrollY = window.scrollY + 120;
    if (about && scrollY >= about.offsetTop) {
      crumbSection.textContent = "About";
      crumbSection.href = "#about";
    } else if (tools && scrollY >= tools.offsetTop) {
      crumbSection.textContent = "Tools";
      crumbSection.href = "#tools";
    } else {
      crumbSection.textContent = "Home";
      crumbSection.href = "#top";
    }
  }
  window.addEventListener("scroll", updateBreadcrumbFromScroll, { passive: true });

  function inToolUI(el) {
    if (!el || !el.closest) return false;
    return !!el.closest("#toolRoot");
  }

  function buildToolContent(tool) {
    if (tool === "waiting") {
      return (
        '<p class="tool-hint">Track who or what is blocking you. The day count is the point.</p>' +
        '<label for="waitWho">Waiting on</label>' +
        '<input type="text" id="waitWho" placeholder="Alex, refund, landlord, PR review...">' +
        '<label for="waitNote">Note (optional)</label>' +
        '<input type="text" id="waitNote" placeholder="Sent email Monday...">' +
        '<label for="waitSince">Since</label>' +
        '<input type="date" id="waitSince">' +
        '<div class="btn-row"><button class="btn primary" type="button" id="waitAdd">Add</button></div>' +
        '<div id="waitList"></div>'
      );
    }
    if (tool === "replies") {
      return (
        '<p class="tool-hint">Outbound guilt. People you still need to answer.</p>' +
        '<label for="replyWho">Owe a reply to</label>' +
        '<input type="text" id="replyWho" placeholder="Sam, client, mum...">' +
        '<label for="replyAbout">About</label>' +
        '<input type="text" id="replyAbout" placeholder="Their question, that email...">' +
        '<label for="replySince">Since</label>' +
        '<input type="date" id="replySince">' +
        '<div class="btn-row"><button class="btn primary" type="button" id="replyAdd">Add</button></div>' +
        '<div id="replyList"></div>'
      );
    }
    if (tool === "impulse") {
      return (
        '<p class="tool-hint">Want to buy something? Lock it. Come back when the timer is done.</p>' +
        '<label for="impulseItem">What do you want</label>' +
        '<input type="text" id="impulseItem" placeholder="Headphones, course, jacket...">' +
        '<label for="impulseDays">Lock for (days)</label>' +
        '<select id="impulseDays">' +
        '<option value="1">1 day</option>' +
        '<option value="2" selected>2 days</option>' +
        '<option value="3">3 days</option>' +
        '<option value="7">7 days</option>' +
        "</select>" +
        '<div class="btn-row"><button class="btn primary" type="button" id="impulseAdd">Lock it</button></div>' +
        '<div id="impulseList"></div>'
      );
    }
    if (tool === "leaveby") {
      return (
        '<p class="tool-hint">Enter when you must arrive and how long the trip takes.</p>' +
        '<label for="leaveArrive">Arrive by</label>' +
        '<input type="time" id="leaveArrive" value="09:00">' +
        '<label for="leaveTravel">Travel time (minutes)</label>' +
        '<input type="number" id="leaveTravel" min="1" value="25">' +
        '<label for="leaveBuffer">Buffer (minutes)</label>' +
        '<input type="number" id="leaveBuffer" min="0" value="10">' +
        '<div class="btn-row"><button class="btn primary" type="button" id="leaveCalc">Calculate</button></div>' +
        '<div class="convert-result" id="leaveResult">Set a time and press calculate.</div>'
      );
    }
    if (tool === "decisions") {
      return (
        '<p class="tool-hint">Write the choice down once so future-you cannot rewrite the story.</p>' +
        '<label for="decTitle">Decision</label>' +
        '<input type="text" id="decTitle" placeholder="Which laptop, stay or leave...">' +
        '<label for="decChose">I chose</label>' +
        '<input type="text" id="decChose" placeholder="Option B...">' +
        '<label for="decWhy">Because</label>' +
        '<textarea id="decWhy" placeholder="Short reason..."></textarea>' +
        '<label for="decWhen">Date</label>' +
        '<input type="date" id="decWhen">' +
        '<div class="btn-row"><button class="btn primary" type="button" id="decAdd">Save decision</button></div>' +
        '<div id="decList"></div>'
      );
    }
    if (tool === "meetcost") {
      return (
        '<p class="tool-hint">Rough cost only. Useful when the invite is light and the room is full.</p>' +
        '<label for="meetPeople">People in the room</label>' +
        '<input type="number" id="meetPeople" min="1" value="4">' +
        '<label for="meetRate">Avg hourly rate (your currency)</label>' +
        '<input type="number" id="meetRate" min="0" value="40">' +
        '<label for="meetMins">Length (minutes)</label>' +
        '<input type="number" id="meetMins" min="5" value="30">' +
        '<div class="btn-row"><button class="btn primary" type="button" id="meetCalc">Estimate</button></div>' +
        '<div class="convert-result" id="meetResult">Press estimate.</div>'
      );
    }
    if (tool === "loops") {
      return (
        '<p class="tool-hint">Open loops are unfinished mental tabs. Not a to-do list. Close them or promote them.</p>' +
        '<label for="loopText">Open loop</label>' +
        '<input type="text" id="loopText" placeholder="Did I send that form? Call the dentist...">' +
        '<div class="btn-row"><button class="btn primary" type="button" id="loopAdd">Add loop</button></div>' +
        '<div id="loopList"></div>'
      );
    }
    return "<p>Unknown tool.</p>";
  }

  // Waiting
  function getWaiting() { return storageGet("toolbox-waiting", []); }
  function saveWaiting(list) { storageSet("toolbox-waiting", list); }
  function waitNudge(days) {
    if (days >= 14) return "Two weeks. Nudge or plan B.";
    if (days >= 7) return "A week. Follow up?";
    if (days >= 3) return "A few days in.";
    if (days === 0) return "Started today.";
    if (days === 1) return "One day.";
    return days + " days.";
  }
  function renderWaiting() {
    const listEl = document.getElementById("waitList");
    const sinceEl = document.getElementById("waitSince");
    if (sinceEl && !sinceEl.value) sinceEl.value = todayISO();
    if (!listEl) return;
    const items = getWaiting().slice().sort(function (a, b) {
      return daysBetween(b.since) - daysBetween(a.since);
    });
    if (!items.length) {
      listEl.innerHTML = '<p class="empty-note">Nothing pending.</p>';
      return;
    }
    listEl.innerHTML = items.map(function (item) {
      const days = daysBetween(item.since);
      const stale = days >= 7 ? " wait-stale" : "";
      return (
        '<div class="wait-item' + stale + '"><div>' +
        "<strong>" + escapeHtml(item.who) + "</strong>" +
        (item.note ? '<div class="wait-note">' + escapeHtml(item.note) + "</div>" : "") +
        '<div class="wait-meta">' + waitNudge(days) + " · since " + escapeHtml(item.since) + "</div>" +
        '</div><div class="wait-actions">' +
        '<button type="button" class="btn wait-done" data-id="' + item.id + '">Got it</button>' +
        '<button type="button" class="btn danger wait-delete" data-id="' + item.id + '">Remove</button>' +
        "</div></div>"
      );
    }).join("");
  }
  function addWaiting() {
    const whoEl = document.getElementById("waitWho");
    const noteEl = document.getElementById("waitNote");
    const sinceEl = document.getElementById("waitSince");
    if (!whoEl) return;
    const who = whoEl.value.trim();
    if (!who) return toast("Say who or what you are waiting on");
    const list = getWaiting();
    list.unshift({
      id: uid(),
      who: who,
      note: noteEl ? noteEl.value.trim() : "",
      since: sinceEl && sinceEl.value ? sinceEl.value : todayISO()
    });
    saveWaiting(list);
    whoEl.value = "";
    if (noteEl) noteEl.value = "";
    renderWaiting();
    toast("Added");
  }

  // Reply debt
  function getReplies() { return storageGet("toolbox-replies", []); }
  function saveReplies(list) { storageSet("toolbox-replies", list); }
  function renderReplies() {
    const listEl = document.getElementById("replyList");
    const sinceEl = document.getElementById("replySince");
    if (sinceEl && !sinceEl.value) sinceEl.value = todayISO();
    if (!listEl) return;
    const items = getReplies().slice().sort(function (a, b) {
      return daysBetween(b.since) - daysBetween(a.since);
    });
    if (!items.length) {
      listEl.innerHTML = '<p class="empty-note">No reply debt. Rare and nice.</p>';
      return;
    }
    listEl.innerHTML = items.map(function (item) {
      const days = daysBetween(item.since);
      const stale = days >= 5 ? " wait-stale" : "";
      return (
        '<div class="wait-item' + stale + '"><div>' +
        "<strong>" + escapeHtml(item.who) + "</strong>" +
        (item.about ? '<div class="wait-note">' + escapeHtml(item.about) + "</div>" : "") +
        '<div class="wait-meta">' + waitNudge(days) + " · since " + escapeHtml(item.since) + "</div>" +
        '</div><div class="wait-actions">' +
        '<button type="button" class="btn wait-done reply-done" data-id="' + item.id + '">Sent it</button>' +
        '<button type="button" class="btn danger reply-delete" data-id="' + item.id + '">Remove</button>' +
        "</div></div>"
      );
    }).join("");
  }
  function addReply() {
    const whoEl = document.getElementById("replyWho");
    const aboutEl = document.getElementById("replyAbout");
    const sinceEl = document.getElementById("replySince");
    if (!whoEl) return;
    const who = whoEl.value.trim();
    if (!who) return toast("Who do you owe a reply to?");
    const list = getReplies();
    list.unshift({
      id: uid(),
      who: who,
      about: aboutEl ? aboutEl.value.trim() : "",
      since: sinceEl && sinceEl.value ? sinceEl.value : todayISO()
    });
    saveReplies(list);
    whoEl.value = "";
    if (aboutEl) aboutEl.value = "";
    renderReplies();
    toast("Added");
  }

  // Impulse lock
  function getImpulse() { return storageGet("toolbox-impulse", []); }
  function saveImpulse(list) { storageSet("toolbox-impulse", list); }
  function renderImpulse() {
    const listEl = document.getElementById("impulseList");
    if (!listEl) return;
    const items = getImpulse();
    if (!items.length) {
      listEl.innerHTML = '<p class="empty-note">No locks. Either calm or dangerous.</p>';
      return;
    }
    listEl.innerHTML = items.map(function (item) {
      const unlocked = Date.now() >= new Date(item.until).getTime();
      const hours = hoursUntil(item.until);
      let status;
      if (item.passed) status = "You still wanted it after the wait.";
      else if (item.dropped) status = "Dropped. Good.";
      else if (unlocked) status = "Unlocked. Still want it?";
      else status = "Locked · about " + hours + "h left";
      const stale = unlocked && !item.passed && !item.dropped ? " wait-stale" : "";
      let actions = "";
      if (!item.passed && !item.dropped) {
        if (unlocked) {
          actions =
            '<button type="button" class="btn primary impulse-pass" data-id="' + item.id + '">Still want it</button>' +
            '<button type="button" class="btn impulse-drop" data-id="' + item.id + '">Drop it</button>';
        } else {
          actions = '<button type="button" class="btn danger impulse-delete" data-id="' + item.id + '">Remove</button>';
        }
      } else {
        actions = '<button type="button" class="btn danger impulse-delete" data-id="' + item.id + '">Remove</button>';
      }
      return (
        '<div class="wait-item' + stale + '"><div>' +
        "<strong>" + escapeHtml(item.item) + "</strong>" +
        '<div class="wait-meta">' + status + "</div>" +
        '</div><div class="wait-actions">' + actions + "</div></div>"
      );
    }).join("");
  }
  function addImpulse() {
    const itemEl = document.getElementById("impulseItem");
    const daysEl = document.getElementById("impulseDays");
    if (!itemEl) return;
    const name = itemEl.value.trim();
    if (!name) return toast("Name the thing");
    const days = parseInt(daysEl && daysEl.value ? daysEl.value : "2", 10) || 2;
    const until = new Date(Date.now() + days * 86400000).toISOString();
    const list = getImpulse();
    list.unshift({ id: uid(), item: name, until: until, passed: false, dropped: false });
    saveImpulse(list);
    itemEl.value = "";
    renderImpulse();
    toast("Locked for " + days + " day" + (days === 1 ? "" : "s"));
  }

  // Leave by
  function calcLeaveBy() {
    const arriveEl = document.getElementById("leaveArrive");
    const travelEl = document.getElementById("leaveTravel");
    const bufferEl = document.getElementById("leaveBuffer");
    const result = document.getElementById("leaveResult");
    if (!arriveEl || !result) return;
    const parts = (arriveEl.value || "09:00").split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const travel = Math.max(0, parseInt(travelEl && travelEl.value, 10) || 0);
    const buffer = Math.max(0, parseInt(bufferEl && bufferEl.value, 10) || 0);
    const total = travel + buffer;
    let leaveM = h * 60 + m - total;
    while (leaveM < 0) leaveM += 24 * 60;
    const lh = Math.floor(leaveM / 60) % 24;
    const lm = leaveM % 60;
    const pad = function (n) { return n < 10 ? "0" + n : String(n); };
    result.innerHTML =
      "<strong>Leave by " + pad(lh) + ":" + pad(lm) + "</strong><br>" +
      travel + " min travel + " + buffer + " min buffer before " + pad(h) + ":" + pad(m);
  }

  // Decisions
  function getDecisions() { return storageGet("toolbox-decisions", []); }
  function saveDecisions(list) { storageSet("toolbox-decisions", list); }
  function renderDecisions() {
    const listEl = document.getElementById("decList");
    const whenEl = document.getElementById("decWhen");
    if (whenEl && !whenEl.value) whenEl.value = todayISO();
    if (!listEl) return;
    const items = getDecisions();
    if (!items.length) {
      listEl.innerHTML = '<p class="empty-note">No decisions logged yet.</p>';
      return;
    }
    listEl.innerHTML = items.map(function (item) {
      return (
        '<div class="wait-item"><div>' +
        "<strong>" + escapeHtml(item.title) + "</strong>" +
        '<div class="wait-note">Chose: ' + escapeHtml(item.chose) + "</div>" +
        (item.why ? '<div class="wait-note">' + escapeHtml(item.why) + "</div>" : "") +
        '<div class="wait-meta">' + escapeHtml(item.when) + "</div>" +
        '</div><div class="wait-actions">' +
        '<button type="button" class="btn danger dec-delete" data-id="' + item.id + '">Remove</button>' +
        "</div></div>"
      );
    }).join("");
  }
  function addDecision() {
    const titleEl = document.getElementById("decTitle");
    const choseEl = document.getElementById("decChose");
    const whyEl = document.getElementById("decWhy");
    const whenEl = document.getElementById("decWhen");
    if (!titleEl) return;
    const title = titleEl.value.trim();
    const chose = choseEl ? choseEl.value.trim() : "";
    if (!title || !chose) return toast("Need the decision and what you chose");
    const list = getDecisions();
    list.unshift({
      id: uid(),
      title: title,
      chose: chose,
      why: whyEl ? whyEl.value.trim() : "",
      when: whenEl && whenEl.value ? whenEl.value : todayISO()
    });
    saveDecisions(list);
    titleEl.value = "";
    if (choseEl) choseEl.value = "";
    if (whyEl) whyEl.value = "";
    renderDecisions();
    toast("Saved");
  }

  // Meeting cost
  function calcMeetCost() {
    const people = Math.max(1, parseInt(document.getElementById("meetPeople") && document.getElementById("meetPeople").value, 10) || 1);
    const rate = Math.max(0, parseFloat(document.getElementById("meetRate") && document.getElementById("meetRate").value) || 0);
    const mins = Math.max(1, parseInt(document.getElementById("meetMins") && document.getElementById("meetMins").value, 10) || 30);
    const total = people * rate * (mins / 60);
    const result = document.getElementById("meetResult");
    if (!result) return;
    const rounded = Math.round(total * 100) / 100;
    result.innerHTML =
      "<strong>About " + rounded + "</strong><br>" +
      people + " people × " + rate + " /hr × " + mins + " min";
  }

  // Open loops
  function getLoops() { return storageGet("toolbox-loops", []); }
  function saveLoops(list) { storageSet("toolbox-loops", list); }
  function renderLoops() {
    const listEl = document.getElementById("loopList");
    if (!listEl) return;
    const items = getLoops();
    if (!items.length) {
      listEl.innerHTML = '<p class="empty-note">No open loops. Mind is quiet, or lying.</p>';
      return;
    }
    listEl.innerHTML = items.map(function (item) {
      const days = daysBetween(item.since);
      return (
        '<div class="wait-item"><div>' +
        "<strong>" + escapeHtml(item.text) + "</strong>" +
        '<div class="wait-meta">' + waitNudge(days) + "</div>" +
        '</div><div class="wait-actions">' +
        '<button type="button" class="btn loop-close" data-id="' + item.id + '">Close</button>' +
        '<button type="button" class="btn danger loop-delete" data-id="' + item.id + '">Remove</button>' +
        "</div></div>"
      );
    }).join("");
  }
  function addLoop() {
    const textEl = document.getElementById("loopText");
    if (!textEl) return;
    const text = textEl.value.trim();
    if (!text) return toast("Write the loop");
    const list = getLoops();
    list.unshift({ id: uid(), text: text, since: todayISO() });
    saveLoops(list);
    textEl.value = "";
    renderLoops();
    toast("Loop added");
  }

  document.addEventListener("click", function (e) {
    const t = e.target;
    if (!(t instanceof HTMLElement) || !inToolUI(t)) return;

    if (t.id === "waitAdd") addWaiting();
    if (t.classList.contains("wait-done") && !t.classList.contains("reply-done")) {
      saveWaiting(getWaiting().filter(function (x) { return x.id !== t.dataset.id; }));
      renderWaiting();
      toast("Cleared");
    }
    if (t.classList.contains("wait-delete") && !t.classList.contains("reply-delete")) {
      if (t.classList.contains("impulse-delete")) return;
      saveWaiting(getWaiting().filter(function (x) { return x.id !== t.dataset.id; }));
      renderWaiting();
    }

    if (t.id === "replyAdd") addReply();
    if (t.classList.contains("reply-done")) {
      saveReplies(getReplies().filter(function (x) { return x.id !== t.dataset.id; }));
      renderReplies();
      toast("Nice");
    }
    if (t.classList.contains("reply-delete")) {
      saveReplies(getReplies().filter(function (x) { return x.id !== t.dataset.id; }));
      renderReplies();
    }

    if (t.id === "impulseAdd") addImpulse();
    if (t.classList.contains("impulse-pass")) {
      const list = getImpulse().map(function (x) {
        if (x.id === t.dataset.id) x.passed = true;
        return x;
      });
      saveImpulse(list);
      renderImpulse();
      toast("Noted");
    }
    if (t.classList.contains("impulse-drop")) {
      const list = getImpulse().map(function (x) {
        if (x.id === t.dataset.id) x.dropped = true;
        return x;
      });
      saveImpulse(list);
      renderImpulse();
      toast("Dropped");
    }
    if (t.classList.contains("impulse-delete")) {
      saveImpulse(getImpulse().filter(function (x) { return x.id !== t.dataset.id; }));
      renderImpulse();
    }

    if (t.id === "leaveCalc") calcLeaveBy();
    if (t.id === "meetCalc") calcMeetCost();

    if (t.id === "decAdd") addDecision();
    if (t.classList.contains("dec-delete")) {
      saveDecisions(getDecisions().filter(function (x) { return x.id !== t.dataset.id; }));
      renderDecisions();
    }

    if (t.id === "loopAdd") addLoop();
    if (t.classList.contains("loop-close") || t.classList.contains("loop-delete")) {
      saveLoops(getLoops().filter(function (x) { return x.id !== t.dataset.id; }));
      renderLoops();
      if (t.classList.contains("loop-close")) toast("Closed");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!inToolUI(e.target)) return;
    if (e.key !== "Enter") return;
    const id = e.target.id;
    if (id === "waitWho") { e.preventDefault(); addWaiting(); }
    if (id === "replyWho" || id === "replyAbout") { e.preventDefault(); addReply(); }
    if (id === "impulseItem") { e.preventDefault(); addImpulse(); }
    if (id === "loopText") { e.preventDefault(); addLoop(); }
    if (id === "decTitle" || id === "decChose") { e.preventDefault(); addDecision(); }
  });

  function mountStandaloneTool() {
    const tool = document.body && document.body.dataset.tool;
    const root = document.getElementById("toolRoot");
    if (!tool || !root || !validTools[tool]) return false;

    if (!root.innerHTML.trim()) {
      root.innerHTML = buildToolContent(tool);
    }

    if (tool === "waiting") renderWaiting();
    if (tool === "replies") renderReplies();
    if (tool === "impulse") renderImpulse();
    if (tool === "leaveby") calcLeaveBy();
    if (tool === "decisions") renderDecisions();
    if (tool === "meetcost") calcMeetCost();
    if (tool === "loops") renderLoops();

    return true;
  }

  function boot() {
    mountStandaloneTool();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
