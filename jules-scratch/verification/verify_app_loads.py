from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Navigate to the application
        page.goto("http://localhost:8081", timeout=60000)

        # Wait for the main content to be visible
        # We'll look for the "Begin New Chronicle" button as a sign that the app has loaded
        expect(page.get_by_role("button", name="Begin New Chronicle")).to_be_visible(timeout=30000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        print("✅ Frontend verification successful: Screenshot captured.")
    except Exception as e:
        print(f"❌ Frontend verification failed: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
