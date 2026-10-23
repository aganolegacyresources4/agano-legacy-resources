/* Optional maps. No Google resource is created until a visitor activates a
 * verified, configured embed. Static search/enquiry links remain usable alone.
 */
(function () {
  "use strict";
  var app = window.AGANO = window.AGANO || {};
  var own = Object.prototype.hasOwnProperty;

  function plain(value, maximum) {
    return typeof value === "string" && value.length > 0 && value.length <= maximum &&
      value === value.trim() && !/[\u0000-\u001f\u007f]/.test(value);
  }
  function googleURL(value) {
    if (!plain(value, 8192) || /[\s\\]/.test(value)) return null;
    // Match the authority as well as the parsed origin: no credentials, ports,
    // lookalike hosts, protocol-relative URLs or parser-normalised backslashes.
    if (!/^https:\/\/www\.google\.com\//.test(value)) return null;
    try {
      var url = new URL(value);
      if (url.origin !== "https://www.google.com" || url.username || url.password || url.port || url.hash) return null;
      return url;
    } catch (_) { return null; }
  }
  function oneParameter(url, name) {
    return url.searchParams.getAll(name).length === 1 && plain(url.searchParams.get(name), 7000);
  }
  function allowedParameters(url, names) {
    var valid = true;
    url.searchParams.forEach(function (_, name) {
      if (names.indexOf(name) === -1 || url.searchParams.getAll(name).length !== 1) valid = false;
    });
    return valid;
  }
  function embedURL(value) {
    var url = googleURL(value);
    if (!url) return "";
    if (url.pathname === "/maps/embed" && oneParameter(url, "pb") && allowedParameters(url, ["pb"])) return url.href;
    if (url.pathname === "/maps/embed/v1/place" && oneParameter(url, "key") && oneParameter(url, "q") &&
      /^[A-Za-z0-9_-]{20,100}$/.test(url.searchParams.get("key")) &&
      allowedParameters(url, ["key", "q", "zoom", "maptype", "language", "region"])) return url.href;
    return "";
  }
  function record(config, slug) {
    if (!config || !config.locations || !own.call(config.locations, slug)) return null;
    var item = config.locations[slug];
    return item && plain(item.name, 180) && plain(item.searchQuery, 500) ? item : null;
  }
  function verified(item) {
    if (!item || item.status !== "verified" || !item.verification) return false;
    var proof = item.verification;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(proof.verifiedOn || "") || !plain(proof.sourceUrl, 2048)) return false;
    try {
      var source = new URL(proof.sourceUrl);
      return source.protocol === "https:" && !source.username && !source.password;
    } catch (_) { return false; }
  }
  function placeId(item) {
    return item && plain(item.placeId, 300) && /^[A-Za-z0-9_-]+$/.test(item.placeId) ? item.placeId : "";
  }
  function searchURL(item) {
    if (!item || !plain(item.searchQuery, 500)) return "";
    var query = verified(item) && placeId(item) ? item.name : item.searchQuery;
    var url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
    if (verified(item) && placeId(item)) url += "&query_place_id=" + encodeURIComponent(placeId(item));
    return url.length <= 2048 ? url : "";
  }
  function directionsURL(item) {
    if (!verified(item)) return "";
    var id = placeId(item), address = plain(item.publicAddress, 500) ? item.publicAddress : "";
    // A site name alone must never become a directions destination.
    if (!id && !address) return "";
    var url = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address || item.name) +
      (id ? "&destination_place_id=" + encodeURIComponent(id) : "");
    return url.length <= 2048 ? url : "";
  }
  function configuredEmbed(config, item) {
    if (!verified(item)) return "";
    if (item.embedUrl) return embedURL(item.embedUrl);
    var key = config && config.embedApiKey;
    var destination = placeId(item) ? "place_id:" + placeId(item) : (plain(item.publicAddress, 500) ? item.publicAddress : "");
    if (!destination || !plain(key, 100) || !/^[A-Za-z0-9_-]{20,100}$/.test(key)) return "";
    return embedURL("https://www.google.com/maps/embed/v1/place?key=" + encodeURIComponent(key) + "&q=" + encodeURIComponent(destination));
  }
  function setExternal(link, href) {
    if (!link || !href) return;
    link.setAttribute("href", href);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.setAttribute("referrerpolicy", "no-referrer");
  }
  app.maps = Object.freeze({
    record: record, isVerified: verified, searchURL: searchURL,
    directionsURL: directionsURL, validateEmbedURL: embedURL, configuredEmbed: configuredEmbed
  });
  app.initMaps = function () {
    var config = window.AGANO_MAPS_CONFIG;
    document.querySelectorAll("[data-location]").forEach(function (card) {
      if (card.dataset.mapsReady === "true") return;
      var item = record(config, card.dataset.location);
      if (!item) return; // Leave all static fallbacks intact if configuration is missing.
      var stage = card.querySelector("[data-map-frame]");
      var placeholder = card.querySelector("[data-map-placeholder]");
      var load = card.querySelector("[data-map-load]");
      var remove = card.querySelector("[data-map-remove]");
      var status = card.querySelector("[data-map-status]");
      var external = card.querySelector("[data-map-external]");
      var directions = card.querySelector("[data-map-directions]");
      if (!stage || !placeholder || !load || !remove || !status || !external || !directions) return;
      setExternal(external, searchURL(item));
      external.setAttribute("aria-label", "Search for " + item.name + " on Google Maps (opens in a new tab)");
      var destination = directionsURL(item), source = configuredEmbed(config, item), frame = null;
      if (destination) { setExternal(directions, destination); directions.hidden = false; }
      if (verified(item) && (source || destination)) {
        var label = card.querySelector("[data-map-label]");
        var note = card.querySelector("[data-map-note]");
        if (label) label.textContent = "Verified public location";
        if (note) note.textContent = "Use the public location below and contact AGANO to arrange your visit.";
        var copy = placeholder.querySelector("[data-map-placeholder-copy]");
        if (source && copy) copy.textContent = "Load an interactive Google Map here. Google receives your connection information only when you choose to load it.";
      }
      card.dataset.mapsReady = "true";
      if (!source) return;
      load.hidden = false;
      load.setAttribute("aria-expanded", "false");
      load.addEventListener("click", function () {
        if (frame) return;
        var next = document.createElement("iframe");
        next.setAttribute("title", "Google Map — " + item.name);
        next.setAttribute("width", "720"); next.setAttribute("height", "400");
        next.setAttribute("loading", "lazy"); next.setAttribute("allowfullscreen", "");
        next.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        next.addEventListener("load", function () {
          // A cross-origin load event also fires for some blocked/error pages.
          if (frame !== next) return;
          status.textContent = "Map frame opened. If the map is unavailable, use the Google Maps link below.";
        });
        next.addEventListener("error", function () {
          if (frame !== next) return;
          status.textContent = "The map could not be opened. Use the Google Maps link below, or remove it and try again.";
        });
        next.setAttribute("src", source);
        frame = next;
        stage.append(next);
        placeholder.hidden = true;
        load.disabled = true;
        load.setAttribute("aria-expanded", "true");
        remove.hidden = false;
        status.textContent = "Map requested from Google. If it is blocked or unavailable, use the Google Maps link below.";
        remove.focus();
      });
      remove.addEventListener("click", function () {
        if (!frame) return;
        var previous = frame;
        frame = null;
        previous.remove();
        placeholder.hidden = false;
        load.disabled = false;
        load.setAttribute("aria-expanded", "false");
        load.focus();
        remove.hidden = true;
        status.textContent = "Map removed. You can load it again or open Google Maps separately.";
      });
    });
  };
})();
