const mongoose = require('mongoose')
const exec = mongoose.Query.prototype.exec
const keys = require('../config/keys')
const redis = require('redis')

const util = require('util')
const client = redis.createClient(keys.redisUrl)
client.hget = util.promisify(client.hget) //asure promise



mongoose.Query.prototype.cache = function (hashKey= {}) { //prototype  - Object is overridden
    this.useCache = true
    this.hashKey = JSON.stringify(hashKey.key || '')

    return this
}



mongoose.Query.prototype.exec =async function(){ //executing each collection and documents for each query it run.
    // automatically store.
    

    if(!this.useCache){
        return exec.apply(this, arguments)
    }

    
    let key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))

    //  redis not cheap. prevent from storing allValues.
    const cachedValue = await client.hget(this.hashKey, key)
    if(cachedValue) {
        const doc = JSON.parse(cachedValue)
        // console.log("mongoose.Query Value, ",this) //see model
        // const doc = new this.model(JSON.parse(cachedValue)) //equals to new Blog({title:'Third', content:"Lorem"})
        //                           // {id:"141",googleId:"22343"} 
        // // handling single object {}. and array [{id:"141",googleId:"22343"} ,{id:"141",googleId:"22343"} ]
        

        const result = Array.isArray(doc)?
        doc.map(d => new this.model(d)):
        new this.model(doc)

//input:102 console.log(this.mongooseCollection.name)
        // console.log(result) //see bottom output :102

        return result

    }


   const result =  await exec.apply(this, arguments)
   client.hset(this.hashKey, key, JSON.stringify(result))   
   
   return result

}


module.exports = {
    clearCache(hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}



// output 102
// [0] users
// [0] { _id: 5d19db5359f3b00e5d4bd349,
// [0]   googleId: '117592376855777121795',
// [0]   displayName: 'Dany Rupes',
// [0]   __v: 0 }
// [0] users
// [0] { _id: 5d19db5359f3b00e5d4bd349,
// [0]   googleId: '117592376855777121795',
// [0]   displayName: 'Dany Rupes',
// [0]   __v: 0 }
// [0] blogs
// [0] [ { _id: 5d19dbe559f3b00e5d4bd34a,
// [0]     title: 'Hello Blog',
// [0]     content: 'Hiiiii',
// [0]     _user: 5d19db5359f3b00e5d4bd349,
// [0]     createdAt: 2019-07-01T10:09:41.439Z,
// [0]     __v: 0 },
// [0]   { _id: 5d1a4344da163b3da3b1e01d,
// [0]     title: 'Second Blog',
// [0]     content: 'Lorem Ipsum',
// [0]     _user: 5d19db5359f3b00e5d4bd349,
// [0]     createdAt: 2019-07-01T17:30:44.088Z,
// [0]     __v: 0 } ]
