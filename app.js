(() => {
  'use strict';

  const spreads = [
    ['ONE', 'One Card', 1],
    ['SCA', 'Situation · Challenge · Advice', 3],
    ['PPF', 'Past · Present · Future', 3],
    ['LOVE', 'Love & Relationships', 5],
    ['CAREER', 'Career & Work', 5],
    ['PATHS', 'Two Paths', 5],
    ['GROWTH', 'Personal Growth', 5],
    ['CELTIC', 'Celtic Cross', 10]
  ];

  const $ = id => document.getElementById(id);

  let selected = 'SCA';
  let pending = null;

  /*
   * ============================================================
   * TAROT CARD ARTWORK
   * ============================================================
   *
   * Expected GitHub folder structure:
   *
   * images/
   *   cards/
   *     card-back.png
   *     major/
   *     wands/
   *     cups/
   *     swords/
   *     pentacles/
   *
   */

  const CARD_BACK = 'images/cards/card-back.png';

  const majorArcana = {
    'The Fool': '00-the-fool.png',
    'The Magician': '01-the-magician.png',
    'The High Priestess': '02-the-high-priestess.png',
    'The Empress': '03-the-empress.png',
    'The Emperor': '04-the-emperor.png',
    'The Hierophant': '05-the-hierophant.png',
    'The Lovers': '06-the-lovers.png',
    'The Chariot': '07-the-chariot.png',
    'Strength': '08-strength.png',
    'The Hermit': '09-the-hermit.png',
    'Wheel of Fortune': '10-wheel-of-fortune.png',
    'Justice': '11-justice.png',
    'The Hanged Man': '12-the-hanged-man.png',
    'Death': '13-death.png',
    'Temperance': '14-temperance.png',
    'The Devil': '15-the-devil.png',
    'The Tower': '16-the-tower.png',
    'The Star': '17-the-star.png',
    'The Moon': '18-the-moon.png',
    'The Sun': '19-the-sun.png',
    'Judgement': '20-judgement.png',
    'Judgment': '20-judgement.png',
    'The World': '21-the-world.png'
  };

  function slugifyCardName(name) {
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getCardImage(cardName) {
    const name = String(cardName || '').trim();

    // Major Arcana
    if (majorArcana[name]) {
      return `images/cards/major/${majorArcana[name]}`;
    }

    // Minor Arcana
    const lower = name.toLowerCase();

    if (lower.includes('wands')) {
      return `images/cards/wands/${slugifyCardName(name)}.png`;
    }

    if (lower.includes('cups')) {
      return `images/cards/cups/${slugifyCardName(name)}.png`;
    }

    if (lower.includes('swords')) {
      return `images/cards/swords/${slugifyCardName(name)}.png`;
    }

    if (lower.includes('pentacles')) {
      return `images/cards/pentacles/${slugifyCardName(name)}.png`;
    }

    // Unknown card name
    return CARD_BACK;
  }

  /*
   * ============================================================
   * SPREAD SELECTION
   * ============================================================
   */

  $('spreads').replaceChildren(
    ...spreads.map(([id, name, count]) => {
      const b = document.createElement('button');

      b.type = 'button';
      b.className = 'spread';
      b.dataset.id = id;
      b.setAttribute('aria-pressed', String(id === selected));

      const label = document.createElement('strong');
      label.textContent = name;

      const meta = document.createElement('small');
      meta.textContent = `${count} card${count === 1 ? '' : 's'}`;

      b.append(label, meta);

      b.addEventListener('click', () => {
        selected = id;

        document
          .querySelectorAll('.spread')
          .forEach(x =>
            x.setAttribute(
              'aria-pressed',
              String(x === b)
            )
          );
      });

      return b;
    })
  );

  /*
   * ============================================================
   * GENERAL HELPERS
   * ============================================================
   */

  function node(tag, text, cls) {
    const e = document.createElement(tag);

    e.textContent = text || '';

    if (cls) {
      e.className = cls;
    }

    return e;
  }

  function block(title, body) {
    const el = node('div', '', 'reading-block');

    el.append(
      node('h3', title),
      node('p', body)
    );

    return el;
  }

  /*
   * ============================================================
   * CREATE VISUAL TAROT CARD
   * ============================================================
   */

  function createTarotCard(card) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tarot-result-card';

    const flipCard = document.createElement('button');
    flipCard.type = 'button';
    flipCard.className = 'tarot-card';
    flipCard.setAttribute(
      'aria-label',
      `Reveal ${card.positionName}`
    );

    const inner = document.createElement('span');
    inner.className = 'tarot-card-inner';

    /*
     * BACK
     */

    const back = document.createElement('span');
    back.className = 'tarot-card-face tarot-card-back';

    const backImage = document.createElement('img');
    backImage.src = CARD_BACK;
    backImage.alt = 'Tarot card back';
    backImage.draggable = false;

    back.append(backImage);

    /*
     * FRONT
     */

    const front = document.createElement('span');
    front.className = 'tarot-card-face tarot-card-front';

    const frontImage = document.createElement('img');

    frontImage.src = getCardImage(card.cardName);
    frontImage.alt = card.cardName;
    frontImage.draggable = false;

    /*
     * If the artwork has not been uploaded yet,
     * use the card back instead of showing a broken image.
     */

    frontImage.addEventListener('error', () => {
      frontImage.onerror = null;
      frontImage.src = CARD_BACK;
      front.classList.add('artwork-missing');
    });

    /*
     * Actually turn reversed cards upside down.
     */

    const orientation =
      String(card.orientation || '').toLowerCase();

    if (orientation.includes('reversed')) {
      frontImage.classList.add('reversed-card');
    }

    front.append(frontImage);

    inner.append(back, front);
    flipCard.append(inner);

    /*
     * CARD INFORMATION
     */

    const info = document.createElement('div');
    info.className = 'tarot-card-info';

    const position = node(
      'small',
      card.positionName,
      'tarot-position'
    );

    const name = node(
      'strong',
      card.cardName,
      'tarot-name'
    );

    const orientationLabel = node(
      'small',
      card.orientation,
      'tarot-orientation'
    );

    info.append(position, name, orientationLabel);

    /*
     * FLIP / REVEAL
     */

    flipCard.addEventListener('click', () => {
      flipCard.classList.toggle('flipped');

      const revealed =
        flipCard.classList.contains('flipped');

      flipCard.setAttribute(
        'aria-label',
        revealed
          ? `Hide ${card.cardName}`
          : `Reveal ${card.positionName}`
      );
    });

    wrapper.append(flipCard, info);

    return wrapper;
  }

  /*
   * ============================================================
   * DISPLAY READING
   * ============================================================
   */

  function show(data) {
    $('saved-question').textContent =
      `“${data.question}”`;

    /*
     * Build the visual cards.
     */

    const cardElements =
      data.cards.map(createTarotCard);

    $('cards').replaceChildren(...cardElements);

    /*
     * Reading text.
     */

    const r = data.reading;
    const container = $('reading');

    container.replaceChildren(
      block(
        'Overall message',
        r.overallMessage
      )
    );

    r.cardInterpretations.forEach(item => {
      const e = node(
        'div',
        '',
        'interpretation'
      );

      e.append(
        node(
          'strong',
          `${item.positionName} — ${item.cardName}`
        ),
        node(
          'p',
          item.interpretation
        )
      );

      container.append(e);
    });

    container.append(
      block(
        'Putting it together',
        r.synthesis
      ),
      block(
        'For your reflection',
        r.reflection
      )
    );

    $('result').classList.remove('hidden');

    $('result').scrollIntoView({
      behavior: 'smooth'
    });
  }

  /*
   * ============================================================
   * SEND REQUEST TO GOOGLE APPS SCRIPT
   * ============================================================
   */

  function send(payload) {
    const endpoint =
      window.TAROT_CONFIG?.endpoint;

    if (
      !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/
        .test(endpoint || '')
    ) {
      throw Error(
        'Set your Apps Script /exec URL in config.js first.'
      );
    }

    const form =
      document.createElement('form');

    form.method = 'POST';
    form.action = endpoint;
    form.target = 'tarot-transport';
    form.style.display = 'none';

    for (
      const [key, value]
      of Object.entries(payload)
    ) {
      const input =
        document.createElement('input');

      input.name = key;
      input.value = value;

      form.append(input);
    }

    document.body.append(form);

    form.submit();
    form.remove();
  }

  /*
   * ============================================================
   * RECEIVE RESULT
   * ============================================================
   *
   * HtmlService uses an inner Google iframe,
   * so event.source differs from our outer frame.
   *
   * Authenticate the Google origin AND the
   * unpredictable per-request nonce.
   */

  window.addEventListener(
    'message',
    event => {

      if (
        !pending ||
        !/^https:\/\/[a-z0-9-]*script\.googleusercontent\.com$/
          .test(event.origin)
      ) {
        return;
      }

      const message = event.data;

      if (
        !message ||
        message.type !== 'TAROT_RESULT' ||
        message.nonce !== pending.nonce
      ) {
        return;
      }

      clearTimeout(pending.timer);

      pending = null;
      $('draw').disabled = false;

      if (message.ok) {
        $('status').textContent =
          'Reading saved.';

        show(message.data);
      } else {
        $('status').textContent =
          message.error ||
          'The reading could not be completed. Please try again.';
      }
    }
  );

  /*
   * ============================================================
   * DRAW CARDS
   * ============================================================
   */

  $('draw').addEventListener(
    'click',
    () => {

      const question =
        $('question').value.trim();

      if (!question) {
        $('status').textContent =
          'Please enter a question first.';

        $('question').focus();

        return;
      }

      if (pending) {
        return;
      }

      const nonce =
        crypto.randomUUID();

      const session =
        localStorage.getItem('tarot-session') ||
        crypto.randomUUID();

      localStorage.setItem(
        'tarot-session',
        session
      );

      $('draw').disabled = true;

      $('status').textContent =
        'Shuffling the deck and reflecting on your question…';

      $('result').classList.add('hidden');

      pending = {
        nonce,
        timer: setTimeout(
          () => {
            pending = null;

            $('draw').disabled = false;

            $('status').textContent =
              'The request timed out. Check the deployment and try again.';
          },
          90000
        )
      };

      try {
        send({
          action: 'reading',
          question,
          spreadId: selected,
          sessionId: session,
          nonce
        });
      }

      catch (e) {
        clearTimeout(pending.timer);

        pending = null;

        $('draw').disabled = false;

        $('status').textContent =
          e.message;
      }
    }
  );

  /*
   * ============================================================
   * START ANOTHER READING
   * ============================================================
   */

  $('again').addEventListener(
    'click',
    () => {

      $('result').classList.add('hidden');

      $('question').value = '';

      $('question').focus();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  );

})();
