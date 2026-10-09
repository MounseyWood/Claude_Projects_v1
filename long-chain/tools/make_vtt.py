# Build WebVTT subtitles from the narration script and the placed audio sections.
# Each sentence is timed in proportion to its length across the section's speech, snapped to its pauses.
#   python3 long-chain/tools/make_vtt.py <sections.txt> <narration.txt> <audio-dir> <out.vtt>
import re, subprocess, sys
sec_file, place_file, adir, out = sys.argv[1:5]
text = dict(l.rstrip('\n').split('|', 1) for l in open(sec_file) if '|' in l)
place = [l.split() for l in open(place_file) if l.strip()]
def pauses(wav):
    r = subprocess.run(['ffmpeg', '-i', wav, '-af', 'silencedetect=noise=-40dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r)]
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout)
    return list(zip(st, en)), dur
def ts(t): h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60; return '%02d:%02d:%06.3f' % (h, m, s)
cues = []
for sid, at in place:
    at = float(at); ps, dur = pauses('%s/%s.wav' % (adir, sid))
    a = ps[0][1] if ps and ps[0][0] < .05 else 0; b = ps[-1][0] if ps and ps[-1][1] > dur - .05 else dur
    mids = [(s + e) / 2 for s, e in ps if s > a and e < b]
    sents = re.findall(r'[^.?!]+[.?!]', text[sid]); total = sum(len(x) for x in sents); t = a
    for k, s in enumerate(sents):
        end = b if k == len(sents) - 1 else t + (b - a) * len(s) / total
        if k < len(sents) - 1 and mids: end = min(mids, key=lambda m: abs(m - end)) if min(abs(m - end) for m in mids) < .8 else end
        cues.append((at + t, at + end, s.strip())); t = end
with open(out, 'w') as f:
    f.write('WEBVTT\n\n')
    for i, (s, e, x) in enumerate(cues, 1): f.write('%d\n%s --> %s\n%s\n\n' % (i, ts(s), ts(max(e, s + .8)), x))
print(len(cues), 'cues')
