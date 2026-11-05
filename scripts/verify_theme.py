import asyncio
from playwright.async_api import async_playwright

async def verify_theme():
    async with async_playwright() as p:
        # Launch browser with dark color scheme preference to simulate dark OS
        browser = await p.chromium.launch()
        context = await browser.new_context(
            color_scheme='dark', # Simulates OS dark mode
            viewport={'width': 1440, 'height': 900}
        )
        page = await context.new_page()

        print("Navigating to http://localhost:5173/ with color_scheme='dark'...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("networkidle")

        # 1. Check data-theme and dark class on <html>
        data_theme = await page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        has_dark_class = await page.evaluate("() => document.documentElement.classList.contains('dark')")
        print(f"Initial on dark OS -> data-theme: {data_theme}, has dark class: {has_dark_class}")
        assert data_theme == "light", f"Expected 'light', got '{data_theme}'"
        assert not has_dark_class, "Expected no 'dark' class"

        # 2. Check theme toggle button
        toggle_btn = page.locator("#theme-toggle-btn")
        await toggle_btn.wait_for(state="visible")
        aria_label = await toggle_btn.get_attribute("aria-label")
        print(f"Theme toggle button aria-label: {aria_label}")
        assert "Switch to dark" in aria_label, f"Expected 'Switch to dark...', got '{aria_label}'"

        # Capture light mode screenshot of top of homepage
        await page.screenshot(path="C:/Users/anasr/.gemini/antigravity/brain/c726d5ee-f5a8-4b8e-9d70-8bf2e76b80d7/screenshots/default_theme_light_1440.png")
        print("Captured default_theme_light_1440.png")

        # 3. Click toggle button to switch to dark
        await toggle_btn.click()
        await page.wait_for_timeout(300)
        data_theme_after_toggle = await page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        has_dark_class_after_toggle = await page.evaluate("() => document.documentElement.classList.contains('dark')")
        stored_theme = await page.evaluate("() => localStorage.getItem('unilistics-theme')")
        print(f"After 1 click -> data-theme: {data_theme_after_toggle}, has dark class: {has_dark_class_after_toggle}, localStorage: {stored_theme}")
        assert data_theme_after_toggle == "dark", f"Expected 'dark', got '{data_theme_after_toggle}'"
        assert has_dark_class_after_toggle, "Expected 'dark' class after toggle"

        # 4. Click toggle button again to switch back to light
        await toggle_btn.click()
        await page.wait_for_timeout(300)
        data_theme_back = await page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        has_dark_class_back = await page.evaluate("() => document.documentElement.classList.contains('dark')")
        stored_theme_back = await page.evaluate("() => localStorage.getItem('unilistics-theme')")
        print(f"After 2nd click -> data-theme: {data_theme_back}, has dark class: {has_dark_class_back}, localStorage: {stored_theme_back}")
        assert data_theme_back == "light", f"Expected 'light', got '{data_theme_back}'"
        assert not has_dark_class_back, "Expected no 'dark' class"

        # 5. Reload page to verify persistence of light choice
        await page.reload()
        await page.wait_for_load_state("networkidle")
        reloaded_theme = await page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        print(f"After reload -> data-theme: {reloaded_theme}")
        assert reloaded_theme == "light", f"Expected 'light' after reload, got '{reloaded_theme}'"

        await browser.close()
        print("ALL DEFAULT LIGHT THEME VERIFICATIONS PASSED!")

if __name__ == '__main__':
    asyncio.run(verify_theme())
