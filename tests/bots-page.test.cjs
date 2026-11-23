const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('bots.css', 'utf8');
const js = fs.readFileSync('bots.js', 'utf8');

test('home page links only to the three author bots', () => {
  const links = [...html.matchAll(/<a class="bot-card[^"]*" href="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  assert.deepEqual(links, [
    'https://chatgpt.com/plugins/plugin_fb8d5bda9a948191a1d20360a2763266',
    'https://chatgpt.com/plugins/plugin_41418c5317408191a2a00288743aac21',
    'https://chatgpt.com/plugins/plugin_99a0e8de787c81919e79985c790b37db'
  ]);
  assert.equal((html.match(/class="bot-card/g) || []).length, 3);
  assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g) || []).length, 3);
});

test('no workshop editor or obsolete scripts load on the home page', () => {
  for (const old of ['editorForm', 'previewCanvas', 'ktpWorkspace', 'ktpSearch', 'generateBtn', 'app.js', 'ktp.js', 'workshop-only.css']) {
    assert.ok(!html.includes(old), old);
  }
  assert.match(html, /href="bots\.css\?v=/);
  assert.match(html, /src="bots\.js\?v=/);
});

test('both languages and a narrow layout are available', () => {
  assert.match(html, /data-lang="kk"/);
  assert.match(html, /data-lang="ru"/);
  assert.ok((html.match(/data-kk=/g) || []).length >= 13);
  assert.ok((html.match(/data-ru=/g) || []).length >= 13);
  assert.match(css, /@media\(max-width:720px\)/);
  assert.match(js, /document\.documentElement\.lang = lang/);
});
