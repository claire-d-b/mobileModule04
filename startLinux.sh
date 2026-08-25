#!/bin/bash
# ********* .env *********
ENV_FILE="$(dirname "${BASH_SOURCE[0]:-$0}")/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
else
  echo "⚠️  .env introuvable à $ENV_FILE"
fi
# ********* docker via flatpak host (VS Code sandbox fix) *********
if [ -n "$FLATPAK_ID" ] && command -v flatpak-spawn > /dev/null 2>&1; then
  docker() {
    flatpak-spawn --host docker "$@"
  }
fi
# ********* adb *********
if [ ! -f "$HOME/platform-tools/adb" ]; then
  curl -L "https://dl.google.com/android/repository/platform-tools-latest-linux.zip" -o "$HOME/platform-tools.zip"
  unzip "$HOME/platform-tools.zip" -d "$HOME"
  rm "$HOME/platform-tools.zip"
fi
export PATH="$HOME/platform-tools:$PATH"
adb version
# ********* nvm *********
export NVM_DIR="$HOME/.var/app/com.visualstudio.code/config/nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
fi
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
# ********* node *********
if ! command -v node > /dev/null 2>&1; then
  nvm install --lts
fi
NODE_BIN="$(dirname "$(command -v node)")"
export PATH="$NODE_BIN:$PATH"
node -v
npm -v
# ********* java *********
export JAVA_HOME="$(ls -d "$HOME/sgoinfre/"jdk-25* 2>/dev/null | head -1)"
if [ -z "$JAVA_HOME" ]; then
  wget -P "$HOME/sgoinfre/" https://download.oracle.com/java/25/latest/jdk-25_linux-x64_bin.tar.gz
  tar -xzf "$HOME/sgoinfre/jdk-25_linux-x64_bin.tar.gz" -C "$HOME/sgoinfre/"
  rm "$HOME/sgoinfre/jdk-25_linux-x64_bin.tar.gz"
  export JAVA_HOME="$(ls -d "$HOME/sgoinfre/"jdk-25* | head -1)"
fi
export PATH="$JAVA_HOME/bin:$PATH"
java -version
# ********* android sdk *********
export ANDROID_HOME="$HOME/Android/sdk"
if [ ! -d "$ANDROID_HOME" ]; then
  mkdir -p "$ANDROID_HOME"
  curl -L "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o "$HOME/cmdline-tools.zip"
  unzip "$HOME/cmdline-tools.zip" -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  rm "$HOME/cmdline-tools.zip"
  yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses
  "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-34" "build-tools;34.0.0"
fi
if [ ! -f "$ANDROID_HOME/platform-tools/adb" ]; then
  mkdir -p "$ANDROID_HOME/platform-tools"
  ln -sf "$HOME/platform-tools/adb" "$ANDROID_HOME/platform-tools/adb"
fi
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
# ********* npm cache *********
npm config set cache "$HOME/sgoinfre/.npm-cache"
# ********* ngrok *********
if [ ! -f "$HOME/sgoinfre/ngrok/ngrok" ]; then
  mkdir -p "$HOME/sgoinfre/ngrok"
  curl -L "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz" -o "$HOME/sgoinfre/ngrok.tgz"
  tar -xzf "$HOME/sgoinfre/ngrok.tgz" -C "$HOME/sgoinfre/ngrok"
  rm "$HOME/sgoinfre/ngrok.tgz"
fi
export PATH="$HOME/sgoinfre/ngrok:$PATH"
ngrok version
ngrok config add-authtoken "$NGROK_AUTHTOKEN"
# kill any locally running ngrok process before starting a new tunnel
if pgrep -x ngrok > /dev/null; then
  echo "Existing local ngrok process found, killing it..."
  pkill -x ngrok
  sleep 1
fi
ngrok http 3000 --log=stdout > "$HOME/sgoinfre/ngrok.log" &
sleep 2
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)
echo "Backend exposed at: $NGROK_URL"
# ********* update EXPO_PUBLIC_BACKEND_URL without duplicating *********
MOBILE_ENV="$HOME/sgoinfre/mobileModule04/.env"
if [ -f "$MOBILE_ENV" ] && grep -q "^EXPO_PUBLIC_BACKEND_URL=" "$MOBILE_ENV"; then
  sed -i "s|^EXPO_PUBLIC_BACKEND_URL=.*|EXPO_PUBLIC_BACKEND_URL=$NGROK_URL|" "$MOBILE_ENV"
else
  echo "EXPO_PUBLIC_BACKEND_URL=$NGROK_URL" >> "$MOBILE_ENV"
fi
# ********* postgres *********
docker rm -f diary-postgres 2>/dev/null
docker volume create diary-pgdata
docker run -d \
  --name diary-postgres \
  -e POSTGRES_USER=claire \
  -e POSTGRES_PASSWORD=claire \
  -e POSTGRES_DB=diary_app \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -p 5432:5432 \
  -v diary-pgdata:/var/lib/postgresql/data \
  docker.io/library/postgres:16
sleep 3
docker ps -a
docker logs diary-postgres --tail 50
cd "$HOME/sgoinfre/mobileModule04"