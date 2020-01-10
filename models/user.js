const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./product');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ]
    },
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedcartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedcartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedcartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }

    const updatedCart = {
        items: updatedcartItems
    };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.getCart = function () {
    const productInCart = [...this.cart.items];
    const productsId = productInCart.map(p => {
        return p.productId;
    })
    return Product
        .find({ '_id': { $in: productsId } })
        .then(products => {
            return products.map(p => {
                return {
                    ...p._doc, quantity: productInCart.find(pIncart => {
                        return pIncart.productId.toString() === p._id.toString();
                    }).quantity
                }
            })
        })
        .then(products => {
            const updatedItems = products.map(p => {
                return { productId: p._id, quantity: p.quantity }
            });
            const updatedCart = {
                items: updatedItems
            }
            this.cart = updatedCart;
            this.save();
            return products
        })

}

userSchema.methods.deleteItemFormCart = function (productId) {
    const updatedItems = this.cart.items.filter(p => {
        return p.productId.toString() !== productId.toString()
    });
    this.cart.items = updatedItems;
    return this.save();
}

userSchema.methods.addOrder = function () {

}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;

// class User {
//     constructor(userName, email, cart, id){
//         this.name = userName;
//         this.email = email;
//         this.cart = cart; // {items: [{productId: , quantity}]}
//         this._id = id
//     }

//     save(){
//         const db = getDb();
//         db
//         .collection('users')
//         .insertOne(this)
//         .then(result => console.log('user inserted'))
//         .catch(err => console.log(err));
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp =>{
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedcartItems = [...this.cart.items];

//         if(cartProductIndex >= 0){
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedcartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedcartItems.push({productId: new ObjectId(product._id), quantity: newQuantity})
//         }

//         const updatedCart = {
//             items: updatedcartItems
//         };

//         const db = getDb();
//         return db
//         .collection('users')
//         .updateOne(
//             {_id: new ObjectId(this._id)},
//             {$set:{cart: updatedCart}})

//     }

//     getCart(){
//         const db = getDb();
//         const productIds = this.cart.items.map(i =>{
//             return i.productId;
//         });
//         return db
//         .collection('products')
//         .find({_id: {$in: productIds}})
//         .toArray()
//         .then(products => {
//             return products.map(p => {
//                 return {...p, quantity: this.cart.items.find(i =>{
//                     return i.productId.toString() === p._id.toString();
//                 }).quantity
//             };
//             });
//         })
//         .then(products => {
//             const updatedcartItems = products.map(p => {
//                 return {productId: new ObjectId(p._id), quantity: p.quantity}
//             })
//             const updatedCart = {
//                 items: updatedcartItems
//             };
//             const db = getDb();
//             db
//             .collection('users')
//             .updateOne(
//             {_id: new ObjectId(this._id)},
//             {$set:{cart: updatedCart}})
//             return products
//         })
//     }

//     deleteItemFormCart(productId){
//         const updatedCartItems = this.cart.items.filter(item =>{
//             return item.productId.toString() !== productId.toString()
//         });
//         const db =getDb();
//         return db
//         .collection('users')
//         .updateOne(
//             { _id: new ObjectId(this._id)},
//             { $set: {cart: {items: updatedCartItems}}}
//         );
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.name
//                 }
//             };
//             return db
//         .collection('orders')
//         .insertOne(order)
//         })
//         .then(result => {
//             this.cart = {items:[]};
//             return db
//             .collection('users')
//             .updateOne(
//                 { _id: new ObjectId(this._id)},
//                 { $set: {cart: this.cart}}
//             )
//         })
//     }

//     getOrders(){
//         const db = getDb();
//         return db
//         .collection('orders')
//         .find({'user._id' : new ObjectId(this._id)})
//         .toArray()
//         .then(orders => {
//             return orders
//         });
//     }

//     static findById(userId){
//         const db = getDb();
//         return db
//         .collection('users')
//         .findOne({_id: new ObjectId(userId)})
//         .then(user => {
//             return user
//         })
//         .catch(err => console.log(err));
//     }
// }

// module.exports = User;