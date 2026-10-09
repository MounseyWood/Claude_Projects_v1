#!/bin/sh
# Compose rendered phone-column frames into a 16:9 film: KU black surround, chapter title left, captions right.
#   sh long-chain/tools/compose_video.sh <frames-dir> <captions.txt> <out.mp4> [narration.wav]
# captions.txt: one line per caption, "start end side text" (side L = chapter title, R = caption)
F="$1"; C="$2"; O="$3"; A="$4"
FONT=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
FILTER="pad=1920:1080:(ow-iw)/2:0:color=0x1d1d1b"
while IFS='|' read -r s e side text; do
  [ -z "$s" ] && continue
  if [ "$side" = "L" ]; then X="140"; SZ=64; COL=0xffb500; else X="1260"; SZ=42; COL=0xffffff; fi
  T=$(printf '%s' "$text" | sed "s/:/\\\\:/g; s/'/’/g")
  FILTER="$FILTER,drawtext=fontfile=$FONT:text='$T':x=$X:y=(h-text_h)/2:fontsize=$SZ:fontcolor=$COL:line_spacing=14:enable='between(t,$s,$e)'"
done < "$C"
if [ -n "$A" ]; then
  ffmpeg -y -loglevel error -framerate 30 -i "$F/f%05d.png" -i "$A" -vf "scale=-2:1080,$FILTER" -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -shortest "$O"
else
  ffmpeg -y -loglevel error -framerate 30 -i "$F/f%05d.png" -vf "scale=-2:1080,$FILTER" -c:v libx264 -pix_fmt yuv420p -crf 20 "$O"
fi
