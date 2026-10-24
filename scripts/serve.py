"""Serve the built app on loopback and open it in the user's browser."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import urllib.error
import urllib.request
import webbrowser

root = Path(__file__).resolve().parents[1] / 'dist'
url = 'http://127.0.0.1:5173/'
if not (root / 'index.html').is_file():
    raise SystemExit('缺少网页构建产物，请在项目目录运行 npm run build。')
try:
    with urllib.request.urlopen(url, timeout=2) as response:
        if b'MIXDESK' in response.read(4096):
            webbrowser.open(url)
            raise SystemExit(0)
except (urllib.error.URLError, TimeoutError):
    pass

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

try:
    server = ThreadingHTTPServer(('127.0.0.1', 5173), partial(Handler, directory=str(root)))
except OSError as error:
    raise SystemExit(f'无法启动本地页面，端口 5173 可能被其他程序占用：{error}')
print(f'MIXDESK 已启动：{url}\n请保留此窗口。按 Ctrl+C 停止。', flush=True)
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
