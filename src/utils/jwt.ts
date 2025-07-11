import jwt from 'jsonwebtoken';


type UserType = {
    id: string;
    name: string;
    email: string;
};

export const generateAcessToken = (Id: string,Name:string ,Email:string) => {
    return jwt.sign({ id: Id , name:Name , email:Email }, process.env.JWT_SECRET!, {
        expiresIn: '1d',
    });
}

export const generateRefreshToken = (Id: string) => {
    return jwt.sign({ id: Id }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: '7d',
    });
}

export const generateTokens = (user:UserType ) => {
    const accessToken = generateAcessToken(user.id, user.name, user.email);
    const refreshToken = generateRefreshToken(user.id);

    return { accessToken, refreshToken };
}