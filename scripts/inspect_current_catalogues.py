import asyncio
import os
from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\anasr\.gemini\antigravity-ide\brain\57324783-76c0-481b-a80f-b54d1a876f7e\.tempmediaStorage"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # 1. Inspect as Guest on Desktop
        context_guest = await browser.new_context(viewport={"width": 1440, "height": 900})
        page_guest = await context_guest.new_page()

        print("[INSPECT] Visiting /programs as guest (desktop 1440x900)...")
        await page_guest.goto("http://localhost:5173/programs", wait_until="networkidle")
        await page_guest.wait_for_timeout(2000)
        await page_guest.screenshot(path=os.path.join(ARTIFACT_DIR, "current_programs_desktop_guest.png"), full_page=True)

        print("[INSPECT] Visiting /scholarships as guest (desktop 1440x900)...")
        await page_guest.goto("http://localhost:5173/scholarships", wait_until="networkidle")
        await page_guest.wait_for_timeout(2000)
        await page_guest.screenshot(path=os.path.join(ARTIFACT_DIR, "current_scholarships_desktop_guest.png"), full_page=True)

        # 2. Inspect as Authenticated Managed Student on Desktop
        context_student = await browser.new_context(viewport={"width": 1440, "height": 900})
        await context_student.add_init_script("""
            localStorage.setItem('unilistics_active_demo_role', 'managed_student');
            localStorage.setItem('unilistics_sidebar_collapsed', 'false');
        """)
        page_student = await context_student.new_page()

        print("[INSPECT] Visiting /programs as managed student (desktop 1440x900)...")
        await page_student.goto("http://localhost:5173/programs", wait_until="networkidle")
        await page_student.wait_for_timeout(2000)
        await page_student.screenshot(path=os.path.join(ARTIFACT_DIR, "current_programs_desktop_student.png"), full_page=True)

        print("[INSPECT] Visiting /scholarships as managed student (desktop 1440x900)...")
        await page_student.goto("http://localhost:5173/scholarships", wait_until="networkidle")
        await page_student.wait_for_timeout(2000)
        await page_student.screenshot(path=os.path.join(ARTIFACT_DIR, "current_scholarships_desktop_student.png"), full_page=True)

        # 3. Inspect as Mobile Guest (390x844)
        context_mobile = await browser.new_context(viewport={"width": 390, "height": 844})
        page_mobile = await context_mobile.new_page()

        print("[INSPECT] Visiting /programs on mobile (390x844)...")
        await page_mobile.goto("http://localhost:5173/programs", wait_until="networkidle")
        await page_mobile.wait_for_timeout(2000)
        await page_mobile.screenshot(path=os.path.join(ARTIFACT_DIR, "current_programs_mobile.png"), full_page=True)

        print("[INSPECT] Visiting /scholarships on mobile (390x844)...")
        await page_mobile.goto("http://localhost:5173/scholarships", wait_until="networkidle")
        await page_mobile.wait_for_timeout(2000)
        await page_mobile.screenshot(path=os.path.join(ARTIFACT_DIR, "current_scholarships_mobile.png"), full_page=True)

        print("[INSPECT] Finished capturing diagnostic screenshots.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect())
