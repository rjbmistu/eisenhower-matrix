// Variable to track the last selected quadrant
let lastSelectedQuadrant = 'q1';

function addNote(quadrantId) {
    const quadrant = document.querySelector(`#${quadrantId} .notes`);
    const note = document.createElement('div');
    note.className = 'note';
    const p = document.createElement('p');
    p.setAttribute('contenteditable', 'true');
    p.textContent = '';
    note.appendChild(p);
    note.appendChild(createNoteButtons());
    quadrant.appendChild(note);
    placeCursorAtEnd(p);
    lastSelectedQuadrant = quadrantId;

    p.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    p.addEventListener('click', () => {
        if (p.getAttribute('contenteditable') !== 'true') {
            editNote(p);
        }
    });
}

function saveNote(noteOrButton) {
    const note = noteOrButton.className === 'note' ? noteOrButton : noteOrButton.closest('.note');
    const p = note.querySelector('p');
    const text = p.textContent.trim();
    if (text) {
        p.setAttribute('contenteditable', 'false');
        p.style.background = 'none';
        p.style.border = 'none';
        note.innerHTML = '';
        p.textContent = text;
        note.appendChild(p);
        note.appendChild(createNoteButtons());
        saveToLocalStorage();
    } else {
        note.remove();
        saveToLocalStorage();
    }
}

function editNote(p) {
    const note = p.closest('.note');
    const text = p.textContent;
    p.setAttribute('contenteditable', 'true');
    p.textContent = text;
    p.style.background = '#ffd700';
    p.style.border = '1px solid #ccc';
    note.innerHTML = '';
    note.appendChild(p);
    note.appendChild(createNoteButtons());
    placeCursorAtEnd(p);
}

function deleteNote(noteOrButton) {
    const note = noteOrButton.className === 'note' ? noteOrButton : noteOrButton.closest('.note');
    const quadrantId = note.closest('.quadrant').id;
    note.remove();
    saveToLocalStorage();

    const quadrantNotes = document.querySelectorAll(`#${quadrantId} .note`);
    if (quadrantNotes.length > 0) {
        const lastNote = quadrantNotes[quadrantNotes.length - 1];
        const p = lastNote.querySelector('p');
        if (p.getAttribute('contenteditable') !== 'true') {
            editNote(p);
        } else {
            placeCursorAtEnd(p);
        }
    }
}

function createNoteButtons() {
    const div = document.createElement('div');
    div.className = 'note-buttons';
    div.innerHTML = `
        <button onclick="deleteNote(this)" title="Delete"><i class="fas fa-trash"></i></button>
    `;
    return div;
}

function placeCursorAtEnd(element) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
}

document.addEventListener('keydown', function (e) {
    if (e.altKey) {
        if (e.key === 'Enter') {
            addNote(lastSelectedQuadrant);
            e.preventDefault();
        } else if (e.key === 'q') {
            switchQuadrantClockwise();
            e.preventDefault();
        } else if (e.key === '1') {
            focusQuadrant('q1');
            e.preventDefault();
        } else if (e.key === '2') {
            focusQuadrant('q2');
            e.preventDefault();
        } else if (e.key === '3') {
            focusQuadrant('q4');
            e.preventDefault();
        } else if (e.key === '4') {
            focusQuadrant('q3');
            e.preventDefault();
        }
    }

    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.getAttribute('contenteditable') === 'true') {
        const note = focusedElement.closest('.note');
        if (e.ctrlKey && e.key === 'Enter') {
            saveNote(note);
            e.preventDefault();
        } else if (e.ctrlKey && e.key === 'Backspace') {
            if (!focusedElement.textContent.trim()) {
                deleteNote(note);
                e.preventDefault();
            }
        }
    }
});

function selectQuadrant(quadrantId) {
    lastSelectedQuadrant = quadrantId;
    const quadrant = document.getElementById(quadrantId);
    quadrant.style.animation = 'none'; // Reset animation
    quadrant.style.opacity = '1'; // Ensure visibility
    void quadrant.offsetWidth; // Force reflow
    quadrant.classList.add('pop');
    setTimeout(() => quadrant.classList.remove('pop'), 300); // Match CSS duration
}

function switchQuadrantClockwise() {
    const order = ['q1', 'q2', 'q4', 'q3'];
    const currentIndex = order.indexOf(lastSelectedQuadrant);
    const nextIndex = (currentIndex + 1) % 4;
    focusQuadrant(order[nextIndex]);
}

function focusQuadrant(quadrantId) {
    lastSelectedQuadrant = quadrantId;
    const quadrant = document.getElementById(quadrantId);
    quadrant.style.animation = 'none'; // Reset animation
    quadrant.style.opacity = '1'; // Ensure visibility
    void quadrant.offsetWidth; // Force reflow
    quadrant.classList.add('pop');
    setTimeout(() => quadrant.classList.remove('pop'), 300);

    const notes = document.querySelectorAll(`#${quadrantId} .note`);
    if (notes.length > 0) {
        const lastNote = notes[notes.length - 1];
        const p = lastNote.querySelector('p');
        if (p.getAttribute('contenteditable') !== 'true') {
            editNote(p);
        } else {
            placeCursorAtEnd(p);
        }
    } else {
        addNote(quadrantId); // Add a new note if quadrant is empty
    }
}

function saveToLocalStorage() {
    const quadrants = ['q1', 'q2', 'q3', 'q4'];
    const data = {};
    quadrants.forEach(q => {
        const notes = document.querySelectorAll(`#${q} .note p`);
        data[q] = Array.from(notes)
            .map(note => note.textContent.trim())
            .filter(text => text !== '');
    });
    localStorage.setItem('eisenhowerMatrix', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('eisenhowerMatrix'));
    if (data) {
        for (const [quadrantId, notes] of Object.entries(data)) {
            const quadrant = document.querySelector(`#${quadrantId} .notes`);
            notes.forEach(text => {
                if (text.trim()) {
                    const note = document.createElement('div');
                    note.className = 'note';
                    const p = document.createElement('p');
                    p.textContent = text;
                    p.setAttribute('contenteditable', 'false');
                    note.appendChild(p);
                    note.appendChild(createNoteButtons());
                    quadrant.appendChild(note);

                    p.addEventListener('click', () => {
                        if (p.getAttribute('contenteditable') !== 'true') {
                            editNote(p);
                        }
                    });
                }
            });
        }
    }
}

function resetNotes() {
    if (confirm('Are you sure you want to reset all notes? This action cannot be undone.')) {
        localStorage.removeItem('eisenhowerMatrix');
        location.reload();
    }
}

window.onload = function () {
    loadFromLocalStorage();
    const quadrants = document.querySelectorAll('.quadrant');
    quadrants.forEach(quadrant => {
        quadrant.style.animation = 'none';
        void quadrant.offsetWidth;
        quadrant.style.animation = 'fadeIn 0.5s ease forwards';
    });
};