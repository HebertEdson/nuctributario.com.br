// ANALYTICS - MINIMALISTA

var CLICK_DELAY = 250;
var lastTrackTime = 0;

window.addEventListener('load', function() {
  trackEvent('pageview', window.location.pathname, 'page');
});

document.addEventListener('click', function(e) {
  var now = Date.now();
  if (now - lastTrackTime < CLICK_DELAY) return;
  lastTrackTime = now;

  var target = e.target.closest ? e.target.closest('a, button') : null;
  if (!target) return;

  var element = (target.textContent || '').trim().substring(0, 50) || target.id || 'unknown';
  trackEvent('click', window.location.pathname, element);
});

function trackEvent(type, page, element) {
  var data = {
    type: type,
    page: page,
    element: element
  };

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    keepalive: true
  }).catch(function() {});
}
