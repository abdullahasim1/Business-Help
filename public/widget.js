(function () {
  "use strict";

  var script = document.currentScript;
  var businessId = script && script.getAttribute("data-business-id");
  var widgetKey = script && script.getAttribute("data-widget-key");
  if (!script || !businessId || !widgetKey || document.getElementById("ai-widget-root")) return;

  var apiOrigin = new URL(script.src).origin;
  var state = {
    config: null,
    conversationId: null,
    contactId: null,
    visitorToken: null,
    leadStep: 0,
    lead: { name: "", phone: "", email: "" },
    voiceClient: null
  };
  var root = document.createElement("div");
  root.id = "ai-widget-root";
  document.body.appendChild(root);

  addStyles();
  loadConfig().then(renderLauncher).catch(showError);

  function addStyles() {
    var style = document.createElement("style");
    style.textContent = `
      #ai-widget-root{position:fixed;right:20px;bottom:20px;z-index:2147483647;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033}
      .aiw-launcher{display:flex;flex-direction:column;align-items:flex-end;gap:10px}.aiw-launcher-note{margin:0 6px 1px;color:#667085;font-size:12px;font-weight:700}.aiw-button{border:0;border-radius:999px;padding:13px 18px;background:var(--aiw-color,#635bff);color:#fff;font-size:14px;font-weight:800;box-shadow:0 14px 28px rgba(27,31,65,.22);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}.aiw-button:hover{transform:translateY(-2px);box-shadow:0 18px 35px rgba(27,31,65,.3)}.aiw-button-call{background:#10172b}
      .aiw-window{width:380px;max-width:calc(100vw - 28px);height:560px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(226,232,240,.95);border-radius:22px;background:#fff;box-shadow:0 28px 80px rgba(16,23,43,.28)}.aiw-header{display:flex;justify-content:space-between;align-items:center;padding:15px 16px;background:linear-gradient(135deg,var(--aiw-color,#635bff),#10172b);color:#fff}.aiw-brand{display:flex;align-items:center;gap:10px}.aiw-avatar{display:grid;place-items:center;width:34px;height:34px;border-radius:12px;background:#fff;color:var(--aiw-color,#635bff);font-size:12px;font-weight:900;box-shadow:0 5px 15px #0002}.aiw-title{font-size:14px;font-weight:800;line-height:1.2}.aiw-subtitle{margin-top:3px;color:#ffffffb8;font-size:11px;font-weight:600}.aiw-close{display:grid;place-items:center;width:30px;height:30px;border:1px solid #ffffff2e;border-radius:10px;background:#ffffff14;color:#fff;font-size:20px;line-height:1;cursor:pointer}
      .aiw-messages{flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:16px;background:linear-gradient(180deg,#f8f9ff 0%,#f4f7fb 100%)}.aiw-message{max-width:84%;padding:11px 12px;border-radius:15px;font-size:13px;line-height:1.5;box-shadow:0 2px 5px #10182808}.aiw-user{align-self:flex-end;border-bottom-right-radius:4px;background:var(--aiw-color,#635bff);color:#fff}.aiw-bot{align-self:flex-start;border:1px solid #e5e7f0;border-bottom-left-radius:4px;background:#fff;color:#344054}.aiw-link{color:var(--aiw-color,#635bff);text-decoration:underline;word-break:break-all}.aiw-form{display:flex;gap:8px;padding:12px;border-top:1px solid #edf0f5;background:#fff}
      .aiw-input,.aiw-field{box-sizing:border-box;width:100%;border:1px solid #dfe4ef;border-radius:12px;padding:11px 12px;background:#fff;color:#172033;font-size:13px;outline:none}.aiw-input:focus,.aiw-field:focus{border-color:var(--aiw-color,#635bff);box-shadow:0 0 0 3px color-mix(in srgb,var(--aiw-color,#635bff) 12%,transparent)}.aiw-input{flex:1}.aiw-send{border:0;border-radius:12px;padding:10px 14px;background:var(--aiw-color,#635bff);color:#fff;font-size:13px;font-weight:800;cursor:pointer}.aiw-call-form{display:grid;gap:14px;overflow:auto;padding:20px;background:linear-gradient(180deg,#f8f9ff,#fff)}.aiw-label{display:grid;gap:5px;font-size:12px;font-weight:700;color:#344054}.aiw-call-button{border:0;border-radius:12px;padding:13px;background:var(--aiw-color,#635bff);color:#fff;font-size:14px;font-weight:800;box-shadow:0 8px 18px #10182818;cursor:pointer}.aiw-call-button:disabled{cursor:not-allowed;opacity:.55}.aiw-error{padding:10px;color:#b42318;font-size:13px}.aiw-success{color:#067647;font-size:14px;line-height:1.5}.aiw-muted{color:#667085;font-size:13px;line-height:1.6}.aiw-call-note{border:1px solid #e0e7ff;border-radius:14px;background:#eef2ff;padding:12px;color:#4f46e5;font-size:12px;font-weight:700;line-height:1.5}
      @media(max-width:480px){#ai-widget-root{right:14px;bottom:14px}.aiw-window{width:calc(100vw - 28px);height:min(560px,calc(100vh - 28px))}.aiw-button{padding:12px 16px}}
    `;
    document.head.appendChild(style);
  }

  function make(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function makeMessage(text) {
    var box = make("div", "aiw-bubble");
    var parts = String(text).split(/(https?:\/\/[^\s]+)/g);
    parts.forEach(function (part) {
      if (/^https?:\/\//.test(part)) {
        var link = document.createElement("a");
        link.href = part;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = part;
        link.className = "aiw-link";
        box.appendChild(link);
      } else if (part) {
        box.appendChild(document.createTextNode(part));
      }
    });
    return box;
  }

  function button(text, className) {
    var element = make("button", className, text);
    element.type = "button";
    return element;
  }

  function errorText(error) {
    return error && error.message ? error.message : "Something went wrong. Please try again.";
  }

  function showError(error) {
    root.appendChild(make("div", "aiw-error", errorText(error)));
  }

  async function request(path, body) {
    if (body) body.widgetKey = widgetKey;
    var options = body
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : undefined;
    var response = await fetch(apiOrigin + path, options);
    var data = await response.json().catch(function () {
      return {};
    });
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function loadConfig() {
    state.config = await request("/api/widget/" + encodeURIComponent(businessId) + "?key=" + encodeURIComponent(widgetKey));
    root.style.setProperty("--aiw-color", state.config.widget.primaryColor || "#0f766e");
  }

  function createWindow(title) {
    root.innerHTML = "";
    var windowBox = make("div", "aiw-window");
    var header = make("div", "aiw-header");
    var brand = make("div", "aiw-brand");
    brand.appendChild(make("div", "aiw-avatar", "AI"));
    var titleBox = make("div", "");
    titleBox.appendChild(make("div", "aiw-title", title));
    titleBox.appendChild(make("div", "aiw-subtitle", "Online · Usually replies instantly"));
    brand.appendChild(titleBox);
    var close = button("×", "aiw-close");
    close.title = "Close";
    close.onclick = function () {
      stopActiveCall();
      renderLauncher();
    };
    header.appendChild(brand);
    header.appendChild(close);
    windowBox.appendChild(header);
    root.appendChild(windowBox);
    return windowBox;
  }

  function addMessage(messages, role, text) {
    var wrap = make("div", "aiw-message " + (role === "user" ? "aiw-user" : "aiw-bot"));
    if (role === "user") wrap.textContent = text;
    else wrap.appendChild(makeMessage(text));
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function renderLauncher() {
    root.innerHTML = "";
    var launcher = make("div", "aiw-launcher");
    var widget = state.config.widget;
    launcher.appendChild(make("div", "aiw-launcher-note", "Need help?"));

    if (widget.chatEnabled && state.config.agent) {
      var chat = button("Chat with us", "aiw-button");
      chat.onclick = openChat;
      launcher.appendChild(chat);
    }

    if (widget.callEnabled) {
      var call = button("Talk to us", "aiw-button aiw-button-call");
      call.onclick = openCall;
      launcher.appendChild(call);
    }

    root.appendChild(launcher);
    if (!launcher.children.length) showError(new Error("This widget is currently disabled."));
  }

  function openChat() {
    var box = createWindow(state.config.business.name + " Chat");
    var messages = make("div", "aiw-messages");
    addMessage(messages, "assistant", state.config.widget.welcomeMessage || "Hi! How can I help today?");
    addMessage(messages, "assistant", state.contactId ? "How can I help you today?" : leadQuestion());
    box.appendChild(messages);

    var form = make("form", "aiw-form");
    var input = make("input", "aiw-input");
    input.placeholder = "Type your message…";
    input.required = true;
    var send = button("Send", "aiw-send");
    send.type = "submit";
    form.appendChild(input);
    form.appendChild(send);
    form.onsubmit = async function (event) {
      event.preventDefault();
      var message = input.value.trim();
      if (!message) return;
      input.value = "";
      await handleChatMessage(message, messages, input, send);
    };
    box.appendChild(form);
  }

  function leadQuestion() {
    if (state.leadStep === 1) return "Thank you. What is your phone number?";
    if (state.leadStep === 2) return "Great. What is your email address?";
    return "Welcome! What is your name?";
  }

  async function handleChatMessage(message, messages, input, send) {
    if (!state.contactId) {
      await collectChatLead(message, messages, input, send);
      return;
    }
    await askAgent(message, messages, input, send);
  }

  async function collectChatLead(message, messages, input, send) {
    addMessage(messages, "user", message);

    if (state.leadStep === 0) {
      state.lead.name = message;
      state.leadStep = 1;
      addMessage(messages, "assistant", leadQuestion());
      return;
    }

    if (state.leadStep === 1) {
      state.lead.phone = message;
      state.leadStep = 2;
      addMessage(messages, "assistant", leadQuestion());
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message)) {
      addMessage(messages, "assistant", "Please enter a valid email address.");
      return;
    }

    state.lead.email = message;
    input.disabled = true;
    send.disabled = true;
    var saving = make("div", "aiw-message aiw-bot", "Saving your details...");
    messages.appendChild(saving);

    try {
      var data = await request("/api/contacts/capture", {
        businessId: businessId,
        name: state.lead.name,
        phone: state.lead.phone,
        email: state.lead.email
      });
      state.contactId = data.contact.id;
      state.visitorToken = data.contact.visitorToken;
      state.leadStep = 3;
      saving.remove();
      addMessage(messages, "assistant", "Thank you, " + state.lead.name + ". How can I help you today?");
    } catch (error) {
      saving.remove();
      addMessage(messages, "assistant", errorText(error));
    } finally {
      input.disabled = false;
      send.disabled = false;
      input.focus();
    }
  }

  async function askAgent(message, messages, input, send) {
    addMessage(messages, "user", message);
    var thinking = make("div", "aiw-message aiw-bot", "Thinking...");
    messages.appendChild(thinking);
    input.disabled = true;
    send.disabled = true;

    try {
      var data = await request("/api/chat", {
        businessId: businessId,
        conversationId: state.conversationId,
        contactId: state.contactId,
        visitorToken: state.visitorToken,
        message: message
      });
      state.conversationId = data.conversationId;
      state.visitorToken = data.visitorToken || state.visitorToken;
      thinking.remove();
      addMessage(messages, "assistant", data.response);
    } catch (error) {
      thinking.remove();
      addMessage(messages, "assistant", errorText(error));
    } finally {
      input.disabled = false;
      send.disabled = false;
      input.focus();
    }
  }

  function openCall() {
    var box = createWindow(state.config.business.name + " Call");
    var panel = make("div", "aiw-call-form");
    panel.appendChild(make("div", "aiw-call-note", "Start a private voice conversation with our AI assistant. You can ask about services, pricing, or next steps."));
    var status = make("div", "aiw-muted", "");
    var start = button("Start voice call", "aiw-call-button");
    var hangUp = button("End call", "aiw-call-button");
    start.type = "submit";
    hangUp.disabled = true;
    panel.appendChild(status);
    panel.appendChild(start);
    panel.appendChild(hangUp);
    start.onclick = async function () {
      start.disabled = true;
      start.textContent = "Starting call...";
      try {
        var data = await request("/api/calls/start", {
          businessId: businessId,
          contactId: state.contactId,
          visitorToken: state.visitorToken
        });
        state.contactId = data.call.contactId || state.contactId;
        if (data.callSession.mode === "unavailable") {
          status.textContent = "Voice calls are being set up. Please try again later.";
          start.disabled = false;
          start.textContent = "Start voice call";
          return;
        }
        await startVoiceCall(data.callSession, status, start, hangUp);
      } catch (requestError) {
        status.textContent = errorText(requestError);
        start.disabled = false;
        start.textContent = "Start voice call";
      }
    };
    hangUp.onclick = function () {
      stopActiveCall();
    };

    box.appendChild(panel);
  }

  async function startVoiceCall(session, status, start, hangUp) {
    if (!session.clientSecret) throw new Error("Voice call access token is missing.");

    var sdk = await import("https://esm.sh/retell-client-js-sdk@2.0.8?bundle");
    var client = new sdk.RetellWebClient();
    state.voiceClient = client;

    client.on("call_started", function () {
      status.textContent = "Call connected. You can speak now.";
      hangUp.disabled = false;
    });
    client.on("call_ended", function () {
      state.voiceClient = null;
      status.textContent = "Call ended.";
      start.disabled = false;
      start.textContent = "Start voice call";
      hangUp.disabled = true;
    });
    client.on("error", function () {
      state.voiceClient = null;
      status.textContent = "Could not start the call. Please try again.";
      start.disabled = false;
      start.textContent = "Start voice call";
      hangUp.disabled = true;
    });

    status.textContent = "Allow microphone access to start the call.";
    await client.startCall({ accessToken: session.clientSecret });
  }

  function stopActiveCall() {
    if (!state.voiceClient) return;
    state.voiceClient.stopCall();
    state.voiceClient = null;
  }
})();
