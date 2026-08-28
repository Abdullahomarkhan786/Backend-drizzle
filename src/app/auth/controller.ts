import type {Request,Response} from 'express';
import { eq } from 'drizzle-orm';
import { signinPayloadModel, signupPayloadModel } from './models.js';
import { usersTable } from '../../db/schema.js';
import { db } from '../../db/index.js';
import {randomBytes,createHmac} from 'node:crypto';
import { createUserToken, type UserTokenPayload } from '../utils/token.js';

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

    public async handleSignin(req:Request,res:Response){
        const validationResult=await signinPayloadModel.safeParseAsync(req.body);

        if(validationResult.error) return res.status(400).json({message:'body validation failed',error:validationResult.error.issues})

        const {email,password}=validationResult.data


        const [userSelect] = await db.select().from(usersTable).where(eq(usersTable.email, email)) //it returns a array and it will return only one unique id

        if (!userSelect) return res.status(404).json({ message: `user with email ${email} does not exists` })
        //if matches then match hash
        const salt=userSelect.salt! //because salt might be there or might not be
        const hash = createHmac('sha256', salt).update(password).digest('hex')

        if (userSelect.password !== hash) return res.status(400).json({ message: `email or password is incorrect` })

        //if user has entered the right credentials create token and return to user
        const token = createUserToken({ id: userSelect.id })

        return res.json({message:'signin successful',data:{token:token}})
    }

      public async handleMe(req: Request, res: Response) {
       
        const { id } = req.user! as UserTokenPayload

        const [userResult] = await db.select().from(usersTable).where(eq(usersTable.id, id))

        return res.json({
            firstName: userResult?.firstName,
            lastName: userResult?.lastName,
            email: userResult?.email
        })
    }
}
export default AuthenticationController;