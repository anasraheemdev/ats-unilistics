import os
import sys
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to http://localhost:5173/...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # 1. LIGHT MODE CAPTURES
        print("Ensuring Light Mode...")
        page.evaluate("""() => {
            localStorage.setItem('unilistics-theme', 'light');
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.classList.remove('dark');
        }""")
        page.wait_for_timeout(500)

        # Capture Interactive World Map in Light Mode
        map_sec = page.locator("#destinations-world-map")
        if map_sec.count() > 0:
            map_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(800)
            map_path = os.path.join(SCREENSHOTS_DIR, "light_mode_world_map.png")
            map_sec.screenshot(path=map_path)
            print(f"Captured light mode world map: {map_path}")

        # Capture Journey Roadmap in Light Mode
        roadmap_sec = page.locator("#journey-roadmap-section")
        if roadmap_sec.count() > 0:
            roadmap_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(800)
            roadmap_path = os.path.join(SCREENSHOTS_DIR, "light_mode_journey_roadmap.png")
            roadmap_sec.screenshot(path=roadmap_path)
            print(f"Captured light mode journey roadmap: {roadmap_path}")

        # 2. DARK MODE CAPTURES
        print("Switching to Dark Mode...")
        page.evaluate("""() => {
            localStorage.setItem('unilistics-theme', 'dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark');
        }""")
        page.wait_for_timeout(500)

        # Capture Interactive World Map in Dark Mode
        if map_sec.count() > 0:
            map_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(800)
            dark_map_path = os.path.join(SCREENSHOTS_DIR, "dark_mode_world_map.png")
            map_sec.screenshot(path=dark_map_path)
            print(f"Captured dark mode world map: {dark_map_path}")

        # Capture Journey Roadmap in Dark Mode (Showing smaller cards and readable text)
        if roadmap_sec.count() > 0:
            roadmap_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(800)
            dark_roadmap_path = os.path.join(SCREENSHOTS_DIR, "dark_mode_journey_roadmap.png")
            roadmap_sec.screenshot(path=dark_roadmap_path)
            print(f"Captured dark mode journey roadmap: {dark_roadmap_path}")

        # Also capture Hero in Dark Mode to ensure it is pristine
        hero_sec = page.locator("#homepage-photographic-hero")
        if hero_sec.count() > 0:
            hero_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(800)
            dark_hero_path = os.path.join(SCREENSHOTS_DIR, "dark_mode_hero.png")
            hero_sec.screenshot(path=dark_hero_path)
            print(f"Captured dark mode hero: {dark_hero_path}")

        browser.close()
        print("Verification completed successfully!")

if __name__ == "__main__":
    verify()
