# Android release builder for Gym4Me (Next export → Capacitor sync → APK/AAB)
FROM eclipse-temurin:21-jdk-jammy

ARG NODE_MAJOR=22
ARG ANDROID_CMDTOOLS_VERSION=11076708
ARG ANDROID_PLATFORM=android-35
ARG ANDROID_BUILD_TOOLS=35.0.0

ENV DEBIAN_FRONTEND=noninteractive \
    ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    JAVA_HOME=/opt/java/openjdk \
    PATH=/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:/opt/android-sdk/build-tools/${ANDROID_BUILD_TOOLS}:$PATH

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gnupg \
    unzip \
    wget \
    python3 \
    build-essential \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
  && cd /tmp \
  && wget -q "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_CMDTOOLS_VERSION}_latest.zip" -O cmdtools.zip \
  && unzip -q cmdtools.zip -d ${ANDROID_HOME}/cmdline-tools \
  && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
  && rm cmdtools.zip \
  && yes | sdkmanager --licenses >/dev/null \
  && sdkmanager \
    "platform-tools" \
    "platforms;${ANDROID_PLATFORM}" \
    "build-tools;${ANDROID_BUILD_TOOLS}"

WORKDIR /workspace

COPY package.json package-lock.json turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci

COPY docker/android-release-entrypoint.sh /usr/local/bin/android-release
RUN chmod +x /usr/local/bin/android-release

VOLUME ["/workspace/apps/mobile/artifacts"]
ENTRYPOINT ["android-release"]
CMD ["aab"]
