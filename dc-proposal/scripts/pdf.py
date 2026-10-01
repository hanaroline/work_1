import asyncio, glob
from playwright.async_api import async_playwright
CHROME=glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")[0]
HTML="file:///home/user/work_1/dc-proposal/irp_proposal_preview.html"
OUT="/home/user/work_1/dc-proposal/퇴직연금DC_제안서_위험자산비중별_202607.pdf"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=CHROME)
        pg=await b.new_page()
        await pg.goto(HTML)
        await pg.wait_for_timeout(500)
        await pg.emulate_media(media="print")
        await pg.pdf(path=OUT, prefer_css_page_size=True, print_background=True)
        await b.close()
        print("wrote", OUT)
asyncio.run(main())
