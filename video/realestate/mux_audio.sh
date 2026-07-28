#!/usr/bin/env bash
# 배경음악(out/bgm.wav)을 영상에 입혀 out/realestate_tax_guide.mp4 갱신.
# 영상 스트림은 재인코딩 없이 복사, 오디오만 AAC 로 추가.
#
#   python3 make_music.py     # 먼저 out/bgm.wav 생성
#   bash mux_audio.sh
set -euo pipefail
cd "$(dirname "$0")"
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
VID=out/realestate_tax_guide.mp4
"$FF" -y -i "$VID" -i out/bgm.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 160k -shortest \
  out/_with_audio.mp4
mv out/_with_audio.mp4 "$VID"
echo "완료: $VID (배경음악 포함)"
