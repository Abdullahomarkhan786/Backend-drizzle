import type {UserTokenPayload} from '../app/utils/token.js'

declare global {
    namespace Express {
        interface Request {
            user?: UserTokenPayload
        }
    }
}

export {}