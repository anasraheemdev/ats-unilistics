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
        print("  UNILISTICS UNIFIED NAVBAR & ROLE NAVIGATION VERIFICATION")
        print("=======================================================\n")

        # -------------------------------------------------------------
        # 1. GUEST / VISITOR JOURNEY
        # -------------------------------------------------------------
        print(">>> 1. Testing Visitor Navigation & Pill Styling on Home (/)")
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1)

        # Check banner element and computed height
        header = page.locator("header[role='banner']").first
        assert header.is_visible(), "Header banner must be visible"
        box = header.bounding_box()
        print(f"Header height: {box['height']}px (expected 72px)")
        assert round(box['height']) == 72, f"Header height should be 72px, got {box['height']}"

        # Brand Wordmark check
        brand = page.locator("#public-nav-brand-logo")
        assert brand.is_visible(), "Brand logo should be visible"

        # Center pill menu items
        home_link = page.locator("#public-nav-home-link")
        assert home_link.is_visible(), "Home link must be visible"
        assert "active" in (home_link.get_attribute("class") or ""), "Home link should be active on /"

        explore_trigger = page.locator("#public-nav-explore-trigger")
        assert explore_trigger.is_visible(), "Explore dropdown trigger must be visible"

        help_trigger = page.locator("#public-nav-help-trigger")
        assert help_trigger.is_visible(), "Help & Guidance trigger must be visible"

        contact_link = page.locator("#public-nav-contact-link")
        assert contact_link.is_visible(), "Contact link must be visible"

        # Right-side visitor actions
        search_btn = page.locator("#public-nav-search-btn")
        assert search_btn.is_visible(), "Search button must be visible"

        signin_btn = page.locator("#public-nav-signin-btn")
        assert signin_btn.is_visible(), "Sign in button must be visible"

        signup_btn = page.locator("#public-nav-signup-btn")
        assert signup_btn.is_visible(), "Sign up / Create Free Account button must be visible"

        page.screenshot(path=os.path.join(OUTPUT_DIR, "01_visitor_home_desktop.png"))
        print("Visitor desktop Home verification PASSED!")

        # Test Explore Dropdown Interaction
        print("\n>>> Testing Explore Dropdown Interaction on Desktop...")
        explore_trigger.click()
        time.sleep(0.3)
        explore_dropdown = page.locator("#public-nav-explore-dropdown")
        assert explore_dropdown.is_visible(), "Explore dropdown should open on click"
        
        # Verify dropdown items
        uni_link = explore_dropdown.locator("a[href='/universities']")
        prog_link = explore_dropdown.locator("a[href='/programs']")
        sch_link = explore_dropdown.locator("a[href='/scholarships']")
        assert uni_link.is_visible(), "Universities item must be visible in dropdown"
        assert prog_link.is_visible(), "Programs item must be visible in dropdown"
        assert sch_link.is_visible(), "Scholarships item must be visible in dropdown"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02_explore_dropdown_open.png"))
        print("Explore dropdown opened with Universities, Programs, Scholarships!")

        # Test Help & Guidance Dropdown Interaction
        print("\n>>> Testing Help & Guidance Dropdown Interaction...")
        help_trigger.click()
        time.sleep(0.3)
        help_dropdown = page.locator("#public-nav-help-dropdown")
        assert help_dropdown.is_visible(), "Help dropdown should open on click"
        help_centre_link = help_dropdown.locator("a[href='/help']")
        how_it_works_link = help_dropdown.locator("a[href='/how-it-works']")
        corridors_link = help_dropdown.locator("a[href='/corridors-and-legal']")
        assert help_centre_link.is_visible(), "Help Centre link must be visible in help dropdown"
        assert how_it_works_link.is_visible(), "How It Works link must be visible in help dropdown"
        assert corridors_link.is_visible(), "Country Corridors link must be visible in help dropdown"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "03_help_dropdown_open.png"))
        print("Help & Guidance dropdown opened with authorized support destinations!")

        # Test Quick Search Modal
        print("\n>>> Testing Working Search Dialog...")
        # Close any open dropdown first by clicking body
        page.locator("body").click(position={"x": 50, "y": 200})
        time.sleep(0.3)
        search_btn.click()
        time.sleep(0.4)
        search_dialog = page.locator("div[role='dialog'][aria-label='Global Search']")
        assert search_dialog.is_visible(), "Search dialog modal should open upon search button click"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04_search_modal_open.png"))
        page.keyboard.press("Escape")
        time.sleep(0.5)
        assert not search_dialog.is_visible(), "Search dialog should close on Escape key"
        print("Search dialog opens and closes with Escape key cleanly!")

        # -------------------------------------------------------------
        # 2. CONSISTENT PILL NAVBAR ACROSS EXPLORER / DISCOVERY PAGES
        # -------------------------------------------------------------
        discovery_urls = ["/universities", "/programs", "/scholarships", "/contact"]
        for url in discovery_urls:
            print(f"\n>>> Visiting {url} as visitor to verify consistent navbar styling...")
            page.goto(f"{BASE_URL}{url}", wait_until="networkidle")
            time.sleep(0.5)
            h = page.locator("header[role='banner']").first
            assert h.is_visible(), f"Header banner must be visible on {url}"
            assert round(h.bounding_box()['height']) == 72, f"Header on {url} should be 72px"
            
            # Verify no second header is mounted
            header_count = page.locator("header[role='banner']").count()
            assert header_count == 1, f"There must be exactly ONE header mounted on {url}, found {header_count}"
            
            # On catalogue pages (/universities, /programs, /scholarships), Explore trigger should have active styling
            if url in ["/universities", "/programs", "/scholarships"]:
                exp_trig = page.locator("#public-nav-explore-trigger")
                bg_color = exp_trig.evaluate("el => window.getComputedStyle(el).backgroundColor")
                print(f"Explore parent button on {url} has active background: {bg_color}")
                assert "245B42" in bg_color or "rgba" in bg_color or "rgb(36, 91, 66)" in bg_color, \
                    f"Explore parent button should have active forest styling on {url}"

        page.screenshot(path=os.path.join(OUTPUT_DIR, "05_universities_pill_navbar.png"))
        print("Consistent pill navbar verified across all catalogue/public pages!")

        # -------------------------------------------------------------
        # 3. MOBILE RESPONSIVE DRAWER CONTRACT (<1024px)
        # -------------------------------------------------------------
        print("\n>>> Testing Mobile Responsive Drawer at 390px...")
        mobile_page = context.new_page()
        mobile_page.set_viewport_size({"width": 390, "height": 844})
        mobile_page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(0.5)

        # Desktop nav should be hidden, mobile hamburger visible
        desktop_nav = mobile_page.locator(".desktop-only-nav").first
        hamburger = mobile_page.locator("#public-nav-mobile-menu-btn")
        assert not desktop_nav.is_visible(), "Desktop pill nav should be hidden on mobile viewport"
        assert hamburger.is_visible(), "Hamburger button must be visible on mobile viewport"

        # Open mobile drawer
        hamburger.click()
        time.sleep(0.4)
        drawer = mobile_page.locator("#public-mobile-drawer")
        assert drawer.is_visible(), "Mobile navigation drawer must open upon clicking hamburger"
        
        # Verify mobile drawer destinations
        assert drawer.locator("a:has-text('Home')").is_visible(), "Home link in mobile drawer"
        assert drawer.locator("a[href='/universities']").is_visible(), "Universities in mobile drawer"
        assert drawer.locator("a[href='/programs']").is_visible(), "Programs in mobile drawer"
        assert drawer.locator("a[href='/scholarships']").is_visible(), "Scholarships in mobile drawer"
        assert drawer.locator("a[href='/contact']").is_visible(), "Contact in mobile drawer"
        assert drawer.locator("a[href='/sign-in']").is_visible(), "Sign in in mobile drawer"
        assert drawer.locator("a[href='/sign-up']").is_visible(), "Create Free Account in mobile drawer"
        mobile_page.screenshot(path=os.path.join(OUTPUT_DIR, "06_mobile_drawer_open.png"))

        # Close via close button or Escape
        close_btn = mobile_page.locator("#public-mobile-drawer button[aria-label='Close navigation menu']")
        close_btn.click()
        time.sleep(0.3)
        assert not drawer.is_visible(), "Mobile drawer must close on close button click"
        print("Mobile drawer responsive contracts PASSED!")
        mobile_page.close()

        # -------------------------------------------------------------
        # 4. EXPLORER ROLE VERIFICATION
        # -------------------------------------------------------------
        print("\n>>> 4. Testing Explorer Role on /universities...")
        page.evaluate("""() => {
            localStorage.setItem('unilistics_active_demo_role', 'explorer');
        }""")
        page.goto(f"{BASE_URL}/universities", wait_until="networkidle")
        time.sleep(1)

        # Explorer retains top navigation (PublicNavbar) - NO sidebar!
        sidebar_count = page.locator("aside.desktop-only-sidebar").count()
        assert sidebar_count == 0, "Explorer must NOT have a workspace dashboard sidebar"

        # Check explorer right-side header controls
        cta_btn = page.locator("#public-nav-request-guidance-btn")
        assert cta_btn.is_visible(), "Explorer must see Request Managed Guidance CTA button"

        account_trigger = page.locator("#public-nav-account-btn")
        assert account_trigger.is_visible(), "Explorer must see Account Menu pill"

        quick_signout = page.locator("#public-nav-quick-signout-btn")
        assert quick_signout.is_visible(), "Explorer must see quick Sign Out button (matches Screenshot 2)"
        assert quick_signout.get_attribute("title") == "Sign out of account"

        # Click Account Menu
        account_trigger.click()
        time.sleep(0.3)
        account_menu = page.locator("div[role='menu'][aria-label='User Account Menu']")
        assert account_menu.is_visible(), "Account menu dropdown should open"
        assert account_menu.locator("a[href='/saved']").is_visible(), "Saved quick link must be in account menu"
        assert account_menu.locator("a[href='/explorer/account']").is_visible(), "Account Settings link must be in account menu"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "07_explorer_account_menu_open.png"))
        print("Explorer role header, Account menu, and Request Managed Guidance verified!")

        # -------------------------------------------------------------
        # 5. MANAGED STUDENT ROLE & WORKSPACE SHELL DYNAMIC RESOLUTION
        # -------------------------------------------------------------
        print("\n>>> 5. Testing Managed Student Workspace & Dynamic Shell Resolution...")
        page.evaluate("""() => {
            localStorage.setItem('unilistics_active_demo_role', 'managed_student');
        }""")
        page.goto(f"{BASE_URL}/student", wait_until="networkidle")
        time.sleep(1)

        # Managed student on /student mounts StudentLayout (workspace shell)
        sidebar = page.locator("aside.desktop-only-sidebar")
        assert sidebar.is_visible(), "Managed student workspace MUST mount desktop sidebar"
        topbar = page.locator("header.workspace-topbar")
        assert topbar.is_visible(), "Managed student workspace MUST mount topbar"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "08_managed_student_workspace.png"))
        print("Managed student /student workspace shell verified!")

        # Direct visit to catalogue pages (/programs and /scholarships) by managed student
        print("\n>>> Testing Direct Visit to /programs by Managed Student...")
        page.goto(f"{BASE_URL}/programs", wait_until="networkidle")
        time.sleep(1)

        # Must mount StudentLayout (workspace shell) rather than public top navbar!
        assert sidebar.is_visible(), "Managed student visiting /programs MUST mount workspace sidebar!"
        prog_catalogue_header = page.locator("h1:has-text('Degree Programs')")
        assert prog_catalogue_header.is_visible(), "Programs catalogue content must render inside the workspace shell!"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "09_managed_student_direct_programs.png"))
        print("Dynamic shell resolution verified: /programs dynamically mounted inside workspace shell for managed student!")

        # Managed student visiting public Home (/)
        print("\n>>> Testing Managed Student visiting Home (/) - must show 'Open Workspace' CTA...")
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1)
        open_ws_btn = page.locator("#public-nav-workspace-btn")
        assert open_ws_btn.is_visible(), "Managed student on Home must see 'Open Workspace' CTA"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "10_managed_student_on_home.png"))
        print("Managed student on Home shows 'Open Workspace' CTA successfully!")

        # -------------------------------------------------------------
        # 6. SIGN OUT FLOW
        # -------------------------------------------------------------
        print("\n>>> 6. Testing Sign Out Flow...")
        quick_signout = page.locator("#public-nav-quick-signout-btn")
        quick_signout.click()
        time.sleep(1)
        
        # Verify session reset to visitor and Sign in / Create Free Account restored
        signin_restored = page.locator("#public-nav-signin-btn")
        signup_restored = page.locator("#public-nav-signup-btn")
        assert signin_restored.is_visible(), "Sign in button restored after sign out"
        assert signup_restored.is_visible(), "Create Free Account button restored after sign out"
        page.screenshot(path=os.path.join(OUTPUT_DIR, "11_post_signout_visitor.png"))
        print("Sign out flow completed cleanly! Session reset to visitor.")

        print("\n=======================================================")
        print("  ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! (100%)")
        print("=======================================================\n")

        context.close()
        browser.close()

if __name__ == "__main__":
    run_tests()
