import http.server
import socketserver
import urllib.request
import urllib.parse
import sys

PORT = 8081

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Handle Proxy Requests
        if self.path.startswith('/api/proxy'):
            # Parse the target URL
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            target_url = params.get('url', [None])[0]
            
            if target_url:
                print(f"Proxying: {target_url}")
                try:
                    # Create request with headers to mimic a browser/app
                    req = urllib.request.Request(target_url)
                    req.add_header('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.2(0x18000236) NetType/WIFI Language/zh_CN')
                    
                    with urllib.request.urlopen(req) as response:
                        content = response.read()
                        
                    # Send response with CORS headers
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json; charset=utf-8')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(content)
                except Exception as e:
                    print(f"Error: {e}")
                    self.send_error(500, str(e))
            else:
                self.send_error(400, "Missing 'url' parameter")
        else:
            # Serve static files
            super().do_GET()

# Set up the server
Handler = ProxyHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving HTTP on 0.0.0.0 port {PORT} (with /api/proxy support) ...")
    httpd.serve_forever()
