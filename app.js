const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(root) {
    return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('inert') && el.offsetParent !== null
    );
}

function createModal(root) {
    const dialog = root.querySelector('[role="dialog"], [role="alertdialog"]') || root;
    const closers = root.querySelectorAll('[data-modal-close]');

    let opener = null;
    let previousOverflow = '';

    function onKeydown(event) {
        if (event.key === 'Escape') {
            event.stopPropagation();
            close();
            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = getFocusable(dialog);
        if (focusable.length === 0) {
            event.preventDefault();
            dialog.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        const escaped = !dialog.contains(active);
        if (event.shiftKey && (active === first || escaped)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (active === last || escaped)) {
            event.preventDefault();
            first.focus();
        }
    }

    function onBackdropClick(event) {
        if (event.target === root) close();
    }

    function open() {
        if (!root.hidden) return;
        opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        root.hidden = false;
        root.setAttribute('aria-hidden', 'false');
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', onKeydown);
        root.addEventListener('click', onBackdropClick);

        const focusable = getFocusable(dialog);
        const target = dialog.querySelector('[autofocus]') || focusable[0] || dialog;
        if (target === dialog && !dialog.hasAttribute('tabindex')) {
            dialog.setAttribute('tabindex', '-1');
        }
        target.focus();
    }

    function close() {
        if (root.hidden) return;
        root.hidden = true;
        root.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = previousOverflow;

        document.removeEventListener('keydown', onKeydown);
        root.removeEventListener('click', onBackdropClick);

        if (opener && document.contains(opener)) {
            opener.focus();
        }
        opener = null;
    }

    closers.forEach((btn) => btn.addEventListener('click', close));

    return { open, close, get isOpen() { return !root.hidden; } };
}

const modalRegistry = new Map();

function wireModals() {
    document.querySelectorAll('[data-modal]').forEach((el) => {
        if (!modalRegistry.has(el.id)) modalRegistry.set(el.id, createModal(el));
    });
    document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
        if (trigger.dataset.modalWired === '1') return;
        trigger.dataset.modalWired = '1';
        trigger.addEventListener('click', () => {
            const modal = modalRegistry.get(trigger.getAttribute('data-modal-open'));
            if (modal) modal.open();
        });
    });
    return modalRegistry;
}

