import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const MARKER = 'AI-PANEL-FA-INLINE-GUIDE';

function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.wrangler' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

function cleanText(text, max = 95) {
  const one = text.replace(/\s+/g, ' ').replaceAll('*/', '* /').trim();
  return one.length > max ? `${one.slice(0, max - 1)}…` : one;
}

function variableNames(node, source) {
  return node.declarationList.declarations.map((d) => cleanText(d.name.getText(source), 45)).join('، ');
}

function describeTsNode(node, source) {
  if (ts.isImportDeclaration(node)) {
    const mod = node.moduleSpecifier.getText(source).replaceAll("'", '').replaceAll('"', '');
    const clause = node.importClause ? cleanText(node.importClause.getText(source), 70) : 'فایل/ماژول';
    return `این دستور ${clause} را از ماژول «${mod}» وارد می‌کند تا در این فایل قابل استفاده باشد.`;
  }
  if (ts.isExportDeclaration(node)) return 'این دستور بخشی از کد را Export می‌کند تا فایل‌ها یا پکیج‌های دیگر بتوانند از آن استفاده کنند.';
  if (ts.isTypeAliasDeclaration(node)) return `این Type با نام «${node.name.text}» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.`;
  if (ts.isInterfaceDeclaration(node)) return `این Interface با نام «${node.name.text}» قرارداد ساختار یک شیء را برای بررسی نوع داده‌ها در TypeScript تعریف می‌کند.`;
  if (ts.isEnumDeclaration(node)) return `این Enum با نام «${node.name.text}» مجموعه‌ای محدود از مقدارهای مجاز را تعریف می‌کند.`;
  if (ts.isClassDeclaration(node)) return `این Class با نام «${node.name?.text ?? 'بدون‌نام'}» رفتار و داده‌های مرتبط را در یک ساختار قابل نمونه‌سازی گروه‌بندی می‌کند.`;
  if (ts.isFunctionDeclaration(node)) return `این تابع «${node.name?.text ?? 'بدون‌نام'}» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.`;
  if (ts.isVariableStatement(node)) {
    const names = variableNames(node, source);
    const text = node.getText(source);
    if (/useState\s*\(/.test(text)) return `این دستور State محلی React برای «${names}» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.`;
    if (/useMemo\s*\(/.test(text)) return `این دستور مقدار «${names}» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.`;
    if (/useCallback\s*\(/.test(text)) return `این دستور تابع «${names}» را با useCallback نگه می‌دارد تا مرجع تابع بین Renderها بی‌دلیل عوض نشود.`;
    if (/useRef\s*\(/.test(text)) return `این دستور Ref با نام «${names}» می‌سازد تا مقداری بدون ایجاد Render مجدد یا یک عنصر DOM نگهداری شود.`;
    if (/fetch\s*\(/.test(text)) return `این متغیر «${names}» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.`;
    return `این دستور متغیر/ثابت «${names}» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.`;
  }
  if (ts.isIfStatement(node)) return `این شرط بررسی می‌کند آیا «${cleanText(node.expression.getText(source), 80)}» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.`;
  if (ts.isSwitchStatement(node)) return `این Switch مقدار «${cleanText(node.expression.getText(source), 80)}» را با چند حالت مقایسه می‌کند و شاخه مناسب را اجرا می‌کند.`;
  if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)) return 'این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.';
  if (ts.isWhileStatement(node) || ts.isDoStatement(node)) return 'این حلقه تا زمانی که شرط تعیین‌شده برقرار باشد، دستورات داخل بدنه را تکرار می‌کند.';
  if (ts.isTryStatement(node)) return 'این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.';
  if (ts.isThrowStatement(node)) return 'این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود.';
  if (ts.isReturnStatement(node)) {
    const expr = node.expression ? cleanText(node.expression.getText(source), 75) : 'بدون مقدار';
    return `این Return اجرای تابع را در این نقطه تمام می‌کند و «${expr}» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.`;
  }
  if (ts.isExpressionStatement(node)) {
    const text = cleanText(node.expression.getText(source), 90);
    if (/^useEffect\s*\(/.test(text)) return 'این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.';
    if (/^set[A-Z_a-z0-9]*\s*\(/.test(text)) return `این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «${text}».`;
    if (/^(await\s+)?fetch\s*\(/.test(text)) return `این دستور یک درخواست HTTP به API یا سرویس بیرونی ارسال می‌کند: «${text}».`;
    if (/addEventListener\s*\(/.test(text)) return 'این دستور یک Event Listener ثبت می‌کند تا برنامه هنگام وقوع رویداد موردنظر واکنش نشان دهد.';
    if (/removeEventListener\s*\(/.test(text)) return 'این دستور Event Listener قبلی را حذف می‌کند تا Listener اضافی یا Memory Leak ایجاد نشود.';
    if (/history\.(pushState|replaceState)/.test(text)) return 'این دستور آدرس مرورگر را بدون Refresh کامل صفحه تغییر می‌دهد و برای مسیریابی سمت کاربر استفاده می‌شود.';
    return `این دستور یک عملیات اجرایی انجام می‌دهد: «${text}».`;
  }
  if (ts.isBreakStatement(node)) return 'این دستور اجرای حلقه یا Switch جاری را متوقف می‌کند و از آن خارج می‌شود.';
  if (ts.isContinueStatement(node)) return 'این دستور ادامه دستورات مرحله فعلی حلقه را رد می‌کند و به تکرار بعدی می‌رود.';
  if (ts.isEmptyStatement(node)) return '';
  return `این دستور از نوع ${ts.SyntaxKind[node.kind]} بخشی از کنترل جریان یا تعریف منطق این فایل است.`;
}

function shouldAnnotateTs(node) {
  if (ts.isBlock(node) || ts.isEmptyStatement(node)) return false;
  return ts.isStatement(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node) || ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node);
}

function annotateTs(file) {
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes(MARKER)) return false;
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.jsx') ? ts.ScriptKind.JSX : file.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, original, ts.ScriptTarget.Latest, true, kind);
  const originalDiagnostics = source.parseDiagnostics.length;
  const inserts = [];
  const used = new Set();

  function visit(node) {
    if (shouldAnnotateTs(node)) {
      const pos = node.getStart(source, false);
      const lineStart = original.lastIndexOf('\n', Math.max(0, pos - 1)) + 1;
      const prefix = original.slice(lineStart, pos);
      const desc = describeTsNode(node, source);
      if (desc) {
        let insertPos;
        let text;
        if (/^\s*$/.test(prefix)) {
          insertPos = lineStart;
          const indent = prefix;
          text = `${indent}// راهنما: ${desc}\n`;
        } else {
          insertPos = pos;
          text = `/* راهنما: ${desc} */ `;
        }
        const key = `${insertPos}:${text}`;
        if (!used.has(key)) {
          used.add(key);
          inserts.push({ pos: insertPos, text });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);

  inserts.sort((a, b) => b.pos - a.pos);
  let annotated = original;
  for (const item of inserts) annotated = annotated.slice(0, item.pos) + item.text + annotated.slice(item.pos);
  annotated = `/**\n * ${MARKER}\n * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.\n * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.\n * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.\n */\n${annotated}`;

  const check = ts.createSourceFile(file, annotated, ts.ScriptTarget.Latest, true, kind);
  if (check.parseDiagnostics.length > originalDiagnostics) {
    console.warn(`[skip] ${rel(file)}: annotation introduced parser diagnostics`);
    return false;
  }
  fs.writeFileSync(file, annotated);
  console.log(`[annotated TS] ${rel(file)}`);
  return true;
}

function describePrismaLine(line) {
  const t = line.trim();
  if (t.startsWith('generator ')) return 'این بلوک تنظیم می‌کند Prisma چه Client یا خروجی‌ای تولید کند.';
  if (t.startsWith('datasource ')) return 'این بلوک منبع دیتابیس و Provider مورد استفاده Prisma را تعریف می‌کند.';
  if (t.startsWith('provider')) return 'این گزینه نوع Provider را مشخص می‌کند؛ برای مثال PostgreSQL یا Prisma Client.';
  if (/^(url|directUrl)\s*=/.test(t)) return 'این گزینه آدرس اتصال دیتابیس را از متغیر محیطی یا مقدار تنظیم‌شده دریافت می‌کند.';
  if (t.startsWith('enum ')) return 'این Enum فهرست مقدارهای مجاز برای یک وضعیت/نوع را تعریف می‌کند.';
  if (t.startsWith('model ')) return 'این Model یک موجودیت اصلی دیتابیس و مجموعه فیلدهای آن را تعریف می‌کند.';
  if (t.startsWith('@@')) return 'این دستور سطح Model یک Index، Unique constraint یا نگاشت دیتابیس را تعریف می‌کند.';
  if (t === '}') return 'این آکولاد پایان بلوک فعلی Model/Enum/Generator/Datasource است.';
  if (/^[A-Za-z_][\w]*\s+/.test(t)) return `این خط فیلد «${t.split(/\s+/)[0]}» را همراه نوع، اختیاری/اجباری بودن، مقدار پیش‌فرض یا Relation آن تعریف می‌کند.`;
  return 'این خط بخشی از تنظیم یا Schema دیتابیس Prisma است.';
}

function annotatePrisma(file) {
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes(MARKER)) return false;
  const out = [`// ${MARKER}`, '// راهنما: این فایل ساختار دیتابیس Prisma را تعریف می‌کند و کامنت هر خط نقش دستور بعدی را توضیح می‌دهد.'];
  for (const line of original.split(/\r?\n/)) {
    if (line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('///')) {
      const indent = line.match(/^\s*/)?.[0] ?? '';
      out.push(`${indent}// راهنما: ${describePrismaLine(line)}`);
    }
    out.push(line);
  }
  fs.writeFileSync(file, out.join('\n'));
  console.log(`[annotated Prisma] ${rel(file)}`);
  return true;
}

function describeConfigLine(line, ext) {
  const t = line.trim();
  if (!t) return '';
  if (t.startsWith('- ')) return 'این آیتم یکی از اعضای لیست تنظیمات این بخش است.';
  const keyMatch = t.match(/^([A-Za-z0-9_.-]+)\s*[:=]/);
  if (keyMatch) return `این گزینه «${keyMatch[1]}» یک مقدار تنظیماتی برای ابزار/سرویس این فایل تعیین می‌کند.`;
  if (t.startsWith('[') && t.endsWith(']') && ext === '.toml') return `این عنوان «${t}» یک بخش جدید از تنظیمات TOML را شروع می‌کند.`;
  return 'این خط بخشی از تنظیمات این فایل است و رفتار ابزار مربوط را مشخص می‌کند.';
}

function annotateHashConfig(file) {
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes(MARKER)) return false;
  const ext = path.extname(file);
  const out = [`# ${MARKER}`, '# راهنما: کامنت‌های فارسی نقش گزینه یا دستور بعدی را توضیح می‌دهند.'];
  for (const line of original.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const indent = line.match(/^\s*/)?.[0] ?? '';
      out.push(`${indent}# راهنما: ${describeConfigLine(line, ext)}`);
    }
    out.push(line);
  }
  fs.writeFileSync(file, out.join('\n'));
  console.log(`[annotated config] ${rel(file)}`);
  return true;
}

function describeCssLine(line) {
  const t = line.trim();
  if (t.endsWith('{')) return `این خط بلوک CSS برای Selector/Rule «${cleanText(t.slice(0, -1), 80)}» را شروع می‌کند.`;
  if (t === '}') return 'این خط بلوک CSS فعلی را می‌بندد.';
  const m = t.match(/^([\w-]+)\s*:/);
  if (m) return `این ویژگی CSS یعنی «${m[1]}» ظاهر یا چیدمان عنصر را تنظیم می‌کند.`;
  return 'این خط بخشی از استایل رابط کاربری است.';
}

function annotateCss(file) {
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes(MARKER)) return false;
  const out = [`/* ${MARKER}: این فایل CSS است و توضیح هر خط/Rule قبل از آن قرار گرفته است. */`];
  let inComment = false;
  for (const line of original.split(/\r?\n/)) {
    const t = line.trim();
    if (t.includes('/*')) inComment = true;
    if (t && !inComment) {
      const indent = line.match(/^\s*/)?.[0] ?? '';
      out.push(`${indent}/* راهنما: ${describeCssLine(line)} */`);
    }
    out.push(line);
    if (t.includes('*/')) inComment = false;
  }
  fs.writeFileSync(file, out.join('\n'));
  console.log(`[annotated CSS] ${rel(file)}`);
  return true;
}

function describeEnvLine(line) {
  const key = line.trim().split('=')[0];
  return `این متغیر محیطی با نام «${key}» تنظیم یا Secret موردنیاز برنامه را از محیط اجرا دریافت می‌کند؛ مقدار واقعی Secret نباید در Git Commit شود.`;
}

function annotateEnvOrIgnore(file) {
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes(MARKER)) return false;
  const isEnv = path.basename(file).startsWith('.env');
  const out = [`# ${MARKER}`, `# راهنما: این فایل ${isEnv ? 'نمونه متغیرهای محیطی' : 'قوانین فایل‌هایی که Git نباید Track کند'} را تعریف می‌کند.`];
  for (const line of original.split(/\r?\n/)) {
    if (line.trim() && !line.trim().startsWith('#')) {
      out.push(`# راهنما: ${isEnv ? describeEnvLine(line) : `این الگو «${line.trim()}» به Git می‌گوید فایل/پوشه مطابق آن را دنبال نکند.`}`);
    }
    out.push(line);
  }
  fs.writeFileSync(file, out.join('\n'));
  console.log(`[annotated text config] ${rel(file)}`);
  return true;
}

function explainJsonValue(key, value) {
  if (key === 'scripts') return 'دستورهای قابل اجرای npm/pnpm را تعریف می‌کند.';
  if (key === 'dependencies') return 'کتابخانه‌هایی را فهرست می‌کند که برنامه در Runtime به آن‌ها نیاز دارد.';
  if (key === 'devDependencies') return 'ابزارهایی را فهرست می‌کند که بیشتر برای توسعه، Build، Typecheck یا تست استفاده می‌شوند.';
  if (key === 'name') return 'نام پکیج یا Workspace را مشخص می‌کند.';
  if (key === 'version') return 'نسخه پکیج را مشخص می‌کند.';
  if (key === 'private') return 'مشخص می‌کند پکیج نباید ناخواسته در Registry عمومی منتشر شود.';
  if (key === 'type') return 'نوع سیستم ماژول Node، مانند ESM، را تعیین می‌کند.';
  if (key === 'compilerOptions') return 'تنظیمات اصلی کامپایلر TypeScript را نگه می‌دارد.';
  return `کلید «${key}» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع ${Array.isArray(value) ? 'آرایه' : value === null ? 'null' : typeof value} است.`;
}

function jsonGuide(file) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return false; }
  const guide = `${file}.README_FA.md`;
  const lines = [
    `# راهنمای فارسی \`${path.basename(file)}\``,
    '',
    `فایل اصلی: \`${rel(file)}\``,
    '',
    '> JSON استاندارد کامنت را پشتیبانی نمی‌کند؛ بنابراین اگر داخل فایل اصلی `//` یا `#` بگذاریم ابزارهایی مثل npm یا TypeScript آن را نامعتبر می‌دانند. توضیح خط/کلیدها در این فایل کنار آن نگهداری می‌شود.',
    ''
  ];
  for (const [key, value] of Object.entries(data)) {
    lines.push(`## \`${key}\``);
    lines.push(explainJsonValue(key, value));
    if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        lines.push(`- \`${childKey}\`: ${explainJsonValue(childKey, childValue)}`);
      }
    } else {
      lines.push(`- مقدار فعلی: \`${String(value)}\``);
    }
    lines.push('');
  }
  fs.writeFileSync(guide, lines.join('\n'));
  console.log(`[JSON guide] ${rel(guide)}`);
  return true;
}

