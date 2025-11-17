# Instructions

## Running Parabank Demo locally

First you need to register with your email at https://www.parasoft.com/products/parasoft-virtualize/free-edition/
and after few minutes download link for the demo application should be sent. After installing the application follow these steps to get the Parabank demo running:

Open your SOAtest/Virtualize application.\
Navigate to File > New > Project.\
From the new project wizard window select Virtualize > Parabank Example Project and click Next > Finish.\
Once the server is syncronized and running, the demo application should launch automatically on the specified port.\
By default it should be available at http://localhost:8080/parabank/index.htm

In case you need to stop or restart the Server, open the Servers view by going to Window > Show View > Other > Server > Servers.
Ensure that the ParaBank Tomcat Server is started and synchronized. If it’s not running, right-click on it and select Start.
There is also a video tutorial for the previous steps: https://courses.testguild.com/course/parasoft-virtualize-setting-up-your-demo-environment/

## Running Playwright tests
#### Prerequisites
- Node.js (latest LTS version recommended)
- npm
#### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/kodanikkoni/rmtpd.git
   cd bookstore
   ```

   Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```
   Instructions for VS Code with Playwright extension https://playwright.dev/docs/getting-started-vscode

#### Running Tests
Make sure that Parabank demo is accessible on http://localhost:8080/parabank/index.htm before running tests
1.  ```bash
    npx playwright test
    ```
    or in case of VS Code use the Playwright extension on the sidebar to run all or specific tests
    <img width="458" height="419" alt="image" src="https://github.com/user-attachments/assets/41c5cc68-24ad-4c06-a884-597dc23fa397" />

    
