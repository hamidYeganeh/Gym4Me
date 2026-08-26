import { execFileSync } from 'node:child_process';
import path from 'node:path';

describe('html sanitize utilities (real runtime dependency)', () => {
  it('strips executable markup, inline CSS, event handlers, and unsafe schemes', () => {
    const utilPath = path.join(__dirname, 'html-sanitize.util.ts');
    const script = `
      const { sanitizeArticleHtml, escapeHtml } = require(${JSON.stringify(utilPath)});
      const results = [
        sanitizeArticleHtml('<script>alert(1)</script><span style="background:url(javascript:alert(1))">متن</span><img src="https://cdn.example.test/image.jpg" onerror="alert(1)">'),
        sanitizeArticleHtml('<h2>عنوان</h2><p><strong>متن</strong> <a href="https://gym4me.ir" target="_blank">لینک</a></p>'),
        sanitizeArticleHtml('<img src="data:text/html;base64,PHNjcmlwdD4=" alt="x" />'),
        escapeHtml('<>&"\\''),
      ];
      process.stdout.write(JSON.stringify(results));
    `;

    const output = execFileSync(
      process.execPath,
      ['-r', require.resolve('ts-node/register'), '-e', script],
      { encoding: 'utf8' },
    );

    expect(JSON.parse(output)).toEqual([
      '<span>متن</span><img src="https://cdn.example.test/image.jpg" />',
      '<h2>عنوان</h2><p><strong>متن</strong> <a href="https://gym4me.ir" target="_blank" rel="noopener noreferrer">لینک</a></p>',
      '<img alt="x" />',
      '&lt;&gt;&amp;&quot;&#39;',
    ]);
  });
});
