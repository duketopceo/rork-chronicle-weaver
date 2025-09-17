from playwright.sync_api import sync_playwright, expect, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        print("Navigating to http://localhost:8081...")
        page.goto("http://localhost:8081", timeout=60000)

        print(f"Page title: {page.title()}")

        # Wait for the main content to be visible
        print("Waiting for 'Begin New Chronicle' button...")
        expect(page.get_by_role("button", name="Begin New Chronicle")).to_be_visible(timeout=30000)

        # Take a screenshot on success
        page.screenshot(path="jules-scratch/verification/verification-success.png")
        print("✅ Frontend verification successful: Screenshot captured.")

    except TimeoutError as e:
        print(f"❌ Frontend verification failed with TimeoutError: {e}")
        print("Page content at time of failure:")
        print(page.content())
        page.screenshot(path="jules-scratch/verification/verification-failure.png")
        print("📸 Screenshot of failure saved to jules-scratch/verification/verification-failure.png")

    except Exception as e:
        print(f"❌ Frontend verification failed with an unexpected error: {e}")
        page.screenshot(path="jules-scratch/verification/verification-failure.png")
        print("📸 Screenshot of failure saved to jules-scratch/verification/verification-failure.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
