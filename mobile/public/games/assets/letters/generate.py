# Requires: pip install edge-tts

from pathlib import Path
import asyncio
import csv
import edge_tts

# ----------------------------
# Config
# ----------------------------
OUT_DIR = Path("./")

PL_VOICE = "pl-PL-MarekNeural"
EN_VOICE = "en-US-JennyNeural"

EDGE_RATE = "+0%"                # e.g. "-10%" slower, "+10%" faster
EDGE_PITCH = "+0Hz"              # e.g. "+50Hz" brighter

REPEAT = 1                       # say each item once or more
REPEAT_SEP = ", "                # separator between repeats

# ----------------------------
# Alphabets
# ----------------------------
EN_LETTERS = [chr(c) for c in range(ord('A'), ord('Z') + 1)]
EN_DIGITS  = [str(i) for i in range(10)]
EN_DIGIT_WORDS = {
    "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
    "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
}
def en_letter_text(ch: str) -> str: return ch

PL_LETTERS = [
    "A", "Ą", "B", "C", "Ć", "D", "E", "Ę", "F", "G", "H", "I", "J", "K", "L", "Ł",
    "M", "N", "Ń", "O", "Ó", "P", "R", "S", "Ś", "T", "U", "W", "Y", "Z", "Ź", "Ż",
]
PL_LETTER_NAMES = {
    "A": "a","Ą": "ą","B": "be","C": "c","Ć": "ć","D": "de","E": "e","Ę": "Ę","F": "f",
    "G": "g","H": "h","I": "i","J": "j","K": "k","L": "l","Ł": "ł","M": "m",
    "N": "n","Ń": "ń","O": "o","Ó": "u","P": "p","R": "r","S": "s","Ś": "ś",
    "T": "t","U": "u","W": "wu","Y": "y","Y": "igrek","Ź": "ź","Ż": "ż", "Z": 'zet'
}
PL_DIGIT_WORDS = {
    "0": "zero","1": "jeden","2": "dwa","3": "trzy","4": "cztery","5": "pięć",
    "6": "sześć","7": "siedem","8": "osiem","9": "dziewięć",
}

# ----------------------------
# Helpers
# ----------------------------
def ensure_dir(p: Path): p.mkdir(parents=True, exist_ok=True)
def repeat_text(t: str, n: int, sep: str) -> str: return t if n <= 1 else sep.join([t]*n)

async def synth_edge_tts(text: str, voice: str, path: Path):
    ensure_dir(path.parent)
    comm = edge_tts.Communicate(text, voice=voice, rate=EDGE_RATE, pitch=EDGE_PITCH)
    await comm.save(str(path))

# ----------------------------
# Main
# ----------------------------
async def main():
    manifest = []

    # Polish
    for symbol, spoken in list(PL_LETTER_NAMES.items()) + list(PL_DIGIT_WORDS.items()):
        text = repeat_text(spoken, REPEAT, REPEAT_SEP)
        out_path = OUT_DIR / "pl" / f"pl_{symbol}.mp3"
        await synth_edge_tts(text, PL_VOICE, out_path)
        manifest.append(["pl", symbol, text, PL_VOICE, str(out_path)])

    # English
    for symbol, spoken in [(ch, en_letter_text(ch)) for ch in EN_LETTERS] + list(EN_DIGIT_WORDS.items()):
        text = repeat_text(spoken, REPEAT, REPEAT_SEP)
        out_path = OUT_DIR / "en" / f"en_{symbol}.mp3"
        await synth_edge_tts(text, EN_VOICE, out_path)
        manifest.append(["en", symbol, text, EN_VOICE, str(out_path)])

    # Write manifest
    ensure_dir(OUT_DIR)
    with (OUT_DIR / "manifest.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["locale","symbol","spoken_text","voice","filepath"])
        w.writerows(manifest)

    print("✅ Done!")
    print(f"Output: {OUT_DIR.resolve()}")
    print(f"Manifest: {(OUT_DIR / 'manifest.csv').resolve()}")

if __name__ == "__main__":
    asyncio.run(main())
