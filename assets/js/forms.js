/* Native browser JavaScript. This prepares WhatsApp text; it does not send messages or collect submissions. */
(function () {
  "use strict";
  var CATEGORIES = {
    general: ["General enquiry", "Mining operations", "Business partnership", "Procurement", "Careers", "Media", "Privacy & data", "Other"],
    supplier: ["Equipment", "Engineering", "Logistics", "Safety equipment", "Environmental services", "Information technology", "Professional services", "Other"],
    career: ["Mining & engineering", "Geology & surveying", "Environment & safety", "Finance & administration", "Information technology", "Graduate & internship", "Other"]
  };
  var LABELS = { general: "CORPORATE ENQUIRY", supplier: "SUPPLIER ENQUIRY", career: "CAREER ENQUIRY" };
  var ALLOWED = ["kind", "name", "company", "email", "phone", "category", "subject", "message", "privacy", "website"];
  function recipient(number) {
    if (number === "" || number === null || number === undefined) return "";
    if (typeof number !== "string" || !/^[+\d\s().-]+$/.test(number)) throw new Error("The WhatsApp destination is not configured correctly. You can still copy your message.");
    var digits = number.replace(/\D/g, "");
    if (!/^[1-9]\d{7,14}$/.test(digits)) throw new Error("The WhatsApp destination is not configured correctly. You can still copy your message.");
    return digits;
  }
  function validate(input, kind) {
    var errors = {};
    var value = {};
    if (!input || typeof input !== "object" || Array.isArray(input)) return { errors: { form: "Please use the enquiry form." } };
    if (!Object.prototype.hasOwnProperty.call(CATEGORIES, kind)) errors.form = "Choose a supported enquiry form.";
    if (Object.keys(input).some(function (key) { return ALLOWED.indexOf(key) === -1; })) errors.form = "The form contains an unsupported field.";
    [["name", 80, 1], ["company", 140, kind === "supplier" ? 1 : 0], ["email", 160, 1], ["phone", 30, 0], ["category", 80, 1], ["subject", 100, 1], ["message", 1000, 20]].forEach(function (rule) {
      var key = rule[0], max = rule[1], min = rule[2];
      if (input[key] !== undefined && typeof input[key] !== "string") { errors[key] = "Use plain text in this field."; return; }
      var text = (input[key] || "").trim().normalize("NFC");
      value[key] = text;
      if (text.length < min || text.length > max) errors[key] = min ? "Use " + min + "–" + max + " characters." : "Use " + max + " characters or fewer.";
      if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text) || key !== "message" && /[\r\n]/.test(text)) errors[key] = "Remove unsupported control characters.";
    });
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.email || "")) errors.email = "Enter a valid email address.";
    if (CATEGORIES[kind] && CATEGORIES[kind].indexOf(value.category) === -1) errors.category = "Choose a category from this form.";
    if (input.privacy !== true) errors.privacy = "Read the privacy notice and acknowledge the WhatsApp handoff.";
    if (input.website !== undefined && input.website !== "") errors.form = "The message could not be prepared. Please leave the hidden website field empty.";
    value.kind = kind;
    return { value: value, errors: errors };
  }
  function compose(value) {
    return [
      "AGANO LEGACY RESOURCES", LABELS[value.kind], "",
      "Name: " + value.name,
      value.company ? "Company: " + value.company : "",
      "Email: " + value.email,
      value.phone ? "Telephone: " + value.phone : "",
      "Category: " + value.category,
      "Subject: " + value.subject,
      "", value.message
    ].filter(function (line) { return line !== undefined; }).join("\n").replace(/\n{3,}/g, "\n\n");
  }
  function link(message, number) {
    var digits = recipient(number);
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
  }
  function prepare(input, kind, config) {
    var checked = validate(input, kind);
    if (Object.keys(checked.errors).length) return checked;
    var message = compose(checked.value);
    var number = recipient((config || {}).whatsapp);
    var url = link(message, number);
    var manualPaste = url.length > 6500;
    if (manualPaste) url = link("Hello AGANO Legacy Resources. I have prepared an enquiry and will paste the details into this conversation.", number);
    return { errors: {}, message: message, url: url, mode: number ? "direct" : "chooser", manualPaste: manualPaste };
  }
  function clearErrors(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (input) {
      input.removeAttribute("aria-invalid");
      var descriptions = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(function (id) { return id && !id.endsWith("-error"); });
      if (descriptions.length) input.setAttribute("aria-describedby", descriptions.join(" ")); else input.removeAttribute("aria-describedby");
    });
    form.querySelectorAll(".field-error").forEach(function (element) { element.remove(); });
  }
  function initForms() {
    document.querySelectorAll("[data-enquiry-form]").forEach(function (form) {
      if (form.dataset.formReady) return;
      var fields = form.querySelector("[data-form-fields]");
      var submit = form.querySelector("[data-submit]");
      var status = form.querySelector("[data-form-status]");
      var review = form.querySelector("[data-message-review]");
      var preview = form.querySelector("[data-message-preview]");
      var destination = form.querySelector("[data-whatsapp-continue]");
      var routing = form.querySelector("[data-routing-note]");
      var copyStatus = form.querySelector("[data-copy-status]");
      var copyButton = form.querySelector("[data-copy-message]");
      var editButton = form.querySelector("[data-edit-message]");
      var summary = form.querySelector("[data-error-summary]");
      var errorList = form.querySelector("[data-error-list]");
      var errorIntro = form.querySelector("[data-error-intro]");
      var counter = form.querySelector("[data-character-count]");
      var currentMessage = "", revision = 0;
      var labels = { name: "Full name", company: "Company / organisation", email: "Email address", phone: "Telephone", category: "Enquiry category", subject: "Subject", message: "Your message", privacy: "Privacy acknowledgement" };
      if (!fields || !submit || !status || !review || !preview || !destination || !routing || !copyStatus || !copyButton || !editButton) return;
      function announce(text, state) { status.textContent = text; status.dataset.state = state || ""; }
      function field(key) {
        var input = form.elements.namedItem(key);
        return input && typeof input.setAttribute === "function" && input.type !== "hidden" ? input : null;
      }
      function readInput() {
        var input = Object.fromEntries(new FormData(form));
        input.privacy = form.querySelector("[name=privacy]").checked;
        return input;
      }
      function hideSummary() {
        if (summary) summary.hidden = true;
        if (errorList) errorList.replaceChildren();
      }
      function setFieldError(key, message) {
        var input = field(key);
        if (!input || !labels[key]) return;
        var errorId = input.id + "-error";
        var old = form.querySelector('[data-error-for="' + key + '"]');
        if (old) old.remove();
        var descriptions = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(function (id) { return id && id !== errorId; });
        input.removeAttribute("aria-invalid");
        if (message) {
          var text = document.createElement("p");
          text.className = "field-error";
          text.id = errorId;
          text.setAttribute("data-error-for", key);
          text.textContent = message;
          input.setAttribute("aria-invalid", "true");
          descriptions.push(errorId);
          if (input.type === "checkbox" && input.parentElement) input.parentElement.after(text); else input.after(text);
        }
        if (descriptions.length) input.setAttribute("aria-describedby", descriptions.join(" ")); else input.removeAttribute("aria-describedby");
      }
      function showErrors(errors) {
        Object.entries(errors).forEach(function (entry) { setFieldError(entry[0], entry[1]); });
        var keys = Object.keys(errors).filter(function (key) { return labels[key] && field(key); });
        announce(errors.form || "Please review " + keys.length + " highlighted " + (keys.length === 1 ? "field" : "fields") + " before preparing your message.", "error");
        if (summary && errorList && errorIntro) {
          errorList.replaceChildren();
          keys.forEach(function (key) {
            var item = document.createElement("li");
            var link = document.createElement("a");
            link.href = "#" + field(key).id;
            link.setAttribute("data-error-target", key);
            link.textContent = labels[key] + ": " + errors[key];
            item.append(link);
            errorList.append(item);
          });
          errorIntro.textContent = errors.form || "Follow each link to correct your details, then review the message again.";
          summary.hidden = false;
          summary.focus();
        } else { status.tabIndex = -1; status.focus(); }
      }
      function updateCounter(reset) {
        var message = field("message");
        if (!counter || !message) return;
        var count = reset === true ? 0 : message.value.length;
        counter.textContent = count + " / 1,000 characters · 20 minimum";
        counter.dataset.limitState = count >= 900 ? "near" : "";
      }
      function invalidatePreview() {
        ++revision;
        review.hidden = true;
        destination.removeAttribute("href");
        currentMessage = "";
        preview.value = "";
        copyStatus.textContent = "";
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearErrors(form);
        hideSummary();
        var result;
        try { result = prepare(readInput(), form.dataset.kind, window.AGANO_CONFIG || {}); }
        catch (error) {
          invalidatePreview();
          announce(error.message, "error");
          status.tabIndex = -1; status.focus();
          return;
        }
        if (Object.keys(result.errors).length) {
          invalidatePreview();
          showErrors(result.errors);
          return;
        }
        ++revision;
        currentMessage = result.message;
        preview.value = result.message;
        destination.href = result.url;
        destination.textContent = result.manualPaste ? "Open WhatsApp, then paste your message →" : "Continue in WhatsApp →";
        routing.textContent = result.mode === "direct" ? "The message is addressed to the configured AGANO WhatsApp number. Review it and press Send in WhatsApp." : "WhatsApp will ask you to choose a conversation. Select your AGANO contact, review the message and press Send there.";
        if (result.manualPaste) routing.textContent += " This message is long: copy the complete text below and paste it into the conversation after opening WhatsApp.";
        review.hidden = false;
        copyStatus.textContent = "";
        announce("Your message is ready to review. It has not been sent.");
        review.focus();
      });
      function changed(event) {
        var input = event && event.target;
        if (!review.hidden) {
          invalidatePreview();
          announce("Your details changed. Review the updated message before continuing.");
        }
        hideSummary();
        updateCounter();
        if (input && labels[input.name] && input.getAttribute("aria-invalid") === "true") {
          var error = validate(readInput(), form.dataset.kind).errors[input.name];
          if (!error) setFieldError(input.name, "");
        }
      }
      form.addEventListener("input", changed);
      form.addEventListener("change", changed);
      form.addEventListener("focusout", function (event) {
        var input = event.target;
        if (!input || !labels[input.name]) return;
        var error = validate(readInput(), form.dataset.kind).errors[input.name];
        setFieldError(input.name, error || "");
      });
      form.addEventListener("reset", function () {
        clearErrors(form); hideSummary(); invalidatePreview(); updateCounter(true);
        announce("The form has been cleared. No message was sent by this page.");
      });
      if (errorList) errorList.addEventListener("click", function (event) {
        var target = event.target.closest("[data-error-target]");
        if (!target) return;
        var input = field(target.dataset.errorTarget);
        if (input) { event.preventDefault(); input.focus(); }
      });
      destination.addEventListener("click", function (event) {
        if (!destination.getAttribute("href")) { event.preventDefault(); return; }
        announce("Continue in WhatsApp to review and send your message. This website cannot verify message delivery.");
      });
      editButton.addEventListener("click", function () {
        invalidatePreview();
        announce("Update your details, then review the new message before continuing.");
        field("name").focus();
      });
      copyButton.addEventListener("click", async function () {
        if (!currentMessage || copyButton.disabled) return;
        var snapshot = currentMessage, version = revision;
        copyButton.disabled = true;
        copyButton.setAttribute("aria-busy", "true");
        copyButton.textContent = "Copying…";
        copyStatus.textContent = "";
        try {
          if (!navigator.clipboard || !window.isSecureContext) throw new Error("selection");
          await navigator.clipboard.writeText(snapshot);
          if (version === revision) copyStatus.textContent = "Message copied. You can paste it into WhatsApp.";
        } catch (_) {
          if (version === revision) {
            preview.focus(); preview.select();
            copyStatus.textContent = "Message selected. Copy it using your device’s copy command, then paste it into WhatsApp.";
          }
        } finally {
          copyButton.disabled = false;
          copyButton.removeAttribute("aria-busy");
          copyButton.textContent = "Copy message";
        }
      });
      form.dataset.formReady = "true";
      /* Only known portfolio slugs may provide enquiry context. Never overwrite entered details. */
      if (form.dataset.kind === "general" && window.location && window.location.search && typeof URLSearchParams === "function") {
        var requestedSite = new URLSearchParams(window.location.search).get("site");
        var sites = (window.AGANO_CONFIG || {}).sites || {};
        var subjectField = field("subject"), categoryField = field("category");
        if (requestedSite && Object.prototype.hasOwnProperty.call(sites, requestedSite) && typeof sites[requestedSite] === "string" && subjectField && !subjectField.value) {
          subjectField.value = "Site enquiry: " + sites[requestedSite];
          if (categoryField && !categoryField.value) categoryField.value = "Mining operations";
        }
      }
      form.noValidate = true;
      fields.disabled = false;
      submit.disabled = false;
      copyButton.disabled = false;
      submit.textContent = "Review WhatsApp message →";
      updateCounter();
      announce("Complete the form, review your message, then continue in WhatsApp. Nothing is sent automatically.");
    });
  }
  window.AGANO = window.AGANO || {};
  window.AGANO.whatsapp = Object.freeze({ recipient: recipient, validate: validate, compose: compose, link: link, prepare: prepare });
  window.AGANO.initForms = initForms;
})();
