const puppeteer = require('puppeteer')
const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')
const CustomPage = require('./helpers/page')
// test('Add sum', ()=>{
//     const sum = 1+1
//     expect(sum).toEqual(2)
// })
let browser, page
beforeEach(async () => {
    // browser = await puppeteer.launch({ //default open a page
    //     headless: false //browser will open without ui
    // }) //creating a whole on browser object

    // page = await browser.newPage() //reaching out running tab. for dom element. interact with page

    page = await CustomPage.build();
    // await page.login()
    await page.goto('http://localhost:3000');
   
})


afterEach(async () => {
  page.close()
});


test('the header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo')

    expect(text).toEqual('Blogster');
});


test('clicking login starts oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});




test('when singed in, shows logout button ', async () => {

    await page.login()
    const text = await page.getContentsOf('a[href="/auth/logout"]')
    // console.log(text,"----------")
    expect(text).toEqual('Logout')
})