(function () {
  "use strict";

  const desktop = document.getElementById("desktop");
  const windows = document.getElementById("windows");
  const popoverLayer = document.getElementById("popover-layer");
  const spotlightLayer = document.getElementById("spotlight-layer");
  const spotlightInput = document.getElementById("spotlight-input");
  const spotlightResults = document.getElementById("spotlight-results");
  const toast = document.getElementById("toast");
  const apps = ["Finder", "Launchpad", "Browser", "App Store", "Messages", "Photos", "Calendar", "Notes", "Settings", "Siri", "Trash"];
  const symbols = { Finder: "◉", Launchpad: "▦", Browser: "⌖", "App Store": "A", Messages: "●", Photos: "✿", Calendar: "▦", Notes: "▤", Settings: "⚙", Trash: "▥", "About This Mac": "✦", Siri: "✦", Calculator: "＋", "Color Studio": "◉", Reader: "R" };
  const demoCatalog = [
    { name: "Calculator", icon: "＋", description: "A simple desktop calculator" },
    { name: "Color Studio", icon: "◉", description: "Explore colors and save a favorite" },
    { name: "Reader", icon: "R", description: "A quiet place for a short article" }
  ];
  let topZ = 10;
  let toastTimer;
  let setupStep = 0;
  let setupData = { country: "United States", wifi: "Home Wi-Fi", name: "Mac User", appearance: "light" };
  let calendarDate = new Date();
  let toggles = { "Wi-Fi": true, Bluetooth: true, Focus: false };
  function bootMac() {
    const screen = document.getElementById("boot-screen");
    const bar = document.getElementById("boot-progress-bar");
    const status = document.getElementById("boot-status");
    const setup = document.getElementById("setup-screen");
    const login = document.getElementById("login-screen");
    setup.hidden = true;
    login.hidden = true;
    screen.hidden = false;
    bar.style.width = "0%";
    const labels = ["Starting up", "Loading desktop services", "Almost ready"];
    let progress = 0;
    const timer = setInterval(function () {
      progress = Math.min(100, progress + 4);
      bar.style.width = progress + "%";
      status.textContent = labels[Math.min(2, Math.floor(progress / 38))];
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          screen.hidden = true;
          let complete = false;
          try { complete = localStorage.getItem("projectMac-setup") === "true"; } catch (error) {}
          if (complete) showLogin();
          else showSetup();
        }, 250);
      }
    }, 42);
  }

  function showSetup() {
    document.getElementById("login-screen").hidden = true;
    document.getElementById("setup-screen").hidden = false;
    setupStep = 0;
    renderSetupStep();
  }

  function renderSetupStep() {
    const content = document.getElementById("setup-content");
    const pages = [
      ["Welcome to macOS Sierra", "Let's set up your Mac. This browser replica will guide you through a short first-run setup."],
      ["Select your country or region", "This helps set your date, time, and language preferences."],
      ["Choose a Wi-Fi network", "This is a visual setup step. The selection won't connect your computer to Wi-Fi."],
      ["Transfer information", "You can move information from another Mac or PC. For this demo, start fresh."],
      ["Sign in with your Apple ID", "Apple ID sign-in is not connected in this replica. Continue without entering an account or password."],
      ["Create your computer account", "Choose a display name for this browser session. No system account or password is created."],
      ["Choose your appearance", "You can change this later in System Preferences."]
    ];
    const page = pages[setupStep];
    let body = "";
    if (setupStep === 1) {
      body = "<div class='setup-body'><label for='setup-country'>Country or region</label><select id='setup-country'><option>Poland</option><option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>Germany</option><option>France</option></select></div>";
    } else if (setupStep === 2) {
      body = "<div class='setup-body'><button class='setup-choice selected' data-setup-wifi='Home Wi-Fi'>◔ &nbsp; Home Wi-Fi</button><button class='setup-choice' data-setup-wifi='Guest Wi-Fi'>◔ &nbsp; Guest Wi-Fi</button><small>This is a sample network selector.</small></div>";
    } else if (setupStep === 3) {
      body = "<div class='setup-body'><div class='transfer-icon'>↔</div><button class='setup-choice selected'>Don't transfer information now</button></div>";
    } else if (setupStep === 4) {
      body = "<div class='setup-body'><div class='transfer-icon'>☁</div><button class='setup-choice selected' data-setup-skip>Set Up Later</button></div>";
    } else if (setupStep === 5) {
      body = "<div class='setup-body'><label for='setup-name'>Full name</label><input id='setup-name' type='text' maxlength='32' value='" + escapeHtml(setupData.name) + "' autocomplete='off' placeholder='Your name'></div>";
    } else if (setupStep === 6) {
      body = "<div class='setup-body'><div class='setup-choices'><button class='setup-choice " + (setupData.appearance === "light" ? "selected" : "") + "' data-setup-appearance='light'>☀ &nbsp; Light</button><button class='setup-choice " + (setupData.appearance === "dark" ? "selected" : "") + "' data-setup-appearance='dark'>◐ &nbsp; Dark</button></div></div>";
    } else {
      body = "<div class='setup-body'><div class='transfer-icon'>⌘</div></div>";
    }
    content.innerHTML = "<h1>" + page[0] + "</h1><p>" + page[1] + "</p>" + body;
    document.getElementById("setup-back").disabled = setupStep === 0;
    document.getElementById("setup-next").textContent = setupStep === pages.length - 1 ? "Start using macOS Sierra" : (setupStep === 4 ? "Set Up Later" : "Continue");
    document.getElementById("setup-dots").innerHTML = pages.map(function (_, index) {
      return "<span class='" + (index === setupStep ? "active" : "") + "'></span>";
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function showLogin() {
    let userName = "Mac User";
    try { userName = localStorage.getItem("projectMac-user") || userName; } catch (error) {}
    const screen = document.getElementById("login-screen");
    screen.innerHTML = "<section class='login-card'><div class='login-avatar'>◉</div><h2>" + escapeHtml(userName) + "</h2><p>macOS Sierra browser replica</p><button class='primary-button' id='login-button'>Log In</button><p style='margin-top:12px'>This is a local demo; no password is requested.</p></section>";
    screen.hidden = false;
    document.getElementById("login-button").addEventListener("click", startSession);
  }

  function startSession() {
    document.getElementById("setup-screen").hidden = true;
    document.getElementById("login-screen").hidden = true;
    document.getElementById("boot-screen").hidden = true;
    openApp("Finder");
  }

  function restartMac() {
    windows.innerHTML = "";
    bootMac();
  }

  document.getElementById("setup-next").addEventListener("click", function () {
    if (setupStep === 1) setupData.country = document.getElementById("setup-country").value;
    if (setupStep === 5) setupData.name = document.getElementById("setup-name").value.trim() || "Mac User";
    if (setupStep === 6) {
      try {
        localStorage.setItem("projectMac-setup", "true");
        localStorage.setItem("projectMac-user", setupData.name);
        localStorage.setItem("projectMac-country", setupData.country);
      } catch (error) {}
      setDark(setupData.appearance === "dark");
      startSession();
      return;
    }
    setupStep = Math.min(6, setupStep + 1);
    renderSetupStep();
  });
  document.getElementById("setup-back").addEventListener("click", function () {
    if (setupStep > 0) {
      if (setupStep === 1) setupData.country = document.getElementById("setup-country").value;
      if (setupStep === 5) setupData.name = document.getElementById("setup-name").value.trim() || "Mac User";
      setupStep -= 1;
      renderSetupStep();
    }
  });
  document.addEventListener("click", function (event) {
    const wifiChoice = event.target.closest("[data-setup-wifi]");
    if (wifiChoice) {
      setupData.wifi = wifiChoice.dataset.setupWifi;
      document.querySelectorAll("[data-setup-wifi]").forEach(function (button) { button.classList.toggle("selected", button === wifiChoice); });
      return;
    }
    const appearanceChoice = event.target.closest("[data-setup-appearance]");
    if (appearanceChoice) {
      setupData.appearance = appearanceChoice.dataset.setupAppearance;
      document.querySelectorAll("[data-setup-appearance]").forEach(function (button) { button.classList.toggle("selected", button === appearanceChoice); });
      return;
    }
    if (event.target.closest("[data-setup-skip]")) {
      setupStep = 5;
      renderSetupStep();
    }
  });

  try {
    if (localStorage.getItem("projectMac-dark") === "true") document.body.classList.add("dark-mode");
    const wallpaper = localStorage.getItem("projectMac-wallpaper");
    if (wallpaper && wallpaper !== "0") setWallpaper(Number(wallpaper), false);
  } catch (error) {}

  function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    }).format(now);
    document.getElementById("dock-day").textContent = String(now.getDate());
    document.getElementById("dock-weekday").textContent = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(now).toUpperCase();
  }
  updateClock();
  setInterval(updateClock, 30000);

  function toastMessage(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  function setActive(name) {
    document.getElementById("active-app").textContent = name === "Welcome" ? "Desktop" : name;
    document.querySelectorAll(".dock-app").forEach(function (button) {
      button.classList.toggle("open", button.dataset.open === name);
    });
  }

  function appSurface(name) {
    if (name === "Welcome") {
      return "<div class='welcome'><section class='welcome-copy'><div class='eyebrow'>A desktop in your browser</div><h1>Meet your new<br>web desktop.</h1><p>A small, interactive macOS-inspired workspace. Open apps from the dock, move their windows, and make the space your own.</p><button class='primary-button' data-action='get-started'>Explore the desktop <span aria-hidden='true'>→</span></button><p class='eyebrow' style='margin-top:18px;letter-spacing:.04em;text-transform:none;font-weight:500'>macOS Sierra · version 10.12</p></section><div class='welcome-visual'><div class='welcome-stamp'><strong>Sierra</strong><span>MACOS SIERRA · 10.12</span></div></div></div>";
    }
    if (name === "Finder") {
      return "<div class='finder-layout'><aside class='sidebar'><div class='side-heading'>Favorites</div><button class='side-link active' data-view='Recents'>◷ &nbsp; Recents</button><button class='side-link' data-view='Applications'>▦ &nbsp; Applications</button><button class='side-link' data-view='Desktop'>▣ &nbsp; Desktop</button><button class='side-link' data-view='Documents'>▤ &nbsp; Documents</button><button class='side-link' data-view='Downloads'>⇩ &nbsp; Downloads</button><div class='side-heading' style='margin-top:17px'>Locations</div><button class='side-link' data-view='Macintosh HD'>▤ &nbsp; Macintosh HD</button></aside><section class='finder-main'><div class='finder-toolbar'><h2 class='finder-heading'>Recents</h2><input class='finder-search' type='search' placeholder='Search this Mac' aria-label='Search files'></div><div class='file-grid'><button class='file-card' data-open='Notes'><span class='file-art'>🗒️</span><span>Welcome note</span><small>Today · Notes</small></button><button class='file-card' data-open='Photos'><span class='file-art'>🌈</span><span>Desktop wallpaper</span><small>Today · Image</small></button><button class='file-card' data-open='Calendar'><span class='file-art'>📅</span><span>Calendar</span><small>Today · App</small></button><button class='file-card' data-open='Settings'><span class='file-art'>⚙️</span><span>System Preferences</span><small>Applications</small></button><button class='file-card' data-open='Browser'><span class='file-art'>🌐</span><span>Safari</span><small>Applications</small></button><button class='file-card' data-open='Messages'><span class='file-art'>💬</span><span>Messages</span><small>Applications</small></button></div></section></div>";
    }
    if (name === "Notes") {
      return "<div class='notes-layout'><aside class='notes-sidebar'><h3>Notes</h3><div class='note-preview'><b>Welcome note</b><span>Saved on this device</span></div></aside><section class='note-editor'><input id='note-title' aria-label='Note title' value='Welcome to projectMac'><textarea id='note-body' aria-label='Note text' placeholder='Start typing your note…'>This little desktop is a browser-based replica inspired by macOS Sierra 10.12.

Try the dock, open System Preferences, or drag a window by its title bar. This note is saved in your browser.</textarea><div id='note-saved' class='note-saved'>Saved locally</div></section></div>";
    }
    if (name === "Calendar") {
      return "<section class='calendar-app'><div class='calendar-head'><h2 id='calendar-title'></h2><div><button aria-label='Previous month' data-calendar-step='-1'>‹</button><button aria-label='Next month' data-calendar-step='1'>›</button></div></div><div class='calendar-grid' id='calendar-grid'></div><div class='calendar-event'><strong>Today</strong> &nbsp; Your desktop is ready to explore.</div></section>";
    }
    if (name === "Browser") {
      return "<section class='browser-app'><div class='browser-toolbar'><button aria-label='Back'>‹</button><button aria-label='Forward'>›</button><button aria-label='Reload' data-action='reload-browser'>↻</button><div class='address-bar'>⌕ &nbsp; welcome.local</div><button aria-label='New tab' data-action='new-tab'>＋</button></div><div class='browser-page'><div class='browser-mark'>⌖</div><h2>Welcome to Safari</h2><p>A calm starting point for your next search.</p><form class='web-search' id='web-search'><input id='web-query' type='search' placeholder='Search the web or enter an address' aria-label='Search the web or enter an address'><button type='submit'>Search</button></form><div class='browser-shortcuts'><button class='shortcut' data-external='https://www.apple.com'><b>◉</b>Apple</button><button class='shortcut' data-external='https://www.icloud.com'><b>☁</b>iCloud</button><button class='shortcut' data-external='https://duckduckgo.com'><b>⌕</b>Search</button><button class='shortcut' data-external='https://www.wikipedia.org'><b>W</b>Wikipedia</button></div><p style='margin-top:25px'>This demo opens external pages only when you choose a shortcut or search.</p></div></section>";
    }
    if (name === "Siri") {
      return "<section class='siri-app'><div class='siri-orb'>✦</div><h2>What can I help you with?</h2><form id='siri-form'><input id='siri-query' placeholder='Try “open Notes” or “what time is it?”' aria-label='Ask Siri'><button class='primary-button' type='submit'>Ask</button></form><div id='siri-response'>Siri in this replica can open apps and answer simple local questions.</div></section>";
    }
    if (name === "App Store") {
      return "<section class='store-app'><div class='store-top'><div><h2>App Store</h2><p>Discover apps for your Mac</p></div><button class='soft-button' data-external='https://apps.apple.com/us/mac/categories'>Browse Mac App Store ↗</button></div><div class='store-feature'><div class='store-feature-icon'>✦</div><div><h3>Great apps for your desktop</h3><p>Install small demo apps into this browser replica.</p></div></div><input class='store-search' id='store-search' type='search' placeholder='Search the store' aria-label='Search demo apps'><div id='store-grid' class='store-grid'></div><p class='store-note'>Demo installs add browser apps to Launchpad. They do not download macOS software. The official Mac App Store link opens Apple’s catalog; real installs require a compatible Mac.</p></section>";
    }
    if (name === "Settings") {
      return "<div class='settings-layout'><aside class='settings-sidebar'><h3>System Preferences</h3><button class='side-link active'>◉ &nbsp; Appearance</button><button class='side-link'>▧ &nbsp; Wallpaper</button><button class='side-link'>⌨ &nbsp; Keyboard</button><button class='side-link'>⌁ &nbsp; Network</button><button class='side-link'>ⓘ &nbsp; About</button></aside><section class='setting-panel'><h2>Appearance</h2><p>Personalize your browser desktop.</p><div class='setting-row'><div>Dark appearance<small>Apply a darker look to app windows</small></div><input class='switch' id='dark-mode-toggle' type='checkbox' aria-label='Dark appearance'></div><div class='setting-row'><div>Wallpaper<small>Choose a desktop color theme</small></div><div class='wallpaper-options'><button class='wallpaper-choice active' data-wallpaper='0' aria-label='Default wallpaper'></button><button class='wallpaper-choice' data-wallpaper='1' aria-label='Warm wallpaper'></button><button class='wallpaper-choice' data-wallpaper='2' aria-label='Coastal wallpaper'></button></div></div><div class='setting-row'><div>Desktop version<small>macOS Sierra 10.12 · Browser replica</small></div><button class='soft-button' data-action='about'>About</button></div></section></div>";
    }
    if (name === "Photos") {
      return "<section class='photos-app'><h2>Photos</h2><p>Color studies from your desktop collection</p><div class='photo-grid'><div class='photo-card'><div class='photo-art'></div><span>Blue hour · Today</span></div><div class='photo-card'><div class='photo-art two'></div><span>Afterglow · Today</span></div><div class='photo-card'><div class='photo-art three'></div><span>Coastline · Yesterday</span></div></div></section>";
    }
    if (name === "Messages") {
      return "<div class='message-app'><aside class='message-list'><h3>Messages</h3><button class='side-link active'>● &nbsp; Demo chat</button></aside><section class='conversation'><div class='conversation-title'>Demo chat</div><div class='message-bubble'>Welcome! This conversation stays in this browser window.</div><div class='message-bubble mine'>Nice, the desktop is working.</div><div class='message-listing'></div><form class='message-form' style='display:flex;gap:8px;margin-top:auto'><input class='message-input' id='message-input' placeholder='Message' aria-label='Message' style='flex:1;margin-top:0'><button class='soft-button' type='submit'>Send</button></form></section></div>";
    }
    if (name === "Launchpad") {
      let buttons = "";
      const launchApps = apps.concat(getInstalledDemoApps().filter(function (app) { return !apps.includes(app); }));
      launchApps.forEach(function (app) {
        buttons += "<button class='launch-app' data-open='" + app + "'><b>" + (symbols[app] || "✦") + "</b>" + app + "</button>";
      });
      buttons += "<button class='launch-app' data-open='About This Mac'><b>✦</b>About This Mac</button>";
      return "<section class='launchpad-app'><input class='launchpad-search' id='launchpad-search' type='search' placeholder='Search apps' aria-label='Search apps'><div class='launchpad-grid'>" + buttons + "</div></section>";
    }
    if (name === "Calculator") {
      return "<section class='calculator-app'><input id='calc-display' value='0' readonly aria-label='Calculator display'><div class='calc-grid'><button data-calc='clear'>AC</button><button data-calc='sign'>±</button><button data-calc='percent'>%</button><button class='operator' data-calc='op' data-value='÷'>÷</button><button data-calc='digit' data-value='7'>7</button><button data-calc='digit' data-value='8'>8</button><button data-calc='digit' data-value='9'>9</button><button class='operator' data-calc='op' data-value='×'>×</button><button data-calc='digit' data-value='4'>4</button><button data-calc='digit' data-value='5'>5</button><button data-calc='digit' data-value='6'>6</button><button class='operator' data-calc='op' data-value='−'>−</button><button data-calc='digit' data-value='1'>1</button><button data-calc='digit' data-value='2'>2</button><button data-calc='digit' data-value='3'>3</button><button class='operator' data-calc='op' data-value='+'>+</button><button class='zero' data-calc='digit' data-value='0'>0</button><button data-calc='digit' data-value='.'>.</button><button class='operator' data-calc='equals'>=</button></div></section>";
    }
    if (name === "Color Studio") {
      return "<section class='color-studio'><h2>Color Studio</h2><p>Choose a color for your next idea.</p><div id='color-preview' class='color-preview'></div><label>Color <input id='color-input' type='color' value='#4a83bd'></label><output id='color-code'>#4A83BD</output></section>";
    }
    if (name === "Reader") {
      return "<article class='reader-app'><div class='eyebrow'>A short read</div><h2>Morning in the mountains</h2><p class='reader-byline'>A small story for your new desktop</p><p>The first light reaches the ridge before it reaches the lake. For a few quiet minutes, the mountains hold the color of the sky, and the water below keeps the day perfectly still.</p><p>Then the breeze arrives. The reflection breaks into small pieces, the trees begin to move, and the valley wakes up one sound at a time.</p><p>Some mornings are best measured by what they let you notice.</p></article>";
    }
    if (name === "About This Mac") {
      return "<section class='about-app'><div class='about-mark'>✦</div><h2>macOS Sierra 10.12</h2><p>Browser desktop concept</p><p>Styled after macOS Sierra 10.12.</p><p style='margin-top:16px'>This is a browser replica, not the macOS operating system.</p><button class='soft-button' style='margin-top:17px' data-action='close-window'>Done</button></section>";
    }
    if (name === "Trash") {
      return "<section class='trash-app'><div><b>▥</b><strong>Trash is empty</strong><p>Items you move here will appear in this demo.</p></div></section>";
    }
    return "<div class='about-app'><div class='about-mark'>✦</div><h2>" + name + "</h2><p>Desktop demo app</p></div>";
  }

  function openApp(name, view) {
    let win = Array.from(windows.querySelectorAll(".app-window")).find(function (item) { return item.dataset.app === name; });
    if (win) {
      win.classList.remove("minimized");
      win.style.zIndex = String(++topZ);
      setActive(name);
      if (view && name === "Finder") setFinderView(win, view);
      return win;
    }
    win = document.createElement("section");
    win.className = "app-window";
    if (["Notes", "Trash", "About This Mac", "Calculator"].includes(name)) win.classList.add("small");
    if (["Finder", "Photos", "Settings", "Launchpad", "App Store"].includes(name)) win.classList.add("wide");
    win.dataset.app = name;
    win.style.zIndex = String(++topZ);
    win.innerHTML = "<header class='window-titlebar'><div class='traffic-lights'><button class='close' aria-label='Close window' data-win='close'></button><button class='minimize' aria-label='Minimize window' data-win='minimize'></button><button class='maximize' aria-label='Maximize window' data-win='maximize'></button></div><div class='window-title'>" + name + "</div><div class='window-tools'><button aria-label='More options'>•••</button></div></header><div class='window-content'>" + appSurface(name) + "</div>";
    windows.appendChild(win);
    setActive(name);
    if (name === "Calendar") renderCalendar(win);
    if (name === "Notes") setupNote(win);
    if (name === "Settings") setupSettings(win);
    if (name === "Browser") setupBrowser(win);
    if (name === "Launchpad") setupLaunchpad(win);
    if (name === "Finder" && view) setFinderView(win, view);
    if (name === "Messages") setupMessages(win);
    if (name === "App Store") setupStore(win);
    if (name === "Siri") setupSiri(win);
    if (name === "Calculator") setupCalculator(win);
    if (name === "Color Studio") setupColorStudio(win);
    return win;
  }

  function setupNote(win) {
    const title = win.querySelector("#note-title");
    const body = win.querySelector("#note-body");
    const status = win.querySelector("#note-saved");
    try {
      const saved = localStorage.getItem("projectMac-note");
      if (saved) {
        const note = JSON.parse(saved);
        title.value = note.title || title.value;
        body.value = note.body || "";
      }
    } catch (error) {}
    function save() {
      try { localStorage.setItem("projectMac-note", JSON.stringify({ title: title.value, body: body.value })); } catch (error) {}
      status.textContent = "Saved locally";
    }
    title.addEventListener("input", save);
    body.addEventListener("input", save);
  }

  function renderCalendar(win) {
    const title = win.querySelector("#calendar-title");
    const grid = win.querySelector("#calendar-grid");
    if (!title || !grid) return;
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    title.textContent = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarDate);
    let html = "";
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(function (day) { html += "<div class='calendar-weekday'>" + day + "</div>"; });
    for (let i = 0; i < firstDay; i++) html += "<div class='calendar-day other'></div>";
    for (let day = 1; day <= dayCount; day++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
      html += "<div class='calendar-day" + (isToday ? " today" : "") + "'>" + day + "</div>";
    }
    grid.innerHTML = html;
  }

  function setupSettings(win) {
    const dark = win.querySelector("#dark-mode-toggle");
    dark.checked = document.body.classList.contains("dark-mode");
    dark.addEventListener("change", function () { setDark(dark.checked); });
    win.querySelectorAll(".wallpaper-choice").forEach(function (button) {
      button.classList.toggle("active", Number(button.dataset.wallpaper) === Number(localStorage.getItem("projectMac-wallpaper") || 0));
    });
  }

  function setDark(enabled) {
    document.body.classList.toggle("dark-mode", enabled);
    try { localStorage.setItem("projectMac-dark", String(enabled)); } catch (error) {}
    const input = document.getElementById("dark-mode-toggle");
    if (input) input.checked = enabled;
  }

  function setWallpaper(which, save) {
    const palettes = [
      "linear-gradient(180deg,#758895 0%,#9c9b96 31%,#d2a58d 50%,#576978 59%,#233343 72%,#172632 100%)",
      "linear-gradient(180deg,#687d91 0%,#9d8e86 33%,#e4a17f 51%,#7b5c59 61%,#342d3c 77%,#182432 100%)",
      "linear-gradient(180deg,#6d8593 0%,#a6b0ad 34%,#c9d0cf 49%,#8195a0 60%,#35536a 76%,#1d3447 100%)"
    ];
    desktop.style.background = palettes[which] || palettes[0];
    if (save) {
      try { localStorage.setItem("projectMac-wallpaper", String(which)); } catch (error) {}
    }
    document.querySelectorAll(".wallpaper-choice").forEach(function (button) {
      button.classList.toggle("active", Number(button.dataset.wallpaper) === which);
    });
  }
  function getInstalledDemoApps() {
    try {
      const installed = JSON.parse(localStorage.getItem("projectMac-installed-apps") || "[]");
      return Array.isArray(installed) ? installed : [];
    } catch (error) { return []; }
  }

  function renderStore(win) {
    const grid = win.querySelector("#store-grid");
    const search = win.querySelector("#store-search");
    if (!grid || !search) return;
    const installed = getInstalledDemoApps();
    const query = search.value.toLowerCase();
    grid.innerHTML = demoCatalog.filter(function (app) {
      return app.name.toLowerCase().includes(query) || app.description.toLowerCase().includes(query);
    }).map(function (app) {
      const done = installed.includes(app.name);
      return "<article class='store-card'><div class='store-app-icon'>" + app.icon + "</div><div><h4>" + app.name + "</h4><p>" + app.description + "</p><div class='store-progress'><span></span></div></div><button class='store-button' " + (done ? "data-store-open='" + app.name + "'" : "data-store-install='" + app.name + "'") + ">" + (done ? "Open" : "Get") + "</button></article>";
    }).join("");
  }

  function setupStore(win) {
    const search = win.querySelector("#store-search");
    search.addEventListener("input", function () { renderStore(win); });
    renderStore(win);
  }

  function installDemoApp(name, win, button) {
    button.disabled = true;
    button.textContent = "Installing";
    const card = button.closest(".store-card");
    const progress = card.querySelector(".store-progress span");
    let amount = 0;
    const timer = setInterval(function () {
      amount = Math.min(100, amount + 10);
      progress.style.width = amount + "%";
      if (amount >= 100) {
        clearInterval(timer);
        const installed = getInstalledDemoApps();
        if (!installed.includes(name)) installed.push(name);
        try { localStorage.setItem("projectMac-installed-apps", JSON.stringify(installed)); } catch (error) {}
        renderStore(win);
        const launchpad = windows.querySelector(".app-window[data-app='Launchpad']");
        if (launchpad) refreshLaunchpad(launchpad);
        toastMessage(name + " added to Launchpad");
      }
    }, 75);
  }

  function setupCalculator(win) {
    const display = win.querySelector("#calc-display");
    let current = "0";
    let stored = null;
    let operation = null;
    let freshInput = true;
    function show(value) {
      current = String(value);
      display.value = current.slice(0, 12);
    }
    function calculate() {
      if (stored === null || !operation) return;
      const right = Number(current);
      let result = right;
      if (operation === "+") result = stored + right;
      if (operation === "−") result = stored - right;
      if (operation === "×") result = stored * right;
      if (operation === "÷") result = right === 0 ? 0 : stored / right;
      show(Number.isFinite(result) ? Number(result.toPrecision(10)) : 0);
      stored = null;
      operation = null;
    }
    win.querySelectorAll("[data-calc]").forEach(function (button) {
      button.addEventListener("click", function () {
        const kind = button.dataset.calc;
        const value = button.dataset.value;
        if (kind === "clear") { stored = null; operation = null; show("0"); freshInput = true; return; }
        if (kind === "digit") {
          if (freshInput) { show(value === "." ? "0." : value); freshInput = false; }
          else if (value !== "." || !current.includes(".")) show(current === "0" && value !== "." ? value : current + value);
          return;
        }
        if (kind === "sign") { show(String(Number(current) * -1)); return; }
        if (kind === "percent") { show(String(Number(current) / 100)); return; }
        if (kind === "op") { if (stored !== null && !freshInput) calculate(); stored = Number(current); operation = value; freshInput = true; return; }
        if (kind === "equals") { calculate(); freshInput = true; }
      });
    });
  }

  function setupColorStudio(win) {
    const input = win.querySelector("#color-input");
    const preview = win.querySelector("#color-preview");
    const output = win.querySelector("#color-code");
    input.addEventListener("input", function () {
      preview.style.background = input.value;
      output.textContent = input.value.toUpperCase();
    });
    preview.style.background = input.value;
  }
  function setupSiri(win) {
    const form = win.querySelector("#siri-form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = win.querySelector("#siri-query").value.trim();
      const response = win.querySelector("#siri-response");
      const lower = query.toLowerCase();
      if (lower.startsWith("open ")) {
        const wanted = lower.slice(5).trim();
        const available = apps.concat(getInstalledDemoApps());
        const match = available.find(function (app) {
          return app.toLowerCase() === wanted || (wanted === "safari" && app === "Browser") || (wanted === "preferences" && app === "Settings");
        });
        if (match) {
          response.textContent = "Opening " + match + "…";
          setTimeout(function () { openApp(match); }, 250);
        } else response.textContent = "I couldn't find that app in this demo.";
      } else if (lower.includes("time")) {
        response.textContent = "It's " + new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date()) + ".";
      } else if (query) {
        response.textContent = "Searching the web for “" + query + "”…";
        window.open("https://duckduckgo.com/?q=" + encodeURIComponent(query), "_blank", "noopener,noreferrer");
      } else response.textContent = "Type a question or an app name.";
    });
  }
  function setupBrowser(win) {
    const form = win.querySelector("#web-search");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = win.querySelector("#web-query").value.trim();
      if (!query) return;
      const destination = /^https?:\/\//i.test(query) ? query : "https://duckduckgo.com/?q=" + encodeURIComponent(query);
      window.open(destination, "_blank", "noopener,noreferrer");
    });
  }

  function refreshLaunchpad(win) {
    const container = document.createElement("div");
    container.innerHTML = appSurface("Launchpad");
    const nextGrid = container.querySelector(".launchpad-grid");
    const currentGrid = win.querySelector(".launchpad-grid");
    if (nextGrid && currentGrid) currentGrid.innerHTML = nextGrid.innerHTML;
    const input = win.querySelector("#launchpad-search");
    const query = input ? input.value.toLowerCase() : "";
    win.querySelectorAll(".launch-app").forEach(function (button) {
      button.classList.toggle("hidden", !button.textContent.toLowerCase().includes(query));
    });
  }
  function setupLaunchpad(win) {
    const input = win.querySelector("#launchpad-search");
    input.addEventListener("input", function () {
      const query = input.value.toLowerCase();
      win.querySelectorAll(".launch-app").forEach(function (button) {
        button.classList.toggle("hidden", !button.textContent.toLowerCase().includes(query));
      });
    });
  }

  function setupMessages(win) {
    const form = win.querySelector(".message-form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = win.querySelector("#message-input");
      const value = input.value.trim();
      if (!value) return;
      const bubble = document.createElement("div");
      bubble.className = "message-bubble mine";
      bubble.textContent = value;
      win.querySelector(".conversation").insertBefore(bubble, form);
      input.value = "";
    });
  }

  function setFinderView(win, view) {
    win.querySelector(".finder-heading").textContent = view;
    win.querySelectorAll(".side-link").forEach(function (button) { button.classList.toggle("active", button.dataset.view === view); });
    const cards = win.querySelectorAll(".file-card");
    cards.forEach(function (card, index) {
      card.classList.toggle("hidden", view === "Applications" && !["Settings", "Browser", "Messages", "Calendar"].includes(card.dataset.open));
      if (view === "Desktop") card.classList.toggle("hidden", !["Notes", "Photos"].includes(card.dataset.open));
      if (view === "Documents" || view === "Downloads" || view === "Macintosh HD") card.classList.toggle("hidden", false);
      if (view === "Recents") card.classList.toggle("hidden", false);
    });
  }

  function showControlCenter() {
    popoverLayer.innerHTML = "<section class='popover'><h3>Control Center</h3><div class='control-grid'><button class='control-tile " + (toggles["Wi-Fi"] ? "on" : "") + "' data-toggle='Wi-Fi'><span class='tile-symbol'>⌁</span><span>Wi-Fi<br><small>" + (toggles["Wi-Fi"] ? "Connected" : "Off") + "</small></span></button><button class='control-tile " + (toggles.Bluetooth ? "on" : "") + "' data-toggle='Bluetooth'><span class='tile-symbol'>ᛒ</span><span>Bluetooth<br><small>" + (toggles.Bluetooth ? "On" : "Off") + "</small></span></button><button class='control-tile " + (toggles.Focus ? "on" : "") + "' data-toggle='Focus'><span class='tile-symbol'>☾</span><span>Focus<br><small>" + (toggles.Focus ? "On" : "Off") + "</small></span></button><button class='control-tile " + (document.body.classList.contains("dark-mode") ? "on" : "") + "' data-toggle='Appearance'><span class='tile-symbol'>◐</span><span>Dark mode<br><small>" + (document.body.classList.contains("dark-mode") ? "On" : "Off") + "</small></span></button></div><div class='brightness-row'>Display brightness <span id='brightness-value'>100%</span><input id='brightness' type='range' min='65' max='120' value='100' aria-label='Display brightness'></div></section>";
  }

  function showMenu(name) {
    const groups = {
      system: [["About This Mac", "about"], ["System Preferences…", "settings"], ["Run Setup Assistant…", "setup-reset"], ["Sleep", "sleep"], ["Restart", "restart"]],
      app: [["About This Desktop", "about"], ["Open Finder", "finder"], ["New Note", "notes"], ["Quit App", "close-window"]],
      file: [["New Finder Window", "finder"], ["New Note", "notes"], ["Open Photos", "photos"], ["Close Window", "close-window"]],
      edit: [["Undo", "undo"], ["Cut", "edit"], ["Copy", "edit"], ["Paste", "edit"]],
      view: [["Enter Full Screen", "fullscreen"], ["Show Desktop", "desktop"], ["Open Launchpad", "launchpad"]],
      window: [["Minimize", "minimize-window"], ["Zoom", "maximize-window"], ["Bring All to Front", "front"]],
      help: [["Desktop Help", "help"], ["About This Mac", "about"]]
    };
    let html = "<section class='popover menu-popover'>";
    (groups[name] || groups.app).forEach(function (item, index) {
      if (index === 2 && ["system", "edit", "window"].includes(name)) html += "<hr>";
      html += "<button data-pop-action='" + item[1] + "'>" + item[0] + "</button>";
    });
    html += "</section>";
    popoverLayer.innerHTML = html;
  }

  function showSpotlight(query) {
    const matches = apps.filter(function (app) { return app.toLowerCase().includes(query.toLowerCase()); });
    let html = "";
    matches.slice(0, 7).forEach(function (app) {
      html += "<button class='spotlight-result' data-open='" + app + "'><span>" + (symbols[app] || "✦") + "</span><span>" + app + "</span></button>";
    });
    html += "<button class='spotlight-result' data-open='About This Mac'><span>✦</span><span>About This Mac</span></button>";
    spotlightResults.innerHTML = html || "<div style='padding:12px;color:#777;font-size:12px'>No matching apps</div>";
  }

  function openSpotlight() {
    popoverLayer.innerHTML = "";
    spotlightLayer.hidden = false;
    spotlightInput.value = "";
    showSpotlight("");
    setTimeout(function () { spotlightInput.focus(); }, 0);
  }

  function closeSpotlight() { spotlightLayer.hidden = true; }
  function currentWindow() {
    return Array.from(windows.querySelectorAll(".app-window:not(.minimized)")).sort(function (a, b) {
      return Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0);
    })[0];
  }

  document.addEventListener("click", function (event) {
    const installButton = event.target.closest("[data-store-install]");
    if (installButton) {
      installDemoApp(installButton.dataset.storeInstall, installButton.closest(".app-window"), installButton);
      return;
    }
    const openStoreApp = event.target.closest("[data-store-open]");
    if (openStoreApp) {
      openApp(openStoreApp.dataset.storeOpen);
      return;
    }
    const openButton = event.target.closest("[data-open]");
    if (openButton) {
      openApp(openButton.dataset.open, openButton.dataset.view);
      closeSpotlight();
      popoverLayer.innerHTML = "";
      return;
    }
    const menuButton = event.target.closest("[data-menu]");
    if (menuButton) {
      const existing = popoverLayer.querySelector(".menu-popover");
      if (existing && menuButton.classList.contains("active")) {
        popoverLayer.innerHTML = "";
        document.querySelectorAll(".menubar .active").forEach(function (button) { button.classList.remove("active"); });
      } else {
        document.querySelectorAll(".menubar .active").forEach(function (button) { button.classList.remove("active"); });
        menuButton.classList.add("active");
        showMenu(menuButton.dataset.menu);
      }
      return;
    }
    const popActionButton = event.target.closest("[data-pop-action]");
    if (popActionButton) {
      const action = popActionButton.dataset.popAction;
      popoverLayer.innerHTML = "";
      if (action === "about") openApp("About This Mac");
      if (action === "settings") openApp("Settings");
      if (action === "setup-reset") { try { localStorage.removeItem("projectMac-setup"); localStorage.removeItem("projectMac-user"); } catch (error) {} windows.innerHTML = ""; showSetup(); }
      if (action === "finder") openApp("Finder");
      if (action === "notes") openApp("Notes");
      if (action === "photos") openApp("Photos");
      if (action === "launchpad") openApp("Launchpad");
      if (action === "sleep") toastMessage("Sleep is a visual demo action");
      if (action === "restart") restartMac();
      if (action === "undo") toastMessage("Nothing to undo");
      if (action === "edit") toastMessage("Clipboard actions are not connected in this demo");
      if (action === "help") openApp("About This Mac");
      if (action === "desktop") windows.querySelectorAll(".app-window").forEach(function (win) { win.classList.add("minimized"); });
      if (action === "close-window") { const win = currentWindow(); if (win) win.remove(); setActive("Finder"); }
      if (action === "minimize-window") { const win = currentWindow(); if (win) win.classList.add("minimized"); }
      if (action === "maximize-window") { const win = currentWindow(); if (win) win.classList.toggle("maximized"); }
      if (action === "fullscreen") {
        if (!document.fullscreenElement) desktop.requestFullscreen?.().catch(function () {});
        else document.exitFullscreen?.();
      }
      if (action === "front") { const win = currentWindow(); if (win) win.style.zIndex = String(++topZ); }
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const action = actionButton.dataset.action;
      if (action === "control") { popoverLayer.innerHTML = ""; showControlCenter(); }
      if (action === "siri") openApp("Siri");
      if (action === "spotlight") openSpotlight();
      if (action === "notifications") toastMessage("No new notifications");
      if (action === "get-started") { document.querySelectorAll("[data-app='Welcome']").forEach(function (win) { win.remove(); }); openApp("Finder"); }
      if (action === "about") openApp("About This Mac");
      if (action === "settings") openApp("Settings");
      if (action === "setup-reset") { try { localStorage.removeItem("projectMac-setup"); localStorage.removeItem("projectMac-user"); } catch (error) {} windows.innerHTML = ""; showSetup(); }
      if (action === "finder") openApp("Finder");
      if (action === "notes") openApp("Notes");
      if (action === "photos") openApp("Photos");
      if (action === "launchpad") openApp("Launchpad");
      if (action === "sleep") toastMessage("Sleep is a visual demo action");
      if (action === "restart") restartMac();
      if (action === "undo") toastMessage("Nothing to undo");
      if (action === "edit") toastMessage("Clipboard actions are not connected in this demo");
      if (action === "help") openApp("About This Mac");
      if (action === "desktop") { windows.querySelectorAll(".app-window").forEach(function (win) { win.classList.add("minimized"); }); }
      if (action === "close-window") { const win = actionButton.closest(".app-window") || currentWindow(); if (win) win.remove(); }
      if (action === "minimize-window") { const win = currentWindow(); if (win) win.classList.add("minimized"); }
      if (action === "maximize-window") { const win = currentWindow(); if (win) win.classList.toggle("maximized"); }
      if (action === "fullscreen") {
        if (!document.fullscreenElement) desktop.requestFullscreen?.().catch(function () {});
        else document.exitFullscreen?.();
      }
      if (action === "front") { const win = currentWindow(); if (win) win.style.zIndex = String(++topZ); }
      if (action === "reload-browser") toastMessage("This local start page is up to date");
      if (action === "new-tab") toastMessage("Open another Safari window from the dock");
      return;
    }
    const winAction = event.target.closest("[data-win]");
    if (winAction) {
      const win = winAction.closest(".app-window");
      if (winAction.dataset.win === "close") { win.remove(); setActive("Finder"); }
      if (winAction.dataset.win === "minimize") win.classList.add("minimized");
      if (winAction.dataset.win === "maximize") win.classList.toggle("maximized");
      return;
    }
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      const win = viewButton.closest(".app-window");
      if (win) setFinderView(win, viewButton.dataset.view);
      return;
    }
    const calendarButton = event.target.closest("[data-calendar-step]");
    if (calendarButton) {
      calendarDate.setMonth(calendarDate.getMonth() + Number(calendarButton.dataset.calendarStep));
      const win = calendarButton.closest(".app-window");
      renderCalendar(win);
      return;
    }
    const toggleButton = event.target.closest("[data-toggle]");
    if (toggleButton) {
      const name = toggleButton.dataset.toggle;
      if (name === "Appearance") setDark(!document.body.classList.contains("dark-mode"));
      else toggles[name] = !toggles[name];
      showControlCenter();
      return;
    }
    const wallpaperButton = event.target.closest("[data-wallpaper]");
    if (wallpaperButton) {
      setWallpaper(Number(wallpaperButton.dataset.wallpaper), true);
      return;
    }
    const external = event.target.closest("[data-external]");
    if (external) {
      window.open(external.dataset.external, "_blank", "noopener,noreferrer");
      return;
    }
    if (!event.target.closest(".popover")) {
      popoverLayer.innerHTML = "";
      document.querySelectorAll(".menubar .active").forEach(function (button) { button.classList.remove("active"); });
    }
  });

  document.addEventListener("input", function (event) {
    if (event.target === spotlightInput) showSpotlight(spotlightInput.value);
    if (event.target.matches(".finder-search")) {
      const query = event.target.value.toLowerCase();
      event.target.closest(".finder-main").querySelectorAll(".file-card").forEach(function (card) {
        card.classList.toggle("hidden", !card.textContent.toLowerCase().includes(query));
      });
    }
    if (event.target.id === "brightness") {
      const amount = Number(event.target.value);
      desktop.style.filter = "brightness(" + amount + "%)";
      const output = document.getElementById("brightness-value");
      if (output) output.textContent = amount + "%";
    }
  });

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === " ") {
      event.preventDefault();
      openSpotlight();
    }
    if (event.key === "Escape") {
      closeSpotlight();
      popoverLayer.innerHTML = "";
      document.querySelectorAll(".menubar .active").forEach(function (button) { button.classList.remove("active"); });
    }
    if (event.key === "Enter" && document.activeElement === spotlightInput) {
      const first = spotlightResults.querySelector("[data-open]");
      if (first) openApp(first.dataset.open);
      closeSpotlight();
    }
  });

  windows.addEventListener("pointerdown", function (event) {
    const titlebar = event.target.closest(".window-titlebar");
    if (!titlebar || event.target.closest(".traffic-lights") || event.target.closest(".window-tools")) return;
    const win = titlebar.closest(".app-window");
    if (win.classList.contains("maximized")) return;
    win.style.zIndex = String(++topZ);
    const rect = win.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = rect.left;
    const startTop = rect.top - 30;
    let moved = false;
    function move(moveEvent) {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (!moved) return;
      win.style.transform = "none";
      win.style.left = Math.max(0, Math.min(window.innerWidth - 100, startLeft + dx)) + "px";
      win.style.top = Math.max(0, Math.min(window.innerHeight - 120, startTop + dy)) + "px";
    }
    function end() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
  });

  windows.addEventListener("dblclick", function (event) {
    const titlebar = event.target.closest(".window-titlebar");
    if (titlebar && !event.target.closest(".traffic-lights") && !event.target.closest(".window-tools")) {
      titlebar.closest(".app-window").classList.toggle("maximized");
    }
  });

  spotlightLayer.addEventListener("click", function (event) {
    if (event.target === spotlightLayer) closeSpotlight();
  });

  bootMac();
})();













