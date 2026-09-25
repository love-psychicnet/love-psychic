(() => {
  const deck = [
    ['The Star', 'star', 'Hope can make room for steadier trust. Notice what helps you feel safe enough to be honest.'],
    ['Strength', 'strength', 'Gentle honesty can be stronger than pressure. What feeling needs patience rather than control?'],
    ['Two of Cups', 'two-of-cups', 'Reciprocity matters. Where do care and effort feel mutual, and where would a direct check-in help?'],
    ['The Hermit', 'hermit', 'A pause can offer perspective. What do you know when you set urgency aside?'],
    ['Justice', 'justice', 'Bring actions and expectations into balance. What would a fair, specific conversation sound like?'],
    ['Temperance', 'temperance', 'Different needs may ask for time and careful listening. What small adjustment could reduce friction?'],
    ['The Moon', 'moon', 'Uncertainty can magnify fear or hope. Separate facts from guesses before deciding what comes next.'],
    ['The Empress', 'empress', 'Care grows when it has room to breathe. What nurtures your wellbeing beyond this connection?'],
    ['The Lovers', 'lovers', 'A choice can reflect your values. What choice honors both your desire and your self-respect?'],
    ['The Chariot', 'chariot', 'Direction takes intention. What is one step you can choose without trying to steer another person?'],
    ['Four of Swords', 'four-of-swords', 'Rest may be part of clarity. What would a calm pause help you notice?'],
    ['Page of Cups', 'page-of-cups', 'Stay open to a sincere feeling while keeping expectations grounded. What would you like to express simply?'],
    ['Eight of Cups', 'eight-of-cups', 'Leaving a pattern can be an act of care. What are you ready to stop carrying alone?'],
    ['Six of Pentacles', 'six-of-pentacles', 'Notice the exchange of attention and effort. What would a more balanced give-and-take look like?'],
    ['Queen of Swords', 'queen-of-swords', 'Clear boundaries and kind words can coexist. What do you need to say plainly?'],
    ['The Sun', 'sun', 'Warmth is worth noticing. What can you appreciate without assuming it promises a particular future?'],
    ['The Hanged Man', 'hanged-one', 'A new perspective may change the question. What might you see if you paused before reacting?'],
    ['Ace of Pentacles', 'ace-of-pentacles', 'A dependable beginning is built from actions. What small, practical sign of care matters to you?'],
    ['The High Priestess', 'high-priestess', 'Listen inward, then check intuition against what is actually known. What feels true for you?'],
    ['Three of Pentacles', 'three-of-pentacles', 'Healthy connection takes shared participation. What would collaboration look like here?'],
    ['Wheel of Fortune', 'wheel-of-fortune', 'Some conditions change beyond your control. Which part of this moment can you meet with flexibility?'],
    ['King of Cups', 'king-of-cups', 'Emotional steadiness helps make room for truth. What response would reflect the person you want to be?'],
  ];

  const contexts = {
    new: {
      title: 'A new connection',
      questions: ['What am I bringing into this new connection?', 'What am I curious to learn instead of assume about them?', 'What pace or boundary would help this grow mutually?'],
      next: 'Let the cards suggest what you want to notice as you get to know each other. Stay open to curiosity, and let consistent actions—not a single moment—show you how the connection develops.',
    },
    signals: {
      title: 'Mixed signals',
      questions: ['What do I know from their consistent actions?', 'What am I hoping the uncertainty will mean?', 'What simple question would bring more clarity?'],
      next: 'Let the cards help you name one thing to ask directly. Give the other person room to answer, and notice whether their actions align with what they say.',
    },
    breakup: {
      title: 'Breakup, distance, or no contact',
      questions: ['What am I feeling beneath the urge to get an answer?', 'What lesson or need belongs to my own healing?', 'What caring next step does not depend on a reply?'],
      next: 'Protect your healing and respect any no-contact boundary. Consider writing the message you wish you could send without sending it, then choose support that is available now.',
    },
    compatibility: {
      title: 'Compatibility and shared values',
      questions: ['Which values and needs matter most to me in a partnership?', 'What do I know about how we each communicate and show care?', 'Which difference needs a conversation, and where is compromise possible?'],
      next: 'Compatibility is not a fixed score or a promise about the future. Use the spread to name what matters to you, then talk openly about expectations, communication, and shared goals.',
    },
  };

  const draw = document.querySelector('#draw');
  const clear = document.querySelector('#clear');
  const result = document.querySelector('#result');
  const cards = document.querySelector('#cards');
  const status = document.querySelector('#status');
  const positions = ['You', 'The other person', 'The dynamic between you'];
  const imagePath = (slug) => `assets/tarot/${slug}.webp`;

  function span(className, content) {
    const element = document.createElement('span');
    element.className = className;
    if (content) element.textContent = content;
    return element;
  }

  function makeCard(card, index, question) {
    const [name, slug, meaning] = card;
    const article = document.createElement('article');
    article.className = 'card';

    const position = span('card-position');
    const number = document.createElement('b');
    number.textContent = String(index + 1).padStart(2, '0');
    position.append(number, document.createTextNode(positions[index]));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-flip';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Reveal card for ${positions[index]}`);

    const inner = span('card-inner');
    const back = span('card-face card-back');
    const backImage = document.createElement('img');
    backImage.src = imagePath('back');
    backImage.alt = '';
    back.append(backImage);
    const front = span('card-face card-front');
    const frontImage = document.createElement('img');
    frontImage.src = imagePath(slug);
    frontImage.alt = '';
    frontImage.loading = 'lazy';
    front.append(frontImage);
    inner.append(back, front);
    button.append(inner);

    const action = span('card-action', 'Reveal card');
    const reflection = span('card-reflection');
    const title = span('card-title', name);
    const description = span('card-meaning', meaning);
    const prompt = span('card-question');
    const bold = document.createElement('strong');
    bold.textContent = 'Ask yourself: ';
    prompt.append(bold, document.createTextNode(question));
    reflection.append(title, description, prompt);

    button.addEventListener('click', () => {
      const revealed = article.classList.toggle('is-flipped');
      button.setAttribute('aria-pressed', String(revealed));
      button.setAttribute('aria-label', `${revealed ? 'Hide' : 'Reveal'} card for ${positions[index]}${revealed ? `: ${name}` : ''}`);
      action.textContent = revealed ? 'Turn face down' : 'Reveal card';
      status.textContent = revealed ? `${name} revealed for ${positions[index]}.` : `Card for ${positions[index]} turned face down.`;
    });

    article.append(position, button, action, reflection);
    return article;
  }

  draw.addEventListener('click', () => {
    const picked = document.querySelector('input[name="situation"]:checked');
    if (!picked) {
      status.textContent = 'Choose one relationship situation first.';
      document.querySelector('fieldset input').focus();
      return;
    }
    const context = contexts[picked.value];
    const pool = [...deck];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    cards.replaceChildren(...pool.slice(0, 3).map((card, index) => makeCard(card, index, context.questions[index])));
    document.querySelector('#result-title').textContent = context.title;
    document.querySelector('#result-intro').textContent = 'Turn each card to see its artwork and reflection prompt. The positions describe your experience and the pattern you notice.';
    document.querySelector('#next-step').textContent = context.next;
    result.hidden = false;
    status.textContent = 'Three cards drawn face down. Reveal each card.';
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  clear.addEventListener('click', () => {
    document.querySelectorAll('input[name="situation"]').forEach((input) => { input.checked = false; });
    document.querySelector('#heart-question').value = '';
    cards.replaceChildren();
    result.hidden = true;
    status.textContent = 'Reading cleared.';
    draw.focus();
  });
})();
