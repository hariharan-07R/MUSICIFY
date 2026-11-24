
// =====================================
// MUSICIFY - COMPLETE MUSIC PLAYER
// =====================================

const songs = window.MUSICIFY_SONGS || [];

let currentSong = -1;

const audio = document.getElementById("audioPlayer");
const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");

const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");

const playerMessage = document.getElementById("playerMessage");
const searchInput = document.getElementById("songSearch");

const cards = document.querySelectorAll(".music-card");


// =====================================
// FORMAT TIME
// =====================================

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${String(remaining).padStart(2, "0")}`;
}


// =====================================
// DISPLAY MESSAGE
// =====================================

function showMessage(message) {

    playerMessage.textContent = message;

}


// =====================================
// LOAD SONG
// =====================================

function loadSong(index) {

    if (!songs.length) {
        showMessage("No songs available.");
        return;
    }

    if (index < 0 || index >= songs.length) {
        return;
    }

    currentSong = index;

    const song = songs[index];

    audio.src = song.url;
    audio.load();

    songTitle.textContent = song.name;
    artistName.textContent = "MUSICIFY";

    progressBar.value = 0;

    currentTimeDisplay.textContent = "0:00";
    durationDisplay.textContent = "0:00";

    showMessage("");

    updateActiveCard();
}


// =====================================
// UPDATE ACTIVE CARD
// =====================================

function updateActiveCard() {

    cards.forEach(card => {

        const index = Number(card.dataset.songIndex);

        card.classList.toggle(
            "active",
            index === currentSong
        );

    });

}


// =====================================
// PLAY SONG
// =====================================

async function playSong() {

    if (currentSong === -1 && songs.length > 0) {
        loadSong(0);
    }

    if (currentSong === -1) {
        showMessage("Add MP3 songs to your music folder.");
        return;
    }

    try {

        await audio.play();

        showMessage("");

    } catch (error) {

        console.error("Audio playback error:", error);

        showMessage(
            "Unable to play this song. Check the MP3 file."
        );

    }

}


// =====================================
// PLAY / PAUSE
// =====================================

function togglePlay() {

    if (currentSong === -1) {
        playSong();
        return;
    }

    if (audio.paused) {
        playSong();
    } else {
        audio.pause();
    }

}


// =====================================
// NEXT SONG
// =====================================

function nextSong() {

    if (!songs.length) return;

    const nextIndex =
        (currentSong + 1) % songs.length;

    loadSong(nextIndex);

    playSong();

}


// =====================================
// PREVIOUS SONG
// =====================================

function previousSong() {

    if (!songs.length) return;

    const previousIndex =
        (currentSong - 1 + songs.length) % songs.length;

    loadSong(previousIndex);

    playSong();

}


// =====================================
// PLAY SONG BY CLICKING CARD
// =====================================

cards.forEach(card => {

    card.addEventListener("click", () => {

        const index = Number(card.dataset.songIndex);

        loadSong(index);

        playSong();

        document.getElementById("player")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

});


// =====================================
// PLAY / PAUSE ICON
// =====================================

audio.addEventListener("play", () => {

    playButton.textContent = "⏸";

});

audio.addEventListener("pause", () => {

    playButton.textContent = "▶";

});


// =====================================
// SONG PROGRESS
// =====================================

audio.addEventListener("timeupdate", () => {

    if (!Number.isFinite(audio.duration)) return;

    progressBar.value =
        (audio.currentTime / audio.duration) * 100;

    currentTimeDisplay.textContent =
        formatTime(audio.currentTime);

});


// =====================================
// SONG DURATION
// =====================================

audio.addEventListener("loadedmetadata", () => {

    durationDisplay.textContent =
        formatTime(audio.duration);

});


// =====================================
// SEEK SONG
// =====================================

progressBar.addEventListener("input", () => {

    if (
        Number.isFinite(audio.duration) &&
        audio.duration > 0
    ) {

        audio.currentTime =
            (Number(progressBar.value) / 100) *
            audio.duration;

    }

});


// =====================================
// VOLUME CONTROL
// =====================================

audio.volume = 0.7;

volumeBar.addEventListener("input", () => {

    audio.volume = Number(volumeBar.value);

});


// =====================================
// AUTOMATIC NEXT SONG
// =====================================

audio.addEventListener("ended", () => {

    nextSong();

});


// =====================================
// AUDIO ERROR
// =====================================

audio.addEventListener("error", () => {

    showMessage(
        "Song could not be loaded. Check the MP3 file."
    );

});


// =====================================
// SEARCH SONGS
// =====================================

searchInput.addEventListener("input", function () {

    const query = this.value.toLowerCase().trim();

    let visibleCount = 0;

    cards.forEach(card => {

        const text = card.textContent.toLowerCase();

        const matches = text.includes(query);

        card.style.display = matches ? "" : "none";

        if (matches) {
            visibleCount++;
        }

    });

    const searchMessage =
        document.getElementById("searchMessage");

    if (visibleCount === 0) {

        searchMessage.textContent =
            "No matching songs found.";

    } else {

        searchMessage.textContent = "";

    }

});


// =====================================
// BUTTON EVENTS
// =====================================

playButton.addEventListener("click", togglePlay);

nextButton.addEventListener("click", nextSong);

previousButton.addEventListener("click", previousSong);


// =====================================
// INITIALIZATION
// =====================================

if (songs.length > 0) {

    loadSong(0);

    showMessage("Choose a song to start listening.");

} else {

    showMessage(
        "No songs found. Add MP3 files to static/music/songs/."
    );

}

console.log("MUSICIFY initialized.");
console.log("Available songs:", songs.length);
