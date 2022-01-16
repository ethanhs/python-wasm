#!/usr/bin/env python

import socketserver
from http import server # Python 3

PORT = 8000

class MyHTTPRequestHandler(server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_my_headers()

        server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")


with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print("Serving on port", PORT)
    httpd.serve_forever()