import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";

// Isolated upstream: never creates test accounts in the production database.
let rotations = 0;
let revoked = false;
const upstream = createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  res.setHeader("Content-Type", "application/json");
  const reply = (status, data) => {
    res.statusCode = status;
    res.end(JSON.stringify(data));
  };
  if (req.url === "/users/me")
    return reply(req.headers.authorization === "Bearer valid" ? 200 : 401, {
      success: true,
      data: { id: "test", role: "CITIZEN" },
    });
  if (req.url === "/auth/refresh") {
    if (body.refreshToken !== "refresh-valid") return reply(401, {});
    rotations++;
    return reply(200, {
      data: { accessToken: "valid", refreshToken: "rotated" },
    });
  }
  if (req.url === "/auth/logout") {
    revoked = true;
    return reply(200, { success: true });
  }
  if (["/auth/register", "/auth/login"].includes(req.url)) {
    if (body.password === "wrong")
      return reply(401, { message: "Invalid credentials" });
    return reply(200, {
      data: {
        accessToken: "valid",
        refreshToken: "refresh-valid",
        user: { role: "CITIZEN" },
      },
    });
  }
  reply(404, {});
});
await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
const port = 3197;
const origin = `http://localhost:${port}`;
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "-p", String(port)],
  {
    env: {
      ...process.env,
      BACKEND_API_URL: `http://127.0.0.1:${upstream.address().port}`,
    },
    stdio: "ignore",
  },
);
const post = (action, cookie = "", body = {}, source = origin) =>
  fetch(`${origin}/api/auth/${action}`, {
    method: "POST",
    headers: { origin: source, cookie, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(`${origin}/login`);
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  assert.ok(ready, "test server started");
  for (const action of ["register", "login"]) {
    const response = await post(action, "", {
      name: "Test Citizen",
      email: "test@example.com",
      password: "test-password",
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).redirect, "/dashboard");
    assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
    console.log(`PASS ${action}: HTTP-only session, no tokens in JSON`);
  }
  assert.equal((await post("login", "", { password: "wrong" })).status, 401);
  assert.equal(
    (await post("refresh", "", {}, "https://attacker.example")).status,
    403,
  );
  assert.equal((await post("demo", "", { role: "toString" })).status, 400);
  const refreshed = await post(
    "refresh",
    "cc_access=expired; cc_refresh=refresh-valid",
  );
  assert.equal(refreshed.status, 200);
  assert.match(refreshed.headers.get("set-cookie"), /cc_refresh=rotated/);
  assert.equal(rotations, 1);
  assert.equal(
    (await post("refresh", "cc_access=valid; cc_refresh=rotated")).status,
    200,
  );
  assert.equal(rotations, 1, "valid session must not rotate twice");
  const invalid = await post("refresh", "cc_refresh=invalid");
  assert.equal(invalid.status, 401);
  assert.match(invalid.headers.get("set-cookie"), /Expires=Thu, 01 Jan 1970/i);
  const loggedOut = await post(
    "logout",
    "cc_access=expired; cc_refresh=refresh-valid",
  );
  assert.equal(loggedOut.status, 200);
  assert.ok(revoked);
  assert.match(
    loggedOut.headers.get("set-cookie"),
    /Expires=Thu, 01 Jan 1970/i,
  );
  const protectedPage = await fetch(`${origin}/admin`, { redirect: "manual" });
  assert.match(protectedPage.headers.get("location"), /\/login$/);
  console.log(
    "PASS invalid login, CSRF, invalid role, rotation, no redundant rotation, invalid refresh, expired-token logout, protected route",
  );
} finally {
  child.kill();
  await new Promise((resolve) => child.once("exit", resolve));
  upstream.closeAllConnections();
  await new Promise((resolve) => upstream.close(resolve));
}
