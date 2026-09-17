/* WP-Net-Control interactive tools. No CDN, network calls, or PHP endpoints. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WPNCTool = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function digits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function reduceNumber(value) {
    var n = parseInt(value, 10) || 0;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
    }
    return n;
  }

  function parseIsoDate(value) {
    var match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    var year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    if (year < 1 || month < 1 || month > 12 || day < 1) return null;
    var leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    var days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > days[month - 1]) return null;
    return { year: year, month: month, day: day };
  }

  function lifePath(date) {
    if (!parseIsoDate(date)) return null;
    var d = digits(date);
    return reduceNumber(d.split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0));
  }

  function zodiac(date) {
    var parsed = parseIsoDate(date);
    if (!parsed) return null;
    var month = parsed.month, day = parsed.day;
    var starts = [
      ['Aquarius', 1, 20], ['Pisces', 2, 19], ['Aries', 3, 21],
      ['Taurus', 4, 20], ['Gemini', 5, 21], ['Cancer', 6, 21],
      ['Leo', 7, 23], ['Virgo', 8, 23], ['Libra', 9, 23],
      ['Scorpio', 10, 23], ['Sagittarius', 11, 22], ['Capricorn', 12, 22]
    ];
    var current = 'Capricorn';
    starts.forEach(function (start) {
      if (month > start[1] || (month === start[1] && day >= start[2])) current = start[0];
    });
    return current;
  }

  function hash(value) {
    var h = 2166136261;
    String(value || '').split('').forEach(function (char) {
      h ^= char.charCodeAt(0); h = Math.imul(h, 16777619);
    });
    return h >>> 0;
  }

  function tarotDraw(question, spread, deck) {
    var cards = deck && deck.length ? deck : ['The Star', 'The Hermit', 'The Sun'];
    var count = spread === 'three' ? 3 : 1;
    var seed = hash(String(question || '').trim().toLowerCase() + '|' + spread);
    var result = [];
    for (var i = 0; i < count; i += 1) result.push(cards[(seed + i * 31) % cards.length]);
    return result;
  }

  function clarityCoach(question) {
    var clean = String(question || '').trim().replace(/\s+/g, ' ');
    if (!clean) return { question: '', prompts: ['What would you most like to understand?'], ready: false };
    var prompts = [];
    if (clean.length < 25) prompts.push('What part of this situation feels most important right now?');
    if (!/[?]/.test(clean)) prompts.push('Turn it into one open question ending with a question mark.');
    prompts.push('Name the time frame and the choice that is yours to make.');
    return { question: clean, prompts: prompts, ready: clean.length >= 25 && /[?]/.test(clean) };
  }

  function matchMedium(need, readers) {
    var key = String(need || '').toLowerCase();
    return (readers || []).map(function (reader, index) {
      var tags = (reader.tags || []).map(function (tag) { return String(tag).toLowerCase(); });
      var score = tags.indexOf(key) >= 0 ? 3 : 0;
      if (key === 'grief' && tags.indexOf('mediumship') >= 0) score += 2;
      if (key === 'direction' && tags.indexOf('intuitive') >= 0) score += 1;
      return { reader: reader, score: score, index: index };
    }).sort(function (a, b) { return b.score - a.score || a.index - b.index; }).slice(0, 3);
  }

  function scoreIntuition(answers, dimensions) {
    return scoreIntuitionMeta(answers, dimensions).totals;
  }

  function scoreIntuitionMeta(answers, dimensions) {
    var dims = dimensions && dimensions.length ? dimensions : ['pattern', 'feeling', 'timing', 'empathy'];
    var totals = {};
    var counts = {};
    dims.forEach(function (dimension) { totals[dimension] = 0; counts[dimension] = 0; });
    (answers || []).forEach(function (answer, index) {
      var dimension = dims[index % dims.length];
      totals[dimension] += Math.max(0, Math.min(5, Number(answer) || 0));
      counts[dimension] += 1;
    });
    var maxima = {};
    dims.forEach(function (dimension) { maxima[dimension] = counts[dimension] * 5; });
    return { totals: totals, maxima: maxima };
  }

  function compatibility(firstDate, secondDate) {
    var a = lifePath(firstDate), b = lifePath(secondDate), za = zodiac(firstDate), zb = zodiac(secondDate);
    if (!a || !b || !za || !zb) return null;
    var score = 50 + (a === b ? 18 : 0) + ((a + b) % 7) * 3;
    return { firstLifePath: a, secondLifePath: b, firstZodiac: za, secondZodiac: zb, score: Math.min(97, score) };
  }

  function journalPrompt(prompts, seed) {
    var list = prompts && prompts.length ? prompts : ['What do you want to remember about this person?'];
    return list[hash(seed || 'reflection') % list.length];
  }

  function symbolicReflection(symbol, symbols) {
    var key = String(symbol || '');
    return (symbols || []).filter(function (item) { return item && item.key === key; })[0] || null;
  }

  function radarSvg(scores, maxima) {
    var keys = Object.keys(scores || {}), cx = 100, cy = 100, radius = 76;
    if (!keys.length) return '';
    var points = keys.map(function (key, index) {
      var angle = (-Math.PI / 2) + (Math.PI * 2 * index / keys.length);
      var maximum = maxima && Number(maxima[key]) > 0 ? Number(maxima[key]) : 15;
      var scale = Math.max(0, Math.min(1, Number(scores[key]) / maximum));
      return (cx + Math.cos(angle) * radius * scale).toFixed(1) + ',' + (cy + Math.sin(angle) * radius * scale).toFixed(1);
    }).join(' ');
    return '<svg class="wpnc-tool__radar" viewBox="0 0 200 200" role="img" aria-label="Intuition profile radar"><circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" opacity=".2"/><circle cx="100" cy="100" r="38" fill="none" stroke="currentColor" opacity=".2"/><polygon points="' + points + '" fill="currentColor" opacity=".35" stroke="currentColor" stroke-width="2"/></svg>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function resultBox(root, title, body) {
    var output = root.querySelector('[data-result]');
    if (!output) return;
    output.hidden = false;
    output.innerHTML = '<h2>' + escapeHtml(title) + '</h2><div>' + body + '</div>';
    output.focus();
  }

  function renderTool(root, config) {
    if (!root || !config || root.getAttribute('data-wpnc-ready') === '1') return;
    root.setAttribute('data-wpnc-ready', '1');
    if (config.theme) Object.keys(config.theme).forEach(function (key) {
      if (/^(ink|muted|accent|accentStrong|surface|soft)$/.test(key)) root.style.setProperty('--wpnc-' + key.replace(/[A-Z]/g, function (letter) { return '-' + letter.toLowerCase(); }), String(config.theme[key]));
    });
    var type = config.type || 'reflection';
    var intro = '<p class="wpnc-tool__disclaimer">' + escapeHtml(config.disclaimer || 'For entertainment and self-reflection only. This is not professional, medical, legal, or financial advice.') + '</p>';
    var body = '';
    if (type === 'medium_matcher') {
      body = '<label for="wpnc-need">What kind of support are you exploring?</label><select id="wpnc-need" data-need>' + (config.needs || []).map(function (x) { return '<option value="' + escapeHtml(x.value) + '">' + escapeHtml(x.label) + '</option>'; }).join('') + '</select><button type="button" data-action="match">Show reflection matches</button>';
    } else if (type === 'clarity_coach' || type === 'tarot_workshop') {
      body = '<label for="wpnc-question">Your question</label><textarea id="wpnc-question" rows="5" data-question placeholder="Write in your own words..."></textarea>' + (type === 'tarot_workshop' ? '<label for="wpnc-spread">Reflection format</label><select id="wpnc-spread" data-spread><option value="single">One card: the focus</option><option value="three">Three cards: context, choice, next step</option></select>' : '') + '<button type="button" data-action="reflect">Continue</button>';
    } else if (type === 'reflection_chat') {
      var firstMessage = (config.conversation || [config.instructions || 'Take a quiet moment and write what is present for you.'])[0];
      body = '<p>' + escapeHtml(config.instructions || 'Take a quiet moment and write what is present for you.') + '</p><div class="wpnc-tool__timer" data-timer aria-live="polite">03:00</div><div class="wpnc-tool__chat" role="log" aria-live="polite"><ol data-transcript><li><strong>Guide:</strong> ' + escapeHtml(firstMessage) + '</li></ol></div><label for="wpnc-reflection">Your reflection</label><textarea id="wpnc-reflection" rows="5" data-reflection></textarea><div class="wpnc-tool__actions"><button type="button" data-action="timer">Start timer</button><button type="button" data-action="save-line">Send reflection</button></div>';
    } else if (type === 'intuition_quiz') {
      body = (config.questions || []).map(function (question, index) { return '<fieldset><legend>' + (index + 1) + '. ' + escapeHtml(question) + '</legend><select data-answer aria-label="Answer ' + (index + 1) + '"><option value="1">Rarely</option><option value="2">Sometimes</option><option value="3" selected>Often</option><option value="4">Usually</option><option value="5">Almost always</option></select></fieldset>'; }).join('') + '<button type="button" data-action="quiz">See your reflection profile</button>';
    } else if (type === 'compatibility') {
      body = '<div class="wpnc-tool__grid"><label>First birth date<input type="date" data-date-a></label><label>Second birth date<input type="date" data-date-b></label></div><button type="button" data-action="compatibility">Explore the pattern</button>';
    } else if (type === 'memorial_journal') {
      body = '<label for="wpnc-symbol">Choose a symbolic focus</label><select id="wpnc-symbol" data-symbol>' + (config.symbols || []).map(function (item) { return '<option value="' + escapeHtml(item.key) + '">' + escapeHtml(item.name) + '</option>'; }).join('') + '</select><button type="button" data-action="symbolic">Reflect on this symbol</button><p data-prompt>' + escapeHtml(journalPrompt(config.prompts, config.id)) + '</p><label for="wpnc-memory">Your private reflection</label><textarea id="wpnc-memory" rows="7" data-journal placeholder="Nothing is sent or saved online."></textarea><div class="wpnc-tool__actions"><button type="button" data-action="new-prompt">New prompt</button><button type="button" data-action="save-journal">Save on this device</button><button type="button" data-action="clear-journal">Clear saved note</button></div>';
    }
    root.innerHTML = '<div class="wpnc-tool__header"><p class="wpnc-tool__eyebrow">' + escapeHtml(config.eyebrow || 'A guided reflection') + '</p><h1>' + escapeHtml(config.title || 'Explore your question') + '</h1><p>' + escapeHtml(config.intro || '') + '</p></div><div class="wpnc-tool__body">' + body + '<section class="wpnc-tool__result" data-result tabindex="-1" aria-live="polite" hidden></section>' + intro + '</div>';
    root.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-action');
      if (!action) return;
      if (action === 'match') {
        var matches = matchMedium(root.querySelector('[data-need]').value, config.readers || []);
        resultBox(root, 'Possible directions', matches.map(function (m) { return '<p><strong>' + escapeHtml(m.reader.name) + '</strong> — ' + escapeHtml(m.reader.note || 'A possible fit for this reflection.') + '</p>'; }).join(''));
      } else if (action === 'reflect') {
        var q = clarityCoach(root.querySelector('[data-question]').value);
        if (type === 'tarot_workshop' && q.question) {
          var cards = tarotDraw(q.question, root.querySelector('[data-spread]').value, config.deck);
          resultBox(root, 'A symbolic reflection spread', '<p>' + cards.map(escapeHtml).join(' · ') + '</p><p>Use each card as a prompt, not a prediction. ' + q.prompts.map(escapeHtml).join(' ') + '</p>');
        } else resultBox(root, q.ready ? 'Your question is taking shape' : 'A little more clarity may help', '<p>' + q.prompts.map(escapeHtml).join(' ') + '</p>');
      } else if (action === 'quiz') {
        var profile = scoreIntuitionMeta(Array.prototype.map.call(root.querySelectorAll('[data-answer]'), function (el) { return el.value; }), config.dimensions);
        resultBox(root, 'Your intuition profile', radarSvg(profile.totals, profile.maxima) + '<div class="wpnc-tool__bars">' + Object.keys(profile.totals).map(function (key) { var max = profile.maxima[key] || 5; return '<p><span>' + escapeHtml(key) + '</span><meter min="0" max="' + max + '" value="' + profile.totals[key] + '" aria-label="' + escapeHtml(key) + ' score" aria-valuetext="' + profile.totals[key] + ' out of ' + max + '"></meter></p>'; }).join('') + '</div><p>These are reflection prompts, not a diagnosis or fixed identity.</p>');
      } else if (action === 'compatibility') {
        var c = compatibility(root.querySelector('[data-date-a]').value, root.querySelector('[data-date-b]').value);
        resultBox(root, c ? 'A shared-pattern reflection' : 'Please add both birth dates', c ? '<p>' + escapeHtml(c.firstZodiac) + ' · Life Path ' + c.firstLifePath + ' + ' + escapeHtml(c.secondZodiac) + ' · Life Path ' + c.secondLifePath + '</p><p>Symbolic resonance score: <strong>' + c.score + '/100</strong>. Talk openly about differences; no number determines a relationship.</p>' : '<p>Both dates are needed to calculate the symbolic pattern.</p>');
      } else if (action === 'symbolic') { var reflection = symbolicReflection(root.querySelector('[data-symbol]').value, config.symbols); resultBox(root, reflection ? 'A symbolic reflection' : 'Choose a symbol', reflection ? '<p>' + escapeHtml(reflection.message) + '</p><p>' + escapeHtml(reflection.prompt) + '</p><p>This is a creative exercise, not spirit contact or a supernatural message.</p>' : '<p>Select a symbol to continue.</p>'); }
      else if (action === 'new-prompt') root.querySelector('[data-prompt]').textContent = journalPrompt(config.prompts, String(Date.now()));
      else if (action === 'save-journal') { try { localStorage.setItem('wpnc-journal-' + config.id, root.querySelector('[data-journal]').value); resultBox(root, 'Saved on this device', '<p>Your note stays in this browser. Clear it any time from browser storage.</p>'); } catch (e) { resultBox(root, 'Not saved', '<p>Browser storage is unavailable; your note remains only on screen.</p>'); } }
      else if (action === 'clear-journal') { try { localStorage.removeItem('wpnc-journal-' + config.id); } catch (e) { /* storage may be disabled */ } root.querySelector('[data-journal]').value = ''; resultBox(root, 'Cleared', '<p>The saved note was removed from this browser.</p>'); }
      else if (action === 'save-line') { var text = root.querySelector('[data-reflection]').value.trim(); if (text) { var transcript = root.querySelector('[data-transcript]'), userLine = document.createElement('li'), guideLine = document.createElement('li'); userLine.textContent = 'You: ' + text; transcript.appendChild(userLine); var replies = config.conversation || []; var reply = replies[Math.min(transcript.children.length - 1, replies.length - 1)]; if (type === 'reflection_chat' && reply) { guideLine.textContent = 'Guide: ' + reply; transcript.appendChild(guideLine); } root.querySelector('[data-reflection]').value = ''; } }
      else if (action === 'timer') startTimer(root.querySelector('[data-timer]'), event.target);
    });
  }

  function startTimer(element, button) {
    if (!element || element.getAttribute('data-running') === '1') return;
    var remaining = 180; element.setAttribute('data-running', '1'); button.disabled = true;
    var tick = function () { var min = Math.floor(remaining / 60), sec = remaining % 60; element.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0'); if (remaining <= 0) { button.disabled = false; element.removeAttribute('data-running'); return; } remaining -= 1; setTimeout(tick, 1000); };
    tick();
  }

  function boot(documentObject) {
    var doc = documentObject || (typeof document !== 'undefined' ? document : null); if (!doc) return;
    Array.prototype.forEach.call(doc.querySelectorAll('[data-wpnc-tool]'), function (root) {
      var script = doc.getElementById(root.getAttribute('data-config-id') || 'wpnc-tool-config');
      try { renderTool(root, JSON.parse(script ? script.textContent : '{}')); } catch (e) { root.removeAttribute('data-wpnc-ready'); }
    });
  }

  var api = { digits: digits, reduceNumber: reduceNumber, parseIsoDate: parseIsoDate, lifePath: lifePath, zodiac: zodiac, tarotDraw: tarotDraw, clarityCoach: clarityCoach, matchMedium: matchMedium, scoreIntuition: scoreIntuition, scoreIntuitionMeta: scoreIntuitionMeta, compatibility: compatibility, journalPrompt: journalPrompt, symbolicReflection: symbolicReflection, radarSvg: radarSvg, renderTool: renderTool, boot: boot };
  /* The script is defer-loaded by rollout.py, but also works when injected
   * after DOMContentLoaded. The ready marker makes repeated calls harmless. */
  if (typeof document !== 'undefined') {
    var autoStart = function () { api.boot(document); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoStart, { once: true });
    else autoStart();
  }
  return api;
}));
