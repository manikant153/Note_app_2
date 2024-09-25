/*
 GET/
    -> home page
 */
exports.homepage = async(req,res)=>{
        const  locals ={
            title:"Nodejs Notes",
            description:'free Note taking app'
        }
        res.render('index',{
            locals,
            layout:'../views/layouts/front-page'
        });
}
exports.aboutpage = async(req,res)=>{
        const  locals ={
            title:"About page",
            description:'Owner description'
        }
        res.render('about',locals);
}