/*
Jest Vs Puppeteer Vs jest-puppeteer
------------------------------------
Recommendation
If Your Goal is...
Unit or Component Testing: Use Jest.

Example: Testing a function or a React component.
Tools: Jest + React Testing Library (if working with React).
End-to-End (E2E) Testing: Use Jest-Puppeteer.

Example: Testing how a user interacts with your website (clicking buttons, navigating, etc.).
Tools: Jest + Puppeteer via Jest-Puppeteer.
Automating Browser-Specific Tasks: Use Puppeteer.

Example: Testing browser features, web scraping, or visual regression testing.
Tools: Puppeteer as a standalone tool.


Unit Tests:

Focus on individual functions or modules.
Example: Test a calculateTotalPrice function with various inputs.

describe('calculateTotalPrice', () => {
  it('should calculate the correct total price', () => {
    expect(calculateTotalPrice([10, 20, 30])).toBe(60);
  });
});


Integration Tests:

Test how multiple components interact with each other.
Example: Test the integration between a frontend form and an API.

describe('Add Product API Integration', () => {
  it('should add a product and return success', async () => {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ id: '123', name: 'Test Product' }),
    });
    const result = await response.json();
    expect(result.success).toBe(true);
  });
});
E2E Tests:

Simulate real user actions and test full workflows.
Example: Automate a user's journey from login to checkout.

describe('User Checkout Workflow', () => {
  it('should complete the checkout process', async () => {
    await page.goto('https://example.com');
    await page.type('#username', 'testuser');
    await page.type('#password', 'password');
    await page.click('#login-button');
    await page.waitForNavigation();
    await page.click('#add-to-cart');
    await page.click('#checkout');
    expect(await page.$('#confirmation')).not.toBeNull();
  });
});
 */

/*
Comparison: Puppeteer vs. Jest-Puppeteer
Feature	                            Puppeteer	                                    Jest-Puppeteer
Browser Automation	                ✔️ Full control over the browser.	        ✔️ Built on Puppeteer.
Testing Framework	                ❌ Not included.	                        ✔️ Integrated with Jest.
Assertions	                        ❌ Requires manual setup (e.g., Chai).	    ✔️ Jest's expect is built-in.
Mocks and Spies	                    ❌ Requires setup.	                        ✔️ Jest provides mocking tools.
Parallel Execution	                ❌ Manual setup needed.	                    ✔️ Supported via Jest.
Configuration Simplicity	        ❌ Requires manual browser lifecycle.	    ✔️ Automated setup.

 */
const puppeteer = require('puppeteer');

// End-to-End testing
// not unit testing
describe('Checkout Page', () => {
    let browser;
    let page;

    // beforeAll(async () => {
    //     browser = await puppeteer.launch();
    //     page = await browser.newPage();
    // });

    // will open the browser to check user interactions
    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: false,  // This will make the browser visible
            slowMo: 50,  // Slows down Puppeteer operations by 50ms, making it easier to see what's happening
        });
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });  // Set the browser window size
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should load checkout page', async () => {
        await page.goto('http://localhost:3000/user/1/checkout?items=111,345,999,456,100,45610');
        await page.waitForSelector('h1');
        const title = await page.$eval('h1', el => el.textContent);
        expect(title).toBe('Checkout');
    });

    test('should display cart items', async () => {
        const cartItems = await page.$$('.cart-item');
        expect(cartItems.length).toBeGreaterThan(0);
    });

    test('should allow email input', async () => {
        await page.type('input[name="email"]', 'test@example.com');
        const emailValue = await page.$eval('input[name="email"]', el => el.value);
        expect(emailValue).toBe('test@example.com');
    });

    test('should allow payment method selection', async () => {
        await page.select('select[name="payment"]', 'credit');
        const selectedValue = await page.$eval('select[name="payment"]', el => el.value);
        expect(selectedValue).toBe('credit');
    });

    test('should submit the form', async () => {
        await page.click('button[type="submit"]');
        // You might want to add assertions here to check if the form submission was successful
        // For example, check if a success message appears or if you're redirected to a confirmation page
    });
});