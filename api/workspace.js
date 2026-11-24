const {createHandler}=require('../server/auth.cjs');
const handler=createHandler();
module.exports=(req,res)=>{req.query={...req.query,action:'workspace'};return handler(req,res)};
