#!/bin/sh

# ********* .env *********
ENV_FILE="$(dirname "${BASH_SOURCE[0]:-$0}")/.env"
if [ -f "$ENV_FILE" ]; then
set -a
. "$ENV_FILE"
set +a
else
echo "⚠️  .env introuvable à $ENV_FILE"
fi

# ********* adb *********
export ANDROID_HOME="$HOME/Android/sdk"
if [ ! -f "$ANDROID_HOME/platform-tools/adb" ]; then
mkdir -p "$ANDROID_HOME"
curl -L "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip" -o "$HOME/platform-tools.zip"
unzip -o "$HOME/platform-tools.zip" -d "$ANDROID_HOME"
rm "$HOME/platform-tools.zip"
fi
export PATH="$ANDROID_HOME/platform-tools:$PATH"
adb version

# ********* nvm *********
export NVM_DIR="$HOME/.nvm"
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
WORKSPACE_DIR="$HOME/Workspace/piscineMobileVogsphere"
mkdir -p "$WORKSPACE_DIR"
export JAVA_HOME="$(ls -d "$WORKSPACE_DIR"/jdk-25*.jdk/Contents/Home 2>/dev/null | head -1)"
if [ -z "$JAVA_HOME" ]; then
ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then
JDK_ARCH="aarch64"
else
JDK_ARCH="x64"
fi
curl -L -o "$WORKSPACE_DIR/jdk-25_macos.tar.gz" "https://download.oracle.com/java/25/latest/jdk-25_macos-${JDK_ARCH}_bin.tar.gz"
tar -xzf "$WORKSPACE_DIR/jdk-25_macos.tar.gz" -C "$WORKSPACE_DIR"
rm "$WORKSPACE_DIR/jdk-25_macos.tar.gz"
export JAVA_HOME="$(ls -d "$WORKSPACE_DIR"/jdk-25*.jdk/Contents/Home | head -1)"
fi
export PATH="$JAVA_HOME/bin:$PATH"
java -version

# ********* android sdk *********
if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
mkdir -p "$ANDROID_HOME"
curl -L "https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip" -o "$HOME/cmdline-tools.zip"
unzip -o "$HOME/cmdline-tools.zip" -d "$ANDROID_HOME/cmdline-tools"
mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
mv "$ANDROID_HOME/cmdline-tools/cmdline-tools/"* "$ANDROID_HOME/cmdline-tools/latest/"
rmdir "$ANDROID_HOME/cmdline-tools/cmdline-tools"
rm "$HOME/cmdline-tools.zip"
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-34" "build-tools;34.0.0"
fi
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# ********* npm cache *********
npm config set cache "$WORKSPACE_DIR/.npm-cache"

# ********* ngrok *********
NGROK_DIR="$WORKSPACE_DIR/ngrok"
if [ ! -f "$NGROK_DIR/ngrok" ]; then
mkdir -p "$NGROK_DIR"
ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then
NGROK_PKG="ngrok-v3-stable-darwin-arm64.zip"
else
NGROK_PKG="ngrok-v3-stable-darwin-amd64.zip"
fi
curl -L "https://bin.equinox.io/c/bNyj1mQVY4c/${NGROK_PKG}" -o "$WORKSPACE_DIR/ngrok.zip"
unzip -o "$WORKSPACE_DIR/ngrok.zip" -d "$NGROK_DIR"
rm "$WORKSPACE_DIR/ngrok.zip"
fi
export PATH="$NGROK_DIR:$PATH"
ngrok version
ngrok config add-authtoken "$NGROK_AUTHTOKEN"

# kill any locally running ngrok process before starting a new tunnel
if pgrep -x ngrok > /dev/null; then
echo "Existing local ngrok process found, killing it..."
pkill -x ngrok
sleep 1
fi

ngrok http 3000 --log=stdout > "$WORKSPACE_DIR/ngrok.log" &
sleep 2
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)
echo "Backend exposed at: $NGROK_URL"

cd "$WORKSPACE_DIR/mobileModule04"