const SEED_DECKS = [
    {
        id: 'd4', name: 'LLM & AI Concepts', cards: [
            { id: 'c6', front: 'LLM', back: 'Large Language Model — a neural network trained on large text corpora to predict and generate language.' },
            { id: 'c7', front: 'Transformer', back: 'Architecture based on self-attention that processes sequence tokens in parallel; the foundation of modern LLMs.' },
            { id: 'c8', front: 'Attention', back: 'Mechanism that computes weighted relevance between tokens, letting the model focus on the most pertinent context.' },
            { id: 'c9', front: 'Tokenization', back: 'Splitting text into subword units (e.g., BPE) that become the discrete inputs to a model.' },
            { id: 'c10', front: 'Embedding', back: 'A dense vector representation of a token, sentence, or document that captures semantic meaning.' },
            { id: 'c11', front: 'RAG', back: 'Retrieval-Augmented Generation — pairing a retriever (often vector search) with a generator so outputs are grounded in external documents.' },
            { id: 'c12', front: 'Fine-tuning', back: 'Continued training of a pre-trained model on task- or domain-specific data to specialize its behavior.' },
            { id: 'c13', front: 'RLHF', back: 'Reinforcement Learning from Human Feedback — aligning model outputs using human preference comparisons.' },
            { id: 'c14', front: 'Prompt engineering', back: 'The practice of designing inputs (instructions, examples, structure) to steer a model toward desired outputs.' },
            { id: 'c15', front: 'Context window', back: 'The maximum number of tokens a model can attend to in a single forward pass.' },
            { id: 'c16', front: 'Hallucination', back: 'When a model produces confident output that is factually incorrect or fabricated.' },
            { id: 'c17', front: 'Agent', back: 'An LLM-driven system that plans, uses tools, and iterates across steps to complete multi-stage tasks.' },
            { id: 'c18', front: 'Vector database', back: 'A store optimized for similarity search over embeddings; the retrieval backbone of most RAG systems.' },
            { id: 'c19', front: 'Chain-of-thought', back: 'Prompting technique that asks the model to produce intermediate reasoning steps before the final answer.' },
            { id: 'c20', front: 'Temperature', back: 'Sampling parameter that controls output randomness — lower = more deterministic, higher = more creative.' },
        ],
    },
    {
        id: 'd5', name: 'Neuro Engineering', cards: [
            { id: 'c21', front: 'BCI', back: 'Brain–Computer Interface — a system that translates neural activity into control signals for external devices, bypassing normal motor pathways.' },
            { id: 'c22', front: 'EEG', back: 'Electroencephalography — non-invasive recording of electrical activity summed across cortical neurons via scalp electrodes.' },
            { id: 'c23', front: 'ECoG', back: 'Electrocorticography — electrodes placed directly on the cortical surface, trading invasiveness for much higher spatial resolution than EEG.' },
            { id: 'c24', front: 'Action potential', back: 'The all-or-none electrical spike that propagates along an axon when a neuron\'s membrane potential crosses threshold.' },
            { id: 'c25', front: 'Neural decoding', back: 'Inferring an external variable (intent, stimulus, movement) from recorded neural activity.' },
            { id: 'c26', front: 'Neural encoding', back: 'How information about stimuli or actions is represented in the firing patterns of neuronal populations.' },
            { id: 'c27', front: 'Spike sorting', back: 'Assigning each detected action potential in a multi-unit recording to a specific putative neuron based on waveform shape.' },
            { id: 'c28', front: 'Optogenetics', back: 'Technique for controlling genetically targeted neurons with light, using light-sensitive ion channels like channelrhodopsin.' },
            { id: 'c29', front: 'Neuroprosthetic', back: 'A device that substitutes for or augments a missing or damaged neural function (e.g., cochlear implant, retinal prosthesis, robotic arm controlled by BCI).' },
            { id: 'c30', front: 'DBS', back: 'Deep Brain Stimulation — implanted electrodes delivering chronic electrical pulses to specific nuclei, used clinically for Parkinson\'s, essential tremor, and OCD.' },
            { id: 'c31', front: 'fMRI', back: 'Functional MRI — images changes in blood oxygenation (BOLD signal) as an indirect proxy for local neural activity, with high spatial but low temporal resolution.' },
            { id: 'c32', front: 'LFP', back: 'Local Field Potential — the low-frequency component of extracellular voltage, reflecting synchronized synaptic currents in the surrounding tissue.' },
            { id: 'c33', front: 'Closed-loop stimulation', back: 'Stimulation whose parameters are adjusted in real time based on recorded neural signals, used to track brain state and respond adaptively.' },
            { id: 'c34', front: 'Microelectrode array', back: 'A grid of electrodes (e.g., Utah array) that records or stimulates many neurons in parallel with single-unit resolution.' },
            { id: 'c35', front: 'Neuromodulation', back: 'Altering nervous-system activity via targeted delivery of electrical, magnetic, optical, or chemical stimuli.' },
        ],
    },
    {
        id: 'd1', name: 'Spanish Basics', cards: [
            { id: 'c1', front: 'Hola', back: 'Hello' },
            { id: 'c2', front: 'Gracias', back: 'Thank you' },
            { id: 'c3', front: 'Adiós', back: 'Goodbye' },
        ],
    },
    {
        id: 'd2', name: 'JavaScript', cards: [
            { id: 'c4', front: 'typeof []', back: '"object"' },
            { id: 'c5', front: 'const', back: 'Immutable binding' },
        ],
    },
    { id: 'd3', name: 'World Capitals', cards: [] },
];

