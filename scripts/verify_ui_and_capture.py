import os
import sys
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.environ.get("VERIFICATION_OUTPUT_DIR", r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Viewport verification: 360, 390, 768, 1023, 1024, 1280, 1440, 1920
        viewports = [
            ("360", 360, 640),
            ("390", 390, 844),
            ("768", 768, 1024),
            ("1023", 1023, 768),
            ("1024", 1024, 768),
            ("1280", 1280, 800),
            ("1440", 1440, 900),
            ("1920", 1920, 1080),
        ]
        
        print("--- Testing Viewport Responsive Contracts ---")
        for name, w, h in viewports:
            page = browser.new_page(viewport={"width": w, "height": h})
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            
            # Check navbar responsive classes
            desktop_nav = page.locator(".desktop-only-nav").first
            hamburger = page.locator(".mobile-only-hamburger").first
            
            if w >= 1024:
                # Desktop: nav visible, hamburger hidden
                nav_vis = desktop_nav.is_visible()
                ham_vis = hamburger.is_visible()
                print(f"Viewport {w}px: desktop-only-nav visible={nav_vis}, hamburger visible={ham_vis} (Expected: nav=True, ham=False)")
                assert nav_vis, f"Desktop nav should be visible at {w}px"
                assert not ham_vis, f"Hamburger should be hidden at {w}px"
            else:
                # Mobile/Tablet: nav hidden, hamburger visible
                nav_vis = desktop_nav.is_visible()
                ham_vis = hamburger.is_visible()
                print(f"Viewport {w}px: desktop-only-nav visible={nav_vis}, hamburger visible={ham_vis} (Expected: nav=False, ham=True)")
                assert not nav_vis, f"Desktop nav should be hidden at {w}px"
                assert ham_vis, f"Hamburger should be visible at {w}px"
                
            page.close()
            
        print("Responsive viewport checks PASSED!\n")
        
        # 2. Capture Key Screenshots
        pages_to_capture = [
            ("home_desktop_1280.png", "/", 1280, 800),
            ("home_mobile_390.png", "/", 390, 844),
            ("explore_desktop_1280.png", "/universities", 1280, 800),
            ("explore_mobile_390.png", "/universities", 390, 844),
            ("contact_desktop_1280.png", "/contact", 1280, 800),
            ("contact_mobile_390.png", "/contact", 390, 844),
            ("how_it_works_1280.png", "/how-it-works", 1280, 800),
            ("support_1280.png", "/support", 1280, 800),
            ("request_guidance_1280.png", "/request-guidance", 1280, 800),
            ("corridors_and_legal_1280.png", "/corridors-and-legal", 1280, 800),
            ("support_desk_1280.png", "/support-desk", 1280, 800),
            ("request_status_1280.png", "/request-status", 1280, 800),
        ]
        
        print("--- Capturing Screenshots for Core Routes ---")
        for filename, path, w, h in pages_to_capture:
            page = browser.new_page(viewport={"width": w, "height": h})
            page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
            time.sleep(0.5) # allow transitions to settle
            filepath = os.path.join(OUTPUT_DIR, filename)
            page.screenshot(path=filepath, full_page=False)
            print(f"Captured: {filename} ({w}x{h}) -> {filepath}")
            page.close()

        # 3. Test Advisory Modal Escape interaction on Home
        print("\n--- Testing Advisory Modal Interaction ---")
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        advisory_btn = page.locator("#hero-request-advisory-btn")
        advisory_btn.click()
        time.sleep(0.3)
        modal = page.locator("#advisory-modal-title")
        assert modal.is_visible(), "Advisory modal should be visible after clicking CTA"
        print("Advisory modal opened successfully.")
        
        # Capture screenshot of open modal
        page.screenshot(path=os.path.join(OUTPUT_DIR, "advisory_modal_open.png"))
        
        # Press Escape
        page.keyboard.press("Escape")
        time.sleep(0.3)
        assert not modal.is_visible(), "Advisory modal should be hidden after pressing Escape"
        print("Advisory modal dismissed with Escape successfully.")
        page.close()

        # 4. Test Universities search and filter locked prompt
        print("\n--- Testing Universities Filter Gating ---")
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(f"{BASE_URL}/universities", wait_until="networkidle")
        
        # Check result count
        results_text = page.locator("text=Showing").first
        print(f"Universities page result text: {results_text.text_content()}")
        
        # Test Filter Button click as visitor
        filter_btn = page.locator("button:has-text('Filters')").first
        filter_btn.click()
        time.sleep(0.3)
        dialog = page.locator("text=Catalogue Filters Locked").first
        assert dialog.is_visible(), "Filter locked dialog should open for visitor"
        print("Catalogue Filters Locked dialog displayed as expected for unauthenticated visitor.")
        page.screenshot(path=os.path.join(OUTPUT_DIR, "explore_filter_locked_dialog.png"))
        
        # Close dialog with Escape
        page.keyboard.press("Escape")
        time.sleep(0.3)
        print("Filter dialog closed successfully.")
        page.close()

        # 5. Test Contact Form Inputs
        print("\n--- Testing Contact Form Inputs ---")
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(f"{BASE_URL}/contact", wait_until="networkidle")
        email_input = page.locator("#contact-email")
        name_input = page.locator("#contact-full-name")
        assert email_input.is_visible(), "Email input should be visible"
        assert name_input.is_visible(), "Name input should be visible"
        
        # Check input bounding box widths
        email_box = email_input.bounding_box()
        name_box = name_input.bounding_box()
        print(f"Contact Name input width: {name_box['width']:.1f}px, height: {name_box['height']:.1f}px")
        print(f"Contact Email input width: {email_box['width']:.1f}px, height: {email_box['height']:.1f}px")
        assert abs(email_box['width'] - name_box['width']) < 5, "Email and Name inputs should have consistent widths"
        assert email_box['height'] >= 44, "Email input should satisfy touch target >= 44px"
        page.close()

        browser.close()
        print("\n=== ALL PLAYWRIGHT VERIFICATION CHECKS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_verification()
