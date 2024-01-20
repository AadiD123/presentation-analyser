import contextlib
import io
import os
import re
import librosa
import soundfile as sf

# TODO change to work on deployed server
ROOT_PATH = "/Users/arnav/git/presentation-analyser/model" 

mysp = __import__("my-voice-analysis")
AUDIO_FILE_DIR = rf"{ROOT_PATH}/audio_files" # Path to where your audio file are
TEMP_PATH = rf"{ROOT_PATH}/temp" # IMPORTANT! drop the "myspsolution.praat" in this folder and this folder path and name does not have spaces.
TEMP_FILE_NAME = "temp.wav" # file name of the temp file for conversion.


# main function that returns speech analysis result, pass in audio file name
def analyze_audio_file(audio_file):
    convert_audio_file(audio_file, AUDIO_FILE_DIR)
    with io.StringIO() as buf, contextlib.redirect_stdout(buf):
        mysp.mysptotal(TEMP_FILE_NAME[:-4], TEMP_PATH)
        captured_output = buf.getvalue()

        numbers = [float(num) for num in re.findall(r"\d+\.\d+|\d+", captured_output) if num != "0"]
        # remove temp file
        os.remove(rf"{TEMP_PATH}/{TEMP_FILE_NAME}")
        os.remove(rf"{TEMP_PATH}/temp.TextGrid")

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


# helper function to make audio work
def convert_audio_file(input_file, path):
    y, s = librosa.load(f"{path}/{input_file}", sr=44100)

    if len(y) % 2 == 1:
        y = y[:-1]

    y = y * 32767 / max(abs(y))
    y = y.astype('int16')

    sf.write(f"{TEMP_PATH}/{TEMP_FILE_NAME}", y, s, "PCM_24")

if __name__ == "__main__":
    print(analyze_audio_file("record.wav")) # Name of the audio file in the folder of the path variable.