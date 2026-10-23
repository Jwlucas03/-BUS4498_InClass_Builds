(function () {
  "use strict";

  const config = window.EVENT_RADAR_CONFIG || {};
  const hasConfig = Boolean(
    config.supabaseUrl &&
    /^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(config.supabaseUrl) &&
    /^sb_publishable_[a-zA-Z0-9_-]+$/.test(config.publishableKey || "")
  );
  const supabaseClient = hasConfig ? window.supabase.createClient(config.supabaseUrl, config.publishableKey) : null;
  const publicColumns = "id,created_at,status,title,club,event_date,start_time,end_time,place_name,place_detail,cost,free_food,summary";
  const board = document.querySelector("#event-board");
  const boardStatus = document.querySelector("#board-status");
  const waitingBoard = document.querySelector("#waiting-board");
  const waitingStatus = document.querySelector("#waiting-status");
  const moderatorRoute = document.querySelector("#moderator-route");
  const moderatorAuth = document.querySelector("#moderator-auth");
  const moderatorView = document.querySelector("#moderator-view");
  const authStatus = document.querySelector("#auth-status");
  const result = document.querySelector("#post-result");
  let currentUser = null;
  let authReady = !supabaseClient;
  let events = [];
  let activeFilter = "all";

  function isModerator() {
    return Boolean(currentUser && currentUser.app_metadata && currentUser.app_metadata.role === "moderator");
  }

  function syncModeratorRoute() {
    moderatorRoute.open = window.location.hash === "#moderator";
  }

  function clearWaitingView(message) {
    waitingBoard.replaceChildren();
    setText(waitingStatus, message);
  }

  function setText(element, value) {
    element.textContent = value == null ? "" : String(value);
  }

  function formatDate(event) {
    if (!event.event_date) return "";
    const date = new Date(`${event.event_date}T12:00:00`);
    return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
  }

  function formatTime(value) {
    if (!value) return "";
    const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
    const date = new Date(2000, 0, 1, hours, minutes);
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
  }

  function createTag(text, className) {
    const tag = document.createElement("span");
    tag.className = className || "tag";
    setText(tag, text);
    return tag;
  }

  function createEventCard(event, includeReview) {
    const item = document.createElement("li");
    item.className = "event";

    const date = document.createElement("div");
    date.className = event.event_date ? "date" : "date tba";
    if (event.event_date) {
      const dateValue = new Date(`${event.event_date}T12:00:00`);
      const month = document.createElement("span");
      month.className = "mon";
      setText(month, new Intl.DateTimeFormat("en-US", { month: "short" }).format(dateValue));
      const day = document.createElement("span");
      day.className = "day";
      setText(day, dateValue.getDate());
      date.append(month, day);
    } else {
      const day = document.createElement("span");
      day.className = "day";
      setText(day, "TBA");
      date.append(day);
    }
    item.append(date);

    const body = document.createElement("div");
    body.className = "event-body";
    const when = document.createElement("p");
    when.className = "when";
    const time = [formatTime(event.start_time), formatTime(event.end_time)].filter(Boolean).join(" to ");
    setText(when, [formatDate(event), time].filter(Boolean).join(" · ") || "Time and date to be announced");
    const title = document.createElement("h3");
    setText(title, event.title || "Untitled event");
    const meta = document.createElement("p");
    meta.className = "meta";
    setText(meta, [event.club, event.place_name, event.place_detail].filter(Boolean).join(" · "));
    const summary = document.createElement("p");
    summary.className = "summary";
    setText(summary, event.summary || "");
    const tags = document.createElement("p");
    tags.className = "tags";
    if (event.cost && event.cost.toLowerCase() === "free") tags.append(createTag("Free"));
    if (event.free_food) tags.append(createTag("🍕 Free food", "tag food"));
    body.append(when, title, meta, summary, tags);
    item.append(body);

    if (includeReview) {
      const review = document.createElement("div");
      review.className = "review";
      const why = document.createElement("p");
      why.className = "why";
      setText(why, event.status_reason || "This post needs moderator review.");
      const original = document.createElement("p");
      original.className = "original";
      setText(original, event.announcement || "Original announcement unavailable.");
      const actions = document.createElement("p");
      actions.className = "actions";
      const approve = document.createElement("button");
      approve.type = "button";
      approve.textContent = "Approve";
      approve.addEventListener("click", () => reviewEvent(event, "published", review));
      const reject = document.createElement("button");
      reject.type = "button";
      reject.className = "ghost";
      reject.textContent = "Reject";
      reject.addEventListener("click", () => reviewEvent(event, "rejected", review));
      actions.append(approve, reject);
      review.append(why, original, actions);
      body.append(review);
    }
    return item;
  }

  function renderEvents() {
    board.replaceChildren();
    const visible = events.filter((event) => {
      if (activeFilter === "food") return event.free_food;
      if (activeFilter === "free") return (event.cost || "").toLowerCase() === "free";
      return true;
    });
    if (!visible.length) {
      const empty = document.createElement("li");
      empty.className = "empty";
      setText(empty, "No events yet. Post the first one!");
      board.append(empty);
      return;
    }
    visible.forEach((event) => board.append(createEventCard(event, false)));
  }

  async function loadPublishedEvents() {
    if (!supabaseClient) {
      setText(boardStatus, "Add the publishable key in config.js to connect this board.");
      renderEvents();
      return;
    }
    setText(boardStatus, "Loading events…");
    const { data, error } = await supabaseClient
      .from("events")
      .select(publicColumns)
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });
    if (error) {
      setText(boardStatus, "The event board could not be loaded.");
      console.error(error);
      return;
    }
    events = data || [];
    setText(boardStatus, `${events.length} published ${events.length === 1 ? "event" : "events"}`);
    renderEvents();
  }

  function showResult(kind, label, message, reasons) {
    result.hidden = false;
    result.className = `result ${kind}`;
    setText(result.querySelector(".result-label"), label);
    setText(result.querySelector(".result-message"), message);
    const list = result.querySelector(".reasons");
    list.replaceChildren();
    (reasons || []).forEach((reason) => {
      const item = document.createElement("li");
      setText(item, reason);
      list.append(item);
    });
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = form.elements.announcement.value.trim();
    if (!text) return;
    if (!supabaseClient) {
      showResult("error", "Not connected", "Add the publishable key in config.js before posting.");
      return;
    }
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const response = await fetch(`${config.supabaseUrl}/functions/v1/submit-event`, {
        method: "POST",
        headers: { apikey: config.publishableKey },
        body: new URLSearchParams({ announcement: text }),
      });
      const answer = await response.json();
      if (!response.ok || !answer.ok) throw new Error(answer.message || "The agent could not process this post.");
      const label = answer.status === "published" ? "Published" : answer.status === "duplicate" ? "Already posted" : answer.status === "waiting" ? "Waiting for review" : "Not posted";
      showResult(answer.status, label, answer.message || "", answer.reasons);
      form.reset();
      await loadPublishedEvents();
    } catch (error) {
      showResult("error", "Could not post", error.message);
    } finally {
      button.disabled = false;
    }
  }

  async function loadWaitingEvents() {
    if (!authReady || !isModerator() || !supabaseClient) return;
    setText(waitingStatus, "Loading waiting posts…");
    const { data, error } = await supabaseClient
      .from("events")
      .select("id,created_at,status,status_reason,announcement,title,club,event_date,start_time,end_time,place_name,place_detail,cost,free_food,summary")
      .eq("status", "waiting")
      .order("created_at", { ascending: true });
    if (error) {
      setText(waitingStatus, "Waiting posts could not be loaded.");
      console.error(error);
      return;
    }
    waitingBoard.replaceChildren();
    if (!data.length) {
      setText(waitingStatus, "Nothing is waiting for review.");
      return;
    }
    setText(waitingStatus, `${data.length} post${data.length === 1 ? "" : "s"} waiting`);
    data.forEach((event) => waitingBoard.append(createEventCard(event, true)));
  }

  async function reviewEvent(event, status, reviewElement) {
    if (!isModerator() || !supabaseClient) return;
    const buttons = reviewElement.querySelectorAll("button");
    buttons.forEach((button) => { button.disabled = true; });
    const { error } = await supabaseClient
      .from("events")
      .update({ status, status_reason: status === "published" ? "Approved by moderator." : "Rejected by moderator.", reviewed_at: new Date().toISOString(), reviewed_by: currentUser.id })
      .eq("id", event.id)
      .eq("status", "waiting");
    if (error) {
      buttons.forEach((button) => { button.disabled = false; });
      setText(waitingStatus, `Could not update the post: ${error.message}`);
      return;
    }
    await loadWaitingEvents();
    await loadPublishedEvents();
  }

  function updateAuthView() {
    syncModeratorRoute();
    const signedIn = Boolean(currentUser);
    const authorized = isModerator();

    if (!authReady) {
      moderatorAuth.hidden = false;
      moderatorView.hidden = true;
      setText(authStatus, "Checking your session…");
      clearWaitingView("Checking moderator access…");
      return;
    }

    moderatorAuth.hidden = authorized;
    moderatorView.hidden = !authorized;
    if (authorized) {
      setText(document.querySelector("#moderator-email-label"), currentUser.email);
      void loadWaitingEvents();
    } else if (signedIn) {
      setText(authStatus, "This account is signed in but is not authorized as a moderator.");
      clearWaitingView("Moderator access is required.");
    } else {
      setText(authStatus, "");
      clearWaitingView("Sign in to see waiting posts.");
    }
  }

  async function refreshAuthenticatedUser() {
    if (!supabaseClient) {
      currentUser = null;
      authReady = true;
      updateAuthView();
      return;
    }

    authReady = false;
    updateAuthView();
    const { data, error } = await supabaseClient.auth.getUser();
    currentUser = error ? null : data.user;
    authReady = true;
    updateAuthView();
    if (error && error.name !== "AuthSessionMissingError") console.error(error);
  }

  async function signIn(event) {
    event.preventDefault();
    if (!supabaseClient) {
      setText(authStatus, "Add the publishable key in config.js before signing in.");
      return;
    }
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    setText(authStatus, "Signing in…");
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email: form.elements.email.value.trim(), password: form.elements.password.value });
    button.disabled = false;
    if (error) {
      setText(authStatus, "Sign-in failed. Check the moderator email and password.");
      console.error(error);
      return;
    }
    currentUser = data.user;
    form.reset();
    await refreshAuthenticatedUser();
    moderatorRoute.open = true;
    window.location.hash = "moderator";
  }

  async function signOut() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error(error);
    currentUser = null;
    authReady = true;
    updateAuthView();
    if (window.location.hash === "#moderator") window.location.hash = "";
  }

  async function initializeAuth() {
    if (!supabaseClient) {
      updateAuthView();
      return;
    }
    await refreshAuthenticatedUser();
    supabaseClient.auth.onAuthStateChange((event) => {
      // Defer the follow-up read so auth callbacks never block Supabase's
      // internal lock while the user object is refreshed from the server.
      window.setTimeout(() => {
        if (event === "SIGNED_OUT") {
          currentUser = null;
          authReady = true;
          updateAuthView();
          return;
        }
        void refreshAuthenticatedUser();
      }, 0);
    });
  }

  document.querySelector("#post-form").addEventListener("submit", submitAnnouncement);
  document.querySelector("#sign-in-form").addEventListener("submit", signIn);
  document.querySelector("#sign-out").addEventListener("click", signOut);
  document.querySelector("#refresh-events").addEventListener("click", loadPublishedEvents);
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.setAttribute("aria-pressed", String(chip === button)));
    renderEvents();
  }));
  window.addEventListener("hashchange", () => {
    syncModeratorRoute();
    updateAuthView();
  });

  syncModeratorRoute();
  void loadPublishedEvents();
  void initializeAuth();
})();
