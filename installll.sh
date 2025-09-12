# Add cloudflare gpg key
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# Add this repo to your apt repositories
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

# install cloudflared
sudo apt-get update && sudo apt-get install cloudflared
# kyg
sudo cloudflared service install eyJhIjoiOTc0NDA1YmQzZGIyY2Q0NmU0ZDQ4MzZhN2JmN2Q2NDkiLCJ0IjoiZTFkZDEzODgtOTAxZS00ODhjLTgzZjQtYzU5YTZiN2YzZDlmIiwicyI6Ik1qRTJZemxrWmpZdE9EZzBaaTAwWTJSa0xUZ3paV0l0WTJRNVlqUmtNalpqTURnMSJ9
