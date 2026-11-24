
import os
import sqlite3

from functools import wraps
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash
)
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

app = Flask(__name__)

# =====================================
# CONFIGURATION
# =====================================

app.secret_key = os.environ.get("SECRET_KEY")

if not app.secret_key:
    raise RuntimeError(
        "SECRET_KEY environment variable is missing!"
    )

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database path (Render persistent disk or local)
DATABASE = os.environ.get(
    "DATABASE_PATH",
    os.path.join(BASE_DIR, "musicify.db")
)

SONGS_FOLDER = os.path.join(
    BASE_DIR,
    "static",
    "music",
    "songs"
)

os.makedirs(os.path.dirname(DATABASE) or ".", exist_ok=True)
os.makedirs(SONGS_FOLDER, exist_ok=True)


# =====================================
# DATABASE
# =====================================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)


init_db()


# =====================================
# LOGIN REQUIRED
# =====================================

def login_required(function):

    @wraps(function)
    def wrapper(*args, **kwargs):

        if "user_id" not in session:
            flash("Please login first.", "error")
            return redirect(url_for("login"))

        return function(*args, **kwargs)

    return wrapper


# =====================================
# GET ALL SONGS
# =====================================

def get_songs():

    songs = []

    if not os.path.exists(SONGS_FOLDER):
        return songs

    for filename in sorted(os.listdir(SONGS_FOLDER)):

        if filename.lower().endswith(".mp3"):

            songs.append({
                "name": os.path.splitext(filename)[0],
                "file": filename,
                "url": url_for(
                    "static",
                    filename="music/songs/" + filename
                )
            })

    return songs


# =====================================
# HOME
# =====================================

@app.route("/")
@login_required
def home():

    songs = get_songs()

    return render_template(
        "index.html",
        songs=songs,
        username=session.get("username")
    )


# =====================================
# REGISTER
# =====================================

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        username = request.form.get(
            "username", ""
        ).strip()

        email = request.form.get(
            "email", ""
        ).strip().lower()

        password = request.form.get(
            "password", ""
        )

        if not username or not email or not password:
            flash("Please fill all fields.", "error")
            return redirect(url_for("register"))

        if len(password) < 8:
            flash(
                "Password must have at least 8 characters.",
                "error"
            )
            return redirect(url_for("register"))

        hashed_password = generate_password_hash(password)

        try:

            with get_db() as db:

                cursor = db.execute("""
                    INSERT INTO users
                    (username, email, password)
                    VALUES (?, ?, ?)
                """, (
                    username,
                    email,
                    hashed_password
                ))

                user_id = cursor.lastrowid

            session.clear()
            session["user_id"] = user_id
            session["username"] = username

            flash(
                "Registration successful!",
                "success"
            )

            return redirect(url_for("home"))

        except sqlite3.IntegrityError:

            flash(
                "Email already registered. Please login.",
                "error"
            )

            return redirect(url_for("register"))

    return render_template("register.html")


# =====================================
# LOGIN
# =====================================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form.get(
            "email", ""
        ).strip().lower()

        password = request.form.get(
            "password", ""
        )

        with get_db() as db:

            user = db.execute(
                "SELECT * FROM users WHERE email = ?",
                (email,)
            ).fetchone()

        if user and check_password_hash(
            user["password"],
            password
        ):

            session.clear()

            session["user_id"] = user["id"]
            session["username"] = user["username"]

            return redirect(url_for("home"))

        flash(
            "Invalid email or password.",
            "error"
        )

        return redirect(url_for("login"))

    return render_template("login.html")


# =====================================
# LOGOUT
# =====================================

@app.route("/logout")
def logout():

    session.clear()

    flash(
        "You have logged out successfully.",
        "success"
    )

    return redirect(url_for("login"))


# =====================================
# HEALTH CHECK
# =====================================

@app.route("/health")
def health():
    return {"status": "ok"}, 200


# =====================================
# RUN APPLICATION
# =====================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
