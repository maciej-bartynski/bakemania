# How to run dev environment
1. <root>
2. Run `npm run dev` to check local IP
3. Terminate process
4. Copy local IP from console, without port (ex. 192.168.183.252)
5. Run `mkcert -key-file key.pem -cert-file cert.pem localhost {your IP}` - this will create common cert for BE and FE
6. `npm run dev`
7. `cd bakemania-spa`
8. `npm run dev`
9. Project is available for local network