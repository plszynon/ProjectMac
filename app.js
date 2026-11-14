(function () {
  "use strict";

  const desktop = document.getElementById("desktop");
  const windows = document.getElementById("windows");
  const popoverLayer = document.getElementById("popover-layer");
  const spotlightLayer = document.getElementById("spotlight-layer");
  const spotlightInput = document.getElementById("spotlight-input");
  const spotlightResults = document.getElementById("spotlight-results");
  const toast = document.getElementById("toast");
  const apps = ["Finder", "Launchpad", "Browser", "Mail", "Contacts", "Calendar", "Notes", "Reminders", "Maps", "Photos", "Messages", "FaceTime", "Music", "Books", "App Store", "Settings", "Siri", "Trash"];
  const symbols = { Finder: "◉", Launchpad: "▦", Browser: "⌖", Mail: "✉", Contacts: "●", Calendar: "▦", Notes: "▤", Reminders: "☷", Maps: "↗", Photos: "✿", Messages: "●", FaceTime: "◖", Music: "♪", Books: "▯", "App Store": "A", Settings: "⚙", Trash: "▥", "About This Mac": "✦", Siri: "✦", Calculator: "＋", "Color Studio": "◉", Reader: "R" };
  const demoCatalog = [
    { name: "Calculator", icon: "＋", description: "A simple desktop calculator" },
    { name: "Color Studio", icon: "◉", description: "Explore colors and save a favorite" },
    { name: "Reader", icon: "R", description: "A quiet place for a short article" }
  ];
  let topZ = 10;
  let toastTimer;
  let setupStep = 0;
  let setupData = { country: "United States", wifi: "Home Wi-Fi", name: "Mac User", siri: true };
  let calendarDate = new Date();
  const finderHistories = new WeakMap();
  let toggles = { "Wi-Fi": true };
  try {
    setupData.wifi = localStorage.getItem("projectMac-wifi") || setupData.wifi;
    toggles["Wi-Fi"] = localStorage.getItem("projectMac-wifi-enabled") !== "false";
  } catch (error) {}
  function bootMac() {
    const screen = document.getElementById("boot-screen");
    const bar = document.getElementById("boot-progress-bar");
    const status = document.getElementById("boot-status");
    const setup = document.getElementById("setup-screen");
    const login = document.getElementById("login-screen");
    document.getElementById("power-screen").hidden = true;
    setup.hidden = true;
    login.hidden = true;
    screen.hidden = false;
    bar.style.width = "0%";
    const labels = ["Starting up", "Loading desktop services", "Almost ready"];
    let progress = 0;
    let finished = false;
    let watchdog;
    let timer;
    function finishBoot() {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      clearTimeout(watchdog);
      screen.hidden = true;
      let complete = false;
      try { complete = localStorage.getItem("projectMac-setup") === "true"; } catch (error) {}
      if (complete) showLogin();
      else showSetup();
    }
    timer = setInterval(function () {
      progress = Math.min(100, progress + 4);
      bar.style.width = progress + "%";
      status.textContent = labels[Math.min(2, Math.floor(progress / 38))];
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(finishBoot, 250);
      }
    }, 42);
    watchdog = setTimeout(finishBoot, 5000);
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
      ["Select your country or region", "This sets date and time display formats for this browser replica."],
      ["Choose a Wi-Fi network", "This is a visual setup step. The selection won't connect your computer to Wi-Fi."],
      ["Transfer information", "You can move information from another Mac or PC. For this demo, start fresh."],
      ["Sign in with your Apple ID", "Apple ID sign-in is not connected in this replica. Continue without entering an account or password."],
      ["Create your computer account", "Choose a display name for this browser session. No system account or password is created."],
      ["Set up Siri", "Siri came to the Mac with macOS Sierra. Choose whether to show the demo Siri controls on this desktop."]
    ];
    const page = pages[setupStep];
    let body = "";
    if (setupStep === 1) {
      const countries = ["United States", "Poland", "United Kingdom", "Canada", "Australia", "Germany", "France"];
      body = "<div class='setup-body'><label for='setup-country'>Country or region</label><select id='setup-country'>" + countries.map(function (country) { return "<option" + (country === setupData.country ? " selected" : "") + ">" + country + "</option>"; }).join("") + "</select></div>";
    } else if (setupStep === 2) {
      body = "<div class='setup-body'><button class='setup-choice " + (setupData.wifi === "Home Wi-Fi" ? "selected" : "") + "' data-setup-wifi='Home Wi-Fi'>◔ &nbsp; Home Wi-Fi</button><button class='setup-choice " + (setupData.wifi === "Guest Wi-Fi" ? "selected" : "") + "' data-setup-wifi='Guest Wi-Fi'>◔ &nbsp; Guest Wi-Fi</button><small>This is a sample network selector.</small></div>";
    } else if (setupStep === 3) {
      body = "<div class='setup-body'><div class='transfer-icon'>↔</div><button class='setup-choice selected'>Don't transfer information now</button></div>";
    } else if (setupStep === 4) {
      body = "<div class='setup-body'><div class='transfer-icon'>☁</div><button class='setup-choice selected' data-setup-skip>Set Up Later</button></div>";
    } else if (setupStep === 5) {
      body = "<div class='setup-body'><label for='setup-name'>Full name</label><input id='setup-name' type='text' maxlength='32' value='" + escapeHtml(setupData.name) + "' autocomplete='off' placeholder='Your name'></div>";
    } else if (setupStep === 6) {
      body = "<div class='setup-body'><div class='setup-choices'><button class='setup-choice " + (setupData.siri ? "selected" : "") + "' data-setup-siri='true'>✦ &nbsp; Enable Siri</button><button class='setup-choice " + (!setupData.siri ? "selected" : "") + "' data-setup-siri='false'>Not Now</button></div><small>You can open Siri from the Dock or menu bar.</small></div>";
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
    applySiriPreference();
    openApp("Finder");
  }

  function restartMac() {
    windows.innerHTML = "";
    bootMac();
  }

  function shutdownMac() {
    windows.innerHTML = "";
    document.getElementById("setup-screen").hidden = true;
    document.getElementById("login-screen").hidden = true;
    document.getElementById("boot-screen").hidden = true;
    document.getElementById("power-screen").hidden = false;
  }

  function applySiriPreference() {
    let enabled = true;
    try { enabled = localStorage.getItem("projectMac-siri") !== "false"; } catch (error) {}
    document.querySelectorAll("[data-open='Siri'], [data-action='siri']").forEach(function (item) { item.hidden = !enabled; });
  }

  document.getElementById("setup-next").addEventListener("click", function () {
    if (setupStep === 1) setupData.country = document.getElementById("setup-country").value;
    if (setupStep === 5) setupData.name = document.getElementById("setup-name").value.trim() || "Mac User";
    if (setupStep === 6) {
      try {
        localStorage.setItem("projectMac-setup", "true");
        localStorage.setItem("projectMac-user", setupData.name);
        localStorage.setItem("projectMac-country", setupData.country);
        localStorage.setItem("projectMac-wifi", setupData.wifi);
        localStorage.setItem("projectMac-wifi-enabled", "true");
      } catch (error) {}
      try { localStorage.setItem("projectMac-siri", String(setupData.siri)); } catch (error) {}
      updateClock();
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
  document.getElementById("power-on").addEventListener("click", bootMac);
  document.addEventListener("click", function (event) {
    const wifiChoice = event.target.closest("[data-setup-wifi]");
    if (wifiChoice) {
      setupData.wifi = wifiChoice.dataset.setupWifi;
      document.querySelectorAll("[data-setup-wifi]").forEach(function (button) { button.classList.toggle("selected", button === wifiChoice); });
      return;
    }
    const siriChoice = event.target.closest("[data-setup-siri]");
    if (siriChoice) {
      setupData.siri = siriChoice.dataset.setupSiri === "true";
      document.querySelectorAll("[data-setup-siri]").forEach(function (button) { button.classList.toggle("selected", button === siriChoice); });
      return;
    }
    if (event.target.closest("[data-setup-skip]")) {
      setupStep = 5;
      renderSetupStep();
    }
  });

  try {
    if (localStorage.getItem("projectMac-dark") === "true") document.body.classList.add("sierra-dark-chrome");
    const wallpaper = localStorage.getItem("projectMac-wallpaper");
    if (wallpaper && wallpaper !== "0") setWallpaper(Number(wallpaper), false);
    const dockSize = Number(localStorage.getItem("projectMac-dock-size") || 100);
    desktop.style.setProperty("--dock-scale", String(dockSize / 100));
  } catch (error) {}
  document.querySelector(".status-pill.wifi").classList.toggle("off", !toggles["Wi-Fi"]);

  function getSelectedLocale() {
    let selectedCountry = "United States";
    try { selectedCountry = localStorage.getItem("projectMac-country") || selectedCountry; } catch (error) {}
    return { "United States": "en-US", Poland: "pl-PL", "United Kingdom": "en-GB", Canada: "en-CA", Australia: "en-AU", Germany: "de-DE", France: "fr-FR" }[selectedCountry] || "en-US";
  }

  function updateClock() {
    const now = new Date();
    const locale = getSelectedLocale();
    document.getElementById("clock").textContent = new Intl.DateTimeFormat(locale, {
      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    }).format(now);
    document.getElementById("dock-day").textContent = String(now.getDate());
    document.getElementById("dock-weekday").textContent = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(now).toUpperCase();
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
    const displayName = name === "Browser" ? "Safari" : (name === "Settings" ? "System Preferences" : (name === "Music" ? "iTunes" : (name === "Books" ? "iBooks" : name)));
    document.getElementById("active-app").textContent = name === "Welcome" ? "Desktop" : displayName;
    const openApps = new Set(Array.from(windows.querySelectorAll(".app-window")).map(function (win) { return win.dataset.app; }));
    document.querySelectorAll(".dock-app").forEach(function (button) {
      button.classList.toggle("open", openApps.has(button.dataset.open));
    });
  }

  function appSurface(name) {
    if (name === "Welcome") {
      return "<div class='welcome'><section class='welcome-copy'><div class='eyebrow'>A desktop in your browser</div><h1>Meet your new<br>web desktop.</h1><p>A small, interactive macOS-inspired workspace. Open apps from the dock, move their windows, and make the space your own.</p><button class='primary-button' data-action='get-started'>Explore the desktop <span aria-hidden='true'>→</span></button><p class='eyebrow' style='margin-top:18px;letter-spacing:.04em;text-transform:none;font-weight:500'>macOS Sierra · version 10.12</p></section><div class='welcome-visual'><div class='welcome-stamp'><strong>Sierra</strong><span>MACOS SIERRA · 10.12</span></div></div></div>";
    }
    if (name === "Finder") {
      return "<div class='finder-layout'><aside class='sidebar'><div class='side-heading'>Favorites</div><button class='side-link active' data-view='Recents'>◷ &nbsp; Recents</button><button class='side-link' data-view='Applications'>▦ &nbsp; Applications</button><button class='side-link' data-view='Desktop'>▣ &nbsp; Desktop</button><button class='side-link' data-view='Documents'>▤ &nbsp; Documents</button><button class='side-link' data-view='Downloads'>⇩ &nbsp; Downloads</button><div class='side-heading' style='margin-top:17px'>iCloud</div><button class='side-link' data-view='iCloud Drive'>☁ &nbsp; iCloud Drive</button><div class='side-heading' style='margin-top:17px'>Locations</div><button class='side-link' data-view='Macintosh HD'>▤ &nbsp; Macintosh HD</button></aside><section class='finder-main'><div class='finder-toolbar'><div class='finder-nav'><button aria-label='Back' data-finder-nav='back'>‹</button><button aria-label='Forward' data-finder-nav='forward'>›</button></div><h2 class='finder-heading'>Recents</h2><input class='finder-search' type='search' placeholder='Search this Mac' aria-label='Search files'><button class='finder-view-button' aria-label='Change view'>▦</button></div><div class='file-grid'><button class='file-card' data-open='Notes'><span class='file-art note-art'>≡</span><span>Welcome note</span><small>Today · Notes</small></button><button class='file-card' data-open='Photos'><span class='file-art photo-art-small'>✿</span><span>Desktop wallpaper</span><small>Today · Image</small></button><button class='file-card' data-open='Calendar'><span class='file-art calendar-art'>14</span><span>Calendar</span><small>Today · App</small></button><button class='file-card' data-open='Settings'><span class='file-art prefs-art'>⚙</span><span>System Preferences</span><small>Applications</small></button><button class='file-card' data-open='Browser'><span class='file-art safari-art'>⌖</span><span>Safari</span><small>Applications</small></button><button class='file-card' data-open='Mail'><span class='file-art mail-art'>✉</span><span>Mail</span><small>Applications</small></button><button class='file-card' data-open='Maps'><span class='file-art map-art'>↗</span><span>Maps</span><small>Applications</small></button><button class='file-card' data-open='App Store'><span class='file-art store-art'>A</span><span>App Store</span><small>Applications</small></button><button class='file-card' data-open='Messages'><span class='file-art messages-art'>●</span><span>Messages</span><small>Applications</small></button><button class='file-card' data-open='Reminders'><span class='file-art reminder-art'>☷</span><span>Reminders</span><small>Applications</small></button></div></section></div>";
    }
    if (name === "Notes") {
      return "<div class='notes-layout'><aside class='notes-sidebar'><h3>Notes</h3><div class='note-preview'><b>Welcome note</b><span>Saved on this device</span></div></aside><section class='note-editor'><input id='note-title' aria-label='Note title' value='Welcome to projectMac'><textarea id='note-body' aria-label='Note text' placeholder='Start typing your note…'>This little desktop is a browser-based replica inspired by macOS Sierra 10.12.&#10;&#10;Try the dock, open System Preferences, or drag a window by its title bar. This note is saved in your browser.</textarea><div id='note-saved' class='note-saved'>Saved locally</div></section></div>";
    }
    if (name === "Calendar") {
      return "<section class='calendar-app'><div class='calendar-head'><h2 id='calendar-title'></h2><div><button aria-label='Previous month' data-calendar-step='-1'>‹</button><button aria-label='Next month' data-calendar-step='1'>›</button></div></div><div class='calendar-grid' id='calendar-grid'></div><div class='calendar-event'><strong>Today</strong> &nbsp; Your desktop is ready to explore.</div></section>";
    }
    if (name === "Browser") {
      return "<section class='browser-app'><div class='browser-toolbar'><button aria-label='Back' data-action='browser-back'>‹</button><button aria-label='Forward' data-action='browser-forward'>›</button><button aria-label='Reload' data-action='reload-browser'>↻</button><div class='address-bar'>⌕ &nbsp; welcome.local</div><button aria-label='New tab' data-action='new-tab'>＋</button></div><div class='browser-page'><div class='browser-mark'>⌖</div><h2>Welcome to Safari</h2><p>A calm starting point for your next search.</p><form class='web-search' id='web-search'><input id='web-query' type='search' placeholder='Search the web or enter an address' aria-label='Search the web or enter an address'><button type='submit'>Search</button></form><div class='browser-shortcuts'><button class='shortcut' data-external='https://www.apple.com'><b>◉</b>Apple</button><button class='shortcut' data-external='https://www.icloud.com'><b>☁</b>iCloud</button><button class='shortcut' data-external='https://duckduckgo.com'><b>⌕</b>Search</button><button class='shortcut' data-external='https://www.wikipedia.org'><b>W</b>Wikipedia</button></div><p style='margin-top:25px'>This demo opens external pages only when you choose a shortcut or search.</p></div></section>";
    }
    if (name === "Siri") {
      return "<section class='siri-app'><div class='siri-orb'>✦</div><h2>What can I help you with?</h2><form id='siri-form'><input id='siri-query' placeholder='Try “open Notes” or “what time is it?”' aria-label='Ask Siri'><button class='primary-button' type='submit'>Ask</button></form><div id='siri-response'>Siri in this replica can open apps and answer simple local questions.</div></section>";
    }
    if (name === "App Store") {
      return "<section class='store-app'><div class='store-top'><div><h2>App Store</h2><p>Discover apps for your Mac</p></div><button class='soft-button' data-external='https://apps.apple.com/us/mac/categories'>Browse Mac App Store ↗</button></div><div class='store-feature'><div class='store-feature-icon'>✦</div><div><h3>Great apps for your desktop</h3><p>Install small demo apps into this browser replica.</p></div></div><input class='store-search' id='store-search' type='search' placeholder='Search the store' aria-label='Search demo apps'><div id='store-grid' class='store-grid'></div><p class='store-note'>Demo installs add browser apps to Launchpad. They do not download macOS software. The official Mac App Store link opens Apple’s catalog; real installs require a compatible Mac.</p></section>";
    }
    if (name === "Mail") {
      return "<div class='mail-app'><aside class='mail-sidebar'><h3>Mailboxes</h3><button class='side-link active'>▣ &nbsp; Inbox <span>3</span></button><button class='side-link'>✉ &nbsp; Sent</button><button class='side-link'>▤ &nbsp; Drafts</button><button class='side-link'>⌫ &nbsp; Junk</button><button class='side-link'>▥ &nbsp; Trash</button></aside><section class='mail-content'><div class='mail-heading'><h2>Inbox</h2><button class='soft-button'>New Message</button></div><div class='mail-columns'><div class='mail-list'><button class='mail-row selected' data-mail-subject='Welcome to your Mac' data-mail-from='Apple' data-mail-body='Your Sierra desktop is ready. Explore your apps from the Dock and make this space your own.'><b>Welcome to your Mac</b><span>Apple</span><small>Today</small></button><button class='mail-row' data-mail-subject='A note from Alex' data-mail-from='Alex Morgan' data-mail-body='Hey! I saved a few photos for you. Open Photos from the Dock to take a look.'><b>A note from Alex</b><span>Alex Morgan</span><small>Yesterday</small></button><button class='mail-row' data-mail-subject='Weekend plans' data-mail-from='Jamie' data-mail-body='Coffee and a walk by the lake this weekend?'><b>Weekend plans</b><span>Jamie</span><small>Tue</small></button></div><article class='mail-preview'><div id='mail-from'>Apple</div><h3 id='mail-subject'>Welcome to your Mac</h3><p id='mail-body'>Your Sierra desktop is ready. Explore your apps from the Dock and make this space your own.</p></article></div></section></div>";
    }
    if (name === "Contacts") {
      return "<div class='contacts-app'><aside class='contacts-list'><h3>Contacts</h3><input id='contact-search' class='finder-search' placeholder='Search contacts'><button class='contact-row selected' data-contact='Alex Morgan' data-detail='alex@example.test' data-initial='A'>Alex Morgan</button><button class='contact-row' data-contact='Jamie Lee' data-detail='jamie@example.test' data-initial='J'>Jamie Lee</button><button class='contact-row' data-contact='Taylor Kim' data-detail='taylor@example.test' data-initial='T'>Taylor Kim</button></aside><section class='contact-detail'><div class='contact-avatar' id='contact-initial'>A</div><h2 id='contact-name'>Alex Morgan</h2><p id='contact-email'>alex@example.test</p><button class='soft-button'>Edit</button></section></div>";
    }
    if (name === "Reminders") {
      return "<div class='reminders-app'><aside class='reminders-sidebar'><h3>Reminders</h3><button class='side-link active'>🔵 &nbsp; All</button><button class='side-link'>☀ &nbsp; Today</button><button class='side-link'>▣ &nbsp; Scheduled</button></aside><section class='reminders-main'><div class='reminders-heading'><div><div class='eyebrow'>My Lists</div><h2>Reminders</h2></div><span>●</span></div><form id='reminder-form'><input id='reminder-input' placeholder='Add a reminder' aria-label='New reminder'><button class='primary-button' type='submit'>Add</button></form><ul id='reminder-list' class='reminder-list'></ul></section></div>";
    }
    if (name === "Maps") {
      return "<section class='maps-app'><div class='maps-toolbar'><form id='map-search'><input id='map-query' placeholder='Search Maps' aria-label='Search Maps'><button type='submit'>⌕</button></form><button class='soft-button'>Current Location</button></div><div class='map-canvas'><div class='map-water'></div><div class='map-park park-one'>PARK</div><div class='map-park park-two'>GARDENS</div><div class='map-road road-one'></div><div class='map-road road-two'></div><div class='map-road road-three'></div><div class='map-route'></div><div class='map-pin'>●</div><span class='map-label label-one'>Downtown</span><span class='map-label label-two'>Riverside</span><span class='map-label label-three'>Market St</span><div class='map-attribution'>Map preview · no live location</div></div></section>";
    }
    if (name === "FaceTime") {
      return "<section class='facetime-app'><div class='facetime-avatar'>◉</div><h2>FaceTime</h2><p id='facetime-status'>Ready for a demo call</p><button class='primary-button' id='facetime-call'>Start Demo Call</button><small>This is a local animation. It does not use your camera or place a real call.</small></section>";
    }
    if (name === "Music") {
      return "<section class='music-app'><aside class='music-sidebar'><h3>iTunes</h3><button class='side-link active'>♫ &nbsp; Library</button><button class='side-link'>◷ &nbsp; Recently Added</button><button class='side-link'>▤ &nbsp; Songs</button></aside><div class='music-main'><div class='music-heading'><div class='music-art'>♫</div><div><div class='eyebrow'>My Music</div><h2>Recently Added</h2></div></div><div class='track-row' data-track='Morning Light'><span>1</span><b>Morning Light</b><small>Demo Collection</small><button data-play-track='Morning Light'>▶</button></div><div class='track-row' data-track='Blue Ridge'><span>2</span><b>Blue Ridge</b><small>Demo Collection</small><button data-play-track='Blue Ridge'>▶</button></div><div class='track-row' data-track='Quiet Water'><span>3</span><b>Quiet Water</b><small>Demo Collection</small><button data-play-track='Quiet Water'>▶</button></div><div class='music-now' id='music-now'>Choose a demo track</div></div></section>";
    }
    if (name === "Books") {
      return "<article class='books-app'><div class='book-cover'>S</div><div class='eyebrow'>iBooks · Featured</div><h2>Stories from the Sierra</h2><p class='reader-byline'>A small illustrated reading sample</p><p>At the edge of the lake, the morning light reached the peaks first. The water held the mountains in a quiet mirror until the wind began to move across the valley.</p><button class='soft-button' data-action='read-book'>Read Sample</button><div id='book-sample' class='book-sample'></div></article>";
    }
    if (name === "Settings") {
      return "<section class='preferences-home'><div class='preferences-head'><h2>System Preferences</h2><input id='preferences-search' type='search' placeholder='Search System Preferences' aria-label='Search System Preferences'></div><div class='preferences-content'><div class='preferences-grid'><button class='pref-tile' data-settings-pane='General'><span class='pref-icon pref-general'>⚙</span><b>General</b></button><button class='pref-tile' data-settings-pane='Desktop & Screen Saver'><span class='pref-icon pref-desktop'>▧</span><b>Desktop &amp; Screen Saver</b></button><button class='pref-tile' data-settings-pane='Dock'><span class='pref-icon pref-dock'>▤</span><b>Dock</b></button><button class='pref-tile' data-settings-pane='Mission Control'><span class='pref-icon pref-mission'>▦</span><b>Mission Control</b></button><button class='pref-tile' data-settings-pane='Language & Region'><span class='pref-icon pref-language'>文</span><b>Language &amp; Region</b></button><button class='pref-tile' data-settings-pane='Security & Privacy'><span class='pref-icon pref-security'>▣</span><b>Security &amp; Privacy</b></button><button class='pref-tile' data-settings-pane='Spotlight'><span class='pref-icon pref-spotlight'>⌕</span><b>Spotlight</b></button><button class='pref-tile' data-settings-pane='Notifications'><span class='pref-icon pref-notifications'>☷</span><b>Notifications</b></button><button class='pref-tile' data-settings-pane='Displays'><span class='pref-icon pref-displays'>▱</span><b>Displays</b></button><button class='pref-tile' data-settings-pane='Energy Saver'><span class='pref-icon pref-energy'>▰</span><b>Energy Saver</b></button><button class='pref-tile' data-settings-pane='Keyboard'><span class='pref-icon pref-keyboard'>⌨</span><b>Keyboard</b></button><button class='pref-tile' data-settings-pane='Mouse'><span class='pref-icon pref-mouse'>●</span><b>Mouse</b></button><button class='pref-tile' data-settings-pane='Trackpad'><span class='pref-icon pref-trackpad'>▱</span><b>Trackpad</b></button><button class='pref-tile' data-settings-pane='Sound'><span class='pref-icon pref-sound'>◖</span><b>Sound</b></button><button class='pref-tile' data-settings-pane='iCloud'><span class='pref-icon pref-icloud'>☁</span><b>iCloud</b></button><button class='pref-tile' data-settings-pane='Internet Accounts'><span class='pref-icon pref-accounts'>●</span><b>Internet Accounts</b></button><button class='pref-tile' data-settings-pane='Network'><span class='pref-icon pref-network'>⌁</span><b>Network</b></button><button class='pref-tile' data-settings-pane='Bluetooth'><span class='pref-icon pref-bluetooth'>ᛒ</span><b>Bluetooth</b></button><button class='pref-tile' data-settings-pane='Sharing'><span class='pref-icon pref-sharing'>⇧</span><b>Sharing</b></button><button class='pref-tile' data-settings-pane='Users & Groups'><span class='pref-icon pref-users'>●</span><b>Users &amp; Groups</b></button><button class='pref-tile' data-settings-pane='App Store'><span class='pref-icon pref-store'>A</span><b>App Store</b></button><button class='pref-tile' data-settings-pane='Time Machine'><span class='pref-icon pref-time'>◷</span><b>Time Machine</b></button><button class='pref-tile' data-settings-pane='Accessibility'><span class='pref-icon pref-accessibility'>♿</span><b>Accessibility</b></button></div></div></section>";
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
        const launchLabel = app === "Browser" ? "Safari" : (app === "Settings" ? "System Preferences" : (app === "Music" ? "iTunes" : (app === "Books" ? "iBooks" : app)));
        buttons += "<button class='launch-app' data-open='" + app + "'><b>" + (symbols[app] || "✦") + "</b>" + launchLabel + "</button>";
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
      return "<section class='about-mac'><div class='about-overview'><div class='about-device'><span class='device-screen'></span><span class='device-base'></span></div><div><h2>macOS Sierra</h2><p>Version 10.12</p><button class='soft-button' data-action='software-update'>Software Update…</button></div></div><nav class='about-tabs'><button class='selected' data-about-tab='Overview'>Overview</button><button data-about-tab='Displays'>Displays</button><button data-about-tab='Storage'>Storage</button><button data-about-tab='Support'>Support</button><button data-about-tab='Service'>Service</button></nav><div class='about-specs' id='about-specs'><div><span>Model Name</span><b>MacBook Pro</b></div><div><span>Model Identifier</span><b>MacBookPro Demo</b></div><div><span>Processor</span><b>Intel Core Demo</b></div><div><span>Memory</span><b>8 GB</b></div><div><span>Startup Disk</span><b>Macintosh HD</b></div><div><span>Graphics</span><b>Built-in Display</b></div></div><p class='about-disclaimer'>Browser replica · no system details are read from this computer.</p></section>";
    }
    if (name === "Trash") {
      return "<section class='trash-app'><div><b>▥</b><strong>Trash is empty</strong><p>Items you move here will appear in this demo.</p></div></section>";
    }
    if (name === "Force Quit") {
      const running = Array.from(windows.querySelectorAll(".app-window")).filter(function (win) { return win.dataset.app !== "Force Quit"; });
      const rows = running.map(function (win) { return "<div class='force-quit-row'><span>" + escapeHtml(win.querySelector(".window-title").textContent) + "</span><button class='soft-button' data-force-quit='" + escapeHtml(win.dataset.app) + "'>Force Quit</button></div>"; }).join("");
      return "<section class='force-quit-app'><h2>Force Quit Applications</h2><p>If an app stops responding, select it and choose Force Quit.</p><div class='force-quit-list'>" + (rows || "<div class='force-quit-empty'>No apps are open.</div>") + "</div></section>";
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
      if (view && name === "Settings") showSettingsPane(win, view);
      return win;
    }
    win = document.createElement("section");
    win.className = "app-window";
    if (["Notes", "Trash", "About This Mac", "Calculator", "FaceTime", "Books", "Force Quit"].includes(name)) win.classList.add("small");
    if (["Finder", "Photos", "Settings", "Launchpad", "App Store", "Mail", "Contacts", "Reminders", "Maps", "Music"].includes(name)) win.classList.add("wide");
    win.dataset.app = name;
    win.style.zIndex = String(++topZ);
    const windowTitle = name === "Browser" ? "Safari" : (name === "Settings" ? "System Preferences" : (name === "Music" ? "iTunes" : (name === "Books" ? "iBooks" : name)));
    win.innerHTML = "<header class='window-titlebar'><div class='traffic-lights'><button class='close' aria-label='Close window' data-win='close'></button><button class='minimize' aria-label='Minimize window' data-win='minimize'></button><button class='maximize' aria-label='Maximize window' data-win='maximize'></button></div><div class='window-title'>" + windowTitle + "</div></header><div class='window-content'>" + appSurface(name) + "</div>";
    windows.appendChild(win);
    setActive(name);
    if (name === "Calendar") renderCalendar(win);
    if (name === "Notes") setupNote(win);
    if (name === "Settings") setupSettings(win, view);
    if (name === "Browser") setupBrowser(win);
    if (name === "Launchpad") setupLaunchpad(win);
    if (name === "Finder" && view) setFinderView(win, view);
    if (name === "Messages") setupMessages(win);
    if (name === "App Store") setupStore(win);
    if (name === "Siri") setupSiri(win);
    if (name === "Calculator") setupCalculator(win);
    if (name === "Color Studio") setupColorStudio(win);
    if (name === "About This Mac") setupAbout(win);
    if (name === "Mail") setupMail(win);
    if (name === "Contacts") setupContacts(win);
    if (name === "Reminders") setupReminders(win);
    if (name === "Maps") setupMaps(win);
    if (name === "FaceTime") setupFaceTime(win);
    if (name === "Music") setupMusic(win);
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
    const locale = getSelectedLocale();
    const weekStart = locale === "en-US" ? 0 : 1;
    title.textContent = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(calendarDate);
    let html = "";
    const weekdayBase = new Date(2024, 0, 7 + weekStart);
    for (let index = 0; index < 7; index++) {
      html += "<div class='calendar-weekday'>" + new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(weekdayBase.getFullYear(), weekdayBase.getMonth(), weekdayBase.getDate() + index)) + "</div>";
    }
    const leadingDays = (firstDay - weekStart + 7) % 7;
    for (let i = 0; i < leadingDays; i++) html += "<div class='calendar-day other'></div>";
    for (let day = 1; day <= dayCount; day++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
      html += "<div class='calendar-day" + (isToday ? " today" : "") + "'>" + day + "</div>";
    }
    grid.innerHTML = html;
  }

  function setupSettings(win, initialPane) {
    const content = win.querySelector(".preferences-content");
    win._preferencesHomeHTML = content.innerHTML;
    showSettingsPane(win, initialPane || "All Preferences");
  }

  function showSettingsPane(win, pane) {
    const content = win.querySelector(".preferences-content");
    if (!content) return;
    if (pane === "All Preferences") {
      content.innerHTML = win._preferencesHomeHTML || content.innerHTML;
      return;
    }
    let panel = "<h2>" + escapeHtml(pane) + "</h2><p>This Sierra preference pane is represented by a local browser demo.</p>";
    if (pane === "General") {
      panel = "<h2>General</h2><p>Set the appearance and basic desktop behavior for this replica.</p><div class='setting-row'><div>Dark menu bar and Dock<small>Use darker surfaces for the menu bar and Dock</small></div><input class='switch' id='dark-mode-toggle' type='checkbox' aria-label='Dark menu bar and Dock'></div><div class='setting-row'><div>macOS Sierra<small>Version 10.12 · Browser replica</small></div><button class='soft-button' data-action='about'>About This Mac…</button></div>";
    } else if (pane === "Desktop & Screen Saver") {
      panel = "<h2>Desktop &amp; Screen Saver</h2><p>Choose a Sierra-inspired desktop picture.</p><div class='wallpaper-preview'></div><div class='wallpaper-options'><button class='wallpaper-choice' data-wallpaper='0' aria-label='Sierra wallpaper'>Sierra</button><button class='wallpaper-choice' data-wallpaper='1' aria-label='Warm Sierra wallpaper'>Warm</button><button class='wallpaper-choice' data-wallpaper='2' aria-label='Cool Sierra wallpaper'>Cool</button></div>";
    } else if (pane === "Network") {
      let network = "Home Wi-Fi";
      try { network = localStorage.getItem("projectMac-wifi") || network; } catch (error) {}
      panel = "<h2>Network</h2><p>Wi-Fi status for the browser replica.</p><div class='setting-row'><div>Wi-Fi<small>" + (toggles["Wi-Fi"] ? "On · " + escapeHtml(network) + " (demo)" : "Off") + "</small></div><button class='soft-button' data-action='wifi'>Open Wi-Fi menu</button></div><p class='pane-note'>This selection does not change your computer's network connection.</p>";
    } else if (pane === "Language & Region") {
      let selectedCountry = "United States";
      try { selectedCountry = localStorage.getItem("projectMac-country") || selectedCountry; } catch (error) {}
      const countries = ["United States", "Poland", "United Kingdom", "Canada", "Australia", "Germany", "France"];
      panel = "<h2>Language &amp; Region</h2><p>Choose the regional formats used by the demo clock and Calendar.</p><div class='setting-row'><label for='region-country'>Region</label><select id='region-country'>" + countries.map(function (country) { return "<option" + (country === selectedCountry ? " selected" : "") + ">" + country + "</option>"; }).join("") + "</select></div>";
    } else if (pane === "Energy Saver") {
      panel = "<h2>Energy Saver</h2><p>Battery information is illustrative in this browser replica.</p><div class='setting-row'><div>Battery<small>Power Adapter · 100%</small></div><span class='energy-indicator'>▰</span></div><div class='setting-row'><div>Display sleep<small>Never while this demo is open</small></div><span>—</span></div>";
    } else if (pane === "Dock") {
      let size = 100;
      try { size = Number(localStorage.getItem("projectMac-dock-size") || 100); } catch (error) {}
      panel = "<h2>Dock</h2><p>Adjust the size of the Dock in this desktop.</p><div class='setting-row'><div>Size<small>Dock icon scale</small></div><input id='dock-size' type='range' min='75' max='125' value='" + size + "' aria-label='Dock size'></div><div class='setting-row'><div>Magnification<small>Icons lift on hover</small></div><span>On</span></div>";
    }
    content.innerHTML = "<div class='pref-pane'><button class='pref-back' data-settings-home>‹ &nbsp; Show All</button>" + panel + "</div>";
    const dark = win.querySelector("#dark-mode-toggle");
    if (dark) dark.checked = document.body.classList.contains("sierra-dark-chrome");
    let wallpaper = 0;
    try { wallpaper = Number(localStorage.getItem("projectMac-wallpaper") || 0); } catch (error) {}
    win.querySelectorAll(".wallpaper-choice").forEach(function (button) { button.classList.toggle("active", Number(button.dataset.wallpaper) === wallpaper); });
  }

  function setDark(enabled) {
    document.body.classList.toggle("sierra-dark-chrome", enabled);
    try { localStorage.setItem("projectMac-dark", String(enabled)); } catch (error) {}
    const input = document.getElementById("dark-mode-toggle");
    if (input) input.checked = enabled;
  }

  function setWallpaper(which, save) {
    const image = "url('assets/sierra-wallpaper.svg')";
    const palettes = [
      image,
      "linear-gradient(0deg,rgba(117,50,36,.18),rgba(225,142,86,.1))," + image,
      "linear-gradient(0deg,rgba(25,73,119,.2),rgba(114,164,194,.12))," + image
    ];
    desktop.style.backgroundImage = palettes[which] || palettes[0];
    desktop.style.backgroundPosition = "center center";
    desktop.style.backgroundSize = "cover";
    desktop.style.backgroundRepeat = "no-repeat";
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
  function setupAbout(win) {
    const labels = {
      Displays: [["Display", "Built-in Retina Display"], ["Resolution", "Demo resolution"], ["Brightness", "Default"]],
      Storage: [["Macintosh HD", "Demo storage"], ["Available", "Local browser storage only"]],
      Support: [["Support", "This is a browser replica"], ["More help", "No Apple support session is connected"]],
      Service: [["Coverage", "Demo device"], ["Serial number", "Not applicable"]]
    };
    win.querySelectorAll("[data-about-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        win.querySelectorAll("[data-about-tab]").forEach(function (item) { item.classList.toggle("selected", item === button); });
        const rows = labels[button.dataset.aboutTab] || [["Model Name", "MacBook Pro"], ["Processor", "Intel Core Demo"], ["Memory", "8 GB"], ["Startup Disk", "Macintosh HD"], ["Graphics", "Built-in Display"]];
        win.querySelector("#about-specs").innerHTML = rows.map(function (row) {
          return "<div><span>" + row[0] + "</span><b>" + row[1] + "</b></div>";
        }).join("");
      });
    });
  }
  function setupMail(win) {
    win.querySelectorAll(".mail-row").forEach(function (row) {
      row.addEventListener("click", function () {
        win.querySelectorAll(".mail-row").forEach(function (item) { item.classList.remove("selected"); });
        row.classList.add("selected");
        win.querySelector("#mail-from").textContent = row.dataset.mailFrom;
        win.querySelector("#mail-subject").textContent = row.dataset.mailSubject;
        win.querySelector("#mail-body").textContent = row.dataset.mailBody;
      });
    });
  }

  function setupContacts(win) {
    win.querySelectorAll(".contact-row").forEach(function (row) {
      row.addEventListener("click", function () {
        win.querySelectorAll(".contact-row").forEach(function (item) { item.classList.remove("selected"); });
        row.classList.add("selected");
        win.querySelector("#contact-name").textContent = row.dataset.contact;
        win.querySelector("#contact-email").textContent = row.dataset.detail;
        win.querySelector("#contact-initial").textContent = row.dataset.initial;
      });
    });
    win.querySelector("#contact-search").addEventListener("input", function (event) {
      const query = event.target.value.toLowerCase();
      win.querySelectorAll(".contact-row").forEach(function (row) {
        row.classList.toggle("hidden", !row.textContent.toLowerCase().includes(query));
      });
    });
  }

  function getReminders() {
    try {
      const items = JSON.parse(localStorage.getItem("projectMac-reminders") || '["Explore the Sierra desktop","Try an app from the Store"]');
      return Array.isArray(items) ? items : [];
    } catch (error) { return ["Explore the Sierra desktop", "Try an app from the Store"]; }
  }

  function renderReminders(win) {
    const list = win.querySelector("#reminder-list");
    if (!list) return;
    list.innerHTML = getReminders().map(function (item, index) {
      const text = typeof item === "string" ? item : item.text;
      const done = typeof item === "object" && item.done;
      return "<li class='" + (done ? "done" : "") + "'><button class='reminder-check' data-reminder-index='" + index + "' aria-label='Toggle reminder'>" + (done ? "✓" : "") + "</button><span>" + escapeHtml(text) + "</span><button class='reminder-delete' data-reminder-delete='" + index + "' aria-label='Delete reminder'>×</button></li>";
    }).join("");
  }

  function setupReminders(win) {
    const form = win.querySelector("#reminder-form");
    const input = win.querySelector("#reminder-input");
    const list = win.querySelector("#reminder-list");
    renderReminders(win);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const items = getReminders();
      items.push({ text: text, done: false });
      try { localStorage.setItem("projectMac-reminders", JSON.stringify(items)); } catch (error) {}
      input.value = "";
      renderReminders(win);
    });
    list.addEventListener("click", function (event) {
      const toggle = event.target.closest("[data-reminder-index]");
      const remove = event.target.closest("[data-reminder-delete]");
      const items = getReminders();
      if (toggle) {
        const index = Number(toggle.dataset.reminderIndex);
        const item = items[index];
        items[index] = typeof item === "string" ? { text: item, done: true } : { text: item.text, done: !item.done };
      }
      if (remove) items.splice(Number(remove.dataset.reminderDelete), 1);
      try { localStorage.setItem("projectMac-reminders", JSON.stringify(items)); } catch (error) {}
      renderReminders(win);
    });
  }

  function setupMaps(win) {
    win.querySelector("#map-search").addEventListener("submit", function (event) {
      event.preventDefault();
      const query = win.querySelector("#map-query").value.trim();
      if (query) window.open("https://maps.apple.com/?q=" + encodeURIComponent(query), "_blank", "noopener,noreferrer");
    });
  }

  function setupFaceTime(win) {
    const button = win.querySelector("#facetime-call");
    const status = win.querySelector("#facetime-status");
    button.addEventListener("click", function () {
      const connected = button.dataset.connected === "true";
      button.dataset.connected = String(!connected);
      button.textContent = connected ? "Start Demo Call" : "End Demo Call";
      status.textContent = connected ? "Ready for a demo call" : "Demo call connected";
    });
  }

  function setupMusic(win) {
    win.querySelectorAll("[data-play-track]").forEach(function (button) {
      button.addEventListener("click", function () {
        const name = button.dataset.playTrack;
        const output = win.querySelector("#music-now");
        const alreadyPlaying = output.dataset.track === name && output.dataset.playing === "true";
        output.dataset.track = name;
        output.dataset.playing = String(!alreadyPlaying);
        output.textContent = alreadyPlaying ? "Paused · " + name : "Now Playing · " + name;
        win.querySelectorAll("[data-play-track]").forEach(function (item) { item.textContent = item === button && !alreadyPlaying ? "Ⅱ" : "▶"; });
      });
    });
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
          return app.toLowerCase() === wanted || (wanted === "safari" && app === "Browser") || (wanted === "preferences" && app === "Settings") || (wanted === "system preferences" && app === "Settings") || (wanted === "itunes" && app === "Music") || (wanted === "ibooks" && app === "Books");
        });
        if (match) {
          response.textContent = "Opening " + match + "…";
          setTimeout(function () { openApp(match); }, 250);
        } else response.textContent = "I couldn't find that app in this demo.";
      } else if (lower.includes("time")) {
        response.textContent = "It's " + new Intl.DateTimeFormat(getSelectedLocale(), { hour: "numeric", minute: "2-digit" }).format(new Date()) + ".";
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

  function applyFinderView(win, view) {
    win.querySelector(".finder-heading").textContent = view;
    win.querySelectorAll(".side-link").forEach(function (button) { button.classList.toggle("active", button.dataset.view === view); });
    const cards = win.querySelectorAll(".file-card");
    cards.forEach(function (card) {
      card.classList.toggle("hidden", view === "Applications" && !["Settings", "Browser", "Messages", "Calendar", "Mail", "Contacts", "Reminders", "Maps", "Photos", "App Store", "Music", "Books"].includes(card.dataset.open));
      if (view === "Desktop") card.classList.toggle("hidden", !["Notes", "Photos"].includes(card.dataset.open));
      if (view === "Documents" || view === "Downloads" || view === "Macintosh HD" || view === "iCloud Drive" || view === "AirDrop") card.classList.toggle("hidden", false);
      if (view === "Recents") card.classList.toggle("hidden", false);
    });
  }

  function setFinderView(win, view, direction) {
    let state = finderHistories.get(win) || { views: ["Recents"], index: 0 };
    if (direction === "back") state.index = Math.max(0, state.index - 1);
    else if (direction === "forward") state.index = Math.min(state.views.length - 1, state.index + 1);
    else if (view && state.views[state.index] !== view) {
      state.views = state.views.slice(0, state.index + 1);
      state.views.push(view);
      state.index = state.views.length - 1;
    }
    finderHistories.set(win, state);
    applyFinderView(win, state.views[state.index] || "Recents");
    const back = win.querySelector("[data-finder-nav='back']");
    const forward = win.querySelector("[data-finder-nav='forward']");
    if (back) back.disabled = state.index === 0;
    if (forward) forward.disabled = state.index >= state.views.length - 1;
  }

  function runFinderHistory(direction) {
    let win = windows.querySelector(".app-window[data-app='Finder']");
    if (!win) win = openApp("Finder");
    setFinderView(win, null, direction);
  }
  function showNotifications() {
    const now = new Date();
    const today = new Intl.DateTimeFormat(getSelectedLocale(), { weekday: "long", month: "long", day: "numeric" }).format(now);
    popoverLayer.innerHTML = "<section class='notification-center'><div class='notification-tabs'><button class='selected' data-notification-tab='Today'>Today</button><button data-notification-tab='Notifications'>Notifications</button></div><div class='notification-date'>" + today + "</div><div class='notification-empty'>No new notifications</div><section class='notification-widget'><div class='notification-widget-top'><span>UP NEXT</span><span>CALENDAR</span></div><h3>Explore the Sierra desktop</h3><p>Open an app from the Dock to get started.</p></section><section class='notification-widget weather-widget'><div class='notification-widget-top'><span>WEATHER · DEMO</span><span>⌖</span></div><h3>Clear skies</h3><p>A sample weather card for the replica.</p></section></section>";
  }

  function showWifiMenu() {
    let current = "Home Wi-Fi";
    try { current = localStorage.getItem("projectMac-wifi") || current; } catch (error) {}
    popoverLayer.innerHTML = "<section class='popover status-menu wifi-menu'><h3>Wi-Fi</h3><button class='status-menu-toggle' data-toggle='Wi-Fi'><span>Wi-Fi</span><b>" + (toggles["Wi-Fi"] ? "On" : "Off") + "</b></button><hr><button class='status-menu-item' data-wifi-network='Home Wi-Fi'><span>" + (toggles["Wi-Fi"] && current === "Home Wi-Fi" ? "●" : "○") + "</span> Home Wi-Fi <small>Demo</small></button><button class='status-menu-item' data-wifi-network='Guest Wi-Fi'><span>" + (toggles["Wi-Fi"] && current === "Guest Wi-Fi" ? "●" : "○") + "</span> Guest Wi-Fi <small>Demo</small></button><hr><button class='status-menu-item' data-action='network-preferences'>Open Network Preferences…</button></section>";
  }

  function showBatteryMenu() {
    popoverLayer.innerHTML = "<section class='popover status-menu battery-menu'><h3>Battery</h3><div class='battery-level'><span class='battery-meter'><i></i></span><b>100%</b></div><p>Power Source: Power Adapter</p><small>Battery information is illustrative in this browser replica.</small><hr><button class='status-menu-item' data-action='energy-saver'>Open Energy Saver Preferences…</button></section>";
  }

  function showMenu(name) {
    const activeName = document.getElementById("active-app").textContent;
    const groups = {
      system: [["About This Mac", "about"], ["System Preferences…", "settings"], ["App Store…", "app-store"], ["Recent Items", "recent-items"], ["Force Quit…", "force-quit"], ["Sleep", "sleep"], ["Restart…", "restart"], ["Shut Down…", "shutdown"], ["Lock Screen", "lock-screen"], ["Log Out…", "logout"]],
      go: [["Back", "back"], ["Forward", "forward"], ["Recents", "recents"], ["Applications", "applications"], ["Downloads", "downloads"]],
      app: [["About " + activeName, "about-app"], ["Preferences…", "settings"], ["Services", "disabled"], ["Hide " + activeName, "minimize-window"], ["Hide Others", "hide-others"], ["Show All", "show-all"], ["Quit " + activeName, "close-window"]],
      file: [["New Finder Window", "finder"], ["New Note", "notes"], ["Open Photos", "photos"], ["Close Window", "close-window"]],
      edit: [["Undo", "undo"], ["Cut", "edit"], ["Copy", "edit"], ["Paste", "edit"]],
      view: [["Enter Full Screen", "fullscreen"], ["Show Desktop", "desktop"], ["Open Launchpad", "launchpad"]],
      window: [["Minimize", "minimize-window"], ["Zoom", "maximize-window"], ["Bring All to Front", "front"]],
      help: [["Desktop Help", "help"], ["About This Mac", "about"]]
    };
    let html = "<section class='popover menu-popover'>";
    (groups[name] || groups.app).forEach(function (item, index) {
      if (([2, 4, 5, 7, 8].includes(index) && name === "system") || (index === 2 && ["edit", "window"].includes(name)) || (name === "app" && [2, 4, 6].includes(index))) html += "<hr>";
      html += "<button data-pop-action='" + item[1] + "'" + (item[1] === "disabled" ? " disabled" : "") + ">" + item[0] + "</button>";
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

  function syncActiveWindow() {
    const win = currentWindow();
    setActive(win ? win.dataset.app : "Finder");
  }

  document.addEventListener("click", function (event) {
    const notificationTab = event.target.closest("[data-notification-tab]");
    if (notificationTab) {
      const center = notificationTab.closest(".notification-center");
      const isToday = notificationTab.dataset.notificationTab === "Today";
      center.querySelectorAll("[data-notification-tab]").forEach(function (tab) { tab.classList.toggle("selected", tab === notificationTab); });
      center.querySelector(".notification-date").hidden = !isToday;
      center.querySelectorAll(".notification-widget").forEach(function (widget) { widget.hidden = !isToday; });
      center.querySelector(".notification-empty").textContent = isToday ? "No new notifications" : "You're all caught up";
      return;
    }
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
      if (action === "about-app") toastMessage(document.getElementById("active-app").textContent + " · macOS Sierra browser replica");
      if (action === "settings") openApp("Settings");
      if (action === "app-store") openApp("App Store");
      if (action === "recent-items") openApp("Finder", "Recents");
      if (action === "force-quit") openApp("Force Quit");
      if (action === "setup-reset") { try { localStorage.removeItem("projectMac-setup"); localStorage.removeItem("projectMac-user"); } catch (error) {} windows.innerHTML = ""; showSetup(); }
      if (action === "finder") openApp("Finder");
      if (action === "applications") openApp("Finder", "Applications");
      if (action === "downloads") openApp("Finder", "Downloads");
      if (action === "recents") openApp("Finder", "Recents");
      if (action === "back" || action === "forward") runFinderHistory(action);
      if (action === "notes") openApp("Notes");
      if (action === "photos") openApp("Photos");
      if (action === "launchpad") openApp("Launchpad");
      if (action === "sleep") toastMessage("Sleep is a visual demo action");
      if (action === "restart") restartMac();
      if (action === "shutdown") shutdownMac();
      if (action === "lock-screen") showLogin();
      if (action === "logout") { windows.innerHTML = ""; showLogin(); }
      if (action === "undo") toastMessage("Nothing to undo");
      if (action === "edit") toastMessage("Clipboard actions are not connected in this demo");
      if (action === "help") openApp("About This Mac");
      if (action === "desktop") { windows.querySelectorAll(".app-window").forEach(function (win) { win.classList.add("minimized"); }); syncActiveWindow(); }
      if (action === "close-window") { const win = currentWindow(); if (win) win.remove(); syncActiveWindow(); }
      if (action === "minimize-window") { const win = currentWindow(); if (win) win.classList.add("minimized"); syncActiveWindow(); }
      if (action === "maximize-window") { const win = currentWindow(); if (win) win.classList.toggle("maximized"); }
      if (action === "fullscreen") {
        if (!document.fullscreenElement) desktop.requestFullscreen?.().catch(function () {});
        else document.exitFullscreen?.();
      }
      if (action === "front") { const win = currentWindow(); if (win) win.style.zIndex = String(++topZ); }
      if (action === "hide-others") { const front = currentWindow(); windows.querySelectorAll(".app-window").forEach(function (item) { if (item !== front) item.classList.add("minimized"); }); }
      if (action === "show-all") { windows.querySelectorAll(".app-window").forEach(function (item) { item.classList.remove("minimized"); }); syncActiveWindow(); }
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const action = actionButton.dataset.action;
      if (action === "wifi") { if (popoverLayer.querySelector(".wifi-menu")) popoverLayer.innerHTML = ""; else showWifiMenu(); }
      if (action === "battery") { if (popoverLayer.querySelector(".battery-menu")) popoverLayer.innerHTML = ""; else showBatteryMenu(); }
      if (action === "siri") openApp("Siri");
      if (action === "spotlight") openSpotlight();
      if (action === "notifications") { if (popoverLayer.querySelector(".notification-center")) popoverLayer.innerHTML = ""; else showNotifications(); }
      if (action === "get-started") { document.querySelectorAll("[data-app='Welcome']").forEach(function (win) { win.remove(); }); openApp("Finder"); }
      if (action === "about") openApp("About This Mac");
      if (action === "about-app") toastMessage(document.getElementById("active-app").textContent + " · macOS Sierra browser replica");
      if (action === "settings") openApp("Settings");
      if (action === "app-store") openApp("App Store");
      if (action === "recent-items") openApp("Finder", "Recents");
      if (action === "force-quit") openApp("Force Quit");
      if (action === "setup-reset") { try { localStorage.removeItem("projectMac-setup"); localStorage.removeItem("projectMac-user"); } catch (error) {} windows.innerHTML = ""; showSetup(); }
      if (action === "finder") openApp("Finder");
      if (action === "applications") openApp("Finder", "Applications");
      if (action === "downloads") openApp("Finder", "Downloads");
      if (action === "recents") openApp("Finder", "Recents");
      if (action === "back" || action === "forward") runFinderHistory(action);
      if (action === "notes") openApp("Notes");
      if (action === "photos") openApp("Photos");
      if (action === "launchpad") openApp("Launchpad");
      if (action === "sleep") toastMessage("Sleep is a visual demo action");
      if (action === "restart") restartMac();
      if (action === "shutdown") shutdownMac();
      if (action === "lock-screen") showLogin();
      if (action === "logout") { windows.innerHTML = ""; showLogin(); }
      if (action === "undo") toastMessage("Nothing to undo");
      if (action === "edit") toastMessage("Clipboard actions are not connected in this demo");
      if (action === "help") openApp("About This Mac");
      if (action === "desktop") { windows.querySelectorAll(".app-window").forEach(function (win) { win.classList.add("minimized"); }); syncActiveWindow(); }
      if (action === "close-window") { const win = actionButton.closest(".app-window") || currentWindow(); if (win) win.remove(); syncActiveWindow(); }
      if (action === "minimize-window") { const win = currentWindow(); if (win) win.classList.add("minimized"); syncActiveWindow(); }
      if (action === "maximize-window") { const win = currentWindow(); if (win) win.classList.toggle("maximized"); }
      if (action === "fullscreen") {
        if (!document.fullscreenElement) desktop.requestFullscreen?.().catch(function () {});
        else document.exitFullscreen?.();
      }
      if (action === "front") { const win = currentWindow(); if (win) win.style.zIndex = String(++topZ); }
      if (action === "hide-others") { const front = currentWindow(); windows.querySelectorAll(".app-window").forEach(function (item) { if (item !== front) item.classList.add("minimized"); }); }
      if (action === "show-all") { windows.querySelectorAll(".app-window").forEach(function (item) { item.classList.remove("minimized"); }); syncActiveWindow(); }
      if (action === "reload-browser") toastMessage("This local start page is up to date");
      if (action === "software-update") toastMessage("Software Update is a visual demo only");
      if (action === "network-preferences") openApp("Settings", "Network");
      if (action === "energy-saver") openApp("Settings", "Energy Saver");
      if (action === "new-tab") toastMessage("Open another Safari window from the dock");
      if (action === "browser-back" || action === "browser-forward") toastMessage("No Safari page history in this demo yet");
      if (action === "read-book") { const book = actionButton.closest(".app-window"); if (book) book.querySelector("#book-sample").textContent = "The trail wound through the pines and opened onto a still lake. Far above, the granite peaks caught the last warm light of evening."; }
      return;
    }
    const winAction = event.target.closest("[data-win]");
    if (winAction) {
      const win = winAction.closest(".app-window");
      if (winAction.dataset.win === "close") { win.remove(); syncActiveWindow(); }
      if (winAction.dataset.win === "minimize") { win.classList.add("minimized"); syncActiveWindow(); }
      if (winAction.dataset.win === "maximize") win.classList.toggle("maximized");
      return;
    }
    const forceQuitButton = event.target.closest("[data-force-quit]");
    if (forceQuitButton) {
      const appName = forceQuitButton.dataset.forceQuit;
      const target = Array.from(windows.querySelectorAll(".app-window")).find(function (item) { return item.dataset.app === appName; });
      if (target) target.remove();
      const forceQuitWindow = windows.querySelector(".app-window[data-app='Force Quit']");
      if (forceQuitWindow) forceQuitWindow.querySelector(".window-content").innerHTML = appSurface("Force Quit");
      syncActiveWindow();
      return;
    }
    const finderNav = event.target.closest("[data-finder-nav]");
    if (finderNav) {
      const win = finderNav.closest(".app-window");
      setFinderView(win, null, finderNav.dataset.finderNav);
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
      toggles[name] = !toggles[name];
      try { localStorage.setItem("projectMac-wifi-enabled", String(toggles[name])); } catch (error) {}
      document.querySelector(".status-pill.wifi").classList.toggle("off", !toggles[name]);
      showWifiMenu();
      return;
    }
    const networkButton = event.target.closest("[data-wifi-network]");
    if (networkButton) {
      if (toggles["Wi-Fi"]) {
        try { localStorage.setItem("projectMac-wifi", networkButton.dataset.wifiNetwork); } catch (error) {}
        toastMessage("Connected to " + networkButton.dataset.wifiNetwork + " (demo)");
        showWifiMenu();
      } else toastMessage("Turn on Wi-Fi to join a network");
      return;
    }
    const settingsPaneButton = event.target.closest("[data-settings-pane]");
    if (settingsPaneButton) {
      const win = settingsPaneButton.closest(".app-window");
      if (win) showSettingsPane(win, settingsPaneButton.dataset.settingsPane);
      return;
    }
    const settingsHomeButton = event.target.closest("[data-settings-home]");
    if (settingsHomeButton) {
      const win = settingsHomeButton.closest(".app-window");
      if (win) showSettingsPane(win, "All Preferences");
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
    if (!event.target.closest(".popover") && !event.target.closest(".notification-center")) {
      popoverLayer.innerHTML = "";
      document.querySelectorAll(".menubar .active").forEach(function (button) { button.classList.remove("active"); });
    }
  });

  document.addEventListener("input", function (event) {
    if (event.target === spotlightInput) showSpotlight(spotlightInput.value);
    if (event.target.id === "preferences-search") {
      const query = event.target.value.toLowerCase();
      event.target.closest(".app-window").querySelectorAll(".pref-tile").forEach(function (tile) { tile.classList.toggle("hidden", !tile.textContent.toLowerCase().includes(query)); });
    }
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
    if (event.target.id === "dock-size") {
      const amount = Number(event.target.value);
      desktop.style.setProperty("--dock-scale", String(amount / 100));
      try { localStorage.setItem("projectMac-dock-size", String(amount)); } catch (error) {}
    }
  });

  document.addEventListener("change", function (event) {
    if (event.target.id === "dark-mode-toggle") setDark(event.target.checked);
    if (event.target.id === "region-country") {
      try { localStorage.setItem("projectMac-country", event.target.value); } catch (error) {}
      updateClock();
      windows.querySelectorAll(".app-window[data-app='Calendar']").forEach(function (win) { renderCalendar(win); });
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
    const win = event.target.closest(".app-window");
    if (win) {
      win.style.zIndex = String(++topZ);
      setActive(win.dataset.app);
    }
    const titlebar = event.target.closest(".window-titlebar");
    if (!titlebar || event.target.closest(".traffic-lights") || event.target.closest(".window-tools")) return;
    const titlebarWindow = titlebar.closest(".app-window");
    if (titlebarWindow.classList.contains("maximized")) return;
    const rect = titlebarWindow.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = rect.left;
    const startTop = rect.top - 26;
    let moved = false;
    function move(moveEvent) {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (!moved) return;
      titlebarWindow.style.transform = "none";
      titlebarWindow.style.left = Math.max(0, Math.min(window.innerWidth - 100, startLeft + dx)) + "px";
      titlebarWindow.style.top = Math.max(0, Math.min(window.innerHeight - 120, startTop + dy)) + "px";
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




























