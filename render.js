// node render.js <job_dir> [fps] [stills t1,t2,...]
// Renders reel.html with <job_dir>/data.js into <job_dir>/frames (or <job_dir>/stills).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [job, fps = '30', stills] = process.argv.slice(2);
  const data = JSON.parse(fs.readFileSync(path.join(job, 'cues.json'), 'utf8'));
  const out = path.join(job, stills ? 'stills' : 'frames');
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.goto('file://' + path.resolve(__dirname, process.env.REEL_HTML || 'reel.html') + '?data=' + encodeURIComponent(path.resolve(job, 'data.js')));
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(400);
  const times = stills ? stills.split(',').map(Number) : [...Array(Math.ceil(+fps * data.total)).keys()].map(i => i / +fps);
  for (let i = 0; i < times.length; i++) {
    await pg.evaluate(t => render(t), times[i]);
    await pg.screenshot({ path: `${out}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  await b.close();
})();
