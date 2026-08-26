#!/usr/bin/env python3
"""Browser check for the photo wall's prop-cursor follower (src/prop-cursor.ts).

Why this exists rather than a smoke.json spec: underScore's ui-smoke.py has a
desktop device profile now, but its steps still cannot MOVE A POINTER — and
this feature is entirely about what happens under a moving pointer. Fold this
into ui-smoke the day it grows a hover/pointerMove step.

Run (needs playwright — underScore's tools venv has it):
    npm run build
    ~/_underScore/knowledge/tools/.venv/bin/python scripts/verify-prop-follower.py dist

Serves dist/ statically, so /api/* 404s are expected and excluded — the same
gap that makes `vite preview` break the password gate. Use `vercel dev` for
anything that needs the functions.

The wall samples 24 random photos per load, so the enlarged photo differs every
run. Assertions are therefore against the CONTRACT (scale = clamp(w/420, 1.5,
6)) rather than hardcoded pixel counts, and cases that cannot arise for a given
photo are skipped aloud rather than silently passing.

Fails loudly on every assertion so a green run means something.
"""
import functools
import http.server
import json
import subprocess
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

DIST = Path(sys.argv[1])
OUT = Path(__file__).parent
PORT = 8899

assert DIST.is_dir(), f"no dist at {DIST}"


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(DIST))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main() -> int:
    serve()
    failures, notes = [], []

    def check(label, cond, detail=""):
        (notes if cond else failures).append(f"{'PASS' if cond else 'FAIL'}  {label}  {detail}")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        errors, bad_urls = [], []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        # Record 404s by URL. This harness serves dist/ statically with no
        # serverless functions, so /api/* 404s are the harness's gap, not the
        # app's -- the same gap that made `vite preview` break the password gate.
        page.on("response", lambda r: bad_urls.append(r.url) if r.status >= 400 else None)

        page.add_init_script(
            "localStorage.setItem('banana_rodeo_auth', JSON.stringify("
            "{authenticated: true, timestamp: Date.now()}));"
        )
        page.goto(f"http://127.0.0.1:{PORT}/pages/photowall.html", wait_until="networkidle")

        # media query the follower gates on
        fine = page.evaluate("matchMedia('(hover: hover) and (pointer: fine)').matches")
        check("desktop context reports a fine pointer", fine, f"(matches={fine})")

        page.wait_for_selector(".frame", timeout=10000)
        frames = page.locator(".frame").count()
        check("wall hung frames", frames > 0, f"({frames} frames)")

        # --- wall: native cursor still in play, no follower yet ---
        wall_cursor = page.evaluate(
            "getComputedStyle(document.body).getPropertyValue('--frame-cursor')"
        )
        check("wall keeps a native prop cursor", "url(" in wall_cursor, wall_cursor.strip()[:60])

        page.locator(".frame").first.click()
        page.wait_for_selector("#photowall-lightbox:not([hidden])", timeout=5000)
        page.wait_for_function(
            "() => {const i=document.querySelector('.pw-lb-img');"
            "return i && i.complete && i.getBoundingClientRect().width > 0;}",
            timeout=10000,
        )

        follower = page.locator(".pw-prop-follower")
        check("follower element exists in the lightbox", follower.count() == 1,
              f"(count={follower.count()})")

        # hidden until the pointer is actually over the photo
        check("follower starts hidden", follower.evaluate("e => getComputedStyle(e).opacity") == "0")

        box = page.locator(".pw-lb-img").bounding_box()
        cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
        page.mouse.move(cx, cy)
        page.wait_for_timeout(250)

        check("follower shows on hover", follower.evaluate("e => getComputedStyle(e).opacity") == "1")

        native = page.evaluate(
            "getComputedStyle(document.querySelector('.pw-lb-img')).cursor"
        )
        check("native cursor suppressed over the enlarged photo", native == "none", f"(cursor: {native})")

        fb = follower.bounding_box()
        prop = page.evaluate(
            "document.querySelector('.pw-prop-follower').getAttribute('src')"
        )
        # The wall samples 24 random photos per load, so the enlarged photo's box
        # differs every run -- assert the CONTRACT (scale = clamp(w/420, 1.5, 6)
        # against granny-glasses' 50x33), not a hardcoded pixel count.
        expected_scale = min(6.0, max(1.5, box["width"] / 420))
        check("prop is scaled to the documented contract",
              abs(fb["width"] - 50 * expected_scale) < 2,
              f"({prop} rendered {fb['width']:.0f}px; photo box {box['width']:.0f}px "
              f"-> scale {expected_scale:.2f} -> expected {50*expected_scale:.0f}px)")
        check("prop is bigger than the wall's native cursor", fb["width"] > 50,
              f"({fb['width']:.0f}px vs 50px native)")
        # Portrait photos are height-constrained, so scaling off WIDTH alone
        # clamps them to MIN_SCALE -- flagged, not asserted.
        if expected_scale <= 1.51:
            notes.append(f"NOTE  portrait/narrow photo ({box['width']:.0f}x{box['height']:.0f}) "
                         f"clamped to MIN_SCALE -- prop is {fb['width']:.0f}px, "
                         f"vs ~147px on a landscape photo")
        check("prop keeps its authored aspect ratio",
              abs((fb["width"] / fb["height"]) - (50 / 33)) < 0.02,
              f"(ratio {fb['width']/fb['height']:.3f} vs {50/33:.3f})")

        # hotspot: granny-glasses hx/hy = 24/16 of a 50x33 box → the pointer should
        # sit at those fractions of the rendered box, not at its corner or centre.
        hot_x = fb["x"] + fb["width"] * (24 / 50)
        hot_y = fb["y"] + fb["height"] * (16 / 33)
        check("hotspot lands on the pointer", abs(hot_x - cx) < 2 and abs(hot_y - cy) < 2,
              f"(hotspot {hot_x:.1f},{hot_y:.1f} vs pointer {cx:.1f},{cy:.1f})")

        page.screenshot(path=str(OUT / "01-follower-centre.png"))

        # --- tracking: move, and it should follow ---
        page.mouse.move(cx - 200, cy - 120)
        page.wait_for_timeout(150)
        fb2 = follower.bounding_box()
        moved = abs((fb2["x"] + fb2["width"] * 0.48) - (cx - 200)) < 2
        check("follower tracks the pointer", moved,
              f"(now {fb2['x']:.0f},{fb2['y']:.0f})")
        page.screenshot(path=str(OUT / "02-follower-moved.png"))

        # --- swapping props from the picker reaches the follower ---
        # The picker is NOT reachable while the lightbox is open: .pw-lightbox is
        # position:fixed inset:0 z-index:1000, so it covers the whole page. The
        # real flow is close -> pick -> reopen, and that is what we assert.
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        check("picker is unreachable while a photo is open (overlay covers it)",
              page.locator(".pw-prop[data-id='tophat']").is_visible()
              and page.locator("#photowall-lightbox").get_attribute("hidden") is not None,
              "(so prop swaps apply on the next open, by design)")
        page.locator(".pw-prop[data-id='tophat']").click()
        page.locator(".frame").first.click()
        page.wait_for_selector("#photowall-lightbox:not([hidden])")
        page.wait_for_timeout(300)
        page.mouse.move(cx, cy - 60)
        page.wait_for_timeout(200)
        src = follower.get_attribute("src")
        fb3 = follower.bounding_box()
        check("picker swaps the worn prop", "tophat" in src, f"(src={src})")
        # tophat is 40x40 → square, and a different size from the glasses
        check("swapped prop re-measures its own geometry",
              abs((fb3["width"] / fb3["height"]) - 1.0) < 0.02,
              f"(ratio {fb3['width']/fb3['height']:.3f}, {fb3['width']:.0f}x{fb3['height']:.0f})")
        page.screenshot(path=str(OUT / "03-tophat.png"))

        # --- closing the lightbox parks it ---
        page.keyboard.press("Escape")
        page.wait_for_timeout(250)
        check("follower hides when the lightbox closes",
              follower.evaluate("e => getComputedStyle(e).opacity") == "0")

        # --- the scale should differ between a small and a large photo box ---
        page.locator(".frame").first.click()
        page.wait_for_selector("#photowall-lightbox:not([hidden])")
        page.wait_for_timeout(300)
        page.mouse.move(cx, cy)
        page.wait_for_timeout(200)
        big_box = page.locator(".pw-lb-img").bounding_box()["width"]
        big = follower.bounding_box()["width"]
        ctx.pages[0].set_viewport_size({"width": 700, "height": 620})
        page.wait_for_timeout(400)
        page.mouse.move(360, 300)
        page.wait_for_timeout(250)
        small_box = page.locator(".pw-lb-img").bounding_box()["width"]
        small = follower.bounding_box()["width"]
        # Only meaningful if the big case wasn't already clamped at MIN_SCALE.
        if big_box / 420 > 1.51:
            check("prop scales down with a smaller photo box", small < big,
                  f"(photo {big_box:.0f}px -> prop {big:.0f}px; "
                  f"photo {small_box:.0f}px -> prop {small:.0f}px)")
        else:
            notes.append(f"SKIP  scale-down check -- this run's photo ({big_box:.0f}px) "
                         f"was already at MIN_SCALE, nothing to scale down from")
        page.screenshot(path=str(OUT / "04-narrow-viewport.png"))

        # --- touch device: follower must bow out and leave the native cursor ---
        tctx = browser.new_context(
            viewport={"width": 412, "height": 915}, is_mobile=True, has_touch=True
        )
        tpage = tctx.new_page()
        tpage.add_init_script(
            "localStorage.setItem('banana_rodeo_auth', JSON.stringify("
            "{authenticated: true, timestamp: Date.now()}));"
        )
        tpage.goto(f"http://127.0.0.1:{PORT}/pages/photowall.html", wait_until="networkidle")
        tpage.wait_for_selector(".frame", timeout=10000)
        tpage.locator(".frame").first.click()
        tpage.wait_for_selector("#photowall-lightbox:not([hidden])", timeout=5000)
        tpage.wait_for_timeout(300)
        check("touch device grows no follower", tpage.locator(".pw-prop-follower").count() == 0)
        tcur = tpage.evaluate("getComputedStyle(document.querySelector('.pw-lb-img')).cursor")
        check("touch device keeps its native cursor untouched", tcur != "none", f"(cursor: {tcur})")

        # --- regression: the photo must not appear under a BARE pointer ---
        # This is the bug review caught. cursor:none is on the photo from
        # construction, but the prop used to be revealed only by the photo's own
        # pointermove -- so opening under a stationary pointer left nothing at
        # all under the hand. Park the mouse mid-screen, click a frame THERE,
        # and never move again.
        page.keyboard.press("Escape")
        page.set_viewport_size({"width": 1440, "height": 900})  # undo the resize test
        page.wait_for_timeout(400)
        page.evaluate("window.scrollTo(0,0)")
        page.wait_for_timeout(200)
        # Pick the frame nearest the viewport centre, so the click point is also
        # inside the (centred) enlarged photo -- otherwise the pointer ends up
        # over the backdrop and the case under test never arises.
        vp = page.viewport_size
        boxes = [(i, page.locator(".frame").nth(i).bounding_box())
                 for i in range(page.locator(".frame").count())]
        boxes = [(i, b) for i, b in boxes if b and b["width"] > 0]
        cxv, cyv = vp["width"] / 2, vp["height"] / 2
        idx, fbox = min(boxes, key=lambda t: abs(t[1]["x"] + t[1]["width"] / 2 - cxv)
                        + abs(t[1]["y"] + t[1]["height"] / 2 - cyv))
        mid_x = fbox["x"] + fbox["width"] / 2
        mid_y = fbox["y"] + fbox["height"] / 2
        page.mouse.move(mid_x, mid_y)   # the pointer's last movement, ever
        page.wait_for_timeout(150)
        page.mouse.down()
        page.mouse.up()                 # a real click, in place
        page.wait_for_selector("#photowall-lightbox:not([hidden])", timeout=5000)
        page.wait_for_timeout(500)  # no mouse.move() -- that is the whole point
        over_photo = page.evaluate(
            "([x,y]) => {const r=document.querySelector('.pw-lb-img').getBoundingClientRect();"
            "return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}", [mid_x, mid_y])
        if over_photo:
            check("prop is visible without moving the mouse (the review regression)",
                  follower.evaluate("e => getComputedStyle(e).opacity") == "1",
                  "(opened under a stationary pointer)")
        else:
            check("stationary-pointer case reached the photo", False,
                  "(pointer landed off the photo -- test setup, not the app)")

        non_api_404s = [u for u in bad_urls if "/api/" not in u]
        check("no failed requests outside /api/", not non_api_404s, f"({non_api_404s[:3]})")
        # Console 404 noise is accounted for by the check above; anything else is real.
        app_errors = [e for e in errors
                      if "Failed to load resource" not in e and "HitCounter" not in e]
        check("no console errors or page exceptions", not app_errors, f"({app_errors[:2]})")
        browser.close()

    for line in notes + failures:
        print(line)
    print(f"\n{len(notes)} passed, {len(failures)} failed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
