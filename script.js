// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to create a randomized 5x5 keyboard
function createRandomKeyboard() {
    const keyboardContainer = document.getElementById('keyboard');

    // Extract letters from the current word (including duplicates)
    const wordLetters = currentWord.split('');

    // Select 20 additional random letters (excluding letters in currentWord)
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const remainingLetters = allLetters.filter(letter => !wordLetters.includes(letter.toUpperCase()));
    const extraLetters = shuffleArray(remainingLetters).slice(0, 20); // Take 20 random letters

    // Combine the letters for the keyboard (letters from the word and 20 random letters)
    const keyboardLetters = shuffleArray(wordLetters.concat(extraLetters));

    // Ensure the total number of letters is exactly 25 (5x5 grid)
    while (keyboardLetters.length < 25) {
        keyboardLetters.push('_'); // Add placeholders if fewer than 25 letters
    }
    keyboardLetters.length = 25; // Trim to exactly 25 letters

    // Clear the keyboard container
    keyboardContainer.innerHTML = '';

    // Create a container div to make it look like a box (5x5 layout)
    keyboardContainer.style.display = 'grid';
    keyboardContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    keyboardContainer.style.gridTemplateRows = 'repeat(5, 1fr)';

    // Create buttons for each key
    keyboardLetters.forEach((key, index) => {
        const button = document.createElement('button');
        button.textContent = key === '_' ? '' : key.toUpperCase(); // Show blank for placeholder
        button.style.padding = '8px';
        button.style.fontSize = '25px'; // Adjust font size
        button.style.fontWeight = 'bold'; // Make the text bold
        button.style.cursor = 'pointer';
        button.dataset.used = 'false'; // Track usage of the button

        if (key !== '_') {
            button.onclick = () => {
                if (button.dataset.used === 'false') {
                    addToGuess(key.toUpperCase(), button);
                }
            };
        }

        keyboardContainer.appendChild(button);
    });

    // Add Backspace button
    const backspaceKey = document.createElement('button');
    backspaceKey.textContent = '←';
    backspaceKey.style.gridColumn = 'span 1';
    backspaceKey.style.padding = '10px';
    backspaceKey.style.fontSize = '24px';
    backspaceKey.style.fontWeight = 'bold';
    backspaceKey.style.cursor = 'pointer';
    backspaceKey.onclick = handleBackspace;
    keyboardContainer.appendChild(backspaceKey);

    // Add Space button
    const spaceKey = document.createElement('button');
    spaceKey.textContent = '␣'; // Unicode for space character
    spaceKey.style.gridColumn = 'span 2';
    spaceKey.style.padding = '10px';
    spaceKey.style.fontSize = '24px';
    spaceKey.style.fontWeight = 'bold';
    spaceKey.style.cursor = 'pointer';
    spaceKey.onclick = () => addToGuess(' '); // Add space to the input
    keyboardContainer.appendChild(spaceKey);

    // Add "!" button (link to tutorial.html)
    const exclamationKey = document.createElement('button');
    exclamationKey.textContent = '!';
    exclamationKey.style.gridColumn = 'span 1';
    exclamationKey.style.padding = '10px';
    exclamationKey.style.fontSize = '24px';
    exclamationKey.style.fontWeight = 'bold';
    exclamationKey.style.cursor = 'pointer';
    exclamationKey.onclick = () => {
        window.location.href = 'tutorial.html'; // Redirect to tutorial.html
    };
    keyboardContainer.appendChild(exclamationKey);

    // Add Settings button
    const settingsKey = document.createElement('button');
    settingsKey.textContent = '⚙️';
    settingsKey.style.gridColumn = 'span 1';
    settingsKey.style.padding = '10px';
    settingsKey.style.fontSize = '24px';
    settingsKey.style.fontWeight = 'bold';
    settingsKey.style.cursor = 'pointer';
    settingsKey.onclick = handleSettings; // Call handleSettings when clicked
    keyboardContainer.appendChild(settingsKey);
}

