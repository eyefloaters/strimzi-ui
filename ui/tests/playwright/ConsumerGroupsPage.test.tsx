import { page } from "../../jest.setup";
import {URL} from './utils'

describe("Consumer groups page", () => {
  test("Consumer groups page should display table", async () => {
    await page.goto(
      `${URL}/kafka/j7W3TRG7SsWCBXHjz2hfrg/consumer-groups`
    );
    await page.waitForLoadState("networkidle",{timeout: 60000});
    expect(await page.innerText("body")).toContain("Consumer group name");
    expect(await page.innerText("body")).toContain("State");
    expect(await page.innerText("body")).toContain("Overall lag");
    expect(await page.innerText("body")).toContain("Members");
    expect(await page.innerText("body")).toContain("Topics");
    const dataRows = await page.$$(
      'table[aria-label="Consumer groups"] tbody tr'
    );
    expect(dataRows.length).toBeGreaterThan(0);
    const dataCells = await page.$$eval(
      'table[aria-label="Consumer groups"] tbody tr td',
      (tds) => tds.map((td) => td.textContent?.trim() ?? "")
    );
    expect(dataCells.length).toBeGreaterThan(0);
  });
});
