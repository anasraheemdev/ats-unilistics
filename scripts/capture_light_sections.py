import asyncio
from playwright.async_api import async_playwright

async def capture_light_sections():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            color_scheme='dark', # Simulates OS dark mode
            viewport={'width': 1440, 'height': 900}
        )
        page = await context.new_page()
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("networkidle")

        # Scroll to Explore Opportunities
        opp_section = page.locator("#destinations-world-map")
        await opp_section.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)
        await page.screenshot(
            path="C:/Users/anasr/.gemini/antigravity/brain/c726d5ee-f5a8-4b8e-9d70-8bf2e76b80d7/screenshots/default_theme_light_opportunities.png"
        )

        # Scroll to Roadmap
        roadmap_section = page.locator("#journey-roadmap-section")
        await roadmap_section.scroll_into_view_if_needed()
        await page.wait_for_timeout(500)
        await page.screenshot(
            path="C:/Users/anasr/.gemini/antigravity/brain/c726d5ee-f5a8-4b8e-9d70-8bf2e76b80d7/screenshots/default_theme_light_roadmap.png"
        )

        await browser.close()
        print("Captured default_theme_light_opportunities.png and default_theme_light_roadmap.png successfully!")

if __name__ == '__main__':
    asyncio.run(capture_light_sections())
