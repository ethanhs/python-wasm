#!/usr/bin/env python

from http import server # Python 3
import os

PORT = int(os.getenv("PORT", 8000))

class MyHTTPRequestHandler(server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_my_headers()

        super().end_headers()

    def send_my_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")


server.test(HandlerClass=MyHTTPRequestHandler, protocol="HTTP/1.1", port=PORT)