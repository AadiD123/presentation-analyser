import contextlib
import io
import os
import re
import librosa
import soundfile as sf
from os import path
import openai
from openai import OpenAI
import pprint
import whisper_timestamped as whisper
from dotenv import load_dotenv
import sys



load_dotenv()
ROOT_PATH = os.getenv('ROOT_PATH')
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

def time_stamped_data(audio, model_directory):
    print("before whisper")
    # Specify the path to the model directory
    model = whisper.load_model("tiny", device="cpu", download_root=model_directory)
    print("after whisper")

    result = whisper.transcribe(model, audio, language="en")

    def simplify_transcription(data):
        simplified = []
        full_text = ""
        for segment in data['segments']:
            for word in segment['words']:
                simplified.append([word['text'], [word['start'], word['end']]])
                full_text += word['text'] + " "
        return simplified, full_text.strip()

    simplified_data, full_transcription_text = simplify_transcription(result)
    
    filtered_data = []
    repeated_words = []
    like_data = []
    for i in range(len(simplified_data)):
        if "..." in simplified_data[i][0]:
            filtered_data.append(simplified_data[i])
        if i > 0 and simplified_data[i][0] == simplified_data[i - 1][0]:
            repeated_words.append(simplified_data[i])
        if simplified_data[i][0] == "like" or simplified_data[i][0] == "like...":
            like_data.append(simplified_data[i])
    
    print(filtered_data)
    print(repeated_words)
    print(like_data)
    
if __name__ == "__main__":
    analyze_audio_file("jag5.wav")
    time_stamped_data(f"{AUDIO_FILE_DIR}/bagel.wav", f"{ROOT_PATH}/whisper-timestamped")