function cloneDeck(deck) {
    return {
        id: deck.id,
        name: deck.name,
        cards: deck.cards.map((c) => ({ id: c.id, front: c.front, back: c.back })),
    };
}

const state = {
    decks: SEED_DECKS.map(cloneDeck),
    activeDeckId: 'd1',
    activeCardIndex: 0,
    studyFlipped: false,
    studyMode: false,
    searchQuery: '',
    seededIds: [],
};

let studyKeyHandler = null;

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

function persist() {
    if (!window.FlashcardsStorage) return;
    window.FlashcardsStorage.saveState({
        decks: state.decks,
        activeDeckId: state.activeDeckId,
        seededIds: state.seededIds,
    });
}

function hydrateFromStorage() {
    if (!window.FlashcardsStorage) return false;
    const stored = window.FlashcardsStorage.loadState();
    const hasStoredDecks = stored && Array.isArray(stored.decks);

    if (hasStoredDecks) {
        state.decks = stored.decks.map((d) => ({
            id: String(d.id),
            name: String(d.name ?? ''),
            cards: Array.isArray(d.cards) ? d.cards.map((c) => ({
                id: String(c.id),
                front: String(c.front ?? ''),
                back: String(c.back ?? ''),
            })) : [],
        }));
    }

    const seededIds = new Set(
        stored && Array.isArray(stored.seededIds) ? stored.seededIds : []
    );
    const existingIds = new Set(state.decks.map((d) => d.id));
    let changed = !hasStoredDecks;

    for (const seed of SEED_DECKS) {
        if (seededIds.has(seed.id)) continue;
        if (!existingIds.has(seed.id)) {
            state.decks.push(cloneDeck(seed));
            changed = true;
        }
        seededIds.add(seed.id);
        changed = true;
    }
    state.seededIds = Array.from(seededIds);

    const seedOrder = new Map(SEED_DECKS.map((d, i) => [d.id, i]));
    const beforeIds = state.decks.map((d) => d.id).join('|');
    state.decks.sort((a, b) => {
        const ai = seedOrder.has(a.id) ? seedOrder.get(a.id) : Infinity;
        const bi = seedOrder.has(b.id) ? seedOrder.get(b.id) : Infinity;
        return ai - bi;
    });
    if (state.decks.map((d) => d.id).join('|') !== beforeIds) changed = true;

    if (hasStoredDecks) {
        const activeOk = typeof stored.activeDeckId === 'string'
            && state.decks.some((d) => d.id === stored.activeDeckId);
        state.activeDeckId = activeOk ? stored.activeDeckId : (state.decks[0]?.id ?? null);
    } else {
        state.activeDeckId = state.decks[0]?.id ?? null;
    }
    state.activeCardIndex = 0;
    state.studyFlipped = false;

    for (const deck of state.decks) {
        const n = Number(String(deck.id).slice(1));
        if (Number.isFinite(n) && n >= nextDeckSeq) nextDeckSeq = n + 1;
        for (const card of deck.cards) {
            const m = Number(String(card.id).slice(1));
            if (Number.isFinite(m) && m >= nextCardSeq) nextCardSeq = m + 1;
        }
    }

    if (changed) persist();
    return true;
}

let nextDeckSeq = 6;
let nextCardSeq = 36;
const newDeckId = () => `d${nextDeckSeq++}`;
const newCardId = () => `c${nextCardSeq++}`;

function getActiveDeck() {
    return state.decks.find((d) => d.id === state.activeDeckId) ?? null;
}

function createDeck(name) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const deck = { id: newDeckId(), name: trimmed, cards: [] };
    state.decks.push(deck);
    state.activeDeckId = deck.id;
    state.activeCardIndex = 0;
    state.studyFlipped = false;
    renderAll();
    return deck;
}

