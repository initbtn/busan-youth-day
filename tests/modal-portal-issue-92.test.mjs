import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../", import.meta.url).pathname;
const read = (p) => fs.readFileSync(path.join(root, p), "utf-8");

function listSourceFiles(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) return listSourceFiles(rel);
    return /\.(ts|tsx)$/.test(e.name) ? [rel] : [];
  });
}

describe("Issue #92: 참조 카운트 스크롤 잠금 (createScrollLock)", async () => {
  const { createScrollLock } = await import("../src/lib/scrollLock.ts");
  const makeTarget = (overflow = "") => ({ style: { overflow } });

  test("정상값: 잠그면 hidden, 풀면 원래 값으로 돌아온다", () => {
    const target = makeTarget("");
    const lock = createScrollLock(() => target);
    const unlock = lock.lock();
    assert.equal(target.style.overflow, "hidden");
    unlock();
    assert.equal(target.style.overflow, "");
  });

  test("이전 값 복원: 원래 overflow 가 scroll 이었으면 scroll 로 복원된다 (빈 문자열로 덮지 않는다)", () => {
    const target = makeTarget("scroll");
    const lock = createScrollLock(() => target);
    const unlock = lock.lock();
    assert.equal(target.style.overflow, "hidden");
    unlock();
    assert.equal(target.style.overflow, "scroll");
  });

  test("중첩: 안쪽을 닫아도 바깥이 열려 있는 동안은 잠금이 유지된다", () => {
    const target = makeTarget("");
    const lock = createScrollLock(() => target);
    const outer = lock.lock();
    const inner = lock.lock();
    inner();
    assert.equal(target.style.overflow, "hidden");
    outer();
    assert.equal(target.style.overflow, "");
  });

  test("일부만 맞는 값: 닫는 순서가 어긋나도(바깥 먼저) 마지막이 닫힐 때까지 유지된다", () => {
    const target = makeTarget("");
    const lock = createScrollLock(() => target);
    const a = lock.lock();
    const b = lock.lock();
    a();
    assert.equal(target.style.overflow, "hidden");
    b();
    assert.equal(target.style.overflow, "");
  });

  test("헷갈리는 값: 같은 해제 함수를 두 번 불러도 카운트가 깎이지 않아 다른 모달의 잠금이 풀리지 않는다", () => {
    const target = makeTarget("");
    const lock = createScrollLock(() => target);
    const a = lock.lock();
    const b = lock.lock();
    a();
    a();
    assert.equal(target.style.overflow, "hidden");
    b();
    assert.equal(target.style.overflow, "");
  });

  test("대상이 없으면(서버 렌더) 아무 일도 하지 않는다", () => {
    const lock = createScrollLock(() => null);
    const unlock = lock.lock();
    assert.equal(typeof unlock, "function");
    unlock();
  });
});

describe("Issue #92: 모달 오버레이는 전부 ModalPortal 안에 있다", () => {
  const files = listSourceFiles("src").filter((f) => !f.endsWith("ModalPortal.tsx"));

  test("`fixed inset-0` 오버레이가 <ModalPortal> 밖에 남지 않는다", () => {
    const offenders = [];
    for (const f of files) {
      const src = read(f);
      const tokens = [];
      for (const m of src.matchAll(/<ModalPortal>|<\/ModalPortal>|fixed inset-0/g)) {
        tokens.push([m.index, m[0]]);
      }
      let depth = 0;
      for (const [, tok] of tokens) {
        if (tok === "<ModalPortal>") depth += 1;
        else if (tok === "</ModalPortal>") depth -= 1;
        else if (depth <= 0) offenders.push(f);
      }
    }
    assert.deepEqual([...new Set(offenders)], []);
  });

  test("오버레이가 있는 파일은 ModalPortal 을 가져와 쓴다 (15곳)", () => {
    let overlays = 0;
    let wrapped = 0;
    for (const f of files) {
      const src = read(f);
      const n = (src.match(/fixed inset-0/g) || []).length;
      overlays += n;
      if (n > 0) {
        assert.ok(src.includes('from "@/components/ModalPortal"'), `${f} 이 ModalPortal 을 가져오지 않음`);
        wrapped += (src.match(/<ModalPortal>/g) || []).length;
      }
    }
    assert.equal(overlays, 15);
    assert.ok(wrapped >= 1);
  });

  test("스크롤 잠금은 공통 훅 한 곳에만 있고 컴포넌트가 body.style.overflow 를 직접 만지지 않는다", () => {
    const offenders = files.filter(
      (f) => !f.endsWith("scrollLock.ts") && /document\.body\.style\.overflow/.test(read(f))
    );
    assert.deepEqual(offenders, []);
  });
});

describe("Issue #92: ModalPortal 구현", () => {
  test("마운트 이후에만 document.body 로 포털 렌더한다 (SSR 가드)", () => {
    const src = read("src/components/ModalPortal.tsx");
    assert.ok(src.includes('"use client"'));
    assert.ok(src.includes("createPortal("));
    assert.ok(src.includes("document.body"));
    assert.match(src, /useState\(false\)/);
    assert.match(src, /useEffect\(\(\) => (\{\s*)?setMounted\(true\)/);
  });
});