function sqlGuide(file) {
  const original = fs.readFileSync(file, 'utf8');
  const guide = `${file}.README_FA.md`;
  const lines = [
    `# راهنمای خط‌به‌خط \`${path.basename(file)}\``, '',
    '> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.', ''
  ];
  original.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    let desc = 'این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.';
    if (/^create\s+table/i.test(t)) desc = 'این دستور یک جدول جدید در PostgreSQL ایجاد می‌کند.';
    else if (/^alter\s+table/i.test(t)) desc = 'این دستور ساختار یا Constraintهای یک جدول موجود را تغییر می‌دهد.';
    else if (/^create\s+(unique\s+)?index/i.test(t)) desc = 'این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.';
    else if (/^insert\s+into/i.test(t)) desc = 'این دستور داده جدید در جدول درج می‌کند.';
    else if (/^update\s+/i.test(t)) desc = 'این دستور داده‌های موجود را به‌روزرسانی می‌کند.';
    else if (/^delete\s+from/i.test(t)) desc = 'این دستور رکوردهای انتخاب‌شده را حذف می‌کند.';
    else if (/^create\s+(or\s+replace\s+)?function/i.test(t)) desc = 'این دستور یک Function سمت PostgreSQL تعریف یا جایگزین می‌کند.';
    else if (/^create\s+policy/i.test(t)) desc = 'این دستور Policy مربوط به Row Level Security را تعریف می‌کند.';
    else if (/^(grant|revoke)\s+/i.test(t)) desc = 'این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.';
    lines.push(`- خط ${i + 1}: \`${t.replaceAll('`', '\\`')}\` — ${desc}`);
  });
  fs.writeFileSync(guide, lines.join('\n'));
  console.log(`[SQL guide] ${rel(guide)}`);
  return true;
}

