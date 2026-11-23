
// ===============================
// MUSICIFY - MUSIC PLAYER
// ===============================

const songs = [
    {
        title: "My First Song",
        artist: "MUSICIFY Artist",
        file: "/static/music/song.mp3"
    }
];

let currentSong = 0;

const audio = document.getElementById("audioPlayer");
const playButton = document.getElementById("playButton");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");

function loadSong(index) {
    currentSong = index;

    audio.src = songs[index].file;

    document.getElementById("songTitle").textContent =
        songs[index].title;

    document.getElementById("artistName").textContent =
        songs[index].artist;

    progressBar.value = 0;
}

function togglePlay() {
    if (audio.paused) {
        audio.play()
            .then(() => {
                playButton.textContent = "⏸";
            })
            .catch(() => {
                alert("Song not found! Check static/music/song.mp3");
            });
    } else {
        audio.pause();
        playButton.textContent = "▶";
    }
}

function nextSong() {
    if (songs.length <= 1) {
        audio.currentTime = 0;
    } else {
        loadSong((currentSong + 1) % songs.length);
    }

    audio.play().catch(() => {
        alert("Unable to play this song.");
    });
}

function previousSong() {
    if (songs.length <= 1) {
        audio.currentTime = 0;
    } else {
        loadSong((currentSong - 1 + songs.length) % songs.length);
    }

    audio.play().catch(() => {
        alert("Unable to play this song.");
    });
}

// SONG PROGRESS

audio.addEventListener("timeupdate", () => {
    if (audio.duration && Number.isFinite(audio.duration)) {
        progressBar.value =
            (audio.currentTime / audio.duration) * 100;
    }
});

// SEEK SONG

progressBar.addEventListener("input", () => {
    if (audio.duration && Number.isFinite(audio.duration)) {
        audio.currentTime =
            (progressBar.value / 100) * audio.duration;
    }
});

// VOLUME CONTROL

volumeBar.addEventListener("input", () => {
    audio.volume = Number(volumeBar.value);
});

// AUTOMATIC NEXT SONG

audio.addEventListener("ended", nextSong);

// PLAY / PAUSE ICON

audio.addEventListener("play", () => {
    playButton.textContent = "⏸";
});

audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
});

// INITIAL SETTINGS

audio.volume = 0.7;


// ===============================
// MUSICIFY - SEARCH
// ===============================

const searchInput = document.getElementById("songSearch");

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase();

        const cards = document.querySelectorAll(".music-card");
        let visibleCount = 0;

        cards.forEach(card => {
            const text = (
                card.innerText + " " + (card.dataset.search || "")
            ).toLowerCase();

            const matches = text.includes(query);

            card.style.display = matches ? "" : "none";

            if (matches) {
                visibleCount++;
            }
        });

        const message = document.getElementById("searchMessage");

        if (message) {
            message.textContent =
                visibleCount === 0
                    ? "No matching categories found."
                    : "";
        }
    });
}