// Function to initialize the game
function initGame() {
    const randomIndex = Math.floor(Math.random() * wordsAndClues.length);
    currentWord = wordsAndClues[randomIndex].word;
    const clues = wordsAndClues[randomIndex].clues;
    document.getElementById('clue').innerText = `Filipino: ${clues[0]} \nEnglish: ${clues[1]}`;
    document.getElementById('attempts').innerText = `You have ${attempts} attempts left.`;
    document.getElementById('submitBtn').disabled = false; // Enable the submit button
    document.getElementById('guessInput').value = ''; // Clear input
    document.getElementById('feedback').innerText = ''; // Clear feedback

    // Create a new keyboard for the round
    createRandomKeyboard();

    // Add space below the attempts
    document.getElementById('attempts').style.marginBottom = '20px'; // Add margin-bottom for space
}

// Function to add a letter to the input with a max length of 5
function addToGuess(letter, button) {
    const guessInput = document.getElementById('guessInput');
    if (guessInput.value.length < 5) {
        guessInput.value += letter;
        button.dataset.used = 'true'; // Mark the button as used
        button.style.opacity = '0.5'; // Visually indicate that the button is disabled
        button.style.cursor = 'not-allowed';
    }
}

// Function to handle Backspace button click
function handleBackspace() {
    const guessInput = document.getElementById('guessInput');
    const currentInput = guessInput.value;
    if (currentInput.length > 0) {
        const lastChar = currentInput.slice(-1); // Get the last character
        const buttons = document.querySelectorAll('#keyboard button');
        buttons.forEach(button => {
            if (button.textContent === lastChar && button.dataset.used === 'true') {
                button.dataset.used = 'false'; // Mark the button as unused
                button.style.opacity = '1'; // Restore visual appearance
                button.style.cursor = 'pointer';
            }
        });
        guessInput.value = currentInput.slice(0, -1); // Remove the last character
    }
}

// Function to check the user's guess
// Function to check the user's guess
function checkGuess() {
    const guessInput = document.getElementById('guessInput');
    const feedback = document.getElementById('feedback');
    const userGuess = guessInput.value.toLowerCase();

    if (userGuess.length === 0) {
        feedback.innerText = "Your guess cannot be empty!";
        return;
    }

    if (userGuess.length > 5) {
        feedback.innerText = "Your guess cannot exceed 5 characters!";
        return;
    }

    let result = '';
    let correctLetters = new Array(currentWord.length).fill(false);
    let usedInGuess = new Array(currentWord.length).fill(false);

    // First pass: Check for exact matches
    for (let i = 0; i < currentWord.length; i++) {
        if (userGuess[i] === currentWord[i]) {
            result += userGuess[i].toUpperCase() + ' ';
            correctLetters[i] = true;
            usedInGuess[i] = true;
        } else {
            result += '_ '; // Placeholder for unmatched letters
        }
    }

    // Second pass: Check for correct letters in the wrong position
    for (let i = 0; i < currentWord.length; i++) {
        if (!correctLetters[i] && userGuess[i] !== '_') {
            for (let j = 0; j < currentWord.length; j++) {
                if (!correctLetters[j] && !usedInGuess[j] && userGuess[i] === currentWord[j]) {
                    result = result.substring(0, i * 2) + userGuess[i].toLowerCase() + result.substring(i * 2 + 1);
                    usedInGuess[j] = true;
                    break;
                }
            }
        }
    }

    feedback.innerText = `Result: ${result.trim()}`; // Use trim to remove trailing space

    if (userGuess === currentWord) {
        alert("Congratulations! You've guessed the word correctly.");
        feedback.innerText = "Loading the next round...";
        setTimeout(() => handleNext(), 2000); // Keep the delay for visual feedback
    } else {
        attempts--;
        if (attempts > 0) {
            document.getElementById('attempts').innerText = `You have ${attempts} attempts left.`;
            resetKeyboardButtons(); // Reset the keyboard buttons for another attempt
        } else {
            alert(`Sorry, you're out of attempts. The word was '${currentWord}'.`);
            let countdown = 5;
            const countdownInterval = setInterval(() => {
                document.getElementById('feedback').innerText = `Next round starting in ${countdown} seconds...`;
                countdown--;
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    handleNext();
                }
            }, 1000);
        }
    }

    guessInput.value = '';
}

