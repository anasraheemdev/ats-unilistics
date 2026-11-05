import os
import sys
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.environ.get("VERIFICATION_OUTPUT_DIR", r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("\n=======================================================")
        print("  PROGRAMS & SCHOLARSHIPS DISCOVERY VERIFICATION")
        print("=======================================================\n")

        # -------------------------------------------------------------
        # 1. PROGRAMS DISCOVERY PAGE (Authenticated Explorer)
        # -------------------------------------------------------------
        print(">>> 1. Testing Programs Discovery Page (/programs)...")
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        page.evaluate("""() => {
            localStorage.setItem('unilistics_active_demo_role', 'explorer');
        }""")
        page.goto(f"{BASE_URL}/programs", wait_until="networkidle")
        time.sleep(1)

        # Header title & subtitle
        title = page.locator("h1:has-text('Degree Programs')")
        assert title.is_visible(), "Degree Programs h1 must be visible"
        
        # Verify no unproven claims
        body_text = page.locator("body").inner_text()
        assert "Portal Protocol: uni-assist" not in body_text, "Portal Protocol claim must be removed"
        assert "Prerequisites verified against university regulations" not in body_text, "Unproven prerequisite claim must be removed"

        # Search bar
        search_input = page.locator("input[placeholder*='Search program']")
        assert search_input.is_visible(), "Search input must be visible"

        # Sort control
        sort_select = page.locator("#sort-by-prog")
        assert sort_select.is_visible(), "Sort control must be visible"

        # Verify cards
        cards = page.locator(".catalogue-card-item")
        card_count = cards.count()
        print(f"Found {card_count} program cards rendered")
        assert card_count > 0, "At least one program card must be rendered"

        # Test filter interaction: Click 'Germany 🇩🇪'
        print("Testing country filter selection...")
        germany_filter = page.locator("aside button:has-text('Germany 🇩🇪')")
        germany_filter.click()
        time.sleep(1)

        # Active filter chip should appear
        active_chip = page.locator("span:has-text('Country: Germany')").first
        assert active_chip.is_visible(), "Active filter chip for Germany must appear"
        print("Active filter chip appeared successfully!")

        page.screenshot(path=os.path.join(OUTPUT_DIR, "12_programs_discovery_filtered.png"))

        # Clear active filter via chip 'x'
        remove_chip_btn = active_chip.locator("button[aria-label='Remove country filter']")
        remove_chip_btn.click()
        time.sleep(1)
        assert not active_chip.is_visible(), "Filter chip should disappear after removal"
        print("Filter chip dismissed successfully!")

        # -------------------------------------------------------------
        # 2. SCHOLARSHIPS DISCOVERY PAGE (Authenticated Explorer)
        # -------------------------------------------------------------
        print("\n>>> 2. Testing Scholarships Discovery Page (/scholarships)...")
        page.goto(f"{BASE_URL}/scholarships", wait_until="networkidle")
        time.sleep(1)

        sch_title = page.locator("h1:has-text('Scholarships & Grants')")
        assert sch_title.is_visible(), "Scholarships & Grants h1 must be visible"

        sch_cards = page.locator(".catalogue-card-item")
        sch_count = sch_cards.count()
        print(f"Found {sch_count} scholarship cards rendered")
        assert sch_count > 0, "Scholarship cards must be rendered for explorer"

        # Filter interaction: Click 'Full Tuition & Living Stipend'
        print("Testing scholarship funding model filter...")
        full_stipend_filter = page.locator("aside button:has-text('Full Tuition & Living Stipend')")
        full_stipend_filter.click()
        time.sleep(1)

        sch_chip = page.locator("span:has-text('Funding: Full Tuition')").first
        assert sch_chip.is_visible(), "Scholarship active filter chip must appear"
        print("Scholarship model filter chip appeared successfully!")

        page.screenshot(path=os.path.join(OUTPUT_DIR, "13_scholarships_discovery_filtered.png"))

        # -------------------------------------------------------------
        # 3. SCHOLARSHIPS DISCOVERY PAGE (Visitor Gated State)
        # -------------------------------------------------------------
        print("\n>>> 3. Testing Scholarships Gated State for Visitor...")
        page.evaluate("""() => {
            localStorage.setItem('unilistics_active_demo_role', 'visitor');
        }""")
        page.goto(f"{BASE_URL}/scholarships", wait_until="networkidle")
        time.sleep(1)

        gated_box = page.locator("h2:has-text('Scholarship Directory')")
        assert gated_box.is_visible(), "Gated scholarship directory card must be visible for visitor"
        assert page.locator("#scholarships-gated-signin-btn").is_visible(), "Sign in button in gated card"
        assert page.locator("#scholarships-gated-signup-btn").is_visible(), "Sign up button in gated card"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "14_scholarships_visitor_gated.png"))
        print("Visitor gated state verified!")

        print("\n=======================================================")
        print("  PROGRAMS & SCHOLARSHIPS TESTS COMPLETED SUCCESSFULLY!")
        print("=======================================================\n")

        context.close()
        browser.close()

if __name__ == "__main__":
    run_tests()
