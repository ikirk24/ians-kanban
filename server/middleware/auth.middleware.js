import jwt from 'jsonwebtoken'

export async function reqAuth (req, res, next) {
    const cookieToken = req.cookies?.accessToken

    if (!cookieToken) return res.sendStatus(401)

    jwt.verify(cookieToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({message: "JWT VERIFY ERR ", err})
        }

        req.user = user
        next();
    })
}