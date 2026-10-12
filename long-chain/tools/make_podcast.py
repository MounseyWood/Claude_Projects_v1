# Voice a podcast episode script with Gemini's two-speaker text-to-speech.
# Reads the **Host:** / **Specialist:** lines between the first two "---" rules of an episode file,
# voices them a few turns at a time, and joins the parts into one loudness-normalised MP3.
#
#   GEMINI_API_KEY=... python3 long-chain/tools/make_podcast.py <episode.md> <out.mp3>
# Optional: HOST_VOICE (default Puck), SPECIALIST_VOICE (default Charon), TTS_MODEL.
import base64, json, os, re, subprocess, sys, tempfile, time, urllib.request, urllib.error, wave

src, out = sys.argv[1], sys.argv[2]
key = os.environ['GEMINI_API_KEY']
model = os.environ.get('TTS_MODEL', 'gemini-2.5-flash-preview-tts')
voices = {'Host': os.environ.get('HOST_VOICE', 'Puck'), 'Specialist': os.environ.get('SPECIALIST_VOICE', 'Charon')}
STYLE = ('Two people in friendly conversation, British English, warm and unhurried. '
         'Host is curious and quick to ask. Specialist is engaging, clear and enthusiastic about materials. '
         'Read only the dialogue below; never read these directions aloud.\n\n')

body = open(src).read().split('\n---\n')[1]
turns = re.findall(r'^\*\*(Host|Specialist):\*\* (.+)$', body, re.M)
chunks = [turns[i:i + 8] for i in range(0, len(turns), 8)]

def voice(chunk):
    text = STYLE + '\n'.join('%s: %s' % t for t in chunk)
    req = {'contents': [{'parts': [{'text': text}]}],
           'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'multiSpeakerVoiceConfig': {'speakerVoiceConfigs': [
               {'speaker': s, 'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': v}}} for s, v in voices.items()]}}}}
    for attempt in range(4):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(
                'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent' % model,
                data=json.dumps(req).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': key}), timeout=300))
            return base64.b64decode(r['candidates'][0]['content']['parts'][0]['inlineData']['data'])
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code == 429 and attempt < 3: time.sleep(30 * (attempt + 1)); continue
            sys.exit('HTTP %d: %s' % (e.code, msg))

tmp = tempfile.mkdtemp(); parts = []
for i, c in enumerate(chunks):
    pcm = voice(c); p = os.path.join(tmp, 'p%02d.wav' % i)
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
    parts.append(p); print('part', i + 1, 'of', len(chunks), round(len(pcm) / 48000, 1), 's')
    time.sleep(3)
lst = os.path.join(tmp, 'list.txt')
gap = os.path.join(tmp, 'gap.wav')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.35', gap], check=True)
open(lst, 'w').write(''.join("file '%s'\nfile '%s'\n" % (p, gap) for p in parts))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', out], check=True)
print(out)
