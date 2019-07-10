const Page = require('./helpers/page')

var page 


beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});
  

describe('when logged in ',async ()=>{
    beforeEach(async()=>{
        await page.login()
        await page.click('a.btn-floating');
    })
    test('when loggedin can view create blogs',async ()=>{
        const label = await page.getContentsOf('form label')
        expect(label).toEqual('Blog Title')
    })

    // valid ..... nested describe

    describe('using valid inputs', async ()=>{
        
        beforeEach( async()=>{
           await page.type('.title input', 'my Title')
           await page.type('.content input', 'my content')

           await page.click('form button')
        })

        test('submitting then saving todo to blog index- sure ?',async()=>{
            const text = await page.getContentsOf('h5')
            expect(text).toEqual('Please confirm your entries')
        })

        test('Submitted Blog',async ()=>{
            await page.click('form .green')
            await page.waitFor('.card')

            console.log(page.url(),"final")
            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')
            
            expect(title).toEqual('my Title')
            expect(content).toEqual('my content')
        })
    })

    // invalid..... 
    describe('when invalid input',async ()=>{ //when invalid inputs given

        beforeEach(async ()=>{
            await page.click('form button')
        })

        test('the form shows error msg',async()=>{
            const titleError = await page.getContentsOf('.title .red-text')
            const contentError = await page.getContentsOf('.content .red-text')

            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
    })
})


describe('when user not logged in ', async ()=>{

    const actions = [
        {
            method: 'get',
            path:'/api/blogs/'
        },
        {
            method: 'post',
            path:'/api/blogs/',
            body:{title:'Tittle', content:'contt'},
        }]

    test('user cannot', async ()=>{
        const results = await page.executeRequests(actions)// [{},{}] each  have you must login
        
       for(let result of results) {
           expect(result).toEqual({error: 'You must log in!'})
       } 
    })
   
})




