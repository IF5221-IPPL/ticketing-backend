import { IDecodedToken } from 'entity/decoded_token/';
import jwt from 'jsonwebtoken';

export const decodeJWT = (token:string): IDecodedToken =>
{
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IDecodedToken;
        return decoded;
    }
    catch (err)
    {
        return null;
    }
}