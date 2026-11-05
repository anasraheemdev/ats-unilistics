import os
import sys
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = r"C:\Users\anasr\.gemini\antigravity-ide\brain\60168ccb-d53e-46ca-ad4c-76afd146978a\screenshots"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to http://localhost:5173/...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.wait_for_timeout(1500)

        # ----------------------------------------------------
        # 1. LIGHT MODE CAPTURES
        # ----------------------------------------------------
        print("Testing Light Mode...")
        page.evaluate("""() => {
            localStorage.setItem('unilistics-theme', 'light');
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.classList.remove('dark');
        }""")
        page.wait_for_timeout(800)

        # 1.1 Capture Exploration vs Managed ("Your journey. Your choice.")
        choice_sec = page.locator("#exploration-vs-managed-section")
        if choice_sec.count() > 0:
            choice_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            choice_path = os.path.join(SCREENSHOTS_DIR, "light_mode_choice_section.png")
            choice_sec.screenshot(path=choice_path)
            print(f"Captured light mode choice section: {choice_path}")

        # 1.2 Capture FAQ Section
        faq_sec = page.locator("#faq-section")
        if faq_sec.count() > 0:
            faq_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            faq_path = os.path.join(SCREENSHOTS_DIR, "light_mode_faq_section.png")
            faq_sec.screenshot(path=faq_path)
            print(f"Captured light mode FAQ section: {faq_path}")

        # 1.3 Capture New Chapter CTA Section ("A new chapter. One simple step.")
        cta_sec = page.locator("#new-chapter-cta-section")
        if cta_sec.count() > 0:
            cta_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            cta_path = os.path.join(SCREENSHOTS_DIR, "light_mode_cta_collage_section.png")
            cta_sec.screenshot(path=cta_path)
            print(f"Captured light mode CTA section: {cta_path}")

        # ----------------------------------------------------
        # 2. DARK MODE CAPTURES
        # ----------------------------------------------------
        print("Testing Dark Mode...")
        page.evaluate("""() => {
            localStorage.setItem('unilistics-theme', 'dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark');
        }""")
        page.wait_for_timeout(800)

        # 2.1 Capture Exploration vs Managed in Dark Mode
        if choice_sec.count() > 0:
            choice_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            dark_choice_path = os.path.join(SCREENSHOTS_DIR, "dark_mode_choice_section.png")
            choice_sec.screenshot(path=dark_choice_path)
            print(f"Captured dark mode choice section: {dark_choice_path}")

        # 2.2 Capture FAQ Section in Dark Mode (with second question opened)
        if faq_sec.count() > 0:
            faq_sec.scroll_into_view_if_needed()
            # Click on second question trigger
            triggers = page.locator(".faq-trigger")
            if triggers.count() > 1:
                triggers.nth(1).click()
                page.wait_for_timeout(500)
            dark_faq_path = os.path.join(SCREENSHOTS_DIR, "dark_mode_faq_section.png")
            faq_sec.screenshot(path=dark_faq_path)
            print(f"Captured dark mode FAQ section: {dark_faq_path}")

        # 2.3 Capture New Chapter CTA Section in Dark Mode
        if cta_sec.count() > 0:
            cta_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            dark_cta_path = os.path.join(SCREENSHOTS_DIR, "dark_mode_cta_collage_section.png")
            cta_sec.screenshot(path=dark_cta_path)
            print(f"Captured dark mode CTA section: {dark_cta_path}")

        browser.close()
        print("All visual verification captures completed successfully!")

if __name__ == "__main__":
    verify()
