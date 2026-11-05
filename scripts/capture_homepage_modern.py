import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.environ.get("VERIFICATION_OUTPUT_DIR", r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"

def capture_modern_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        print("Navigating to Home Page at 1440x900...")
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1.0) # allow initial entrance animations to settle
        
        # 1. Hero Section screenshot
        hero = page.locator("section").first
        hero_path = os.path.join(OUTPUT_DIR, "hero_animated_modern.png")
        hero.screenshot(path=hero_path)
        print(f"Captured Hero Section: {hero_path}")
        
        # 2. Scroll to Interactive World Map
        map_section = page.locator("#destinations-world-map")
        map_section.scroll_into_view_if_needed()
        time.sleep(1.0) # allow map entrance & svg dash animations to trigger
        map_path = os.path.join(OUTPUT_DIR, "world_destinations_map.png")
        map_section.screenshot(path=map_path)
        print(f"Captured World Map Section: {map_path}")
        
        # 3. Test clicking a country card on the map (e.g. Germany DE)
        de_card = page.locator("button:has-text('DE')").first
        if de_card.is_visible():
            de_card.click()
            time.sleep(0.5)
            drawer_path = os.path.join(OUTPUT_DIR, "world_map_germany_selected.png")
            map_section.screenshot(path=drawer_path)
            print(f"Captured World Map with Germany selected: {drawer_path}")
        
        # 3.5. Capture Winding Roadmap Section
        roadmap_section = page.locator("#journey-roadmap-section")
        if roadmap_section.is_visible():
            roadmap_path = os.path.join(OUTPUT_DIR, "journey_roadmap_modern.png")
            roadmap_section.screenshot(path=roadmap_path)
            print(f"Captured Journey Roadmap Section: {roadmap_path}")
        
        # 4. Full page capture (smoothly scroll down to trigger all whileInView animations)
        total_height = page.evaluate("() => document.body.scrollHeight")
        for y in range(0, total_height, 600):
            page.evaluate(f"() => window.scrollTo(0, {y})")
            time.sleep(0.12)
        page.evaluate("() => window.scrollTo(0, 0)")
        time.sleep(0.4)
        full_page_path = os.path.join(OUTPUT_DIR, "homepage_full_modern.png")
        page.screenshot(path=full_page_path, full_page=True)
        print(f"Captured Full Modern Homepage: {full_page_path}")
        
        # 5. Mobile viewport capture
        page_mobile = browser.new_page(viewport={"width": 390, "height": 844})
        page_mobile.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1.0)
        mobile_path = os.path.join(OUTPUT_DIR, "homepage_mobile_modern.png")
        page_mobile.screenshot(path=mobile_path, full_page=False)
        print(f"Captured Mobile Hero: {mobile_path}")
        
        # Scroll down to map on mobile
        map_mobile = page_mobile.locator("#destinations-world-map")
        map_mobile.scroll_into_view_if_needed()
        time.sleep(0.8)
        mobile_map_path = os.path.join(OUTPUT_DIR, "world_map_mobile_modern.png")
        map_mobile.screenshot(path=mobile_map_path)
        print(f"Captured Mobile World Map: {mobile_map_path}")
        
        page_mobile.close()
        page.close()
        browser.close()
        print("\nAll modern home page screenshots captured successfully!")

if __name__ == "__main__":
    capture_modern_homepage()
