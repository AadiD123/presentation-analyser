import contextlib
import io
import os
import re
import librosa
import soundfile as sf

ROOT_PATH = "/Users/jag/Downloads/presentation-analyser-main/model" 

mysp = __import__("my-voice-analysis")
AUDIO_FILE_DIR = rf"{ROOT_PATH}/audio_files"
TEMP_PATH = rf"{ROOT_PATH}/temp"
TEMP_FILE_NAME = "temp.wav"

def convert_audio_file(segment, sample_rate):
    y = segment * 32767 / max(abs(segment))
    y = y.astype('int16')
    sf.write(f"{TEMP_PATH}/{TEMP_FILE_NAME}", y, sample_rate, "PCM_24")

def analyze_segments(y, s, total_duration, segment_length_sec, analysis_type):
    for start_sec in range(int(total_duration - segment_length_sec + 1)):
        end_sec = start_sec + segment_length_sec
        segment = y[start_sec * s:end_sec * s]
        convert_audio_file(segment, s)

        with io.StringIO() as buf, contextlib.redirect_stdout(buf):
            mysp.mysptotal(TEMP_FILE_NAME[:-4], TEMP_PATH)
            captured_output = buf.getvalue()

        numbers = [float(num) for num in re.findall(r"\d+\.\d+|\d+", captured_output) if num != "0"]

        if analysis_type == "articulation_rate":
            metric = numbers[3] if len(numbers) >= 4 else None
            print(f"[{start_sec},{end_sec}]: Articulation Rate: {metric}")
        elif analysis_type == "pauses":
            metric = numbers[1] if len(numbers) >= 2 else None
            print(f"[{start_sec},{end_sec}]: Number of Pauses: {metric}")

        os.remove(rf"{TEMP_PATH}/{TEMP_FILE_NAME}")
        os.remove(rf"{TEMP_PATH}/temp.TextGrid")

def analyze_overall_balance_and_pauses(y, s):
    convert_audio_file(y, s)
    with io.StringIO() as buf, contextlib.redirect_stdout(buf):
        mysp.mysptotal(TEMP_FILE_NAME[:-4], TEMP_PATH)
        captured_output = buf.getvalue()

    numbers = [float(num) for num in re.findall(r"\d+\.\d+|\d+", captured_output) if num != "0"]
    balance = numbers[6] if len(numbers) >= 7 else None
    total_pauses = numbers[1] if len(numbers) >= 2 else None
    print(f"Overall Balance: {balance}")
    print(f"Total Number of Pauses: {total_pauses}")

    os.remove(rf"{TEMP_PATH}/{TEMP_FILE_NAME}")
    os.remove(rf"{TEMP_PATH}/temp.TextGrid")

def analyze_audio_file(audio_file):
    y, s = librosa.load(f"{AUDIO_FILE_DIR}/{audio_file}", sr=44100)
    total_duration = len(y) / s

    # Analyzing for articulation rate in segments of 7 seconds
    analyze_segments(y, s, total_duration, 7, "articulation_rate")

    # Analyzing for pauses in segments of 3 seconds
    analyze_segments(y, s, total_duration, 7, "pauses")

    # Analyzing for overall balance and total pauses
    analyze_overall_balance_and_pauses(y, s)
    


if __name__ == "__main__":
    analyze_audio_file("record.wav")
