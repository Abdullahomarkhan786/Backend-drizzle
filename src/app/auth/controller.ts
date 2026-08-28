import type {Request,Response} from 'express';
import { eq } from 'drizzle-orm';
import { signupPayloadModel } from './models.js';
import { usersTable } from '../../db/schema.js';
import { db } from '../../db/index.js';
import {randomBytes,createHmac} from 'node:crypto';

class AuthenticationController{
    public async handleSignup(req:Request,res:Response){

        const validationResult=await signupPayloadModel.safeParseAsync(req.body);
        if(validationResult.error) return res.status(400).json({message:'body validation failed',
            error:validationResult.error
        })

        const {firstName,lastName,age,email,password}=validationResult.data

        //check if it exists in db
         const userEmailResult = await db.select().from(usersTable).where(eq(usersTable.email, email)) //returns an array so below

         //Because Drizzle's select() API is designed to return a collection of rows, even when your where condition is expected to match only one row.

         //Even if your database has a UNIQUE constraint on email, Drizzle doesn't change the return type of a normal .select() based on that constraint. The database guarantees at most one matching row, but the query API still represents the result as a list

        if (userEmailResult.length > 0) return res.status(400).json({ error: 'duplicate entry', message: `user with email ${email} already exists` }) //check ki agar user match hua db mein toh error

        //if doesn't exist in db then
        //hashing of user
        //using this string/salt we will hash the password of user,append some salt to the user password to make it complex and not common
        const salt=randomBytes(32).toString('hex')
        //
        const hash=createHmac('sha256',salt).update(password).digest('hex')

        //lets insert in db
        const [result] = await db.insert(usersTable).values({
            firstName,
            lastName,
            age,
            
            email,
            password: hash,
            salt //needed to be stored so we can add this to password and match
        }).returning({ id: usersTable.id })
        
        
        return res.status(201).json({ message: 'user has been created successfully', data: { id: result?.id } })
        
    }
}
export default AuthenticationController;