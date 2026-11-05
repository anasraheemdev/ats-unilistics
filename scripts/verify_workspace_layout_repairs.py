import os
import sys
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.environ.get("VERIFICATION_OUTPUT_DIR", r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"

ROUTES_TO_TEST = [
    ("/student/applications", "Applications"),
    ("/student/journey", "Journey"),
    ("/student/documents", "Documents"),
    ("/student/tasks", "Tasks"),
    ("/student/messages", "Messages"),
    ("/student/account", "Settings"),
    ("/student/explore", "Explore Discovery"),
]

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        print("==================================================================")
        print("TEST 1: Multi-Route Workspace Shell Verification (Expanded & Collapsed)")
        print("==================================================================")
        
        # We test both expanded and collapsed for each route
        for collapsed in [False, True]:
            state_label = "Collapsed (76px)" if collapsed else "Expanded (256px)"
            expected_sidebar_width = 76 if collapsed else 256
            
            for path, title in ROUTES_TO_TEST:
                context = browser.new_context(viewport={"width": 1280, "height": 800})
                page = context.new_page()
                
                # Pre-seed auth & collapsed state
                page.goto(f"{BASE_URL}/", wait_until="commit")
                page.evaluate(f"""() => {{
                    localStorage.setItem('unilistics_active_demo_role', 'managed_student');
                    localStorage.setItem('unilistics_sidebar_collapsed', '{str(collapsed).lower()}');
                }}""")
                
                # Navigate to target route
                page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
                time.sleep(0.4)
                
                # 1. Inspect Sidebar positioning & dimensions
                sidebar = page.locator("aside.desktop-only-sidebar")
                assert sidebar.is_visible(), f"Sidebar must be visible on {path}"
                
                sb_box = sidebar.bounding_box()
                assert sb_box is not None, f"Could not get bounding box for sidebar on {path}"
                
                # Assert sidebar top is at viewport y=0, height is full viewport
                print(f"[{state_label}] {title} ({path}):")
                print(f"  Sidebar x={sb_box['x']:.1f}, y={sb_box['y']:.1f}, w={sb_box['width']:.1f}, h={sb_box['height']:.1f}")
                assert abs(sb_box['y']) < 1.0, f"Sidebar top must be at y=0, got {sb_box['y']}"
                assert abs(sb_box['x']) < 1.0, f"Sidebar left must be at x=0, got {sb_box['x']}"
                assert abs(sb_box['height'] - 800) < 2.0, f"Sidebar height must be 100dvh (800px), got {sb_box['height']}"
                assert abs(sb_box['width'] - expected_sidebar_width) < 5.0, f"Sidebar width expected ~{expected_sidebar_width}px, got {sb_box['width']}"
                
                # 2. Inspect Topbar positioning & dimensions
                topbar = page.locator("header.workspace-topbar")
                assert topbar.is_visible(), f"Topbar must be visible on {path}"
                tb_box = topbar.bounding_box()
                print(f"  Topbar x={tb_box['x']:.1f}, y={tb_box['y']:.1f}, w={tb_box['width']:.1f}, h={tb_box['height']:.1f}")
                assert abs(tb_box['y']) < 1.0, f"Topbar top must be at y=0, got {tb_box['y']}"
                assert abs(tb_box['x'] - sb_box['width']) < 2.0, f"Topbar left must start at sidebar right edge ({sb_box['width']}px), got {tb_box['x']}"
                assert abs(tb_box['height'] - 64) < 2.0, f"Topbar height must be 64px, got {tb_box['height']}"
                
                # 3. Inspect Breadcrumbs & assert left edge is beyond sidebar's right edge
                breadcrumb = page.locator("nav[aria-label='Breadcrumb']")
                assert breadcrumb.is_visible(), f"Breadcrumb must be visible on {path}"
                bc_box = breadcrumb.bounding_box()
                print(f"  Breadcrumb x={bc_box['x']:.1f}, y={bc_box['y']:.1f}, w={bc_box['width']:.1f}, h={bc_box['height']:.1f}")
                assert bc_box['x'] >= sb_box['x'] + sb_box['width'], (
                    f"Breadcrumb left ({bc_box['x']}px) must be beyond sidebar right edge "
                    f"({sb_box['x'] + sb_box['width']}px) on {path}"
                )
                
                # 4. Scroll main content to bottom and assert stationary sidebar & visible brand/footer
                main_scroller = page.locator(".workspace-main-content")
                main_scroller.evaluate("el => el.scrollTop = el.scrollHeight")
                time.sleep(0.3)
                
                # Re-verify sidebar after scroll
                sb_box_after = sidebar.bounding_box()
                assert abs(sb_box_after['y']) < 1.0, f"Sidebar must not move when page scrolls, got y={sb_box_after['y']}"
                
                # Check brand icon/wordmark visibility
                if collapsed:
                    brand = page.locator("aside.desktop-only-sidebar img[alt='Unilistics']").first
                else:
                    brand = page.locator("aside.desktop-only-sidebar img[alt='unilistics mark']").first
                assert brand.is_visible(), "Brand logo icon must remain visible after scroll"
                
                # Check account/logout footer visibility
                logout_btn = page.locator("aside.desktop-only-sidebar button[aria-label*='Sign out']")
                assert logout_btn.is_visible(), "Sidebar account footer must remain visible after scroll"
                
                # Save screenshot for Applications and Journey
                if path in ["/student/applications", "/student/journey"]:
                    name_slug = "applications" if "applications" in path else "journey"
                    sc_path = os.path.join(OUTPUT_DIR, f"{name_slug}_{'collapsed' if collapsed else 'expanded'}.png")
                    page.screenshot(path=sc_path)
                    print(f"  -> Captured screenshot: {sc_path}")
                
                context.close()
                
        print("\nAll route scroll and breadcrumb clearance checks PASSED!\n")

        print("==================================================================")
        print("TEST 2: 1023px vs 1024px Responsive Shell Contract")
        print("==================================================================")
        # Check 1024px: Desktop shell active
        ctx_1024 = browser.new_context(viewport={"width": 1024, "height": 768})
        p_1024 = ctx_1024.new_page()
        p_1024.goto(f"{BASE_URL}/", wait_until="commit")
        p_1024.evaluate("() => localStorage.setItem('unilistics_active_demo_role', 'managed_student')")
        p_1024.goto(f"{BASE_URL}/student/applications", wait_until="networkidle")
        time.sleep(0.3)
        
        sb_1024 = p_1024.locator("aside.desktop-only-sidebar")
        dock_1024 = p_1024.locator(".mobile-only-dock")
        assert sb_1024.is_visible(), "At 1024px desktop sidebar must be VISIBLE"
        assert not dock_1024.is_visible(), "At 1024px mobile dock must be HIDDEN"
        p_1024.screenshot(path=os.path.join(OUTPUT_DIR, "breakpoint_1024px_desktop.png"))
        print("At 1024px: Sidebar VISIBLE, Mobile Dock HIDDEN -> PASSED")
        ctx_1024.close()
        
        # Check 1023px: Mobile layout active
        ctx_1023 = browser.new_context(viewport={"width": 1023, "height": 768})
        p_1023 = ctx_1023.new_page()
        p_1023.goto(f"{BASE_URL}/", wait_until="commit")
        p_1023.evaluate("() => localStorage.setItem('unilistics_active_demo_role', 'managed_student')")
        p_1023.goto(f"{BASE_URL}/student/applications", wait_until="networkidle")
        time.sleep(0.3)
        
        sb_1023 = p_1023.locator("aside.desktop-only-sidebar")
        dock_1023 = p_1023.locator(".mobile-only-dock")
        assert not sb_1023.is_visible(), "At 1023px desktop sidebar must be HIDDEN"
        assert dock_1023.is_visible(), "At 1023px mobile dock must be VISIBLE"
        
        # Check topbar width and left at 1023px
        tb_1023 = p_1023.locator("header.workspace-topbar")
        tb_box_1023 = tb_1023.bounding_box()
        assert abs(tb_box_1023['x']) < 1.0, f"Topbar left must be 0 on mobile, got {tb_box_1023['x']}"
        assert abs(tb_box_1023['width'] - 1023) < 2.0, f"Topbar must span full width (1023px), got {tb_box_1023['width']}"
        p_1023.screenshot(path=os.path.join(OUTPUT_DIR, "breakpoint_1023px_mobile.png"))
        print("At 1023px: Sidebar HIDDEN, Mobile Dock VISIBLE, Topbar full width -> PASSED\n")
        ctx_1023.close()

        print("==================================================================")
        print("TEST 3: Short Desktop Height (1280x480)")
        print("==================================================================")
        ctx_short = browser.new_context(viewport={"width": 1280, "height": 480})
        p_short = ctx_short.new_page()
        p_short.goto(f"{BASE_URL}/", wait_until="commit")
        p_short.evaluate("() => localStorage.setItem('unilistics_active_demo_role', 'managed_student')")
        p_short.goto(f"{BASE_URL}/student/journey", wait_until="networkidle")
        time.sleep(0.3)
        
        sb_short = p_short.locator("aside.desktop-only-sidebar")
        brand_short = sb_short.locator("img[alt='unilistics mark']").first
        footer_short = sb_short.locator("button[aria-label*='Sign out']")
        nav_short = sb_short.locator("nav")
        
        assert brand_short.is_visible(), "Brand must remain visible on short desktop"
        assert footer_short.is_visible(), "Footer must remain visible on short desktop"
        
        # Check nav scrollable
        is_scrollable = nav_short.evaluate("el => el.scrollHeight > el.clientHeight")
        print(f"Short height navigation internal scrollable: {is_scrollable}")
        assert is_scrollable, "Navigation region should become scrollable on short viewport"
        p_short.screenshot(path=os.path.join(OUTPUT_DIR, "short_desktop_480h.png"))
        print("Short desktop height checks -> PASSED\n")
        ctx_short.close()

        print("==================================================================")
        print("TEST 4: 200% Zoom / High DPI Simulation")
        print("==================================================================")
        ctx_zoom = browser.new_context(viewport={"width": 1280, "height": 800}, device_scale_factor=2.0)
        p_zoom = ctx_zoom.new_page()
        p_zoom.goto(f"{BASE_URL}/", wait_until="commit")
        p_zoom.evaluate("() => localStorage.setItem('unilistics_active_demo_role', 'managed_student')")
        p_zoom.goto(f"{BASE_URL}/student/journey", wait_until="networkidle")
        time.sleep(0.3)
        
        sb_zoom = p_zoom.locator("aside.desktop-only-sidebar")
        bc_zoom = p_zoom.locator("nav[aria-label='Breadcrumb']")
        sb_z_box = sb_zoom.bounding_box()
        bc_z_box = bc_zoom.bounding_box()
        
        assert bc_z_box['x'] >= sb_z_box['x'] + sb_z_box['width'], (
            f"Breadcrumb ({bc_z_box['x']}px) must not overlap sidebar ({sb_z_box['width']}px) at 200% zoom"
        )
        p_zoom.screenshot(path=os.path.join(OUTPUT_DIR, "zoom_200_journey.png"))
        print("200% zoom check -> PASSED\n")
        ctx_zoom.close()

        print("==================================================================")
        print("TEST 5: Navigation Between Public and Managed Layouts (Body Overflow Restoration)")
        print("==================================================================")
        ctx_nav = browser.new_context(viewport={"width": 1280, "height": 800})
        p_nav = ctx_nav.new_page()
        p_nav.goto(f"{BASE_URL}/", wait_until="commit")
        p_nav.evaluate("() => localStorage.setItem('unilistics_active_demo_role', 'managed_student')")
        
        # 1. Inside managed student shell
        p_nav.goto(f"{BASE_URL}/student/applications", wait_until="networkidle")
        time.sleep(0.3)
        overflow_managed = p_nav.evaluate("() => document.body.style.overflow")
        print(f"Managed workspace body overflow: '{overflow_managed}' (Expected: 'hidden')")
        assert overflow_managed == 'hidden', f"Body overflow should be 'hidden' in managed shell, got '{overflow_managed}'"
        
        # 2. Navigate to public page
        p_nav.goto(f"{BASE_URL}/contact", wait_until="networkidle")
        time.sleep(0.3)
        overflow_public = p_nav.evaluate("() => document.body.style.overflow")
        print(f"Public page body overflow: '{overflow_public}' (Expected: '')")
        assert overflow_public == '', f"Body overflow must be restored on public pages, got '{overflow_public}'"
        
        # 3. Navigate back to managed workspace
        p_nav.goto(f"{BASE_URL}/student/journey", wait_until="networkidle")
        time.sleep(0.3)
        overflow_returned = p_nav.evaluate("() => document.body.style.overflow")
        print(f"Returned to managed workspace body overflow: '{overflow_returned}' (Expected: 'hidden')")
        assert overflow_returned == 'hidden', f"Body overflow should be 'hidden' after re-entering shell, got '{overflow_returned}'"
        
        print("Body overflow cleanup and restoration checks -> PASSED\n")
        ctx_nav.close()

        print("==================================================================")
        print("TEST 6: Browser Refresh & Collapsed State Persistence")
        print("==================================================================")
        ctx_pers = browser.new_context(viewport={"width": 1280, "height": 800})
        p_pers = ctx_pers.new_page()
        p_pers.goto(f"{BASE_URL}/", wait_until="commit")
        p_pers.evaluate("""() => {
            localStorage.setItem('unilistics_active_demo_role', 'managed_student');
            localStorage.setItem('unilistics_sidebar_collapsed', 'false');
        }""")
        p_pers.goto(f"{BASE_URL}/student/applications", wait_until="networkidle")
        time.sleep(0.3)
        
        # Click toggle collapse button
        toggle_btn = p_pers.locator("button[aria-label='Collapse sidebar']")
        assert toggle_btn.is_visible(), "Collapse button should be visible in expanded sidebar"
        toggle_btn.click()
        time.sleep(0.3)
        
        # Check sidebar width collapsed
        sb_pers = p_pers.locator("aside.desktop-only-sidebar")
        box_collapsed = sb_pers.bounding_box()
        assert abs(box_collapsed['width'] - 76) < 5, f"Sidebar should collapse to 76px, got {box_collapsed['width']}"
        
        # Refresh browser
        p_pers.reload(wait_until="networkidle")
        time.sleep(0.3)
        
        # Re-check sidebar width after refresh
        sb_reloaded = p_pers.locator("aside.desktop-only-sidebar")
        box_reloaded = sb_reloaded.bounding_box()
        assert abs(box_reloaded['width'] - 76) < 5, f"Sidebar should remain collapsed (76px) after refresh, got {box_reloaded['width']}"
        print("Refresh & persistence check -> PASSED\n")
        ctx_pers.close()

        browser.close()
        print("==================================================================")
        print("ALL VERIFICATION SUITES AND REGRESSION CHECKS PASSED PERFECTLY!")
        print("==================================================================")

if __name__ == "__main__":
    run_tests()
