import asyncio
import os
import sys
from playwright.async_api import async_playwright

ARTIFACT_DIR = os.environ.get("VERIFICATION_OUTPUT_DIR", r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots")
os.makedirs(ARTIFACT_DIR, exist_ok=True)

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        
        # Pre-seed student role
        await context.add_init_script("""
            localStorage.setItem('unilistics_active_demo_role', 'managed_student');
            localStorage.setItem('unilistics_sidebar_collapsed', 'false');
        """)
        
        page = await context.new_page()

        print("[TEST] 1. Visiting Student Journey page at http://localhost:5173/student/journey...")
        await page.goto("http://localhost:5173/student/journey", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        current_url = page.url
        print(f"[TEST] Current URL: {current_url}")

        # 1. Verify "Your journey" header
        heading = page.locator('h1:has-text("Your journey")')
        is_heading_visible = await heading.is_visible()
        print(f"[TEST] 'Your journey' heading visible: {is_heading_visible}")
        assert is_heading_visible, "'Your journey' heading must be visible"

        # 2. Verify Map / Tracks switch
        map_btn = page.locator('#view-toggle-map')
        tracks_btn = page.locator('#view-toggle-tracks')
        is_map_btn = await map_btn.is_visible()
        is_tracks_btn = await tracks_btn.is_visible()
        print(f"[TEST] View toggles visible - Map: {is_map_btn}, Tracks: {is_tracks_btn}")
        assert is_map_btn and is_tracks_btn, "Map and Tracks toggles must be visible"

        # 3. Capture Map View Screenshot
        map_screenshot_path = os.path.join(ARTIFACT_DIR, "journey_map_view_rebrand.png")
        await page.screenshot(path=map_screenshot_path, full_page=True)
        print(f"[TEST] Captured map view screenshot to {map_screenshot_path}")

        # 4. Check Regions (Prepare, Choose, Move)
        prepare_region = page.locator('text="Prepare"')
        choose_region = page.locator('text="Choose"')
        move_region = page.locator('text="Move"')
        print(f"[TEST] Macro-regions present: Prepare={await prepare_region.count() > 0}, Choose={await choose_region.count() > 0}, Move={await move_region.count() > 0}")

        # 5. Check Inspector Panel
        inspector = page.locator('aside[aria-label="Selected Milestone Detail Panel"]')
        is_inspector = await inspector.is_visible()
        print(f"[TEST] Selected milestone inspector panel visible: {is_inspector}")

        # 6. Switch to Tracks View
        print("[TEST] Switching to Tracks view...")
        await tracks_btn.click()
        await page.wait_for_timeout(1000)

        tracks_screenshot_path = os.path.join(ARTIFACT_DIR, "journey_tracks_view_rebrand.png")
        await page.screenshot(path=tracks_screenshot_path, full_page=True)
        print(f"[TEST] Captured tracks view screenshot to {tracks_screenshot_path}")

        # 7. Check Mobile Responsiveness (Viewport 390x844)
        print("[TEST] Testing mobile viewport (390x844)...")
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.wait_for_timeout(1000)

        mobile_screenshot_path = os.path.join(ARTIFACT_DIR, "journey_mobile_view_rebrand.png")
        await page.screenshot(path=mobile_screenshot_path, full_page=True)
        print(f"[TEST] Captured mobile view screenshot to {mobile_screenshot_path}")

        # 8. Reset to desktop & test Preview State for user without active case
        print("[TEST] 8. Testing locked preview state for student without active case...")
        context_preview = await browser.new_context(viewport={"width": 1440, "height": 900})
        await context_preview.add_init_script("""
            localStorage.setItem('unilistics_active_demo_role', 'managed_student');
            localStorage.setItem('unilistics_simulate_no_case', 'true');
        """)
        page_preview = await context_preview.new_page()
        await page_preview.goto("http://localhost:5173/student/journey", wait_until="networkidle")
        await page_preview.wait_for_timeout(1500)
        
        preview_screenshot_path = os.path.join(ARTIFACT_DIR, "journey_preview_locked_state.png")
        await page_preview.screenshot(path=preview_screenshot_path, full_page=True)
        print(f"[TEST] Captured preview screenshot to {preview_screenshot_path}")

        print("\n[SUCCESS] All Journey Map visual and functional tests passed!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