function renameDeck(id, name) {
    const trimmed = name.trim();
    const deck = state.decks.find((d) => d.id === id);
    if (!deck || !trimmed) return;
    deck.name = trimmed;
    renderAll();
}

function deleteDeck(id) {
    const idx = state.decks.findIndex((d) => d.id === id);
    if (idx === -1) return;
    state.decks.splice(idx, 1);
    if (state.activeDeckId === id) {
        state.activeDeckId = state.decks[0]?.id ?? null;
        state.activeCardIndex = 0;
        state.studyFlipped = false;
    }
    renderAll();

    if (state.decks.length > 0) {
        document.querySelector('#deck-list .deck-item')?.focus();
    } else {
        document.getElementById('new-deck')?.focus();
    }
}

function setActiveDeck(id) {
    if (!state.decks.some((d) => d.id === id)) return;
    state.activeDeckId = id;
    state.activeCardIndex = 0;
    state.studyFlipped = false;
    renderAll();
}

function createCard(front, back) {
    const deck = getActiveDeck();
    if (!deck) return null;
    const f = front.trim(), b = back.trim();
    if (!f || !b) return null;
    const card = { id: newCardId(), front: f, back: b };
    deck.cards.push(card);
    renderAll();
    return card;
}

function updateCard(cardId, front, back) {
    const deck = getActiveDeck();
    const card = deck?.cards.find((c) => c.id === cardId);
    if (!card) return false;
    const f = front.trim(), b = back.trim();
    if (!f || !b) return false;
    card.front = f;
    card.back = b;
    renderAll();
    return true;
}

function deleteCard(cardId) {
    const deck = getActiveDeck();
    if (!deck) return;
    const idx = deck.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;
    deck.cards.splice(idx, 1);
    if (state.activeCardIndex >= deck.cards.length) {
        state.activeCardIndex = Math.max(0, deck.cards.length - 1);
    }
    state.studyFlipped = false;
    renderAll();

    const neighbour = deck.cards[idx] ?? deck.cards[idx - 1] ?? null;
    if (neighbour) {
        document.querySelector(`#cards-grid [data-id="${neighbour.id}"] .card-inner`)?.focus();
    } else {
        document.getElementById('new-card')?.focus();
    }
}

function shuffleDeck() {
    const deck = getActiveDeck();
    if (!deck || deck.cards.length < 2) return false;
    const arr = deck.cards;
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    state.activeCardIndex = 0;
    state.studyFlipped = false;
    renderAll();
    return true;
}

function stepCard(delta) {
    const deck = getActiveDeck();
    if (!deck || deck.cards.length === 0) return;
    const n = deck.cards.length;
    state.activeCardIndex = (state.activeCardIndex + delta + n) % n;
    state.studyFlipped = false;
    renderStudyCard();
}

function toggleStudyFlip() {
    state.studyFlipped = !state.studyFlipped;
    renderStudyCard();
}

