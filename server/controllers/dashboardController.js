
const mongoose = require('mongoose')
const Note = require('../models/Notes');
exports.dashboard = async (req, res) => {
    let perPage = 12;
    let page = req.query.page || 1;
    const locals = {
        title: "Dashboard",
        description: 'Free Note taking app'
    }

    try {
        // Use aggregation directly on the Note model
        console.log("User ID:", req.user.id);

        const notes = await Note.aggregate([
            {
                $sort: {
                    updatedAt: -1,
                }
            },
            {
                $match: { user: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $project: {
                    title: { $substr: ['$title', 0, 30] },
                    body: { $substr: ['$body', 0, 100] },
                }
            }
        ])
            .skip(perPage * (page - 1))
            .limit(perPage);

        // Get the total count of documents for pagination
        const countDocuments = await Note.countDocuments({ user: req.user.id });

        // Render the dashboard view
        res.render('dashboard/index', {
            userName: req.user.firstName,
            notes,
            locals,
            layout: '../views/layouts/dashboard',
            current: page,
            pages: Math.ceil(countDocuments / perPage),
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}


/*
GET /
View Specfic Note
*/
exports.dashboardViewNote = async (req, res) => {
    const note = await Note.findById({ _id: req.params.id })
        .where({ user: req.user.id }).lean();
    if (note) {
        res.render('dashboard/view-note', {
            noteID: req.params.id,
            note,
            layout: '../views/layouts/dashboard'
        });
    } else {
        res.send("Something went Wrong");
    }
}

/*
PUT 
Update specific Note
*/
exports.dashboardUpdateNote = async (req, res) => {
    try {
        await Note.findByIdAndUpdate(
            { _id: req.params.id },
            { title: req.body.Title, body: req.body.body,updatedAt:Date.now() }
        ).where({ user: req.user.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);

    }
}


/*
DELETE 
delete specific Note
*/
exports.dashboardDeleteNote = async (req, res) => {
    try {
        await Note.deleteOne({ _id: req.params.id }).where({ user: req.user.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
}


/*
GET 
ADDNote
*/

exports.dashboardAddNote = async (req, res) => {
    res.render('dashboard/add', {
        layout: '../views/layouts/dashboard'
    });
}

exports.dashboardAddNoteSubmit = async (req, res) => {
    try {
        req.body.user= req.user.id;
        await Note.create(req.body);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
}


/*
GET 
 Search
*/

exports.dashboardSearch = async(req,res) =>{
    try {
        res.render('dashboard/search',{
            searchResults:'',
            layout: '../views/layouts/dashboard'
        })
    } catch (error) {
        console.log("From search controller",error);
    }
}
// Search method created manually    | i have took this logic form stack overflow
exports.dashboardSearchSubmit = async(req,res)=>{
    try {
        let searchTerm = req.body.searchTerm;
         const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

         const searchResults = await Note.find({
            $or: [
                {title:{$regex: new RegExp(searchNoSpecialChars,'i')}},
                {body:{$regex: new RegExp(searchNoSpecialChars,'i')}}
            ]
         }).where({ user: req.user.id });

         res.render('dashboard/search',{
            searchResults,
            layout: '../views/layouts/dashboard'
         })
    } catch (error) {
        console.log(error);
        
    }
}