// Function to reset keyboard buttons
function resetKeyboardButtons() {
    const buttons = document.querySelectorAll('#keyboard button');
    buttons.forEach(button => {
        button.dataset.used = 'false'; // Mark the button as unused
        button.style.opacity = '1'; // Restore visual appearance
        button.style.cursor = 'pointer'; // Enable the cursor
    });
}

// Function to handle Settings button click
function handleSettings() {
    handleNext();
}

// Function to handle Next button click
function handleNext() {
    attempts = 6; // Reset attempts
    initGame();
}

// List of words with corresponding clues
const wordsAndClues = [
    { "word": "pinto", "clues": ["Daanan ng tao sa bahay.", "Entrance to a house."] },
    { "word": "talon", "clues": ["Tubig na bumabagsak mula sa taas.", "Water falling from a height."] },
    { "word": "bunga", "clues": ["Prutas ng halaman.", "Produce of a plant."] },
    { "word": "buwan", "clues": ["Satellite ng planeta natin.", "Celestial body orbiting Earth."] },
    { "word": "tamis", "clues": ["Lasa mula sa asukal.", "A sweet taste."] },
    { "word": "bahay", "clues": ["Lugar na tinitirhan.", "Place to live."] },
    { "word": "tatay", "clues": ["Ama.", "A parent."] },
    { "word": "sinta", "clues": ["Salitang pang-ibig.", "Term for a loved one."] },
    { "word": "laban", "clues": ["Paglaban sa isang bagay.", "Act of fighting."] },
    { "word": "sikat", "clues": ["Tanyag o kilala.", "Widely known."] },
    { "word": "dagat", "clues": ["Malawak na anyong tubig.", "Large body of water."] },
    { "word": "araro", "clues": ["Kagamitang pangbukid.", "Tool for farming."] },
    { "word": "bikas", "clues": ["Hitsura ng tao o bagay.", "Physical form."] },
    { "word": "tanso", "clues": ["Uri ng metal.", "A type of metal."] },
    { "word": "bitin", "clues": ["Pakiramdam ng kulang.", "Feeling of incompleteness."] },
    { "word": "linaw", "clues": ["Pagiging malinaw.", "State of clarity."] },
    { "word": "sugat", "clues": ["Pinsala sa katawan.", "An injury."] },
    { "word": "lamig", "clues": ["Mababang temperatura.", "Coolness or cold."] },
    { "word": "tigas", "clues": ["Katigasan ng bagay.", "Hardness or firmness."] },
    { "word": "sakit", "clues": ["Hindi maganda sa katawan.", "Body discomfort."] },
    { "word": "boses", "clues": ["Tinig ng tao.", "A person's voice."] },
    { "word": "tanda", "clues": ["Palatandaan ng edad.", "Sign of age."] },
    { "word": "kanin", "clues": ["Nilutong bigas.", "Cooked rice."] },
    { "word": "ganda", "clues": ["Kaakit-akit na katangian.", "Beauty or charm."] },
    { "word": "ilong", "clues": ["Parte ng katawan na pang-amoy.", "Part of the body for smelling."] },
    { "word": "sinag", "clues": ["Liwanag mula sa araw.", "Light from the sun."] },
    { "word": "ngiti", "clues": ["Pagpapakita ng kasiyahan sa mukha.", "Expression of happiness on the face."] },
    { "word": "basag", "clues": ["Nawasak na bagay.", "Something broken."] },
    { "word": "NATAE", "clues": ["salitang balbal na tumutukoy sa pagdumi.", "Refers to the act of defecating."] },
    
];

// Initialize the game on load
window.onload = () => {
    initGame();
};

// Add event listeners for buttons
document.getElementById('submitBtn').addEventListener('click', checkGuess);
document.getElementById('nextBtn').addEventListener('click', handleNext);
