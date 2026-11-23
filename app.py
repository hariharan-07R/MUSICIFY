
from flask import Flask, render_template
import os

app = Flask(__name__)

SONGS_FOLDER = os.path.join("static", "music", "songs")

@app.route("/")
def home():
    songs = []

    for filename in os.listdir(SONGS_FOLDER):
        if filename.lower().endswith(".mp3"):
            songs.append({
                "name": os.path.splitext(filename)[0],
                "file": filename
            })

    return render_template("index.html", songs=songs)


if __name__ == "__main__":
    app.run(debug=True)
