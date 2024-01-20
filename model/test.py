import contextlib
import io
import os
import re

import librosa
import soundfile as sf

ROOT_PATH = "/Users/arnav/git/presentation-analyser/model"

mysp = __import__("my-voice-analysis")
path = rf"{ROOT_PATH}/audio_files" # Path to where your audio file are
temp_path = rf"{ROOT_PATH}/temp" # IMPORTANT! drop the "myspsolution.praat" in this folder and this folder path and name does not have spaces.
temp_name = "temp.wav" # file name of the temp file for conversion.


def analyze_audio_file(audio_file):
    convert_audio_file(audio_file, path)
    with io.StringIO() as buf, contextlib.redirect_stdout(buf):
        mysp.mysptotal(temp_name[:-4], temp_path)
        captured_output = buf.getvalue()

        numbers = [float(num) for num in re.findall(r"\d+\.\d+|\d+", captured_output) if num != "0"]
        # remove temp file
        os.remove(fr"{temp_path}/{temp_name}")

        if len(numbers) != 16:
            return numbers
        return {
            "number_of_syllables": numbers[0],
            "number_of_pauses": numbers[1],
            "rate_of_speech": numbers[2],
            "articulation_rate": numbers[3],
            "speaking_duration": numbers[4],
            "original_duration": numbers[5],
            "balance": numbers[6],
            "f0_mean": numbers[7],
            "f0_std": numbers[8],
            "f0_median": numbers[9],
            "f0_min": numbers[10],
            "f0_max": numbers[11],
            "f0_quantile25": numbers[12],
            "f0_quan75": numbers[13],
        }


def convert_audio_file(input_file, path):
    y, s = librosa.load(f"{path}/{input_file}", sr=44100)

    if len(y) % 2 == 1:
        y = y[:-1]

    y = y * 32767 / max(abs(y))
    y = y.astype('int16')

    sf.write(f"{temp_path}/{temp_name}", y, s, "PCM_24")

path = rf"{ROOT_PATH}/audio_files" # Path to where your audio file(s) is(are)

print(analyze_audio_file("record.wav")) # Name of the audio file in the folder of the path variable.