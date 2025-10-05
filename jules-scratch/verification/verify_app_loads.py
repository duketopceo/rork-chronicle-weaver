from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:8081...")
            page.goto("http://localhost:8081", timeout=120000)
            print("Navigation complete. Waiting for 'Sign In' text...")
            # Wait for a specific element that indicates the app has loaded
            expect(page.get_by_text("Sign In")).to_be_visible(timeout=60000)
            print("'Sign In' text found.")
        except Exception as e:
            print(f"An error occurred: {e}")
            print("Taking a screenshot of the current page.")
            print("Page content:")
            print(page.content())
        finally:
            page.screenshot(path="jules-scratch/verification/verification.png")
            print("Screenshot taken successfully.")
            browser.close()

if __name__ == "__main__":
    run_verification()