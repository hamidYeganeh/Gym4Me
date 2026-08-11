#!/usr/bin/env bash
# Run this ONCE inside the already-open VPS SSH session (as root), then tell the agent to continue.
set -euo pipefail

mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Local machine keys (hamid panel key + mahdi ed25519)
grep -qxF 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDLC8X798VGJ3jvcKBm0lBs6N4dQzbglLMsH1l8/jnnmjTZxDlKhHShNRyIVfvi7n6MdxoUhLh3FI5PlJhRAlNy+g2wDW4NR4lGThOvw5c6A3zatcSnTPPnsvBn+/gVDIj6dTy+dwm8SOiNwfCibkxDrQijHtp/kk7qR1iK4yR3JgmiyvrPGUa1RX7YyojFRx9RbaJmqpSlDKfHmuvzUoT68CNMJ0uPIAx6mQt+7d+Y5MuXx+0S01p0jzMlpLheS1t9VAfTZfTHEsk/ei8am/oAAaLMCagjQsFB9fjGNqGPmSn/PBvm/+5FfcQtBw2gaWXDCNlW5C0Owb6VC5DWPMQb' ~/.ssh/authorized_keys 2>/dev/null \
  || echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDLC8X798VGJ3jvcKBm0lBs6N4dQzbglLMsH1l8/jnnmjTZxDlKhHShNRyIVfvi7n6MdxoUhLh3FI5PlJhRAlNy+g2wDW4NR4lGThOvw5c6A3zatcSnTPPnsvBn+/gVDIj6dTy+dwm8SOiNwfCibkxDrQijHtp/kk7qR1iK4yR3JgmiyvrPGUa1RX7YyojFRx9RbaJmqpSlDKfHmuvzUoT68CNMJ0uPIAx6mQt+7d+Y5MuXx+0S01p0jzMlpLheS1t9VAfTZfTHEsk/ei8am/oAAaLMCagjQsFB9fjGNqGPmSn/PBvm/+5FfcQtBw2gaWXDCNlW5C0Owb6VC5DWPMQb' >> ~/.ssh/authorized_keys

grep -qxF 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJBWpBwUHI6NoifiVcU6Z9tqA3iW+zN3O9hz8oEdFUao mahdi@gym4me' ~/.ssh/authorized_keys 2>/dev/null \
  || echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJBWpBwUHI6NoifiVcU6Z9tqA3iW+zN3O9hz8oEdFUao mahdi@gym4me' >> ~/.ssh/authorized_keys

chmod 600 ~/.ssh/authorized_keys

# Replace broken mirror.gcr.io with an IR-reachable registry mirror
cat >/etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://docker.arvancloud.ir"]
}
EOF

systemctl daemon-reload
systemctl restart docker
sleep 2

echo "=== authorized_keys ==="
wc -l ~/.ssh/authorized_keys
echo "=== docker pull test ==="
docker pull redis:7-alpine
echo "BOOTSTRAP_OK"
