import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    out[m[1]] = v
  }
  return out
}

const env = loadEnv(resolve(root, '.env'))
const base = 'https://dalbit-sajugwan.vercel.app'
const jar = { cookie: '' }

function takeSetCookie(res) {
  const raw =
    typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []
  const list = raw.length ? raw : [res.headers.get('set-cookie')].filter(Boolean)
  for (const c of list) {
    const part = String(c).split(';')[0]
    if (part.startsWith('dalbit_admin_session=')) jar.cookie = part
  }
}

const results = []
function add(name, pass, extra = {}) {
  results.push({ name, pass, ...extra })
}

{
  const r = await fetch(`${base}/`, { cache: 'no-store' })
  const html = await r.text()
  const hasBrand = /달빛|천기|사주/.test(html)
  const hasRoot = /id=["']root["']/.test(html)
  add('public_home', r.status === 200 && hasBrand && hasRoot, {
    status: r.status,
    hasBrand,
    hasRoot,
    bytes: html.length,
  })
}

{
  const r = await fetch(`${base}/api/admin/report`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ product: 'full' }),
  })
  add('report_unauth_401', r.status === 401, { status: r.status })
}

{
  const r = await fetch(`${base}/api/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'definitely-wrong-password-xyz' }),
  })
  add('login_wrong_401', r.status === 401, { status: r.status })
}

{
  if (!env.ADMIN_PASSWORD) {
    add('login_ok', false, { reason: 'local_env_missing' })
  } else {
    const r = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
    })
    takeSetCookie(r)
    const body = await r.json().catch(() => ({}))
    add('login_ok', r.status === 200 && !!jar.cookie && body.ok === true, {
      status: r.status,
      cookie: !!jar.cookie,
      authenticated: !!body.authenticated,
    })
  }
}

{
  const r = await fetch(`${base}/api/admin/session`, {
    headers: jar.cookie ? { cookie: jar.cookie } : {},
  })
  const body = await r.json().catch(() => ({}))
  add('session_auth', r.status === 200 && body.authenticated === true, {
    status: r.status,
    authenticated: body.authenticated,
  })
}

{
  const payload = {
    product: 'full',
    name: '검증고객',
    gender: '여',
    calendar: '양력',
    birthYear: 1990,
    birthMonth: 5,
    birthDay: 15,
    birthHour: 14,
    birthMinute: 30,
    timeUnknown: false,
  }
  const r = await fetch(`${base}/api/admin/report`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(jar.cookie ? { cookie: jar.cookie } : {}),
    },
    body: JSON.stringify(payload),
  })
  const html = await r.text()
  const pagesMatch =
    html.match(/data-total-pages="(\d+)"/) ||
    html.match(/총\s*(\d+)\s*페이지/) ||
    html.match(/(\d+)\s*페이지/)
  const pages = pagesMatch ? Number(pagesMatch[1]) : null
  const hasPrint = /@media\s+print|window\.print|인쇄/.test(html)
  const hasCheongi = /천기노트|달빛사주관|사주/.test(html)
  add(
    'full_report',
    r.status === 200 && html.length > 50000 && pages >= 100 && hasPrint,
    {
      status: r.status,
      bytes: html.length,
      pages,
      hasPrint,
      hasCheongi,
    },
  )
}

console.log(
  JSON.stringify(
    { base, failed: results.filter((x) => !x.pass).length, results },
    null,
    2,
  ),
)
process.exit(results.some((x) => !x.pass) ? 1 : 0)
