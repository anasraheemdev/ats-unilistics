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
        page.evaluate('''() => {
            const c = {
                id: 'case-bilal-001',
                studentId: 'student-bilal',
                studentName: 'Muhammad Bilal',
                targetCountry: 'germany',
                targetDegree: 'masters',
                targetIntakeSeason: 'Winter',
                targetIntakeYear: 2026,
                currentStage: 'attestation',
                status: 'active',
                onboardingStatus: 'completed',
                nextRequiredAction: 'Submit original HEC-attested degrees to MOFA for Apostille barcode stamping',
                nextActionDueDate: '2026-11-12',
                responsiblePerson: 'Student (Muhammad Bilal)',
                lastUpdateDate: '2026-10-21',
                assignedCounsellorName: 'Fatima Noor',
                lockVersion: 1
            };
            localStorage.setItem('unilistics_active_demo_role', 'managed_student');
            localStorage.setItem('unilistics_student_case_state', JSON.stringify(c));
        }''')
        page.goto("http://localhost:5173/student", wait_until="networkidle")
        print("[PASS] Student Overview loaded")

        # Verify Core Contract Elements:
        # 1. Current student welcome & intake cycle
        assert page.locator("text=Welcome back").first.is_visible(), "Welcome back header must be visible"
        assert page.locator("text=Admissions Cycle").first.is_visible(), "Intake cycle indicator must be visible"

        # 2. Next Action Center & Grounded priority action
        assert page.locator("text=Next Action Center").first.is_visible(), "Next Action Center must be visible"

        # 3. Assigned Adviser
        assert page.locator("text=Fatima Noor").first.is_visible(), "Assigned adviser must be visible"
        assert page.locator("text=Assigned Case Lead").first.is_visible(), "Assigned case lead indicator must be visible"

        # 4. Verify absence of fake stats / completion percentages
        page_content = page.content()
        assert "acceptance odds" not in page_content.lower(), "Acceptance odds must not be fabricated"
        print("[PASS] Student Overview: Grounded priority elements verified (no fabricated odds/metrics)")

        # Verify navigation items
        for nav_item in ["Today", "Journey Map", "Applications", "Documents", "Tasks & Deadlines", "Messages"]:
            assert page.locator(f"nav >> text={nav_item}").first.is_visible(), f"Nav item {nav_item} must be visible"
        print("[PASS] Student navigation items verified")

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

        # Verify Student Mobile Bottom Dock
        dock = page.locator("nav[aria-label='Student mobile navigation dock']")
        assert dock.is_visible(), "Student mobile navigation bottom dock must be visible on mobile"
        for dock_label in ["Today", "Discover", "Saved", "Journey", "Settings"]:
            assert dock.locator(f"text={dock_label}").first.is_visible(), f"Dock item {dock_label} must be visible"
        print("[PASS] Mobile 360px: Student bottom dock verified with 5 core tabs")

        # Test dock interaction: navigate to Journey
        dock.locator("text=Journey").first.click()
        page.wait_for_timeout(400)
        assert "/student/journey" in page.url, "Dock click must navigate to Journey"
        print("[PASS] Mobile 360px: Dock navigation to Journey verified")

        # -------------------------------------------------------------
        # 5. Form Save-and-Resume Draft Verification (at 360px)
        # -------------------------------------------------------------
        page.goto("http://localhost:5173/request-access", wait_until="networkidle")
        name_input = page.locator("input#input-full-legal-name")
        name_input.fill("Ahmad Raza Khan")
        email_input = page.locator("input#input-email-address")
        email_input.fill("ahmad.raza@example.com")
        page.wait_for_timeout(600) # wait for debounced auto-save

        # Reload page to test resume
        page.reload(wait_until="networkidle")
        assert page.locator("text=Draft Resumed").first.is_visible(), "Draft resumed banner must be visible"
        assert name_input.input_value() == "Ahmad Raza Khan", "Drafted name must be restored"
        assert email_input.input_value() == "ahmad.raza@example.com", "Drafted email must be restored"
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
        page.evaluate("() => { localStorage.setItem('unilistics_active_demo_role', 'counsellor'); }")
        page.goto("http://localhost:5173/staff", wait_until="networkidle")
        assert page.locator("text=Counsellor Control Center").first.is_visible() or page.locator("text=Admissions Operations Hub").first.is_visible(), "Staff portal header must be visible"
        print("[PASS] Staff Portal Layout: Verified separate staff administration boundary")

        # -------------------------------------------------------------
        # 7. Explorer Layout Verification
        # -------------------------------------------------------------
        page.evaluate("() => { localStorage.setItem('unilistics_active_demo_role', 'explorer'); }")
        page.goto("http://localhost:5173/universities", wait_until="networkidle")
        assert page.locator("text=European Universities").first.is_visible(), "Explorer catalogue title must be visible"
        print("[PASS] Explorer Layout: Verified published catalogue views")

        browser.close()
        print("\nALL E2E & RESPONSIVE LAYOUT VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
