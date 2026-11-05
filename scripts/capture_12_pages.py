import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOT_DIR = r"C:\Users\anasr\.gemini\antigravity-ide\brain\5a8a03b1-ba2b-49fb-ac03-15342fdda9f7\diagnostic_12_pages"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

PAGES = [
    ("support", "/support"),
    ("how_it_works", "/how-it-works"),
    ("request_guidance", "/request-guidance"),
    ("help", "/help"),
    ("support_desk", "/support-desk"),
    ("request_status", "/request-status"),
    ("corridors_and_legal", "/corridors-and-legal"),
    ("privacy", "/privacy"),
    ("terms", "/terms"),
    ("contact", "/contact"),
    ("sign_in", "/sign-in"),
    ("sign_up", "/sign-up")
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Desktop pass
        desktop_context = await browser.new_context(viewport={"width": 1440, "height": 900})
        desktop_page = await desktop_context.new_page()

        for name, route in PAGES:
            url = f"http://localhost:5173{route}"
            print(f"[Desktop] Capturing {name} from {url}...")
            try:
                await desktop_page.goto(url, wait_until="networkidle", timeout=12000)
                await desktop_page.wait_for_timeout(1000)
                await desktop_page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"{name}_desktop.png"), full_page=True)
            except Exception as e:
                print(f"Error capturing desktop {name}: {e}")

        await desktop_context.close()

        # Mobile pass
        mobile_context = await browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        mobile_page = await mobile_context.new_page()

        for name, route in PAGES:
            url = f"http://localhost:5173{route}"
            print(f"[Mobile] Capturing {name} from {url}...")
            try:
                await mobile_page.goto(url, wait_until="networkidle", timeout=12000)
                await mobile_page.wait_for_timeout(1000)
                await mobile_page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"{name}_mobile.png"), full_page=True)
            except Exception as e:
                print(f"Error capturing mobile {name}: {e}")

        await mobile_context.close()
        await browser.close()
        print("Done capturing all desktop and mobile screenshots.")

if __name__ == "__main__":
    asyncio.run(main())
