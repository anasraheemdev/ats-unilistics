import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\anasr\.gemini\antigravity\brain\c726d5ee-f5a8-4b8e-9d70-8bf2e76b80d7\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        print("Navigating to Homepage at 1440x900...")
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1.0)
        
        # 1. Desktop Horizontal Overflow Check
        scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
        client_width = page.evaluate("() => document.documentElement.clientWidth")
        print(f"Desktop Dimensions: scrollWidth={scroll_width}, clientWidth={client_width}")
        assert scroll_width <= client_width + 1, f"Horizontal overflow detected on Desktop: {scroll_width} > {client_width}"
        
        # 2. Explore Opportunities Section
        opp_section = page.locator("#explore-opportunities-section")
        opp_section.scroll_into_view_if_needed()
        time.sleep(0.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "01_explore_opportunities_desktop.png"))
        print("Captured 01_explore_opportunities_desktop.png")
        
        # Switch to Scholarships Tab
        scholarships_tab = page.locator("button:has-text('Explore Scholarships')")
        if scholarships_tab.is_visible():
            scholarships_tab.click()
            time.sleep(0.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "02_explore_scholarships_tab.png"))
            print("Captured 02_explore_scholarships_tab.png")
            
        # Switch to Professors & Research Tab
        prof_tab = page.locator("button:has-text('Explore Professors & Research')")
        if prof_tab.is_visible():
            prof_tab.click()
            time.sleep(0.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "03_explore_professors_tab.png"))
            print("Captured 03_explore_professors_tab.png")
            
        # 3. Partners Section
        partners_section = page.locator("#our-partners-section")
        partners_section.scroll_into_view_if_needed()
        time.sleep(0.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04_partners_marquee_desktop.png"))
        print("Captured 04_partners_marquee_desktop.png")
        
        # Open partner inspection modal (e.g., DAAD) - use dispatch_event('click') because marquee ticker scrolls horizontally
        daad_card = page.locator("button:has-text('DAAD')").first
        if daad_card.is_visible():
            daad_card.dispatch_event('click')
            time.sleep(0.6)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "05_partner_modal_daad.png"))
            print("Captured 05_partner_modal_daad.png")
            page.keyboard.press("Escape")
            time.sleep(0.5)
            
        # 4. Alumni Stories Section
        alumni_section = page.locator("#alumni-success-section")
        alumni_section.scroll_into_view_if_needed()
        time.sleep(0.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "06_alumni_stories_desktop.png"))
        print("Captured 06_alumni_stories_desktop.png")
        
        # Open Alumni full journey modal
        read_journey_btn = page.locator("button:has-text('Read Verified Journey')").first
        try:
            read_journey_btn.wait_for(state="visible", timeout=3000)
            read_journey_btn.dispatch_event('click')
            time.sleep(0.6)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "07_alumni_modal_journey.png"))
            print("Captured 07_alumni_modal_journey.png")
            page.keyboard.press("Escape")
            time.sleep(0.5)
        except Exception as e:
            print(f"Could not open alumni modal: {e}")
            
        # 5. Ambassadors Video Section
        ambassador_section = page.locator("#ambassadors-video-section")
        ambassador_section.scroll_into_view_if_needed()
        time.sleep(0.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "08_ambassadors_videos_desktop.png"))
        print("Captured 08_ambassadors_videos_desktop.png")
        
        # Open Ambassador Video Lightbox modal
        play_video_btn = page.locator("[aria-label^='Play video:']").first
        if play_video_btn.is_visible():
            play_video_btn.click(force=True)
            time.sleep(0.8)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "09_ambassador_video_modal.png"))
            print("Captured 09_ambassador_video_modal.png")
            close_btn = page.locator("button[aria-label='Close video modal']")
            if close_btn.is_visible():
                close_btn.click()
            else:
                page.keyboard.press("Escape")
            time.sleep(0.5)
            
        # Full Desktop Page
        page.screenshot(path=os.path.join(OUTPUT_DIR, "10_homepage_full_desktop.png"), full_page=True)
        print("Captured 10_homepage_full_desktop.png")
        page.close()
        
        # 6. Mobile Viewport (390x844)
        print("\nVerifying Mobile Viewport (390x844)...")
        page_m = browser.new_page(viewport={"width": 390, "height": 844})
        page_m.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1.0)
        
        m_scroll_width = page_m.evaluate("() => document.documentElement.scrollWidth")
        m_client_width = page_m.evaluate("() => document.documentElement.clientWidth")
        print(f"Mobile Dimensions: scrollWidth={m_scroll_width}, clientWidth={m_client_width}")
        assert m_scroll_width <= m_client_width + 1, f"Horizontal overflow detected on Mobile: {m_scroll_width} > {m_client_width}"
        
        # Mobile Opportunities
        page_m.locator("#explore-opportunities-section").scroll_into_view_if_needed()
        time.sleep(0.4)
        page_m.screenshot(path=os.path.join(OUTPUT_DIR, "11_mobile_opportunities.png"))
        print("Captured 11_mobile_opportunities.png")
        
        # Mobile Partners
        page_m.locator("#our-partners-section").scroll_into_view_if_needed()
        time.sleep(0.4)
        page_m.screenshot(path=os.path.join(OUTPUT_DIR, "12_mobile_partners.png"))
        print("Captured 12_mobile_partners.png")
        
        # Mobile Alumni
        page_m.locator("#alumni-success-section").scroll_into_view_if_needed()
        time.sleep(0.4)
        page_m.screenshot(path=os.path.join(OUTPUT_DIR, "13_mobile_alumni.png"))
        print("Captured 13_mobile_alumni.png")
        
        # Mobile Ambassadors
        page_m.locator("#ambassadors-video-section").scroll_into_view_if_needed()
        time.sleep(0.4)
        page_m.screenshot(path=os.path.join(OUTPUT_DIR, "14_mobile_ambassadors.png"))
        print("Captured 14_mobile_ambassadors.png")
        
        page_m.close()
        browser.close()
        print("\nAll verification screenshots and overflow assertions passed successfully!")

if __name__ == "__main__":
    run_verification()