const tsRoots = [
  'apps/web/src',
  'apps/api/src',
  'apps/cloudflare/src',
  'apps/worker/src',
  'packages/shared/src',
  'supabase/functions'
];

let changed = 0;
for (const root of tsRoots) {
  for (const file of walk(path.join(ROOT, root), (f) => /\.(ts|tsx|js|jsx)$/.test(f))) {
    // main.tsx قبلاً به صورت دستی مستند شده؛ دوباره روی آن کامنت تکراری اضافه نمی‌کنیم.
    if (rel(file) === 'apps/web/src/main.tsx') continue;
    if (annotateTs(file)) changed++;
  }
}

const cssFile = path.join(ROOT, 'apps/web/src/styles.css');
if (fs.existsSync(cssFile) && annotateCss(cssFile)) changed++;

const prismaFile = path.join(ROOT, 'prisma/schema.prisma');
if (fs.existsSync(prismaFile) && annotatePrisma(prismaFile)) changed++;

for (const config of [
  '.github/workflows/cloudflare-preview.yml',
  'docker-compose.yml',
  'pnpm-workspace.yaml',
  'supabase/config.toml'
]) {
  const file = path.join(ROOT, config);
  if (fs.existsSync(file) && annotateHashConfig(file)) changed++;
}

for (const config of ['.env.example', '.gitignore']) {
  const file = path.join(ROOT, config);
  if (fs.existsSync(file) && annotateEnvOrIgnore(file)) changed++;
}

for (const file of walk(ROOT, (f) => path.basename(f).endsWith('.json') && !f.endsWith('package-lock.json'))) {
  if (jsonGuide(file)) changed++;
}

for (const file of walk(path.join(ROOT, 'supabase/migrations'), (f) => f.endsWith('.sql'))) {
  if (sqlGuide(file)) changed++;
}

console.log(`Persian documentation pass completed. Changed/generated ${changed} files.`);
