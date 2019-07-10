const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    
    static async build (){

    const browser = await puppeteer.launch({
            headless: true,
            // args: ['--no-sandbox']
          });
      
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });

    }

    constructor(page){
        this.page= page
    }

    async login(){
    
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('a[href="/auth/logout"]');
    }


    async getContentsOf(selector){
        return this.page.$eval(selector, el=>el.innerHTML)
    }
    

    get({path}){
       return this.page.evaluate(async (_path) => {
            return await fetch(_path,{
                method:"GET",
                credentials:'same-origin', 
                headers:{ 'Content-Type':'application/json' }
            }).then(res=>res.json())
        }, path)
    }

    post({path, body, config}) {
        return this.page.evaluate(async(__path, _body) => {
            return  fetch(__path,{
                method:"POST",
                credentials:'same-origin', 
                headers:{ 'Content-Type':'application/json' },
                body:JSON.stringify(_body)
            }).then(res=>res.json())
        }, path, body)
    }


    executeRequests(actions) {
        return Promise.all(
            actions.map(({method, body, path, config})=>{ //array of  promisses return in chromium
                return  this[method]({body, path, config}) 
          })
        )
    }
}

module.exports =  CustomPage;



