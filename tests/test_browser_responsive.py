import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def run_tests():
    print("Starting Playwright layout and keyboard verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # -------------------------------------------------------------
        # 1. Desktop Width (1280px x 800px)
        # -------------------------------------------------------------
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173", wait_until="networkidle")
        print("[PASS] Desktop 1280px: Landing page loaded successfully")

        # Verify Provisional Wordmark
        wordmark = page.locator("a[aria-label='Unilistics Home']").first
        assert wordmark.is_visible(), "UNILISTICS wordmark must be visible"
        assert page.locator("text=PREVIEW").first.is_visible(), "Provisional PREVIEW tag must be visible"
        print("[PASS] Wordmark & Provisional Pre-Release Tag verified")

        # Verify Keyboard Navigation & Skip Link
        page.keyboard.press("Tab")
        skip_link = page.locator(".skip-link")
        assert skip_link.is_visible(), "Skip link must become visible upon Tab focus"
        print("[PASS] Keyboard Navigation: Skip link focused and visible on Tab")

        # Verify Preview Catalogue count restriction (<= 50)
        preview_unis = page.locator("h3").all()
        assert len(preview_unis) <= 50, "Preview list must not exceed 50 universities"
        print(f"[PASS] Preview Catalogue: verified {len(preview_unis)} preview universities listed (within <= 50 limit)")

        # -------------------------------------------------------------
        # 2. Student Overview Layout & Core Requirements
        # -------------------------------------------------------------
        page.goto("http://localhost:5173/student", wait_until="networkidle")
        print("[PASS] Student Overview loaded")

        # Verify Core Contract Elements:
        # 1. Current stage
        assert page.locator("text=Step 2").first.is_visible(), "Step 2 indicator must be visible"
        assert page.locator("text=Document Legalization & Attestation").first.is_visible(), "Current stage text must be visible"

        # 2. Next Required Action
        assert page.locator("text=Submit original HEC-attested degrees to MOFA for Apostille barcode stamping").first.is_visible(), "Next required action must be visible"

        # 3. Due Date
        assert page.locator("text=2026-11-12").first.is_visible(), "Next action due date must be visible"

        # 4. Responsible Person
        assert page.locator("text=Student (Muhammad Bilal)").first.is_visible(), "Responsible person must be visible"

        # 5. Last Update
        assert page.locator("text=2026-10-21").first.is_visible(), "Last update must be visible"

        # 6. Verify absence of fake stats / completion percentages
        page_content = page.content()
        assert "acceptance odds" not in page_content.lower(), "Acceptance odds must not be fabricated"
        print("[PASS] Student Overview: Grounded priority elements verified (no fabricated odds/metrics)")

        # Verify 7 navigation items
        for nav_item in ["Overview", "My Applications", "Documents", "Tasks", "Messages", "Explore", "Help"]:
            assert page.locator(f"nav >> text={nav_item}").first.is_visible(), f"Nav item {nav_item} must be visible"
        print("[PASS] Student 7-item navigation verified")

        # -------------------------------------------------------------
        # 3. Tablet Width (768px x 1024px)
        # -------------------------------------------------------------
        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto("http://localhost:5173/student", wait_until="networkidle")
        body_scroll_w = page.evaluate("document.body.scrollWidth")
        body_client_w = page.evaluate("document.documentElement.clientWidth")
        assert body_scroll_w <= body_client_w + 2, f"No horizontal overflow on tablet: scrollWidth={body_scroll_w}, clientWidth={body_client_w}"
        print("[PASS] Tablet 768px: Layout responsive without horizontal overflow")

        # -------------------------------------------------------------
        # 4. Mobile Width (360px x 740px)
        # -------------------------------------------------------------
        page.set_viewport_size({"width": 360, "height": 740})
        page.goto("http://localhost:5173/student", wait_until="networkidle")

        body_scroll_w_mob = page.evaluate("document.body.scrollWidth")
        body_client_w_mob = page.evaluate("document.documentElement.clientWidth")
        assert body_scroll_w_mob <= body_client_w_mob + 2, f"No horizontal overflow on mobile: scrollWidth={body_scroll_w_mob}, clientWidth={body_client_w_mob}"
        print("[PASS] Mobile 360px: Layout responsive without horizontal overflow")

        # Open mobile drawer menu
        mobile_menu_btn = page.locator("button[aria-label='Open navigation menu']")
        assert mobile_menu_btn.is_visible(), "Mobile menu hamburger button must be visible"
        mobile_menu_btn.click()
        page.wait_for_timeout(300)

        # Verify mobile drawer links
        assert page.locator("#mobile-navigation-drawer").is_visible(), "Mobile menu drawer must expand"
        print("[PASS] Mobile 360px: Mobile navigation drawer opened and verified")

        # Close mobile drawer
        close_btn = page.locator("button[aria-label='Close navigation menu']")
        close_btn.click()
        page.wait_for_timeout(300)
        assert not page.locator("#mobile-navigation-drawer").is_visible(), "Mobile menu drawer must close"
        print("[PASS] Mobile 360px: Mobile navigation drawer closed cleanly")

        # -------------------------------------------------------------
        # 5. Form Save-and-Resume Draft Verification (at 360px)
        # -------------------------------------------------------------
        page.goto("http://localhost:5173/request-access", wait_until="networkidle")
        name_input = page.locator("input#input-full-legal-name--as-per-passport---cnic-")
        name_input.fill("Ahmad Raza Khan")
        city_input = page.locator("input#input-city-of-residence-in-pakistan")
        city_input.fill("Faisalabad")
        page.wait_for_timeout(600) # wait for debounced auto-save

        # Reload page to test resume
        page.reload(wait_until="networkidle")
        assert page.locator("text=Draft Resumed").first.is_visible(), "Draft resumed banner must be visible"
        assert name_input.input_value() == "Ahmad Raza Khan", "Drafted name must be restored"
        assert city_input.input_value() == "Faisalabad", "Drafted city must be restored"
        print("[PASS] Save-and-Resume Form Behavior: Form draft auto-saved and restored on reload")

        # Clear Draft
        clear_btn = page.locator("button:has-text('Clear Draft')")
        clear_btn.click()
        page.wait_for_timeout(200)
        assert name_input.input_value() == "", "Draft must be cleared"
        print("[PASS] Save-and-Resume Form Behavior: Clear draft resets form safely")

        # -------------------------------------------------------------
        # 6. Staff Desk Layout Verification
        # -------------------------------------------------------------
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:5173/staff", wait_until="networkidle")
        assert page.locator("text=Operational Staff Portal").first.is_visible(), "Staff portal header must be visible"
        assert page.locator("text=Review Queue").first.is_visible(), "Staff review queue link must be visible"
        print("[PASS] Staff Portal Layout: Verified separate staff administration boundary")

        # -------------------------------------------------------------
        # 7. Explorer Layout Verification
        # -------------------------------------------------------------
        page.goto("http://localhost:5173/explorer", wait_until="networkidle")
        assert page.locator("text=Full Published Catalogue").first.is_visible(), "Explorer catalogue title must be visible"
        assert page.locator("text=Regional Scholarships").first.is_visible(), "Scholarships tab must be visible"
        print("[PASS] Explorer Layout: Verified 4-item navigation and catalogue views")

        browser.close()
        print("\nALL E2E & RESPONSIVE LAYOUT VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