function enterStudyMode(deckId) {
    if (deckId !== undefined) {
        if (!state.decks.some((d) => d.id === deckId)) return false;
        state.activeDeckId = deckId;
    }
    const deck = getActiveDeck();
    if (!deck) return false;

    if (state.studyMode) exitStudyMode();

    state.studyMode = true;
    state.activeCardIndex = 0;
    state.studyFlipped = false;

    studyKeyHandler = (event) => {
        if (event.defaultPrevented) return;
        const t = event.target;
        if (t && t.matches && t.matches('input, textarea, [contenteditable="true"]')) return;

        switch (event.key) {
            case ' ':
            case 'Spacebar':
                event.preventDefault();
                toggleStudyFlip();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                stepCard(-1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                stepCard(1);
                break;
            case 'Escape':
                event.preventDefault();
                exitStudyMode();
                break;
            case 'n':
            case 'N':
                if (event.metaKey || event.ctrlKey || event.altKey) return;
                event.preventDefault();
                openCardModal(null);
                break;
        }
    };

    document.addEventListener('keydown', studyKeyHandler);
    document.body.classList.add('is-studying');
    renderAll();
    renderStudyToggle();
    document.getElementById('flashcard')?.focus();
    return true;
}

function exitStudyMode() {
    if (!state.studyMode) return;
    state.studyMode = false;
    state.studyFlipped = false;

    if (studyKeyHandler) {
        document.removeEventListener('keydown', studyKeyHandler);
        studyKeyHandler = null;
    }
    document.body.classList.remove('is-studying');
    renderStudyCard();
    renderStudyToggle();
}

function renderStudyToggle() {
    const btn = document.getElementById('study-toggle');
    if (!btn) return;
    btn.textContent = state.studyMode ? 'Exit Study' : 'Study';
    btn.setAttribute('aria-pressed', String(state.studyMode));
}

function renderAll() {
    renderDecks();
    renderStudyCard();
    renderCardsGrid();
    persist();
}

function renderDecks() {
    const list = document.getElementById('deck-list');
    const empty = document.getElementById('deck-empty');
    const title = document.getElementById('deck-title');
    if (!list) return;

    list.innerHTML = '';

    if (state.decks.length === 0) {
        list.hidden = true;
        if (empty) {
            empty.hidden = false;
            empty.innerHTML = '';
            empty.appendChild(renderEmptyState({
                icon: ICONS.deck,
                title: 'No decks yet',
                body: 'Click "+ New Deck" above to get started.',
            }));
        }
    } else {
        list.hidden = false;
        if (empty) empty.hidden = true;

        for (const deck of state.decks) {
            const isActive = deck.id === state.activeDeckId;
            const li = document.createElement('li');
            li.className = 'deck-row';
            li.innerHTML = `
                <button type="button" class="deck-item${isActive ? ' is-active' : ''}"
                        data-action="activate" data-id="${deck.id}"
                        ${isActive ? 'aria-current="true"' : ''}>
                    <span class="deck-name"></span>
                    <span class="deck-count" aria-label="${deck.cards.length} cards">${deck.cards.length}</span>
                </button>
                <button type="button" class="deck-delete" data-action="delete" data-id="${deck.id}">&times;</button>
            `;
            li.querySelector('.deck-name').textContent = deck.name;
            li.querySelector('.deck-delete').setAttribute('aria-label', `Delete "${deck.name}" deck`);
            list.appendChild(li);
        }
    }

    if (title) {
        const active = getActiveDeck();
        title.textContent = active ? active.name : 'No deck selected';
    }
}

const ICONS = {
    deck: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
    card: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="10" x2="17" y2="10"/><line x1="7" y1="14" x2="13" y2="14"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
};

function renderEmptyState({ icon, title, body }) {
    const el = document.createElement('div');
    el.className = 'empty-state';
    el.innerHTML = `
        <div class="empty-state-icon">${icon}</div>
        <h3 class="empty-state-title"></h3>
        <p class="empty-state-body"></p>
    `;
    el.querySelector('.empty-state-title').textContent = title;
    el.querySelector('.empty-state-body').textContent = body;
    return el;
}

function renderStudyCard() {
    const flashcard = document.getElementById('flashcard');
    if (!flashcard) return;
    const deck = getActiveDeck();
    const card = deck?.cards[state.activeCardIndex] ?? null;
    const frontEl = flashcard.querySelector('.flashcard-front .flashcard-text');
    const backEl = flashcard.querySelector('.flashcard-back .flashcard-text');
    const frontFace = flashcard.querySelector('.flashcard-front');
    const backFace = flashcard.querySelector('.flashcard-back');

    if (frontEl) frontEl.textContent = card ? card.front : '—';
    if (backEl) backEl.textContent = card ? card.back : 'No cards yet';

    flashcard.classList.toggle('is-flipped', state.studyFlipped);
    flashcard.setAttribute('aria-pressed', String(state.studyFlipped));

    if (frontFace) frontFace.setAttribute('aria-hidden', String(state.studyFlipped));
    if (backFace) backFace.setAttribute('aria-hidden', String(!state.studyFlipped));

    if (card && deck) {
        const face = state.studyFlipped ? 'back' : 'front';
        const text = state.studyFlipped ? card.back : card.front;
        flashcard.setAttribute(
            'aria-label',
            `Card ${state.activeCardIndex + 1} of ${deck.cards.length}, ${face}: ${text}. Activate to flip.`
        );
    } else {
        flashcard.setAttribute('aria-label', 'No cards in this deck.');
    }
}

function renderCardsGrid() {
    const grid = document.getElementById('cards-grid');
    const status = document.getElementById('cards-status');
    if (!grid) return;
    const deck = getActiveDeck();
    grid.innerHTML = '';
    grid.removeAttribute('role');

    if (!deck) {
        if (status) status.textContent = '';
        grid.appendChild(renderEmptyState({
            icon: ICONS.deck,
            title: 'No deck selected',
            body: 'Create a deck or choose one from the sidebar to see its cards.',
        }));
        return;
    }

    const q = state.searchQuery.trim();
    const filtered = q
        ? deck.cards.filter((c) => c.front.includes(q) || c.back.includes(q))
        : deck.cards;

    if (status) {
        if (q) status.textContent = `${filtered.length} match${filtered.length === 1 ? '' : 'es'} of ${deck.cards.length}`;
        else status.textContent = `${deck.cards.length} card${deck.cards.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
        grid.appendChild(renderEmptyState(
            q
                ? {
                    icon: ICONS.search,
                    title: 'No matches',
                    body: `Nothing in "${deck.name}" contains "${q}". Try a different query.`,
                }
                : {
                    icon: ICONS.card,
                    title: 'No cards yet',
                    body: 'Click "+ New Card" in the toolbar to add your first card.',
                }
        ));
        return;
    }

    grid.setAttribute('role', 'list');
    for (const card of filtered) {
        const preview = card.front.length > 30 ? `${card.front.slice(0, 30)}…` : card.front;
        const el = document.createElement('div');
        el.className = 'card';
        el.dataset.id = card.id;
        el.setAttribute('role', 'listitem');
        el.innerHTML = `
            <button type="button" class="card-inner" data-action="flip" aria-pressed="false">
                <span class="card-face card-front"></span>
                <span class="card-face card-back" aria-hidden="true"></span>
            </button>
            <div class="card-actions">
                <button type="button" class="card-action" data-action="edit">&#9998;</button>
                <button type="button" class="card-action" data-action="delete">&times;</button>
            </div>
        `;
        el.querySelector('.card-front').textContent = card.front;
        el.querySelector('.card-back').textContent = card.back;
        el.querySelector('[data-action="flip"]').setAttribute('aria-label', `Flip card: ${preview}`);
        el.querySelector('[data-action="edit"]').setAttribute('aria-label', `Edit card: ${preview}`);
        el.querySelector('[data-action="delete"]').setAttribute('aria-label', `Delete card: ${preview}`);
        grid.appendChild(el);
    }
}

function initDecks() {
    const list = document.getElementById('deck-list');
    const form = document.getElementById('new-deck-form');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.elements.namedItem('name');
            const name = input.value;
            if (createDeck(name)) {
                form.reset();
                modalRegistry.get('new-deck-modal')?.close();
            }
        });
    }

    if (list) {
        list.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-action]');
            if (!btn) return;
            const { action, id } = btn.dataset;
            if (action === 'activate') setActiveDeck(id);
            else if (action === 'delete') {
                event.stopPropagation();
                const deck = state.decks.find((d) => d.id === id);
                if (deck && window.confirm(`Delete "${deck.name}"?`)) deleteDeck(id);
            }
        });

        list.addEventListener('dblclick', (event) => {
            const btn = event.target.closest('[data-action="activate"]');
            if (!btn) return;
            const deck = state.decks.find((d) => d.id === btn.dataset.id);
            if (!deck) return;
            const name = window.prompt('Rename deck:', deck.name);
            if (name !== null) renameDeck(deck.id, name);
        });
    }

    renderDecks();
}

function openCardModal(cardId = null) {
    const deck = getActiveDeck();
    if (!deck) {
        window.alert('Create or select a deck first.');
        return;
    }
    const form = document.getElementById('card-form');
    const title = document.getElementById('cm-title');
    if (!form || !title) return;

    form.reset();
    form.elements.id.value = cardId ?? '';
    if (cardId) {
        const card = deck.cards.find((c) => c.id === cardId);
        if (!card) return;
        form.elements.front.value = card.front;
        form.elements.back.value = card.back;
        title.textContent = 'Edit card';
    } else {
        title.textContent = 'New card';
    }
    modalRegistry.get('card-modal')?.open();
}

function initCards() {
    const newBtn = document.getElementById('new-card');
    const form = document.getElementById('card-form');
    const grid = document.getElementById('cards-grid');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const flip = document.getElementById('flip');
    const studyCard = document.getElementById('flashcard');

    newBtn?.addEventListener('click', () => openCardModal(null));

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = form.elements.id.value;
        const front = form.elements.front.value;
        const back = form.elements.back.value;
        const ok = id ? updateCard(id, front, back) : !!createCard(front, back);
        if (ok) modalRegistry.get('card-modal')?.close();
    });

    grid?.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;
        const cardEl = btn.closest('.card');
        if (!cardEl) return;
        const cardId = cardEl.dataset.id;
        const deck = getActiveDeck();
        if (!deck) return;
        const action = btn.dataset.action;

        if (action === 'flip') {
            const flipped = cardEl.classList.toggle('is-flipped');
            cardEl.querySelector('.card-inner')?.setAttribute('aria-pressed', String(flipped));
            cardEl.querySelector('.card-front')?.setAttribute('aria-hidden', String(flipped));
            cardEl.querySelector('.card-back')?.setAttribute('aria-hidden', String(!flipped));
        } else if (action === 'edit') {
            openCardModal(cardId);
        } else if (action === 'delete') {
            const card = deck.cards.find((c) => c.id === cardId);
            if (card && window.confirm(`Delete this card?\n\n${card.front}`)) deleteCard(cardId);
        }
    });

    prev?.addEventListener('click', () => stepCard(-1));
    next?.addEventListener('click', () => stepCard(1));
    flip?.addEventListener('click', toggleStudyFlip);
    studyCard?.addEventListener('click', toggleStudyFlip);

    document.getElementById('shuffle')?.addEventListener('click', shuffleDeck);

    const searchInput = document.getElementById('search');
    if (searchInput) {
        const applySearch = debounce((value) => {
            state.searchQuery = value;
            renderCardsGrid();
        }, 300);
        searchInput.addEventListener('input', (event) => applySearch(event.target.value));
    }

    document.getElementById('study-toggle')?.addEventListener('click', () => {
        if (state.studyMode) exitStudyMode();
        else enterStudyMode(state.activeDeckId);
    });

    renderStudyToggle();
}

window.Flashcards = {
    createModal,
    wireModals,
    decks: { create: createDeck, rename: renameDeck, delete: deleteDeck, setActive: setActiveDeck, getState: () => state },
    cards: { create: createCard, update: updateCard, delete: deleteCard, step: stepCard, toggleFlip: toggleStudyFlip, shuffle: shuffleDeck },
    study: { enter: enterStudyMode, exit: exitStudyMode },
};

document.addEventListener('DOMContentLoaded', () => {
    hydrateFromStorage();
    wireModals();
    initDecks();
    initCards();
    renderStudyCard();
    renderCardsGrid();
});
