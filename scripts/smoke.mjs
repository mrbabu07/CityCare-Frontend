import assert from "node:assert/strict";

const target = new URL(process.argv[2] || "http://localhost:3008");
assert.ok(
  target.protocol === "https:" ||
    ["localhost", "127.0.0.1"].includes(target.hostname),
  "Use HTTPS for a deployed target",
);
const origin = target.origin;
const request = (path, options = {}) =>
  fetch(`${origin}${path}`, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });

for (const path of [
  "/",
  "/about",
  "/services",
  "/contact",
  "/faq",
  "/login",
  "/register",
  "/payment/result?outcome=success",
]) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} should render`);
  const html = await response.text();
  assert.match(html, /<title>/);
  assert.match(html, /<h1[ >]/);
  if (path.startsWith("/payment")) assert.match(html, /Payment not verified/);
  console.log(`PASS public page ${path}`);
}
assert.equal((await request("/missing-smoke-page")).status, 404);

for (const [role, home] of [
  ["CITIZEN", "/dashboard"],
  ["STAFF", "/staff"],
  ["ADMIN", "/admin"],
]) {
  let cookie = "";
  try {
    const login = await request("/api/auth/demo", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    assert.equal(login.status, 200, `${role} demo login`);
    const data = await login.json();
    assert.equal(data.redirect, home);
    assert.equal(data.accessToken, undefined);
    const cookies = login.headers.getSetCookie();
    assert.ok(
      cookies.length >= 2 && cookies.every((value) => /httponly/i.test(value)),
    );
    if (target.protocol === "https:")
      assert.ok(cookies.every((value) => /; secure/i.test(value)));
    cookie = cookies.map((value) => value.split(";")[0]).join("; ");
    const me = await request("/api/backend/users/me", {
      headers: { Cookie: cookie },
    });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).data.role, role);
    for (const path of [home, `${home}/requests`, `${home}/profile`]) {
      const response = await request(path, { headers: { Cookie: cookie } });
      assert.equal(response.status, 200, `${role} ${path}`);
    }
    const list = await request("/api/backend/complaints?page=1&limit=1", {
      headers: { Cookie: cookie },
    });
    assert.equal(list.status, 200);
    assert.ok(Array.isArray((await list.json()).data.complaints));
    if (role !== "ADMIN") {
      const restricted = await request("/api/backend/admin/dashboard-stats", {
        headers: { Cookie: cookie },
      });
      assert.equal(restricted.status, 403);
      const redirect = await request("/admin", { headers: { Cookie: cookie } });
      const location = redirect.headers.get("location");
      if (location) assert.equal(new URL(location, origin).pathname, home);
      else {
        const html = await redirect.text();
        assert.ok(
          html.includes(`url=${home}`) ||
            html.includes(`NEXT_REDIRECT;replace;${home};`),
          `${role} streamed role redirect`,
        );
      }
    } else {
      const stats = await request("/api/backend/admin/dashboard-stats", {
        headers: { Cookie: cookie },
      });
      assert.equal(stats.status, 200);
      assert.ok(Array.isArray((await stats.json()).data.complaintsByStatus));
    }
    console.log(
      `PASS ${role}: demo login, real API, workspace routes, permissions`,
    );
  } finally {
    if (cookie) {
      const logout = await request("/api/auth/logout", {
        method: "POST",
        headers: { Origin: origin, Cookie: cookie },
      });
      assert.equal(logout.status, 200);
    }
  }
}
console.log(
  "PASS smoke checks; no complaint/payment/profile mutations performed.",
);
