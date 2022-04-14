// require express, mongoose packages
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// setting view engine and static file path
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));




// *****************************************  Model  ****************************************

// connecting with mongodb and creating new collection
mongoose.connect('mongodb://localhost:27017/todos');

// creating Schema inside collection
const itemsSchema = {
    item: String,
    date: Date
};
const listSchema = {
    name: String,
    items: [itemsSchema]
};

// creating mongoose model using above schema
const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);




// *********************************************  Controller  ************************************************

// home route - default page
app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        res.render('list', { listTitle: 'Personal', newListItem: foundItems });
    })
});

// other custom home route [ work, fitness, other ]
app.get('/:customListName', function (req, res) {
    
    const customListName = req.params.customListName;
    // finding previously created custom routes if any
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create new todo item
                const list = new List({
                    name: customListName,
                    items: []
                });
                list.save();
                res.redirect('/' + customListName);
            } else {
                // rendering created todo items
                res.render('list', { listTitle: foundList.name, newListItem: foundList.items })
            }
        }
    })
});



// post route for sending todo list
app.post('/', function (req, res) {
    let itemName = req.body.newItem, date = req.body.date;
    const listName = req.body.list;

    const item = new Item({
        item: itemName, date
    });

    if (listName == 'Personal') {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        });
    }

});


// delete function
app.post('/delete', function (req, res) {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName == 'Personal') {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log('successfully deleted checked item.');
            }
            res.redirect('/');
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect('/' + listName);
            }
        })
    }
});



// tunning server on port 3000
app.listen('3000', function (err) {

    if (err)
        console.log(err);
    console.log('rendering on 3000');
});