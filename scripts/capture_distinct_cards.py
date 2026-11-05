import os
import time
from playwright.sync_api import sync_playwright

output_dir = r"C:\Users\anasr\.gemini\antigravity\brain\c726d5ee-f5a8-4b8e-9d70-8bf2e76b80d7\screenshots"
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1200})
    page.goto("http://localhost:5173/", wait_until="networkidle")
    time.sleep(1.0)
    
    # 1. Capture isolated Polimi card and universities view
    card_uni = page.locator(".opportunity-card-hover").first
    card_uni.scroll_into_view_if_needed()
    time.sleep(0.5)
    card_uni.screenshot(path=os.path.join(output_dir, "card_polimi_full.png"))
    page.screenshot(path=os.path.join(output_dir, "01_explore_opportunities_desktop.png"))
    print("Captured card_polimi_full.png and 01_explore_opportunities_desktop.png")
    
    # 2. Switch to Scholarships tab and capture isolated scholarship card
    sch_tab = page.locator("button:has-text('Explore Scholarships')")
    sch_tab.click()
    time.sleep(0.6)
    card_sch = page.locator(".opportunity-card-hover").first
    card_sch.scroll_into_view_if_needed()
    time.sleep(0.5)
    card_sch.screenshot(path=os.path.join(output_dir, "card_scholarship_full.png"))
    page.screenshot(path=os.path.join(output_dir, "02_explore_scholarships_tab.png"))
    print("Captured card_scholarship_full.png and 02_explore_scholarships_tab.png")
    
    # 3. Switch to Professors tab and capture isolated professor card
    prof_tab = page.locator("button:has-text('Explore Professors & Research')")
    prof_tab.click()
    time.sleep(0.6)
    card_prof = page.locator(".opportunity-card-hover").first
    card_prof.scroll_into_view_if_needed()
    time.sleep(0.5)
    card_prof.screenshot(path=os.path.join(output_dir, "card_professor_full.png"))
    page.screenshot(path=os.path.join(output_dir, "03_explore_professors_tab.png"))
    print("Captured card_professor_full.png and 03_explore_professors_tab.png")
    
    browser.close()

