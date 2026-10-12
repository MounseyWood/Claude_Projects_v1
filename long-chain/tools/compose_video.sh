#!/bin/sh
# Compose rendered phone-column frames into a 16:9 film: KU black surround, chapter title left, captions right.
#   sh long-chain/tools/compose_video.sh <frames-dir> <captions.txt> <out.mp4> [narration.wav]
# captions.txt: "start|end|side|text|dy" per line (side L = chapter title, R = caption; dy = optional vertical offset in px).
# Captions wrap at about 22 characters.
F="$1"; C="$2"; O="$3"; A="$4"
FONT=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
TMP=$(mktemp -d); i=0
FILTER="pad=1920:1080:(ow-iw)/2:0:color=0x1d1d1b"
while IFS='|' read -r s e side text dy; do
  [ -z "$s" ] && continue
  i=$((i+1)); printf '%s' "$text" | fold -s -w 22 | sed 's/ *$//' > "$TMP/c$i.txt"
  dy=${dy:-0}
  if [ "$side" = "L" ]; then X=110; SZ=64; COL=0xffb500; else X=1250; SZ=44; COL=0xffffff; fi
  FILTER="$FILTER,drawtext=fontfile=$FONT:textfile=$TMP/c$i.txt:x=$X:y=(h-text_h)/2+$dy:fontsize=$SZ:fontcolor=$COL:line_spacing=12:expansion=none:enable='between(t,$s,$e)'"
done < "$C"
if [ -n "$A" ]; then
  ffmpeg -y -loglevel error -framerate 30 -i "$F/f%05d.png" -i "$A" -vf "scale=-2:1080,$FILTER" -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -b:a 160k -shortest "$O"
else
  ffmpeg -y -loglevel error -framerate 30 -i "$F/f%05d.png" -vf "scale=-2:1080,$FILTER" -c:v libx264 -pix_fmt yuv420p -crf 20 "$O"
fi
rm -rf "$TMP"
