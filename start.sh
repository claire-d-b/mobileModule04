#!/bin/sh

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
if [ ! -d "$HOME/sgoinfre/jdk-25.0.3" ]; then
  wget -P "$HOME/sgoinfre" https://download.oracle.com/java/25/latest/jdk-25_linux-x64_bin.tar.gz
  tar -xzf "$HOME/sgoinfre/jdk-25_linux-x64_bin.tar.gz" -C "$HOME/sgoinfre"
  rm "$HOME/sgoinfre/jdk-25_linux-x64_bin.tar.gz"
fi
export JAVA_HOME="$(ls -d "$HOME/sgoinfre"/jdk-25* | head -1)"
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

export IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')

cd "$HOME/sgoinfre/mobileModule02/diary_app/backend/"

cat > .env << EOF
DB_USER=claire
DB_HOST=localhost
DB_NAME=diary_app
DB_PASSWORD=
DB_PORT=5432
GITHUB_CLIENT_ID=Ov23liMl9KamCid3JjRa
GITHUB_CLIENT_SECRET=9e3727a7436310829c86ba8578b195daadebc389
TEST_USER_PASSWORD=Test1234
IP_ADDRESS=$IP
EOF

cd "$HOME/sgoinfre/mobileModule02"