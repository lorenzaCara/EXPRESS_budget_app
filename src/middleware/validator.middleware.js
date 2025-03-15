export default function validatorMiddleware(schema) {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            return next();
        } catch (error) {
            return res.status(400).json(error)
        }
    }
}