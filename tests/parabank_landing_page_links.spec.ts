import { test, expect } from '@playwright/test';
const baseUrl = 'http://localhost:8080/parabank/index.htm';

test.describe("parabank landing page", () => {
    test('has correct title', async ({ page }) => {
        await page.goto(baseUrl);
        await expect(page).toHaveTitle('ParaBank | Welcome | Online Banking');
    });

    test('header links navigate to correct pages', async ({ page }) => {
        await page.goto(baseUrl);
        await page.locator('#headerPanel').getByRole('link', { name: 'About Us' }).click();
        await expect(page).toHaveTitle('ParaBank | About Us');

        await page.goto(baseUrl);
        await page.locator('#headerPanel').getByRole('link', { name: 'Services' }).click();
        await expect(page).toHaveTitle('ParaBank | Services');

        await page.goto(baseUrl);
        await page.locator('#headerPanel').getByRole('link', { name: 'Products' }).click();
        await expect(page).toHaveTitle('Automated Software Testing Tools - Ensure Quality - Parasoft');

        await page.goto(baseUrl);
        await page.locator('#headerPanel').getByRole('link', { name: 'Locations' }).click();
        await expect(page).toHaveTitle('Automated Software Testing Solutions For Every Testing Need');

        await page.goto(baseUrl);
        await page.locator('#headerPanel').getByRole('link', { name: 'Admin Page' }).click();
        await expect(page).toHaveTitle('ParaBank | Administration');
    });

    test('footer links navigate to correct pages', async ({ page }) => {
        await page.goto(baseUrl);
        await page.locator('#footerPanel').getByRole('link', { name: 'About Us' }).click();
        await expect(page).toHaveTitle('ParaBank | About Us');

        await page.locator('#footerPanel').getByRole('link', { name: 'Services' }).click();
        await expect(page).toHaveTitle('ParaBank | Services');

        await page.locator('#footerPanel').getByRole('link', { name: 'Products' }).click();
        await expect(page).toHaveTitle('Automated Software Testing Tools - Ensure Quality - Parasoft');

        await page.goto(baseUrl);
        await page.locator('#footerPanel').getByRole('link', { name: 'Locations' }).click();
        await expect(page).toHaveTitle('Automated Software Testing Solutions For Every Testing Need');

        await page.goto(baseUrl);
        await page.locator('#footerPanel').getByRole('link', { name: 'Forum' }).click();
        await expect(page).toHaveTitle('Home - Parasoft Forums');

        await page.goto(baseUrl);
        await page.locator('#footerPanel').getByRole('link', { name: 'Site Map' }).click();
        await expect(page).toHaveTitle('ParaBank | Site Map');

        await page.locator('#footerPanel').getByRole('link', { name: 'Contact Us' }).click();
        await expect(page).toHaveTitle('ParaBank | Customer Care');

        await page.locator('#footerPanel').getByRole('link', { name: 'Home' }).click();
        await expect(page).toHaveTitle('ParaBank | Welcome | Online Banking');
    });

    test('header buttons navigate to correct pages', async ({ page }) => {
        await page.goto(baseUrl);
        await page.locator('ul.button').getByRole('link', { name: 'about' }).click();
        await expect(page).toHaveTitle('ParaBank | About Us');

        await page.locator('ul.button').getByRole('link', { name: 'contact' }).click();
        await expect(page).toHaveTitle('ParaBank | Customer Care');

        await page.locator('ul.button').getByRole('link', { name: 'home' }).click();
        await expect(page).toHaveTitle('ParaBank | Welcome | Online Banking');
    });
});