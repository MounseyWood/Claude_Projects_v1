#!/bin/sh
# Compose rendered frames into a phone-format film (the lab's own 390 x 844 shape, 1080 wide),
# with KU-yellow cards burned in where the film needs words on screen, narration, and soft subtitles.
#   sh long-chain/tools/compose_vertical.sh <frames-dir> <overlays.txt> <out.mp4> <narration.wav> [subtitles.vtt]
# overlays.txt: "start|end|kind|text" per line; kind = title (big card), card (question card) or credit (small line)
F="$1"; C="$2"; O="$3"; A="$4"; V="$5"
FONT=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
TMP=$(mktemp -d); i=0
FILTER="scale=1080:2336"
while IFS='|' read -r s e kind text; do
  [ -z "$s" ] && continue
  i=$((i+1))
  case "$kind" in
    title)  W=14; SZ=110; Y="h*0.70"; BOX="box=1:boxcolor=0xffb500:boxborderw=36"; COL=0x1d1d1b ;;
    card)   W=20; SZ=72;  Y="h*0.60"; BOX="box=1:boxcolor=0xffb500:boxborderw=40"; COL=0x1d1d1b ;;
    credit) W=34; SZ=38;  Y="h-text_h-26"; BOX="box=1:boxcolor=0x1d1d1b:boxborderw=20"; COL=0xffffff ;;
  esac
  printf '%s' "$text" | fold -s -w $W | sed 's/ *$//' > "$TMP/c$i.txt"
  FILTER="$FILTER,drawtext=fontfile=$FONT:textfile=$TMP/c$i.txt:expansion=none:x=(w-text_w)/2:y=$Y:fontsize=$SZ:fontcolor=$COL:line_spacing=16:$BOX:enable='between(t,$s,$e)'"
done < "$C"
if [ -n "$V" ]; then
  ffmpeg -y -loglevel error -framerate 30 -i "$F/f%05d.png" -i "$A" -i "$V" -vf "$FILTER" -map 0:v -map 1:a -map 2:s -c:v libx264 -pix_fmt yuv420p -crf 21 -c:a aac -b:a 160k -c:s mov_text -metadata:s:s:0 language=eng -t "$(( $(ls "$F" | wc -l) / 30 ))" "$O"
else
  ffmpeg -y -loglevel error -framerate 30 -i "$F/f%05d.png" -i "$A" -vf "$FILTER" -c:v libx264 -pix_fmt yuv420p -crf 21 -c:a aac -b:a 160k -shortest "$O"
fi
rm -rf "$TMP"
