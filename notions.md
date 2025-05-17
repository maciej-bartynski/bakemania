
# certbot
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for staging.bakemania.ovh

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/staging.bakemania.ovh/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/staging.bakemania.ovh/privkey.pem
This certificate expires on 2025-08-15.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for staging.bakemania.ovh to /etc/nginx/sites-enabled/default
Congratulations! You have successfully enabled HTTPS on https://staging.bakemania.ovh

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Prod nginx
server {
    listen 443 ssl;
    server_name bakemania.ovh;

    ssl_certificate /etc/letsencrypt/live/bakemania.ovh/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bakemania.ovh/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;  # Przekierowanie na port, na którym działa Twoja aplikacja Express
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Opcjonalnie możesz dodać konfigurowanie HTTP2
    listen [::]:443 ssl http2;

    # Dodajemy config dla WebSocketów
    location /ws {
        proxy_pass http://localhost:3000;  # Jeśli masz WebSockety na tym samym porcie
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

}

server {
    listen 80;
    server_name bakemania.ovh;
    return 301 https://$host$request_uri;  # Przekierowanie z HTTP do HTTPS
}

# Staging nginx

server {
    listen 443 ssl;
    server_name staging.bakemania.ovh;

    ssl_certificate /etc/letsencrypt/live/staging.bakemania.ovh/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.bakemania.ovh/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}

server {
    listen 80;
    server_name staging.bakemania.ovh;
    return 301 https://$host$request_uri;
}