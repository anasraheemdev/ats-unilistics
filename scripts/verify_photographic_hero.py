import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.environ.get("VERIFICATION_OUTPUT_DIR", r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"

VIEWPORTS = [
    {"name": "desktop_1440", "width": 1440, "height": 900},
    {"name": "desktop_1024", "width": 1024, "height": 768},
    {"name": "tablet_768", "width": 768, "height": 1024},
    {"name": "mobile_390", "width": 390, "height": 844},
]

def verify_photographic_hero():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Capture across viewports
        for vp in VIEWPORTS:
            page = browser.new_page(viewport={"width": vp["width"], "height": vp["height"]})
            print(f"Testing viewport {vp['name']} ({vp['width']}x{vp['height']})...")
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            time.sleep(1.0)
            
            # Verify hero exists
            hero = page.locator("#homepage-photographic-hero")
            assert hero.is_visible(), f"Hero not visible on {vp['name']}"
            
            # Verify eyebrow
            eyebrow = hero.locator(".hero-eyebrow")
            assert "YOUR NEXT CHAPTER STARTS HERE" in eyebrow.inner_text()

            # Verify exact reference heading
            h1 = hero.locator("h1")
            text = h1.inner_text()
            assert "Your future." in text, f"Missing first line in {text}"
            assert "Your university." in text, f"Missing second line in {text}"
            assert "Your way forward." in text, f"Missing third line in {text}"
            
            # Verify supporting sentence
            supporting = hero.locator(".hero-supporting-text")
            assert "Explore study opportunities in Europe and take your next step with guidance from our team." in supporting.inner_text()
            
            # Verify search card & input
            search_title = hero.locator(".hero-search-title")
            assert "Where do you want to study?" in search_title.inner_text()
            search_input = hero.locator("#hero-university-search")
            explore_btn = hero.locator("#hero-search-explore-btn")
            assert search_input.is_visible(), "Search input not visible"
            assert explore_btn.is_visible(), "Explore button not visible"
            
            # Verify guidance link
            guidance_link = hero.locator("#hero-guidance-link")
            assert guidance_link.is_visible(), "Guidance link not visible"
            assert "Need a helping hand? Get guidance" in guidance_link.inner_text()

            # Verify country shortcuts
            country_shortcuts = hero.locator(".hero-country-shortcuts")
            assert "Germany" in country_shortcuts.inner_text()
            assert "France" in country_shortcuts.inner_text()
            assert "Italy" in country_shortcuts.inner_text()
            assert "Romania" in country_shortcuts.inner_text()

            # Verify 3 Feature Pillars
            pillars = page.locator(".hero-feature-pillars-bar")
            assert pillars.is_visible(), "Feature pillars bar not visible"
            assert "Explore opportunities" in pillars.inner_text()
            assert "Organise your documents" in pillars.inner_text()
            assert "Track every step" in pillars.inner_text()
            
            # Capture hero screenshot
            hero_path = os.path.join(OUTPUT_DIR, f"hero_{vp['name']}.png")
            hero.screenshot(path=hero_path)
            print(f"Captured: {hero_path}")
            
            # Capture above-the-fold screenshot
            full_path = os.path.join(OUTPUT_DIR, f"homepage_full_{vp['name']}.png")
            page.screenshot(path=full_path, full_page=False)
            print(f"Captured above-fold: {full_path}")
            
            page.close()

        # 2. Test search functionality
        print("Testing search form submission...")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(0.5)
        
        # Non-empty search
        search_input = page.locator("#hero-university-search")
        search_input.fill("Munich")
        explore_btn = page.locator("#hero-search-explore-btn")
        explore_btn.click()
        page.wait_for_url("**/universities?search=Munich**")
        print(f"Search navigation verified: {page.url}")
        
        # Test guidance link navigation
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(0.5)
        guidance_link = page.locator("#hero-guidance-link")
        guidance_link.click()
        page.wait_for_url("**/request-guidance**")
        print(f"Guidance navigation verified: {page.url}")

        browser.close()
        print("\nAll photographic hero verifications passed successfully!")

if __name__ == "__main__":
    verify_photographic_hero()
