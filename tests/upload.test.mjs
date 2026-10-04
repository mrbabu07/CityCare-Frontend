import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/upload.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
function harness(statuses, restored = true) {
  let sends = 0;
  let refreshes = 0;
  const exports = {};
  class XHR {
    upload = {};
    open(method, url) {
      assert.equal(method, "POST");
      assert.equal(url, "/api/backend/complaints/test-id/attachments");
    }
    send() {
      sends++;
      const status = statuses.shift();
      queueMicrotask(() => {
        if (status === "timeout") return this.ontimeout();
        this.status = status;
        this.responseText = JSON.stringify({ message: "Rejected" });
        this.onload();
      });
    }
  }
  vm.runInNewContext(compiled, {
    exports,
    require: () => ({
      refreshSession: async () => {
        refreshes++;
        return restored;
      },
    }),
    XMLHttpRequest: XHR,
    FormData: class {
      append() {}
    },
  });
  return {
    upload: () => exports.uploadAttachment("test-id", {}, () => {}),
    counts: () => ({ sends, refreshes }),
  };
}
test("uploads retry exactly once after session refresh", async () => {
  const h = harness([401, 201]);
  await h.upload();
  assert.deepEqual(h.counts(), { sends: 2, refreshes: 1 });
});
test("expired refresh cannot upload again", async () => {
  const h = harness([401], false);
  await assert.rejects(h.upload(), /session expired/);
  assert.equal(h.counts().sends, 1);
});
test("network timeout and validation failure are not retried", async () => {
  for (const status of ["timeout", 400, 500]) {
    const h = harness([status]);
    await assert.rejects(h.upload());
    assert.deepEqual(h.counts(), { sends: 1, refreshes: 0 });
  }
});
test("a second unauthorized response stops retrying", async () => {
  const h = harness([401, 401]);
  await assert.rejects(h.upload());
  assert.deepEqual(h.counts(), { sends: 2, refreshes: 1 });
});
