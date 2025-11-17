import { test, expect } from '@playwright/test';
const baseUrl = 'http://localhost:8080/parabank/index.htm';

test.describe("parabank login", () => {
    test.describe.configure({ mode: 'serial' });
    test('not possible to register a new user with missing values', async ({ page }) => {
        await page.goto(baseUrl);
        await expect(page).toHaveTitle('ParaBank | Welcome | Online Banking');
        await page.getByRole('link', { name: 'Register' }).click();
        await expect(page).toHaveTitle('ParaBank | Register for Free Online Account Access');
        await page.getByRole('button', { name: 'Register' }).click();
        await expect(page.locator("span.error")).toHaveCount(10);
        await expect(page.locator("span.error")).toContainText([
            "First name is required.",
            "Last name is required.",
            "Address is required.",
            "City is required.",
            "State is required.",
            "Zip Code is required.",
            "Social Security Number is required.",
            "Username is required.",
            "Password is required.",
            "Password confirmation is required.",
        ]);
    });

    const username = Math.floor(Math.random() * 100000).toString().padStart(6, "0");
    test('possible to register a new user', async ({ page }) => {
        await page.goto(baseUrl);
        await expect(page).toHaveTitle('ParaBank | Welcome | Online Banking');
        await page.getByRole('link', { name: 'Register' }).click();
        await expect(page).toHaveTitle('ParaBank | Register for Free Online Account Access');
        await page.locator('[name="customer.firstName"]').fill('Firstname');
        await page.locator('[name="customer.lastName"]').fill('Lastname');
        await page.locator('[name="customer.address.street"]').fill('Street');
        await page.locator('[name="customer.address.city"]').fill('City');
        await page.locator('[name="customer.address.state"]').fill('State');
        await page.locator('[name="customer.address.zipCode"]').fill('123456789');
        await page.locator('[name="customer.phoneNumber"]').fill('123456789');
        await page.locator('[name="customer.ssn"]').fill('123456789');
        await page.locator('[name="customer.username"]').fill(username);
        await page.locator('[name="customer.password"]').fill('test123');
        await page.locator('[name="repeatedPassword"]').fill('test123');
        await page.waitForTimeout(Math.floor(Math.random() * 4000 + 1000));
        await page.getByRole('button', { name: 'Register' }).click();
        await expect(page).toHaveTitle('ParaBank | Customer Created');
        await expect(page.locator('[id="rightPanel"]')).toContainText('Your account was created successfully. You are now logged in.');
    });

    test('not possible to register user with an already existing username', async ({ page }) => {
        await page.goto(baseUrl);
        await expect(page).toHaveTitle('ParaBank | Welcome | Online Banking');
        await page.getByRole('link', { name: 'Register' }).click();
        await expect(page).toHaveTitle('ParaBank | Register for Free Online Account Access');
        await page.locator('[name="customer.firstName"]').fill('Firstname');
        await page.locator('[name="customer.lastName"]').fill('Lastname');
        await page.locator('[name="customer.address.street"]').fill('Street');
        await page.locator('[name="customer.address.city"]').fill('City');
        await page.locator('[name="customer.address.state"]').fill('State');
        await page.locator('[name="customer.address.zipCode"]').fill('123456789');
        await page.locator('[name="customer.phoneNumber"]').fill('123456789');
        await page.locator('[name="customer.ssn"]').fill('123456789');
        await page.locator('[name="customer.username"]').fill(username);
        await page.locator('[name="customer.password"]').fill('test123');
        await page.locator('[name="repeatedPassword"]').fill('test123');
        await page.getByRole('button', { name: 'Register' }).click();
        await expect(page.locator('[id="rightPanel"]')).toContainText('This username already exists.');
    });

    test('possible to sign in with existing user', async ({ page }) => {
        await page.goto(baseUrl);
        await page.locator('input[class=input][name="username"]').fill(username);
        await page.locator('input[class=input][name="password"]').fill('test123');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.locator('[id="leftPanel"]')).toContainText(`Welcome Firstname Lastname`);
        await expect(page).toHaveTitle('ParaBank | Accounts Overview');
    });

    test('possible to sign out', async ({ page }) => {
        await page.goto(baseUrl);
        await page.locator('input[class=input][name="username"]').fill(username);
        await page.locator('input[class=input][name="password"]').fill('test123');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.locator('[id="leftPanel"]')).toContainText(`Welcome Firstname Lastname`);
        await expect(page).toHaveTitle('ParaBank | Accounts Overview');
        await page.getByRole('link', { name: 'Log Out' }).click();
        await expect(page.locator('[id=leftPanel]')).toContainText('Customer Login');
        await expect(page).toHaveTitle('ParaBank | Welcome | Online Banking');
    });

    test('not possible to sign in with false credentials', async ({ page }) => {
        await page.goto(baseUrl);
        await page.locator('input[class=input][name="username"]').fill('usershouldnotexist');
        await page.locator('input[class=input][name="password"]').fill('passwordshouldnotexist');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.locator('[class="error"]')).toContainText('The username and password could not be verified.');
        await expect(page).toHaveTitle('ParaBank | Error');
    });
});