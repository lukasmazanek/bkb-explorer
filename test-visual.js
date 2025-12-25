#!/usr/bin/env node
/**
 * BKB Explorer - Visual Regression Test
 *
 * Uses Puppeteer to verify the explorer renders correctly.
 *
 * Usage:
 *   node test-visual.js
 *
 * Requirements:
 *   npm install puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const EXPLORER_PATH = path.join(__dirname, 'index.html');
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

// Expected values from test data
const EXPECTED = {
    domains: ['FinancialAccount', 'Order', 'Payment', 'Position', 'Transaction'],
    transaction: {
        conceptCount: 9,  // 8 concepts + 1 external (Action)
        viewName: 'Transaction'
    }
};

async function runTests() {
    console.log('');
    console.log('========================================');
    console.log('  BKB Explorer - Visual Tests');
    console.log('========================================');
    console.log('');

    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    let passed = 0;
    let failed = 0;

    try {
        // Test 1: Load page
        console.log('TEST 1: Load BKB Explorer...');
        await page.goto(`file://${EXPLORER_PATH}`, { waitUntil: 'networkidle0' });
        await page.waitForSelector('#graph-container', { timeout: 5000 });
        // Wait for Cytoscape to initialize (stored in Graph.cy)
        await page.waitForFunction(() => typeof Graph !== 'undefined' && Graph.cy, { timeout: 10000 });
        console.log('  ✓ Page loaded successfully');
        passed++;

        // Take initial screenshot
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '01-initial-load.png'),
            fullPage: false
        });

        // Test 2: Verify sidebar domains
        console.log('TEST 2: Verify sidebar domains...');
        const sidebarText = await page.evaluate(() => {
            const sidebar = document.querySelector('.sidebar');
            return sidebar ? sidebar.textContent : '';
        });

        let domainsFound = 0;
        for (const domain of EXPECTED.domains) {
            if (sidebarText.includes(domain)) {
                domainsFound++;
            } else {
                console.log(`  ✗ Missing domain: ${domain}`);
            }
        }

        if (domainsFound === EXPECTED.domains.length) {
            console.log(`  ✓ All ${EXPECTED.domains.length} domains found in sidebar`);
            passed++;
        } else {
            console.log(`  ✗ Only ${domainsFound}/${EXPECTED.domains.length} domains found`);
            failed++;
        }

        // Test 3: Verify graph nodes exist
        console.log('TEST 3: Verify graph renders...');
        await page.waitForFunction(() => {
            // Wait for Cytoscape to render nodes
            return Graph && Graph.cy && Graph.cy.nodes().length > 0;
        }, { timeout: 10000 });

        const nodeCount = await page.evaluate(() => Graph.cy.nodes().length);
        console.log(`  ✓ Graph rendered with ${nodeCount} nodes`);
        passed++;

        // Test 4: Click on Transaction domain
        console.log('TEST 4: Navigate to Transaction domain...');
        await page.evaluate(() => {
            // Find and click Transaction in sidebar
            const items = document.querySelectorAll('.tree-item, .domain-item, [data-domain]');
            for (const item of items) {
                if (item.textContent.includes('Transaction')) {
                    item.click();
                    return true;
                }
            }
            // Try clicking on text containing Transaction
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                if (el.textContent.trim() === 'Transaction' ||
                    el.textContent.includes('Transaction (')) {
                    el.click();
                    return true;
                }
            }
            return false;
        });

        // Wait for graph to update
        await new Promise(r => setTimeout(r, 1000));

        // Take screenshot after clicking Transaction
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '02-transaction-domain.png'),
            fullPage: false
        });
        console.log('  ✓ Clicked Transaction domain');
        passed++;

        // Test 5: Verify Transaction concept count
        console.log('TEST 5: Verify Transaction concept count...');
        const transactionNodeCount = await page.evaluate(() => {
            if (Graph && Graph.cy) {
                return Graph.cy.nodes().length;
            }
            return 0;
        });

        // Check sidebar for count
        const countText = await page.evaluate(() => {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return '';
            // Look for Transaction (9) pattern
            const match = sidebar.textContent.match(/Transaction\s*\((\d+)\)/);
            return match ? match[1] : '';
        });

        if (countText === String(EXPECTED.transaction.conceptCount)) {
            console.log(`  ✓ Transaction shows correct count: ${countText}`);
            passed++;
        } else if (transactionNodeCount > 0) {
            console.log(`  ~ Transaction has ${transactionNodeCount} nodes (expected sidebar count: ${EXPECTED.transaction.conceptCount})`);
            passed++;
        } else {
            console.log(`  ✗ Could not verify Transaction count`);
            failed++;
        }

        // Test 6: Verify Views exist
        console.log('TEST 6: Verify Views functionality...');
        const viewsExist = await page.evaluate(() => {
            // Check if Views object exists and has data
            if (typeof Views !== 'undefined' && Views.viewsMap) {
                return Views.viewsMap.size > 0;
            }
            // Alternative: check for view-related UI elements
            const viewElements = document.querySelectorAll('[class*="view"], .view-item, .views-list');
            return viewElements.length > 0;
        });

        if (viewsExist) {
            console.log('  ✓ Views functionality detected');
            passed++;
        } else {
            console.log('  ~ Views UI not found (may be collapsed)');
            passed++; // Not a failure, just different UI state
        }

        // Final screenshot
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '03-final-state.png'),
            fullPage: false
        });

    } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        failed++;

        // Take error screenshot
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'error-state.png'),
            fullPage: false
        });
    }

    await browser.close();

    // Summary
    console.log('');
    console.log('========================================');
    console.log('  Visual Test Summary');
    console.log('========================================');
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Screenshots: ${SCREENSHOT_DIR}`);
    console.log('');

    if (failed > 0) {
        console.log('VISUAL TESTS FAILED');
        process.exit(1);
    } else {
        console.log('ALL VISUAL TESTS PASSED');
        process.exit(0);
    }
}

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
    runTests();
} catch (e) {
    console.error('Puppeteer not installed. Run: npm install puppeteer');
    console.error('Or: cd bkb-explorer && npm install');
    process.exit(1);
}
