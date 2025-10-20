FROM mcr.microsoft.com/devcontainers/base:ubuntu
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git curl ca-certificates build-essential python3 python3-pip jq bash-completion unzip zip \
    && rm -rf /var/lib/apt/lists/*
USER vscode
WORKDIR /workspaces

