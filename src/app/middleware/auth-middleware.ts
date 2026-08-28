import type {Request,Response,NextFunction} from 'express'
import {verifyUserToken} from '../utils/token.js'

//authetication middleware kuch bhi restrict nhi krta sirf chek krta hai
export function authenticationMiddleware(){
    return function(req:Request,res:Response,next:NextFunction){
        const header=req.headers['authorization']
        if(!header) return next()

        if(!header?.startsWith('Bearer')){
            return res.status(400).json({error:'authorization header must start with bearer'})
        }
        const token=header.split(" ")[1];

        if (!token) return res.status(400).json({ error: 'authorization header must start with Bearer and followed by token' });

        //if there is token then verify
        const user=verifyUserToken(token)
        if(!user) return res.status(401).json({error:'invalid or expired token'})

        req.user=user
        next()
    }

}


//restricts for authenticated user
export function restrictToAuthenticatedUser(){
    return function(req:Request,res:Response,next:NextFunction){
        if(!req.user) return res.status(401).json({error:'Authentication required'})
        return next()


    }
}
